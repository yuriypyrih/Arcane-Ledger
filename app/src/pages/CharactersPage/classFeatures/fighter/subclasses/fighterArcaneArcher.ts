import { getSpellEntryByName, type SpellEntry } from "../../../../../codex/entries";
import { CLASS_FEATURE, REACTION } from "../../../../../codex/entries/enums";
import {
  arcaneArcherLoreCantripNames,
  arcaneArcherLoreSkills
} from "../../../../../codex/subclasses/fighterArcaneArcher";
import {
  getSkillProficiencyForSkillName,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  type Character,
  type CharacterFighterFeatureState,
  type SkillName
} from "../../../../../types";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  getFeatureSpellcastingAbilityForSpell,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getResolvedSkillProficiencyEntry } from "../../../proficiency/manual";
import { getSkillProficiencyOptionsForClass } from "../../../proficiencyClassData";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter, SubclassRuntimeResolver } from "../../subclassRuntime";
import { collectArcaneShotContributions, normalizeArcaneShotState } from "./fighterArcaneShot";
import { collectCurvingShotContributions } from "./fighterCurvingShot";
import {
  collectMagicalAmmunitionContributions,
  normalizeMagicalAmmunitionState
} from "./fighterMagicalAmmunition";

export const arcaneArcherSubclassId = "fighter-arcane-archer";
const loreSource = "Arcane Archer Lore";
const replacementSkills = getSkillProficiencyOptionsForClass("Fighter");
export const arcaneArcherLoreCantrips = arcaneArcherLoreCantripNames
  .map(getSpellEntryByName)
  .filter((spell): spell is SpellEntry => spell !== null);

function hasArcaneArcherLore(character: SubclassRuntimeCharacter): boolean {
  return (
    getFeatureDescriptionMetadataForCharacter(character, CLASS_FEATURE.ARCANE_ARCHER_LORE) !== null
  );
}

type LoreState = Pick<
  CharacterFighterFeatureState,
  "arcaneArcherLoreCantripId" | "arcaneArcherLoreSkills"
>;

export function normalizeArcaneArcherLoreState(
  value: Partial<CharacterFighterFeatureState>,
  character: SubclassRuntimeCharacter
): LoreState {
  if (!hasArcaneArcherLore(character)) return {};
  const skills = Array.isArray(value.arcaneArcherLoreSkills) ? value.arcaneArcherLoreSkills : [];
  return {
    arcaneArcherLoreCantripId: arcaneArcherLoreCantrips.find(
      (spell) => spell.id === value.arcaneArcherLoreCantripId
    )?.id,
    arcaneArcherLoreSkills: arcaneArcherLoreSkills.map((defaultSkill, index) => {
      const skill = skills[index];
      return skill && (skill === defaultSkill || replacementSkills.includes(skill)) ? skill : "";
    })
  };
}

export function normalizeArcaneArcherFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: SubclassRuntimeCharacter
): Partial<CharacterFighterFeatureState> {
  return {
    ...normalizeArcaneArcherLoreState(value, character),
    ...normalizeArcaneShotState(value, character),
    ...normalizeMagicalAmmunitionState(value, character)
  };
}

export function getArcaneArcherLoreChoices(character: SubclassRuntimeCharacter) {
  const unlocked = hasArcaneArcherLore(character);
  const state = normalizeArcaneArcherLoreState(
    character.classFeatureState?.fighter ?? {},
    character
  );
  // These grants must not make their own defaults look like pre-existing proficiencies.
  const otherEntries = (character.skillProficiencies ?? []).filter(
    (entry) => !(entry.source === PROFICIENCY_SOURCE.CLASS && entry.sourceStr === loreSource)
  );
  const isAlreadyProficient = (skill: SkillName) =>
    getResolvedSkillProficiencyEntry(otherEntries, getSkillProficiencyForSkillName(skill))
      .proficiencyLevel !== PROF_LEVEL.NONE;
  const selected = new Set<SkillName>();
  const skills = arcaneArcherLoreSkills.map((defaultSkill, index) => {
    const needsReplacement = isAlreadyProficient(defaultSkill);
    const saved = state.arcaneArcherLoreSkills?.[index];
    const skill = !unlocked
      ? null
      : !needsReplacement
        ? defaultSkill
        : saved &&
            replacementSkills.includes(saved) &&
            !isAlreadyProficient(saved) &&
            !selected.has(saved)
          ? saved
          : null;
    if (skill) selected.add(skill);
    return { defaultSkill, skill, needsReplacement, options: [defaultSkill, ...replacementSkills] };
  });
  return {
    cantripId: state.arcaneArcherLoreCantripId,
    skills: skills.map((choice) => ({
      ...choice,
      availableOptions: choice.options.filter(
        (skill) =>
          unlocked &&
          (!choice.needsReplacement
            ? skill === choice.defaultSkill
            : replacementSkills.includes(skill) &&
              !isAlreadyProficient(skill) &&
              (!selected.has(skill) || skill === choice.skill))
      )
    }))
  };
}

