import { test, expect } from '@playwright/test';

test.describe('Box Jellyfish Toxin Analysis Application', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for application to load
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check main header in content area (not sidebar)
    await expect(page.locator('[data-testid="app-loaded"] h1').first()).toContainText('โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง');

    // Check subtitle
    await expect(page.locator('text=โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต')).toBeVisible();

    // Check feature cards
    await expect(page.locator('text=🧬 ฐานข้อมูลโปรตีน')).toBeVisible();
    await expect(page.locator('text=💊 ฐานข้อมูลสารยา')).toBeVisible();
    await expect(page.locator('text=🔬 การจำลอง')).toBeVisible();

    // Check workflow table
    await expect(page.locator('text=📋 ขั้นตอนการวิจัย')).toBeVisible();

    // Check quick start guide
    await expect(page.locator('text=เริ่มต้นอย่างรวดเร็ว')).toBeVisible();

    // Check featured results
    await expect(page.locator('text=🏆 ผลการค้นพบที่น่าสนใจ')).toBeVisible();
    await expect(page.locator('text=Silymarin')).toBeVisible();
    await expect(page.locator('text=-9.5 kcal/mol')).toBeVisible();
  });

  test('should navigate to proteins page and display protein data', async ({ page }) => {
    // Click proteins navigation
    await page.click('text=🧬 โปรตีนพิษ');

    // Check page header in main content area
    await expect(page.locator('main h1, [role="main"] h1').first()).toContainText('🧬 ฐานข้อมูลโปรตีนพิษแมงกะพรุน');

    // Check filters are present
    await expect(page.locator('text=กรองตามสิ่งมีชีวิต')).toBeVisible();
    await expect(page.locator('text=กรองตามชนิดพิษ')).toBeVisible();

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check that protein cards are displayed
    await expect(page.locator('text=CfTX-A')).toBeVisible();
    await expect(page.locator('text=Chironex fleckeri')).toBeVisible();

    // Test filter functionality
    await page.selectOption('select[data-testid="organism-filter"]', 'Chironex fleckeri');
    await page.waitForTimeout(1000);

    // Verify filtered results
    await expect(page.locator('text=พบ')).toBeVisible();

    // Test protein detail expansion
    await page.click('[data-testid="protein-expand"]');
    await expect(page.locator('text=รหัส UniProt')).toBeVisible();
    await expect(page.locator('text=ลำดับกรดอะมิโน')).toBeVisible();
  });

  test('should navigate to drugs page and display drug data', async ({ page }) => {
    // Click drugs navigation
    await page.click('text=💊 สารยา');

    // Check page header in main content area
    await expect(page.locator('main h1, [role="main"] h1').first()).toContainText('💊 ฐานข้อมูลสารยาที่มีศักยภาพ');

    // Check filters
    await expect(page.locator('text=กรองตามประเภท')).toBeVisible();
    await expect(page.locator('text=ค้นหาตามชื่อ')).toBeVisible();

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check drug table is displayed
    await expect(page.locator('text=ชื่อ')).toBeVisible();
    await expect(page.locator('text=สูตรโมเลกุล')).toBeVisible();
    await expect(page.locator('text=น้ำหนักโมเลกุล')).toBeVisible();

    // Check specific drugs are present
    await expect(page.locator('text=Silymarin')).toBeVisible();
    await expect(page.locator('text=Quercetin')).toBeVisible();

    // Test category filter
    await page.selectOption('select[data-testid="category-filter"]', 'Flavonoid');
    await page.waitForTimeout(1000);

    // Test search functionality
    await page.fill('input[data-testid="drug-search"]', 'Silymarin');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Silymarin')).toBeVisible();

    // Test drug detail view
    await page.selectOption('select[data-testid="drug-detail-select"]', 'Silymarin');
    await expect(page.locator('text=รหัส PubChem CID')).toBeVisible();
    await expect(page.locator('text=SMILES')).toBeVisible();
  });

  test('should navigate to simulation page and test simulation setup', async ({ page }) => {
    // Click simulation navigation
    await page.click('text=🔬 จำลองการทดลอง');

    // Check page header in main content area
    await expect(page.locator('main h1, [role="main"] h1').first()).toContainText('🔬 การจำลอง Molecular Docking');

    // Check selection sections
    await expect(page.locator('text=เลือกโปรตีนเป้าหมาย')).toBeVisible();
    await expect(page.locator('text=เลือกสารยาที่ต้องการทดสอบ')).toBeVisible();

    // Check simulation settings
    await expect(page.locator('text=⚙️ ตั้งค่าการจำลอง')).toBeVisible();
    await expect(page.locator('text=ความละเอียด (Exhaustiveness)')).toBeVisible();
    await expect(page.locator('text=จำนวน poses')).toBeVisible();
    await expect(page.locator('text=Random seed')).toBeVisible();

    // Test protein selection
    await page.check('[data-testid="protein-checkbox-0"]');
    await expect(page.locator('text=เลือกแล้ว: 1 โปรตีน')).toBeVisible();

    // Test drug selection
    await page.check('[data-testid="drug-checkbox-0"]');
    await expect(page.locator('text=เลือกแล้ว: 1 สารยา')).toBeVisible();

    // Test simulation parameters
    await page.fill('input[data-testid="exhaustiveness-slider"]', '16');
    await page.fill('input[data-testid="poses-slider"]', '15');
    await page.fill('input[data-testid="random-seed"]', '123');

    // Test simulation button (but don't actually run to save time)
    await expect(page.locator('text=🚀 เริ่มการจำลอง')).toBeVisible();
  });

  test('should navigate to results page (if results exist)', async ({ page }) => {
    // Click results navigation
    await page.click('text=📊 ผลลัพธ์');

    // Check if results exist or show warning
    const hasResults = await page.locator('text=📈 สรุปสถิติ').isVisible();

    if (hasResults) {
      // Test results display
      await expect(page.locator('text=📈 สรุปสถิติ')).toBeVisible();
      await expect(page.locator('text=จำนวนการจำลองทั้งหมด')).toBeVisible();
      await expect(page.locator('text=การจับที่สำเร็จ')).toBeVisible();

      // Test tabs
      await expect(page.locator('text=📋 ผลลัพธ์ทั้งหมด')).toBeVisible();
      await expect(page.locator('text=📊 กราฟ')).toBeVisible();
      await expect(page.locator('text=🏆 10 อันดับแรก')).toBeVisible();
      await expect(page.locator('text=🔍 วิเคราะห์')).toBeVisible();

      // Test tab navigation
      await page.click('text=📊 กราฟ');
      await page.waitForTimeout(1000);

      await page.click('text=🏆 10 อันดับแรก');
      await page.waitForTimeout(1000);

      await page.click('text=🔍 วิเคราะห์');
      await page.waitForTimeout(1000);
    } else {
      // Should show no results warning
      await expect(page.locator('text=ยังไม่มีผลลัพธ์การจำลอง')).toBeVisible();
    }
  });

  test('should navigate to export page', async ({ page }) => {
    // Click export navigation
    await page.click('text=📥 ส่งออกข้อมูล');

    // Check if results exist for export
    const hasResults = await page.locator('text=ตัวเลือกการส่งออก').isVisible();

    if (hasResults) {
      // Test export options
      await expect(page.locator('text=📊 ส่งออก CSV')).toBeVisible();
      await expect(page.locator('text=📑 ส่งออก Excel')).toBeVisible();

      // Test download buttons
      await expect(page.locator('text=⬇️ ดาวน์โหลด CSV')).toBeVisible();
      await expect(page.locator('text=⬇️ ดาวน์โหลด Excel')).toBeVisible();

      // Check preview section
      await expect(page.locator('text=📋 ตัวอย่างข้อมูลที่จะส่งออก')).toBeVisible();
      await expect(page.locator('text=📝 ตารางสำหรับรายงานวิจัย')).toBeVisible();
    } else {
      // Should show no data warning
      await expect(page.locator('text=ยังไม่มีผลลัพธ์ที่จะส่งออก')).toBeVisible();
    }
  });

  test('should test sidebar navigation and database stats', async ({ page }) => {
    // Check sidebar is visible
    await expect(page.locator('text=เมนูหลัก')).toBeVisible();

    // Check jellyfish icon
    await expect(page.locator('img[alt="Jellyfish"]')).toBeVisible();

    // Check database stats
    await expect(page.locator('text=จำนวนโปรตีน')).toBeVisible();
    await expect(page.locator('text=จำนวนสารยา')).toBeVisible();

    // Wait for stats to load
    await page.waitForTimeout(2000);

    // Check footer
    await expect(page.locator('text=โปรแกรมวิเคราะห์โปรตีนพิษแมงกะพรุนกล่อง v1.0')).toBeVisible();
    await expect(page.locator('text=© 2025 - เพื่อการศึกษาและวิจัย')).toBeVisible();
  });

  test('should test responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if page still loads correctly
    await expect(page.locator('text=เมนูหลัก')).toBeVisible();
    await expect(page.locator('h1')).toContainText('โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง');

    // Test navigation on mobile
    await page.click('text=🧬 โปรตีนพิษ');
    await expect(page.locator('h1')).toContainText('🧬 ฐานข้อมูลโปรตีนพิษแมงกะพรุน');

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should test error handling', async ({ page }) => {
    // Test navigation with potential errors
    await page.goto('/non-existent-page');

    // Should redirect to homepage or show error page
    await expect(page.locator('h1')).toContainText('โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง');
  });

  test('should test accessibility features', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);

    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for proper button labels
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});