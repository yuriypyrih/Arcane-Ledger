# Arcane Ledger test review — 25 September 2026

**Follow-up implementation:** the historical audit below predates the focused improvements. Six cases
now cover cloud upload ordering/failure/conflict and Master Chest replay, competing withdrawals,
and compensation/retry. Existing selector, resource, Action Surge, Bard-choice, and inspection
assertions were strengthened; two duplicate unit cases and one duplicate browser scenario were
consolidated, and five explicit viewport sweeps now run once. The stale roster heading and omitted
sync TSX coverage were corrected. The stronger guide check also exposed missing focus restoration;
the guide now returns focus to its opener on dismissal. Future additions follow the restrained approval rule in
[AGENTS.md](../AGENTS.md); this audit's suggestions are not blanket approval to expand the suite.
See [testing.md](testing.md) for the current coverage and remaining limits.

**Follow-up verification:** 420 frontend tests and 50 backend tests passed; lint, test type checks,
and both builds passed. The complete browser run finished with 157 passes, one intentional mobile
skip, and the guide focus failure. After the fix, that scenario passed in both desktop and mobile
reruns, and in the remaining mobile portion of the main run. This verifies all 158 non-skipped
browser cases across those runs. A temporary frontend port of 4185 avoided another task's server;
the disposable backend and isolation rules were retained, and the temporary configuration was removed.

Reviewed **61 test files**, including pending additions: all 59 files present at the start (8,537 lines), plus two files added by concurrent work during the browser run. Read each test body, fixtures, harness configuration, CI, testing documentation, and relevant production boundaries. No production code or tests were changed by this review. Other work was active in the shared checkout during verification; these results describe this local run, not a frozen release commit.

**Assessment: most tests protect real behavior. The main problem is uneven depth, with some weak assertions and repeated presentation checks—not a broadly trivial suite.** Simple tests of conservation, resource limits, or non-destructive saves are often exactly what we want. I would strengthen the risky boundaries before deleting tests merely because their arithmetic is easy.

## What kinds of tests are present?

| Layer | Files | Cases | What actually runs |
| --- | ---: | ---: | --- |
| Frontend rules/domain tests | 21 | 328 | Vitest calls real rules and state transformations. Includes unit tests, cross-module domain integration, and content contracts. |
| Frontend component/persistence integration | 13 | 89 | React Testing Library, jsdom, real Redux/storage/rules, with selected asynchronous transport boundaries mocked. A few files exercise helper composition without rendering React. |
| Backend unit tests | 1 | 7 | Master Chest pure operation helper; no HTTP or MongoDB in this file. |
| Backend HTTP/database integration | 3 | 40 | Supertest, real Express/authentication, and disposable MongoDB. |
| Browser journeys and browser integration | 23 | 81 scenarios / 162 configured runs | Playwright desktop Chromium and Chromium mobile emulation. One mobile breakpoint run is intentionally skipped. Some scenarios use real backend services; others use guest local storage or mocked API responses. |

There are no screenshot-baseline comparisons, mutation tests, load/stress suites, property-based generators, or production PWA/offline-cache browser tests in the reviewed harness. The deterministic two-request cloud race is a concurrency regression, not a load test. A captured screenshot is not an automatic visual regression assertion. Type checking, lint, and builds are separate quality checks, not additional unit tests.

`npm test` runs the frontend and backend Vitest suites. `npm run test:e2e` runs the browser suite separately. The mobile project is a touch-enabled Chromium viewport, not Safari or a physical iPhone.

## Findings and recommended changes

### Observed browser failure: the roster layout test stops before testing layout

[roster.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/roster.spec.ts:6) requires an exact level-two heading named `Characters`, while the current [CharacterList](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/src/components/CharactersPage/CharacterList/CharacterList.tsx:85) renders `Your Characters`. Both desktop and mobile runs failed at the initial heading count. The failure screenshot and accessibility snapshot show the roster and Join Party button present; none of the width-loop assertions were reached.

This failure identifies a stale copy-dependent test expectation, not evidence that the responsive layout is broken. Align the heading locator with the intended current copy, then execute the actual layout assertions. Preserve an exact copy assertion only if that wording itself is a requirement. The review leaves this pending test unchanged.

