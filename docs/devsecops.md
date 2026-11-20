# Estrategia DevSecOps y ramas

El flujo previsto es Plan (Jira) → Code (`feature/*`) → Build (Next.js) → Test (Vitest y comprobaciones de tipos) → Release (PR a `test` y luego `main`) → Deploy (Vercel Preview/Production) → Operate (atención municipal) → Monitor (estado de Actions y Vercel).

El workflow comprueba instalación reproducible, tipos, lint, pruebas, build, auditoría de dependencias y ausencia de secretos rastreados. El job `gate` depende de los controles obligatorios. La validación de RLS contra Supabase local y Playwright se añaden cuando el motor Docker y las cuentas de prueba estén disponibles. No se fusiona código con gates fallidos.

`main` representa producción; `test`, integración; `feature/*`, cambios aislados. No se asignan claves Jira hasta verificar historias reales. El informe académico puede usar los diagramas de `docs/architecture/` y esta estrategia para las preguntas 3 y 4.
