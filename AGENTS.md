# Architecture Guide for Agents

This repository centers on a persistent local character sheet, codex-derived rules/content, and a server-backed monster pipeline. Most sheet behavior should be derived from codex data plus current character state rather than hardcoded per-screen conditionals.

## Repo Priorities

1. Code splitting comes first. Big files should always try to split into smaller ones before they grow further. If a file is already handling multiple concerns, extract subcomponents, hooks, helpers, constants, or per-feature modules instead of adding more inline logic.
2. This project should not contain tests. Do not add unit tests, component tests, integration tests, test configs, test helpers, or test-only dependencies unless the user explicitly reverses this policy.
3. Preserve derivation-driven architecture. Keep class behavior, spell access, actions, recoveries, statuses, and companion/monster behavior derived from shared state and codex/runtime modules rather than duplicating logic across screens.
4. Favor house cleaning when touching a feature area. Remove dead helpers, stale scripts, outdated docs, and leftover scaffolding when it is safe to do so.
5. Do not start, request approval for, or ask the user to run browser/dev-server verification unless the user explicitly asks for it. Use static verification such as linting or builds by default.

Current large-file hotspots that should be split instead of expanded further:
- `app/src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/ActionsWidget.tsx`
- `app/src/pages/CharactersPage/proficiency.ts`
- `app/src/pages/CharactersPage/classFeatures/index.ts`
- `app/src/components/CharactersPage/CharacterSheetPage/ClassFeaturesAndFeats/ClassFeatureList.tsx`
- `app/src/components/CharactersPage/CharacterSheetPage/SpellCastingForm/SpellCastingForm.tsx`

Useful source anchors:
- `app/src/pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.tsx`
- `app/src/components/CharactersPage/CharacterSheetPage/index.ts`
- `app/src/pages/CharactersPage/classFeatures/index.ts`
- `app/src/pages/CharactersPage/companions.ts`
- `app/src/components/CharactersPage/CharacterSheetPage/CompanionsSection/CompanionsSection.tsx`
- `app/src/pages/CodexPage/useMonsterEntries.ts`
- `app/src/components/CodexPage/MonsterCodexTable/MonsterCodexTable.tsx`
- `app/src/components/MonsterEntryRenderer/MonsterEntryDrawer.tsx`
- `server/src/middleware/validateMonsterListQuery.ts`
- `server/src/services/monsterService.ts`

## Character Sheet Page

The Character Sheet page is the orchestration layer for a single character. It loads the saved character, places the sheet under a shared React Hook Form context, and persists all updates back through storage. The sections are separated into mostly self-contained components, but they all operate on the same character object and the same persistence callback.

Current render order and purpose:
- `Character Profile`: identity, class/subclass, level progression, XP, and core sheet metadata.
- `Gameplay`: combat-facing controls, action economy, rests, traits and conditions, live-session tools, and class/resource widgets.
- `Character Stats`: abilities, modifiers, saves, initiative, speed, armor class, and formula inspection.
- `Skills & Proficiencies`: resolved skills plus grouped proficiencies, tools, armor, weapons, and languages.
- `Class Features & Feats`: feature reference, feature-driven choices, feat selection, and class-specific choice editing.
- `Companions`: custom companions plus monster-backed companion inheritance and inspection.
- `Equipment`: loadout, item inspection, shop/custom equipment, currency, and equip state.
- `Spellcasting`: cantrips, prepared spells, spell slots, always-prepared entries, and divinities where applicable.
- `Thumb Dice Button`: global quick access to the dice roller.

## Class Feature Inheritance System

The class feature system has two layers.

The first layer is the codex progression layer. Each class defines a progression table as `FeatureClassObj[]`, where each row represents a level breakpoint. Rows list the class features unlocked at that level and can also include per-level values such as cantrips, prepared spells, spell slots, charges, wild shape uses, or other class-specific counters. `featureOverrides` can replace or refine the shared description or tracking state for specific features at specific levels.

The second layer is the runtime derivation layer in `app/src/pages/CharactersPage/classFeatures/`. Each class runtime module takes the unlocked features plus stored feature state and turns them into actual sheet behavior. Runtime normalizers keep class-specific feature state valid for the current class and level. Per-class modules expose derived outputs such as actions, indicators, bonuses, proficiencies, statuses, spell access, always-prepared spells, wild shape state, and feature choices.

