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
Explicit viewport sweeps carry the `@layout` tag and run only in the desktop project, where they
set their own phone/tablet/desktop widths. Functional journeys still run in both projects.
This is mobile-layout coverage, not a claim about Safari or every physical phone.

## Layers and coverage

| Layer                         | Location                                    | What it protects                                                                                                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules                         | `app/tests/rules/`                          | Spell progression, preparation capacity and always-prepared grants; free casting and slot costs; proficiency sources, expertise and ability modifiers; concentration, resources/rests, equipment, feat prerequisites/choices, companions and contributions              |
| Content contracts             | `app/tests/rules/class-progression.test.ts` | Every registered subclass at level boundaries: normalization/save/load, unlocked features, action IDs and valid slot totals. New codex subclasses enter this matrix automatically. This does not prove each unique mechanic is implemented correctly.                   |
| React + persistence           | `app/tests/integration/`                    | The real sheet and independent section invalidation; feat editing and sourced benefits; health/rest controls; rapid edits and delayed HP; storage failures; real cloud-opening resolution with controlled transport; navigation, lifecycle flushes and session clearing |
| Backend HTTP + MongoDB        | `server/tests/characters.test.ts`           | Cookie authentication, ownership, imports, durable nested sheet state, sequential stale revisions, competing saves and deletion. Competing saves must produce one winner and one revision conflict; see below.                                                          |
| Shared inventory rules + HTTP | `server/tests/master-chest*.test.ts`        | Conservation, insufficient balances, invalid batches and GM/player boundaries; real HTTP/MongoDB replay, competing withdrawals and compensation after revision conflicts                                                                                                |
| Browser journeys              | `app/e2e/`                                  | Player interactions on desktop/mobile, local persistence, real login and cloud save retrieval; see the named scenarios in the suite                                                                                                                                     |

Fixtures live in `fixtures/characters/` and `app/tests/fixtures/`. The common saved sheet is deliberately
plain JSON so the server tests do not import the frontend runtime. Each test gets a fresh copy.

The root `AGENTS.md` contains the working agreements. This document owns test-specific setup details.

### Character-sheet workflows

HP coverage checks automatic totals after class declaration, level reallocation, Hit Die overrides,
and reload, with Tough and Aid kept separate from base HP. Both single-class and multiclass
calculations and editor ranges apply a minimum gain of 1 HP per level, including low Constitution.

The shared effects editor offers numerical values from 0 through 30. Its six HARD SET ability-score
targets accept only integers in that range and have no buff/debuff or roll modes. The highest active
hard-set value replaces the final score, including ordinary score bonuses and penalties; zero is a
valid override. Saved base scores remain intact, and direct modifier, skill, and saving-throw bonuses
still apply. Removing the winning source reveals the next override or the ordinary score.

`hard-set-effects.test.ts` covers precedence, all six abilities, item activation, custom actions,
disabled/expired traits, malformed values, and portable persistence. `effect-editor.test.tsx` covers
the shared controls and draft round trips; `sheet-sections.test.tsx` covers inventory-only and
status-only updates to scores, skills, an open spell drawer, and carrying capacity.
`hard-set-effects.spec.ts` exercises creation, dice-to-hard-set switching, editing, reload, and removal
at both boundaries (0 and 30) on desktop and mobile.

`app/tests/rules/spell-catalog.test.ts` covers the 33 retired spells, their absence from
lookup and class choices, removal of their summon configurations, and filtering saved
preparation, spellbook, and cantrip selections without consuming selection capacity.
Other demon summoning spells remain available.

Read-only GM/admin inspection is covered by `character-inspection.test.ts` on the server,
`character-inspection.test.tsx` in frontend integration tests, and `character-inspection.spec.ts`
in the desktop/mobile browser suite. The browser harness seeds separate synthetic owner, GM,
and admin accounts in its disposable database. See [Character inspection](character-inspection.md)
for access boundaries and interaction coverage.

Functional browser journeys run on desktop and mobile; tagged viewport sweeps run once across their
explicit widths. Coverage includes:

- Profile validation, cancelled edits, rename and notes; ability edits updating AC and skills.
- HP damage/healing, inspiration, selective long-rest recovery, class charges and short rests.
- Round resource spending, reload, next-round recovery and ending combat.
- Manual expertise, automatic proficiency floors, and Skill Expert's required choices and removal.
- Adding/removing Tough with derived HP updates, and refusal of feats with unmet prerequisites.
- Equipping/removing armor and updating AC, currency edits, and durable inventory state.
- Creating, duplicating and deleting companions, including cancellation and retained HP.
- Wizard spellbook/prepared-list edits and preparation-capacity refusal/recovery.
- The Spellcasting thumb button on xs/sm screens: a vertical pill centered above the dice button,
  stacked sparkles/double-chevron icons, a 128px offscreen reveal buffer, remaining visible until
  clicked or Spellcasting enters view, scrolling and keyboard focus in both themes, reduced motion,
  breakpoint transitions, non-caster absence, and continued quick-dice operation.
