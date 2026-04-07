# Architecture Guide for Agents

This repository centers on a persistent local character sheet, codex-derived rules/content, and a server-backed monster pipeline. Most sheet behavior should be derived from codex data plus current character state rather than hardcoded per-screen conditionals.

## Repo Priorities

1. Code splitting comes first. Big files should always try to split into smaller ones before they grow further. If a file is already handling multiple concerns, extract subcomponents, hooks, helpers, constants, or per-feature modules instead of adding more inline logic.
2. This project should not contain tests. Do not add unit tests, component tests, integration tests, test configs, test helpers, or test-only dependencies unless the user explicitly reverses this policy.
3. Preserve derivation-driven architecture. Keep class behavior, spell access, actions, recoveries, statuses, and companion/monster behavior derived from shared state and codex/runtime modules rather than duplicating logic across screens.
4. Favor house cleaning when touching a feature area. Remove dead helpers, stale scripts, outdated docs, and leftover scaffolding when it is safe to do so.

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

## Editing Expectations

- Split large files instead of letting them grow. Prefer targeted helper files over adding another 100 lines to an existing hotspot.
- Do not reintroduce Vitest, Jest, Testing Library, Supertest, `server/tests`, `app/src/test`, or similar testing scaffolding without explicit user direction.
- When updating architecture docs, keep them aligned with the actual render order, feature surfaces, and data flow that exist in the codebase now.
