# Extending subclasses and feats

This describes the implemented extension paths after the September 2026 scalability pass.
It introduces no new rule language or saved-sheet format. The examples point to existing mechanics;
use the closest mechanic as a starting point and keep different rules explicit.

## Ownership and the complete path to the sheet

| Concern                                                      | Owner                                                              | Example                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------- |
| Names, unlock levels, progression, reference text            | `app/src/codex/`                                                   | `subclasses/featureRow.ts`, `progression.ts`   |
| Class registration, normalization, action dispatch, recovery | `pages/CharactersPage/classFeatures/<class>/module.ts`             | `paladin/module.ts`                            |
| Subclass-specific derivation and transitions                 | `<class>/subclasses/`                                              | `paladin/subclasses/paladinOathOfDevotion.ts`  |
| Reusable grants, modifiers, actions, descriptions            | `FeatureContributionSpec` and projection helpers                   | `featureContributions/`                        |
| Feat choice rules                                            | `feats/choices.ts`, `singleAbilityChoices.ts`, `cantripChoices.ts` | Mage Slayer, Telepathic, Blessed Warrior       |
| Feat contributions                                           | `feats/runtime/contributions/` keyed builders                      | `benefits.ts`, `spellGrants.ts`, `statuses.ts` |
| Intrinsic spell execution                                    | `characterRuntime/spellImplementations/`                           | existing spell registry                        |
| Custom action controls and submission                        | `ActionsWidget/uiAdapters/<owner>.tsx`                             | `paladin.tsx`, `druid.tsx`                     |
| Explicit camp recovery                                       | `GameplayForm/widgets/restOptions.ts` and rest helpers             | existing resource options                      |

Paths in this table are relative to `app/src/` except where otherwise stated.

A contribution is useful only if its projection reaches a consumer. Trace an existing example all
the way from the collector through derived state to the displayed action, spell, modifier, resource,
or drawer. Keep a transition hook for spending, concentration replacement, status creation, or a
specialized roll; a declaration alone does not execute those operations.

## Formatting reference descriptions

Use separate description entries for paragraphs and the existing list entries for bullet or numbered
options. Use `<strong>Heading.</strong>` for bold subsection labels; raw underscore markers are not
bold markup. `<em>` remains available for italic text. An isolated Markdown table string with a
header, separator row, and one body row per line renders as a table in the shared description
component, including spell inspectors. Cells use the existing rich-text renderer; unsupported HTML
remains plain text. Malformed tables also fall back to plain text.

## Managing resources from drawer headers

Action and spell header tags can carry a runtime-only `ResourceManagementTarget` in
`management`. Charge and cost builders in `classFeatures/cardUsage.ts` preserve this metadata,
including fallback tags. Existing actions are bound by explicit action IDs in each class's
`resourceManagement.ts`; subclass counters live under that class's `subclasses/` directory.
`drawerResourceBindings.ts` aggregates those bindings in header order. Spell options use explicit
option and spell IDs in `spellResourceBindings.ts`, with feat and species adapters preserving
the owning feat record and individual free-cast spell.

Spell drawers derive a missing Charges header tag from each option's `usage.charges` through
`spellResourceHeaders.ts`, including unchecked and exhausted options. Explicit header tags keep
their presentation and are not duplicated. Charge-plus-resource options also derive a missing
cost tag from their bound counter or spell-slot pool, preserving fallback wording. Register the
charge and optional fallback resource in `spellResourceBindings.ts` in that order so header
controls adjust the correct saved counter; do not keep a second charge count for the header.

Adapters read the saved character and manually adjust only their resource. Reuse counter-only
spend/restore helpers, or `classCounterResource` when activation or rest helpers have other
effects. Never invoke activation, healing, rest recovery, action economy, or fallback payment
from a manual adjustment. Named resource widgets share these adapters and the counter modal
actions. No extra persisted counters are needed.

`DrawerResourceManagement` opens the existing resource modal above the drawer, retains drawer
selections, and handles local Escape/focus behavior. Slot targets preserve the selected or Pact
Magic pool and include exhausted eligible levels; Reset All affects only the selected level.
Hit Dice reuse the existing class-specific management rows. Weapon headers deduplicate the pools
for all shown resource-consuming options, including unchecked or exhausted options. Descriptive
tags and read-only inspection remain informational.

## A subclass: follow Holy Nimbus end to end

[Oath of Devotion](../app/src/pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfDevotion.ts)
shows a complete ordinary-use/fallback activation:

1. Codex progression owns the unlock level. The runtime uses the Paladin class level and selected
   subclass, including when Paladin is a secondary class. Total character level is a separate input.
2. `collectPaladinOathOfDevotionContributions` gates the action and returns its existing source ID,
   feature ID, card data, and execution discriminant. The subclass registry lives in
   `paladin/subclasses/index.ts`; class action dispatch lives in `paladin/module.ts`.
3. The resolver compiles and projects the same immutable context:

   ```ts
   projectCompiledContributionsToSubclassDerivedFeatureState(
     getCompiledFeatureContributions(character, collectPaladinOathOfDevotionContributions),
     { character: character as Character }
   );
   ```

   Keep collectors as stable module functions. Creating a fresh collector closure on every query
   defeats the collector/context identity cache. Do not mutate the compiled arrays or their entries.

