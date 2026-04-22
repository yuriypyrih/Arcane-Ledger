import { CLASS_FEATURE, DAMAGE_TYPE, getSpellEntryById } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { formatWeaponDamageFormula } from "../../../../../utils/codex";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifier } from "../../../gameplay";
import { swapTemporaryHitPointsAssignment } from "../../../shared";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard } from "../../types";

export const celestialPatronSubclassId = "warlock-celestial-patron";

const healingLightActionKey = "warlock-celestial-patron-healing-light";
export const searingVengeanceActionKey = "warlock-celestial-patron-searing-vengeance";
const radiantSoulName = "Radiant Soul";
const radiantSoulResistanceSourceId = "feature-warlock-celestial-patron-radiant-soul-resistance";
const celestialResilienceName = "Celestial Resilience";
const searingVengeanceName = "Searing Vengeance";
const celestialPatronSubclassEntry = getSubclassEntryById(celestialPatronSubclassId);
const celestialPatronSpellIdsByLevel = {
  3: resolveSpellIdsByName([
    "Aid",
    "Cure Wounds",
    "Guiding Bolt",
    "Lesser Restoration",
    "Light",
    "Sacred Flame"
  ]),
  5: resolveSpellIdsByName(["Daylight", "Revivify"]),
  7: resolveSpellIdsByName(["Guardian of Faith", "Wall of Fire"]),
  9: resolveSpellIdsByName(["Greater Restoration", "Summon Celestial"])
} as const;

type WarlockCelestialPatronCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>;

function getCelestialPatronFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = celestialPatronSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const healingLightDescription = getCelestialPatronFeatureDescriptionEntries(
  CLASS_FEATURE.HEALING_LIGHT
);
const searingVengeanceDescription = getCelestialPatronFeatureDescriptionEntries(
  CLASS_FEATURE.SEARING_VENGEANCE
);

