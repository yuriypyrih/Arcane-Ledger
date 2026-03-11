# DnD Companion - AI Agent Guide

This document gives AI agents the minimum complete context to work safely and consistently in this repository.

## 1) Project Snapshot

- Product: Offline-first DnD companion web app (PWA).
- Workspace layout:
  - `app/`: React + TypeScript + Vite frontend (primary product).
  - `server/`: Node/Express TypeScript boilerplate (not currently coupled to core frontend flows).
- Main user capabilities:
  - Dice rolling with rendered dice and roll history.
  - Character roster + builder + detailed sheet management.
  - Codex browsing for rules/classes/species/weapons/armor/items/spells/etc.
- Persistence:
  - Local storage for characters and UI preferences.
  - Codex entries are currently hardcoded (`app/src/codex/entries/data.ts`).

## 2) Tech + Runtime

- Frontend stack: React 18, React Router, TypeScript, CSS Modules, `react-hook-form`, `lucide-react`, Three.js.
- Build/dev commands:
  - `cd app && npm run dev`
  - `cd app && npm run build`
  - `cd app && npm run preview`

## 3) Routing and Pages

Defined in `app/src/App.tsx`.

### `/` - Home Page
File: `app/src/pages/HomePage/HomePage.tsx`

Sections:
- Hero (title, description, logo).
- Feature card grid (links into core app areas).

### `/dice` - Dice Page
File: `app/src/pages/DicePage/DicePage.tsx`

Sections:
- 3D dice viewport (`D20Viewport`).
- Dice controls overlay (selection + roll trigger).
- Roll history toggle + drawer.
- Result popup and error area.

Behavior:
- Rolling animates dice, then reveals computed result/breakdown.
- Keeps last 12 roll records in in-memory page state.

### `/characters` - Characters List
File: `app/src/pages/CharactersPage/CharactersPage.tsx`

Sections:
- Hero card with "New character" CTA.
- Character list cards (`CharacterList`):
  - Header row: name/species/class/level + actions (`View`, delete icon).
  - Compact ability row (STR/DEX/CON/INT/WIS/CHA).
- Delete confirmation modal.

Behavior:
- Delete is destructive and requires explicit confirmation modal.

### `/characters/new` and `/characters/:characterId/edit` - Character Builder
Files:
- `app/src/pages/CharactersPage/CharacterBuilderPage/CharacterBuilderPage.tsx`
- `app/src/components/CharactersPage/CharacterForm/CharacterForm.tsx`

Sections:
- Basic Profile (name/species/class/level, optional HP in edit mode, randomizer button).
- Abilities (custom or point-buy mode).
- Skills + Equipment (class/species-aware options).
- Background (alignment + notes).
- Wizard flow for creation (3 steps), single-form flow for edit.

Behavior:
- Randomizer defaults created character level to `1`.
- Class/species changes normalize invalid skills/equipment selections.
- Proficiency-based constraints enforced during selection and save normalization.

### `/characters/:characterId` - Character Sheet
File: `app/src/pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.tsx`

Top-level sections (modularized forms):
- `CharacterProfileForm`
- `GameplayForm`
- `StatsForm`
- `SkillsAndProficienciesForm`
- `EquipmentForm`
- `SpellCastingForm`

Key section responsibilities:

1. Character Profile
- Identity and background display/edit.
- XP shortcut opens XP popup.

2. Gameplay
- HP meter and HP stepper controls (damage/heal actions).
- Weapon action buttons (derived from equipped weapons + ability/proficiency math).
- Camp button opens rest popup.

3. Character Stats
- Two view modes: tabs vs full stack, persisted in preferences.
- Groups:
  - Core Stats (derived: AC, initiative, speed, passive perception, proficiency bonus, hit dice display).
  - Ability Modifiers.
  - Saving Throws (editable proficiencies; 3x3-style card layout maintained).

4. Skills and Proficiencies
- Skills grouped by ability in two columns.
- Skill levels: none/proficient/expert with visual distinction.
- Proficiencies split into:
  - Innate Proficencies (granted by sources like class/species).
  - Chosen Proficiences (manual).
- Edit mode updates skills and tool proficiencies together.

5. Equipment
- Selected loadout chips.
- Edit flow for selectable equipment filtered by class proficiency.
- Currency pill (gold with icon) opens currency drawer.

6. Spellcasting
- Spell slots grid.
- Known spells grouped by level.
- Spell detail drawer and spell management popup.

Overlays used on this page:
- Bottom drawers: loadout entry details, spell details, currency operations.
- Popups/modals: spell management, rest/camp, XP manager.
- Dice roller popup (reusable hook-based popup).