4. `activateHolyNimbus` delegates the matching payment policy to `activatePaladinTimedFeature`.
   The adapter checks ownership and active state, spends the ordinary use first, then asks the
   owning subclass for a valid fallback slot. Missing payment is a no-op. The subclass supplies
   the actual timed status and retains its existing source ID and duration.
5. The resource remains in `classFeatureState.paladin`. Use `replaceClassFeatureState` for an
   immutable replacement, or `spendClassResource` for the matching bounded numeric-counter rule.
   Resolve total, remaining, ownership and cost in the owning runtime. Do not create a UI counter.
6. Expose recovery in the existing camp option construction as well as the owning rest helper.
   Deselecting a recovery must preserve the spent resource. Short-rest and long-rest policies
   need not match each other.
7. The ordinary card uses shared card usage and confirmation controls. A custom form, when needed,
   belongs in the owning UI adapter; the shared host still coordinates the drawer, dice, references,
   persistence, and action economy.

An empty derived object is not evidence that a subclass has no behavior: transitions and spell
implementations can remain in local hooks. Preserve base-class-before-subclass ordering.

## A feat: one ability choice with an independent resource

`singleAbilityChoices` describes the repeated ability-only editor family: saved field, label,
allowed abilities, legacy default, score cap, and ability validation. Its metadata feeds the
normalization wrappers, draft helpers, summaries, editor controls, and ability bonus builders.
Existing exports in `choices.ts`, `choiceOptions.ts`, and the editor helpers remain compatibility
entry points. Add a new matching definition instead of copying another editor and validator.

For a new feat, connect the full path explicitly: add its codex identity and entry in
`feats/definitions/` with the approved prerequisites; add any saved choice field to
`CharacterFeatEntry`; wire that field through `feats/normalization.ts`; then connect its pending
draft and save callback to `singleAbilityEditors` in `FeatEditorCard/index.tsx`. That registry
supplies the shared editor's field/callback mapping. Add the keyed runtime builder and verify the
result through the actual ability, spell, action, or resource consumer. Merely adding metadata to
`singleAbilityChoices` does not register a feat or persist its choice. A genuinely specialized
choice keeps its specialized editor and validation.

Do not assume the entire saved object contains only the selected ability. Mage Slayer and Telepathic
also have spent-use flags. Their normalization wrappers deliberately compose ability validation
with preservation of `guardedMindExpended` or `detectThoughtsExpended`. Drafts contain editor fields;
saved normalization must retain gameplay state. The resource round-trip tests in
[resources.test.ts](../app/tests/rules/resources.test.ts) demonstrate the required distinction.

The keyed contribution builders accept `FeatContributionContext` and update the existing
`FeatureContributionSpec<FeatDerivedState>`. For simple ability bonuses, reuse
`singleAbilityBonusBuilder`; specialized builders compose `addSingleAbilityBonus` with their
additional statuses. A builder returns false when its required choice is absent so the established
epic-boon fallback still applies. Do not change contribution or action IDs when extracting a builder.

For repeated spell grants, `appendFeatSpellGrants` shares construction while each feat supplies the
spell source, grant kind, ability, and free-cast data. Free casting and ordinary slot casting remain
separate paths. Always-prepared spells do not consume preparation capacity.

Blessed Warrior and Druidic Warrior share `cantripChoices`: list-specific options, two distinct
selections, saved normalization, draft validation, descriptions, and runtime spell lookup. Saved
normalization trims spell IDs; the draft decoder deliberately does not accept whitespace-padded
IDs. Preserve this difference. The shared `CantripChoiceEditor` keeps unavailable/duplicate options
visible but disabled. New choice families should start empty unless their approved behavior says
otherwise; the migrated families retain their existing defaults for compatibility.

`updateFeatEntries` adapts existing normalized feat records. Its default updates all matches (for
recovery); `firstMatch: true` spends only the first eligible record. Return the original entry for
an ineligible transition so the adapter retains the original character when nothing changed.

## Description injection and spell transformations

Keep the original codex entry immutable. Use `createSourcedDescriptionEntries`,
`appendFeatureSourcedDescriptionAddition`, and the related helpers in
[actionModalDescriptions.ts](../app/src/pages/CharactersPage/actionModalDescriptions.ts).
Source labels, level labels and entry ordering are part of the displayed behavior. Identical text
from different sources must remain distinguishable; repeated additions from the same source must
not accumulate when a drawer is reopened.

For a reusable description lane:

- Collect the active `descriptionAdditions` with the same collector used for derived state.
- Query `getFeatureDescriptionAdditions(compiled, target, context)` in the actual consumer.
  The index preserves collection order, unkeyed wildcard entries, exact target keys, and predicate
  IDs. Description factories still receive the current query context; their results are not
  cached solely by a spell ID.
- For a spell or weapon action already present on the sheet, prefer its transform lane. Follow
  Devotion's `appendSmiteOfProtectionDescription` for an existing feature action.
- Verify removal as well as addition: a level decrease, removed feat, unequipped item, or ended
  status must remove its sourced benefit from a drawer that is already open.

Public spell helpers and runtime snapshots delegate to `spellEntryTransformer.ts`. Ordinary casting
uses cantrip scaling, class, subclass, feat, then species transforms. Spellbook mode is deliberately
separate and supports Wizard as a secondary class. Intrinsic roll/apply behavior stays in the spell
implementation registry. Do not add a competing transform chain to a component.