### 1. Highest priority: test the complete Master Chest save boundary

[server/tests/master-chest.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/server/tests/master-chest.test.ts:16) directly calls `applyMasterChestOperations` with an `isGm` boolean. It correctly catches bad arithmetic, invalid batches, missing items, and forbidden operation types. It cannot catch broken route authorization or persistence behavior.

The production [optimistic operation service](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/server/src/services/masterChestOptimisticOperationService.ts:169) also owns multiple guarded writes, retry/compensation, and idempotency records. None of the reviewed tests call the chest transaction API. Add isolated HTTP/database tests for:

- Two players attempting to withdraw the last item; exactly one transfer, conserved quantities.
- Replaying the same operation UUID; no second transfer, authoritative returned state.
- A character or chest revision conflict between writes; retry or compensation preserves inventories.
- Authenticated player/GM authorization at the route, and the client adopting authoritative state after success/conflict.

Keep the existing seven fast unit tests. They protect a different boundary. The documented process-crash gap between two documents is an established limitation; passing normal concurrency tests should not be presented as eliminating it.

### 2. Highest priority: upload races are not covered by cloud-opening races

[persistence.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/persistence.test.tsx:78) and [cloud-opening.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/cloud-opening.test.ts:66) are strong, but primarily protect opening/reconciling a sheet. [cloud-save.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/cloud-save.spec.ts:3) covers a successful upload and reload.

The background uploader has its own newer-local-revision handling in [CharacterSyncBootstrap.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/src/characterSync/CharacterSyncBootstrap.tsx:151). Add controlled transport tests that make a second edit while a PUT is in flight, then deliver success, 409, or a transient error; check both local content and dirty/conflict status, then recovery. Include logout/account changes and deletion while work is pending.

There is also a measurement blind spot: [the coverage include pattern](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/vitest.config.ts:23) is `src/characterSync/**/*.ts`, which excludes this main `.tsx` synchronizer and its conflict UI. Extend that pattern if the report is meant to describe background synchronization.

### 3. The large matrices provide less assurance than their breadth suggests

[class-progression.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/class-progression.test.ts:20) computes expected feature rows from the same codex rows the production selector filters. Changing an unlock level incorrectly in that shared data can change both sides together. The generic action checks accept an empty action list; the generic slot checks accept nine zeroes. Specific action/slot tests elsewhere reduce this weakness for selected classes, but do not certify every subclass.

The [156 ordered class-pair round trip](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/multiclass.test.ts:268) starts with largely default state and compares a normalized save against a fixture already constructed through production normalization/progression. It will not establish preservation of spells, spent resources, selected feats, and active effects that were never populated; corruption during fixture construction can also become the expected value.

Keep a broad smoke matrix, but seed meaningful non-default state for representative high-risk pairs and specify independent expected unlocks/outcomes. Separate transition tests should exercise spend → save → reload → refusal/recovery. In the coverage run, the progression file took about 24.3 seconds and the pair matrix about 12.8 seconds, making these more worthwhile to optimize than tiny table tests. These timings were collected alongside other local work and are not a benchmark.

A concrete mechanic needing deeper assertions is **Action Surge**. Its [browser test](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/sheet-mechanics.spec.ts:17) verifies spending and recovering the charge. The [generic economy test](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/action-economy.test.ts:27) supplies an extra-action count directly. Neither connects activation to the real extra-action counter and subsequent consumption. Add a scenario that spends the ordinary action, activates Action Surge, executes the additional eligible action, and verifies that the extra capacity is then exhausted. This protects the benefit as well as its payment.

### 4. Two assertions can miss the exact regression named by their tests

- [selectors.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/selectors.test.tsx:75) says it replaces “all selected data,” but the second character only has different HP and only HP is asserted. Give the second character different ability and spent-slot values, then assert all three outputs. Keep the real independent-section tests as well.
- [character-inspection.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/character-inspection.spec.ts:183) enters its Shield assertions only `if (await spell.count())`. If spell rendering breaks for the Wizard fixture, that branch silently disappears and the journey can still pass. Pass the expected caster state into the helper and require the spell for that fixture. The dedicated component test helps, but does not close this browser wiring gap.

