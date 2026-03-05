import { test, expect } from '@playwright/test';

test.describe('Docking Page Visual Test', () => {
  test('CfTX-1 + Silymarin docking', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });

    // Navigate to Docking
    await page.locator('button', { hasText: /Docking|จำลองการจับ/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/01-selection.png', fullPage: true });

    // Select CfTX-1 + Silymarin
    await page.locator('button:has-text("CfTX-1")').first().click();
    await page.locator('button:has-text("Silymarin")').first().click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'test-results/02-selected.png', fullPage: true });

    // Run Docking
    await page.locator('button', { hasText: /Run Docking|เริ่มจำลองการจับ/ }).click();
    await page.waitForSelector('text=kcal/mol', { timeout: 30000 });
    await page.waitForTimeout(8000); // wait for 3D rendering

    const canvasCount = await page.locator('canvas').count();
    console.log(`Canvas elements: ${canvasCount}`);

    await page.screenshot({ path: 'test-results/03-result.png', fullPage: true });

    // Show details
    const showBtn = page.locator('button', { hasText: /Show Details/ });
    if (await showBtn.isVisible()) {
      await showBtn.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: 'test-results/04-details.png', fullPage: true });

    if (consoleErrors.length) console.log('Errors:', consoleErrors.filter(e => !e.includes('CORS')).join('\n'));
  });

  test('different pair: Quercetin + another protein', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });

    await page.locator('button', { hasText: /Docking|จำลองการจับ/ }).click();
    await page.waitForTimeout(500);

    // Select CfTX-A + Quercetin
    await page.locator('button:has-text("CfTX-A")').first().click();
    await page.locator('button:has-text("Quercetin")').first().click();
    await page.waitForTimeout(200);

    await page.locator('button', { hasText: /Run Docking|เริ่มจำลองการจับ/ }).click();
    await page.waitForSelector('text=kcal/mol', { timeout: 30000 });
    await page.waitForTimeout(8000);

    await page.screenshot({ path: 'test-results/05-pair2-result.png', fullPage: true });
  });
});
