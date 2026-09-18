# Testing Arcane Ledger

The tests protect the working character sheet before architectural changes. They exercise rules,
the mounted sheet, persistence, HTTP/database behavior, and browser workflows using synthetic
characters and isolated databases. Coverage includes refusal, recovery, cancellation, and reload
cases as well as successful interactions. This is not an exhaustive certification of every rule.

## Install and run

Use Node 22 for the same environment as CI. The harness also works with the repository's existing
Node 18.20 installation; the test dependencies are on compatible major versions. The frontend stays
on Vite 5 in this pass.

From the repository root:

```sh
npm ci
npm ci --prefix app
npm ci --prefix server
cd app
PLAYWRIGHT_BROWSERS_PATH=../.cache/playwright npx playwright install chromium
cd ..
npm test
npm run test:e2e
npm run test:types
npm run lint
npm --prefix app run build
npm --prefix server run build
```

On Linux, install browser system dependencies with `npx playwright install --with-deps chromium` from
`app`, using the same `PLAYWRIGHT_BROWSERS_PATH`. Browser binaries live in the ignored `.cache` folder.
The first backend run downloads MongoDB 7.0.14 there too. Internet access is required for these initial
downloads. Backend and browser tests require permission to launch local processes and listen on ports.
Browser test servers use `127.0.0.1:4175` and `127.0.0.1:4176`; they refuse to reuse an existing server.

Useful narrower commands:

```sh
npm --prefix app test -- tests/integration/persistence.test.tsx
npm --prefix app run test:watch
npm --prefix app run test:coverage
npm --prefix server test
npm --prefix app run test:e2e -- --project=desktop
npm --prefix app run test:e2e -- --project=mobile
```

`npm test` includes real backend/database integration tests, not browser tests. `npm run test:e2e`
runs the browser journeys on desktop Chromium and a Chromium phone viewport with touch enabled.
This is mobile-layout coverage, not a claim about Safari or every physical phone.

## Layers and coverage

| Layer                  | Location                                    | What it protects                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules                  | `app/tests/rules/`                          | Spell progression, preparation capacity and always-prepared grants; free casting and slot costs; proficiency sources, expertise and ability modifiers; concentration, resources/rests, equipment, feat prerequisites/choices, companions and contributions              |
| Content contracts      | `app/tests/rules/class-progression.test.ts` | Every registered subclass at level boundaries: normalization/save/load, unlocked features, action IDs and valid slot totals. New codex subclasses enter this matrix automatically. This does not prove each unique mechanic is implemented correctly.                   |
| React + persistence    | `app/tests/integration/`                    | The real sheet and independent section invalidation; feat editing and sourced benefits; health/rest controls; rapid edits and delayed HP; storage failures; real cloud-opening resolution with controlled transport; navigation, lifecycle flushes and session clearing |
| Backend HTTP + MongoDB | `server/tests/characters.test.ts`           | Cookie authentication, ownership, imports, durable nested sheet state, sequential stale revisions, competing saves and deletion. The competing-save regression currently exposes a product defect; see below.                                                           |
| Shared inventory rules | `server/tests/master-chest.test.ts`         | Conservation during transfers, insufficient balances, invalid batches and GM/player boundaries                                                                                                                                                                          |
| Browser journeys       | `app/e2e/`                                  | Player interactions on desktop/mobile, local persistence, real login and cloud save retrieval; see the named scenarios in the suite                                                                                                                                     |

Fixtures live in `fixtures/characters/` and `app/tests/fixtures/`. The common saved sheet is deliberately
plain JSON so the server tests do not import the frontend runtime. Each test gets a fresh copy.

The root `AGENTS.md` contains the working agreements. This document owns test-specific setup details.

### Character-sheet workflows

The browser suite runs each scenario on both desktop and mobile. Its coverage includes:

- Profile validation, cancelled edits, rename and notes; ability edits updating AC and skills.
- HP damage/healing, inspiration, selective long-rest recovery, class charges and short rests.
- Round resource spending, reload, next-round recovery and ending combat.
- Manual expertise, automatic proficiency floors, and Skill Expert's required choices and removal.
- Adding/removing Tough with derived HP updates, and refusal of feats with unmet prerequisites.
- Equipping/removing armor and updating AC, currency edits, and durable inventory state.
- Creating, duplicating and deleting companions, including cancellation and retained HP.
- Wizard spellbook/prepared-list edits and preparation-capacity refusal/recovery.
- Always-prepared domain spells remaining selected without entering the manual prepared list, and
  consuming a spell slot when cast.
- Exhausted spell-slot refusal, Magic Initiate free-use spending and long-rest recovery, ritual
  casting without another slot, and replacement/ending of concentration with linked effects.
- Local roster persistence and real cookie login/cloud save retrieval through the local API.