`app/src/pages/CharactersPage/classFeatures/index.ts` is the aggregator that merges those per-class outputs into one unified feature system that the rest of the sheet consumes. This is inheritance by derivation, not by class-component subclassing: the sheet asks the class-feature runtime what the current character gains, rather than hardcoding each class directly into each UI section.

### Runtime Lookup Guide

When adding or changing class behavior, check these layers in order:
- codex progression tables for level-based unlocks, counts, and base feature metadata
- `app/src/pages/CharactersPage/classFeatures/<class>/<class>.ts` for normalized state, core actions, stat effects, and rest/round reset behavior
- `app/src/pages/CharactersPage/classFeatures/<class>/subclasses/*.ts` for additive subclass actions, reactions, granted spells, decorators, and derived statuses
- `app/src/codex/classes/subclassSpellcasting.ts` only when subclass spellcasting progression, spell lists, or spellbook usage changes

Composition rules:
- base class outputs are collected first, then subclass outputs are layered on top
- use transform hooks when a subclass should modify an existing action, spell, or weapon entry instead of creating a parallel one

Reusable mechanics:
- tracked resources belong in `classFeatureState`, not page-local UI state
- rest and round cleanup belongs in runtime reset helpers and module wiring
- persistent gameplay effects should usually become derived status entries or status-backed effects
- granted spells should usually flow through `alwaysPreparedSpellIds`; use subclass spellcasting data only for real progression changes
- action cards need both card creation and execution wiring

Warnings:
- an empty subclass derived-state object does not mean the subclass has no runtime behavior
- do not hardcode class behavior in page components
- do not duplicate resource counters outside runtime state

### Subclass Runtime Pattern

When a class gains subclass-specific runtime behavior, split that behavior into one file per codex subclass instead of growing the main class runtime file.

Preferred layout:
- `app/src/pages/CharactersPage/classFeatures/<class>/<class>.ts`: class-wide runtime only. This file should own the base class behavior and delegate subclass work out.
- `app/src/pages/CharactersPage/classFeatures/<class>/subclasses/index.ts`: class-local subclass registry and delegation helpers such as `get<Class>SubclassDerivedFeatureState`, subclass state normalizers, or subclass action handlers.
- `app/src/pages/CharactersPage/classFeatures/<class>/subclasses/<class><SubclassName>.ts`: one runtime file per codex subclass.

Implementation expectations:
- Keep `app/src/pages/CharactersPage/classFeatures/subclasses.ts` thin. It should expose shared subclass runtime types/helpers and the public dispatcher, not a giant cross-class map of concrete subclass logic.
- Move subclass-only logic out of `<class>.ts` and into subclass files. That includes prepared spells, actions, action options, indicators, statuses, derived bonuses, transform hooks, recovery hooks, state normalization, and resource-specific behavior.
- If subclass behavior still needs to be exposed through the main class module for compatibility with the rest of the sheet, keep thin wrapper exports in `<class>.ts` that delegate to the subclass registry instead of reimplementing the logic there.
- Keep shared subclass helpers in the parent `classFeatures` directory only when they are reused across multiple classes. If the helper only serves one class or one subclass family, keep it local to that class directory.
- Every codex subclass should have a matching runtime file, even if its initial implementation is only a small prepared-spell or empty derived-state module. This keeps ownership explicit and prevents future subclass logic from drifting back into mixed files.

### Runtime Mechanics Reference