Necromancer, Transmuter, Enchanter, and Conjurer use the shared Savant dropdowns and always-spellbook
grants, filtered to Necromancy, Transmutation, Enchantment, and Conjuration respectively. Their
choices retain their positions so the first two are limited to spell levels 1–2, with one further
choice at each new Wizard spell-slot tier. These grants do not automatically prepare the chosen spells.

Conjurer's level-3 Benign Transposition is a Bonus Action with the full feature description and
Intelligence-modifier charges (minimum one). Activation spends one charge; explicit Long Rest
recovery restores the pool, while Short Rests do not. Teleportation and swapping places remain
manual, so Benign Transposition is semi-tracked; Conjuration Savant is tracked.

At Wizard level 6, Distant Transposition adds its description to Benign Transposition and updates
the displayed range to 60 feet; spell-slot recovery remains manual. Durable Summons adds sourced
text to Conjuration spells supported by the shared summon-definition flow, including custom
summoning spells. A cast that spends a spell slot gives only its fresh companions twice the Wizard
level in Temporary Hit Points and appends plain-text feature notes, preserving their existing
descriptions. Rituals and free casts do not grant this benefit. The companion transform runs after
fresh-instance HP initialization, leaving saved definitions and existing companions unchanged.
Both spell drawers and feature-action spell casts use this hook. Damage resistance remains manual,
so both level-6 features are semi-tracked.

Focused Conjuration adds its level-10 description only to Conjuration spells with Concentration;
its protection from damage remains manual. At level 14, Splintered Summons adds its description
and an optional one-charge footer control to all summoning Conjuration spells, including custom
spells. Selecting it spends the shared charge when casting with a spell slot. Free casts and
rituals cannot spend this charge. Long Rest recovery is explicit in camp; Short Rests do not
restore it, and recovery with a level-5+ slot remains manual. Additional summons and their
current/maximum HP are defined by the player, so both features are semi-tracked. Normal casting
remains available when the optional charge is exhausted.

Enchanter's level-3 Enchanting Conversationalist starts with an empty Deception, Intimidation, or
Persuasion dropdown. The chosen skill receives a sourced proficiency floor and an Intelligence
modifier bonus (minimum +1), which updates with the character's current Intelligence. Selecting an
already-proficient skill is allowed for the bonus and preserves existing expertise. Changing or
clearing the choice removes only this feature's old grant and bonus.

Hypnotic Presence is a Magic action with Intelligence-modifier uses (minimum one), explicit Long
Rest recovery, and the shared spell DC formula for a Wisdom save using Wizard's Intelligence.
Activation spends one use; the target's saving throw and resulting conditions remain manual.

At level 6, Split Enchantment adds its description and a charge checkbox to every Enchantment
spell drawer. The checkbox requires casting with a spell slot and spends from one shared
Intelligence-modifier pool (no minimum use), restored through an explicit Long Rest option.
Additional targets and the effective spell-level increase remain manual. At level 10, Instinctive
Charm appears in Traits & Conditions as a reaction with one Long Rest charge and the Wisdom save
formula using Wizard's Intelligence. Its attack/save resolution and recovery from casting an
Enchantment spell remain manual; the charge header supports that recovery.

At Wizard level 14, Enchanter's Alter Memories adds its full sourced description to the 16
leveled Enchantment spells listed in `app/src/codex/subclasses/wizardAlterMemories.ts`. The list
was audited against all 55 current Enchantment spells, includes non-Wizard spell lists for
multiclass/granted spells, and excludes charm immunity/removal and other spell schools.
Antipathy/Sympathy qualifies for its Sympathy option only. Runtime checks use Set membership
and the unlocked feature metadata, including the Wizard class level in multiclass characters.
Keep the list aligned when spells are added or revised. This is reference text in spell and
spellbook drawers: the description retains the spell-slot requirement, and resolving targets,
saves, and memory changes remains manual.

Transmuter's Wondrous Alteration grants always-prepared Alter Self and appends its feature text to
the spell drawer. Its optional free cast uses one charge per Long Rest and casts at the base spell
level without spending a slot, including when no slots remain. The charge has an explicit camp
recovery option. Aquatic Adaptation, Change Appearance, and Natural Weapons benefits remain manual.

At Wizard level 6, Empowered Transmutation adds its description and an optional charge use to
leveled Transmutation spells without an attack roll or saving throw. The option requires a paid
spell slot and spends from one shared Intelligence-modifier pool (minimum one use), with explicit
Long Rest recovery. The effective spell-level increase remains manual. At level 10, Shape-shifter
grants always-prepared Polymorph, its full feature description, and a separate optional free casting
per Long Rest. Free Polymorph uses its base spell level and works with no slots remaining; the
self-transformation modifications remain manual.

