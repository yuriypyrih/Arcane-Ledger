import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  getSpellEntryById,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { swapTemporaryHitPointsAssignment } from "../../../shared";
import {
  createFeatureActionCardCost,
  createNamedResourceCardUsage,
  createNamedUsageHeaderTags
} from "../../cardUsage";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard, FeatureActionFact } from "../../types";

export const celestialPatronSubclassId = "warlock-celestial-patron";

const magicalCunningActionKey = "warlock-magical-cunning";
const healingLightActionKey = "warlock-celestial-patron-healing-light";
const radiantSoulName = "Radiant Soul";
const radiantSoulDamageDescription = [
  "Once per turn, when a spell you cast deals Radiant or Fire damage, you can add your Charisma modifier to that spell's damage against one of the spell's targets."
];
const radiantSoulResistanceSourceId = "feature-warlock-celestial-patron-radiant-soul-resistance";
const celestialResilienceName = "Celestial Resilience";
const celestialResilienceFormulaLabel = "Celestial Resiliance Temporary HP Formula";
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
const celestialResilienceDescription = getCelestialPatronFeatureDescriptionEntries(
  CLASS_FEATURE.CELESTIAL_RESILIENCE
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

function hasWarlockCelestialPatronRadiantSoul(character: WarlockCelestialPatronCharacter): boolean {
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

export function getWarlockCelestialPatronRadiantSoulDamageBonus(
  character: WarlockCelestialPatronCharacter
): number {
  return hasWarlockCelestialPatronRadiantSoul(character)
    ? Math.max(0, getAbilityModifierForCharacter(character, "CHA"))
    : 0;
}

function spellQualifiesForWarlockCelestialPatronRadiantSoul(
  spell: Pick<SpellEntry, "damage"> | null
): boolean {
  if (!spell || spell.damage.length <= 0) {
    return false;
  }

  return spell.damage.some(([, damageType]) =>
    (Array.isArray(damageType) ? damageType : [damageType]).some(
      (entry) => entry === DAMAGE_TYPE.FIRE || entry === DAMAGE_TYPE.RADIANT
    )
  );
}

export function canUseWarlockCelestialPatronRadiantSoulForSpell(
  character: WarlockCelestialPatronCharacter,
  spell: Pick<SpellEntry, "damage"> | null
): boolean {
  return (
    spellSupportsWarlockCelestialPatronRadiantSoul(character, spell) &&
    getWarlockCelestialPatronRadiantSoulDamageBonus(character) > 0 &&
    character.classFeatureState?.warlock?.radiantSoulUsedThisTurn !== true
  );
}

export function spellSupportsWarlockCelestialPatronRadiantSoul(
  character: WarlockCelestialPatronCharacter,
  spell: Pick<SpellEntry, "damage"> | null
): boolean {
  return (
    hasWarlockCelestialPatronRadiantSoul(character) &&
    spellQualifiesForWarlockCelestialPatronRadiantSoul(spell)
  );
}

export function getWarlockCelestialPatronRadiantSoulDamageDetail(
  character: WarlockCelestialPatronCharacter,
  spell: Pick<SpellEntry, "damage"> | null,
  baseDamageDetail: string
): string {
  if (!canUseWarlockCelestialPatronRadiantSoulForSpell(character, spell)) {
    return baseDamageDetail;
  }

  const damageBonus = getWarlockCelestialPatronRadiantSoulDamageBonus(character);

  return `${baseDamageDetail} + ${damageBonus} CHA (${radiantSoulName})`;
}

function getWarlockCelestialPatronRadiantSoulSpellEntry(
  character: WarlockCelestialPatronCharacter,
  spell: SpellEntry
): SpellEntry {
  if (
    !hasWarlockCelestialPatronRadiantSoul(character) ||
    !spellQualifiesForWarlockCelestialPatronRadiantSoul(spell)
  ) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.RADIANT_SOUL,
    radiantSoulDamageDescription,
    radiantSoulName
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

export function applyWarlockCelestialPatronFeaturesAfterSpellCast(
  character: Character,
  spellId: string,
  options: { useRadiantSoul?: boolean } = {}
): Character {
  const spell = getSpellEntryById(spellId);

  if (
    options.useRadiantSoul !== true ||
    !canUseWarlockCelestialPatronRadiantSoulForSpell(character, spell)
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

  return Math.max(1, getAbilityModifierForCharacter(character, "CHA"));
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
  const rawUsesExpended = Number(
    character.classFeatureState?.warlock?.searingVengeanceUsesExpended
  );

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
    Math.floor(character.level ?? 0) + getAbilityModifierForCharacter(character, "CHA")
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

function getWarlockCelestialPatronCelestialResilienceFormulaFact(
  character: WarlockCelestialPatronCharacter
): FeatureActionFact | null {
  if (!hasWarlockCelestialPatronCelestialResilience(character)) {
    return null;
  }

  const warlockLevel = Math.max(0, Math.floor(character.level ?? 0));
  const charismaModifier = getAbilityModifierForCharacter(character, "CHA");
  const temporaryHitPoints =
    getWarlockCelestialPatronCelestialResilienceTemporaryHitPoints(character);
  const formulaContent = `${temporaryHitPoints} Temporary Hp = ${warlockLevel} Warlock Level + ${charismaModifier} CHA`;

  return {
    label: celestialResilienceFormulaLabel,
    value: formulaContent,
    fullWidth: true
  };
}

function appendCelestialResilienceFormulaFact(
  facts: FeatureActionFact[],
  fact: FeatureActionFact | null
): FeatureActionFact[] {
  if (!fact || facts.some((entry) => entry.label === fact.label)) {
    return facts;
  }

  return [...facts, fact];
}

function transformWarlockCelestialPatronFeatureAction(
  character: WarlockCelestialPatronCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  if (
    action.key !== magicalCunningActionKey ||
    !hasWarlockCelestialPatronCelestialResilience(character)
  ) {
    return action;
  }

  const actionWithDescription = appendFeatureSourcedDescriptionAddition(
    action,
    character,
    CLASS_FEATURE.CELESTIAL_RESILIENCE,
    celestialResilienceDescription,
    celestialResilienceName
  );
  const drawer = actionWithDescription.drawer;
  const facts = appendCelestialResilienceFormulaFact(
    drawer?.facts ?? actionWithDescription.facts ?? [],
    getWarlockCelestialPatronCelestialResilienceFormulaFact(character)
  );

  return {
    ...actionWithDescription,
    drawer: {
      ...(drawer ?? {}),
      kind: drawer?.kind ?? "confirm",
      facts,
      factsSectionTitle: null
    }
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

  return {
    key: healingLightActionKey,
    name: "Healing Light",
    summary: "Expend Healing d6 to restore Hit Points.",
    detail: "Choose how many Healing d6 to expend, then roll them to determine the healing.",
    breakdown: "Spend dice to heal",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createNamedResourceCardUsage(
      createFeatureActionCardCost({
        resourceLabel: "Healing d6"
      })
    ),
    description: [...healingLightDescription],
    drawer: {
      kind: "custom-form",
      eyebrow: "Celestial Patron",
      formKind: "healing-light",
      description: [...healingLightDescription],
      headerTags: createNamedUsageHeaderTags(
        createFeatureActionCardCost({
          resourceLabel: "Healing d6"
        }),
        remainingDice,
        totalDice,
        {
          label: "d6"
        }
      )
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

  return {
    featureActions: [getWarlockCelestialPatronHealingLightAction(character)].filter(
      (action): action is FeatureActionCard => action !== null
    ),
    derivedStatusEntries: getWarlockCelestialPatronDerivedStatusEntries(character),
    transformFeatureAction: (action) =>
      transformWarlockCelestialPatronFeatureAction(character, action),
    transformSpellEntry: (spell) =>
      getWarlockCelestialPatronRadiantSoulSpellEntry(character, spell),
    alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
      character.level ?? 0,
      celestialPatronSpellIdsByLevel
    )
  };
};
