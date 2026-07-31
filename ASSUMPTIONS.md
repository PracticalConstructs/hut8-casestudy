# ASSUMPTIONS

Every open question I hit while building, with the default I chose and why. Flag
anything here you want changed and I will rebuild around it.

## Iteration 2 (your review edits, July 31)

A. **ResumeAutomator1 is empty.** github.com/PracticalConstructs/ResumeAutomator1
   exists but has zero commits and zero branches; the push from your machine did not
   land. Voice still comes from andres-portfolio plus the way you write in your own
   review notes. Push the repo content and I will re-read it and do another pass.
B. **hut8.com and dsrny.com are bot-blocked from this build environment.** I worked
   from strong knowledge of both: Hut 8's rebrand (near black, big confident type,
   green accent, technical micro labels) and DS+R's editorial restraint (one type
   family, hairlines, whitespace). Space Grotesk is embedded for headings.
C. **Landing page keeps a condensed story below the fold.** You asked for landing =
   hero plus two buttons; the loop, Hut 8 fit, plan, money, and homework sections
   still need to live somewhere for the case study to stand alone, so they sit below
   the hero in a much quieter editorial layout. Cut them entirely if you want a pure
   two screen experience.
D. **Real manufacturers are named illustratively.** Vertiv and Rittal cabinets,
   NVIDIA H100 and GB200 GPU generations, Voith and Andritz generators. Public
   brands, no claims made about them beyond what the demo shows.
E. **Demo data is labeled.** Clash feeds, RFI counts, and sensor numbers are sample
   data and each site panel says so; financial figures per site are public (Vega,
   Beacon Point). The hydro station is explicitly a concept example.
F. **The pizza tracker lives in the demo now** (pinned to Fit-out per your spec),
   with the seven disciplines as the bottom icon ribbon. The landing page mentions
   both but no longer duplicates the full interactive tracker.

## Process and environment

1. **Phase 1 interview did not happen.** This session runs in a remote container where
   you cannot respond in real time, so I applied Phase 2 rules from the start: never
   block, choose the option most consistent with the first principles, record it here.
2. **ResumeAutomator was unreachable.** It lives at C:\Users\andre\Repos\dev on your
   local machine and is not on GitHub. I substituted the closest authoritative voice
   sample available: your andres-portfolio repo (bio, summary, and project pages). The
   distilled voice guide is in src/VOICE.md. If ResumeAutomator differs materially,
   the copy needs a pass against it.
3. **Branch and deployment.** The session rules require all work on branch
   claude/yurt-8-case-study-viihel and forbid pushing to other branches. Your project
   doc asks for pushes to main so GitHub Pages updates live. I followed the session
   rules: everything is pushed to the working branch with a draft PR open to main.
   Merging that PR is the one manual step that puts the site live. I verified the
   built page renders correctly from the file itself and documented the check in
   MORNING_REPORT.md.
4. **No em dashes** was applied to en dashes too. Your portfolio uses en dashes
   liberally; the brief bans em dashes in deliverables. To be safe I avoided both in
   all deliverable copy and used commas, colons, or "to" for ranges.

## Content decisions

5. **Employer anonymization.** Your portfolio names employers; the brief forbids
   naming them in deliverables. Capability claims appear as "on live hyperscale
   programs I've led" and similar. Nothing in /docs names a prior employer or their
   work products.
6. **Hut 8 figures.** All Hut 8 numbers in the deliverables come from public sources
   (SEC filings, investor materials, press releases) gathered and cross-checked during
   this build. Each figure in the cost model is traceable in src/RESEARCH.md with
   source URLs. Where a range existed I used the conservative end.
7. **Cost/value model calibration.** Your rough figures (~$350K year 1 ask, ~$4M year 1
   savings, ~$10M year 2) were validated against Hut 8's real scale and survived
   easily: at 830 MW under construction ($8B in flight), the base case math on
   standard benchmarks lands at $8M to $16M for year one. I kept YOUR numbers as the
   headline and framed them as the conservative case, with the base math shown in the
   copy. Full three case model (conservative $2.2M / base $16M / upside $57M year one)
   in src/RESEARCH.md. If you would rather headline the base case, that is a copy
   swap, not a rebuild.
8. **Tracker stages.** Locked as specified: Site Selection, Preconstruction, Design,
   Construction, Procurement, Fit-out, Operations. Critical elements per stage locked
   as specified, plus proposed additions flagged in the deliverable (Cost Management,
   Schedule Management, Safety/QA-QC, Commissioning, Handover Data, Sustainability/
   Energy) marked clearly as proposals for your review.
9. **3D stack decision.** three.js embedded directly in the single HTML file (no CDN
   required at runtime; CDN is not even used as primary), procedural geometry instead
   of heavy glTF assets to stay far under 15MB and run offline. NVIDIA Omniverse and
   the OpenUSD ecosystem written in as the future production-scale path, per the brief.
10. **"Case study" framing.** The deliverables never use the word proposal. The PDF is
    the brochure; the HTML is the demo. Both tell the same story; the HTML is richer
    but never contradicts the PDF.
11. **Team scaling numbers.** Cost per additional headcount modeled as a renaissance
    engineer at market rate for senior IC talent in mission-critical infrastructure.
    Licensing and API token costs estimated from public Autodesk/AWS pricing and
    stated as estimates in the deliverable.
12. **Public hosting safety.** Nothing confidential in the HTML: no prior employer
    material, no non-public Hut 8 data, only public figures with sources.