Necromancy Spellbook adds Find Familiar without preparing it, grants Necrotic resistance, and
sources its drawer additions from the codex. The optional Undead Vitality
effect restores the player's HP by Wizard level plus the slot actually spent, capped at maximum HP.
Spell-cast effects receive that paid slot as `sourceSpellSlotLevel`; `spellSlotLevel` alone is only
the casting level and must not trigger slot-paid benefits on free, ritual, or item casts.
At Wizard level 6, Grave Resilience runs after a successful Arcane Recovery and removes one
Exhaustion level. Overwhelming Necrosis is reference text on spells with Necrotic damage. Undead
Thralls grants always-prepared Animate Dead with a separate optional free-cast charge, restored
through its explicit Long Rest option. Its spell-level increase and companion bonuses remain manual.
Harvest Undead appears in Traits & Conditions and heals by Wizard level only while Bloodied and
above 0 HP; sacrificing the Undead remains manual. Death's Master adds Bolster Undead, granting
Wizard-level temporary HP to companions whose type is Undead without replacing higher temporary
HP, with one charge restored through its Long Rest option. Extinguish Undead spends a Reaction and
the selected level 5+ spell slot; its trigger, explosion damage, and targets remain manual.

Caches are keyed by immutable object identity, including the source spell object and casting/book
mode. Two custom spell objects with the same ID may have different descriptions or formulas. Class
runtime views are keyed by both the outer character and class entry; editors still obtain fresh
working projections. Never mutate a cached view or reuse a character object after editing it.

## UI adapters, references, and immediate updates

Use existing action/form discriminants and `ActionFormAdapter` entries for matching custom forms.
Keep the body, footer, and submission function together in `uiAdapters/<owner>.tsx`; matching draft
initialization/reset values live in `formDrafts.ts`. Preserve specialized reset policies and guards.
Use `ActionDiceConfirmFooter` for the existing dice-confirm design, including its settings
control and d20 icon. Other action buttons retain their visual role and accessible name.

`applyActionResourceTransition` performs preparation, activation, and action-economy spending only
when activation changes the prepared character. Use it only for that policy. A failed activation
returns the original character and discards provisional preparation. Confirmation must recheck
live state rather than trust a stale displayed count.

Shared attack and spell payments use `classFeatures/economyMulti.ts`. Build a context with the
weapon/spell helpers, use `resolveEconomyPaymentForCharacterAction` for availability, and call
`payEconomyForCharacterAction` against live state when submitting. Its explicit `paid`/`unavailable`
result determines whether to commit the entire cast, including slots and effects. Object identity
does not indicate payment success; free/out-of-combat payments can legitimately leave state unchanged.

`economyPayment.ts` owns payment selection and attack-budget transitions. `economyPools.ts` adapts
the existing class counters, while subclass rules declare eligibility and per-use costs. Extra
Attack alternatives share a budget; Action Surge starts another complete Attack action. Independent
grants such as Flurry and Retaliation remain separate. Starting or spending an Attack action updates
all class representations directly rather than replaying other classes' attack handlers. Attack
effects such as Steady Aim and Shadow Step advantage remain in their owning runtimes.

Saved sheets keep their existing class counters. For spell-granted Extra Attack,
`roundTracker.spellExtraAttackUses` distinguishes a missing entry (no Attack action started), zero
(one extra attack remains), and one (spent). Normalization must preserve zero. Merely spending an
Action on another activity must not unlock an extra attack. Older saves without this marker
cannot distinguish those activities; a transformation saved mid-turn may need a new turn to
establish its attack budget.

`useNestedReferences` and `NestedReferenceDrawers` preserve nested reference priority and existing
lazy drawers. The host retains its Escape handler and any special tooltip behavior. Use
`useMonsterPickerRecords` for cache/offline preview and cancellation, `useCustomBestiaryRecords`
for account-scoped custom records, and `useMonsterPickerPage` for pagination. Callers still own
eligibility filters and single/multiple selection. A canceled or stale `resolveMonster` returns null;
do not commit that selection.

When a sheet section starts reading another character field, audit `selectors.ts` and `domains.ts`.
Do not narrow invalidation on intuition: ability edits can affect AC, HP, attacks, saves, skills,
spell formulas, and reference text. Preserve lazy snapshots and full normalization boundaries until
an equivalent targeted transition is demonstrated. Nothing in this pass adds an asynchronous load
before casting, equipping, or sheet recalculation.

## Embedded companion templates

Reanimator's stat block lives in `codex/subclasses/artificerReanimatorCompanion.ts`.
Its subclass runtime resolves Artificer level, Intelligence, total-level proficiency, and the
shared spell attack/save modifiers before passing the block to `SummonDefinitionPanel`.
The panel's optional `createDefaultMonster` creates a snapshot when the player opens a new
definition. Normal stat-block replacement and edits remain available; creation preserves those
edits. Resetting this embedded block calculates a fresh local copy without fetching a monster.
The companion description copies the action's base text and sourced additions, including the
full Strange Modifications text from Artificer level 5 and the unlocked Improved Reanimation,
Macabre Modifications, and Refined Reanimation descriptions, as editable plain text. Modification
choices remain descriptive; the player can edit the stat block to reflect their choices. New or
reset default blocks use 4d4 Death Burst damage and ignore Necrotic Resistance at Artificer level 9.
Previously saved blocks remain snapshots, preserving manual edits.

Refined Reanimation grants Facilitated Revival through the fixed-spell action flow at level 15,
including before Raise Dead becomes always prepared at level 17. This casting removes Material
components, consumes its own persisted charge only when cast, and has an explicit Long Rest
recovery option. Life Transfer uses the existing reaction drawer: select a living Reanimated
Companion, heal from its current HP up to the character's effective maximum, and mark that
companion dead at 0 HP. The companion remains listed, its own Death Burst text is shown for
resolution, and a dead companion does not prevent creating a replacement.

