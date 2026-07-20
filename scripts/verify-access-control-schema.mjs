import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(scriptDir, '..', '.env.local');

function loadEnv(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf8');
    const vars = {};

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const eq = trimmed.indexOf('=');
      if (eq === -1) {
        continue;
      }

      vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    }

    return vars;
  } catch {
    return {};
  }
}

function post(path, body, token) {
  return new Promise((resolvePromise, reject) => {
    const data = JSON.stringify(body);
    const request = https.request({
      hostname: 'api.supabase.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        Authorization: `Bearer ${token}`,
      },
    }, (response) => {
      let raw = '';
      response.on('data', (chunk) => {
        raw += chunk;
      });
      response.on('end', () => {
        try {
          resolvePromise({ status: response.statusCode, body: JSON.parse(raw) });
        } catch {
          resolvePromise({ status: response.statusCode, body: raw });
        }
      });
    });

    request.on('error', reject);
    request.write(data);
    request.end();
  });
}

const env = { ...loadEnv(envPath), ...process.env };
const supabaseUrl = env.VITE_SUPABASE_URL;
const accessToken = env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !accessToken || accessToken === 'REPLACE_WITH_YOUR_PAT') {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_ACCESS_TOKEN.');
  process.exit(1);
}

const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
const sql = `
select
  exists(
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'permission_overrides'
  ) as has_permission_overrides,
  exists(
    select 1
    from pg_constraint constraint_record
    join pg_class table_record on table_record.oid = constraint_record.conrelid
    join pg_namespace namespace_record on namespace_record.oid = table_record.relnamespace
    where namespace_record.nspname = 'public'
      and table_record.relname = 'projects'
      and constraint_record.conname = 'projects_status_check'
      and pg_get_constraintdef(constraint_record.oid) like '%busy%'
  ) as projects_status_allows_busy;
`;

console.log(`Verifying access-control schema on project: ${projectRef}`);
const result = await post(`/v1/projects/${projectRef}/database/query`, { query: sql }, accessToken);

if (result.status !== 200 && result.status !== 201) {
  console.error(`Access-control schema verification failed (HTTP ${result.status}):`);
  console.error(JSON.stringify(result.body, null, 2));
  process.exit(1);
}

const row = Array.isArray(result.body) ? result.body[0] : result.body?.[0];
const hasPermissionOverrides = row?.has_permission_overrides === true;
const projectsStatusAllowsBusy = row?.projects_status_allows_busy === true;

console.log(`profiles.permission_overrides: ${hasPermissionOverrides ? 'ok' : 'missing'}`);
console.log(`projects.status allows busy: ${projectsStatusAllowsBusy ? 'ok' : 'missing'}`);

if (!hasPermissionOverrides || !projectsStatusAllowsBusy) {
  process.exit(1);
}