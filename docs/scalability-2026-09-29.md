# Deep scalability pass — 29 September 2026

## Baseline and scope

The baseline is the working tree at the start of this pass, including the preceding quality
improvements. Comparisons are not against Git HEAD. The starting source/tests were preserved in a
local archive and measured in a disposable copy with the same installed dependencies. Previous
changes, public compatibility exports, saved-sheet formats, and action/source IDs were retained.

This pass improves the existing extension mechanisms. It adds no gameplay features, rule language,
framework, runner, or asynchronous content-loading requirement. It keeps section dependencies and
full normalization boundaries intact. The main runtime gain comes from sharing immutable class
views, compiled contributions, and transformed spell objects across existing consumers.

## Review order and consolidation families

The batches below describe the implementation and review boundaries. Changes remain in the working
tree; these are not claims of separate commits. Each later batch depends on the earlier helpers.

| Batch                       | Changes to review                                                                                                                              | Verified parallels consolidated                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Baseline protection      | `app/tests/rules/runtime-transforms.test.ts`, existing selectors/resources/contributions/feat draft tests, performance harness                 | Public/runtime spell behavior, secondary Wizard, real weapon references, source removal, saved resources and selection identity                                                                                                                                                                                                             |
| 2. Pure helpers             | `codex/progression.ts`, `codex/subclasses/featureRow.ts`, `CharactersPage/shared/`, `classFeatures/shared/resourceState.ts`                    | 13 subclass row constructors; 22 progression lookups; 14 unlock scans; 26 description section extractors; 4 ability arithmetic variants; 361 matching immutable class-state writers                                                                                                                                                         |
| 3. Runtime/descriptions     | `characterRuntime/classContexts.ts`, `spellEntryTransformer.ts`, `featureContributions/compiler.ts`, runtime callers                           | One public/snapshot transform chain; separate casting/book caches; 79 class/subclass compile call sites; indexed description queries; one complete feat compilation per cached derived context                                                                                                                                              |
| 4. Features and UI          | Class `module.ts` files, `feats/runtime/contributions/`, choice definitions, `ActionsWidget/uiAdapters/`, nested drawers, monster picker hooks | 14 class-owned registrations; 51 keyed benefit builders (21 using the identical bonus factory), 11 spell-grant builders, 2 status builders; 26 ability-choice families and the 2-cantrip pair; 5 spell-grant loops; 40 feat state transitions; 13 usage projections; 5 Paladin fallback activations; 28 guarded action-resource transitions |
| 4. UI continuation          | Shared action definitions/dice footer, `formDrafts.ts`, owning UI adapters                                                                     | 39 existing form discriminants; 63 body/footer renderers; 29 submission handlers; 24 matching initialization/reset values; 2 identical dice footers; 5 nested-reference hosts; 2 monster browsers                                                                                                                                           |
| 5. Server/import boundaries | `server/src/utils/queryValues.ts`, `dmToolLimits.ts`, service callers, leaf imports                                                            | 4 single-value readers, 2 string-list readers, 2 positive-integer parsers, 2 optional-string normalizers; 6 retention queries; aggregate imports redirected to existing read-only leaves; copied unused imports/suppressions removed                                                                                                        |
| 6. Final verification       | Existing lint/types/tests/builds/browser harnesses, production/offline profiling, this report                                                  | Results and limitations below                                                                                                                                                                                                                                                                                                               |

Counts describe migrated call sites or families, not a quality score. A shared immutable writer is
not a generic implementation of every class rule. Eligibility, payment, duration, ownership,
specialized reset behavior, spell execution and recovery remain with their existing owners.
The legacy action-host context bag is still broad; typed form discriminants now select local
adapters, but this pass does not claim that every context field became strictly typed.

## Behavior protected

- Ordinary spell transformation remains cantrip scaling → class → subclass → feat → species.
  Spellbook mode stays separate; a secondary Wizard now gets the same book behavior through the
  public helper and runtime snapshot. Source spell identity distinguishes custom records sharing an ID.
- Description indexes retain collection order, exact keys, wildcard entries, predicate IDs and
  distinct sources. Dynamic description factories still receive their query context. Tests exercise
  actual spell and weapon consumers, repeated application, source removal and immutable codex entries.
- Full normalized character updates still refresh dependent sheet values and already-open drawers.
  Existing selector tests additionally check unrelated selection identity. No dependency list was
  narrowed to obtain the performance results.
- Class and feat state remain the resource authority. Paladin capstone activation spends the ordinary
  use first, rejects repeated activation while active, supports fallback slots, and survives reload.
  Mage Slayer and Telepathic spent-use flags explicitly survive ability-choice normalization and save/load.
- Camp recovery stays explicit. Existing tests cover selective recovery, resource exhaustion,
  concentration replacement/removal and timed status persistence. New focused cases supplement those
  scenarios instead of duplicating all of them.
