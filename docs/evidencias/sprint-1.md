# Sprint 1 — verificación local

Proyecto local: Supabase CLI 3.2.0, API 127.0.0.1:54421. Las cuentas ficticias están en `.env.demo.local`, excluido de Git. La aplicación se conecta mediante `.env.local`, también excluido. Ninguna contraseña se versionó.

PR de integración: [#3 hacia `test`](https://github.com/Jhanfranco07/HuellaLimpia/pull/3), abierto como borrador. Commit de este cierre: [`fa1581d`](https://github.com/Jhanfranco07/HuellaLimpia/commit/fa1581d). [GitHub Actions del commit](https://github.com/Jhanfranco07/HuellaLimpia/actions/runs/44669371287): `quality`, `security`, `database`, `browser` y `gate` finalizaron correctamente. El job `browser` de CI omite los casos que requieren las cuentas privadas; la ejecución local de Playwright es la evidencia de esos flujos.

| Historia | Implementación y evidencia | Resultado local | Límite |
| --- | --- | --- | --- |
| HL-7 | `src/app/page.tsx`, `e2e/landing.spec.ts`, capturas HL-7 | Playwright escritorio y móvil pasó | Ya integrada antes de esta rama |
| HL-8 | Sección `#educacion` de la portada; `e2e/sprint1.spec.ts` | Navegación por teclado y contenido visibles en ambos tamaños | Contenido educativo básico |
| HL-9 | Enlaces de portada a `/acceso` y `/acceso?modo=registro` | Playwright HL-7 pasó | Ya integrada antes de esta rama |
| HL-10 | `src/app/actions.ts`, `src/app/acceso/page.tsx`; `e2e/sprint1.spec.ts` y `scripts/verify-cloud-sprint1.mjs` | Registro real local con validación y duplicado; en Cloud, registro único con buzón controlado y confirmación manual, seguido de perfil `citizen` automático | No se probó duplicado en Cloud |
| HL-11 | Inicio/cierre por Supabase Auth; `e2e/sprint1.spec.ts` y guion Cloud | Login correcto e incorrecto, persistencia tras reload y bloqueo tras logout en local; login y logout con cuenta confirmada en Cloud | Persistencia de navegador en Cloud no probada |
| HL-13 | `src/lib/auth.ts`, paneles, `supabase/tests/rls.sql`, `e2e/sprint1.spec.ts` y guion Cloud | Ciudadano denegado en gestión, municipal accede a Comas; API local rechaza actualización municipal y elevación de rol; API Cloud rechazó elevación pese a metadatos `role=municipal` y mantuvo `citizen` | Actualización municipal directa no probada en Cloud |

## Comprobaciones

- Migración local: 4 tablas y 9 políticas RLS.
- Dos perfiles ficticios locales: ciudadano en Comas y municipal de Comas.
- TypeScript y ESLint: pasaron.
- Vitest: 6/6 pasaron.
- Playwright: 20/20 pasaron en escritorio y móvil contra Auth local, incluida la operación municipal directa rechazada por la API.
- Auditoría de dependencias: `npm audit --audit-level=high --offline`, cero vulnerabilidades encontradas en la caché local.
- Build de producción: pasó. El intento aislado dentro del sandbox terminó al generar páginas; con acceso local normal terminó correctamente.
- SQL RLS: pasó en transacción revertida, incluida denegación de elevación de rol y actualización municipal desde una sesión ciudadana.
- Estado de Postgres local tras las pruebas: 4 tablas públicas, 9 políticas, 2 perfiles ficticios en Comas y perfiles `citizen` para los registros nuevos.

El workflow actualizado crea cuentas ficticias efímeras dentro de su propia pila Supabase local para ejecutar estos flujos sin credenciales privadas de Cloud. Su resultado debe verificarse en GitHub Actions después del siguiente commit. No marcar las historias como Listo en Jira hasta revisar ese resultado y los límites indicados.
