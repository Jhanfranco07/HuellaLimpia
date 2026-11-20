# Registro de evidencias

## Estado verificado

- Git local y remoto: `origin` es [Jhanfranco07/HuellaLimpia](https://github.com/Jhanfranco07/HuellaLimpia). `main` y `test` están publicadas.
- Código: landing, acceso, panel ciudadano, panel municipal, migración inicial y workflow versionados.
- Supabase local: pendiente. Docker Desktop no permite conexión al motor en este entorno.
- Supabase remoto: no configurado; no hay datos reales ni cuentas de demostración.
- GitHub: [commit inicial 951a94c](https://github.com/Jhanfranco07/HuellaLimpia/commit/951a94cae07fdce93f7d33cebd3dcd33b8790af1), [corrección b11a587](https://github.com/Jhanfranco07/HuellaLimpia/commit/b11a5877afe5e08906e8245efa51acf245d343cb), [PR HL-7 #1](https://github.com/Jhanfranco07/HuellaLimpia/pull/1).
- GitHub Actions: [primer push de `test`](https://github.com/Jhanfranco07/HuellaLimpia/actions/runs/44662299873) falló por el escaneo del propio workflow; [push corregido de `test`](https://github.com/Jhanfranco07/HuellaLimpia/actions/runs/44662503107) pasó; [PR HL-7](https://github.com/Jhanfranco07/HuellaLimpia/actions/runs/44663499986) pasó los cuatro jobs.
- Vercel: pendiente de despliegue y verificación.
- Comprobaciones locales del 19 de noviembre de 2026: `npm run typecheck` pasó; `npm run lint` pasó con una advertencia de imagen; `npm test` pasó (3/3); `npm run build` pasó con webpack tras limpiar `.next`; `npm install` reportó 0 vulnerabilidades luego de actualizar Vitest 5.1.1.
- Playwright Test: 4 pruebas HL-7 pasaron en Chrome de escritorio y móvil. Capturas reales: [escritorio](HL-7-desktop.png) y [móvil](HL-7-mobile.png). El primer intento con Playwright CLI falló por el sandbox; la suite posterior se ejecutó con éxito.

No se presentan ejecuciones o despliegues pendientes como evidencia aprobada.
