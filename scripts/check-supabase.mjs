import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const env = {
  ...process.env,
  ...(await readLocalEnv()),
};

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('Supabase env not configured. Expected VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  process.exit(0);
}

const tables = [
  'leads',
  'health_plans',
  'price_tables',
  'ans_documents',
  'agent_profiles',
];

const results = [];

for (const table of tables) {
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${table}?select=id&limit=1`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'count=exact',
      },
    });

    results.push({
      table,
      status: response.status,
      state: classifyStatus(response.status),
    });
  } catch (error) {
    results.push({
      table,
      status: 'network-error',
      state: error.message,
    });
  }
}

console.table(results);

const hasMissingSchema = results.some((result) => result.status === 404);
const hasProtectedTables = results.some((result) => result.status === 401 || result.status === 403);

if (hasMissingSchema) {
  console.log('Action: apply supabase/schema.sql and supabase/seed.sql, then run supabase/verification.sql.');
}

if (hasProtectedTables) {
  console.log('Action: tables exist but are protected. Add Auth or explicit read policies before disabling mock fallback.');
}

async function readLocalEnv() {
  if (!existsSync('.env.local')) return {};

  const text = await readFile('.env.local', 'utf8');
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [keyName, ...rest] = line.split('=');
        return [keyName, rest.join('=')];
      }),
  );
}

function classifyStatus(status) {
  if (status >= 200 && status < 300) return 'readable';
  if (status === 401 || status === 403) return 'protected by auth/RLS';
  if (status === 404) return 'missing or not exposed';
  return 'check response';
}
