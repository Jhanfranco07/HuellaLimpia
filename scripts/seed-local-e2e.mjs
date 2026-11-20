import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const envDir = process.env.E2E_ENV_DIR ?? process.cwd();
const projectId = process.env.SUPABASE_LOCAL_PROJECT_ID ?? 'HuellaLimpia';
if (!/^[A-Za-z0-9_-]+$/.test(projectId)) throw new Error('Identificador local inválido.');
if (existsSync(join(envDir, '.env.local')) || existsSync(join(envDir, '.env.demo.local'))) {
  throw new Error('El sembrado de CI requiere archivos de entorno nuevos.');
}

const args = [join(process.cwd(), 'node_modules', 'supabase', 'dist', 'supabase.js'), 'status', '-o', 'json'];
if (process.env.SUPABASE_LOCAL_WORKDIR) args.push('--workdir', process.env.SUPABASE_LOCAL_WORKDIR);
const raw = execFileSync(process.execPath, args, {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const status = JSON.parse(raw);
const { API_URL: url, PUBLISHABLE_KEY: publishableKey, SERVICE_ROLE_KEY: adminKey } = status;
if (!url?.startsWith('http://127.0.0.1:') || !publishableKey || !adminKey) {
  throw new Error('La pila local de Supabase no está disponible.');
}

async function createUser(email, fullName) {
  const password = randomBytes(24).toString('base64url');
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: adminKey,
      Authorization: `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: fullName } }),
  });
  if (!response.ok) throw new Error(`No se pudo crear la cuenta local: HTTP ${response.status}`);
  const user = await response.json();
  if (!/^[0-9a-f-]{36}$/.test(user.id)) throw new Error('Auth no devolvió un UUID válido.');
  return { email, password, id: user.id };
}

const citizen = await createUser('ciudadano@huellalimpia.test', 'Ciudadano de Prueba');
const municipal = await createUser('municipal@huellalimpia.test', 'Municipal de Prueba');
const changed = execFileSync('docker', [
  'exec', `supabase_db_${projectId}`, 'psql', '-U', 'postgres', '-d', 'postgres', '-Atc',
  `update public.profiles set role='municipal',district='Comas' where id='${municipal.id}'; select role from public.profiles where id='${municipal.id}';`,
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
if (!changed.includes('municipal')) throw new Error('No se asignó el rol municipal local.');

writeFileSync(join(envDir, '.env.local'), `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishableKey}\n`, { mode: 0o600 });
writeFileSync(join(envDir, '.env.demo.local'), `CIUDADANO_EMAIL=${citizen.email}\nCIUDADANO_PASSWORD=${citizen.password}\nMUNICIPAL_EMAIL=${municipal.email}\nMUNICIPAL_PASSWORD=${municipal.password}\n`, { mode: 0o600 });
console.log('Cuentas ficticias y entorno Supabase local preparados para Playwright.');