function hasWarlockCelestialPatronHealingLight(
  character: WarlockCelestialPatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === celestialPatronSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWarlockCelestialPatronRadiantSoul(
  character: WarlockCelestialPatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === celestialPatronSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasWarlockCelestialPatronCelestialResilience(
  character: WarlockCelestialPatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === celestialPatronSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function hasWarlockCelestialPatronSearingVengeance(
  character: WarlockCelestialPatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === celestialPatronSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function getWarlockCelestialPatronRadiantSoulDamageBonus(
  character: WarlockCelestialPatronCharacter
): number {
  return hasWarlockCelestialPatronRadiantSoul(character)
    ? Math.max(0, getAbilityModifier(character.abilities?.CHA ?? 10))
    : 0;
}

function spellQualifiesForWarlockCelestialPatronRadiantSoul(spellId: string): boolean {
  const spell = getSpellEntryById(spellId);

  if (!spell || spell.damage.length <= 0) {
    return false;
  }

  return spell.damage.some(([, damageType]) =>
    (Array.isArray(damageType) ? damageType : [damageType]).some(
      (entry) => entry === DAMAGE_TYPE.FIRE || entry === DAMAGE_TYPE.RADIANT
    )
  );
}

function resetWarlockCelestialPatronRadiantSoulTurnState(character: Character): Character {
  if (!hasWarlockCelestialPatronRadiantSoul(character)) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  if (warlockState.radiantSoulUsedThisTurn !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        radiantSoulUsedThisTurn: false
      }
    }
  };
}

function getWarlockCelestialPatronDerivedStatusEntries(
  character: WarlockCelestialPatronCharacter
): DerivedFeatureStatusEntry[] {
  if (!hasWarlockCelestialPatronRadiantSoul(character)) {
    return [];
  }

  return [
    {
      id: radiantSoulResistanceSourceId,
      sourceId: radiantSoulResistanceSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.RADIANT,
      source: radiantSoulName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

function getWarlockCelestialPatronRadiantSoulDamageFormulaOverride(
  character: WarlockCelestialPatronCharacter,
  spellId: string
): string | null {
  if (
    !hasWarlockCelestialPatronRadiantSoul(character) ||
    character.classFeatureState?.warlock?.radiantSoulUsedThisTurn === true ||
    !spellQualifiesForWarlockCelestialPatronRadiantSoul(spellId)
  ) {
    return null;
  }

  const spell = getSpellEntryById(spellId);
  const damageBonus = getWarlockCelestialPatronRadiantSoulDamageBonus(character);

  if (!spell || spell.damage.length <= 0 || damageBonus <= 0) {
    return null;
  }

  return `${formatWeaponDamageFormula(spell.damage)} + ${damageBonus}`;
}

export function applyWarlockCelestialPatronFeaturesAfterSpellCast(
  character: Character,
  spellId: string
): Character {
  if (
    !hasWarlockCelestialPatronRadiantSoul(character) ||
    character.classFeatureState?.warlock?.radiantSoulUsedThisTurn === true ||
    getWarlockCelestialPatronRadiantSoulDamageBonus(character) <= 0 ||
    !spellQualifiesForWarlockCelestialPatronRadiantSoul(spellId)
  ) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        radiantSoulUsedThisTurn: true
      }
    }
  };
}

export function advanceWarlockCelestialPatronFeaturesForNewRound(character: Character): Character {
  return resetWarlockCelestialPatronRadiantSoulTurnState(character);
}

export function getWarlockCelestialPatronHealingLightDiceTotal(
  character: WarlockCelestialPatronCharacter
): number {
  return hasWarlockCelestialPatronHealingLight(character)
    ? Math.max(0, character.level ?? 0) + 1
    : 0;
}

export function getWarlockCelestialPatronHealingLightDiceRemaining(
  character: WarlockCelestialPatronCharacter
): number {
  const totalDice = getWarlockCelestialPatronHealingLightDiceTotal(character);
  const rawDiceExpended = Number(character.classFeatureState?.warlock?.healingLightDiceExpended);

  return Math.max(
    0,
    totalDice - (Number.isFinite(rawDiceExpended) ? Math.max(0, Math.floor(rawDiceExpended)) : 0)
  );
}

export function getWarlockCelestialPatronHealingLightMaxSpend(
  character: WarlockCelestialPatronCharacter
): number {
  if (!hasWarlockCelestialPatronHealingLight(character)) {
    return 0;
  }

  return Math.max(1, getAbilityModifier(character.abilities?.CHA ?? 10));
}

export function normalizeWarlockCelestialPatronFeatureState(
  value: Partial<CharacterWarlockFeatureState>,
  character: WarlockCelestialPatronCharacter
): Pick<
  CharacterWarlockFeatureState,
  "healingLightDiceExpended" | "radiantSoulUsedThisTurn" | "searingVengeanceUsesExpended"
> {
  const totalDice = getWarlockCelestialPatronHealingLightDiceTotal(character);
  const rawDiceExpended = Number(value.healingLightDiceExpended);
  const totalSearingVengeanceUses = getWarlockCelestialPatronSearingVengeanceUsesTotal(character);
  const rawSearingVengeanceUsesExpended = Number(value.searingVengeanceUsesExpended);

  return {
    healingLightDiceExpended:
      totalDice > 0 && Number.isFinite(rawDiceExpended)
        ? Math.max(0, Math.min(totalDice, Math.floor(rawDiceExpended)))
        : totalDice > 0
          ? 0
          : undefined,
    radiantSoulUsedThisTurn: hasWarlockCelestialPatronRadiantSoul(character)
      ? value.radiantSoulUsedThisTurn === true
      : undefined,
    searingVengeanceUsesExpended:
      totalSearingVengeanceUses > 0 && Number.isFinite(rawSearingVengeanceUsesExpended)
        ? Math.max(
            0,
            Math.min(totalSearingVengeanceUses, Math.floor(rawSearingVengeanceUsesExpended))
          )
        : totalSearingVengeanceUses > 0
          ? 0
          : undefined
  };
}

export function spendWarlockCelestialPatronHealingLightDice(
  character: Character,
  diceCount: number
): Character {
  if (!hasWarlockCelestialPatronHealingLight(character)) {
    return character;
  }

  const totalDice = getWarlockCelestialPatronHealingLightDiceTotal(character);
  const remainingDice = getWarlockCelestialPatronHealingLightDiceRemaining(character);
  const maxSpend = getWarlockCelestialPatronHealingLightMaxSpend(character);
  const normalizedDiceCount = Math.max(0, Math.floor(diceCount));

  if (
    normalizedDiceCount <= 0 ||
    normalizedDiceCount > remainingDice ||
    normalizedDiceCount > maxSpend
  ) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};
  const rawDiceExpended = Number(warlockState.healingLightDiceExpended);
  const diceExpended = Number.isFinite(rawDiceExpended)
    ? Math.max(0, Math.floor(rawDiceExpended))
    : 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        healingLightDiceExpended: Math.min(totalDice, diceExpended + normalizedDiceCount)
      }
    }
  };
}

