import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  
  console.log('Navigating...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  
  console.log('Waiting for main menu...');
  const startBtn = page.locator('#btn-start-game');
  await startBtn.waitFor({ state: 'visible', timeout: 15000 });
  await page.screenshot({ path: 'output/test_01_menu.png' });
  
  console.log('Clicking start game...');
  await startBtn.click();
  
  const startDayBtn = page.locator('#btn-start-day');
  await startDayBtn.waitFor({ state: 'visible', timeout: 8000 });
  await page.screenshot({ path: 'output/test_02_briefing.png' });
  
  console.log('Clicking start day...');
  await startDayBtn.click();
  await page.waitForTimeout(4000); // Wait for patient walk-in
  
  await page.screenshot({ path: 'output/test_03_scene_with_npc.png' });
  
  const encModal = page.locator('#encounter-modal');
  console.log('Encounter modal visible:', await encModal.isVisible());
  if (await encModal.isVisible()) {
    await page.screenshot({ path: 'output/test_04_encounter_modal.png' });
  }

  await browser.close();
  console.log('Done test');
}

run().catch(console.error);
