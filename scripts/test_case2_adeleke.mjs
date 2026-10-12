import { chromium } from 'playwright';

async function main() {
  console.log('Testing Case 2: Papa Adeleke - Tactile Rx & Chelation Auxiliary Sticker...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  // Wait for loading screen to disappear
  await page.waitForSelector('#main-menu:not(.hidden)', { timeout: 15000 });
  await page.waitForTimeout(500);

  // Click start game
  await page.click('#btn-start-game');
  await page.waitForSelector('#briefing-modal:not(.hidden)', { timeout: 5000 });
  await page.waitForTimeout(500);

  // Click open counter & begin shift
  await page.click('#btn-start-day');
  await page.waitForTimeout(1500);

  // Jump directly to encounter 1 (Papa Adeleke) in zustand store
  await page.evaluate(async () => {
    const modules = await import('/src/game/gameStore.ts');
    modules.useGameStore.getState().startEncounter(1);
  });

  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'output/adeleke_1_station_ready.png' });
  console.log('Papa Adeleke at counter.');

  // Examine Rx slip
  const examineBtn = await page.$('#btn-ws-examine-rx');
  if (examineBtn) {
    await examineBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/adeleke_2_rx_paper_sheet.png' });
    console.log('Captured Papa Adeleke tactile prescription slip.');

    // Approve Rx
    await page.click('#btn-rx-approve');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/adeleke_3_shelves_opened.png' });
    console.log('Approved Rx. Opened shelves.');

    // Search and pick Cipro
    const searchInput = await page.$('#drug-search-input');
    if (searchInput) {
      await searchInput.fill('cipro');
      await page.waitForTimeout(500);
      const ciproCard = await page.$('.drug-card');
      if (ciproCard) {
        await ciproCard.click();
        await page.waitForTimeout(300);
        await page.click('#btn-confirm-drug');
        await page.waitForTimeout(1000);
        console.log('Picked Ciprofloxacin into counter tray.');
      }
    }

    await page.screenshot({ path: 'output/adeleke_4_tray_picked.png' });

    // Scan Tray - Chelation Warning
    await page.click('#btn-ws-scan-tray');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/adeleke_5_scanner_chelation_alert.png' });
    console.log('Captured chelation interaction warning on scanner.');

    // Attach Auxiliary Label Sticker
    const auxBtn = await page.$('#btn-ws-aux-label');
    if (auxBtn && await auxBtn.isVisible()) {
      await auxBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'output/adeleke_6_sticker_attached.png' });
      console.log('Captured auxiliary label sticker attached.');
    }

    // Ring Up Register
    await page.click('#btn-ws-ring-register');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'output/adeleke_7_register_complete.png' });
    console.log('Rang up register for Papa Adeleke.');
  }

  await browser.close();
  console.log('Papa Adeleke simulation test complete!');
}

main().catch(console.error);
