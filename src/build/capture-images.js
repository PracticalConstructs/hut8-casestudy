/* Captures clean canvas-only renders of the three scenes for the PDF. */
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto('file:///home/user/hut8-casestudy/docs/index.html', { waitUntil: 'load' });
  await p.waitForTimeout(3500);
  await p.locator('#hero-canvas').screenshot({ path: 'img/pdf-hero.png' });
  await p.click('#btn-demo');
  try { await p.waitForSelector('#tut.on', { timeout: 10000 }); } catch (e) {}
  await p.evaluate(() => window.__tutStop && window.__tutStop());
  await p.waitForTimeout(1200);
  await p.evaluate(() => window.__tutStop && window.__tutStop());
  await p.waitForTimeout(300);
  await p.locator('#demo-canvas').screenshot({ path: 'img/pdf-vega.png' });
  await p.click('#hud-sites');
  await p.waitForTimeout(200);
  await p.click('#site-hydro');
  await p.evaluate(() => { document.getElementById('drawer-sites').classList.remove('open'); });
  await p.waitForTimeout(1400);
  await p.locator('#demo-canvas').screenshot({ path: 'img/pdf-hydro.png' });
  console.log('captured 3 images');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
