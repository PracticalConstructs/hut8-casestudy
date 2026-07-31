/* Builds practical-bim.html: the case study experience scrubbed of everything
   Hut 8, generic to any owner operator, all financials as labeled examples.
   Output goes straight into the portfolio working copy. */
const fs = require('fs');
const path = require('path');

const { remapColors, PB_TYPE_CSS, PB_JS } = require('./pb-theme.js');

const build = __dirname;
const OUT = '/workspace/andres-portfolio/practical-bim.html';

let template = fs.readFileSync(path.join(build, 'template.html'), 'utf8');
let app = fs.readFileSync(path.join(build, 'app.js'), 'utf8');
const three = fs.readFileSync(path.join(build, 'three.inline.js'), 'utf8');
const fill = JSON.parse(fs.readFileSync(path.join(build, 'fill.json'), 'utf8'));

/* Instrument Serif (display, italic) + Instrument Sans (body): the Rousseau
   editorial type. Replaces Space Grotesk entirely in this build. */
function face(pkg, family, weight, style) {
  const b64 = fs.readFileSync(path.join(build, 'node_modules', '@fontsource', pkg, 'files',
    `${pkg}-latin-${weight}-${style}.woff2`)).toString('base64');
  return `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
}
const fontsCss = [
  face('instrument-serif', 'Instrument Serif', 400, 'normal'),
  face('instrument-serif', 'Instrument Serif', 400, 'italic'),
  face('instrument-sans', 'Instrument Sans', 400, 'normal'),
  face('instrument-sans', 'Instrument Sans', 400, 'italic'),
  face('instrument-sans', 'Instrument Sans', 500, 'normal'),
  face('instrument-sans', 'Instrument Sans', 600, 'normal'),
].join('\n');

function must(s, from, to) {
  if (!s.includes(from)) throw new Error('scrub anchor missing: ' + from.slice(0, 70));
  return s.split(from).join(to);
}

/* ---------------- template scrubs ---------------- */
template = must(template, '<title>Yurt 8: A Case Study for Hut 8</title>',
  '<title>Practical BIM: Digital Delivery for Owner Operators</title>');
template = must(template, '<meta name="description" content="Yurt 8: one system that watches every project, generates the next design move, and learns from both. A case study for Hut 8 by Andres Felipe Pena.">',
  '<meta name="description" content="Practical BIM: one system that watches every project, generates the next design move, and learns from both. A working concept for owner operators by Andres Felipe Pena.">');
/* the "8" tab icon is a Hut 8 tie; use the portfolio favicon instead */
template = must(template, `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23f9552f'/%3E%3Ctext x='32' y='47' font-family='Arial,sans-serif' font-size='42' font-weight='700' fill='%23fff' text-anchor='middle'%3E8%3C/text%3E%3C/svg%3E">`,
  '<link rel="icon" type="image/png" href="assets/favicon.png">');
template = must(template, '{{FONTS_CSS}}', fontsCss);

/* hero */
template = must(template, '<h1>YURT <span class="eight">8</span></h1>\n    <div><span class="hero-badge">A case study for Hut 8</span></div>',
  '<h1 style="font-size:clamp(46px,8.2vw,98px)">Practical <span class="eight">BIM</span></h1>\n    <div><span class="hero-badge">A working concept for owner operators</span></div>');
template = must(template, '      <a class="btn btn-sky" href="Yurt8-Case-Study.pdf" download>PDF Condensed Summary</a>\n      <a class="btn btn-orange" href="#demo" id="btn-demo">Demo the Tool</a>\n      <a class="btn btn-gold" href="#summary" id="btn-summary">Detailed Summary</a>',
  '      <a class="btn btn-orange" href="#demo" id="btn-demo">Demo the Tool</a>\n      <a class="btn btn-gold" href="#summary" id="btn-summary">Detailed Summary</a>\n      <a class="btn btn-sky" href="index.html">Back to Portfolio</a>');
template = template.split('YURT <span class="eight">8</span><span class="back">&larr; back</span>')
  .join('P<span class="eight">BIM</span><span class="back">&larr; back</span>');

/* summary: owner operator section replaces the Hut 8 section */
template = must(template, '<h2>Built for the scale Hut 8 is already building</h2>',
  '<h2>Built for owner operator scale</h2>');
