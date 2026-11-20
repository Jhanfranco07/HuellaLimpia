import { expect, test } from '@playwright/test';

const citizenEmail = process.env.CIUDADANO_EMAIL;
const citizenPassword = process.env.CIUDADANO_PASSWORD;
const municipalEmail = process.env.MUNICIPAL_EMAIL;
const municipalPassword = process.env.MUNICIPAL_PASSWORD;

test.describe('Sprint 1 con Supabase local', () => {
  test.skip(!citizenEmail || !citizenPassword || !municipalEmail || !municipalPassword, 'Requiere cuentas ficticias locales');

  test('HL-8: educación visible y accesible por teclado', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Consejos' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#educacion$/);
    await expect(page.getByText('Lleva bolsas en cada paseo')).toBeVisible();
    await expect(page.getByText('Cuida las áreas comunes')).toBeVisible();
    await expect(page.getByText('Recoge los desechos de tu mascota')).toBeVisible();
  });

  test('HL-11 y HL-13: ciudadano inicia sesión, persiste y no entra a gestión', async ({ page }) => {
    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill(citizenPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole('link', { name: 'Mis mascotas' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('link', { name: 'Mis reportes', exact: true })).toBeVisible();
    await page.goto('/panel/gestion');
    await expect(page).toHaveURL(/\/panel$/);
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.goto('/panel');
    await expect(page).toHaveURL(/\/acceso$/);
  });

  test('HL-11: credenciales incorrectas muestran error', async ({ page }) => {
    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill('clave-incorrecta');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('alert')).toContainText('Revisa tu correo y contraseña');
  });

  test('HL-13: municipal accede a su gestión y no a mascotas ciudadanas', async ({ page }) => {
    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(municipalEmail!);
    await page.getByLabel('Contraseña').fill(municipalPassword!);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('link', { name: 'Gestión de reportes' })).toBeVisible();
    await page.goto('/panel/gestion');
    await expect(page.getByRole('heading', { name: 'Reportes de Comas' })).toBeVisible();
    await page.goto('/panel/mascotas');
    await expect(page).toHaveURL(/\/panel$/);
  });

  test('HL-10: registro crea ciudadano y no permite escoger rol', async ({ page }) => {
    const email = `nuevo-${Date.now()}@huellalimpia.test`;
    await page.goto('/acceso?modo=registro');
    await expect(page.locator('select[name="role"]')).toHaveCount(0);
    await page.getByLabel('Nombre completo').fill('Ciudadana Temporal');
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByLabel('Contraseña').fill('ClaveTemporalSegura2026!');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole('link', { name: 'Mis mascotas' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Gestión de reportes' })).toHaveCount(0);
  });

  test('HL-10: correo duplicado muestra error comprensible', async ({ page }) => {
    await page.goto('/acceso?modo=registro');
    await page.getByLabel('Nombre completo').fill('Ciudadano Repetido');
    await page.getByLabel('Correo electrónico').fill(citizenEmail!);
    await page.getByLabel('Contraseña').fill('ClaveTemporalSegura2026!');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByRole('alert')).toContainText('Ese correo ya tiene una cuenta');
  });

  test('HL-10: formulario rechaza correo inválido y contraseña corta', async ({ page }) => {
    await page.goto('/acceso?modo=registro');
    await page.getByLabel('Nombre completo').fill('Ciudadana Temporal');
    await page.getByLabel('Correo electrónico').fill('correo-invalido');
    await page.getByLabel('Contraseña').fill('123');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/modo=registro/);
    const invalid = await page.getByLabel('Correo electrónico').evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(invalid).toBe(true);
  });
});
