import { DAMAGE_TYPE, FEATS } from "../../../codex/entries/enums";
import { SKILL, type CharacterFeatEntry, type LANGUAGE_PROFICIENCY } from "../../../types";
import { languageProficiencyOptions } from "../proficiencyOptions";
import { isArcaneCantripSpellcastingAbility } from "./arcaneCantripChoices";

export const portalJumperDamageTypes = [
  DAMAGE_TYPE.NECROTIC,
  DAMAGE_TYPE.PSYCHIC,
  DAMAGE_TYPE.RADIANT
] as const;
export const secondMindSkillOptions = [
  SKILL.ARCANA,
  SKILL.DECEPTION,
  SKILL.HISTORY,
  SKILL.INTIMIDATION,
  SKILL.INSIGHT,
  SKILL.INVESTIGATION,
  SKILL.NATURE,
  SKILL.RELIGION,
  SKILL.PERCEPTION,
  SKILL.PERSUASION
] as const;
export const borrowedEyesSpellIds = ["spell-beast-sense", "spell-speak-with-animals"] as const;

export type FeatBenefitChoice =
  | { feat: FEATS.PORTAL_JUMPER; portalJumper: NonNullable<CharacterFeatEntry["portalJumper"]> }
  | {
      feat: FEATS.SYMBIOTIC_BEING;
      symbioticBeing: NonNullable<CharacterFeatEntry["symbioticBeing"]>;
    };

export function getFeatBenefitChoice(
  feat: FEATS,
  entry?: CharacterFeatEntry
): FeatBenefitChoice | null {
  if (feat === FEATS.PORTAL_JUMPER) return { feat, portalJumper: entry?.portalJumper ?? {} };
  if (feat === FEATS.SYMBIOTIC_BEING) return { feat, symbioticBeing: entry?.symbioticBeing ?? {} };
  return null;
}

export function isFeatBenefitChoiceReady(choice: FeatBenefitChoice): boolean {
  return choice.feat === FEATS.PORTAL_JUMPER
    ? Boolean(choice.portalJumper.damageType)
    : Boolean(choice.symbioticBeing.skill && choice.symbioticBeing.language);
}

function readCount(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 1
    ? Math.floor(value)
    : undefined;
}

function readSpellcastingAbility(value: unknown) {
  return isArcaneCantripSpellcastingAbility(value) ? value : undefined;
}

export type FeatBenefitFields = Pick<
  CharacterFeatEntry,
  | "gatheredWhispers"
  | "livingShadow"
  | "mistWalker"
  | "portalJumper"
  | "secondSkin"
  | "sharpEye"
  | "symbioticBeing"
  | "touchOfDeath"
  | "watchers"
>;

export function normalizeFeatBenefitFields(
  feat: FEATS,
  fields?: FeatBenefitFields
): FeatBenefitFields {
  switch (feat) {
    case FEATS.GATHERED_WHISPERS: {
      const spellcastingAbility = readSpellcastingAbility(
        fields?.gatheredWhispers?.spellcastingAbility
      );
      const spiritWhispersExpended =
        fields?.gatheredWhispers?.spiritWhispersExpended === true || undefined;
      return spellcastingAbility || spiritWhispersExpended
        ? { gatheredWhispers: { spellcastingAbility, spiritWhispersExpended } }
        : {};
    }
    case FEATS.LIVING_SHADOW: {
      const spellcastingAbility = readSpellcastingAbility(
        fields?.livingShadow?.spellcastingAbility
      );
      return spellcastingAbility ? { livingShadow: { spellcastingAbility } } : {};
    }
    case FEATS.MIST_WALKER: {
      const mistWalkUsesExpended = readCount(fields?.mistWalker?.mistWalkUsesExpended);
      return mistWalkUsesExpended ? { mistWalker: { mistWalkUsesExpended } } : {};
    }
    case FEATS.PORTAL_JUMPER: {
      const damageType = portalJumperDamageTypes.find(
        (type) => type === fields?.portalJumper?.damageType
      );
      const portalStepUsesExpended = readCount(fields?.portalJumper?.portalStepUsesExpended);
      return damageType || portalStepUsesExpended
        ? { portalJumper: { damageType, portalStepUsesExpended } }
        : {};
    }
    case FEATS.SECOND_SKIN: {
      const spellcastingAbility = readSpellcastingAbility(fields?.secondSkin?.spellcastingAbility);
      const alternateFormExpended = fields?.secondSkin?.alternateFormExpended === true || undefined;
      return spellcastingAbility || alternateFormExpended
        ? { secondSkin: { spellcastingAbility, alternateFormExpended } }
        : {};
    }
    case FEATS.SHARP_EYE: {
      const usesExpended = readCount(fields?.sharpEye?.usesExpended);
      return usesExpended ? { sharpEye: { usesExpended } } : {};
    }
    case FEATS.SYMBIOTIC_BEING: {
      const skill = secondMindSkillOptions.find(
        (option) => option === fields?.symbioticBeing?.skill
      );
      const language = languageProficiencyOptions.find(
        (option: LANGUAGE_PROFICIENCY) => option === fields?.symbioticBeing?.language
      );
      return skill || language ? { symbioticBeing: { skill, language } } : {};
    }
    case FEATS.TOUCH_OF_DEATH: {
      const spellcastingAbility = readSpellcastingAbility(
        fields?.touchOfDeath?.spellcastingAbility
      );
      return spellcastingAbility ? { touchOfDeath: { spellcastingAbility } } : {};
    }
    case FEATS.WATCHERS: {
      const expended = fields?.watchers?.borrowedEyesExpendedSpellIds;
      const borrowedEyesExpendedSpellIds = Array.isArray(expended)
        ? borrowedEyesSpellIds.filter((id) => expended.includes(id))
        : [];
      return borrowedEyesExpendedSpellIds.length
        ? { watchers: { borrowedEyesExpendedSpellIds } }
        : {};
    }
    default:
      return {};
  }
}