export function updateArcaneArcherLoreChoices(character: Character, choices: LoreState): Character {
  if (!hasArcaneArcherLore(character)) return character;
  return replaceClassFeatureState(character, "fighter", {
    ...character.classFeatureState?.fighter,
    ...normalizeArcaneArcherLoreState(
      { ...character.classFeatureState?.fighter, ...choices },
      character
    )
  });
}

function collectArcaneArcherContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  if (!hasArcaneArcherLore(character)) return [];
  const choices = getArcaneArcherLoreChoices(character);
  const spell = arcaneArcherLoreCantrips.find((spell) => spell.id === choices.cantripId);
  const indomitableTeleport = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.INDOMITABLE_TELEPORT
  );
  const masterfulShots = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.MASTERFUL_SHOTS
  );
  return [
    {
      source: createSubclassContributionSource({
        id: "fighter-arcane-archer-lore",
        label: loreSource,
        entryId: CLASS_FEATURE.ARCANE_ARCHER_LORE
      }),
      skillProficiencyEntries: choices.skills.flatMap(({ skill }) =>
        skill
          ? [
              {
                source: PROFICIENCY_SOURCE.CLASS,
                sourceStr: loreSource,
                proficiency: getSkillProficiencyForSkillName(skill),
                proficiencyLevel: PROF_LEVEL.PROFICIENT,
                overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
              }
            ]
          : []
      ),
      spellGrants: spell
        ? [{ kind: "always-prepared-cantrip", spell, spellcastingAbility: "INT" }]
        : []
    },
    ...collectArcaneShotContributions(character),
    ...collectCurvingShotContributions(character),
    ...collectMagicalAmmunitionContributions(character),
    {
      source: createSubclassContributionSource({
        id: "fighter-arcane-archer-indomitable-teleport",
        label: "Indomitable Teleport",
        entryId: CLASS_FEATURE.INDOMITABLE_TELEPORT
      }),
      featureActionTransforms: indomitableTeleport
        ? [
            {
              id: "fighter-arcane-archer-indomitable-teleport-description",
              transform: (action) =>
                action.sourceFeature === CLASS_FEATURE.INDOMITABLE
                  ? appendFeatureSourcedDescriptionAddition(
                      action,
                      character,
                      CLASS_FEATURE.INDOMITABLE_TELEPORT,
                      indomitableTeleport.description
                    )
                  : action
            }
          ]
        : []
    },
    {
      source: createSubclassContributionSource({
        id: "fighter-arcane-archer-masterful-shots",
        label: "Masterful Shots",
        entryId: CLASS_FEATURE.MASTERFUL_SHOTS
      }),
      reactions: masterfulShots
        ? [
            {
              id: "reaction-fighter-arcane-archer-masterful-shots",
              reaction: REACTION.MASTERFUL_SHOTS,
              name: masterfulShots.name,
              sourceType: "feature",
              sourceFeature: CLASS_FEATURE.MASTERFUL_SHOTS,
              sourceLabel: masterfulShots.name,
              description: masterfulShots.description
            }
          ]
        : []
    }
  ];
}

export function getArcaneArcherLoreSpellcastingAbility(character: Character, spellId: string) {
  return getFeatureSpellcastingAbilityForSpell(
    getCompiledFeatureContributions(character, collectArcaneArcherContributions),
    spellId
  );
}

export const getArcaneArcherDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectArcaneArcherContributions),
    { character: character as Character }
  );