template = must(template, '<p class="lede">Hut 8 went from zero to $26.6 billion of contracted AI lease value in about a year. Yurt 8 is that same mission pointed inward: AI scaling the way Hut 8 designs, builds, and operates. Your leadership already names first principles infrastructure design as a core pillar. That is the exact filter this whole page runs on.</p>',
  '<p class="lede">Owner operators carry the CAPEX, the schedule risk, and the operating life of every building they touch. Practical BIM is AI pointed at that whole lifecycle: one system watching design, construction, and operations with the owner\'s money in mind. The figures below sketch a mid size portfolio; every one of them is an illustrative example.</p>');
template = must(template, '    <p class="lede" style="margin-top:30px;font-size:16px">One more public number worth sitting with: redesigning Beacon Point\'s first data hall to a new reference architecture added 57 percent more IT capacity on the same land and the same power. That is what a single great design iteration is worth at this scale. Yurt 8 exists to make that kind of move routine instead of heroic.</p>\n', '');

/* roadmap Hut 8 mentions */
template = must(template, 'Generate moves into the browser so anyone Hut 8 authorizes can run it without Revit.',
  'Generate moves into the browser so anyone the owner authorizes can run it without Revit.');
template = must(template, 'gated by review and tied to the codes and standards Hut 8 and its vendors flag.',
  'gated by review and tied to the codes and standards the owner and its vendors flag.');
template = template.split('the codes and standards Hut 8 and its vendors flag as critical')
  .join('the codes and standards the owner and its vendors flag as critical');
template = must(template, 'Hut 8 sees the tracker, not forty modules.',
  'The owner sees the tracker, not forty modules.');

/* money lede */
template = must(template, '<p class="lede">No dollar here is mysteriously earned. Every savings line ties to construction cost, change orders, third party fees, or the CAPEX line every owner operator watches. I anchored every figure to Hut 8\'s public scale and kept it deliberately conservative.</p>',
  '<p class="lede">No dollar here is mysteriously earned. Every savings line ties to construction cost, change orders, third party fees, or the CAPEX line every owner operator watches. This is a worked example sized for a portfolio with about $2B of construction in flight; swap in your own numbers and the same model runs.</p>');

/* homework */
template = must(template, '<p class="lede">Here is exactly how I made this case study, what tools did the work, and what I bring with or without them. The only thing excluded is prior employer material, which appears nowhere in this work.</p>',
  '<p class="lede">Here is exactly how I made this demo, what tools did the work, and what I bring with or without them. The only thing excluded is prior employer material, which appears nowhere in this work.</p>');
template = must(template, 'One orchestrating AI agent, directed by me, driving specialized sub agents: a research crew that pulled and cross checked Hut 8\'s public filings, drafting agents held to my voice rules, and adversarial reviewers that attacked every claim before it shipped.',
  'One orchestrating AI agent, directed by me, driving specialized sub agents: a research crew that pulled published industry benchmarks, drafting agents held to my voice rules, and adversarial reviewers that attacked every claim before it shipped.');
template = must(template, 'When Hut 8 wants production scale simulation, the path is NVIDIA Omniverse and the open source OpenUSD ecosystem: full physics digital twins of entire AI factories, a natural fit given Beacon Point\'s first hall is already designed to NVIDIA\'s DSX reference architecture. Nice to have later; not needed to start saving money now.',
  'When an owner wants production scale simulation, the path is NVIDIA Omniverse and the open source OpenUSD ecosystem: full physics digital twins of entire AI factories. Nice to have later; not needed to start saving money now.');
template = must(template, '<section id="hut8" aria-label="Built for Hut 8">', '<section id="fit" aria-label="Built for owner operators">');
/* drop the prompt box entirely (it is the Hut 8 brief) */
{
  const a = template.indexOf('<details class="prompt-box">');
  const b = template.indexOf('</details>', a);
  if (a < 0 || b < 0) throw new Error('prompt box not found');
  template = template.slice(0, a) + template.slice(b + '</details>'.length);
}
/* footer: drop PDF link */
template = must(template, '        <li><a href="Yurt8-Case-Study.pdf" download>PDF Condensed Summary</a></li>\n', '');
template = must(template, '<p>Senior technical program manager, generative design and infrastructure automation. I build systems that make buildings cheaper, faster, and better, and I show my work.</p>',
  '<p>Senior technical program manager, generative design and infrastructure automation. I build systems that make buildings cheaper, faster, and better, and I show my work. Practical BIM is a working concept; if you own buildings and want this loop on your portfolio, talk to me.</p>');