Also tighten the Bard reload check in `multiclass-edge-cases.test.ts`: it checks that some Bard skill exists, not that the chosen Performance skill survives. Resource tests should pin a few actual expected total capacities rather than always deriving the expected total from the production getter.

### 5. Consolidate repeated presentation work while keeping usability contracts

The account, action-header, campaign-label, GM-tab, and roster tests each loop through explicit widths, and the shared Playwright configuration runs those same sweeps in both Chromium projects. Different touch/device settings are not completely identical, but much of the geometry work repeats. Run pure width sweeps in one dedicated Chromium layout group; retain representative touch/keyboard journeys on mobile.

[multiclass.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/multiclass.spec.ts:808) pins `border-radius: 6px`, later pins every select to `38px`, and checks an exact RGB color. [toast-swipe.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/toast-swipe.spec.ts:59) pins exact hover brightness. These can fail after harmless restyling while adding little evidence about progression or dismissal. If these are intentional design contracts, place them in focused presentation tests; otherwise prefer usable targets, contrast, non-overlap, keyboard access, and actual state changes.

The creation guide repeats its announcement text/list-count and absence-on-edit checks in component and browser tests. Keep the no-submit/draft-preservation behavior, and retain browser coverage for real focus/keyboard/navigation. Reduce duplicated copy assertions. Do not merge unrelated long journeys merely to reduce test count.

The exhaustive read-only inspection helper also repeats most common UI checks for both GM and admin on both projects. A shared read-only interaction matrix plus short route-entry/fresh-data checks can preserve assurance with less repetition. Server authorization tests should retain the complete role matrix.

### 6. Some visual/content tests are weaker than their names imply

A `page.screenshot()` call saves evidence; there are no `toHaveScreenshot` comparisons. In particular, the dark progression journey verifies theme selection, element presence, and behavior, but does not automatically establish readable contrast. The Cunning Strike test does measure contrast and is a stronger example.

[spell-catalog.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/spell-catalog.test.ts:98) requires tokens such as `5d8`, `4d6`, and saving-throw names somewhere in Bigby’s Hand's description. Swapping those rules between effects can still pass. Associate each expected rule with its effect, or classify the test narrowly as a content-presence contract. It does not test executing that spell.

By contrast, preserving the saved `spell-arcane-hand` ID during a rename is important compatibility coverage. The removed-spell table is repetitive but cheap (the whole catalog file took about 70 ms); it is not a priority for deletion.

### 7. Update stale testing documentation

[docs/testing.md](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/docs/testing.md:188) says simultaneous saves still return two 200s and `npm test` remains red. This is no longer accurate: all 47 backend tests passed, including that regression. [The current handler](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/server/src/controllers/characterController.ts:897) includes the revision in its atomic update predicate.

The same guide broadly describes background sync coverage, but the main synchronizer is excluded from the configured coverage denominator (finding 2). These documentation issues should be corrected so the test results are interpreted accurately.

### 8. Minor maintenance concern: shared server fixtures depend on ordering

`server/tests/character-inspection.test.ts` mutates a shared character’s revision and revokes/deletes its membership in later cases. Default sequential execution works, but reordering/shuffling can make otherwise unrelated assertions fail. Prefer per-test fixture setup for mutating cases when maintaining this file. This is lower priority than missing transaction/race coverage.

## Useful overlap that should remain

- Tough at rules level checks numerical derivation; the sheet integration test checks invalidation; the browser test checks the real editor and persistence. These are different failures.
- HP, spell slots, and Hit Dice tests across layers verify rules versus controls versus storage; keep those boundaries.
- Cloud-opening hook tests mock the resolver to control timing, while cloud-opening integration tests use the real resolver. Neither makes the other redundant.
- Description component tests check rendering/sanitization, while the browser journeys check editor → API → reload → preview.
- Toast component tests can cheaply enumerate rejected gestures; Chromium touch tests check actual browser event behavior.
- Invalid frontend and server inputs need checks at both trust boundaries.

