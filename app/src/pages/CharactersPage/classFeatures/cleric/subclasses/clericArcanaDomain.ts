import {
  clericChannelDivinityActionKey,
  clericChannelDivinityOptionKeys
} from "../../channelDivinity";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import { getSpellEntriesForClassName } from "../../../../../codex/classes";
import type { Character, CharacterClericFeatureState } from "../../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL
} from "../../../../../types";
import { getClassLevel, getClassSubclassId, hasCharacterClass } from "../../../multiclassState";
import { getSkillProficiencyOptionsForClass } from "../../../proficiencyClassData";
import { getSkillProficiencyForName } from "../../../proficiencyResolvers";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeCharacter,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState } from "../../shared/resourceState";

export const arcanaDomainSubclassId = "cleric-arcana-domain";
export const arcanaSkillOptions = [
  ...new Set([SKILL.ARCANA, ...getSkillProficiencyOptionsForClass("Cleric")])
];
const wizardSpells = getSpellEntriesForClassName("Wizard");
export function getArcanaWizardSpellOptions(level: number) {
  return wizardSpells
    .filter((spell) => spell.spellLevel === level)
    .sort((a, b) => a.name.localeCompare(b.name));
}
const arcanaDomainSpellIdsByLevel = {
  3: resolveSpellIdsByName([
    "Detect Magic",
    "Magic Missile",
    "Magic Weapon",
    "Arcanist's Magic Aura"
  ]),
  5: resolveSpellIdsByName(["Counterspell", "Dispel Magic"]),
  7: resolveSpellIdsByName(["Arcane Eye", "Secret Chest"]),
  9: resolveSpellIdsByName(["Bigby's Hand", "Teleportation Circle"])
};
export function hasArcanaDomain(character: SubclassRuntimeCharacter, minimumLevel = 3): boolean {
  return (
    hasCharacterClass(character, "Cleric") &&
    getClassSubclassId(character, "Cleric") === arcanaDomainSubclassId &&
    getClassLevel(character, "Cleric") >= minimumLevel
  );
}
export function normalizeArcanaDomainState(
  value: Partial<CharacterClericFeatureState>,
  character: SubclassRuntimeCharacter
): Partial<CharacterClericFeatureState> {
  if (!hasArcanaDomain(character)) return {};
  const cantripIds = Array.isArray(value.arcanaCantripIds) ? value.arcanaCantripIds : [];
  const masteryIds = Array.isArray(value.magicalMasterySpellIds)
    ? value.magicalMasterySpellIds
    : [];
  return {
    arcanaSkill: arcanaSkillOptions.find((skill) => skill === value.arcanaSkill),
    arcanaCantripIds: [0, 1].map((index) => {
      const id = cantripIds[index];
      return getArcanaWizardSpellOptions(0).some((spell) => spell.id === id) &&
        (index === 0 || id !== cantripIds[0])
        ? id
        : "";
    }),
    magicalMasterySpellIds: hasArcanaDomain(character, 17)
      ? [6, 7, 8, 9].map((level, index) =>
          getArcanaWizardSpellOptions(level).some((spell) => spell.id === masteryIds[index])
            ? masteryIds[index]
            : ""
        )
      : undefined,
    dispellingRecoveryUsesExpended: hasArcanaDomain(character, 6)
      ? Math.min(1, Math.max(0, Math.floor(Number(value.dispellingRecoveryUsesExpended) || 0)))
      : undefined
  };
}
export function getArcanaDomainState(character: SubclassRuntimeCharacter) {
  return normalizeArcanaDomainState(character.classFeatureState?.cleric ?? {}, character);
}
export function updateArcanaDomainChoices(
  character: Character,
  choices: Partial<
    Pick<CharacterClericFeatureState, "arcanaSkill" | "arcanaCantripIds" | "magicalMasterySpellIds">
  >
): Character {
  if (!hasArcanaDomain(character)) return character;
  return replaceClassFeatureState(character, "cleric", {
    ...character.classFeatureState?.cleric,
    ...normalizeArcanaDomainState({ ...character.classFeatureState?.cleric, ...choices }, character)
  });
}
export function restoreDispellingRecovery(character: Character): Character {
  return hasArcanaDomain(character, 6)
    ? replaceClassFeatureState(character, "cleric", {
        ...character.classFeatureState?.cleric,
        dispellingRecoveryUsesExpended: 0
      })
    : character;
}
export function getDispellingRecoveryRemaining(character: SubclassRuntimeCharacter): number {
  return hasArcanaDomain(character, 6)
    ? 1 - (getArcanaDomainState(character).dispellingRecoveryUsesExpended ?? 0)
    : 0;
}
export function getArcanaDivinityValueCell(
  character: SubclassRuntimeCharacter,
  divinityId: string
): { label: string; content: string } | null {
  if (!hasArcanaDomain(character)) return null;
  if (divinityId === "divinity-fortifying-spell")
    return { label: "Temporary HP", content: `2d8 + ${getClassLevel(character, "Cleric")}` };
  if (divinityId === "divinity-tenacious-spell") return { label: "Save penalty", content: "−1d6" };
  return null;
}

