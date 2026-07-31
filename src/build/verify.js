/* Loads docs/index.html headless, exercises both views, screenshots, reports. */
const { chromium } = require('playwright-core');
const path = require('path');

const SHOT = '/tmp/claude-0/-home-user-hut8-casestudy/d6b71518-4f0c-5316-8f09-3add99f0f473/scratchpad/';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  const file = 'file://' + path.resolve(__dirname, '..', '..', 'docs', 'index.html');
  await page.goto(file, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: SHOT + 'shot-hero.png' });

  // dash + banned word check on landing
  const check1 = await page.evaluate(() => ({
    dashes: (document.body.innerText.match(/[—–]/g) || []).length,
    banned: /\bproposal\b/i.test(document.body.innerText),
  }));

  // sections
  await page.locator('#money').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: SHOT + 'shot-money.png' });
  await page.locator('#loop').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: SHOT + 'shot-loop.png' });

  // enter demo
  await page.click('#btn-demo');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: SHOT + 'shot-demo-vega.png' });

  // demo interactions
  await page.click('#act-1');
  await page.waitForTimeout(600);
  await page.click('#act-2');
  await page.click('#act-3');
  await page.waitForTimeout(600);
  await page.screenshot({ path: SHOT + 'shot-demo-vega-swapped.png' });
  const json1 = await page.textContent('#demo-json');

  // ribbon
  await page.click('.rib-btn:nth-of-type(1)');
  await page.waitForTimeout(300);
  const sheetVisible = await page.isVisible('#rib-sheet.open');
  await page.screenshot({ path: SHOT + 'shot-demo-ribbon.png' });
  await page.click('#demo-stage'); // close sheet

  // switch sites
  await page.click('#site-beacon');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SHOT + 'shot-demo-beacon.png' });
  await page.click('#site-hydro');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SHOT + 'shot-demo-hydro.png' });
  await page.click('#act-1');
  await page.click('#act-3');
  await page.waitForTimeout(700);
  await page.screenshot({ path: SHOT + 'shot-demo-hydro-swapped.png' });
  const json2 = await page.textContent('#demo-json');

  const check2 = await page.evaluate(() => ({
    dashes: (document.body.innerText.match(/[—–]/g) || []).length,
    banned: /\bproposal\b/i.test(document.body.innerText),
  }));

  // back to landing
  await page.click('#btn-back');
  await page.waitForTimeout(400);
  const landingBack = await page.isVisible('#hero h1');

  console.log(JSON.stringify({
    consoleErrors: errors.slice(0, 6),
    errorCount: errors.length,
    landing: check1, demoView: check2,
    ribbonSheetOpens: sheetVisible,
    backToLanding: landingBack,
    dcJson: json1.slice(0, 160),
    hydroJson: json2.slice(0, 160),
  }, null, 2));
  await browser.close();
})().catch(e => { console.error('VERIFY FAILED:', e); process.exit(1); });
