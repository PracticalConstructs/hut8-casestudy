/* Renders the 2-page brochure: pdf.html + fill.json -> Yurt8-Case-Study.pdf
   at repo root AND docs/. Verifies page count and content gates via pypdf after. */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const build = __dirname;
const repo = path.resolve(build, '..', '..');

(async () => {
  const fill = JSON.parse(fs.readFileSync(path.join(build, 'fill.json'), 'utf8'));
  const pdfFonts = [400, 600, 700].map(w => {
    const b64 = fs.readFileSync(path.join(build, 'node_modules', '@fontsource', 'open-sans', 'files',
      `open-sans-latin-${w}-normal.woff2`)).toString('base64');
    return `@font-face{font-family:"Open Sans";font-style:normal;font-weight:${w};src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
  }).join('\n');
  let html = fs.readFileSync(path.join(build, 'pdf.html'), 'utf8');
  html = html
    .replace('{{PDF_FONTS}}', () => pdfFonts)
    .replace('{{PDF_MONEY_TILES}}', fill.PDF_MONEY_TILES)
    .replace('{{PDF_MONEY_TABLE}}', fill.PDF_MONEY_TABLE)
    .replace('{{PDF_HUT8_ANCHOR}}', fill.PDF_HUT8_ANCHOR)
    .replace('{{PDF_SOURCES}}', fill.PDF_SOURCES);

  const leftovers = html.match(/\{\{[A-Z_]+\}\}/g);
  if (leftovers) { console.error('FATAL: unfilled tokens:', leftovers); process.exit(1); }
  if (/[–—]/.test(html)) { console.error('FATAL: em/en dash in PDF content'); process.exit(1); }
  if (/\bproposal\b/i.test(html)) { console.error('FATAL: banned word in PDF content'); process.exit(1); }

  const tmp = path.join(build, 'pdf-filled.html');
  fs.writeFileSync(tmp, html);

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  const out = path.join(repo, 'Yurt8-Case-Study.pdf');
  await page.pdf({
    path: out,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  await browser.close();
  fs.copyFileSync(out, path.join(repo, 'docs', 'Yurt8-Case-Study.pdf'));

  const check = execSync(
    `python3 - <<'EOF'\nfrom pypdf import PdfReader\nr = PdfReader(${JSON.stringify(out)})\nn = len(r.pages)\ntext = "\\n".join(p.extract_text() or "" for p in r.pages)\nprint("pages:", n)\nassert n <= 2, "FATAL: more than 2 pages"\nassert "\\u2014" not in text and "\\u2013" not in text, "FATAL: dash in extracted text"\nimport re\nassert not re.search(r"\\bproposal\\b", text, re.I), "FATAL: banned word"\nprint("chars:", len(text))\nprint("GATES PASS")\nEOF`,
    { encoding: 'utf8' }
  );
  console.log(check);
  console.log('wrote', out, (fs.statSync(out).size / 1024).toFixed(0) + 'KB, and docs copy');
})().catch(e => { console.error('RENDER FAILED:', e.message); process.exit(1); });
