import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser to test Phase 3 Workstation Simulation...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('UNCAUGHT PAGE EXCEPTION:', err);
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Menu screen
  await page.screenshot({ path: 'output/sim_1_menu.png' });
  console.log('Captured Menu screen');

  // 2. Click Start Game
  const startBtn = await page.$('#btn-start-game');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/sim_2_briefing.png' });
    console.log('Captured Briefing modal');
  }

  // 3. Click Open Counter & Begin Shift
  const startDayBtn = await page.$('#btn-start-day');
  if (startDayBtn) {
    await startDayBtn.click();
    console.log('Clicked Open Counter & Begin Shift. Waiting for patient to walk in...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'output/sim_3_workstation_dock.png' });
    console.log('Captured Workstation Dock with 3D counter & patient');
  }

  // 4. Check Workstation Stations
  const wsDock = await page.$('#encounter-modal');
  const isDockVisible = wsDock ? !(await wsDock.evaluate(el => el.classList.contains('hidden'))) : false;
  console.log('Workstation Dock visible:', isDockVisible);

  const rxStatus = await page.$eval('#ws-rx-status', el => el.textContent).catch(() => 'N/A');
  const trayCount = await page.$eval('#ws-tray-count', el => el.textContent).catch(() => 'N/A');
  const scannerStatus = await page.$eval('#ws-scanner-status', el => el.textContent).catch(() => 'N/A');
  const phoneStatus = await page.$eval('#ws-phone-status', el => el.textContent).catch(() => 'N/A');
  const regTotal = await page.$eval('#ws-register-total', el => el.textContent).catch(() => 'N/A');

  console.log('Station 1 (Rx):', rxStatus);
  console.log('Station 2 (Shelves):', trayCount);
  console.log('Station 3 (Scanner):', scannerStatus);
  console.log('Station 4 (Phone):', phoneStatus);
  console.log('Station 5 (POS):', regTotal);

  // 5. Open Shelves
  const openShelvesBtn = await page.$('#btn-ws-open-shelves');
  if (openShelvesBtn) {
    await openShelvesBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/sim_4_shelf_picking.png' });
    console.log('Captured Shelf Picking modal');

    // Pick a drug from shelf
    const cards = await page.$$('.drug-card');
    console.log(`Found ${cards.length} medication items on shelves`);
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForTimeout(500);
      
      const confirmBtn = await page.$('#btn-confirm-drug');
      if (confirmBtn) {
        await confirmBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'output/sim_5_tray_picked.png' });
        console.log('Confirmed picking drug to tray. Returned to workstation dock.');
      }
    }
  }

  // 6. Scan Dispensing Tray
  const scanBtn = await page.$('#btn-ws-scan-tray');
  if (scanBtn) {
    await scanBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/sim_6_scanned_tray.png' });
    console.log('Scanned tray on Safety Terminal.');
  }

  // 7. Ring Up POS Register
  const ringBtn = await page.$('#btn-ws-ring-register');
  if (ringBtn) {
    await ringBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'output/sim_7_pos_checkout.png' });
    console.log('Rang up POS register.');
  }

  await browser.close();
  console.log('Simulation test finished successfully!');
}

main().catch(console.error);
