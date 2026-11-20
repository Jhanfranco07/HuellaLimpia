# Integración Supabase — conciliación de migraciones

Proyecto Cloud indicado: `asdfhkjwvznizsjopert`. El usuario facilitó `HuellaLimpia_tres_migraciones_cloud.zip` con el SQL aplicado en Cloud. El ZIP se leyó como referencia; no se ejecutó en Cloud.

| Versión Cloud | Conciliación en el repositorio |
| --- | --- |
| `20261120033413_initial` | El SQL coincide exactamente con el antiguo `20261119000000_initial.sql` tras normalizar saltos de línea. Se renombró el archivo a la versión remota. |
| `20261120033505_secure_api_privileges` | Se versionaron sus `REVOKE` y `GRANT`. La llamada a `public.rls_auto_enable()` se condicionó a su existencia, pues no está presente en una instalación limpia. Cuando existe, el efecto es el mismo que el SQL facilitado. |
| `20261120033534_harden_trigger_functions` | Se versionó el SQL facilitado para fijar `search_path` y revocar la ejecución de los triggers. |
| `20261120040956_municipal_function_invoker` | El usuario facilitó su SQL exacto: `ALTER FUNCTION public.is_municipal_for(text) SECURITY INVOKER;`. El archivo local coincide. La versión anterior `20261120035407` se reemplazó antes de publicar; su SQL nunca se envió a Cloud. Los permisos de ejecución quedaron definidos por la segunda migración. |

## Reconstrucción aislada

Se creó una pila Supabase separada, `HuellaLimpiaFinal`, con API `127.0.0.1:56421` y PostgreSQL `127.0.0.1:56422`. No se borró la pila local principal ni se tocó Cloud. Desde una base limpia se aplicaron las cuatro migraciones exactas `20261120033413`, `20261120033505`, `20261120033534` y `20261120040956` en orden; la CLI confirmó que todas están registradas en esa pila. La prueba `supabase/tests/rls.sql` pasó en una transacción revertida: aislamiento ciudadano, alcance municipal, rechazo de actualización municipal por ciudadano, rechazo de elevación de rol y rechazo fuera del distrito.

Resultado de la reconstrucción: cuatro tablas públicas, nueve políticas, `anon` sin lectura de `profiles`, `authenticated` con los permisos previstos, `guard_profile` y `guard_incident` con `search_path` fijo, e `is_municipal_for` como invocador. `public.rls_auto_enable()` estaba ausente y no impidió la reconstrucción. `supabase db advisors --type security --level warn --fail-on warn` terminó con cero resultados.

El script `scripts/seed-local-e2e.mjs` creó dos cuentas ficticias efímeras en una pila aislada previa, comprobando su funcionamiento sin versionar contraseñas. La reconstrucción final del esquema y RLS se verificó por separado.

## Verificación pendiente en Cloud

La CLI de esta sesión devolvió `DbConfigLoginRoleNetworkError` al intentar consultar el historial remoto y el conector no inició. Según la actualización del usuario, ChatGPT verificó en Cloud las cuatro tablas, nueve políticas y cero advertencias del asesor, y aplicó la cuarta versión remota. Codex recibió y cotejó el SQL exacto de la cuarta versión, pero no pudo contrastar directamente el esquema, los permisos ni Auth efectivos de Cloud. Por ello no se ejecutó `migration repair`, `db push`, SQL remoto ni un reset.

Antes de desplegar, contrastar permisos y configuración Auth efectivos de Cloud y repetir registro, inicio, cierre, RLS y la operación municipal negativa con usuarios ficticios. Las cuatro versiones ya están representadas localmente; no volver a aplicar ninguna de ellas en Cloud.
