# HuellaLimpia

Plataforma para registrar mascotas, comunicar incidencias de salubridad y dar seguimiento municipal en Lima Norte.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL, Zod, Vitest y GitHub Actions.

## Inicio local

1. Instalar Node.js 22 o superior y ejecutar `npm ci`.
2. Copiar `.env.example` a `.env.local` y configurar la URL y clave publicable de un proyecto Supabase exclusivo.
3. Aplicar `supabase/migrations/20261119000000_initial.sql` mediante Supabase CLI local o revisión controlada en un proyecto exclusivo.
4. Ejecutar `npm run dev`.

El registro público crea ciudadanos. La asignación municipal requiere intervención administrativa en la base de datos; no existe selector público de rol.

## Verificación

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Tras el build, `npm run test:e2e` comprueba la portada con Playwright en tamaños móvil y escritorio.

## Arquitectura y seguridad

Diagramas y modelo en [`docs/architecture`](docs/architecture). Las rutas privadas comprueban sesión; las acciones validan entradas y rol; PostgreSQL aplica RLS por propietario y distrito. Las credenciales privadas nunca van al repositorio.

## Estado de entrega

Consultar [`docs/evidencias/README.md`](docs/evidencias/README.md). No se afirma despliegue, PR o conexión Supabase hasta verificarlos.

## ZIP

Ejecutar `git archive --format=zip --output=HuellaLimpia.zip HEAD` tras confirmar que el árbol versionado contiene solo los archivos deseados. `.gitignore` excluye dependencias, build, variables de entorno y secretos.