- Always-prepared domain spells remaining selected without entering the manual prepared list, and
  consuming a spell slot when cast.
- Warrior of the Elements displaying Elementalism once, retaining casting and reload behavior;
  Diviner Portent ready/used cards adapting to dark mode and preserving recorded rolls.
- Action drawer headers preserving room for the title and source from 320px through desktop,
  with Moonlight Step charges and alternative costs wrapping below the heading on phones,
  no horizontal overflow, and an accessible close button at the top right.
- Rogue Cunning Strike option text retaining dark-mode contrast before and after selection, with
  theme-aware damage formulas and dice-spent labels and unchanged effect selection behavior.
- Exhausted spell-slot refusal, Magic Initiate free-use spending and long-rest recovery, ritual
  casting without another slot, and replacement/ending of concentration with linked effects.
- Local roster persistence and real cookie login/cloud save retrieval through the local API.
- The roster Join Party Group button staying compact beside the Characters heading from 320px through
  desktop, with matching button font size and padding, a 44px touch target, and its full
  accessible name on small screens.
- Top and bottom compendium/administration pagination staying synchronized, and administration
  defaulting to recent activity with green sort arrows beside their labels in light and dark mode.
  These list browser tests use synthetic API responses; the backend administration tests separately
  check actual database ordering, including accounts with no recorded activity.
- Custom spell, item, and bestiary description edits retaining spaces, indentation, and blank lines
  through save, preview, and reload against the isolated local API. Component tests also cover
  supported item emphasis and ensure executable markup remains inert in all three renderers.
- GM Tools tabs showing icons with only the selected label below 600px, retaining accessible
  names, touching tabs in one horizontally scrollable row without vertical overflow and with
  44px minimum widths at 320px,
  and restoring all labels at 600px.
- Campaign action buttons shortening to Import, Create, and Add below 600px while preserving
  their icons and the Player Visibility Settings label; full labels return at 600px.
- Signed-in account identity filling the header width when stacked below Your Account through
  760px, while preserving the side-by-side desktop layout and visible logout control.
- Touch swipes dismissing top toasts upward and bottom toasts downward. Component tests cover
  all six positions, short/wrong-direction/horizontal drags, cancellation, secondary touches,
  mouse input, post-drag click suppression, and automatic dismissal. Browser tests cover physical
  touch events, whole-toast click/keyboard dismissal, and hover feedback.

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
  `cloud-upload.test.tsx` mounts the real sync coordinator and controls API responses to cover edits
  during uploads, transient failure/retry, and revision conflicts without automatic overwrite.
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

## Maintaining and extending tests

Follow the test-scope rule in [AGENTS.md](../AGENTS.md): routine code work uses existing tests;
it does not automatically add regression cases. New cases require explicit user approval or an
agreed scope during new-feature design in Plan mode. An explicit testing-improvement request
supplies approval for focused additions. Running tests and repairing or consolidating existing
assertions do not require a separate approval step.

Prefer strengthening an existing behavior test over adding another one. For approved additions,
choose a few concrete risks such as lost edits, double transfers, authorization failures, or failed
recovery. Keep numerical edge cases in rules tests and use browser tests for behavior that needs a
real browser. Avoid checking the same copy or cosmetic value at multiple layers. A content matrix
checks consistency; it is not a substitute for an independent expected outcome when a mechanic is
in the agreed test scope.

No blanket coverage percentage is imposed. The optional frontend coverage report includes character
page logic, sheet components (including TSX), background character synchronization, and the active
sheet store. It measures the Vitest suite, not browser journeys. The broader denominator deliberately
exposes untouched UI and synchronization code rather than reporting rules-only coverage as sheet
coverage. A high line count is not evidence of correct gameplay. Remaining areas include exhaustive
subclass/feat combinations, account changes or deletion during an in-flight cloud upload,
Master Chest process crashes between document writes, GM encounter flows,
real email/image upload services, other browser engines, visual snapshots,
service-worker behavior, and exhaustive dice/spell-effect execution paths.

### Concurrent writes and recovery

