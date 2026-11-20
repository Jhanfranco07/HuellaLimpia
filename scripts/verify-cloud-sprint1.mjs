import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const file = '.env.cloud.local';
if (!existsSync(file)) throw new Error('Falta la configuración privada de Cloud.');
const values = Object.fromEntries(readFileSync(file, 'utf8').split(/\r?\n/)
  .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/))
  .filter(Boolean).map((match) => [match[1], match[2].trim()]));
const url = values.NEXT_PUBLIC_SUPABASE_URL;
const key = values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const domain = values.CLOUD_TEST_DOMAIN ?? 'huellalimpia.test';
if (url !== 'https://asdfhkjwvznizsjopert.supabase.co' || !key || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
  throw new Error('Configuración Cloud inválida.');
}
if (existsSync('.env.cloud.demo.local')) throw new Error('La cuenta de prueba Cloud ya fue creada.');

const settingsResponse = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
if (!settingsResponse.ok) throw new Error('No se pudo comprobar la configuración de Auth.');
const settings = await settingsResponse.json();
if (settings.mailer_autoconfirm !== true) throw new Error('Confirm email sigue activado.');

const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const email = `sprint1-${randomBytes(8).toString('hex')}@${domain}`;
const password = randomBytes(24).toString('base64url');
let stage = 'registro';
try {
  const signup = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Ciudadano Cloud de Prueba', role: 'municipal', district: 'Comas' } },
  });
  if (signup.error) throw signup.error;
  if (!signup.data.user || !signup.data.session) throw new Error('Registro sin sesión activa.');
  writeFileSync('.env.cloud.demo.local', `CLOUD_TEST_EMAIL=${email}\nCLOUD_TEST_PASSWORD=${password}\n`, { mode: 0o600 });
  console.log('registro=pasó');

  stage = 'perfil y rol';
  const first = await client.from('profiles').select('id,role').eq('id', signup.data.user.id).single();
  if (first.error || first.data?.role !== 'citizen') throw new Error('Perfil ciudadano no disponible.');
  const elevation = await client.from('profiles').update({ role: 'municipal', district: 'Comas' }).eq('id', signup.data.user.id).select('role');
  if (!elevation.error && elevation.data?.length) throw new Error('Elevación de rol permitida.');
  const unchanged = await client.from('profiles').select('role').eq('id', signup.data.user.id).single();
  if (unchanged.error || unchanged.data?.role !== 'citizen') throw new Error('El rol cambió indebidamente.');
  console.log('perfil_ciudadano_y_rls=pasaron');

  stage = 'cierre e inicio de sesión';
  const logout = await client.auth.signOut();
  if (logout.error) throw logout.error;
  const afterLogout = await client.auth.getSession();
  if (afterLogout.data.session) throw new Error('La sesión persistió tras logout.');
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error || login.data.user?.id !== signup.data.user.id) throw login.error ?? new Error('Login no coincidió con el registro.');
  const current = await client.auth.getUser();
  if (current.error || current.data.user?.id !== signup.data.user.id) throw new Error('No se recuperó el usuario autenticado.');
  const finalLogout = await client.auth.signOut();
  if (finalLogout.error || (await client.auth.getSession()).data.session) throw new Error('Logout final falló.');
  console.log('login_y_logout=pasaron');
} catch (error) {
  console.error(`fallo_en=${stage} codigo=${error?.code ?? error?.name ?? 'desconocido'}`);
  process.exitCode = 1;
}
