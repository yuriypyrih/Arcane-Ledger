import type { Character } from "../../../../../../types";
import {
  type FeatureDamageBonus,
  type FeatureIndicator
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  hasRangerFeature,
  isRangerHuntersMarkConcentrationStatusEntry
} from "../../../../../../pages/CharactersPage/classFeatures/ranger/ranger";
import type { WeaponAction } from "../../../../../../pages/CharactersPage/gameplay";
import { CLASS_FEATURE } from "../../../../../../codex/entries";
import { applyWeaponDamageBonusPreview } from "./fighterPsiWarriorWeapon";

export const huntersMarkWeaponDamageBonusLabel = "Hunter's Mark";

const preciseHunterAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: "Precise Hunter"
};

export type HuntersMarkTargetWeaponOptionState = {
  damageBonus: FeatureDamageBonus;
  grantsAdvantage: boolean;
};

function hasActiveRangerHuntersMarkConcentration(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return character.statusEntries?.some(isRangerHuntersMarkConcentrationStatusEntry) ?? false;
}

export function getRangerHuntersMarkTargetWeaponOptionState(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "statusEntries">>,
  action: WeaponAction | null
): HuntersMarkTargetWeaponOptionState | null {
  if (!action || !hasActiveRangerHuntersMarkConcentration(character)) {
    return null;
  }

  const damageFormula = hasRangerFeature(character, CLASS_FEATURE.FOE_SLAYER) ? "1d10" : "1d6";

  return {
    damageBonus: {
      label: huntersMarkWeaponDamageBonusLabel,
      formula: damageFormula,
      displayLabel: damageFormula
    },
    grantsAdvantage: hasRangerFeature(character, CLASS_FEATURE.PRECISE_HUNTER)
  };
}

function hasFeatureIndicator(action: WeaponAction, indicator: FeatureIndicator): boolean {
  return action.indicators.some((entry) => {
    const entrySources = Array.isArray(entry.source) ? entry.source : [entry.source];
    const indicatorSources = Array.isArray(indicator.source)
      ? indicator.source
      : [indicator.source];

    return (
      entry.label === indicator.label &&
      entry.tone === indicator.tone &&
      indicatorSources.some((source) => entrySources.includes(source))
    );
  });
}

export function applyRangerHuntersMarkTargetWeaponAction(
  action: WeaponAction,
  state: HuntersMarkTargetWeaponOptionState
): WeaponAction {
  const damageAction = applyWeaponDamageBonusPreview(action, state.damageBonus);

  if (
    !state.grantsAdvantage ||
    hasFeatureIndicator(damageAction, preciseHunterAdvantageIndicator)
  ) {
    return damageAction;
  }

  return {
    ...damageAction,
    indicators: [...damageAction.indicators, preciseHunterAdvantageIndicator]
  };
}