- Nested references keep their existing lazy boundaries, Escape priority and host behavior. Monster
  preview and selection requests reject stale/canceled results and reuse cached offline records;
  account/scope ownership is tested with deliberately delayed responses.
- Server extraction preserves error construction, owner predicates, oldest-first ordering, limits,
  revision guards and database workflow boundaries. It does not claim new multi-document atomicity.

## Measurements

Measurement results are recorded separately for bundles, runtime work, browser interactions, render
counts and risk coverage. They must not be added into an overall improvement percentage.

The machine-readable [measurement record](measurements/scalability-2026-09-29.json) includes means,
medians, sample counts, relative margins of error, section commit counts and baseline identity.
Measurements used the same local machine and installed dependencies. Runtime benchmarks ran
sequentially without other tests/builds; browser interaction comparisons used three runs per fixture.

### Production assets

Both builds use the same production configuration and public environment. The reproduced baseline
has exactly the original raw byte counts; gzip sizes vary slightly with generated build IDs/hashes.
Totals exclude diagnostic source maps and include lazy chunks, service-worker code and copied assets.
Gzip values sum individually compressed files, not a compressed archive.

| Asset boundary                                 | Before (bytes) | After (bytes) |           Change |
| ---------------------------------------------- | -------------: | ------------: | ---------------: |
| All JavaScript                                 |      5,846,991 |     5,794,807 | -52,184 (-0.89%) |
| All JavaScript, gzip                           |      1,568,445 |     1,562,665 |  -5,780 (-0.37%) |
| All CSS                                        |        579,057 |       579,057 |      +0 (+0.00%) |
| All CSS, gzip                                  |        127,214 |       127,118 |     -96 (-0.08%) |
| Other assets                                   |      3,627,720 |     3,627,720 |      +0 (+0.00%) |
| All production assets                          |     10,053,768 |    10,001,584 | -52,184 (-0.52%) |
| All production assets, gzip                    |      5,317,199 |     5,311,322 |  -5,877 (-0.11%) |
| HTML-linked initial JS/CSS                     |        510,724 |       510,633 |     -91 (-0.02%) |
| HTML-linked initial JS/CSS, gzip               |        154,955 |       154,904 |     -51 (-0.03%) |
| Observed single-class sheet route JS/CSS       |      5,730,630 |     5,687,006 | -43,624 (-0.76%) |
| Observed single-class sheet route JS/CSS, gzip |      1,472,233 |     1,468,996 |  -3,237 (-0.22%) |

The initial sheet route used 128 script/link assets before and 127 after. Its asset set was observed
in Chromium after the sheet became usable, then measured directly from the corresponding build
files so service-worker/network cache races do not distort compressed totals. This excludes
background precache requests and images/fonts loaded later. The multiclass fixture shows the same
43,624-byte raw reduction (gzip reduction 3,234 bytes). HTML-linked initial loading is effectively
unchanged; these measurements do not claim a large startup reduction.

### Runtime derivation

The benchmark forces abilities, all lazy combat-summary fields, equipment, spellcasting and a
transformed cantrip. Fixtures are a level-10 Evoker and Fighter 2 / Wizard 6 / Ranger 3 with a feat.
Edits use the existing normalization and equipment transitions. Casting here means the expended-slot
update and dependent derivation; actual browser casting is measured separately. These are local
CPU measurements, not server response times or a promise for every character.

| Fixture / operation                                | Before mean (ms) | After mean (ms) |
| -------------------------------------------------- | ---------------: | --------------: |
| single / warm sheet derivation                     |            0.042 |           0.007 |
| single / new snapshot derivation                   |           13.479 |          13.496 |
| single / ability edit and dependent derivation     |           15.600 |          16.463 |
| single / HP-only edit and dependent derivation     |           12.487 |          12.422 |
| single / equip armor and dependent derivation      |           12.931 |          12.448 |
| single / cast update and dependent derivation      |           13.935 |          14.401 |
| single / rest and dependent derivation             |           12.496 |          12.569 |
| single / repeated spell drawer projection          |            0.678 |          <0.001 |
| multiclass / warm sheet derivation                 |            0.039 |           0.007 |
| multiclass / new snapshot derivation               |           87.070 |          13.160 |
| multiclass / ability edit and dependent derivation |           95.738 |          20.571 |
| multiclass / HP-only edit and dependent derivation |           86.858 |          13.429 |
| multiclass / equip armor and dependent derivation  |           95.170 |          22.114 |
| multiclass / cast update and dependent derivation  |           93.423 |          19.363 |
| multiclass / rest and dependent derivation         |           87.497 |          12.884 |
| multiclass / repeated spell drawer projection      |            0.648 |          <0.001 |

The larger multiclass gain comes from sharing read-only class projections within the immutable
snapshot. Single-class cold/edit work is approximately unchanged; warm reads and repeat spell
projections benefit from cached results. A drawer-projection sample makes 20 repeated calls; its
sub-microsecond result is a warm-cache measurement, not the time to open the UI.

