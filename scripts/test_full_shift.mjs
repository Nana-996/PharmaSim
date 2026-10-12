import { chromium } from 'playwright';

async function main() {
  console.log('Testing full shift progression from Amina to Papa Adeleke...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Click Start Shift
  await page.click('#btn-start-game');
  await page.waitForTimeout(1000);

  // 2. Click Open Counter & Begin Shift
  await page.click('#btn-start-day');
  console.log('Begin shift clicked.');
  await page.waitForTimeout(3000);

  // 3. Ring up Amina OTC relief
  await page.click('#btn-ws-ring-register');
  await page.waitForTimeout(1000);

  // 4. Click farewell dialogue option to complete Amina encounter
  const farewellBtn = await page.$('.encounter-opt-btn');
  if (farewellBtn) {
    await farewellBtn.click();
    console.log('Clicked farewell to Amina. Resolving encounter...');
  }

  // 5. Wait for Papa Adeleke to walk into the pharmacy & approach counter
  console.log('Waiting for Papa Adeleke to approach counter...');
  await page.waitForTimeout(3500);

  await page.screenshot({ path: 'output/adeleke_1_counter.png' });
  console.log('Captured Papa Adeleke at counter.');

  // 6. Station 1: Examine Rx slip
  const examineBtn = await page.$('#btn-ws-examine-rx');
  if (examineBtn && await examineBtn.isVisible()) {
    await examineBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/adeleke_2_rx_desk.png' });
    console.log('Captured Papa Adeleke tactile prescription slip.');

    // 7. Approve Rx & Go to Shelves
    await page.click('#btn-rx-approve');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/adeleke_3_shelves.png' });
    console.log('Approved Rx. Opened shelves.');

    // 8. Search and pick Ciprofloxacin
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

    // 9. Station 3: Scan Tray - Chelation Warning
    await page.click('#btn-ws-scan-tray');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'output/adeleke_5_scanner_alert.png' });
    console.log('Scanned tray on Safety Terminal. Chelation warning active.');

    // 10. Attach Auxiliary Warning Sticker
    const auxBtn = await page.$('#btn-ws-aux-label');
    if (auxBtn && await auxBtn.isVisible()) {
      await auxBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'output/adeleke_6_sticker_attached.png' });
      console.log('Attached spacing auxiliary sticker.');
    }

    // 11. Station 5: Ring Up Register
    await page.click('#btn-ws-ring-register');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'output/adeleke_7_register_done.png' });
    console.log('Rang up register for Papa Adeleke.');
  }

  await browser.close();
  console.log('Full shift test completed successfully!');
}

main().catch(console.error);
