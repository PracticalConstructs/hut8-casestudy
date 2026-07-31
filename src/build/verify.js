/* v3 verification: three views, drawers, tutorial, sites. */
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
  await page.waitForTimeout(2800);
  await page.screenshot({ path: SHOT + 'v3-hero.png' });

  const checkText = () => page.evaluate(() => ({
    dashes: (document.body.innerText.match(/[—–]/g) || []).length,
    banned: /\bproposal\b/i.test(document.body.innerText),
  }));
  const landing = await checkText();

  // summary view
  await page.click('#btn-summary');
  await page.waitForTimeout(600);
  await page.screenshot({ path: SHOT + 'v3-summary.png' });
  await page.locator('#money').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: SHOT + 'v3-money.png' });
  const summary = await checkText();
  await page.click('#btn-back-sum');
  await page.waitForTimeout(400);

  // demo: tutorial auto-opens (wait for it explicitly; software GL delays startup)
  await page.click('#btn-demo');
  let tutOpen = true;
  try { await page.waitForSelector('#tut.on', { timeout: 10000 }); }
  catch (e) { tutOpen = false; }
  await page.waitForTimeout(600);
  await page.screenshot({ path: SHOT + 'v3-tutorial.png' });
  if (tutOpen) {
    await page.click('#tut-next');
    await page.waitForTimeout(400);
    await page.click('#tut-next');
    await page.waitForTimeout(400);
    await page.screenshot({ path: SHOT + 'v3-tutorial-step3.png' });
  }
  // deterministic dismissal, then guard against any late re-open
  await page.evaluate(() => window.__tutStop && window.__tutStop());
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__tutStop && window.__tutStop());
  await page.screenshot({ path: SHOT + 'v3-demo-vega.png' });

  // generate actions via popover
  await page.click('#hud-generate');
  await page.waitForTimeout(300);
  await page.click('#act-1');
  await page.waitForTimeout(500);
  await page.click('#act-2');
  await page.click('#act-3');
  await page.waitForTimeout(500);
  await page.screenshot({ path: SHOT + 'v3-demo-vega-swapped.png' });

  // data drawer + json
  await page.click('#hud-data');
  await page.waitForTimeout(300);
  const json1 = await page.textContent('#demo-json');
  await page.screenshot({ path: SHOT + 'v3-demo-data.png' });

  // sites drawer with thumbnails
  await page.click('#hud-sites');
  await page.waitForTimeout(400);
  const thumbs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.site-btn img')).map(i => i.src.startsWith('data:image') ? i.src.length : 0));
  await page.screenshot({ path: SHOT + 'v3-demo-sites.png' });
  await page.click('#site-beacon');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: SHOT + 'v3-demo-beacon.png' });
  await page.click('#site-hydro');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: SHOT + 'v3-demo-hydro.png' });

  // hydro actions
  await page.click('#hud-generate');
  await page.waitForTimeout(250);
  await page.click('#act-1');
  await page.click('#act-3');
  await page.waitForTimeout(500);
  await page.click('#hud-data');
  await page.waitForTimeout(250);
  const json2 = await page.textContent('#demo-json');

  // ribbon
  await page.click('.rib-btn:nth-of-type(1)');
  await page.waitForTimeout(250);
  const sheetVisible = await page.isVisible('#rib-sheet.open');

  const demoTxt = await checkText();
  await page.click('#btn-back');
  await page.waitForTimeout(300);
  const landingBack = await page.isVisible('#hero h1');

  console.log(JSON.stringify({
    errorCount: errors.length,
    consoleErrors: errors.slice(0, 5),
    landing, summary, demo: demoTxt,
    tutorialAutoOpened: tutOpen,
    thumbnailSizes: thumbs,
    ribbonSheetOpens: sheetVisible,
    backToLanding: landingBack,
    dcJson: json1.slice(0, 140),
    hydroJson: json2.slice(0, 140),
  }, null, 2));
  await browser.close();
})().catch(e => { console.error('VERIFY FAILED:', e); process.exit(1); });