Small consolidation candidates within the same domain are the Fighter training example in `multiclass.test.ts` versus `multiclass-training.test.ts`, and its basic die-size spend/restore example versus `hit-dice-pools.test.ts`. Preserve any distinct full-rest assertion if consolidating. These are low-cost overlaps, not urgent waste.

## Verification

- Frontend Vitest with coverage: **379 passed / 32 files**, 97.39 seconds.
- Backend Vitest: **47 passed / 4 files**, including the deterministic simultaneous-save regression, against disposable MongoDB.
- Root lint, test TypeScript checks, frontend production build, and backend build: **passed at the time those checks ran**. Concurrent edits continued afterward; this is not certification of the final state of another ongoing task.
- Browser execution: **159 passed, 2 failed, 1 intentionally skipped / 162 configured runs / 23 files**, in 16.4 minutes. Both failures are the same stale roster-heading expectation described above; its responsive assertions did not execute.
- Late additions: `hard-set-effects.test.ts` (**22 passed**) and `effect-editor.test.tsx` (**16 passed**) ran separately after they appeared. Together with the initial 426 Vitest passes, this is **464 passing Vitest cases across the recorded runs**. The initial coverage report was not regenerated for these additions.
- Scoped frontend Vitest coverage: **45.65% lines/statements, 63.58% branches, 45.74% functions**. This excludes browser execution, much of the application outside configured paths, and the synchronizer TSX noted above. It is execution evidence, not a correctness percentage.
- Initial sandbox restrictions prevented local listening; isolated server tests were then run with process permissions. The first permitted browser attempt found another test run using the fixed ports; it was left alone. A full browser run was started after those ports were released.

No mutation testing or systematic remove-one-test analysis was performed. Recommendations about redundancy and missed regressions are based on the assertions, mocked boundaries, actual code paths, and run results. A precise “percentage redundant” would be unsupported.

## File-by-file assessment

Case counts include the two late additions. They are expanded Vitest cases; browser counts are scenarios before doubling across projects. The 156-pair loop is one Vitest case, illustrating why raw case count does not measure depth.

### Frontend rules

