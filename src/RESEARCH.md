# Research Notes: every number in the deliverables, with sources

Gathered July 31, 2026 by a multi-agent research sweep (5 parallel researchers, 8
adversarial verification agents, 1 synthesis agent), cross-checked against primary SEC
filings where possible. Confidence noted per line.

## Hut 8 scale (the anchor for every savings claim)

| Fact | Figure | As of | Source |
|---|---|---|---|
| Energy capacity under management | 710 MW (15 sites; 1,020 MW at YE2025 before Ontario power sale) | Q1 2026 | Hut 8 Q1 2026 results, SEC 8-K May 6, 2026 |
| Development pipeline | 8,375 MW (5,315 diligence / 1,680 exclusivity / 550 development / 830 construction) | Q1 2026 | Hut 8 Q1 2026 results |
| Contracted AI lease value | $26.6B base term, 949 MW IT capacity, >$1.75B expected avg annual NOI | Jul 20, 2026 | Beacon Point full commercialization release |
| Under construction now | 830 MW | Q1 2026 | Q1 2026 results |
| Guided construction cost | $9M to $11M per MW (Beacon Point, "consistent with River Bend") | May 2026 | Q1 2026 earnings call |
| Construction financing closed | $3.25B (River Bend, 6.192%) + $4.25B (Beacon Point, 6.129%) investment grade notes | Apr/Jun 2026 | Hut 8 press releases |
| River Bend | 245 MW lease, $7.0B base term (Fluidstack for Anthropic, Google backstop); first hall Q2 2027; Jacobs EPCM | Dec 2025 to May 2026 | Hut 8 / LED / Blockspace |
| Beacon Point | 704 MW contracted, $19.6B campus value; NVIDIA DSX redesign added 57% IT capacity (224 to 352 MW) on same land and power | May to Jul 2026 | Hut 8 releases |
| Vega | 205 MW, greenfield to energized in under 12 months (site bought Jul 2024, energized Jun 30, 2025); 180 kW rack densities, direct to chip liquid cooling | Jun 2025 | Hut 8 release |
| FY2025 revenue | $235.1M (+45% YoY); Q1 2026 revenue $71.0M (+226% YoY) | Feb/May 2026 | FY2025 10-K, Q1 2026 8-K |
| Headcount | ~220 to 248 employees | 2025 to 2026 | 10-K derived (macrotrends) |
| CEO strategy framing | "Power fuels technology"; four pillars: high velocity origination, disciplined greenfield development, first principles infrastructure design, capital efficient execution | May 2026 | Q1 2026 shareholder letter |
| Growth rate | $0 to ~$27B contracted AI revenue in about one year (CEO, CNBC) | Jul 21, 2026 | CNBC interview |

Verification notes: FY2025 revenue, net loss, and platform MW figures confirmed against
the primary 10-K. Total assets $2.75B (YE2025) updated to $2.61B (Q1 2026 10-Q) by a
verifier. Cash + Bitcoin ~$1.3B as of Mar 31, 2026 ($795.6M Hut 8 + $489.0M American
Bitcoin).

## Industry benchmarks used in the savings model

| Benchmark | Figure | Source |
|---|---|---|
| Data center turnkey build cost | $7M to $12M per MW (JLL 2025 global avg $10.7M/MW; AI facilities carry a 7 to 10% premium) | JLL, Turner & Townsend |
| A/E design fees | 4.5% to 9% of construction cost (industrial); 7 to 15% basic services on complex work | terrapincg, Monograph |
| Change orders | 5 to 10% of contract value typical; 10 to 15% on major projects | Rhumbix and others |
| Change orders from A/E errors and omissions | 3 to 5% of construction budget | AIA published study |
| Rework | ~5% direct, ~9% including indirect costs | Navigant / CII |
| BIM and clash detection savings | Up to 40% fewer unbudgeted changes; up to 10% of contract value; up to 7% schedule reduction | Stanford CIFE benchmark (32 projects) |
| VDC coordination ROI case | $200K invested returned $2.5M+ (about 10x) | DBIA case study |
| RFI economics | 796 RFIs per major project average, ~$1,080 cost each, 9.7 day median response | Navigant (~1M RFIs, 1,300 projects) |

## Tech stack facts (for Show My Homework)

- ACC exposes REST APIs for Issues, RFIs, Submittals, Sheets, Cost, plus a Data
  Connector bulk extract API. Autodesk Build lists around $145/user/month.
- Autodesk Platform Services moved to Flex token pricing Dec 8, 2025: Design
  Automation (Revit in the cloud) meters at 2 tokens per processing hour.
- AWS Bedrock AgentCore went GA Oct 13, 2025 (consumption priced). S3 Vectors went GA
  Dec 2025 at ~$0.06/GB-month, cutting vector store cost up to 90% vs alternatives:
  exactly the cheap, scalable lake + knowledge base pattern Yurt 8 uses.
- Autodesk Tandem: free to 1,000 tagged assets, ~$3,540/yr per 10,000 asset pack.
  Referenced as the "interesting but heavier" digital twin comparison.
- NVIDIA Omniverse pivoted developer first (Launcher deprecated Oct 2025); the
  Omniverse DSX Blueprint (GTC 2026) targets gigawatt scale AI factory digital twins.
  Note the resonance: Beacon Point's first hall was redesigned to NVIDIA's DSX
  reference architecture. OpenUSD Core Spec 1.0 shipped Dec 17, 2025.
- Procore REST API: OAuth 2.0, 3,600 requests/hour per token, free sandbox.

## The savings model math (kept deliberately conservative)

Hut 8 has 830 MW under construction at a guided $9M to $11M per MW: roughly $7.5B to
$9B of construction value in flight, consistent with the $7.5B of project bonds closed
in 2026. Benchmarks above say 3 to 5% of construction budget is lost to A/E error
driven change orders alone, and BIM driven clash detection has documented savings up
to 10% of contract value. Yurt 8 claims a fraction of a percent:

**Year 1 (ask: $350K all in)**
- Review watches roughly $400M of active construction value (a conservative slice of
  one campus while the tool stands up).
- Change orders and rework avoided: 0.75% of watched value = $3.0M (vs the 3 to 5%
  benchmark exposure; capture assumption is 15 to 25% of addressable).
- Third party design fees eliminated (test fits, sizing, non wet seal work): $0.6M.
- Schedule value from faster RFI resolution and early clash surfacing: $0.4M.
- **Total year 1 base case: $4.0M, about 11x the ask.**

**Year 2 (cost: ~$1.05M with 3 headcount)**
- Coverage grows to roughly $1.5B to $2B as River Bend and Beacon Point halls deliver
  through 2027 (both first halls land inside year 2 of this plan).
- Same capture logic at 0.5% of watched value = $8.0M, plus $1.0M fees, plus $1.0M
  schedule value.
- **Total year 2 base case: $10.0M, about 10x cost.**

Conservative / base / upside at year 2 scale: $6M / $10M / $20M+ (upside only requires
capturing ~1% of watched construction value, still one tenth of the CIFE documented
ceiling).
