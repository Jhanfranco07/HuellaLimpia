import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from './page';

describe('HL-7 portada pública', () => {
  const html = renderToStaticMarkup(<Home />);

  it('explica el propósito y muestra los cuatro distritos', () => {
    expect(html).toContain('Calles limpias. Mascotas queridas.');
    expect(html).toContain('Reporta puntos críticos y sigue la atención');
    for (const district of ['Los Olivos', 'Comas', 'San Martín de Porres', 'Independencia']) {
      expect(html).toContain(`<li>${district}</li>`);
    }
  });

  it('ofrece accesos reales a registro e inicio de sesión', () => {
    expect(html).toMatch(/href="\/acceso\?modo=registro"[^>]*>Crear cuenta/);
    expect(html).toMatch(/href="\/acceso"[^>]*>Ingresar/);
  });

  it('incluye navegación semántica y acceso por teclado al contenido', () => {
    expect(html).toContain('href="#contenido">Saltar al contenido</a>');
    expect(html).toContain('<nav class="navlinks" aria-label="Navegación principal">');
    expect(html).toContain('<main id="contenido">');
  });
});
