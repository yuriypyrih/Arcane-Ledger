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

## Verification when adding content

Follow the test-scope agreement in [AGENTS.md](../AGENTS.md). Use the existing tests routinely;
focused additions need the approved feature/testing scope. Prefer observable effects over checking
that a contribution field exists. Useful risk cases include exhausted resources, repeated
confirmation, no spending on failure, selective recovery, save/reload, secondary-class ownership,
concentration replacement, removal of description additions, and unchanged base codex entries.

See [testing.md](testing.md) for the harness and performance commands. The progression matrix covers
registered content boundaries, not every new mechanic. Measure cold and warm paths separately;
reject a correctness tradeoff even if a benchmark improves.