With 100 synthetic contributions, 20 targeted description lookups fell from roughly 0.029 ms to
0.006 ms. Compilation stayed around 0.076–0.077 ms. At 25 contributions, the lookup sample changed
from roughly 0.011 ms to 0.006 ms. These cases scale contribution lookup work, not every possible
subclass mechanic.

No final runtime case regressed by both 10% and 2 ms. An earlier short-run casting outlier prompted
the longer minimum-duration/sample-count run; it did not persist (13.935 → 14.401 ms).

### Browser interactions and recomputation

Values below are medians of three development-browser journeys. They include Playwright
input/actionability/protocol overhead and browser scheduling, but exclude the explicit settling
window. The source copies enabled the existing profiler; production source keeps it disabled.

| Interaction       | Single before → after (ms) | Multiclass before → after (ms) |
| ----------------- | -------------------------: | -----------------------------: |
| ability save      |               126.9 → 99.6 |                  215.9 → 126.8 |
| HP damage         |                16.2 → 25.3 |                    24.6 → 20.5 |
| equip armor       |               118.1 → 80.9 |                  196.4 → 101.4 |
| open spell drawer |                29.9 → 31.5 |                    38.7 → 25.2 |
| cast spell        |               127.8 → 96.2 |                  211.8 → 104.0 |
| long rest         |                83.7 → 71.6 |                   158.1 → 80.4 |

The HP automation wall-time increase was investigated directly. A pointer-to-visible-value probe
measured medians of **2.0 → 2.2 ms** across three additional runs, while isolated HP derivation was
12.487 → 12.422 ms. The larger wall-time difference is outside that visible update. This is not a
reproducible application-work regression meeting both acceptance thresholds.

Render counts are largely preserved, rather than reduced by narrower invalidation. For ability
save, equipping, casting and rest, the existing runtime profiler recorded 14 measures in the
single-class fixture and 21 in the multiclass fixture, before and after. HP records include delayed
persistence (15–16 single-class / 22–23 multiclass measures). Opening the spell drawer recorded zero
sheet runtime measures and two spellcasting-section commits in both versions.

Most top-level sections committed once per persisted edit; gameplay committed twice and the
features section twice for an ability save. HP produced additional gameplay commits around its
queued persistence. The JSON records each section's three observed counts. Parent/child profiler
counts overlap, and runtime measures may be nested: neither should be summed into a global render
count or user-visible latency. Unrelated selector identity is protected separately by rule tests.

### Coverage and risk cases

| Vitest coverage boundary | Before |  After |
| ------------------------ | -----: | -----: |
| Lines                    | 47.23% | 49.28% |
| Branches                 | 63.62% | 64.66% |
| Functions                | 47.27% | 47.99% |

The configured denominator covers character page logic, sheet components, synchronization, and the
active sheet store. It is not full-repository coverage and does not include Playwright execution.
Lines measured changed from 195,378 to 191,342; covered lines changed from 92,294 to 94,309.
Both consolidation and focused scenarios contribute to the percentage increase.

Frontend cases increased from 448 in 35 files to 464 in 37 files. The 16 additions target public and
runtime parity, real description consumers, five distinct capstone registrations/payment policies,
resource save/reload, cantrip choice/grant wiring, and stale/offline monster lifecycle behavior.
Existing ability/HP/status/inventory/open-drawer, concentration, persistence and selective-rest
scenarios were reused. The progression matrix remains a content contract, not evidence that every
subclass combination works. No new runner or cosmetic snapshot suite was added.

## Final verification

- Root lint: passed without warnings.
- Root test type checks: passed.
- Root `npm test`: 464 frontend tests / 37 files and 50 backend tests / 5 files passed.
- Frontend and backend production builds: passed.
- Optional frontend V8 coverage: all 464 tests passed.
- Desktop/mobile browser journeys: 158 passed in 15.0 minutes; one intentional mobile skip for the
  broad-layout/breakpoint test covered on desktop. No failures.
- Production Chromium checks: both synthetic single-class and multiclass fixtures passed with the
  real service worker. Ability/armor persistence survived offline reload, and a spell cast offline
  established concentration. The same baseline journeys passed; no page errors were observed.
- `git diff --check`: passed.

The production check accounts for the prompt-mode worker taking control on the navigation after
first installation. It does not alter the app's worker/update policy. Browser journeys use isolated
local API/MongoDB services, synthetic accounts and data. The offline probe blocks non-local requests.
The initial browser run was deliberately discarded after source editing interrupted module loading;
the final run uses frozen application source.

## Boundaries retained

This is not exhaustive verification of every subclass/feat combination, browser engine, or PWA
update race. The action-host context still has legacy broad typing. Full normalization may still
cause unrelated section commits during persistence; changing that boundary requires equivalent
behavior evidence. No database atomicity claims or external-service guarantees were added.

Use [the authoring guide](feature-authoring.md) for concrete subclass/feat examples and
[the testing guide](testing.md) for reproducible commands and isolation details.