| File | Cases | Assessment | What it protects / recommendation |
| --- | ---: | --- | --- |
| [action-economy.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/action-economy.test.ts) | 3 | Keep | Spending, next-turn recovery, extra capacity, and out-of-combat refusal are small but important invariants. |
| [class-definitions.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/class-definitions.test.ts) | 22 | Keep | Inactive classes grant nothing; spent uses and choices survive suspension, rest, reactivation, replacement, and save/load. |
| [class-level-allocation.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/class-level-allocation.test.ts) | 20 | Keep | Invalid budgets, XP mismatch, starting-class identity, redistribution, and preservation of wounds/equipment are substantive. |
| [class-progression.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/class-progression.test.ts) | 68 | Strengthen | Useful content smoke matrix, but expectations follow the same codex data; empty actions and zero slots satisfy the generic assertions. See finding 3. |
| [companions.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/companions.test.ts) | 4 | Keep | Temporary HP ordering, healing limits, death thresholds, immutability, and invalid input are consequential despite simple arithmetic. |
| [contributions.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/contributions.test.ts) | 1 | Keep / extend selectively | The sum is simple, but deduplicated grants retaining both sources protects a shared contract. Other contribution lanes need targeted consumer tests when changed. |
| [equipment.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/equipment.test.ts) | 4 | Keep | AC updates, quantity conservation, failed-move preservation, and charge exhaustion are useful behavior assertions. |
| [feats.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/feats.test.ts) | 10 | Keep | Derived/base-score separation, caps, prerequisites, unique spell grants, free-use exhaustion, and durable recovery are meaningful. |
| [hard-set-effects.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/hard-set-effects.test.ts) | 22 | Keep; reviewed as a late addition | Real precedence against additive bonuses, independent abilities, highest-source selection, expiration, item activation rules, custom-action activation, invalid values, and save/load. These are substantive mechanics tests. |
| [hit-dice-pools.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/hit-dice-pools.test.ts) | 20 | Keep | Class-owned versus die-size pools, legacy spending, bounds, migration, and redistribution are distinct failure modes. |
| [multiclass-edge-cases.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/multiclass-edge-cases.test.ts) | 19 | Keep; tighten one assertion | Strong actual resource transitions and ownership checks. The Bard reload test only checks that some Bard skill exists; assert the selected Performance skill explicitly. |
| [multiclass-profile.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/multiclass-profile.test.ts) | 6 | Keep | Profile-specific boundary protects total versus allocated levels, incomplete drafts, manual HP, wounds, XP, and Pact spending. |
| [multiclass-training.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/multiclass-training.test.ts) | 17 | Keep | An explicit expected training table checks grants and forbidden extras across classes. Its Fighter case overlaps the narrower training case in multiclass.test.ts; optional consolidation. |
| [multiclass.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/multiclass.test.ts) | 25 | Keep targeted cases; strengthen matrix | Targeted casting, attacks, HP, source ownership, and removal tests are valuable. The 156-pair matrix uses largely default state. Its die-size spend/restore case overlaps hit-dice-pools.test.ts. |
| [proficiencies.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/proficiencies.test.ts) | 15 | Keep | Numerical modifiers, automatic floors, expertise deduplication, and independent source retention prevent real sheet errors. |
| [resources.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/resources.test.ts) | 3 | Keep; strengthen totals | Rest differences and floor checks matter. Second Wind/Rage totals come from production getters; add explicit expected totals at representative level boundaries. |
| [spell-casting-costs.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/spell-casting-costs.test.ts) | 7 | Keep | Free-cast, upcast, exhaustion, and alternate-payment choices cover real branches; this is payment planning, not execution of every spell. |
| [spell-catalog.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/spell-catalog.test.ts) | 36 | Keep compatibility; tighten content checks | Removed IDs and preserved renamed IDs protect old saves and selection capacity. The description token test does not associate damage/save rules with the correct hand effect. Cheap repetition is low priority. |
| [spell-preparation.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/spell-preparation.test.ts) | 10 | Keep | Capacity after filtering, class/level legality, and explicit Life Domain grants are independently specified behavior. |
| [spell-slots.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/spell-slots.test.ts) | 12 | Keep | Explicit capacity tables and invalid-spend clamping are useful; extend lower-level slice assertions to all nine slot levels when editing. |
| [statuses.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/rules/statuses.test.ts) | 4 | Keep | Concentration linkage, unrelated condition preservation, expiration, and distinct rest lifetimes protect state cleanup. |

### Frontend integration

| File | Cases | Assessment | What it protects / recommendation |
| --- | ---: | --- | --- |
| [auth-session.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/auth-session.test.ts) | 2 | Keep | Private local data clearing and deduplicated expiration events are valuable; they do not exercise a cloud response arriving after logout. |
| [character-inspection.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/character-inspection.test.tsx) | 16 | Keep; consolidate repeated presentation | Strong read-only boundaries, nested navigation, delayed responses, preserved active/storage state, and unsaved admin drafts. Exact button counts/styles are more brittle than named forbidden controls. |
| [cloud-opening.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/cloud-opening.test.ts) | 5 | Keep | Real resolver/storage with mocked API transport tests clean adoption, concurrent local edits, older responses, offline behavior, and guest isolation. |
| [description-formatting.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/description-formatting.test.tsx) | 6 | Keep | Whitespace preservation plus inert executable markup through multiple rendering paths is useful; not a complete security audit. |
| [effect-editor.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/effect-editor.test.tsx) | 16 | Keep; reviewed as a late addition | Boundary values, numeric-only hard-set choices, callback wiring, irrelevant-mode removal, and draft parsing complement the rules tests. It does not yet prove a saved editor choice refreshes the real sheet; add that interaction when the ongoing feature is complete. |
| [feat-drafts.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/feat-drafts.test.ts) | 3 | Keep | Tests draft helpers and rules composition rather than a mounted component. Editing/removal preserves independent grants and unrelated sheet edits. |
| [gameplay.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/gameplay.test.tsx) | 6 | Keep | Mounted controls plus real rules exercise HP modes, recorded rolls, minimum gains, custom dice, damage ordering, and rest cancellation. |
| [multiclass-guide.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/multiclass-guide.test.tsx) | 2 | Consolidate repeated copy checks | Keep no-submit and unsaved-draft preservation. Exact announcement text and list counts repeat the browser guide tests. |
| [persistence.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/persistence.test.tsx) | 9 | Keep | Distinct race windows: immediate, queued HP, deferred opening, already-flushed edits, navigation, failure, and retry. Similar titles do not make these duplicates. |
| [selectors.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/selectors.test.tsx) | 2 | Strengthen | The character-switch test claims all selected data but changes/asserts only HP. Use distinct ability and spent-slot values and assert every output. |
| [sheet-sections.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/sheet-sections.test.tsx) | 5 | Keep | Real independent section consumers catch missing invalidation. Rules tests and browser journeys are complementary, not replacements. |
| [storage.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/storage.test.ts) | 2 | Keep | Checks actual serialized storage and failed-write cache/event behavior, beyond simple in-memory object round trips. |
| [toast-gestures.test.tsx](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/tests/integration/toast-gestures.test.tsx) | 15 | Keep | Gesture direction, cancellation, secondary pointers, click suppression, and automatic dismissal form a worthwhile boundary matrix. |

