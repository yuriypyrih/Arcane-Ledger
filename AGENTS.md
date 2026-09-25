# Arcane Ledger: agent guide

## Working agreements

- Preserve working character-sheet behavior and use existing tests for routine verification. A code change does not automatically require a new regression test.
- Keep changes focused. Do not combine a test-foundation change with architectural refactoring or unrelated cleanup.
- Prefer small modules with clear ownership. Extract a concern when necessary instead of expanding an already mixed component; file splitting is a means, not the first priority of every task.
- Derive rules from codex content and character state. Avoid repeating class/subclass rules in UI components or maintaining duplicate resource counters.
- Run the relevant automated tests and existing lint/build checks. Browser tests and local test servers are part of normal verification. Use synthetic data and isolated services; never run destructive tests against a developer or production database.
- Keep documentation aligned with the code. Distinguish established behavior from proposed migrations, and report verification that could not run.

## Repository map

- `app/`: React/TypeScript/Vite PWA, Redux Toolkit, React Router, local form state with React Hook Form, CSS Modules.
- `server/`: Express/TypeScript API, Mongoose/MongoDB, cookie authentication. It owns accounts, cloud characters, sharing, parties, campaigns/encounters, shared inventory, custom content, and database-backed reference browsing.
- Root, `app`, and `server` are separate npm projects with separate lockfiles.
- `README.md`: setup and commands. `docs/testing.md`: test layers, fixtures, isolation, and coverage boundaries.
- `docs/master-chest-transactions.md`: shared-inventory operations, concurrency, retries, and known atomicity limits.

## Verification commands

Run from the repository root:

- `npm run lint`
- `npm test`: frontend rule/component/persistence tests and backend HTTP/database tests.
- `npm run test:e2e`: browser journeys on desktop and mobile, including the real local backend.
- `npm run test:types`: type-check the test code and configurations.
- `npm --prefix app run build`
- `npm --prefix server run build`

See `docs/testing.md` for installation, browser/database downloads, individual suites, and failure artifacts.

## Test scope and approval

- Do not add tests by default whenever an agent works on the codebase. Routine fixes, refactoring, styling, and copy changes should normally use the existing suite.
- Add new test cases only when the user explicitly approves testing work, or when their scope is agreed during new-feature design in Plan mode. An explicit request to improve tests authorizes focused additions within that request; it does not authorize a broad suite expansion.
- Prefer strengthening or consolidating an existing behavior test. Keep approved additions small and tied to a material risk, such as data loss, unauthorized access, incorrect resource spending, or failed recovery. Avoid duplicate coverage, trivial assertions, cosmetic snapshots, and a regression test for every implementation detail.
- Running existing tests, repairing outdated assertions, and reducing repetition are routine maintenance and do not need separate approval. Follow the existing harness rather than introducing another runner. Do not block otherwise authorized code work on adding tests.

## Character-sheet data flow

Start at `app/src/pages/CharactersPage/CharacterSheetPage/`:

- `CharacterSheetPage.tsx` orchestrates the page, layout, and companion creation.
- `CharacterSheetSections.tsx` contains memoized section wrappers. Each reads the active character through Redux selectors; there is no shared page-wide React Hook Form context.
- `selectors.ts` and `domains.ts` control which updates reach each section. When a section starts reading another field or derived dependency, check its invalidation rules.
- `useCharacterSheetPersistence.ts` coordinates immediate sheet updates, delayed HP updates, debounced local storage, lifecycle flushes, and cloud opening.
- `activeCharacterNormalization.ts` normalizes affected parts of the character after edits.

The sheet contains profile, gameplay, companions, skills/proficiencies, equipment, features/feats, stats, and conditional spellcasting. Layout and visibility vary; inspect the components rather than assuming a fixed visual order.

Persistence code lives in `app/src/pages/CharactersPage/storage.ts`, `portableCharacterSheet*.ts`, and `resolvePortableCharacterSheet.ts`; background cloud synchronization lives in `app/src/characterSync/`. Preserve saved-sheet compatibility, ownership boundaries, and unsaved edits. A delayed response must not silently replace a newer local edit. Failed writes must not be treated as successful saves.