`sheet-sections.test.tsx` mounts `CharacterSheetPage` with the real Redux store and persistence.
It changes one domain at a time while retaining unrelated object references, checking the rendered
HP, skill modifier, AC, spellcasting visibility and companion visibility. This detects missing
cross-section invalidation that a combined profile/resource edit can hide.

The progression matrix is a content contract. Specific action/option unlock expectations and
full slot-array expectations supplement it so empty arrays cannot satisfy all the checks. It does
not replace tests of each subclass's individual mechanics. Repeated rules and browser assertions
serve different purposes: numerical edge cases belong in rules tests; browser tests verify controls,
wiring, persistence and visible results.

## Isolation and reliability

- Backend tests always spawn their own MongoDB process, connect directly to that generated URI, and
  tear it down. The test harness does not accept an existing database URI. No database-wide cleanup is
  run against an externally supplied server.
- `NODE_ENV=test` prevents server `.env` loading. The harness sets synthetic auth configuration and
  disables external email/storage/observability credentials. Frontend test configurations use a
  fixture environment directory instead of developer `.env` files.
- Cloud browser tests use the real local API and cookie login. Other browser journeys use guest
  characters in isolated browser contexts. Outbound browser requests to non-local hosts are blocked.
- The unit/component setup replaces observability and outbound fetch, not the game rules. Persistence
  hook tests replace the asynchronous opening boundary so response ordering and failure are controlled;
  they retain the real Redux store, character normalization and local storage. Separate cloud-opening
  integration tests use the actual resolver and storage while controlling only the API transport.
- The frontend has an existing cyclic runtime import graph. The Vitest setup initializes the public
  feat-runtime barrel first because Vite's server-side export-star evaluation otherwise exposes partial
  cyclic exports. These tests do not assert that arbitrary runtime leaf import orders are supported.
  Browser journeys exercise the actual browser module graph.
- Local-storage modules cache data in memory. Clear their exported cache APIs between tests; clearing
  `localStorage` alone is insufficient. Reset Redux state and session-expiry markers where used.
- Use fake timers for persistence races. Use user-facing roles/labels and observable completion in
  browser tests, not CSS class names or fixed sleeps. Random dice totals should be controlled or checked
  against valid bounds rather than asserted as a particular random result.
- Browser service workers are disabled for deterministic journeys. PWA installation/update/offline
  cache behavior needs a separate production-build suite and is not covered by these tests.

## Adding a feature or fixing a bug

Start with a scenario that fails for the missing/broken behavior. Keep rules tests small, then add an
interaction test when controls or cross-section updates matter. Add a browser journey for a new major
player flow, not for every wrapper function. A subclass with unique mechanics needs specific expected
outcomes in addition to the automatic progression matrix.

Test successful use, refusal when resources/choices are invalid, recovery, and persistence where
applicable. Avoid giant snapshots, tests that reproduce the implementation algorithm, and mocking all
of a feature's dependencies. Include a negative assertion when a rule must preserve something—for
example, a ritual cast must leave spell slots unchanged.

No blanket coverage percentage is imposed. The optional frontend coverage report includes character
page logic, sheet components (including TSX), background character synchronization, and the active
sheet store. It measures the Vitest suite, not browser journeys. The broader denominator deliberately
exposes untouched UI and synchronization code rather than reporting rules-only coverage as sheet
coverage. A high line count is not evidence of correct gameplay. Remaining areas include exhaustive
subclass/feat combinations, multiplayer chest HTTP
races, GM encounter flows, real email/image upload services, other browser engines, visual snapshots,
service-worker behavior, and exhaustive dice/spell-effect execution paths.

### Known failing regression: simultaneous cloud saves

`server/tests/characters.test.ts` contains `only one competing save can commit the same base revision`.
Two authenticated requests submit different HP values with the same base revision. Both must read
the same starting document; the test synchronizes those real MongoDB reads, leaving the real HTTP
handler and database writes intact. Exactly one request should succeed and the other should receive
409, with the winning sheet durably stored and the revision incremented once.

The current implementation returns 200 for both requests. Its revision check and save are separate,
allowing a lost update. This ordinary regression test intentionally remains failing; it is neither
skipped nor marked as an expected failure. The tests-only expansion does not change production save
behavior. Run `npm --prefix server test -- tests/characters.test.ts` to reproduce it in the disposable
test database. `npm test` will remain red until the production race is fixed.

## CI and failures

`.github/workflows/tests.yml` runs lint, test type checks, both test suites, both builds, and browser
journeys on pull requests and pushes to `main`. This workflow does not deploy. Configure branch
protection in GitHub if merges must require its success; adding a workflow alone does not enforce that.

Browser failures retain screenshots and Playwright traces under `app/test-results/`, with a report in
`app/playwright-report/`. CI uploads them on failure. From `app/`, open a local report with
`npx playwright show-report` or inspect a trace with Playwright's trace viewer.
Automatic retries are disabled so a flaky failure stays visible.
