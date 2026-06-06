import type { SpellDescriptionEntry } from "../../../../codex/entries";
import type { AbilityKey, CharacterFeatEntry } from "../../../../types";
import { getAbilityModifierForCharacter } from "../../abilities";
import { ACTION_CARD_THEME } from "../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import {
  createChargesCardUsage,
  createChargesHeaderTag,
  createFeatureActionCardCost,
  createNamedResourceCardUsage,
  createTextHeaderTag
} from "../../classFeatures/cardUsage";
import type { FeatureActionCard } from "../../classFeatures/types";
import { getProficiencyBonus } from "../../gameplay";
import {
  getHitDiceRemainingForCharacter,
  getHitDiceTotalForCharacter,
  getHitDieLabelForCharacter
} from "../../hitDice";
import { formatFormulaCell, formatSignedFormulaTerm } from "../../shared/formulas";
import {
  boonOfFateImproveFateActionKey,
  boonOfRecoveryRecoverVitalityActionKey,
  cultOfDragonInitiateDragonsTerrorActionKey,
  cultOfDragonInitiateInspiredByFearActionKey,
  durableSpeedyRecoveryActionKey,
  luckyFeatActionKey,
  telekineticShoveActionKey
} from "./constants";
import type { FeatRuntimeCharacter } from "./types";

const cultOfDragonInitiateFeatName = "Cult of the Dragon Initiate";

export function createLuckyAction(
  remaining: number,
  total: number,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const usageLabel = `Lucky Points ${remaining}/${total}`;

  return {
    key: luckyFeatActionKey,
    name: "Lucky",
    actionSource: {
      type: "feat",
      name: "Lucky"
    },
    summary: usageLabel,
    detail: "Spend Luck Points on d20 rolls.",
    breakdown: "Origin Feat",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    hideUsesTrackerOnCard: true,
    usesSupplementaryLabel: usageLabel,
    description,
    headerTags: [
      {
        kind: "text",
        label: "Lucky Points",
        value: `${remaining}/${total}`
      }
    ],
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use 1"
    },
    execute: {
      kind: "activate",
      label: "Use 1"
    }
  };
}

export function createBoonOfFateImproveFateAction(
  remaining: number,
  total: number,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const chargesTag = createChargesHeaderTag(remaining, total, "Improve Fate");
  const disabledReason =
    remaining > 0 ? undefined : "Improve Fate recharges when you roll Initiative or finish a rest.";

  return {
    key: boonOfFateImproveFateActionKey,
    name: "Improve Fate",
    actionSource: {
      type: "feat",
      name: "Boon of Fate"
    },
    summary: `Charge ${remaining}/${total}`,
    detail: "Roll 2d4 to alter a D20 Test.",
    breakdown: "Boon of Fate",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    hideUsesTrackerOnCard: true,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: remaining <= 0,
    disabledReason,
    description,
    headerTags: [chargesTag],
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use Improve Fate",
      headerTags: [chargesTag]
    },
    execute: {
      kind: "activate",
      label: "Use Improve Fate"
    }
  };
}

function getCultOfDragonInitiateDragonsTerrorSavingThrowFact(
  character: FeatRuntimeCharacter,
  normalizedFeats: CharacterFeatEntry[]
): NonNullable<FeatureActionCard["facts"]>[number] {
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const wisdomModifier = getAbilityModifierForCharacter(
    {
      ...character,
      feats: normalizedFeats
    },
    "WIS"
  );
  const saveDc = 8 + wisdomModifier + proficiencyBonus;
  const displayTerms = [
    "DC 8 (Base)",
    formatSignedFormulaTerm(wisdomModifier, "WIS"),
    formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus")
  ];
  const formulaCell = formatFormulaCell({
    formula: String(saveDc),
    displayTerms,
    breakdownTerms: displayTerms
  });

  return {
    label: "Saving Throw Formula",
    value: `WIS DC ${saveDc} = ${formulaCell.value}`,
    fullWidth: true
  };
}

export function createCultOfDragonInitiateDragonsTerrorAction(
  character: FeatRuntimeCharacter,
  normalizedFeats: CharacterFeatEntry[],
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const facts = [getCultOfDragonInitiateDragonsTerrorSavingThrowFact(character, normalizedFeats)];

  return {
    key: cultOfDragonInitiateDragonsTerrorActionKey,
    name: "Dragon's Terror",
    actionSource: {
      type: "feat",
      name: cultOfDragonInitiateFeatName
    },
    summary: "Instill fear in a nearby creature.",
    detail: "Instill fear in a creature you can see.",
    breakdown: "Frighten nearby creature",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    cardTheme: ACTION_CARD_THEME.FEATURE,
    description,
    facts,
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use Dragon's Terror"
    },
    execute: {
      kind: "activate",
      label: "Use Dragon's Terror"
    }
  };
}