export function expendWarlockCelestialPatronHealingLightDie(character: Character): Character {
  return spendWarlockCelestialPatronHealingLightDice(character, 1);
}

export function restoreWarlockCelestialPatronHealingLightDie(character: Character): Character {
  if (!hasWarlockCelestialPatronHealingLight(character)) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};
  const rawDiceExpended = Number(warlockState.healingLightDiceExpended);
  const diceExpended = Number.isFinite(rawDiceExpended)
    ? Math.max(0, Math.floor(rawDiceExpended))
    : 0;

  if (diceExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        healingLightDiceExpended: diceExpended - 1
      }
    }
  };
}

export function restoreWarlockCelestialPatronHealingLightOnLongRest(
  character: Character
): Character {
  if (!hasWarlockCelestialPatronHealingLight(character)) {
    return resetWarlockCelestialPatronRadiantSoulTurnState(character);
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  if ((warlockState.healingLightDiceExpended ?? 0) <= 0) {
    return resetWarlockCelestialPatronRadiantSoulTurnState(character);
  }

  return resetWarlockCelestialPatronRadiantSoulTurnState({
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        healingLightDiceExpended: 0
      }
    }
  });
}

export function restoreAllWarlockCelestialPatronHealingLightDice(character: Character): Character {
  return restoreWarlockCelestialPatronHealingLightOnLongRest(character);
}

export function getWarlockCelestialPatronSearingVengeanceUsesTotal(
  character: WarlockCelestialPatronCharacter
): number {
  return hasWarlockCelestialPatronSearingVengeance(character) ? 1 : 0;
}

export function getWarlockCelestialPatronSearingVengeanceUsesRemaining(
  character: WarlockCelestialPatronCharacter
): number {
  const totalUses = getWarlockCelestialPatronSearingVengeanceUsesTotal(character);
  const rawUsesExpended = Number(character.classFeatureState?.warlock?.searingVengeanceUsesExpended);

  return Math.max(
    0,
    totalUses - (Number.isFinite(rawUsesExpended) ? Math.max(0, Math.floor(rawUsesExpended)) : 0)
  );
}

export function consumeWarlockCelestialPatronSearingVengeanceUse(character: Character): Character {
  if (!hasWarlockCelestialPatronSearingVengeance(character)) {
    return character;
  }

  const totalUses = getWarlockCelestialPatronSearingVengeanceUsesTotal(character);
  const usesRemaining = getWarlockCelestialPatronSearingVengeanceUsesRemaining(character);

  if (totalUses <= 0 || usesRemaining <= 0) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};
  const rawUsesExpended = Number(warlockState.searingVengeanceUsesExpended);
  const usesExpended = Number.isFinite(rawUsesExpended)
    ? Math.max(0, Math.floor(rawUsesExpended))
    : 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        searingVengeanceUsesExpended: Math.min(totalUses, usesExpended + 1)
      }
    }
  };
}

export function restoreWarlockCelestialPatronSearingVengeanceOnLongRest(
  character: Character
): Character {
  if (!hasWarlockCelestialPatronSearingVengeance(character)) {
    return resetWarlockCelestialPatronRadiantSoulTurnState(character);
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  if ((warlockState.searingVengeanceUsesExpended ?? 0) <= 0) {
    return resetWarlockCelestialPatronRadiantSoulTurnState(character);
  }

  return resetWarlockCelestialPatronRadiantSoulTurnState({
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        searingVengeanceUsesExpended: 0
      }
    }
  });
}

export function restoreWarlockCelestialPatronFeaturesOnLongRest(character: Character): Character {
  return restoreWarlockCelestialPatronSearingVengeanceOnLongRest(
    restoreWarlockCelestialPatronHealingLightOnLongRest(character)
  );
}

export function getWarlockCelestialPatronCelestialResilienceTemporaryHitPoints(
  character: WarlockCelestialPatronCharacter
): number {
  if (!hasWarlockCelestialPatronCelestialResilience(character)) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(character.level ?? 0) + getAbilityModifier(character.abilities?.CHA ?? 10)
  );
}

export function applyWarlockCelestialPatronCelestialResilienceTemporaryHitPoints(
  character: Character
): Character {
  const grantedTemporaryHitPoints =
    getWarlockCelestialPatronCelestialResilienceTemporaryHitPoints(character);

  if (grantedTemporaryHitPoints <= 0) {
    return character;
  }

  return {
    ...character,
    ...swapTemporaryHitPointsAssignment(
      character.temporaryHitPoints,
      character.temporaryHitPointsSource,
      grantedTemporaryHitPoints,
      celestialResilienceName
    )
  };
}

