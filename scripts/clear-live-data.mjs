import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const keepEmail = 'francois@colourpix.co.za';
const storageBuckets = ['project-files', 'voice-updates'];

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

const env = {
  ...loadEnv(resolve(__dir, '..', '.env.local')),
  ...loadEnv(resolve(__dir, '..', '.env')),
  ...process.env,
};

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'REPLACE_WITH_YOUR_SERVICE_ROLE_SECRET') {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function countRows(table) {
  const { count, error } = await adminClient.from(table).select('*', { count: 'exact', head: true });
  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function listStorageObjects(bucket, prefix = '') {
  const { data, error } = await adminClient.storage
    .from(bucket)
    .list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    if (error.message?.toLowerCase().includes('not found')) {
      return [];
    }

    throw error;
  }

  const objects = [];
  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      objects.push(...await listStorageObjects(bucket, path));
    } else {
      objects.push(path);
    }
  }

  return objects;
}

async function clearStorageBucket(bucket) {
  const objects = await listStorageObjects(bucket);

  for (let index = 0; index < objects.length; index += 100) {
    const batch = objects.slice(index, index + 100);
    if (batch.length === 0) {
      continue;
    }

    const { error } = await adminClient.storage.from(bucket).remove(batch);
    if (error) {
      throw error;
    }
  }

  return objects.length;
}

async function listAuthUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      throw error;
    }

    users.push(...data.users);
    if (data.users.length < 1000) {
      break;
    }

    page += 1;
  }

  return users;
}

async function main() {
  const before = {
    projects: await countRows('projects'),
    profiles: await countRows('profiles'),
    users: await listAuthUsers(),
  };

  console.log(`Before: ${before.projects} projects, ${before.profiles} profiles, ${before.users.length} auth users.`);

  const removedStorageObjects = {};
  for (const bucket of storageBuckets) {
    removedStorageObjects[bucket] = await clearStorageBucket(bucket);
  }

  const { error: deleteProjectsError } = await adminClient.from('projects').delete().neq('id', '__keep_no_projects__');
  if (deleteProjectsError) {
    throw deleteProjectsError;
  }

  const { error: deleteProfilesError } = await adminClient.from('profiles').delete().neq('email', keepEmail);
  if (deleteProfilesError) {
    throw deleteProfilesError;
  }

  for (const user of await listAuthUsers()) {
    if (user.email?.trim().toLowerCase() === keepEmail) {
      continue;
    }

    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) {
      throw new Error(`Could not delete ${user.email ?? user.id}: ${error.message}`);
    }
  }

  const remainingUsers = await listAuthUsers();
  const keptUser = remainingUsers.find((user) => user.email?.trim().toLowerCase() === keepEmail);
  if (!keptUser) {
    throw new Error(`${keepEmail} was not found after cleanup.`);
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      user_id: keptUser.id,
      name: 'Francois',
      email: keepEmail,
      role: 'colourpix_admin',
      branch: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' })
    .select('email, role')
    .single();

  if (profileError) {
    throw profileError;
  }

  const { error: metadataError } = await adminClient.auth.admin.updateUserById(keptUser.id, {
    user_metadata: { name: 'Francois', role: 'colourpix_admin' },
  });

  if (metadataError) {
    throw metadataError;
  }

  const afterProjects = await countRows('projects');
  const afterProfiles = await countRows('profiles');
  const afterUsers = await listAuthUsers();
  const afterStorage = Object.fromEntries(await Promise.all(storageBuckets.map(async (bucket) => [bucket, (await listStorageObjects(bucket)).length])));

  console.log(`Deleted storage objects: ${removedStorageObjects['project-files']} project files, ${removedStorageObjects['voice-updates']} voice files.`);
  console.log(`After: ${afterProjects} projects, ${afterProfiles} profiles, ${afterUsers.length} auth users.`);
  console.log(`Remaining auth users: ${afterUsers.map((user) => user.email ?? user.id).join(', ')}`);
  console.log(`Remaining profile: ${profile.email} (${profile.role})`);
  console.log(`Remaining storage objects: ${JSON.stringify(afterStorage)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});