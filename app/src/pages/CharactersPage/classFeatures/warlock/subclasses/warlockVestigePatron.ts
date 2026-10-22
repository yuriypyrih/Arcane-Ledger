import { CLASS_FEATURE, SPELL_LIST_CLASS } from "../../../../../codex/entries/enums";
import {
  createVestigeCompanionStatBlock,
  vestigeCompanionName,
  type VestigeCompanionForm
} from "../../../../../codex/subclasses/warlockVestigeCompanion";
import {
  STATUS_DURATION_KIND,
  type Character,
  type CharacterCompanion,
  type MonsterRecord
} from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  CHARACTER_COMPANION_LIMIT,
  createCharacterCompanionId,
  normalizeCharacterCompanions
} from "../../../companions";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getProficiencyBonus } from "../../../gameplay";
import { getClassLevel } from "../../../multiclassState";
import { getSpellAttackRollFormulaForCharacter } from "../../../shared/spellFormulas";
import {
  appendSpellSummonCompanionsForCast,
  type SpellSummonDefinitionConfig
} from "../../../spellSummons";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter, SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { collectWarlockVestigeSpellContributions } from "./warlockVestigeSpells";
import { getVestigeRecoveryAction } from "./warlockVestigeRecovery";
import { getSemblanceOfLifeAction } from "./warlockSemblanceOfLife";

export const vestigePatronSubclassId = "warlock-vestige-patron";
export const vestigeCompanionActionKey = "warlock-vestige-companion";
export const vestigeCompanionDefinitionConfig: SpellSummonDefinitionConfig = {
  spellId: vestigeCompanionActionKey,
  defaultDuration: { kind: STATUS_DURATION_KIND.INFINITE }
};

export function getWarlockVestigeCompanionStatBlock(
  character: Character,
  form: VestigeCompanionForm = "Celestial"
): MonsterRecord {
  const charismaModifier = getAbilityModifierForCharacter(character, "CHA");
  const proficiencyBonus = getProficiencyBonus(character);
  return createVestigeCompanionStatBlock({
    warlockLevel: getClassLevel(character, "Warlock"),
    charismaModifier,
    proficiencyBonus,
    spellAttackModifier:
      getSpellAttackRollFormulaForCharacter(
        { isAttackSpell: true, spellLists: [SPELL_LIST_CLASS.WARLOCK] },
        character,
        "CHA"
      )?.attackBonus ?? proficiencyBonus + charismaModifier,
    form
  });
}

export function getWarlockVestigeCompanionAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.VESTIGE_COMPANION
  );
  if (!feature) return null;
  const hasCompanion = (character.companions ?? []).some(
    (companion) => companion.source === vestigeCompanionName
  );
  const disabledReason = hasCompanion
    ? "Dismiss your Vestige Companion before summoning another."
    : (character.companions ?? []).length >= CHARACTER_COMPANION_LIMIT
      ? "Remove a companion before summoning a Vestige Companion."
      : undefined;
  return {
    key: vestigeCompanionActionKey,
    name: vestigeCompanionName,
    sourceFeature: CLASS_FEATURE.VESTIGE_COMPANION,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Summon your Vestige Companion.",
    detail: "Choose and customize the companion's stat block and duration.",
    breakdown: "Summon companion",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    isActive: hasCompanion,
    disabled: Boolean(disabledReason),
    disabledReason,
    description: feature.description,
    drawer: {
      kind: "custom-form",
      description: feature.description,
      formKind: "warlock-vestige-companion",
      blockedReason: disabledReason
    },
    execute: { kind: "custom-form", formKind: "warlock-vestige-companion" }
  };
}

export function createWarlockVestigeCompanionDefinition(character: Character): CharacterCompanion {
  const monster = getWarlockVestigeCompanionStatBlock(character);
  return normalizeCharacterCompanions([
    {
      id: createCharacterCompanionId(),
      name: vestigeCompanionName,
      source: vestigeCompanionName,
      type: "Celestial",
      maxHitPoints: monster.hit_points,
      currentHitPoints: monster.hit_points,
      duration: vestigeCompanionDefinitionConfig.defaultDuration,
      inheritedCreatureEntry: monster,
      description: getWarlockVestigeCompanionAction(character)?.description?.join("\n\n")
    }
  ])[0];
}

export function summonWarlockVestigeCompanion(
  character: Character,
  definition: CharacterCompanion
): Character {
  const action = getWarlockVestigeCompanionAction(character);
  const companion = normalizeCharacterCompanions([definition])[0];
  if (!action || action.disabled || !companion?.inheritedCreatureEntry) return character;
  return appendSpellSummonCompanionsForCast(character, [
    { ...companion, source: vestigeCompanionName }
  ]);
}

function collectVestigePatronContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const action = getWarlockVestigeCompanionAction(character);
  const power = getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.VESTIGE_POWER);
  const recovery = getVestigeRecoveryAction(character);
  const semblance = getSemblanceOfLifeAction(character);
  return [
    ...collectWarlockVestigeSpellContributions(character),
    ...(action
      ? [
          {
            source: createSubclassContributionSource({
              id: vestigeCompanionActionKey,
              label: vestigeCompanionName,
              entryId: CLASS_FEATURE.VESTIGE_COMPANION
            }),
            actions: [action]
          }
        ]
      : []),
    ...(power
      ? [
          {
            source: createSubclassContributionSource({
              id: "warlock-vestige-power",
              label: power.name,
              entryId: CLASS_FEATURE.VESTIGE_POWER
            }),
            featureActionTransforms: [
              {
                id: "warlock-vestige-power-description",
                transform: (action: FeatureActionCard) =>
                  action.key === vestigeCompanionActionKey
                    ? appendFeatureSourcedDescriptionAddition(
                        action,
                        character,
                        CLASS_FEATURE.VESTIGE_POWER,
                        power.description
                      )
                    : action
              }
            ]
          }
        ]
      : []),
    ...[recovery, semblance].flatMap((featureAction) =>
      featureAction
        ? [
            {
              source: createSubclassContributionSource({
                id: featureAction.key,
                label: featureAction.name,
                entryId: featureAction.sourceFeature
              }),
              actions: [featureAction]
            }
          ]
        : []
    )
  ];
}

export const getWarlockVestigePatronDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectVestigePatronContributions)
  );
