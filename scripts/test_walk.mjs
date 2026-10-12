import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  const startBtn = page.locator('#btn-start-game');
  await startBtn.waitFor({ state: 'visible', timeout: 15000 });
  await startBtn.click();
  
  const startDayBtn = page.locator('#btn-start-day');
  await startDayBtn.waitFor({ state: 'visible', timeout: 8000 });
  await startDayBtn.click();
  
  // Immediately close encounter modal if it appears or hide it temporarily to inspect 3D characters
  await page.waitForTimeout(500);
  
  // Take screenshot of player behind counter
  await page.screenshot({ path: 'output/test_player_walk_01.png' });
  
  // Press 'd' to walk right for 1 second
  await page.keyboard.down('d');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'output/test_player_walk_02.png' });
  await page.keyboard.up('d');
  
  // Press 'a' to walk left for 1 second
  await page.keyboard.down('a');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'output/test_player_walk_03.png' });
  await page.keyboard.up('a');

  await browser.close();
  console.log('Walk capture done');
}

run().catch(console.error);
