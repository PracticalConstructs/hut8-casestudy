# MORNING REPORT

Good morning. Everything you asked for is built, verified, and pushed. Here is the
five minute version.

## What is done

**The PDF brochure** (`Yurt8-Case-Study.pdf`, at repo root and in /docs, 191KB)
- Exactly 2 pages, verified by machine after every render, both pages structured as
  chronological timelines: page 1 walks the project lifecycle tracker, page 2 walks
  the 24 month build plan plus the money.
- Light, clean, print friendly. Liberation Sans (Arial metrics). Non-threatening on
  purpose.

**The HTML demo** (`/docs/index.html`, 0.73MB, one file)
- Runs fully offline: I loaded it in a browser with every network request blocked;
  zero external requests, zero console errors. three.js is embedded, not CDN loaded.
- Hero: a 3D data hall that assembles itself (a deliberate echo of your portfolio's
  self-drawing building), drag to orbit.
- The pizza tracker: 7 stages in your exact order, click each stage for its data
  sources and lead disciplines; auto-cycles until touched.
- The playground: swap cabinet vendors (containment re-sizes live), swap GPUs
  (numbering visibly preserved), toggle 2N cooling (B path appears). A live JSON
  panel writes the shared schema on every click.
- Money section: validated chart palette (colorblind safe, checked by script), cost
  table, and the full "how it ties out" paragraph.
- Show My Homework: the abridged driving prompt is in the page, plus the multi-agent
  build story, the without-AI statement, and the versatility statement.
- Mobile checked at 390px. Reduced motion respected. WebGL failure shows a graceful
  text fallback.

**The research** (`src/RESEARCH.md`)
- 14 agents: 5 parallel researchers, 8 adversarial verifiers, 1 synthesis agent.
  Verified against primary SEC filings where reachable.
- Your numbers survived and then some: at 830 MW under construction and $9M to $11M
  per MW guided, base case math lands at $8M to $16M year one. Your $4M/$10M are
  pitched as the conservative case, with the base math shown. Best new ammo: the
  $7.5B of project bonds cost about $1.27M per day in interest at full draw.

## What I assumed (full list in ASSUMPTIONS.md)

1. ResumeAutomator was unreachable (local to your machine), so voice came from your
   andres-portfolio repo. src/VOICE.md is the distilled guide.
2. No em dashes was extended to en dashes everywhere, enforced by the build script
   (it hard-fails the build if one appears in copy).
3. The word "proposal" and all prior employer names are also build-failing words.
4. Kept your $350K / $4M / $10M as headlines, framed as conservative; swap to base
   case is a copy change if you want it.

## What needs your eyes first

1. **Merge the draft PR.** GitHub Pages serves /docs from main, so the live URL
   updates only when the PR merges. That is the one manual step. I could not push to
   main directly from this session (branch protection on my end, not yours).
2. **The money table splits** (page 2 / money section): my cost $250K year 1 rising
   to $350K year 2, hires at $520K combined, licensing $45K, cloud $55K. Sanity
   check against what you actually want to ask for.
3. **The five flagged tracker additions** (cost, schedule, safety/QAQC,
   commissioning/handover, energy): written as "flagged for your review" per your
   instruction. Confirm or cut.
4. **Voice pass**: run your ResumeAutomator checks against the copy. If anything
   reads off, the copy lives in src/build/template.html and src/build/pdf.html;
   `node src/build/assemble.js && node src/build/pdf-render.js` rebuilds everything
   with all gates.

## Build system (for future you)

- `src/build/template.html` + `app.js` + `fill.json` assemble into /docs/index.html.
- `src/build/pdf.html` + `fill.json` render into the PDF via headless Chromium.
- Both builders hard-fail on: leftover placeholders, em/en dashes in copy, the word
  "proposal", over 2 PDF pages, over 15MB HTML.
- `src/build/verify.js` loads the built page headless and screenshots every section.
