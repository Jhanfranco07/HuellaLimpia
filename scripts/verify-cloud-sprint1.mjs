import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function readEnv(file) {
  return Object.fromEntries(readFileSync(file, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)
    .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/))
    .filter(Boolean).map((match) => [match[1], match[2].trim()]));
}

const configFile = '.env.cloud.local';
const accountFile = '.env.cloud.demo.local';
if (!existsSync(configFile)) throw new Error('Falta la configuración privada de Cloud.');
const config = readEnv(configFile);
const url = config.NEXT_PUBLIC_SUPABASE_URL;
const key = config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (url !== 'https://asdfhkjwvznizsjopert.supabase.co' || !key) throw new Error('Configuración Cloud inválida.');

const mode = process.argv[2];
if (!['register', 'verify'].includes(mode)) throw new Error('Usa register o verify.');
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

if (mode === 'register') {
  if (existsSync(accountFile)) throw new Error('Ya existe una cuenta Cloud de prueba; no se repetirá el registro.');
  const email = config.CLOUD_TEST_EMAIL;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Falta CLOUD_TEST_EMAIL con un buzón controlado.');
  const settingsResponse = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
  if (!settingsResponse.ok) throw new Error('No se pudo comprobar la configuración de Auth.');
  const settings = await settingsResponse.json();
  if (settings.mailer_autoconfirm !== false) throw new Error('La confirmación por correo no está activada.');
  const password = randomBytes(24).toString('base64url');
  const signup = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Ciudadano Cloud de Prueba', role: 'municipal', district: 'Comas' } },
  });
  if (signup.error) {
    console.error(`registro_fallido_codigo=${signup.error.code ?? signup.error.name}`);
    process.exitCode = 1;
  } else if (!signup.data.user) {
    throw new Error('Auth no devolvió una cuenta de prueba.');
  } else {
    writeFileSync(accountFile, `CLOUD_TEST_EMAIL=${email}\nCLOUD_TEST_PASSWORD=${password}\nCLOUD_TEST_USER_ID=${signup.data.user.id}\n`, { mode: 0o600 });
    console.log(`registro_enviado=true requiere_confirmacion=${!signup.data.session}`);
  }
}

if (mode === 'verify') {
  if (!existsSync(accountFile)) throw new Error('No existe una cuenta Cloud de prueba registrada.');
  const account = readEnv(accountFile);
  let stage = 'login';
  try {
    const login = await client.auth.signInWithPassword({ email: account.CLOUD_TEST_EMAIL, password: account.CLOUD_TEST_PASSWORD });
    if (login.error) throw login.error;
    if (login.data.user?.id !== account.CLOUD_TEST_USER_ID) throw new Error('Login no coincide con el registro.');
    const current = await client.auth.getUser();
    if (current.error || current.data.user?.id !== account.CLOUD_TEST_USER_ID) throw new Error('No se recuperó el usuario autenticado.');
    console.log('login_confirmado=pasó');

    stage = 'perfil y RLS';
    const profile = await client.from('profiles').select('id,role').eq('id', account.CLOUD_TEST_USER_ID).single();
    if (profile.error || profile.data?.role !== 'citizen') throw new Error('El perfil ciudadano no está disponible.');
    const elevation = await client.from('profiles').update({ role: 'municipal', district: 'Comas' }).eq('id', account.CLOUD_TEST_USER_ID).select('role');
    if (!elevation.error && elevation.data?.length) throw new Error('La elevación de rol fue permitida.');
    const unchanged = await client.from('profiles').select('role').eq('id', account.CLOUD_TEST_USER_ID).single();
    if (unchanged.error || unchanged.data?.role !== 'citizen') throw new Error('El rol cambió indebidamente.');
    console.log('perfil_ciudadano_y_rls=pasaron');

    stage = 'logout';
    const logout = await client.auth.signOut();
    if (logout.error || (await client.auth.getSession()).data.session) throw new Error('El cierre de sesión falló.');
    console.log('logout=pasó');
  } catch (error) {
    console.error(`fallo_en=${stage} codigo=${error?.code ?? error?.name ?? 'desconocido'}`);
    process.exitCode = 1;
  }
}
