import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const env = {
  ...process.env,
  ...(await readLocalEnv()),
};

const functionUrl = env.WHATSAPP_WEBHOOK_URL || 'https://errbmfumiixmyjiltdtq.functions.supabase.co/whatsapp-webhook';
const verifyToken = getArgValue('--token') || env.WHATSAPP_VERIFY_TOKEN;
const challenge = getArgValue('--challenge') || 'plano-certo-smoke-test';

if (!verifyToken) {
  console.error('Missing WHATSAPP_VERIFY_TOKEN. Set it in the shell or pass --token <value>.');
  process.exit(1);
}

const url = new URL(functionUrl);
url.searchParams.set('hub.mode', 'subscribe');
url.searchParams.set('hub.verify_token', verifyToken);
url.searchParams.set('hub.challenge', challenge);

const response = await fetch(url);
const body = await response.text();
const ok = response.status === 200 && body === challenge;

console.table([
  {
    endpoint: functionUrl,
    status: response.status,
    expectedChallenge: challenge,
    receivedChallenge: body,
    state: ok ? 'verified' : 'failed',
  },
]);

if (!ok) {
  console.error('Webhook verification failed. Check WHATSAPP_VERIFY_TOKEN in Supabase secrets and local env/argument.');
  process.exit(1);
}

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
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
