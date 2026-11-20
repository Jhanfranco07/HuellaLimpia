import { expect, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { deflateSync } from 'node:zlib';

function pngChunk(type: string, data: Buffer) {
  const bytes = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, bytes, checksum]);
}

function largeValidPng() {
  const width = 700;
  const height = 700;
  const pixels = randomBytes(width * height * 3);
  const rows = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) pixels.copy(rows, y * (1 + width * 3) + 1, y * width * 3, (y + 1) * width * 3);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(rows)), pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const citizenEmail = process.env.CIUDADANO_EMAIL;
const citizenPassword = process.env.CIUDADANO_PASSWORD;
const municipalEmail = process.env.MUNICIPAL_EMAIL;
const municipalPassword = process.env.MUNICIPAL_PASSWORD;

test.describe('Perfil y mascotas con Supabase local', () => {
  test.skip(!citizenEmail || !citizenPassword, 'Requiere cuenta ciudadana local');

  test('perfil: el registro permite editar solo el nombre visible', async ({ page }) => {
    const email = `perfil-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@huellalimpia.test`;
    await page.goto('/acceso?modo=registro');
    await page.getByLabel('Nombre completo').fill('Ciudadana de Prueba');
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByLabel('Contraseña').fill('ClaveTemporalSegura2026!');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/\/panel$/);
    await page.getByRole('link', { name: 'Mi perfil' }).click();
    await expect(page.getByText('Ciudadanía')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toHaveCount(0);
    await page.getByLabel('Nombre completo').fill('Ciudadana Actualizada');
    await page.getByRole('button', { name: 'Guardar nombre' }).click();
    await expect(page.getByRole('status')).toContainText('Nombre actualizado');
    await expect(page.locator('aside')).toContainText('Ciudadana Actualizada');
  });

  test('mascotas: registra, lista y edita una mascota propia', async ({ page }) => {
    const name = `Luna ${Date.now()}`;
    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill(citizenPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('link', { name: 'Mis mascotas' }).click();
    const create = page.getByRole('heading', { name: 'Registrar mascota' }).locator('..');
    await create.getByLabel('Nombre').fill(name);
    await create.getByLabel('Especie').selectOption('Perro');
    await create.getByLabel('Edad aproximada').fill('3');
    await create.getByLabel('Edad aproximada').press('Tab');
    await create.getByRole('button', { name: 'Registrar mascota' }).press('Enter');
    await expect(page.getByRole('status')).toContainText('Mascota guardada');
    const details = page.locator('details').filter({ hasText: name });
    await details.locator('summary').click();
    await details.getByLabel('Nombre').fill(`${name} Editada`);
    await details.getByRole('button', { name: 'Guardar cambios' }).press('Enter');
    await expect(page.locator('details').filter({ hasText: `${name} Editada` })).toBeVisible();
  });

  test('reporte con fotografía: atención municipal, auditoría y seguimiento ciudadano', async ({ page }) => {
    test.skip(!municipalEmail || !municipalPassword, 'Requiere cuenta municipal local');
    const address = `Parque prueba ${Date.now()} ${Math.random().toString(36).slice(2, 6)}`;
    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill(citizenPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/panel$/);
    await page.getByRole('link', { name: 'Mis reportes', exact: true }).click();
    await expect(page).toHaveURL(/\/panel\/reportes$/);
    await page.getByLabel('Distrito').selectOption('Comas');
    await page.getByLabel('Dirección o referencia').fill(address);
    await page.getByLabel('Describe el problema').fill('Se encontraron residuos de mascotas sin recoger en el parque.');
    await page.getByLabel('Latitud').fill('-11.950000');
    await page.getByLabel('Longitud').fill('-77.050000');
    const image = largeValidPng();
    expect(image.length).toBeGreaterThan(1024 * 1024);
    expect(image.length).toBeLessThan(5 * 1024 * 1024);
    await page.getByLabel('Fotografía (opcional)').setInputFiles({
      name: 'evidencia.png', mimeType: 'image/png',
      buffer: image,
    });
    await page.getByRole('button', { name: 'Enviar reporte' }).click();
    await expect(page.getByRole('status')).toContainText('Reporte enviado');
    const citizenReport = page.locator('article').filter({ hasText: address });
    await expect(citizenReport.getByTitle(/OpenStreetMap/)).toHaveAttribute('src', /openstreetmap\.org\/export\/embed\.html/);
    await citizenReport.getByRole('button', { name: address }).click();
    await expect(citizenReport.getByTitle(/OpenStreetMap/)).toHaveAttribute('src', /marker=/);
    await expect(citizenReport.getByRole('link', { name: 'Ver fotografía adjunta' })).toBeVisible();
    const photoResponse = await page.request.get(await citizenReport.getByRole('link', { name: 'Ver fotografía adjunta' }).getAttribute('href') ?? '');
    expect(photoResponse.ok()).toBe(true);
    expect(photoResponse.headers()['content-type']).toContain('image/png');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(municipalEmail!);
    await page.getByLabel('Contraseña').fill(municipalPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('heading', { name: 'Reportes por estado' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Comparación entre distritos' })).toBeVisible();
    for (const district of ['Los Olivos','Comas','San Martín de Porres','Independencia']) {
      await expect(page.getByRole('row', { name: new RegExp(district) })).toBeVisible();
    }
    await page.getByRole('link', { name: 'Gestión de reportes' }).click();
    const report = page.locator('article').filter({ hasText: address });
    await expect(report).toBeVisible();
    await expect(report.getByRole('link', { name: 'Ver fotografía adjunta' })).toBeVisible();
    await expect(report.getByRole('option', { name: 'resuelto' })).toHaveCount(0);
    await report.getByLabel('Estado').selectOption('en_atencion');
    await report.getByLabel('Observación pública (obligatoria para rechazar)').fill('La cuadrilla está revisando el punto.');
    await report.getByRole('button', { name: 'Guardar estado' }).click();
    await expect(page.getByRole('status')).toContainText('Estado actualizado');
    const updated = page.locator('article').filter({ hasText: address });
    await expect(updated.getByLabel('Estado')).toHaveValue('en_atencion');
    await updated.getByLabel('Estado').selectOption('resuelto');
    await updated.getByLabel('Observación pública (obligatoria para rechazar)').fill('Se realizó la limpieza del espacio.');
    await updated.getByRole('button', { name: 'Guardar estado' }).click();
    await expect(page.getByRole('status')).toContainText('Estado actualizado');
    await expect(updated.getByLabel('Estado')).toHaveValue('resuelto');
    await updated.getByLabel('Nueva nota interna').fill('Turno de la cuadrilla municipal de prueba.');
    await updated.getByRole('button', { name: 'Guardar nota interna' }).click();
    await expect(page).toHaveURL(/mensaje=nota/,{timeout:20000});
    await expect(page.getByRole('status')).toContainText('Nota interna guardada');
    await updated.getByText('Historial de atención').click();
    await expect(updated.locator('ol')).toContainText('resuelto');
    await expect(updated.locator('ol')).toContainText('Se realizó la limpieza del espacio.');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill(citizenPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('link', { name: 'Mis reportes', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Mis reportes' })).toBeVisible();
    await expect(page.locator('article').filter({ hasText: address })).toContainText('resuelto',{timeout:15000});
    await expect(page.locator('article').filter({ hasText: address })).toContainText('Se realizó la limpieza del espacio.');
    await expect(page.locator('article').filter({ hasText: address })).not.toContainText('Turno de la cuadrilla municipal de prueba.');
  });

  test('fotografía: permite adjuntarla después de guardar el reporte', async ({ page }) => {
    const address=`Parque sin foto ${Date.now()}`;
    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill(citizenPassword!);
    await page.getByRole('button',{name:'Ingresar'}).click();
    await page.getByRole('link',{name:'Mis reportes',exact:true}).click();
    await page.getByLabel('Distrito').selectOption('Comas');
    await page.getByLabel('Dirección o referencia').fill(address);
    await page.getByLabel('Describe el problema').fill('Reporte de prueba para recuperar una fotografía pendiente.');
    await page.getByRole('button',{name:'Enviar reporte'}).click();
    const report=page.locator('article').filter({hasText:address});
    await expect(report.getByLabel('Adjuntar fotografía pendiente')).toBeVisible();
    await report.getByLabel('Adjuntar fotografía pendiente').setInputFiles({name:'recuperada.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jqVcAAAAASUVORK5CYII=','base64')});
    await report.getByRole('button',{name:'Adjuntar fotografía',exact:true}).click();
    await expect(page.getByRole('status')).toContainText('Fotografía adjuntada');
    await expect(page.locator('article').filter({hasText:address}).getByRole('link',{name:'Ver fotografía adjunta'})).toBeVisible();
  });

  test('fotografía: rechaza archivo demasiado grande y formato no permitido', async ({ page }) => {
    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill(citizenPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/panel$/);
    await page.getByRole('link', { name: 'Mis reportes', exact: true }).click();
    await expect(page).toHaveURL(/\/panel\/reportes$/);
    for (const [name, type, buffer] of [
      ['grande.png', 'image/png', Buffer.alloc(5 * 1024 * 1024 + 1, 1)],
      ['formato.gif', 'image/gif', Buffer.from('GIF89a')],
    ] as const) {
      const address = `Prueba rechazada ${name} ${Date.now()}`;
      await page.getByLabel('Distrito').selectOption('Comas');
      await page.getByLabel('Dirección o referencia').fill(address);
      await page.getByLabel('Describe el problema').fill('Reporte que no debe crearse por fotografía inválida.');
      await page.getByLabel('Fotografía (opcional)').setInputFiles({ name, mimeType: type, buffer });
      await page.getByRole('button', { name: 'Enviar reporte' }).click();
      await expect(page.locator('main p[role="alert"]')).toContainText('JPG, PNG o WebP válida de hasta 5 MB');
      await expect(page.locator('article').filter({ hasText: address })).toHaveCount(0);
    }
  });
});
