import { chromium } from 'playwright';

async function main() {
  console.log('Testing Papa Adeleke Case with 127.0.0.1:5173...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click start game
  const startBtn = await page.$('#btn-start-game');
  if (startBtn && await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(1000);
    const startDayBtn = await page.$('#btn-start-day');
    if (startDayBtn && await startDayBtn.isVisible()) {
      await startDayBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Switch to encounter 1 (Papa Adeleke) in game store
  await page.evaluate(async () => {
    const modules = await import('/src/game/gameStore.ts');
    modules.useGameStore.getState().startEncounter(1);
  });

  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'output/adeleke_1_station_ready.png' });
  console.log('Captured Papa Adeleke at counter.');

  // Examine Rx Slip
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

    // Pick Ciprofloxacin
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
        console.log('Picked Ciprofloxacin to counter tray.');
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
  console.log('Completed successfully!');
}

main().catch(console.error);
