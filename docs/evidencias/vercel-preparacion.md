# Preparación de Vercel

El repositorio no contiene `.vercel/project.json` ni `.vercel/repo.json`. El conector Vercel no inició y la consulta de solo lectura con CLI no respondió; no se ha confirmado si ya existe un proyecto HuellaLimpia en la cuenta conectada. GitHub no registra despliegues para este repositorio. No se creó un proyecto ni una implementación.

Configuración prevista cuando se restablezca el acceso: repositorio `Jhanfranco07/HuellaLimpia`, framework Next.js, rama Production `main`, Preview para PR hacia `test`. Configurar `NEXT_PUBLIC_SUPABASE_URL` con la URL de `asdfhkjwvznizsjopert` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con la clave publicable del proyecto en Vercel Environment Variables; no versionar valores ni usar claves `service_role`.

Antes de Production: verificar el PR #3 y luego el PR #2 con Quality Gate verde, probar Auth y RLS sobre Cloud, comprobar la configuración de confirmación de correo, desplegar Preview y validar landing, registro, login, cierre y rechazo municipal con una URL pública. Tras el merge a `main`, comprobar el despliegue Production, sus logs y la URL real antes de declararlo listo.

La cuenta ciudadana Cloud de demostración ya fue confirmada y pasó login, perfil, RLS y logout. Sus credenciales están en `.env.cloud.demo.local`, excluido de Git; el propietario puede entregarlas al profesor por un canal privado. La evaluación no requiere registrar otra cuenta.
