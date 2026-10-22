import { getSpellEntryById, type SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE, DAMAGE_TYPE, MAGIC_SCHOOL } from "../../../../../codex/entries/enums";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character
} from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getCharacterCustomSpellSnapshotBySpellId } from "../../../customSpells";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec,
  type FeatureSpellCastEffectContribution
} from "../../../featureContributions";
import { getClassLevel } from "../../../multiclassState";
import { extractDescriptionSection } from "../../../shared/descriptionSections";
import {
  createCharacterStatusEntry,
  getExhaustionLevel,
  setCharacterExhaustionLevel
} from "../../../statusEntries";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../traits";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter, SubclassRuntimeResolver } from "../../subclassRuntime";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";
import { collectNecromancerDeathMasterContributions } from "./wizardNecromancerDeathMaster";
import {
  animateDeadSpellId,
  getUndeadThrallsSpellCastEffects,
  hasUndeadThralls,
  transformUndeadThrallsSpell
} from "./wizardNecromancerUndeadThralls";

export const necromancerSubclassId = "wizard-necromancer";
export const undeadVitalityEffectId = "wizard-necromancer-undead-vitality";

export function hasNecromancySpellbook(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.NECROMANCY_SPELLBOOK) !==
    null
  );
}

function getNecromancyFeatureSection(
  character: SubclassRuntimeCharacter,
  feature: CLASS_FEATURE,
  heading: string
) {
  const description =
    getFeatureDescriptionMetadataForCharacter(character, feature)?.description ?? [];
  return extractDescriptionSection(
    description.filter((entry): entry is string => typeof entry === "string"),
    heading
  );
}

export function getNecromancySpellbookSpellIds(character: SubclassRuntimeCharacter): string[] {
  return hasNecromancySpellbook(character) ? ["spell-find-familiar"] : [];
}

export function supportsUndeadVitality(
  character: SubclassRuntimeCharacter,
  spell: Pick<SpellEntry, "magicSchool">
): boolean {
  return hasNecromancySpellbook(character) && spell.magicSchool === MAGIC_SCHOOL.NECROMANCY;
}

export function getUndeadVitalityHealing(
  character: SubclassRuntimeCharacter,
  slotLevel: number
): number {
  return hasNecromancySpellbook(character) &&
    Number.isInteger(slotLevel) &&
    slotLevel >= 1 &&
    slotLevel <= 9
    ? slotLevel + getClassLevel(character, "Wizard")
    : 0;
}

export function transformNecromancerSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const sections = [
    ...(spell.id === "spell-find-familiar"
      ? getNecromancyFeatureSection(
          character,
          CLASS_FEATURE.NECROMANCY_SPELLBOOK,
          "Undead Familiar."
        )
      : []),
    ...(supportsUndeadVitality(character, spell)
      ? getNecromancyFeatureSection(
          character,
          CLASS_FEATURE.NECROMANCY_SPELLBOOK,
          "Undead Vitality."
        )
      : [])
  ];
  let transformed = sections.length
    ? appendFeatureSourcedDescriptionAddition(
        spell,
        character,
        CLASS_FEATURE.NECROMANCY_SPELLBOOK,
        sections
      )
    : spell;
  if (
    spell.damage.some(([, types]) =>
      (Array.isArray(types) ? types : [types]).includes(DAMAGE_TYPE.NECROTIC)
    )
  ) {
    transformed = appendFeatureSourcedDescriptionAddition(
      transformed,
      character,
      CLASS_FEATURE.GRAVE_POWER,
      getNecromancyFeatureSection(character, CLASS_FEATURE.GRAVE_POWER, "Overwhelming Necrosis.")
    );
  }
  return transformUndeadThrallsSpell(character, transformed);
}

export function applyGraveResilienceAfterArcaneRecovery(character: Character): Character {
  const exhaustion = getExhaustionLevel(character.statusEntries);
  return getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.GRAVE_POWER) &&
    exhaustion
    ? {
        ...character,
        statusEntries: setCharacterExhaustionLevel(
          character.statusEntries,
          exhaustion > 1 ? exhaustion - 1 : null
        )
      }
    : character;
}