export function applyWarlockCelestialPatronFeaturesOnShortRest(character: Character): Character {
  return applyWarlockCelestialPatronCelestialResilienceTemporaryHitPoints(
    resetWarlockCelestialPatronRadiantSoulTurnState(character)
  );
}

export function applyWarlockCelestialPatronFeaturesOnLongRest(character: Character): Character {
  return applyWarlockCelestialPatronCelestialResilienceTemporaryHitPoints(
    restoreWarlockCelestialPatronFeaturesOnLongRest(character)
  );
}

function getWarlockCelestialPatronSearingVengeanceAction(
  character: WarlockCelestialPatronCharacter
): FeatureActionCard | null {
  if (!hasWarlockCelestialPatronSearingVengeance(character)) {
    return null;
  }

  const usesRemaining = getWarlockCelestialPatronSearingVengeanceUsesRemaining(character);
  const usesTotal = getWarlockCelestialPatronSearingVengeanceUsesTotal(character);

  return {
    key: searingVengeanceActionKey,
    name: searingVengeanceName,
    summary: "Use your once-per-Long Rest Searing Vengeance.",
    detail: "Track your Searing Vengeance use.",
    breakdown: "1 charge per Long Rest",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    description: [...searingVengeanceDescription],
    drawer: {
      kind: "confirm",
      eyebrow: "Celestial Patron",
      description: [...searingVengeanceDescription]
    },
    disabled: usesRemaining <= 0,
    disabledReason: usesRemaining <= 0 ? "Searing Vengeance recharges on a Long Rest." : undefined
  };
}

function getWarlockCelestialPatronHealingLightAction(
  character: WarlockCelestialPatronCharacter
): FeatureActionCard | null {
  if (!hasWarlockCelestialPatronHealingLight(character)) {
    return null;
  }

  const totalDice = getWarlockCelestialPatronHealingLightDiceTotal(character);
  const remainingDice = getWarlockCelestialPatronHealingLightDiceRemaining(character);
  const maxSpend = getWarlockCelestialPatronHealingLightMaxSpend(character);
  const maxSpendNow = Math.min(remainingDice, maxSpend);

  return {
    key: healingLightActionKey,
    name: "Healing Light",
    summary: "Expend Healing d6 to restore Hit Points.",
    detail: "Choose how many Healing d6 to expend, then roll them to determine the healing.",
    breakdown: "Spend dice to heal",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesInlineLabel: "Spend",
    usesInlineIcon: "sparkles",
    usesInlineSuffix: "Healing d6",
    description: [...healingLightDescription],
    facts: [
      {
        label: "Max per Use",
        value: `${maxSpend}d6`
      }
    ],
    resources: [
      {
        kind: "tracker",
        label: "Healing d6",
        current: remainingDice,
        total: totalDice,
        icon: "sparkles"
      }
    ],
    drawer: {
      kind: "custom-form",
      eyebrow: "Celestial Patron",
      formKind: "healing-light",
      description: [...healingLightDescription],
      helperText: `Choose up to ${maxSpendNow} Healing d6 to expend.`,
      facts: [
        {
          label: "Max per Use",
          value: `${maxSpend}d6`
        }
      ]
    },
    execute: {
      kind: "custom-form",
      formKind: "healing-light"
    },
    disabled: remainingDice <= 0,
    disabledReason: remainingDice <= 0 ? "No Healing d6 remaining." : undefined
  };
}

export const getWarlockCelestialPatronDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  if (
    character.className !== "Warlock" ||
    character.subclassId !== celestialPatronSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return {};
  }

  const healingLightAction = getWarlockCelestialPatronHealingLightAction(character);
  const searingVengeanceAction = getWarlockCelestialPatronSearingVengeanceAction(character);

  return {
    featureActions: [healingLightAction, searingVengeanceAction].filter(
      (action): action is FeatureActionCard => action !== null
    ),
    derivedStatusEntries: getWarlockCelestialPatronDerivedStatusEntries(character),
    getSpellDamageFormulaOverride: (spell) =>
      getWarlockCelestialPatronRadiantSoulDamageFormulaOverride(character, spell.id),
    alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
      character.level ?? 0,
      celestialPatronSpellIdsByLevel
    )
  };
};
