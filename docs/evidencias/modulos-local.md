# Módulos ciudadanos y municipales: verificación local

Fecha de ejecución: 20 de noviembre de 2026. Rama: `feature/modulos-ciudadanos-municipales`.

## Implementación comprobada

- Perfil: consulta y edición del nombre personal; rol y distrito visibles, sin controles públicos para asignarlos.
- Mascotas: registro, listado y edición de las propias; formulario y estados de carga, error y vacío.
- Reportes: creación con distrito, dirección, descripción y fotografía opcional JPG/PNG/WebP de hasta 5 MB. La foto se guarda en un bucket privado y se consulta mediante URL firmada de corta duración.
- Gestión municipal: lectura limitada al distrito asignado, filtro por estado, cambio de estado, observación e historial de auditoría.
- Indicadores: recuentos reales por estado y direcciones más reportadas, limitados al distrito autorizado. No hay comparación entre distritos porque los permisos actuales no autorizan esa consulta.
- Logout: alcance local para no revocar simultáneamente otras sesiones del mismo usuario.

## Resultados ejecutados

| Control | Resultado |
| --- | --- |
| `npm.cmd run typecheck` | Aprobado |
| `npm.cmd run lint` | Aprobado |
| `npm.cmd run test` | 6 pruebas aprobadas |
| `npm.cmd run build` | Aprobado |
| `NODE_USE_SYSTEM_CA=1 npm.cmd audit --audit-level=high` | 0 vulnerabilidades |
| Reconstrucción Supabase aislada | 5 migraciones aplicadas desde cero; 5 tablas públicas, 11 políticas públicas y 3 políticas de Storage |
| `supabase/tests/rls.sql` en base aislada | Aprobado con `ROLLBACK`; incluye denegación de fotografías y datos ajenos |
| `supabase db advisors --type security --level warn --fail-on warn` en base aislada | 0 advertencias |
| `npm.cmd run test:e2e` | 26/26 en escritorio y móvil con Supabase local y Storage activo |

La migración nueva `20261120045833_incident_photos_storage.sql` **no se aplicó en Cloud**. Antes de utilizar la rama en producción hay que comparar el estado remoto, aplicar solo esa versión si aún falta, repetir las pruebas de permisos y comprobar el despliegue. El historial existente de cuatro migraciones Cloud no se alteró durante esta verificación. GitHub Actions y Vercel se documentarán cuando tengan resultados reales.
