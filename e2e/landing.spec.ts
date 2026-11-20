import { expect, test } from '@playwright/test';

test('HL-7: portada, distritos y accesos visibles', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Calles limpias. Mascotas queridas.' })).toBeVisible();
  const heroImage = page.getByRole('img', { name: 'Perro al aire libre' });
  await expect(heroImage).toBeVisible();
  await expect.poll(() => heroImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  for (const district of ['Los Olivos', 'Comas', 'San Martín de Porres', 'Independencia']) {
    await expect(page.getByRole('listitem').filter({ hasText: district }).first()).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/acceso?modo=registro');
  await page.screenshot({ path: `docs/evidencias/HL-7-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('link', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/acceso$/);
});

test('HL-7: navegación por teclado y sin desborde horizontal', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contenido$/);
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
});