## Verification when adding content

Follow the test-scope agreement in [AGENTS.md](../AGENTS.md). Use the existing tests routinely;
focused additions need the approved feature/testing scope. Prefer observable effects over checking
that a contribution field exists. Useful risk cases include exhausted resources, repeated
confirmation, no spending on failure, selective recovery, save/reload, secondary-class ownership,
concentration replacement, removal of description additions, and unchanged base codex entries.

See [testing.md](testing.md) for the harness and performance commands. The progression matrix covers
registered content boundaries, not every new mechanic. Measure cold and warm paths separately;
reject a correctness tradeoff even if a benchmark improves.

## College of Spirits: channeling and manual spirit effects

The revised College of Spirits uses the feature descriptions in `codex/subclasses/bard.ts`.
Its subclass runtime owns Guidance at 60 feet, playing-card proficiency, previously saved
spirits (including duplicates), and Empowered Channeling resources. Playing cards are
added through the normal inventory flow. Bardic Inspiration uses its ordinary payment and
action flow, with the full Spirits from Beyond description added to its drawer. It has no
spirit-channeling checkbox or automatic spirit roll. At level 14, Mystical Connection adds
only its description to that drawer; its extra roll and spirit choice are manual. Existing paid
pending rolls remain resolvable through Choose Channeled Spirit for saved-sheet compatibility.
Rest options explicitly release stored spirits and restore the separate free-casting and cover resources.

Controlled Channeling and unleashing are described in Bardic Inspiration without separate action
cards. Players track random channeling, Controlled Channeling and its resource cost, unleashing,
healing, damage, and target effects manually.
Once Empowered Channeling is unlocked, Power from Beyond's description
is added to damage and healing spell drawers. Its qualifying Bard spell-slot cast, once-per-turn
use, roll, and bonus are tracked manually. Spiritual Manifestation has no separate action card;
its opt-in in the Spirit Guardians drawer casts the spell at its base level without spending a
spell slot, consuming its Long Rest charge. The separate Half Cover opt-in is shared by ordinary
and free Spirit Guardians casting, consumes its own Short/Long Rest charge, and creates a
Concentration-linked reminder; cover bonuses are manual.
These manual boundaries are recorded in the features' Semi-tracked messages.

### Grave and Arcana Domains

The Cleric-local subclass runtimes implement the in-app level 3/6/17 domain descriptions.
Both domains grant their table spells without using preparation capacity. Student of Arcana
starts with empty skill and two Wizard-cantrip choices; Magical Mastery has one Wizard-spell
choice at each of levels 6–9. These remain Cleric spell grants and use ordinary spell slots.

Grave transforms Spare the Dying to a Bonus Action. Pull of Death uses opt-in controls in
weapon and damaging-spell drawers and one shared turn counter, with its die increasing at
Cleric level 11. The player confirms the target is below its maximum HP. Return to Life's
maximum healing at 0 HP is supplied as sourced reference text, following Life Domain's
existing healing-description pattern; the player applies the maximum healing result.
Path to the Grave spends Channel Divinity, creates a one-round reminder ending at the next
turn start, and exposes a free action to end a curse on a hit. Target disadvantage and extra
damage are applied by the player. Sentinel at Death's Door spends its reaction charge and
recovers explicitly at camp; damage halving and critical-hit cancellation remain manual.
Keeper of Souls uses a compact Myself/Another switch in the drawer body and one confirmation
button in the footer. It spends its ordinary charge before a level 6+ slot, blocks use while
Incapacitated, and recovers on either rest. Self-healing updates the sheet;
the player applies healing to another creature.

Arcana's Fortifying Spell and Tenacious Spell are free Channel Divinity options with shared
dice-confirm footers. They roll and spend the existing pool; the player confirms the trigger
and applies the result. Dispelling Recovery is an explicit Dispel Magic drawer option after
a qualifying spell: no additional action or slot, ordinary use first, then Channel Divinity.
Its recovery is an explicit short/long-rest camp option. Enhanced Necromancy is an opt-in
spell checkbox that spends Channel Divinity. It is offered for Grave table spells and level
0–5 Necromancy spells; the player confirms single-target eligibility and extra components.
The sheet does not infer enemy HP, saves, deaths, target counts, or spell-removal outcomes.

### Hollow Warden

The Ranger subclass grants its always-prepared spells at Ranger levels 3, 5, 9, 13, and 17
without using preparation capacity. Wrath of the Wild is a Bonus Action that spends the
existing Favored Enemy pool and creates a removable 10-turn feature trait. While active,
Ancient Armor grants +1 AC, increasing to +2 at Ranger level 11. The action and trait drawers
reuse the feature description and the spell DC formula display with Wisdom. Incapacitation,
death, or losing the subclass ends the transformation; its duration uses the normal turn/rest
flow. Prowling Retribution and Unnerving Aura remain reference text for manual resolution.
At Ranger level 7, Hungering Might adds the Wisdom modifier (minimum +1) to Constitution
saving throws even when Wrath of the Wild is inactive. Its first description paragraph appears
in the Constitution ability drawer; its second appears as a sourced addition in Wrath of the
Wild's action drawer. The player resolves the Bloodied hit trigger and healing manually.
At Ranger level 11, Rot and Violence is appended to Wrath of the Wild's action and trait
descriptions; the player resolves its effects. At Ranger level 15, Ancient Might adds
Ominous Strikes to every weapon and Unarmed Strike drawer, with its extra damage applied
manually. Persistent Wrath and Timeless appear in the Book of Life and Death. Persistent
Wrath is available at 0 HP while transformed, before death or stabilization, and sets HP to
twice the Ranger level (capped at maximum HP). It spends its Long Rest charge first, then
the lowest available level 4+ spell slot to restore and immediately spend the charge; the
button shows that slot's level and pool. Its charge has an explicit Long Rest camp option.
Timeless's Exhaustion immunity remains reference text for manual application.

