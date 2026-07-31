/* Loads docs/index.html headless, exercises interactions, screenshots, reports. */
const { chromium } = require('playwright-core');
const path = require('path');

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
  await page.waitForTimeout(3500);

  // WebGL actually painting?
  const heroPix = await page.evaluate(() => {
    const c = document.getElementById('hero-canvas');
    if (!c) return 'no-canvas';
    try {
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return 'no-context';
      const px = new Uint8Array(4 * 100);
      gl.readPixels(gl.drawingBufferWidth >> 1, gl.drawingBufferHeight >> 1, 10, 10, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let sum = 0; for (const v of px) sum += v;
      return 'painted sum=' + sum;
    } catch (e) { return 'err ' + e.message; }
  });

  // dash check on rendered text
  const dashes = await page.evaluate(() => {
    const t = document.body.innerText;
    const hits = [];
    for (const ch of ['—', '–']) {
      let i = t.indexOf(ch);
      while (i !== -1) { hits.push(ch + ' @ "' + t.slice(Math.max(0, i - 40), i + 40).replace(/\n/g, ' ') + '"'); i = t.indexOf(ch, i + 1); }
    }
    return hits;
  });
  const banned = await page.evaluate(() => /\bproposal\b/i.test(document.body.innerText));

  await page.screenshot({ path: '/tmp/claude-0/-home-user-hut8-casestudy/d6b71518-4f0c-5316-8f09-3add99f0f473/scratchpad/shot-hero.png' });

  // tracker interaction
  await page.click('.t-stage:nth-child(4)');
  await page.waitForTimeout(400);

  // playground
  await page.locator('#playground').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.click('#btn-vendor');
  await page.waitForTimeout(1200);
  await page.click('#btn-gpu');
  await page.click('#btn-2n');
  await page.waitForTimeout(900);
  const json = await page.textContent('#play-json');
  await page.screenshot({ path: '/tmp/claude-0/-home-user-hut8-casestudy/d6b71518-4f0c-5316-8f09-3add99f0f473/scratchpad/shot-playground.png' });

  // money section
  await page.locator('#money').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/claude-0/-home-user-hut8-casestudy/d6b71518-4f0c-5316-8f09-3add99f0f473/scratchpad/shot-money.png' });

  // full page
  await page.screenshot({ path: '/tmp/claude-0/-home-user-hut8-casestudy/d6b71518-4f0c-5316-8f09-3add99f0f473/scratchpad/shot-full.png', fullPage: true });

  console.log(JSON.stringify({
    heroPix,
    consoleErrors: errors,
    dashHitsInRenderedText: dashes,
    bannedWordPresent: banned,
    playJsonSample: json.slice(0, 220),
  }, null, 2));
  await browser.close();
})().catch(e => { console.error('VERIFY FAILED:', e); process.exit(1); });
