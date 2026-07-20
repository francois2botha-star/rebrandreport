import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

function loadEnv(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf8');
    const vars = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    }
    return vars;
  } catch {
    return {};
  }
}

const env = { ...loadEnv(resolve(__dir, '..', '.env.local')), ...loadEnv(resolve(__dir, '..', '.env')), ...process.env };
const adminClient = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { count, error: countError } = await adminClient.from('projects').select('*', { count: 'exact', head: true });
if (countError) throw countError;

const { data, error } = await adminClient
  .from('projects')
  .select('id, branch, town, current_stage, status, notes, activity')
  .order('id', { ascending: true })
  .limit(8);
if (error) throw error;

console.log(JSON.stringify({
  count,
  sample: data.map((project) => ({
    id: project.id,
    branch: project.branch,
    town: project.town,
    stage: project.current_stage,
    status: project.status,
    createdByBeverley: JSON.stringify(project.activity ?? []).includes('Beverley imported'),
    noteSource: String(project.notes ?? '').slice(0, 90),
  })),
}, null, 2));
