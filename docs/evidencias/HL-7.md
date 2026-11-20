# HL-7 — Consultar portada del servicio

Historia confirmada por el usuario: [HL-7](https://jhanfranco.atlassian.net/browse/HL-7), épica HL-1.

## Mejora

La portada muestra los cuatro distritos sin abrir el FAQ, incorpora un enlace para saltar al contenido y conserva accesos visibles a registro e inicio de sesión. La fotografía del hero se sirve desde `public/hero-perro.jpg` con `next/image`, dimensiones y prioridad de carga.

## Verificación local, 19 de noviembre de 2026

- `npm run typecheck`: pasó.
- `npm run lint`: pasó sin advertencias.
- `npm test`: 6 pruebas pasaron, incluidas 3 nuevas de HL-7.
- `npm run build`: pasó; la landing se prerenderizó.
- `npm run test:e2e`: 4 pruebas pasaron con Chrome en escritorio y móvil tras incorporar la fotografía local. Comprobaron propósito, distritos, accesos, foco de teclado, ausencia de desborde horizontal y carga efectiva de la fotografía.
- Capturas obtenidas por Playwright: `HL-7-desktop.png` y `HL-7-mobile.png`.

## GitHub

- Commit de implementación: [578cfaa](https://github.com/Jhanfranco07/HuellaLimpia/commit/578cfaa9e164dc24dd9730a4b4397de30362a73c).
- Pull Request hacia `test`: [#1](https://github.com/Jhanfranco07/HuellaLimpia/pull/1).
- Ejecución del commit de implementación: [Actions 44663499986](https://github.com/Jhanfranco07/HuellaLimpia/actions/runs/44663499986), finalizada correctamente con `quality`, `security`, `browser` y `gate` exitosos.