/* fills: generic example tiles and money copy */
const HUT8_TILES_PB =
  '<div class="tile"><div class="v">500 <em>MW</em></div><div class="l">Example portfolio under management, sized like a mid size owner operator</div></div>' +
  '<div class="tile"><div class="v">$2.0<em>B</em></div><div class="l">Example construction value in flight across active projects</div></div>' +
  '<div class="tile"><div class="v">1 <em>ID</em></div><div class="l">Per asset, for life: in the model, on the tag, in the sensor feed</div></div>' +
  '<div class="tile"><div class="v">Day <em>1</em></div><div class="l">Works with projects already underway and projects not yet started</div></div>';
const HUT8_TILES_SOURCES_PB = 'Every figure in this section is an illustrative example. Swap in your own portfolio and the same math runs.';
const MONEY_SOURCES_PB = 'How the example ties out: with about $2B of construction in flight, published industry benchmarks put change orders from design errors alone at 3 to 5 percent of construction budget, and documented savings from clash detection reach 10 percent of contract value. This example claims well under 1 percent of a watched slice of that work, plus eliminated third party fees and schedule value. Every figure on this page is an illustrative example, not client data.';

let moneyTable = fill.MONEY_TABLE.split('>Me, all in<').join('>Program lead, all in<');
let moneyTiles = fill.MONEY_TILES
  .split('Year one ask, all in: me at $350K, plus licensing, cloud, and tokens')
  .join('Year one cost, all in: a program lead plus licensing, cloud, and tokens (example)');

template = template
  .replace('{{HUT8_TILES}}', HUT8_TILES_PB)
  .replace('{{HUT8_TILES_SOURCES}}', HUT8_TILES_SOURCES_PB)
  .replace('{{MONEY_TILES}}', moneyTiles)
  .replace('{{MONEY_TABLE}}', moneyTable)
  .replace('{{MONEY_SOURCES}}', MONEY_SOURCES_PB);

/* ---------------- app scrubs ---------------- */
app = app.replace('{{MONEY_JSON}}', JSON.stringify(fill.MONEY_JSON));

/* sites: generic examples */
app = must(app, "id: 'vega', name: 'Vega Campus', loc: 'Texas Panhandle', type: 'dc', tag: 'Operating',",
  "id: 'vega', name: 'Data Center One', loc: 'Southwest US (example)', type: 'dc', tag: 'Operating',");
app = must(app, "id: 'beacon', name: 'Beacon Point', loc: 'Nueces County, Texas', type: 'dc2', tag: 'Under construction',",
  "id: 'beacon', name: 'Data Center Two', loc: 'Gulf Coast US (example)', type: 'dc2', tag: 'Under construction',");
app = must(app, "desc: 'AI campus to NVIDIA DSX reference design',", "desc: 'AI campus, dense liquid cooled racks',");
app = must(app, `      finance: [
        ['IT capacity', '205 MW'],
        ['Colocation revenue', '$110M to $120M / yr'],
        ['Build cost', '~$400K / MW'],
        ['Greenfield to energized', 'Under 12 months'],
        ['Status', 'Operating since June 2025'],
      ],`, `      finance: [
        ['IT capacity', '200 MW (example)'],
        ['Colocation revenue', '$115M / yr (example)'],
        ['Build cost', '$400K / MW (example)'],
        ['Greenfield to energized', '11 months (example)'],
        ['Status', 'Operating'],
      ],`);
app = must(app, `      finance: [
        ['First lease', '352 MW IT, $9.8B base term'],
        ['Full campus', '704 MW, $19.6B contracted'],
        ['Construction cost', '$9M to $11M / MW'],
        ['DSX redesign gain', '+57% IT capacity, same land'],
        ['First hall delivery', 'Q2 2027'],
      ],`, `      finance: [
        ['First lease', '350 MW IT (example)'],
        ['Construction cost', '$10M / MW (example)'],
        ['Contracted term', '15 years, triple net (example)'],
        ['Redesign gain', '+50% IT capacity, same land (example)'],
        ['First hall delivery', 'Next year (example)'],
      ],`);
