# Integración Supabase — conciliación de migraciones

Proyecto Cloud indicado: `asdfhkjwvznizsjopert`. El usuario facilitó `HuellaLimpia_tres_migraciones_cloud.zip` con el SQL aplicado en Cloud. El ZIP se leyó como referencia; no se ejecutó en Cloud.

| Versión Cloud | Conciliación en el repositorio |
| --- | --- |
| `20261120033413_initial` | El SQL coincide exactamente con el antiguo `20261119000000_initial.sql` tras normalizar saltos de línea. Se renombró el archivo a la versión remota. |
| `20261120033505_secure_api_privileges` | Se versionaron sus `REVOKE` y `GRANT`. La llamada a `public.rls_auto_enable()` se condicionó a su existencia, pues no está presente en una instalación limpia. Cuando existe, el efecto es el mismo que el SQL facilitado. |
| `20261120033534_harden_trigger_functions` | Se versionó el SQL facilitado para fijar `search_path` y revocar la ejecución de los triggers. |
| `20261120035407_secure_municipal_lookup` | Migración nueva, solo aplicada localmente: cambia `public.is_municipal_for(text)` a `SECURITY INVOKER` y limita su ejecución a `authenticated`. No se aplicó en Cloud. |

## Reconstrucción aislada

Se creó una pila Supabase separada, `HuellaLimpiaRebuild`, con API `127.0.0.1:55421` y PostgreSQL `127.0.0.1:55422`. No se borró la pila local principal ni se tocó Cloud. Desde una base limpia se aplicaron las cuatro migraciones en orden y se comprobaron sus versiones registradas. La prueba `supabase/tests/rls.sql` pasó en una transacción revertida: aislamiento ciudadano, alcance municipal, rechazo de actualización municipal por ciudadano, rechazo de elevación de rol y rechazo fuera del distrito.

Resultado de la reconstrucción: cuatro tablas públicas, nueve políticas, `anon` sin lectura de `profiles`, `authenticated` con los permisos previstos, `guard_profile` y `guard_incident` con `search_path` fijo, e `is_municipal_for` como invocador. `public.rls_auto_enable()` estaba ausente y no impidió la reconstrucción. `supabase db advisors --type security --level warn --fail-on warn` terminó con cero resultados.

Se probaron también dos cuentas ficticias efímeras creadas por `scripts/seed-local-e2e.mjs` en esta pila aislada. Sus credenciales quedaron únicamente en archivos temporales privados.

## Verificación pendiente en Cloud

La CLI de esta sesión aún devuelve `DbConfigLoginRoleNetworkError` al intentar consultar el historial remoto y el conector no inicia. Las versiones remotas se conocen por el usuario, pero no se ha podido inspeccionar el esquema, los permisos ni los asesores **efectivos** de Cloud desde Codex. Por ello no se ejecutó `migration repair`, `db push`, SQL remoto ni un reset. Tampoco se afirma que la cuarta migración esté aplicada remotamente.

Antes de integrar el PR #3 o desplegar, contrastar el esquema y permisos reales de Cloud con las cuatro migraciones reconstruidas, verificar las tres versiones remotas y aplicar solo la cuarta mediante un procedimiento revisado. Después repetir Auth, RLS y asesores de seguridad en Cloud.
