import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  // Wait for loading screen to hide and main menu to be visible
  console.log('Waiting for loading to complete...');
  await page.waitForSelector('#main-menu:not(.hidden)', { timeout: 15000 });
  await page.screenshot({ path: 'output/verify_01_main_menu.png' });
  console.log('Main menu loaded!');

  // Test OpenLife button directly on Main Menu
  console.log('Testing OpenLife from Main Menu...');
  await page.click('#btn-menu-openlife');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'output/verify_02_openlife_from_menu.png' });

  // Close OpenLife modal
  await page.click('#btn-close-openlife');
  await page.waitForTimeout(500);

  // Click Start Game -> Day Briefing
  console.log('Starting day 1...');
  await page.click('#btn-start-game');
  await page.waitForTimeout(800);
  await page.click('#btn-start-day');
  await page.waitForTimeout(2500);

  // Capture 3D Pharmacy environment behind counter
  await page.screenshot({ path: 'output/verify_03_3d_pharmacy_scene.png' });
  console.log('Captured 3D Pharmacy Scene!');

  // Open OpenLife Hub from HUD
  console.log('Opening OpenLife Hub from HUD...');
  await page.click('#btn-openlife-toggle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'output/verify_04_openlife_bio.png' });

  // Switch to Activities tab
  console.log('Testing Activities & Gym...');
  await page.click('#ol-tab-btn-activities');
  await page.waitForTimeout(600);
  await page.click('#btn-ol-visit-gym');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'output/verify_05_openlife_activities.png' });

  // Switch to Real Estate & Vehicles tab
  console.log('Testing Assets...');
  await page.click('#ol-tab-btn-assets');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'output/verify_06_openlife_assets.png' });

  // Switch to Market & Crypto tab
  console.log('Testing Market & Trading...');
  await page.click('#ol-tab-btn-investments');
  await page.waitForTimeout(600);
  await page.click('.btn-trade-buy[data-symbol="PHRM"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'output/verify_07_openlife_market.png' });

  // Switch to Relationships tab
  console.log('Testing Relationships...');
  await page.click('#ol-tab-btn-relationships');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'output/verify_08_openlife_relationships.png' });

  // Switch to Dev Terminal and run commands
  console.log('Testing Dev Terminal...');
  await page.click('#ol-tab-btn-console');
  await page.waitForTimeout(600);
  await page.click('.term-quick[data-cmd="cheats"]');
  await page.waitForTimeout(600);
  await page.click('.term-quick[data-cmd="maxstat"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'output/verify_09_openlife_terminal.png' });

  await browser.close();
  console.log('All verification stages passed successfully!');
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