### `/codex` - Codex List
File: `app/src/pages/CodexPage/CodexPage.tsx`

Sections:
- Header panel (title + description).
- Filters:
  - Category dropdown (left).
  - Search input (right).
- Results grid:
  - Responsive columns (3 -> 2 -> 1 based on breakpoints).
  - Consistent card heights.
  - Entry subtitle for item type under title where applicable.
- Results title reflects category (`"Weapons Entries"`, `"Armor Entries"`, etc.).

Behavior:
- Selected category is URL-driven query param (`?category=...`) and preserved across navigation.

### `/codex/:entryId` - Codex Entry Detail
File: `app/src/pages/CodexEntryPage/CodexEntryPage.tsx`

Sections:
- Entry header (category badge, title, rarity).
- Summary.
- Detail grid (category-specific fields).
- Class/species entries include innate proficiency information.

Behavior:
- Back navigation preserves current codex category via URL param.

## 4) Domain Rules and Data Contracts

### Proficiency System (core invariant)

Relationship must remain:
- class -> defines proficiencies
- equipment -> defines type
- system -> checks class proficiency against equipment type

Implementation notes:
- Centralized in `app/src/pages/CharactersPage/proficiency.ts`.
- Equipment entries must not carry required-proficiency fields.
- Validation and filtering must share helper logic (avoid UI-only checks).

### Skills

- Skills enum and canonical list:
  - `app/src/types/skills.ts` (`Skill`, `SkillName`, `ALL_SKILLS`).
- Skill math:
  - `skillModifier = abilityModifier + proficiencyMultiplier * proficiencyBonus`
  - `proficiencyMultiplier`: 0 (none), 1 (proficient), 2 (expertise).

### Character model

File: `app/src/types/characters.ts`

Important fields:
- `currencies`: currently `{ gold: number }` with extension-friendly shape.
- `skills`, `skillExpertise`, `toolProficiencies`.
- `savingThrowProficiencies`.
- `equipment`.
- `hitDiceRemaining`, `coreStats` (display support + derived fields).

### Persistence + Normalization

- Characters: `app/src/pages/CharactersPage/storage.ts`
- Preferences: `app/src/storage/preferences.ts`

Best practice in this repo:
- When adding new character fields:
  1. Update `Character` and `CharacterDraft` typing.
  2. Add defaults in `createEmptyCharacter`.
  3. Add normalization/migration in storage loader.
  4. Patch creation/edit/random flows that construct drafts.

## 5) UI Architecture and Reusability Requirements

### Component structure

- Page-level composition in `app/src/pages/**`.
- Shared/reusable components in `app/src/components/**`.
- Character sheet refactored into focused form components under:
  - `app/src/pages/CharactersPage/CharacterSheetPage/components/`

### Styling

- CSS Modules only.
- Global design tokens and responsive spacing live in:
  - `app/src/styles/global.css`
- Mobile spacing is intentionally tighter; preserve token-based spacing (`--space-*`).

### Overlay primitives available today

1. Modal pattern
- Example: Character delete confirmation, dice roller popup, XP/rest/spell management popups.
- Typical structure:
  - backdrop (`position: fixed; inset: 0`) + centered card.
  - close on backdrop click + Escape key.

2. Bottom drawer pattern
- Used for loadout/spell/currency detail surfaces.
- Includes:
  - slide-up intro animation.
  - optional drag-to-close via header pointer handling.

3. Scroll lock utility
- Hook: `app/src/lib/useBodyScrollLock.ts`
- Must be used for any modal/drawer/backdrop to prevent background scroll.

4. Reusable dice roller popup
- Hook: `app/src/components/DicePage/DiceRollerPopup/useDiceRollerPopup.tsx`
- Can be summoned from any page/component to roll formulas with rendered dice.

### Reuse expectations (do not duplicate logic)

- Reuse existing helpers for:
  - proficiency filtering/validation,
  - gameplay stat derivations (AC, initiative, PB, passive perception, weapon actions),
  - codex formatting/utilities.
- New UI forms should follow existing section-card + shared header/action patterns before introducing new patterns.
- Keep interaction behavior consistent:
  - Escape closes active overlay,
  - backdrop click closes (unless explicitly blocked by product need),
  - no background scroll while overlay is open.

## 6) Safe Change Checklist for Agents

Before finishing a change:

1. Confirm type updates are reflected in defaults + storage normalization.
2. Confirm invalid character states are normalized/blocked (not only hidden in UI).
3. Reuse existing helper utilities; avoid copy-pasted business logic.
4. Keep responsive behavior intact (especially card grids, ability rows, and stats layouts).
5. Run a production build for frontend: `cd app && npm run build`.