export function collectClericArcanaDomainContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasArcanaDomain(character)) return [];
  const state = getArcanaDomainState(character);
  const skill = state.arcanaSkill ? getSkillProficiencyForName(state.arcanaSkill) : null;
  const source = (entryId: CLASS_FEATURE, label: string) =>
    createSubclassContributionSource({ id: `cleric-arcana-${entryId}`, entryId, label });
  return [
    {
      source: source(CLASS_FEATURE.ARCANA_DOMAIN_SPELLS, "Arcana Domain Spells"),
      alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
        getClassLevel(character, "Cleric"),
        arcanaDomainSpellIdsByLevel
      )
    },
    {
      source: source(CLASS_FEATURE.STUDENT_OF_ARCANA, "Student of Arcana"),
      alwaysPreparedSpellIds: (state.arcanaCantripIds ?? []).filter(Boolean),
      skillProficiencyEntries: skill
        ? [
            {
              source: PROFICIENCY_SOURCE.CLASS,
              sourceStr: "Student of Arcana",
              proficiency: skill,
              proficiencyLevel: PROF_LEVEL.PROFICIENT,
              overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
            }
          ]
        : []
    },
    {
      source: source(CLASS_FEATURE.MODIFY_MAGIC, "Modify Magic"),
      actionOptions: {
        [clericChannelDivinityActionKey]: [
          {
            key: clericChannelDivinityOptionKeys.fortifyingSpell,
            name: "Fortifying Spell",
            summary: "Grant Temporary HP",
            detail: "Give one target of your spell Temporary HP.",
            breakdown: `2d8 + ${getClassLevel(character, "Cleric")} Temporary HP`,
            economyType: ECONOMY_TYPE.FREE,
            actionCategory: ACTION_CATEGORY.FEATURE,
            resultLabel: "Temporary HP",
            rollFormula: `2d8+${getClassLevel(character, "Cleric")}`,
            rollFormulaDisplay: `2d8 + ${getClassLevel(character, "Cleric")}`,
            description: getFeatureDescriptionForCharacter(
              character,
              CLASS_FEATURE.MODIFY_MAGIC
            ).slice(0, 2)
          },
          {
            key: clericChannelDivinityOptionKeys.tenaciousSpell,
            name: "Tenacious Spell",
            summary: "Reduce a successful save",
            detail:
              "Subtract 1d6 from a target's first successful saving throw against your spell.",
            breakdown: "−1d6 to saving throw",
            economyType: ECONOMY_TYPE.FREE,
            actionCategory: ACTION_CATEGORY.FEATURE,
            resultLabel: "Save reduction",
            rollFormula: "1d6",
            rollFormulaDisplay: "1d6",
            description: getFeatureDescriptionForCharacter(
              character,
              CLASS_FEATURE.MODIFY_MAGIC
            ).filter((_, i) => i !== 1)
          }
        ]
      },
      spellTransforms: [
        {
          id: "cleric-modify-magic-description",
          transform: (spell) =>
            appendFeatureSourcedDescriptionAddition(
              spell,
              character,
              CLASS_FEATURE.MODIFY_MAGIC,
              getFeatureDescriptionForCharacter(character, CLASS_FEATURE.MODIFY_MAGIC),
              "Modify Magic"
            )
        }
      ]
    },
    ...(hasArcanaDomain(character, 6)
      ? [
          {
            source: source(CLASS_FEATURE.DISPELLING_RECOVERY, "Dispelling Recovery"),
            spellTransforms: [
              {
                id: "cleric-dispelling-recovery-description",
                transform: (spell) =>
                  spell.id === "spell-dispel-magic" || spell.isHealingSpell
                    ? appendFeatureSourcedDescriptionAddition(
                        spell,
                        character,
                        CLASS_FEATURE.DISPELLING_RECOVERY,
                        getFeatureDescriptionForCharacter(
                          character,
                          CLASS_FEATURE.DISPELLING_RECOVERY
                        ),
                        "Dispelling Recovery"
                      )
                    : spell
              }
            ]
          } satisfies FeatureContributionSpec
        ]
      : []),
    ...(hasArcanaDomain(character, 17)
      ? [
          {
            source: source(CLASS_FEATURE.MAGICAL_MASTERY, "Magical Mastery"),
            alwaysPreparedSpellIds: (state.magicalMasterySpellIds ?? []).filter(Boolean)
          }
        ]
      : [])
  ];
}
export const getClericArcanaDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectClericArcanaDomainContributions),
    { character: character as Character }
  );