`server/tests/characters.test.ts` synchronizes competing reads through the real HTTP handler and
MongoDB, then checks that only one save commits the same base revision. The production conditional
write now enforces this; the earlier description of an intentionally failing test is obsolete.

`server/tests/master-chest-http.test.ts` covers three workflows: replay and key/actor rejection,
competing withdrawals of the final item, and repeated chest revision conflicts followed by a safe
retry. The last case introduces a real competing database revision update before each chest write;
it retains the actual guard, bounded retries, and character compensation, then checks both durable
balances. It does not simulate process crashes or prove multi-document atomicity. See
[Master Chest transactions](master-chest-transactions.md) for that known limit.

## CI and failures

`.github/workflows/tests.yml` runs lint, test type checks, both test suites, both builds, and browser
journeys on pull requests and pushes to `main`. This workflow does not deploy. Configure branch
protection in GitHub if merges must require its success; adding a workflow alone does not enforce that.

Browser failures retain screenshots and Playwright traces under `app/test-results/`, with a report in
`app/playwright-report/`. CI uploads them on failure. From `app/`, open a local report with
`npx playwright show-report` or inspect a trace with Playwright's trace viewer.
Automatic retries are disabled so a flaky failure stays visible.

## Multiclass coverage

- `app/e2e/hit-points.spec.ts` checks the HP formula range, class labels, Auto/Manual guidance,
  manual HP saving, and reloads for legacy, inactive-class, and multiclass characters on desktop
  and mobile. Gameplay integration tests also cover recorded rolls, custom Hit Dice, negative
  Constitution, and HP adjustments.
- `app/tests/rules/class-definitions.test.ts` checks declarations across caster and martial classes,
  inactive benefits, activation/deactivation, retained spending and suspended feat choices, deletion,
  replacement cleanup, primary training, milestone XP preservation, and v2 compatibility.
  Browser tests group class/subclass/training choices in the Build editor and allocate levels separately;
  backend tests round-trip zero-level entries through cloud saves, sharing, and imports.

- `app/tests/rules/multiclass-profile.test.ts` checks profile edits preserve allocated class levels,
  manual HP, XP, wounds, and spent resources.
- `app/tests/rules/class-level-allocation.test.ts` checks level budgets, full redistribution, invalid or
  incomplete allocations, the starting-class lock, XP changes, automatic single-class allocation,
  and save/load.
- `app/tests/rules/hit-dice-pools.test.ts` checks independent class pools even for matching dice,
  legacy die-size spending, bounds, persistence, class removal, redistribution, and single-class
  save compatibility. Die-size aggregation remains covered for mechanics that select a die size.
- `app/e2e/hit-dice.spec.ts` checks each pool's resource controls, compact short-rest counters,
  cancellation, depleted pools, long-rest recovery, and reloads on desktop and mobile. The controls
  identify each class separately, including Wizard and Sorcerer pools that both use D6s.
- `app/tests/rules/multiclass-training.test.ts` checks every requested secondary-class training grant,
  constrained skill choices, empty initial choices, and absence of extra equipment or saving throws.
- Browser coverage checks the restored single-class creation layout, central level-up and allocation,
  XP decreases, class removal, retained training choices, the original single-class XP workflow,
  direct saving, empty multiclass rows, the red allocation count, compact selectors, independent
  button hover, and the class editor in light and dark themes. Changing a secondary class clears
  its previous training choices before saving.
- `app/tests/rules/multiclass.test.ts` separates total/class level, checks the slot/HP/Hit Dice rules,
  non-stacking attacks and AC, source-owned feats, and save/load across all 156 ordered built-in pairs.
- `app/tests/rules/multiclass-edge-cases.test.ts` checks real resource transitions, mixed-die spending,
  class removal/downgrades, distinct custom states, source-sensitive spell modifiers, companion HP,
  independent Channel Divinity recovery, editor validation, and backup write failures.
- `app/e2e/multiclass.spec.ts` exercises opt-in conversion, cancellation, reload, class/source/pool
  selectors, three-caster preparation and casting, mixed-die camp controls, feature-action slot costs,
  and loading only the selected build choice module into the page. The loading test excludes shared
  helpers and uses the normal browser harness with service workers disabled; it makes no assertion
  about production service-worker precaching.
- `server/tests/characters.test.ts` covers v3 validation, revision conflicts, original backup privacy,
  rejected downgrades, and v3 sharing/import through HTTP and disposable MongoDB.

The matrix checks composition and durable state. Within an approved test scope, prefer a targeted
expected outcome for an individual subclass interaction; a matrix pass alone is not proof that every
feature combination works. [Multiclass behavior and compatibility](multiclass.md) describes the implemented boundaries.
