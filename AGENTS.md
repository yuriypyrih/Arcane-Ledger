# Architecture Guide for Agents

This file is the high-level architecture brief for agents working in this repository. The app is centered on a persistent local character sheet plus codex system, with most sheet behavior derived from codex data and current character state rather than hardcoded per-screen logic.

Useful source anchors:
- `app/src/pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.tsx`
- `app/src/pages/CharactersPage/classFeatures/index.ts`
- `app/src/codex/entries/*`

## Character Sheet Page

The Character Sheet page is the orchestration layer for a single character. It loads the saved character, places the sheet under a shared React Hook Form context, and persists all updates back through storage. The sections are intentionally separated into mostly self-contained components, but they all operate on the same character object and the same persistence callback.

Render order and purpose:
- `Character Profile`: identity, level/progression, and core sheet metadata.
- `Gameplay`: combat-facing controls, action economy, rests, traits and conditions, and live-session tools.
- `Character Stats`: abilities, modifiers, saves, initiative, speed, armor class, and formula inspection.
- `Class Features & Feats`: feature reference, feature-driven choices, and feat selection.
- `Skills & Proficiencies`: resolved skills plus grouped proficiencies, tools, armor, weapons, and languages.
- `Equipment`: loadout, item inspection, shop/custom equipment, currency, and equip state.
- `Spellcasting`: cantrips, prepared spells, spell slots, always-prepared entries, and divinities where applicable.
- `Thumb Dice Button`: global quick access to the dice roller.

## Class Feature Inheritance System

The class feature system has two layers.

The first layer is the codex progression layer. Each class defines a progression table as `FeatureClassObj[]`, where each row represents a level breakpoint. Rows list the class features unlocked at that level and can also include per-level values such as cantrips, prepared spells, spell slots, charges, or other class-specific counters. `featureOverrides` can replace or refine the shared description or tracking state for specific features at specific levels.

The second layer is the runtime derivation layer in `app/src/pages/CharactersPage/classFeatures/`. Each class runtime module takes the unlocked features plus stored feature state and turns them into actual sheet behavior. Runtime normalizers keep class-specific feature state valid for the current class and level. Per-class modules expose derived outputs such as actions, indicators, bonuses, proficiencies, statuses, spell access, always-prepared spells, and feature choices.

`app/src/pages/CharactersPage/classFeatures/index.ts` is the aggregator that merges those per-class outputs into one unified feature system that the rest of the sheet consumes. This is inheritance by derivation, not by class-component subclassing: the sheet asks the class-feature runtime what the current character gains, rather than hardcoding each class directly into each UI section.

## Codex and Data Model

Codex data is the static rules and content source of truth. It is exported through `app/src/codex/entries` and consumed by the sheet, codex pages, and derived systems.

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

Codex entry types define reusable rule and content objects. Sheet systems read those entries to build UI, derive formulas, populate pickers, and power inspection drawers. Classes themselves are codex entries, and their level progression tables are part of that class data.

## Interaction Surfaces and Shared Mechanics

The app uses a few shared interaction surfaces repeatedly across the sheet.

- `Modals` are used for management and selection flows that change character state.
- `Drawers` are used for inspection and reference flows for spells, feats, weapons, divinities, keywords, and other sheet details.
- The `Dice Roller Popup` is the shared rolling surface used by stats, spellcasting, gameplay actions, and formula-driven interactions.

The intended distinction is simple:
- modals are for choosing and editing
- drawers are for reading and inspecting
- the dice roller is for executing a roll from an already-resolved formula

Other shared mechanics worth knowing about:
- keyword linking and reference descriptions connect many rules terms to reusable explanations
- rest flows fan out into resource recovery systems across classes and statuses
- derived status and trait systems let gameplay and class features surface passive or temporary effects in one place
