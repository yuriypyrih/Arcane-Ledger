import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../codex/entries";
import type { Character } from "../../types";
import { ECONOMY_TYPE } from "./actionEconomy";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "./classFeatures/featureDescriptions";
import type { WeaponAction } from "./gameplay";

type WeaponActionDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

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
      return createSourcedDescriptionEntries(config.label, description);
    }
  }

  return null;
}

export function getWeaponActionDrawerDescriptionAdditions(
  character: WeaponActionDescriptionCharacter,
  action: Pick<WeaponAction, "attackKind" | "economyType" | "descriptionAdditions">
): SpellDescriptionEntry[][] {
  if (action.economyType !== ECONOMY_TYPE.ACTION) {
    return action.descriptionAdditions ?? [];
  }

  if (action.attackKind !== "weapon" && action.attackKind !== "unarmed") {
    return action.descriptionAdditions ?? [];
  }

  const injectedExtraAttackSection = getInjectedExtraAttackSection(character);

  if (!injectedExtraAttackSection) {
    return action.descriptionAdditions ?? [];
  }

  return [injectedExtraAttackSection, ...(action.descriptionAdditions ?? [])];
}
