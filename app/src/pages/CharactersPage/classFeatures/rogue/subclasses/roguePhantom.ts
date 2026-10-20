import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character, CharacterRogueFeatureState } from "../../../../../types";
import {
  getSkillProficiencyForSkillName,
  isSkillName,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL
} from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getClassLevel, getClassSubclassId, hasCharacterClass } from "../../../multiclassState";
import { toolProficiencyOptions } from "../../../proficiencyOptions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState, spendClassResource } from "../../shared/resourceState";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { rogueSneakAttackActionKey } from "../actionKeys";
import { getRogueSneakAttackDiceCount } from "../rogue";
import { collectPhantomVoiceOfDeathContributions } from "./roguePhantomVoiceOfDeath";
import { collectPhantomGhostWalkContributions } from "./roguePhantomGhostWalk";
import { collectPhantomDeathsFriendContributions } from "./roguePhantomDeathsFriend";
import {
  collectPhantomTokensContributions,
  getPhantomSoulTrinketsRemaining,
  spendPhantomSoulTrinket
} from "./roguePhantomTokens";

export const phantomSubclassId = "rogue-phantom";
type PhantomCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "abilities" | "classFeatureState">>;
type PhantomState = Pick<
  CharacterRogueFeatureState,
  "phantomWailsUsesExpended" | "phantomWhispersProficiency"
>;

export function hasRoguePhantomFeatures(character: PhantomCharacter): boolean {
  return (
    hasCharacterClass(character, "Rogue") &&
    getClassSubclassId(character, "Rogue") === phantomSubclassId &&
    getClassLevel(character, "Rogue") >= 3
  );
}

function normalizeWhispersProficiency(value: unknown): PhantomState["phantomWhispersProficiency"] {
  return isSkillName(value) ? value : toolProficiencyOptions.find((tool) => tool === value);
}

export function getRoguePhantomWailsUsesTotal(character: PhantomCharacter): number {
  return hasRoguePhantomFeatures(character)
    ? Math.max(1, getAbilityModifierForCharacter(character, "DEX"))
    : 0;
}

export function normalizeRoguePhantomState(
  record: Partial<CharacterRogueFeatureState>,
  character: PhantomCharacter
): PhantomState {
  if (!hasRoguePhantomFeatures(character)) return {};
  const expended = Number(record.phantomWailsUsesExpended);
  return {
    phantomWailsUsesExpended: Math.max(
      0,
      Math.min(
        getRoguePhantomWailsUsesTotal(character),
        Number.isFinite(expended) ? Math.floor(expended) : 0
      )
    ),
    phantomWhispersProficiency: normalizeWhispersProficiency(record.phantomWhispersProficiency)
  };
}

export function getRoguePhantomWailsUsesRemaining(character: PhantomCharacter): number {
  return (
    getRoguePhantomWailsUsesTotal(character) -
    (normalizeRoguePhantomState(character.classFeatureState?.rogue ?? {}, character)
      .phantomWailsUsesExpended ?? 0)
  );
}

export function getRoguePhantomWailsFormula(character: Character): string | null {
  return hasRoguePhantomFeatures(character)
    ? `${Math.ceil(getRogueSneakAttackDiceCount(character) / 2)}d6`
    : null;
}

export function consumeRoguePhantomWailsUse(character: Character): Character {
  if (getRoguePhantomWailsUsesRemaining(character) <= 0) {
    return getPhantomSoulTrinketsRemaining(character) > 0
      ? spendPhantomSoulTrinket(character)
      : character;
  }
  return spendClassResource(
    character,
    {
      stateKey: "rogue",
      counter: "phantomWailsUsesExpended",
      total: getRoguePhantomWailsUsesTotal(character),
      remaining: getRoguePhantomWailsUsesRemaining(character)
    },
    1
  );
}

export function restoreRoguePhantomWailsOnLongRest(character: Character): Character {
  if (
    !hasRoguePhantomFeatures(character) ||
    !character.classFeatureState?.rogue?.phantomWailsUsesExpended
  ) {
    return character;
  }
  return replaceClassFeatureState(character, "rogue", {
    ...character.classFeatureState?.rogue,
    phantomWailsUsesExpended: 0
  });
}

export function getRoguePhantomWhispersProficiency(character: PhantomCharacter) {
  return hasRoguePhantomFeatures(character)
    ? normalizeWhispersProficiency(character.classFeatureState?.rogue?.phantomWhispersProficiency)
    : undefined;
}

export function setRoguePhantomWhispersProficiency(character: Character, value: string): Character {
  if (!hasRoguePhantomFeatures(character)) return character;
  return replaceClassFeatureState(character, "rogue", {
    ...character.classFeatureState?.rogue,
    phantomWhispersProficiency: normalizeWhispersProficiency(value)
  });
}

function collectRoguePhantomContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasRoguePhantomFeatures(character)) return [];
  const proficiency = getRoguePhantomWhispersProficiency(character);
  const entry = {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: "Whispers of the Dead",
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
  return [
    ...collectPhantomTokensContributions(character),
    ...collectPhantomVoiceOfDeathContributions(character),
    ...collectPhantomGhostWalkContributions(character),
    ...collectPhantomDeathsFriendContributions(character),
    {
      source: createSubclassContributionSource({
        id: "rogue-phantom-wails-from-the-grave",
        label: "Wails from the Grave",
        entryId: CLASS_FEATURE.WAILS_FROM_THE_GRAVE
      }),
      featureActionTransforms: [
        {
          id: "rogue-phantom-wails-description",
          transform: (action) =>
            action.key === rogueSneakAttackActionKey
              ? appendFeatureSourcedDescriptionAddition(
                  action,
                  character,
                  CLASS_FEATURE.WAILS_FROM_THE_GRAVE,
                  getFeatureDescriptionForCharacter(character, CLASS_FEATURE.WAILS_FROM_THE_GRAVE)
                )
              : action
        }
      ]
    },
    {
      source: createSubclassContributionSource({
        id: "rogue-phantom-whispers-of-the-dead",
        label: "Whispers of the Dead",
        entryId: CLASS_FEATURE.WHISPERS_OF_THE_DEAD
      }),
      skillProficiencyEntries:
        proficiency && isSkillName(proficiency)
          ? [{ ...entry, proficiency: getSkillProficiencyForSkillName(proficiency) }]
          : [],
      toolProficiencyEntries:
        proficiency && !isSkillName(proficiency) ? [{ ...entry, proficiency }] : []
    }
  ];
}

export const getRoguePhantomDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectRoguePhantomContributions),
    { character: character as Character }
  );
