# Locked Outline

## Deliverable 1: PDF brochure (2 pages max, chronological timeline)

**Page 1: The system (what Yurt 8 is)**
- Masthead: YURT 8, "A case study in digital delivery for the Hut 8 portfolio",
  Andres Felipe Pena, date, live demo URL.
- Three-sentence opener: what it is, what it does, why it exists (first principles).
- The Tracker as the visual spine of the page: 7 stages left to right (Site Selection,
  Preconstruction, Design, Construction, Procurement, Fit-out, Operations), each with
  its connected data sources. Framed as "the pizza tracker for buildings."
- The core loop: REVIEW, GENERATE, LEARN in three short blocks:
  - Review: live model feeds, plain-English RFIs, clashes as they happen; ACC as the
    primary CDE plus Procore, Tableau, Power BI, Microsoft Project via APIs.
  - Generate: deterministic guardrails alternating with LLM generators via MCP; runs in
    a browser through Autodesk Design Automation (no Revit install); data center moves
    (cabinet swaps, MEP re-sizing, GPU swaps that keep numbering).
  - Learn: Bedrock agents on S3 data lakes; knowledge bases gated by review; grows from
    stakeholder rules and exemplar designs.
- One line on the shared JSON schema tying all three together.
- One compact strip: ACC kept simple for Hut 8, simplified for vendors, ISO 19650
  folder structure that will not make life hell; light asset tagging plus IoT/CSSM.

**Page 2: The plan and the money (chronological roadmap)**
- Month-by-month timeline, month 1 through 24: build the tool, build the team (1 to 3
  renaissance engineers), maintain and scale. Every month shows a dollars-and-time
  checkpoint; that cadence is called out as non-negotiable.
- Meetings and leadership philosophy in two sentences.
- Cost/value model table: my cost, per-headcount cost, licensing, API tokens vs
  savings anchored to Hut 8's real CAPEX and pipeline (public figures, conservative
  end). Year 1 and year 2 rows. Sources noted.
- Hut 8 fit: existing projects (conform to current contractors and contracts) and new
  projects (end-to-end from day one) both get the full path.
- Show My Homework teaser: built in 2 days with a multi-agent AI build I designed and
  drove; I can build it without AI too (HTML, Python, C#, C, .NET); quick learner,
  motivated, curious. Full transparency lives in the demo.
- 3D note: ships as one file, runs anywhere, no installs, no servers; NVIDIA Omniverse
  and the OpenUSD ecosystem as the production-scale future path.

## Deliverable 2: single-file HTML demo (companion, same story, richer)

Scroll narrative, sections in this order:
1. Hero: 3D data center scene (three.js embedded, procedural geometry), YURT 8 title,
   one-line pitch, link to PDF.
2. The Tracker: interactive; click a stage to see its critical elements (Clash
   Detection, BIM, Information Management, Model Management, User Management, Project
   Management, Project Delivery) and connected data sources; proposed additional
   elements flagged as proposals.
3. The Loop: Review / Generate / Learn interactive panels with the shared JSON schema
   shown flowing between them (same JSON snippet in all three).
4. 3D demo moments: buttons that swap cabinet manufacturers (geometry re-sizes, MEP
   containment re-fits), swap GPUs while numbering stays, toggle redundant power to
   CRAC units. Playful, gamified, KISS.
5. Built for Hut 8: real public figures (CAPEX, MW pipeline, projects), the two paths
   (existing work conforms, new work end-to-end), mission alignment: scaling AI and
   using AI to scale.
6. Working quietly underneath: ACC strategy, ISO 19650 folder tree (simple), IoT/CSSM
   monitoring, tech stack (APS/Design Automation, MCP, Bedrock, S3) kept readable.
7. The Roadmap: 24-month timeline with monthly dollars-and-time checkpoints; team 1 to
   3; meetings philosophy.
8. The Money: cost vs savings, interactive but simple; every number sourced.
9. Show My Homework: the actual driving prompt (abridged), the multi-agent build
   architecture, no black boxes, what I can do without AI, versatility statement.
10. Footer: contact, PDF link, "one file, runs offline" note, Omniverse future path.

## Architecture decisions (locked)

- **3D stack:** three.js r1xx embedded inline (no runtime CDN dependency; fully
  offline). Procedural geometry only: keeps the file a fraction of the 15MB budget,
  loads instantly, and proves the point that the simple path ships. glTF/USD pipeline
  and Omniverse named as the scale-up path in copy.
- **PDF pipeline:** HTML template printed to PDF via headless Chromium for exact
  typographic control; verified at 2 pages by reading the rendered output back.
- **Build framework:** one orchestrating Claude driving specialized sub-agents
  (research sweep, verification, section drafting, adversarial review) via scripted
  workflows; this architecture is itself described in Show My Homework.
- **Hosting:** /docs on main via GitHub Pages; index.html is the demo; PDF in /docs
  and at repo root.