## Rules and content ownership

1. **Codex:** `app/src/codex/` owns static content, progression tables, unlock levels, and reference descriptions. Most categories are local; monsters and items also have API-backed browsing.
2. **Class runtime:** `app/src/pages/CharactersPage/classFeatures/` derives actions, choices, grants, bonuses, resources, and effects from unlocked features and stored state. The public barrel is `index.ts`; aggregation is spread across runtime/modules/actions/resources and related helpers.
3. **Subclass runtime:** keep subclass-specific behavior under `<class>/subclasses/`, with class-local registration/delegation. Reuse an existing subclass's pattern. Keep the shared dispatcher thin, and do not infer lack of behavior from an empty derived-state object.
4. **Contributions:** `app/src/pages/CharactersPage/featureContributions/` declares reusable outputs through `FeatureContributionSpec`. Use existing source constructors, compilation, and projection helpers. Check that a lane is consumed by the actual sheet before relying on it. Prefer transforms when modifying an existing action/spell instead of adding a duplicate.
5. **State transitions:** activation, spending, recovery, normalization, and specialized roll execution may require local runtime hooks. Do not force every transition into contribution declarations.
6. **Spell implementations:** intrinsic spell roll/apply behavior belongs in the spell implementation registry. Feature contributions can grant or modify spells without taking ownership of the spell itself.

Base-class contributions are generally collected before subclass contributions. Preserve ordering and deduplication when extending or migrating a feature family.

## Gameplay invariants

- Keep persistent class resources in `classFeatureState`, with the runtime's spend/restore helpers. Generic charges use the existing blue-dot/card usage presentation; named pools use their existing resource presentation. A fallback-resource action spends its ordinary use first and remains available while either payment path is valid.
- An actionable card needs both display data and execution wiring. `action`, `bonus_action`, and `free` features belong in the Gameplay Actions widget unless requested otherwise.
- Default card title: feature name. Use `cardUsage` for costs, a short `breakdown` for the effect, and the existing blank subheader when there is no cost. Reuse feature descriptions and default confirmation labels unless custom controls are needed.
- Dice-confirm footers use the shared dice footer pattern with the d20 icon and settings control.
- Rest recoveries must appear explicitly in the camp options (`GameplayForm/widgets/restOptions.ts`, with short/long-rest helpers). Avoid silently restoring resources that the player should choose.
- Activation-created timed traits must be visible in Traits & Conditions and persist with their duration. Passive derived benefits can remain derived. Block reuse while active only when the mechanic requires it.
- Concentration is a status entry with linked effects. Replacing or ending concentration must remove linked effects; duration and rest flows must preserve this relationship.
- Always-prepared spells do not consume preparation capacity, but ordinarily still spend slots. Ritual casting does not spend a slot. Keep subclass spellcasting progression in `app/src/codex/classes/subclassSpellcasting.ts` when applicable.
- Extra action capacity uses the shared action-economy model and the owning runtime's counters; showing an extra action does not itself spend it.
- Add feature-derived reference text as sourced `descriptionAdditions`/`additionalDescription`, using `actionModalDescriptions.ts` helpers. Preserve the original base description and deduplicate sourced additions.
- Proficiency choices use `SelectInput` and shared option builders. New choices start empty; unavailable or already-selected choices remain visible but disabled.

## Shared surfaces and server-backed flows

Reuse existing modals, drawers, and the dice roller. Drawers can include actionable footers as well as reference text; inspect the existing flow before choosing a surface.

Companions live in `Character.companions`; normalization and gameplay transitions are in `app/src/pages/CharactersPage/companions.ts`. Reuse `CompanionsSection`, `MonsterRecord`, `useMonsterEntries`, and the monster renderer/drawer for monster-backed companions and wild shape.

For monster queries, coordinate `server/src/middleware/validateMonsterListQuery.ts`, `server/src/services/monsterService.ts`, and frontend consumers. Keep filters, sort, pagination, and record shapes in agreement.

Master Chest transfers use operation batches, revision guards, and idempotency. Preserve conflict handling and authoritative character adoption; consult the dedicated document before changing this flow.
