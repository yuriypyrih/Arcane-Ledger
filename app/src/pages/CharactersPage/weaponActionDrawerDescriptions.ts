import { CLASS_FEATURE, WEAPON_COMBAT_TYPE, type SpellDescriptionEntry } from "../../codex/entries";
import type { Character } from "../../types";
import { ECONOMY_TYPE } from "./actionEconomy";
import { createFeatureSourcedDescriptionEntries } from "./actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "./classFeatures/featureDescriptions";
import { getRangerPreciseHunterWeaponActionDescriptionAdditions } from "./classFeatures/ranger/ranger";
import {
  getWizardBladesingerBladeworkWeaponActionDescriptionAdditions,
  getWizardBladesingerSongOfVictoryWeaponActionDescriptionAdditions
} from "./classFeatures/wizard/subclasses/wizardBladesinger";
import {
  getChargerWeaponActionDescriptionAdditionsForCharacter,
  getCrossbowExpertWeaponActionDescriptionAdditionsForCharacter,
  getCrusherWeaponActionDescriptionAdditionsForCharacter,
  getDualWielderWeaponActionDescriptionAdditionsForCharacter,
  getGreatWeaponMasterWeaponActionDescriptionAdditionsForCharacter,
  getPiercerWeaponActionDescriptionAdditionsForCharacter,
  getPoisonerWeaponActionDescriptionAdditionsForCharacter,
  getSavageAttackerWeaponActionDescriptionAdditions,
  getTavernBrawlerUnarmedStrikeDescriptionAdditions
} from "./feats/runtime";
import type { WeaponAction } from "./gameplay";

type WeaponActionDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "feats" | "statusEntries" | "subclassId">>;

const extraAttackFeaturePriority: Array<{
  feature: CLASS_FEATURE;
  label: string;
}> = [
  {
    feature: CLASS_FEATURE.THREE_EXTRA_ATTACKS,
    label: "Three Extra Attacks"
  },
  {
    feature: CLASS_FEATURE.TWO_EXTRA_ATTACKS,
    label: "Two Extra Attacks"
  },
  {
    feature: CLASS_FEATURE.EXTRA_ATTACK,
    label: "Extra Attack"
  }
];

function getInjectedExtraAttackSection(
  character: WeaponActionDescriptionCharacter
): SpellDescriptionEntry[] | null {
  for (const config of extraAttackFeaturePriority) {
    const description = getFeatureDescriptionForCharacter(character, config.feature);

    if (description.length > 0) {
      return createFeatureSourcedDescriptionEntries(
        character,
        config.feature,
        description,
        config.label
      );
    }
  }

  return null;
}

function getInjectedRadiantStrikesSection(
  character: WeaponActionDescriptionCharacter
): SpellDescriptionEntry[] | null {
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.RADIANT_STRIKES);

  return description.length > 0
    ? createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.RADIANT_STRIKES,
        description,
        "Radiant Strikes"
      )
    : null;
}

function getInjectedSacredWeaponSection(
  character: WeaponActionDescriptionCharacter
): SpellDescriptionEntry[] | null {
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.SACRED_WEAPON);

  return description.length > 0
    ? createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.SACRED_WEAPON,
        description,
        "Sacred Weapon"
      )
    : null;
}

function getInjectedVowOfEnmitySection(
  character: WeaponActionDescriptionCharacter
): SpellDescriptionEntry[] | null {
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.VOW_OF_ENMITY);

  return description.length > 0
    ? createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.VOW_OF_ENMITY,
        description,
        "Vow of Enmity"
      )
    : null;
}

function isWeaponOrUnarmedAction(action: Pick<WeaponAction, "attackKind">): boolean {
  return action.attackKind === "weapon" || action.attackKind === "unarmed";
}

function isMeleeWeaponOrUnarmedAction(
  action: Pick<WeaponAction, "attackKind" | "combatType">
): boolean {
  return (
    action.attackKind === "unarmed" ||
    (action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE)
  );
}

export function getWeaponActionDrawerDescriptionAdditions(
  character: WeaponActionDescriptionCharacter,
  action: Pick<
    WeaponAction,
    | "attackKind"
    | "baseWeapon"
    | "combatType"
    | "damageLabel"
    | "economyType"
    | "descriptionAdditions"
    | "properties"
    | "proficiencyBonus"
  >
): SpellDescriptionEntry[][] {
  if (!isWeaponOrUnarmedAction(action)) {
    return action.descriptionAdditions ?? [];
  }

  const injectedSections: SpellDescriptionEntry[][] = [];

  if (action.economyType === ECONOMY_TYPE.ACTION) {
    const injectedExtraAttackSection = getInjectedExtraAttackSection(character);

    if (injectedExtraAttackSection) {
      injectedSections.push(injectedExtraAttackSection);
    }
  }

  if (isMeleeWeaponOrUnarmedAction(action)) {
    const injectedRadiantStrikesSection = getInjectedRadiantStrikesSection(character);

    if (injectedRadiantStrikesSection) {
      injectedSections.push(injectedRadiantStrikesSection);
    }
  }

  const injectedSacredWeaponSection = getInjectedSacredWeaponSection(character);

  if (injectedSacredWeaponSection) {
    injectedSections.push(injectedSacredWeaponSection);
  }

  const injectedVowOfEnmitySection = getInjectedVowOfEnmitySection(character);

  if (injectedVowOfEnmitySection) {
    injectedSections.push(injectedVowOfEnmitySection);
  }

  injectedSections.push(...getSavageAttackerWeaponActionDescriptionAdditions(character));
  injectedSections.push(...getChargerWeaponActionDescriptionAdditionsForCharacter(character, action));
  injectedSections.push(...getCrusherWeaponActionDescriptionAdditionsForCharacter(character, action));
  injectedSections.push(
    ...getPiercerWeaponActionDescriptionAdditionsForCharacter(character, action)
  );
  injectedSections.push(
    ...getPoisonerWeaponActionDescriptionAdditionsForCharacter(character, action)
  );
  injectedSections.push(
    ...getDualWielderWeaponActionDescriptionAdditionsForCharacter(character, action)
  );
  injectedSections.push(
    ...getGreatWeaponMasterWeaponActionDescriptionAdditionsForCharacter(character, action)
  );
  injectedSections.push(
    ...getCrossbowExpertWeaponActionDescriptionAdditionsForCharacter(character, action)
  );

  if (action.attackKind === "unarmed") {
    injectedSections.push(...getTavernBrawlerUnarmedStrikeDescriptionAdditions(character));
  }

  injectedSections.push(...getRangerPreciseHunterWeaponActionDescriptionAdditions(character));
  injectedSections.push(
    ...getWizardBladesingerBladeworkWeaponActionDescriptionAdditions(character, action)
  );
  injectedSections.push(
    ...getWizardBladesingerSongOfVictoryWeaponActionDescriptionAdditions(character, action)
  );

  return injectedSections.length > 0
    ? [...injectedSections, ...(action.descriptionAdditions ?? [])]
    : (action.descriptionAdditions ?? []);
}
