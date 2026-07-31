const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent('<h1>hello</h1>');
  console.log('title ok:', await page.textContent('h1'));
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
