# Sprint 1 — verificación local

Proyecto local: Supabase CLI 3.2.0, API 127.0.0.1:54421. Las cuentas ficticias están en `.env.demo.local`, excluido de Git. La aplicación se conecta mediante `.env.local`, también excluido. Ninguna contraseña se versionó.

| Historia | Implementación y evidencia | Resultado local | Límite |
| --- | --- | --- | --- |
| HL-7 | `src/app/page.tsx`, `e2e/landing.spec.ts`, capturas HL-7 | Playwright escritorio y móvil pasó | Ya integrada antes de esta rama |
| HL-8 | Sección `#educacion` de la portada; `e2e/sprint1.spec.ts` | Navegación por teclado y contenido visibles en ambos tamaños | Contenido educativo básico |
| HL-9 | Enlaces de portada a `/acceso` y `/acceso?modo=registro` | Playwright HL-7 pasó | Ya integrada antes de esta rama |
| HL-10 | `src/app/actions.ts`, `src/app/acceso/page.tsx`; `e2e/sprint1.spec.ts` | Registro real local, perfil ciudadano, rechazo de duplicado y campos inválidos. Con confirmación activada temporalmente, Auth no entregó sesión y Mailpit recibió el correo | No se verificó la apertura del enlace de confirmación; la configuración se restauró a `enable_confirmations=false` |
| HL-11 | Inicio/cierre por Supabase Auth; `e2e/sprint1.spec.ts` | Login correcto e incorrecto, persistencia tras reload y bloqueo tras logout | Solo entorno local |
| HL-13 | `src/lib/auth.ts`, paneles y `supabase/tests/rls.sql` | Ciudadano denegado en gestión, municipal accede a Comas, RLS impide escritura ajena y elevación de rol | Falta prueba con Cloud y llamada privilegiada directa desde navegador |

## Comprobaciones

- Migración local: 4 tablas y 9 políticas RLS.
- Dos perfiles ficticios locales: ciudadano en Comas y municipal de Comas.
- TypeScript y ESLint: pasaron.
- Vitest: 6/6 pasaron.
- Playwright: 18/18 pasaron en escritorio y móvil contra Auth local restaurado.
- Auditoría de dependencias: `npm audit --audit-level=high --offline`, cero vulnerabilidades encontradas en la caché local.
- Build de producción: pasó. El intento aislado dentro del sandbox terminó al generar páginas; con acceso local normal terminó correctamente.
- SQL RLS: pasó en transacción revertida, incluida denegación de elevación de rol.
- Estado de Postgres local tras las pruebas: 4 tablas públicas, 9 políticas, 2 perfiles ficticios en Comas y perfiles `citizen` para los registros nuevos.

Los flujos completos con cuentas ficticias dependen del archivo privado `.env.demo.local`; CI no tiene esas credenciales y omite estos casos. No marcar las historias como Listo en Jira hasta revisar las pruebas de GitHub Actions del commit final y los límites indicados.