### Backend

| File | Cases | Assessment | What it protects / recommendation |
| --- | ---: | --- | --- |
| [administration.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/server/tests/administration.test.ts) | 2 | Keep | Actual authenticated HTTP/database ordering, including never-active accounts, complements mocked browser pagination. |
| [character-inspection.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/server/tests/character-inspection.test.ts) | 7 | Keep; isolate mutable cases | Real role/ownership/membership boundaries, denied writes, fresh revisions, privacy and revocation. Shared state makes test order significant. |
| [characters.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/server/tests/characters.test.ts) | 31 | Keep | Ownership, durable saves, stale/concurrent revisions, nested state, validation, migration backup privacy, sharing, imports, and deletion are substantive. |
| [master-chest.test.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/server/tests/master-chest.test.ts) | 7 | Keep unit tests; add integration | Pure helper tests check conservation and conflicts. They do not exercise authentication, revision guards, retries, compensation, or idempotency. |

### Browser

| File | Cases | Assessment | What it protects / recommendation |
| --- | ---: | --- | --- |
| [account-layout.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/account-layout.spec.ts) | 1 | Consolidate layout execution | Real layout check across four widths; repeated width sweep on both Chromium projects has limited extra value compared with touch-specific tests. |
| [action-drawer-header.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/action-drawer-header.spec.ts) | 1 | Keep layout contract; consolidate execution | Title/close-button separation, overflow, and charge wrapping prevent unusable drawers. Both projects repeat the six-width sweep; screenshots are diagnostics. |
| [campaign-action-labels.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/campaign-action-labels.spec.ts) | 1 | Consolidate presentation checks | Checks responsive labels/icons, not encounter creation or note behavior. Three widths run in each project; use a focused layout group. |
| [character-inspection.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/character-inspection.spec.ts) | 2 | Keep; fix optional assertion | Real GM/admin entry points, no outgoing mutations, freshness and focus restoration. Require the expected spell rather than conditionally skipping it; consolidate shared UI repetition. |
| [character-sheet.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/character-sheet.spec.ts) | 3 | Keep | HP persistence/reload, inspiration, and missing-character recovery are core local browser journeys. |
| [cloud-save.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/cloud-save.spec.ts) | 1 | Keep / expand risky cases | Real login, browser edit, durable API retrieval, and reload form a genuine full-stack journey. Only the successful upload path is covered. |
| [combat-workflows.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/combat-workflows.spec.ts) | 2 | Keep | Round-resource persistence/recovery and concentration-linked cleanup are distinct stateful journeys. |
| [custom-description-formatting.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/custom-description-formatting.spec.ts) | 3 | Keep | Browser editing through real API, stored text, reload, rendering CSS, and inert markup check multiple genuine boundaries. |
| [feat-workflows.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/feat-workflows.spec.ts) | 3 | Keep | User choices, prerequisite refusal, sourced expertise, derived HP, removal, and reload are substantive wiring tests. |
| [gm-tools-tabs.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/gm-tools-tabs.spec.ts) | 1 | Keep usability; consolidate detail | Access names, selecting tabs, 44px targets, and overflow are useful. Repeating every selection/width in both projects and exact adjacency is lower return. |
| [hit-dice.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/hit-dice.spec.ts) | 3 | Keep | Tests actual per-class controls, same-size pools, cancellation, selected spending, long-rest recovery, and legacy save format. |
| [hit-points.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/hit-points.spec.ts) | 3 | Keep behavior; reduce copy duplication | Three storage shapes, manual saving, preserved wounds, and reload are useful. Exact long formula wording is also heavily tested at component level. |
| [list-pagination.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/list-pagination.spec.ts) | 4 | Keep; classify correctly | Items/monsters/admin use mocked HTTP results: browser integration, not database E2E. Page controls and query parameters matter; exact arrow colors/gaps are optional presentation constraints. |
| [multiclass-guide.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/multiclass-guide.spec.ts) | 2 | Reduce duplication | Keep a browser focus/close/no-navigation smoke journey. Repeated announcement/list-count assertions and absence-on-edit overlap the component suite. |
| [multiclass.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/multiclass.spec.ts) | 24 | Keep behavior; separate style checks | 24 substantial scenarios cover migration, declaration/allocation, ownership, casting, training, level limits, and legacy format. Exact radius, selector height, and color assertions are candidates to separate/consolidate. |
| [roster.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/roster.spec.ts) | 2 | Fix stale locator; keep builder; consolidate layout | The current heading expectation fails before any width checks. Creating and reopening a character is core. The width sweep largely repeats between projects; preserve accessible name and touch-target checks. |
| [section-workflows.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/section-workflows.spec.ts) | 5 | Keep | Profile validation/cancellation, cross-section ability changes, armor, selective rest, and companion lifecycle are useful distinct workflows. |
| [sheet-mechanics.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/sheet-mechanics.spec.ts) | 5 | Keep; deepen Action Surge | Companion creation, charges, ritual slot preservation, currency edits, and manual proficiency cover user-facing wiring. Action Surge also needs an assertion that activation grants an extra action that can actually be consumed. |
| [sneak-attack-theme.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/sneak-attack-theme.spec.ts) | 1 | Keep | Unlike mere color comparisons, it asserts minimum contrast and selected-effect dice costs. Exact theme colors need not be pinned. |
| [spell-workflows.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/spell-workflows.spec.ts) | 5 | Keep | Preparation edits, grant capacity, exhausted-cast refusal, free-use recovery, and unprepare-to-make-room are high-value workflows. |
| [spellcasting-navigation.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/spellcasting-navigation.spec.ts) | 5 | Keep behavior; trim decorative detail | Scroll/focus, offscreen hysteresis, reduced motion, breakpoints, and noncaster absence are meaningful. Exact icon/pill geometry can be a focused layout contract. |
| [subclass-spell-fixes.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/subclass-spell-fixes.spec.ts) | 2 | Keep targeted regressions | Elementalism deduplication and Portent persistence target specific failures. Portent RGB darkness is a proxy; direct text/background contrast would be stronger. |
| [toast-swipe.spec.ts](/Users/yuriypyrih/Desktop/Workspace/Arcane-Ledger/app/e2e/toast-swipe.spec.ts) | 2 | Keep | Real Chromium touch dispatch and browser click/keyboard behavior complement synthetic component events; exact hover brightness is optional decoration. |

## Suggested next work

1. Repair the stale roster heading expectation so its layout checks actually execute; close the Master Chest transaction and background-upload race gaps with explicit expected state and isolation.
2. Fix the optional/missing assertions and enrich selected matrix fixtures.
3. Correct documentation and the sync coverage include pattern.
4. Consolidate repeated width sweeps and decorative/copy assertions while retaining regression-specific accessibility and interaction checks.
5. If stronger evidence of suite effectiveness is needed, run targeted mutations on revision guards, state preservation, preparation capacity, and resource ownership in an isolated checkout. Use surviving realistic mutations to guide additions; do not optimize for the number of tests.