export function getNecromancerSpellCastEffects(
  character: Character
): FeatureSpellCastEffectContribution[] {
  if (!hasNecromancySpellbook(character)) return [];
  return [
    ...getUndeadThrallsSpellCastEffects(character),
    {
      id: undeadVitalityEffectId,
      apply: (current, context) => {
        const spell =
          getCharacterCustomSpellSnapshotBySpellId(current, context.spell.id)?.spell ??
          getSpellEntryById(context.spell.id);
        const healing =
          spell && supportsUndeadVitality(current, spell)
            ? getUndeadVitalityHealing(current, context.sourceSpellSlotLevel ?? 0)
            : 0;
        // A selected optional benefit must not cancel a free cast; it simply heals nothing.
        if (healing === 0) return { ...current };
        return reconcileCharacterStatusConsequences({
          ...current,
          currentHitPoints: Math.min(
            getEffectiveHitPointMaximumForCharacter(current),
            current.currentHitPoints + healing
          ),
          deathSaves: { successes: 0, failures: 0 }
        });
      }
    }
  ];
}

function collectNecromancerContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasNecromancySpellbook(character)) return [];
  return [
    ...collectNecromancerDeathMasterContributions(character),
    ...(hasUndeadThralls(character)
      ? [
          {
            source: createSubclassContributionSource({
              id: "wizard-necromancer-undead-thralls",
              label: "Undead Thralls",
              entryId: CLASS_FEATURE.UNDEAD_THRALLS
            }),
            alwaysPreparedSpellIds: [animateDeadSpellId]
          }
        ]
      : []),
    ...(getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.GRAVE_POWER)
      ? [
          {
            source: createSubclassContributionSource({
              id: "wizard-necromancer-grave-power",
              label: "Grave Power",
              entryId: CLASS_FEATURE.GRAVE_POWER
            }),
            featureActionTransforms: [
              {
                id: "wizard-necromancer-grave-resilience-description",
                transform: (action) =>
                  action.sourceFeature === CLASS_FEATURE.ARCANE_RECOVERY
                    ? appendFeatureSourcedDescriptionAddition(
                        action,
                        character,
                        CLASS_FEATURE.GRAVE_POWER,
                        getNecromancyFeatureSection(
                          character,
                          CLASS_FEATURE.GRAVE_POWER,
                          "Grave Resilience."
                        )
                      )
                    : action
              }
            ]
          } satisfies FeatureContributionSpec
        ]
      : []),
    {
      source: createSubclassContributionSource({
        id: "wizard-necromancer-savant",
        label: "Necromancy Savant",
        entryId: CLASS_FEATURE.NECROMANCY_SAVANT
      }),
      alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
        ...character,
        level: getClassLevel(character, "Wizard")
      })
    },
    {
      source: createSubclassContributionSource({
        id: "wizard-necromancer-spellbook",
        label: "Necromancy Spellbook",
        entryId: CLASS_FEATURE.NECROMANCY_SPELLBOOK
      }),
      alwaysSpellbookSpellIds: getNecromancySpellbookSpellIds(character),
      statuses: [
        createCharacterStatusEntry({
          id: "feature-wizard-necromancer-necrotic-resistance",
          sourceId: "feature-wizard-necromancer-necrotic-resistance",
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.NECROTIC,
          source: "Necromancy Spellbook",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: { kind: STATUS_DURATION_KIND.INFINITE },
          description: getNecromancyFeatureSection(
            character,
            CLASS_FEATURE.NECROMANCY_SPELLBOOK,
            "Necrotic Resistance."
          ).join("\n")
        })
      ],
      spellTransforms: [
        {
          id: "wizard-necromancer-spellbook-descriptions",
          transform: (spell) => transformNecromancerSpell(character, spell)
        }
      ]
    }
  ];
}

export const getWizardNecromancerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectNecromancerContributions),
    { character: character as Character }
  );