- `Always-prepared spells`: class and subclass runtimes contribute `alwaysPreparedSpellIds`, and the spell-preparation flow excludes those ids from `normalizePreparedSpellIds`. They do not consume prepared-spell selection capacity, but they still spend spell slots when cast unless another feature explicitly grants a free cast or ritual cast.
- `Ritual spells`: ritual support is driven by `spell.ritual`. `CharacterSpellDrawer` exposes a ritual toggle when the current spell can be cast that way, and the ritual cast path applies the spell's normal action/concentration behavior without incrementing `spellSlotsExpended`. Wizard spellbook-only rituals also flow through this path when Ritual Adept allows them.
- `Concentration`: concentration is modeled as a status entry, not a loose boolean. `applySpellConcentrationToStatusEntries` removes the old concentration anchor and any concentration-linked effects before adding the new one, and rest/status update flows prune linked entries when concentration ends or durations expire.
- `Action cards and modals`: classes and subclasses create `FeatureActionCard[]` and optional `FeatureActionOptionCard[]` through their derived runtime state. `combatActions.ts` converts those cards into `GameplayActionDefinition` drawer/execute configs, and `ActionsWidget.tsx` opens `GameplayActionDrawer` or `CharacterSpellDrawer` from the selected card. Any actionable feature card needs both display data and execution wiring.
- `Multi actions`: extra action or bonus-action capacity is represented with `economyMultiCount`. `getEconomyShapeState` keeps a card usable after the normal round-tracker action is spent when extra counts remain, and the action shape shows that overflow capacity. The owning class runtime must also decrement its own extra-action state when the card is used.
- `Generic charges vs class resources`: the blue-dot tracker UI is the generic action/resource presentation for `usesRemaining` and `usesTotal` or `FeatureActionResource` tracker badges. Class-specific pools like Rage, Focus Points, Sorcery Points, Channel Divinity, Wild Shape, Lay On Hands, and similar resources should remain in `classFeatureState` with dedicated total, remaining, spend, and restore helpers. Action cards can display those pools, but they should not invent duplicate counters outside the class runtime.
- `Rest modal contract`: `app/src/components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/restOptions.ts` is the source of truth for Short Rest and Long Rest recovery checkboxes. If a generic blue-dot charge tracker or a named class/subclass resource recharges on a rest, it needs an explicit `RestOption` entry there with the correct label and `apply` function, even when the class module already has restore helpers. Recoverable resources should always be visible in the camp modal instead of being restored silently.
- `Visible activated statuses`: when an activated feature is supposed to create a temporary visible trait/effect in Traits & Conditions, prefer a persisted status entry that actually renders in the widget. In practice, activation-created timed effects should usually be stored as status-backed entries that remain visible and decrement over time; passive always-on benefits are the better fit for derived status entries.
- `Drawer description injections`: when an unlocked feature adds rules text to an existing drawer, spell, action, trait, skill, or weapon reference, inject it as a sourced additional-description section instead of appending it to the base description. Keep the target's `description` as the base text, and put feature-derived sections in `descriptionAdditions` or the surface's existing `additionalDescription` field. Use the shared helpers in `app/src/pages/CharactersPage/actionModalDescriptions.ts`, especially `createFeatureSourcedDescriptionEntries` or `appendFeatureSourcedDescriptionAddition`, so injected text is labeled and ordered by feature level. Ranger Favored Enemy and Hunter's Mark are the reference pattern: derive the unlocked feature text in the class runtime, create sourced sections, and let the drawer render them separately.

### Gameplay Card Defaults For Class Features

When a future request says to create an `action`, `bonus_action`, or `free` card for a class feature, treat that as a request to create a gameplay card in the `ActionsWidget` inside the Gameplay section.

- `Card naming`: by default, the card name should exactly match the class feature name being implemented.
- `Card placement`: `action`, `bonus_action`, and `free` map to the corresponding gameplay action type/card shape in the Gameplay action widget.
- `Drawer defaults`: clicking the card should open the standard gameplay action drawer. Unless the request explicitly asks for custom inputs, selectors, dropdowns, toggles, opt-in checkboxes, or other controls, the drawer description should reuse the class feature description by default.
- `Generic charges`: if the request says the feature has X charges and does not name a different resource pool, represent that with the generic blue-dot tracker UI (`Charges - - -`) using the normal `usesRemaining` / `usesTotal` flow.
- `Named resources`: if the request specifies a different resource, do not add blue dots. Instead, wire the card to spend/show that existing class resource using the `Use x resource-icon` presentation and the appropriate `classFeatureState` helpers.
- `Fallback resources`: if the request says a feature has a normal charge/use but can spend another named resource when depleted, the card should stay clickable whenever either the normal use or the fallback resource is available. Show the fallback cost inline on the card and in the drawer, spend the normal use first, then spend the fallback resource only after the normal use is gone, and disable the card only when neither path is available.
- `Rest recovery`: if the request says charges recover `per short rest`, `per long rest`, or `per short or long rest`, wire the recovery through runtime rest helpers and add the matching explicit checkbox entry to `GameplayForm/widgets/restOptions.ts`.
- `Activation-created traits`: if the request says `upon activation it creates a feature trait with X duration`, treat the drawer's primary blue activation button as creating a feature trait/status entry in the Traits and Conditions widget under the `feature` list.
- `Trait defaults`: unless stated otherwise, that created trait should reuse the class feature name as its title, reuse the class feature description as its description, and apply the requested duration exactly as specified in the feature request.
- `Trait visibility`: when I ask for a trait/effect/status to be created by a feature activation, I mean a visible entry in the Traits & Conditions widget that the player can inspect immediately after activation. Do not implement that as a hidden internal flag or as a non-rendering derived override.
- `Active-state gating`: only mark the card as active and block reuse while active when the feature text or my request implies an ongoing state that should not stack or be reactivated during its duration. If the feature resolves immediately and does not create an ongoing visible state, do not block reuse beyond its resource limits.

