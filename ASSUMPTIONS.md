# ASSUMPTIONS

This overnight session received only the **DEPLOYMENT** section of the brief. No Phase 1
task description, scope document, or source material was found in the repository (empty
except for `.gitattributes`), in GitHub issues/PRs, or in Google Drive. Rather than block
overnight, the scope below was reconstructed from the repository name
(`hut8-casestudy`), the deliverable format described in the DEPLOYMENT section, and
context. Every judgment call is recorded here so it can be corrected in the morning.

## A1 — Subject of the case study
**Assumed:** Hut 8 Corp (NASDAQ/TSX: HUT), the Bitcoin mining and energy-infrastructure
company — its transformation from a pure-play Bitcoin miner into a power-first digital
infrastructure platform (self-mining via American Bitcoin, data centers, HPC/AI, power
generation).

**Why:** The repo is named `hut8-casestudy`; the deliverable is a polished, recipient-facing
business case study (self-contained HTML + PDF). The plausible alternative — Bletchley
Park's "Hut 8" (WWII codebreaking) — doesn't fit a business-case-study format nearly as
well, and nothing in the environment points to it.

## A2 — Phase definitions
**Assumed:** Phase 1 = research and content development (working files in `/src`);
Phase 2 = build and deploy the final HTML deliverable to `/docs/index.html` plus PDF.
The DEPLOYMENT section references "Phase 2" as the build/deploy stage, which implies a
prior research phase.

## A3 — Audience and tone
**Assumed:** A professional recipient (hiring manager, client, or investor-adjacent
reader). Tone: analytical, evidence-based, neutral — a strategy/business case study, not
investment advice. A disclaimer is included on the page.

## A4 — Content scope
Corporate evolution (Hut 8 Mining → USBTC merger → Hut 8 Corp → American Bitcoin),
business model and segments, the infrastructure build-out (Vega, River Bend, power
assets), financial trajectory, industry context (post-halving mining economics, the
AI/HPC pivot), peer comparison, risks, and outlook. All figures cited to public sources
(SEC filings, company releases, reputable press) collected during this session.

## A5 — Data currency
Assistant knowledge is supplemented with live web research (today: 2026-07-31). Figures
are as-reported in cited sources; where sources conflict, the primary (company filing)
number is used and the conflict is noted in `/src` research notes.

## A6 — Branch strategy
The harness designates `claude/github-pages-deployment-epkvhf` as the development branch;
the DEPLOYMENT brief explicitly instructs pushing to `origin/main` at milestones so
GitHub Pages (serving `/docs` on `main`) updates overnight. Both are honored: all
development happens on the feature branch, and `main` is fast-forwarded to it at
meaningful milestones. A draft PR records the change set.

## A7 — Self-contained deliverable
`/docs/index.html` makes zero external requests: all CSS/JS inline, charts hand-rendered
as inline SVG, no CDN fonts or libraries. The PDF is generated from the same HTML via
headless Chromium and placed at `/docs/Hut8-Case-Study.pdf` (linked from the page) and at
repo root.