export function createCultOfDragonInitiateInspiredByFearAction(
  remaining: number,
  total: number,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const chargesTag = createChargesHeaderTag(remaining, total);
  const disabledReason = remaining > 0 ? undefined : "Inspired by Fear recharges on a rest.";

  return {
    key: cultOfDragonInitiateInspiredByFearActionKey,
    name: "Inspired by Fear",
    actionSource: {
      type: "feat",
      name: cultOfDragonInitiateFeatName
    },
    summary: `Charge ${remaining}/${total}`,
    detail: "Regain Heroic Inspiration after instilling fear.",
    breakdown: "Regain Heroic Inspiration",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    hideUsesTrackerOnCard: true,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: remaining <= 0,
    disabledReason,
    description,
    headerTags: [chargesTag],
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use Inspired by Fear",
      headerTags: [chargesTag]
    },
    execute: {
      kind: "activate",
      label: "Use Inspired by Fear",
      effectKind: "cult-inspired-by-fear"
    }
  };
}

export function createBoonOfRecoveryRecoverVitalityAction(
  remaining: number,
  total: number,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const poolTag = createTextHeaderTag(
    "",
    `${remaining}/${total} d10`,
    undefined,
    remaining > 0 ? undefined : "danger"
  );
  const disabledReason = remaining > 0 ? undefined : "No Recover Vitality d10s remaining.";

  return {
    key: boonOfRecoveryRecoverVitalityActionKey,
    name: "Recover Vitality",
    actionSource: {
      type: "feat",
      name: "Boon of Recovery"
    },
    summary: `Pool of ${remaining}/${total} d10`,
    detail: "Heal yourself with d10s",
    breakdown: "Heal yourself with d10s",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createNamedResourceCardUsage(
      createFeatureActionCardCost({
        resourceLabel: "d10"
      })
    ),
    usesRemaining: remaining,
    usesTotal: total,
    hideUsesTrackerOnCard: true,
    disabled: remaining <= 0,
    disabledReason,
    description,
    headerTags: [poolTag],
    drawer: {
      kind: "custom-form",
      formKind: "recover-vitality",
      description,
      confirmLabel: "Use Recover Vitality",
      headerTags: [poolTag]
    },
    execute: {
      kind: "custom-form",
      formKind: "recover-vitality",
      label: "Use Recover Vitality"
    }
  };
}

function getTelekineticShoveSavingThrowFact(
  character: FeatRuntimeCharacter,
  ability: AbilityKey,
  normalizedFeats: CharacterFeatEntry[]
): NonNullable<FeatureActionCard["facts"]>[number] {
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const abilityModifier = getAbilityModifierForCharacter(
    {
      ...character,
      feats: normalizedFeats
    },
    ability
  );
  const saveDc = 8 + abilityModifier + proficiencyBonus;
  const displayTerms = [
    "DC 8 (Base)",
    formatSignedFormulaTerm(abilityModifier, ability),
    formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus")
  ];
  const formulaCell = formatFormulaCell({
    formula: String(saveDc),
    displayTerms,
    breakdownTerms: displayTerms
  });

  return {
    label: "Strength Saving Throw Formula",
    value: `Strength DC ${saveDc} = ${formulaCell.value}`,
    breakdown: formulaCell.breakdown,
    fullWidth: true
  };
}

export function createTelekineticShoveAction(
  character: FeatRuntimeCharacter,
  ability: AbilityKey,
  normalizedFeats: CharacterFeatEntry[],
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const facts = [getTelekineticShoveSavingThrowFact(character, ability, normalizedFeats)];

  return {
    key: telekineticShoveActionKey,
    name: "Telekinetic Shove",
    actionSource: {
      type: "feat",
      name: "Telekinetic"
    },
    summary: "Telekinetic Shove",
    detail: "Shove a creature from afar",
    breakdown: "Shove a creature from afar",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    description,
    facts,
    drawer: {
      kind: "confirm",
      description,
      facts,
      factsSectionTitle: "Saving Throw",
      confirmLabel: "Use Telekinetic Shove"
    },
    execute: {
      kind: "activate",
      label: "Use Telekinetic Shove"
    }
  };
}

export function createDurableSpeedyRecoveryAction(
  character: FeatRuntimeCharacter,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const hitDieLabel = getHitDieLabelForCharacter(character);
  const hitDiceRemaining = getHitDiceRemainingForCharacter(character);
  const hitDiceTotal = getHitDiceTotalForCharacter(character);
  const hitDieCost = createFeatureActionCardCost({
    amountText: "1",
    resourceLabel: `${hitDieLabel} Hit Point Die`
  });
  const hitPointDiceTag = createTextHeaderTag(
    "Hit Point Dice",
    `${hitDieLabel} ${hitDiceRemaining}/${hitDiceTotal}`,
    undefined,
    hitDiceRemaining > 0 ? undefined : "danger"
  );
  const disabledReason = hitDiceRemaining > 0 ? undefined : "No Hit Point Dice remaining.";

  return {
    key: durableSpeedyRecoveryActionKey,
    name: "Speedy Recovery",
    actionSource: {
      type: "feat",
      name: "Durable"
    },
    summary: `Use 1 ${hitDieLabel} Hit Point Die`,
    detail: "Recover healthpoints",
    breakdown: "Recover healthpoints",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createNamedResourceCardUsage(hitDieCost),
    disabled: hitDiceRemaining <= 0,
    disabledReason,
    description,
    headerTags: [hitPointDiceTag],
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use Speedy Recovery",
      headerTags: [hitPointDiceTag]
    },
    execute: {
      kind: "activate",
      label: "Use Speedy Recovery",
      effectKind: "speedy-recovery"
    }
  };
}