## Companions and Monster-backed Flows

Companions are now a first-class part of character state.

- `Character.companions` stores custom or inherited companion records.
- A companion can either be fully custom or inherit a `MonsterRecord` as its creature reference.
- `app/src/pages/CharactersPage/companions.ts` owns normalization and ID creation for persisted companion data.
- `CompanionsSection` is the main editor/inspection surface for companions and reuses the monster codex browsing pipeline.

Monster-backed flows are shared across multiple surfaces:
- the codex monster browser
- companion inheritance selection
- monster inspection drawers
- druid wild shape form selection and inspection

When adding new monster-powered UX, reuse the existing `MonsterRecord` shape, `useMonsterEntries`, and monster renderer/drawer components instead of building parallel data flows.

## Codex and Data Model

Codex data is still the main static rules and content source of truth for most categories. It is exported through `app/src/codex/entries` and consumed by the sheet, codex pages, and derived systems.

Main codex categories from `ENTRY_CATEGORIES`:
- spells
- weapons
- armor
- items
- backgrounds
- species
- classes
- rules
- monsters

There are also codex-adjacent registries that behave like structured game content even though they are not part of the main category enum:
- feats
- divinities
- reactions

Important current nuance:
- most codex categories are local/static in the app
- monster browsing is API-backed through the server and Mongo/Open5e import pipeline
- the frontend still uses shared monster types and renderers so monsters feel like a first-class codex category

Classes themselves are codex entries, and their level progression tables are part of that class data.

## Server-backed Monster Pipeline

Monster data now has a dedicated client/server flow.

- `server/src/middleware/validateMonsterListQuery.ts` normalizes and validates monster list query params.
- `server/src/services/monsterService.ts` builds Mongo filters/sorts and returns paginated monster list results plus single-monster lookups.
- `app/src/pages/CodexPage/useMonsterEntries.ts` is the shared frontend hook for loading paginated monster data.
- `MonsterCodexTable`, `MonsterEntryRenderer`, and `MonsterEntryDrawer` are the main shared UI surfaces for displaying monster records.

If a change affects monster filters, sorting, pagination, or record shapes, update both the server query pipeline and the frontend consumers together.

## Interaction Surfaces and Shared Mechanics

The app uses a few shared interaction surfaces repeatedly across the sheet.

- `Modals` are for management and selection flows that change character state.
- `Drawers` are for inspection and reference flows for spells, feats, weapons, divinities, keywords, monsters, and other sheet details.
- The `Dice Roller Popup` is the shared rolling surface used by stats, spellcasting, gameplay actions, and formula-driven interactions.

The intended distinction is simple:
- modals are for choosing and editing
- drawers are for reading and inspecting
- the dice roller is for executing a roll from an already-resolved formula

Other shared mechanics worth knowing about:
- keyword linking and reference descriptions connect many rules terms to reusable explanations
- rest flows fan out into resource recovery systems across classes and statuses
- derived status and trait systems let gameplay and class features surface passive or temporary effects in one place
- monster records now feed both codex reference surfaces and live character features such as companions and wild shape

### Proficiency Choice Inputs

When adding feat, class-feature, or similar proficiency choice inputs, reuse the existing sheet dropdown component (`SelectInput`) and the shared option helpers such as `buildSkillSelectOptions`, `buildToolSelectOptions`, and `getSelectableUnproficientToolOptions` where applicable. Choice dropdowns should start empty with a `-` option unless an existing saved choice is being edited. Options that are unavailable because the character already has that proficiency, has expertise, or selected the option in another slot should stay visible but disabled instead of being hidden.

## Editing Expectations

- Split large files instead of letting them grow. Prefer targeted helper files over adding another 100 lines to an existing hotspot.
- Do not reintroduce Vitest, Jest, Testing Library, Supertest, `server/tests`, `app/src/test`, or similar testing scaffolding without explicit user direction.
- When updating architecture docs, keep them aligned with the actual render order, feature surfaces, and data flow that exist in the codebase now.
