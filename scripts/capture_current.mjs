import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'output/current_screen.png' });
  
  // Click start if start button exists
  const startBtn = await page.$('#start-btn');
  if (startBtn && await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'output/after_start.png' });
  }

  // Click patient if visible or check encounter modal
  const encModal = await page.$('#encounter-modal');
  console.log('Encounter modal visible:', encModal ? !(await encModal.evaluate(el => el.classList.contains('hidden'))) : 'not found');

  await browser.close();
}

main().catch(console.error);