### Phantom

At Rogue level 3, Wails from the Grave adds its codex description and a charge-tracked opt-in
to Sneak Attack. Confirming a selected use spends one charge and rolls half the Rogue's
Sneak Attack dice (rounded up) separately as Necrotic damage for the second target. Uses
equal the Dexterity modifier (minimum one), with explicit Long Rest recovery in camp.
Target eligibility and the on-your-turn trigger remain the player's responsibility. Wails
requires at least one Sneak Attack damage die after Cunning Strike costs. All Rogues see
their available Sneak Attack dice in the drawer header, updating with Cunning Strike choices.
Whispers of the Dead starts empty and grants one selected skill or tool proficiency. The
dropdown disables proficiencies already held; replacing the choice removes its previous
grant. The player changes this choice after a Short or Long Rest.
At Rogue level 9, Tokens of the Departed adds the Soul Trinket resource (Ghost icon),
starting at two with a maximum of two, three at level 13, and four at level 17. The gaining
reaction adds one, or replaces one at capacity, and spends the Reaction. Long Rest recovery
raises counts below two to two without reducing larger counts. Holding at least one grants
Advantage on Constitution and Death Saving Throws. Wails spends an ordinary charge first
and can spend a trinket when charges are exhausted.
Spirit Query always prepares Augury using Constitution; its required opt-in spends one
trinket to cast as a Magic action without slots or components. It cannot be bypassed with
ritual casting. The player handles the nearby-death trigger and spirit questions.
Voice of Death adds a level 9 Magic action card with one charge that opens Speak with Dead.
Casting spends the charge without a spell slot or components and uses Dexterity for
spellcasting. The card and spell drawer reuse the feature description, including the option
to address a soul trinket. Both camp rest menus explicitly restore the charge; opening or
closing the spell drawer does not spend it.
At Rogue level 13, Ghost Walk adds a Bonus Action that spends its one Long Rest charge first,
then one Soul Trinket for subsequent uses. It creates a removable 10-minute feature trait
with the same codex description and grants a 10-foot Fly Speed with hover while the trait is
active. Reusing it refreshes the existing trait. Camp explicitly offers Long Rest charge
recovery; a Short Rest removes the timed trait without restoring its charge. Hazy Form and
Incorporeal Movement remain reference text for the player to apply.
At Rogue level 17, Death's Friend adds its Death's Lament description to Sneak Attack and
its Draw of Death description to Initiative. Rolling Initiative grants one Soul Trinket
only when the pool is empty; opening the drawer does not grant one. Existing trinkets are
preserved. Applying Death's Lament damage to both targets remains the player's responsibility.

### Shadow Sorcery

