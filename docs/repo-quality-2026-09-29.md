# Repository quality improvements — 29 September 2026

Baseline: clean commit `84d5447f6c9a7740001b8a3cb48a5139ed33d732`, Node 18.20.8, existing
dependency lockfiles. No dependencies or test runners were added. The approximate 20% objective
guided selection; percentages below describe different measurements and should not be added.

## Changes

- **Reusable resources:** ten resource widgets now share `ClassResourceWidgets` and a typed
  presentation registry. All capacities, spending, and recovery still call the existing class
  runtime. Labels, ordering, dice suffixes, persistence options, and profiler identifiers remain
  the same. Widget implementations shrink from 580 to 222 lines (61.7%), including the registry.
- **Shared spell sources:** 534 repeated source declarations use two definitions in
  `codex/spells/sources.ts`. Spell-specific keys and exceptional source metadata are preserved.
  A complete before/after deep comparison of all 560 spell records passed, including descriptions,
  identifiers, attribution, and mechanics.
- **Lighter startup dependencies:** `multiclassState.ts` owns state reading and projections;
  `multiclass.ts` retains the public exports and class-editing transition. Storage and display
  helpers import state and constants directly, avoiding eager imports of class-effect editing and
  the codex catalog. Sentry's supported debug build flag removes SDK diagnostic logging while
  retaining error reporting. Lazy chunks remain in the PWA precache.
- **Safer synchronization:** a session guard invalidates pending work on logout, account changes,
  and unmount. Initialization commits the roster only after checking that guard. Result merging
  is isolated in `characterSyncResult.ts` and preserves queued deletion and newer local edits.
  Active-sheet adoption checks current Redux state, preventing navigation rollback and loss of
  edits awaiting local persistence. Queued synchronization waits for an existing upload and then
  rechecks current state, allowing a pending deletion to proceed.

## Measurements

Production files are counted once, including lazy chunks and service-worker files; source maps
are excluded. Gzip totals sum independently compressed JavaScript files, using Node's default
gzip settings. Main-entry baseline values below are rounded from Vite's build report.

| Measurement                             |       Before |        After |                  Change |
| --------------------------------------- | -----------: | -----------: | ----------------------: |
| Main entry JavaScript                   | ~1,774,510 B |    457,127 B |           74.2% smaller |
| Main entry JavaScript, gzip             |   ~426,630 B |    144,076 B |           66.2% smaller |
| All JavaScript                          |  5,930,035 B |  5,846,991 B |           1.40% smaller |
| All JavaScript, gzip                    |  1,571,296 B |  1,568,621 B |           0.17% smaller |
| CSS                                     |    579,057 B |    579,057 B |               unchanged |
| Complete dist output                    | 10,136,812 B | 10,053,768 B |           0.82% smaller |
| Scoped frontend line coverage           |       47.08% |       47.23% | +0.15 percentage points |
| Scoped frontend branch coverage         |       63.48% |       63.62% | +0.14 percentage points |
| Synchronization directory line coverage |       52.95% |       57.91% | +4.96 percentage points |
| Frontend behavior cases                 |          438 |          448 |    10 focused additions |

The startup reduction moves required code behind existing loading boundaries; it does not
represent a 74% reduction in the full application. Repeated source text already compressed well,
so the total gzip reduction is modest. No response-time or device-performance speedup is claimed.
Coverage uses the unchanged Vitest include patterns, not the entire repository or browser runs.
The coverage denominator also changes with consolidation; test value is supported by observable
failure cases, not just percentage increases.

## Test quality and verification

The existing suite largely tests rules, persistence, and user interactions. Broad class matrices
remain useful compatibility checks, but are not proof of every subclass mechanic. The existing
Bigby's Hand content test was strengthened to associate rules with their named effects instead
of finding keywords anywhere in the description. The new resource scenario checks actual
spending, limits, independent pools, recovery, and save/load rather than component presence.

The first race-test run reproduced five failing scenarios in the original synchronization code:
late initialization after logout and account switching, upload success and failure after local
deletion, and an upload switching the active sheet back. All now pass, alongside the existing
newer-edit, conflict, and retry checks. Additional checks protect unpersisted edits and
same-account logout/login. The shared harness and coverage scope were retained.

- Frontend Vitest with coverage: 448 cases passed in 35 files.
- Backend HTTP/database tests: 50 cases passed in 5 files, using disposable MongoDB.
- Root lint, frontend/backend test type checks, and both production builds passed.
- Compiled-output Chromium check passed: login requests no class catalog or character runtime
  chunks; the spell browser and synthetic character damage/save/reload work with no page errors.
  Non-local requests and service workers were blocked.
- Full desktop/mobile browser suite: 158 passed, one intentional mobile skip (16.2 minutes).

Reproduce build measurements with:

```sh
npm --prefix app run build
npm --prefix app run bundle:report
```

See [testing.md](testing.md) for test commands and isolation. Vite still warns about large
gameplay/catalog chunks. The ordinary browser suite disables service workers; it does not
certify PWA install/update/offline behavior. Force-conflict resolution, claiming/importing, and
all combinations of account changes and competing edits are not exhaustively tested.
