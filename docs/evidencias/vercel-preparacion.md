# Preparación de Vercel

El repositorio no contiene `.vercel/project.json` ni `.vercel/repo.json`. El conector Vercel no inició y la consulta de solo lectura con CLI no respondió; no se ha confirmado si ya existe un proyecto HuellaLimpia en la cuenta conectada. GitHub no registra despliegues para este repositorio. No se creó un proyecto ni una implementación.

Configuración prevista cuando se restablezca el acceso: repositorio `Jhanfranco07/HuellaLimpia`, framework Next.js, rama Production `main`, Preview para PR hacia `test`. Configurar `NEXT_PUBLIC_SUPABASE_URL` con la URL de `asdfhkjwvznizsjopert` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con la clave publicable del proyecto en Vercel Environment Variables; no versionar valores ni usar claves `service_role`.

Los PR [#3](https://github.com/Jhanfranco07/HuellaLimpia/pull/3) y [#2](https://github.com/Jhanfranco07/HuellaLimpia/pull/2) ya se integraron con Quality Gate aprobado. La ejecución de `main` [44676677808](https://github.com/Jhanfranco07/HuellaLimpia/actions/runs/44676677808) terminó con los seis jobs aprobados. El PR [#4](https://github.com/Jhanfranco07/HuellaLimpia/pull/4) contiene los módulos nuevos y permanece en borrador: la migración de fotografías solo se verificó localmente y falta confirmar/aplicar su versión en Cloud.

Antes de desplegar los módulos nuevos: comprobar el historial remoto, aplicar solo `20261120045833_incident_photos_storage.sql` si aún no existe y validar el bucket privado, sus políticas y el flujo completo con una cuenta de prueba autorizada. Después comprobar la configuración de confirmación de correo, desplegar Preview y validar registro, login, fotografía, gestión, seguimiento y cierre con una URL pública. Tras integrar a `main`, revisar el despliegue Production, los logs y la URL real antes de declararlo listo.

La cuenta ciudadana Cloud de demostración ya fue confirmada y pasó login, perfil, RLS y logout. Sus credenciales están en `.env.cloud.demo.local`, excluido de Git; el propietario puede entregarlas al profesor por un canal privado. La evaluación no requiere registrar otra cuenta.