Shadow Spells grants the codex spell list at Sorcerer levels 3, 5, 7, and 9 as always prepared,
without consuming preparation capacity. The spells retain their normal casting costs.
At level 3, Power of Shadow derives 120-foot Darkvision and 10-foot Blindsight as feature senses.
Strength of the Grave adds its codex description and one charge to the Book of Life and Death.
At 0 HP before death or stabilization, an available charge activates the Book and enables its
Use button. Using it spends the charge, sets HP to Sorcerer level plus the effective Charisma
modifier (clamped to the character's HP bounds), and clears death saves and HP-based
Unconsciousness. The player resolves the described saving throw before applying a successful
use. Camp explicitly offers charge recovery on a Long Rest; a Short Rest preserves spending.
At Sorcerer level 6, Beasts of Ill Omen adds a Bonus Action card whose confirmation opens
Summon Beast. Casting from this drawer spends 3 Sorcery Points, uses the Bonus Action,
and requires neither preparation, a spell slot, nor Material components. Opening and closing
the drawer does not spend points. Its optional Without Concentration checkbox changes the
casting's displayed duration to 1 minute and tracks both the spell effect and defined summon
for 10 round ends, preserving other concentration. Recasting through the feature replaces
its previous summon and Summon Beast effect. The shadow appearance and nearby enemies'
saving-throw Disadvantage remain reference text for the player to apply.
At Sorcerer level 14, Shadow Walk adds a Bonus Action card and reuses its codex description;
the player resolves lighting and the teleport destination.
At level 18, Umbral Form adds its description and two mutually exclusive opt-in choices to
Innate Sorcery: Incorporeal Movement or Shadow Resilience. Both share one Long Rest charge,
then fall back to 6 Sorcery Points. Activation validates the combined cost when Innate Sorcery
also needs its 2-point fallback. The chosen form becomes a saved trait with only that form's
description and a duration linked to Innate Sorcery. It can be ended separately without an action.
Shadow Resilience adds linked All damage but Force and All damage but Radiant resistance
entries; ending either Umbral Form or Innate Sorcery removes them. Camp explicitly offers
Umbral Form charge recovery on a Long Rest. Incorporeal movement, its damage, and seeing
through the character's own Darkness remain reference text for the player to apply.

### Undead Patron

Undead Spells grants the codex list as always prepared at Warlock levels 3, 5, 7, and 9,
without consuming preparation capacity or changing spell-slot costs.
At level 3, Form of Dread adds a Bonus Action with charges equal to the effective Charisma
modifier (minimum one), recovered through an explicit Long Rest camp option. Its drawer and
saved 10-turn trait reuse the entire feature description. Activation spends a charge and rolls
1d10 plus Warlock level through the shared dice footer; only Full Auto applies the temporary
HP result. Other dice modes leave HP entry to the player. Temporary HP is granted once and
does not depend on keeping the form active.
The form grants linked Frightened immunity, clearing an existing Frightened condition.
Expiration, early dismissal, or becoming Incapacitated ends the form and its immunity.
While active, sourced Frightful Avatar text appears in all weapon drawers (including Unarmed
Strike) and spells marked as attack spells. The player resolves its saving throw and target
condition. At Warlock level 6, Grave Touched adds a permanent, non-editable feature trait
containing its full codex description. Its benefits remain reference text for the player to apply.
The trait is derived from the unlocked feature and disappears if the character no longer
qualifies. Dreaded Necrosis is also added as sourced text to the Form of Dread action drawer.
At level 10, Necrotic Husk derives Necrotic resistance, replaced by immunity while Form of
Dread is active. Its Necrotic Resilience section is added to that action drawer.
Unholy Resuscitation adds its section and one charge to the Book of Life and Death. At 0 HP
before death or stabilization, an available charge activates the Book and enables its Use button.
Using it spends the charge, sets HP to twice Warlock level (within the HP maximum), clears
death saves, and adds one Exhaustion level through the shared status rules. Camp explicitly
offers charge recovery on both Short and Long Rests. The eruption's damage and target saving
throws remain reference text for the player to resolve.
At level 14, Superior Dread adds its full codex description to the Form of Dread action drawer.
While the form is active, it grants Bludgeoning, Piercing, and Slashing resistance, plus a Fly
Speed that follows the current Walk Speed and the ability to hover. These derived benefits end
with the form. Passing through creatures and objects, its Force damage, and Profane Casting
remain reference text for the player to apply.

### Vestige Patron

Vestige Patron feature descriptions preserve the supplied source wording in the codex, build
rows, and action drawer. Vestige Spells shows all four domain spell lists in place of the source's
example. Vestige Companion references use an inline link to the local stat block inspector;
the descriptions do not embed its statistics. The reference displays scaling formulas, while
the summon editor calculates the character's stats.
At Warlock level 3, Vestige Companion adds a Magic action with the feature's codex description.
Opening the drawer predefines one summon with the frontend Vestige Companion stat block.
The player can edit it or delete it and define it again; the add-summon button is hidden when
another definition cannot be added.
Form is selected through the editor's Type field; changing it updates an unmodified Vestige
template. Celestial, Fiend, and Undead forms use their matching resistance and strike damage type. The
template calculates AC, HP, Hit Dice, Proficiency Bonus, and spell attack modifier from the
character; Pact Bond remains a reminder to add Proficiency Bonus to checks and saving throws.
Players can replace or edit the inherited stat block and choose the companion's duration.
Summoning spends an Action, adds one companion at full HP, and defaults to an indefinite
duration without concentration. The existing companion must be dismissed before another is
summoned. Modified Vestige stat blocks can be reset locally to the character's current stats.
Vestige Spells starts with an empty Cleric Domain choice: Life, Light, Trickery, or War. The
choice persists in Warlock feature state and grants that domain's codex spell table as always
prepared Warlock spells at Warlock levels 3, 5, 7, and 9, without using preparation capacity.
Changing domains replaces these derived grants; multiclass characters use their Warlock level.
At level 6, Vestige Power adds its full description to the Vestige Companion action drawer.
At level 10, Vestige Recovery adds a Reaction that requires the summoned vestige to be at 0 HP,
one available charge, and a Pact Magic spell slot. Using it spends both resources, restores the
companion to its HP maximum, and clears its death saves. It recognizes customized vestiges by
their summon source and spends the Warlock's Pact Magic pool for multiclass characters.
Its single charge persists in Warlock feature state and has an explicit Long Rest camp option;
Short Rests do not restore it.
At level 14, Semblance of Life adds a Magic action with one Long Rest charge. Its form editor
uses the existing monster picker and stat-block editor without restricting the chosen block;
the drawer suggests the matching spirit at half the Warlock level (rounded down, capped at 9).
Form Max HP determines the temporary HP grant, using the existing non-stacking temporary HP rule.
Activation adds a temporary stat block to the existing companion, retaining its HP, Hit Dice,
identity, and Divine Power. A saved 60-minute feature trait controls the form's lifetime,
including the existing rest fast-forward. A single reconciliation hook removes that temporary block when the trait ends
or is disabled, temporary HP reaches zero, or the feature is lost. It removes an orphan trait
when the companion is deleted, and duplicated companions do not inherit the active form.
Current HP changes, unrelated temporary HP, and other attached stat blocks are preserved.
Editing and saving a transformed companion retains the trait link. Removing its temporary
block also ends the trait. Previously saved snapshot-based forms migrate to the attached-block
representation during companion normalization.
All companions support additional stat blocks through the companion editor. All blocks display
together, newest first, in the companion and campaign inspection drawers. Only the first block
initializes name, type, and HP; attaching more blocks leaves those values unchanged. Each block
can be inspected, modified, reset, or removed independently. Cards show the top block's AC.
Spirit scaling, the 90-foot requirement, companion commands, Divine Power, shared resistance,
disappearance, and Recovery's teleportation remain manual.

### Arcane Archer

At Fighter level 3, Arcane Archer Lore offers a Druidcraft or Prestidigitation choice in
the feature row. The selected cantrip is always prepared and uses Intelligence, including
on multiclass characters. The two skill dropdowns automatically grant Arcana and Nature
when the character does not already have them. Existing proficiencies instead require a
replacement from the level-1 Fighter skill list; already proficient skills and the other
dropdown's choice remain visible but disabled. Choices persist in Fighter feature state,
while skill and spell grants are derived from the unlocked feature.

Arcane Shot Options displays two learned-option dropdowns at Fighter level 3, with another
at levels 7, 10, 15, and 18. Choices start empty, prevent duplicates, and persist in Fighter
feature state. The profile shows Arcane Shot Die once unlocked: D6 at Fighter level 3,
D8 at 10, D10 at 15, and D12 at 18. Ranged Ammunition weapon drawers include Using a Shot, the learned options,
and an Arcane Shot DC formula using Intelligence and the character's Proficiency Bonus.
The footer opt-in spends one Arcane Shot charge on Damage, with no option selection or
automatic shot damage/effects. Charges equal the Intelligence modifier (minimum one), and
Short and Long Rest camp options restore them. During tracked combat the option is limited
to once per turn; advancing the turn clears that restriction.

At Fighter level 7, Curving Shot adds its codex description to ranged Ammunition weapon drawers.
Its footer opt-in shows the Bonus Action badge and applies on Attack. Selecting it switches the
attack to a single Bonus Action attack, preserving the regular Action and remaining extra attacks.
It is unavailable after the Bonus Action has been spent in tracked combat. The miss, alternate
target, and range requirements remain manual.

At Fighter level 7, Magical Ammunition provides a Magic action with one charge that recovers
through the Short and Long Rest camp options. After that charge is spent, activation consumes
one Second Wind use instead. Each use creates an editable, indefinite trait with the feature
description; ammunition selection and effects remain manual. Existing ammunition traits are
preserved when the feature is used again.

At Fighter level 10, Ever-Ready Shot adds its codex description to the Initiative drawer.
Rolling initiative restores one spent Arcane Shot charge, up to the current maximum.

At Fighter level 15, Indomitable Teleport adds its codex description to the Indomitable action
drawer. At level 18, Masterful Shots appears among the reactions in Traits & Conditions, reusing
its codex description and the shared reaction spending flow. Teleportation, movement, and the
ranged attack are handled manually.

### Warrior of the Mystic Arts

Spellcasting unlocks at Monk level 3. Cantrip and prepared spell choices use the Sorcerer spell
list, with Wisdom for spell attack rolls and saving throw DCs. The level 3–20 progression lives
in `app/src/codex/classes/subclassSpellcasting.ts`, and the codex feature description renders its
rows from that same data. Spell selection, slot spending, persistence, and Long Rest recovery
use the standard spellcasting flows. Multiclass characters contribute one third of their Monk
levels, rounded down, to shared slots, while their Monk spell choices remain limited by Monk level.

The progression was checked against the [Arcana Unleashed subclass reference](https://dnd2024.wikidot.com/monk:warrior-of-the-mystic-arts)
and the matching level-3 spellcasting table in the [official Mystic Subclasses playtest](https://media.dndbeyond.com/compendium-images/ua/mystic-subclasses/mrF6k4xf0yYFJL2m/UA2026-MysticSubclasses.pdf).

At Monk level 6, Mystic Fighting Style lets Action cantrips spend one use of the existing
Action attack pool. Casting a cantrip first spends the Action and opens the same extra attack
as Unarmed Strike. That use can pay for another cantrip or an attack; there is no separate
once-per-turn cantrip limit. Cantrips do not use the Flurry of Blows Bonus Action pool.

Focused Strike adds its sourced description to Unarmed Strike at Monk level 11. Improved Mystic
Fighting Style adds its description to Flurry of Blows at level 17. Level-1 and level-2 spells with
an Action casting time can then spend two remaining Action attacks or two Flurry of Blows strikes
from the existing counters. Each pool is checked separately; one use from each cannot pay for a
cast. The Bonus Action spell path requires an activated Flurry with at least two strikes left.
It is hidden when no Flurry strikes remain and disabled when only one remains. Eligible spell
drawers include the level-17 feature description whether or not Flurry is currently active.
Normal casting with an unused Action remains available, and spell-slot costs are unchanged.
The shared spell paths and spending hooks cover prepared, feature-granted, and stored item spells.
