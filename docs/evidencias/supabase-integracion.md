# Integración Supabase — estado verificable

## Proyecto Cloud previsto

- Reference ID indicado por el usuario: `asdfhkjwvznizsjopert`.
- URL indicada: `https://asdfhkjwvznizsjopert.supabase.co`.
- Migración remota: **no aplicada**. La CLI no pudo listar proyectos por error de transporte y el conector Supabase no inició. La respuesta 401 del endpoint Auth sin clave solo prueba que el host responde; no confirma permisos de administración.

## Validación local, 19 de noviembre de 2026

- Docker Desktop: motor 29.9.3 disponible.
- Pila local aislada en puertos 54421 (API), 54422 (PostgreSQL), 54423 (Studio), 54424 (correo).
- CLI Supabase 3.2.0 aplicó `20261119000000_initial.sql` sin error.
- PostgreSQL confirmó 4 tablas y 9 políticas RLS.
- `supabase/tests/rls.sql` pasó en una transacción revertida: lectura propia, aislamiento de perfiles, mascotas e incidencias, lectura municipal solo en Comas, denegación de inserción de mascota ajena y actualización fuera del distrito.
- Auth local: registro e inicio de sesión con correo ficticio; ambos devolvieron el mismo UUID y el login emitió un token. La contraseña generada solo vivió en memoria.

## Pendiente

- Verificar acceso autenticado al proyecto Cloud exacto, revisar tablas existentes y aplicar la migración remota autorizada.
- Obtener claves Jira reales para asociar historias de autenticación, mascotas, reportes y gestión.
- Crear usuarios ficticios en Cloud y ejecutar flujos E2E completos y permisos por rol.
- Configurar Vercel Preview y Production y verificar URL pública antes de integrar `main`.
