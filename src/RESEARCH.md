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

## The savings model math (synthesis agent output, adopted)

Scale anchor, two ways that agree:
- 830 MW under construction x $9M to $11M per MW guided = $7.5B to $9.1B (midpoint
  ~$8.3B).
- Project bonds actually closed in 2026 = $7.5B ($3.25B River Bend + $4.25B Beacon
  Point) at up to 85% loan to cost, implying a program of $8.8B or more.
Delivery is compressed into the plan window: Beacon Point energization Q1 2027, first
halls at both campuses through 2027, so most of this spend flows during years 1 and 2.

Honesty adjustment baked in: Jacobs is EPCM lead at River Bend and Hut 8 runs a
partnership driven model with Tier 1 partners who already use BIM. Yurt 8 is an owner
side overlay arriving mid flight, so capture rates claim only a single digit to mid
teens share of the benchmark defect pool, never the full CIFE ceiling.

Three savings components:
- **A. Change order / rework avoidance.** Pool: 3 to 5% of construction budget from
  A/E errors (AIA); ~5 to 9% rework (Navigant/CII). Conservative $2.1B touched x 3%
  pool x 3% capture = $1.9M. Base $3.3B x 4% x 8% = $10.6M. Upside $4.6B x 5% x 15% =
  $34.5M.
- **B. Design fee reduction via templated reference design.** Next campus design fees
  ~$22.5M in year 1 at the 2.5% large project rate; reuse captures $0 conservative,
  $2.3M base, $5.6M upside. (Hut 8's own DSX redesign, +57% capacity in the same
  footprint, proves design iteration value internally.)
- **C. Schedule value as interest carry, not phantom revenue.** $7.5B of notes at
  ~6.16% blended = about $1.27M per day at full draw. Base: 5 protected days on
  average draw = $3.2M. Upside adds NOI pull forward on an early data hall.

| Case | Year 1 | Year 2 |
|---|---|---|
| Conservative | ~$2.2M | ~$5.5M |
| Base | ~$16M | ~$39M |
| Upside | ~$57M | ~$130M |
| **Pitched in deliverables** | **$4.0M** | **$10.0M** |

Verdict adopted in the deliverables: the $4M / $10M claims sit between conservative
and base, so they are pitched as the conservative case with the base math shown
($8M to $16M year 1 on the same benchmarks). ROI at the $2.2M floor is still ~6x the
$350K ask; the DBIA precedent ($200K VDC spend returning $2.5M+) independently
supports the floor. Caveats carried into the copy: Tier 1 partners already run BIM
(owner side residual only); some savings accrue inside non recourse project SPVs;
schedule value is carry avoidance and risk reduction.
