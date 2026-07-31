/* Assembles the single-file deliverable at docs/index.html.
   Hard-fails if any {{TOKEN}} placeholder survives, so nothing half-filled ships. */
const fs = require('fs');
const path = require('path');

const build = __dirname;
const repo = path.resolve(build, '..', '..');
const out = path.join(repo, 'docs', 'index.html');

const template = fs.readFileSync(path.join(build, 'template.html'), 'utf8');
const three = fs.readFileSync(path.join(build, 'three.inline.js'), 'utf8');
let app = fs.readFileSync(path.join(build, 'app.js'), 'utf8');
const fill = JSON.parse(fs.readFileSync(path.join(build, 'fill.json'), 'utf8'));

app = app.replace('{{MONEY_JSON}}', JSON.stringify(fill.MONEY_JSON));

let html = template
  .replace('{{HUT8_TILES}}', fill.HUT8_TILES)
  .replace('{{HUT8_TILES_SOURCES}}', fill.HUT8_TILES_SOURCES)
  .replace('{{MONEY_TILES}}', fill.MONEY_TILES)
  .replace('{{MONEY_TABLE}}', fill.MONEY_TABLE)
  .replace('{{MONEY_SOURCES}}', fill.MONEY_SOURCES)
  .replace('{{PROMPT_ABRIDGED}}', fill.PROMPT_ABRIDGED)
  .replace('{{APP_JS}}', () => app)
  .replace('{{THREE_BUNDLE}}', () => three);

/* gate 1: no unfilled tokens (checked before injecting libraries would hide them) */
const leftovers = html.match(/\{\{[A-Z_]+\}\}/g);
if (leftovers) {
  console.error('FATAL: unfilled tokens remain:', leftovers);
  process.exit(1);
}

/* gate 2: no em or en dashes in authored content (template + fill + app strings).
   The three.js library bundle is excluded; it is not authored copy. */
const authored = [template, app, JSON.stringify(fill)].join('\n');
const dashHits = [];
authored.split('\n').forEach((line, i) => {
  if (/[–—]/.test(line)) dashHits.push(i + 1 + ': ' + line.trim().slice(0, 120));
});
if (dashHits.length) {
  console.error('FATAL: em/en dash in authored content:');
  dashHits.forEach(h => console.error('  ' + h));
  process.exit(1);
}

/* gate 3: banned words in deliverable copy */
if (/\bproposal\b/i.test([template, JSON.stringify(fill)].join(' '))) {
  console.error('FATAL: the word "proposal" appears in deliverable copy');
  process.exit(1);
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(2);
console.log('OK wrote', out, mb + 'MB');
if (parseFloat(mb) > 15) {
  console.error('FATAL: exceeds 15MB budget');
  process.exit(1);
}
