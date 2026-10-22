import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { SpellEntry } from "../../../../../codex/entries";
import {
  getSkillProficiencyForSkillName,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  type Character
} from "../../../../../types";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getClassLevel } from "../../../multiclassState";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter, SubclassRuntimeResolver } from "../../subclassRuntime";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";
import {
  getHypnoticPresenceAction,
  restoreHypnoticPresenceOnLongRest
} from "./wizardEnchanterHypnoticPresence";
import {
  getInstinctiveCharmReaction,
  restoreInstinctiveCharmOnLongRest
} from "./wizardEnchanterInstinctiveCharm";
import {
  hasSplitEnchantment,
  restoreSplitEnchantmentOnLongRest,
  transformSplitEnchantmentSpell
} from "./wizardEnchanterSplitEnchantment";
import { transformAlterMemoriesSpell } from "./wizardEnchanterAlterMemories";

export const enchanterSubclassId = "wizard-enchanter";
export const enchantingConversationalistSkills = [
  SKILL.DECEPTION,
  SKILL.INTIMIDATION,
  SKILL.PERSUASION
] as const;

export function normalizeEnchantingConversationalistSkill(
  value: unknown,
  character: SubclassRuntimeCharacter
) {
  return getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.ENCHANTING_CONVERSATIONALIST
  )
    ? enchantingConversationalistSkills.find((skill) => skill === value)
    : undefined;
}

export function getEnchantingConversationalistSkill(character: SubclassRuntimeCharacter) {
  return (
    normalizeEnchantingConversationalistSkill(
      character.classFeatureState?.wizard?.enchantingConversationalistSkill,
      character
    ) ?? null
  );
}

export function setEnchantingConversationalistSkill(
  character: Character,
  selection: string
): Character {
  if (
    !getFeatureDescriptionMetadataForCharacter(
      character,
      CLASS_FEATURE.ENCHANTING_CONVERSATIONALIST
    )
  )
    return character;
  return replaceClassFeatureState(character, "wizard", {
    ...character.classFeatureState?.wizard,
    enchantingConversationalistSkill: normalizeEnchantingConversationalistSkill(
      selection,
      character
    )
  });
}

function collectWizardEnchanterContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const contributions: FeatureContributionSpec[] = [];
  if (hasSplitEnchantment(character)) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "wizard-enchanter-split-enchantment",
        label: "Split Enchantment",
        entryId: CLASS_FEATURE.SPLIT_ENCHANTMENT
      }),
      spellTransforms: [
        {
          id: "wizard-enchanter-split-enchantment-description",
          transform: (spell) => transformSplitEnchantmentSpell(character, spell)
        }
      ]
    });
  }
  const alterMemories = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.ALTER_MEMORIES
  );
  if (alterMemories) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "wizard-enchanter-alter-memories",
        label: alterMemories.name,
        entryId: CLASS_FEATURE.ALTER_MEMORIES
      }),
      spellTransforms: [
        {
          id: "wizard-enchanter-alter-memories-description",
          transform: (spell) => transformAlterMemoriesSpell(character, spell)
        }
      ]
    });
  }
  const instinctiveCharm = getInstinctiveCharmReaction(character);
  if (instinctiveCharm) {
    contributions.push({
      source: createSubclassContributionSource({
        id: instinctiveCharm.id,
        label: instinctiveCharm.name,
        entryId: CLASS_FEATURE.INSTINCTIVE_CHARM
      }),
      reactions: [instinctiveCharm]
    });
  }
  const hypnoticPresence = getHypnoticPresenceAction(character);
  if (hypnoticPresence) {
    contributions.push({
      source: createSubclassContributionSource({
        id: hypnoticPresence.key,
        label: hypnoticPresence.name,
        entryId: CLASS_FEATURE.HYPNOTIC_PRESENCE
      }),
      actions: [hypnoticPresence]
    });
  }
  const conversationalist = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.ENCHANTING_CONVERSATIONALIST
  );
  const selection = getEnchantingConversationalistSkill(character);
  if (conversationalist && selection) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "wizard-enchanter-enchanting-conversationalist",
        label: conversationalist.name,
        entryId: CLASS_FEATURE.ENCHANTING_CONVERSATIONALIST
      }),
      skillProficiencyEntries: [
        {
          source: PROFICIENCY_SOURCE.CLASS,
          sourceStr: conversationalist.name,
          proficiency: getSkillProficiencyForSkillName(selection)!,
          proficiencyLevel: PROF_LEVEL.PROFICIENT,
          overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
        }
      ],
      skillBonuses: [
        {
          id: "wizard-enchanter-enchanting-conversationalist-bonus",
          getBonuses: (skill) =>
            skill === selection
              ? [
                  {
                    label: `INT (${conversationalist.name})`,
                    abilityModifierSource: "INT",
                    minimumValue: 1
                  }
                ]
              : []
        }
      ]
    });
  }

  const savant = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.ENCHANTMENT_SAVANT
  );
  if (savant) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "wizard-enchanter-savant",
        label: savant.name,
        entryId: CLASS_FEATURE.ENCHANTMENT_SAVANT
      }),
      alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
        ...character,
        level: getClassLevel(character, "Wizard")
      })
    });
  }
  return contributions;
}

export const getWizardEnchanterDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectWizardEnchanterContributions),
    { character: character as Character }
  );

export function restoreEnchanterOnLongRest(character: Character): Character {
  return restoreInstinctiveCharmOnLongRest(
    restoreSplitEnchantmentOnLongRest(restoreHypnoticPresenceOnLongRest(character))
  );
}

export function transformEnchanterSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  return transformAlterMemoriesSpell(character, transformSplitEnchantmentSpell(character, spell));
}
