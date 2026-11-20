import { expect, test } from '@playwright/test';

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
    await page.getByLabel('Fotografía (opcional)').setInputFiles({
      name: 'evidencia.png', mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jqVcAAAAASUVORK5CYII=', 'base64'),
    });
    await page.getByRole('button', { name: 'Enviar reporte' }).click();
    await expect(page.getByRole('status')).toContainText('Reporte enviado');
    const citizenReport = page.locator('article').filter({ hasText: address });
    await expect(citizenReport.getByRole('link', { name: 'Ver fotografía adjunta' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(municipalEmail!);
    await page.getByLabel('Contraseña').fill(municipalPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('heading', { name: 'Reportes por estado' })).toBeVisible();
    await page.getByRole('link', { name: 'Gestión de reportes' }).click();
    const report = page.locator('article').filter({ hasText: address });
    await expect(report).toBeVisible();
    await expect(report.getByRole('link', { name: 'Ver fotografía adjunta' })).toBeVisible();
    await report.getByLabel('Estado').selectOption('resuelto');
    await report.getByLabel('Observación (obligatoria para rechazar)').fill('Se realizó la limpieza del espacio.');
    await report.getByRole('button', { name: 'Guardar estado' }).click();
    await expect(page.getByRole('status')).toContainText('Estado actualizado');
    const updated = page.locator('article').filter({ hasText: address });
    await updated.getByText('Historial de atención').click();
    await expect(updated.locator('ol')).toContainText('resuelto');
    await expect(updated.locator('ol')).toContainText('Se realizó la limpieza del espacio.');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill(citizenPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByRole('link', { name: 'Mis reportes', exact: true }).click();
    await expect(page.locator('article').filter({ hasText: address })).toContainText('resuelto');
    await expect(page.locator('article').filter({ hasText: address })).toContainText('Se realizó la limpieza del espacio.');
  });
});