app = app.split("note: 'Clash feed and operations data are illustrative examples. Financial figures are public.',")
  .join("note: 'Every number on this panel is an illustrative example.',");
app = app.split("note: 'Clash feed and schedule data are illustrative examples. Financial figures are public.',")
  .join("note: 'Every number on this panel is an illustrative example.',");

/* site codes + tags */
app = must(app, "liquid: false, code: 'VEG'", "liquid: false, code: 'DC1'");
app = must(app, "liquid: true, code: 'BPT'", "liquid: true, code: 'DC2'");
app = must(app, "var parts = ['HUT8', a.site, zone];", "var parts = ['PBIM', a.site, zone];");
app = must(app, "asset: site.id === 'beacon' ? 'CAB-BP1-POD2' : 'CAB-VG3-POD1',",
  "asset: site.id === 'beacon' ? 'CAB-DC2-POD2' : 'CAB-DC1-POD1',");

/* internal ids: no Hut 8 site names anywhere, not even in view-source */
app = app.split("'vega'").join("'dc1'");
app = app.split("'beacon'").join("'dc2'");

/* tutorial + misc copy */
app = must(app, "title: 'Welcome to Yurt 8', text: 'This is the live demo of the tool.",
  "title: 'Welcome to Practical BIM', text: 'This is the live demo of the tool.");
app = must(app, "text: 'Poke around. If you want the story and the numbers behind it, the Detailed Summary and the PDF are one click from the start page.'",
  "text: 'Poke around. If you want the story and the numbers behind it, the Detailed Summary is one click from the start page.'");
app = app.split("localStorage.getItem('yurt8TutorialDone')").join("localStorage.getItem('pbimTutorialDone')");
app = app.split("localStorage.setItem('yurt8TutorialDone', '1')").join("localStorage.setItem('pbimTutorialDone', '1')");
app = must(app, "/* Yurt 8 demo application v3. Three views: landing, detailed summary, demo tool. Offline. */",
  "/* Practical BIM demo application. Three views: landing, detailed summary, demo tool. Offline. */");

template = template.split('Yurt 8 conforms to the work').join('Practical BIM conforms to the work');
template = template.split('It is the same architecture Yurt 8 runs on.').join('It is the same architecture Practical BIM runs on.');
template = template.split('aria-label="Yurt 8 demo"').join('aria-label="Practical BIM demo"');

/* ---------------- Rousseau theme: palette, type, scene decoration ---------------- */
template = remapColors(template);
app = remapColors(app);
template = must(template, '</head>', '<style>' + PB_TYPE_CSS + '</style>\n</head>');
app = must(app, '      scenes[id] = s;', '      pbDecorate(s, id);\n      scenes[id] = s;');
app = must(app, '    var CYCLE = reduceMotion ? 0 : 22000;',
  '    pbHeroDecorate(scene);\n    var CYCLE = reduceMotion ? 0 : 22000;');
app = must(app, '\n  route();', '\n' + PB_JS + '\n  route();');

let html = template
  .replace('{{APP_JS}}', () => app)
  .replace('{{THREE_BUNDLE}}', () => three);

/* gates */
const leftovers = html.match(/\{\{[A-Z_]+\}\}/g);
if (leftovers) { console.error('FATAL tokens:', leftovers); process.exit(1); }
const authored = [template, app].join('\n');
if (/[–—]/.test(authored)) { console.error('FATAL: dash in authored content'); process.exit(1); }
const forbidden = /hut\s?8|yurt|vega|beacon|\bDSX\b|fluidstack|genoot|26\.6|830 MW|9\.8B|19\.6B|SEC filing|10-K|case study|proposal/i;
const lines = authored.split('\n').map((l, i) => [i + 1, l]).filter(([i, l]) => forbidden.test(l));
if (lines.length) {
  console.error('FATAL: forbidden terms remain:');
  lines.slice(0, 12).forEach(([i, l]) => console.error('  ' + i + ': ' + l.trim().slice(0, 130)));
  process.exit(1);
}

fs.writeFileSync(OUT, html);
console.log('OK wrote', OUT, (fs.statSync(OUT).size / 1024 / 1024).toFixed(2) + 'MB');
