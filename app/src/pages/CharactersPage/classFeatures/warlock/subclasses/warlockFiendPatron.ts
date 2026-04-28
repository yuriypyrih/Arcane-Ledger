import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  type SpellDescriptionEntry
} from "../../../../../codex/entries";
import { warlockFeatures } from "../../../../../codex/classes";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { getProficiencyBonus } from "../../../gameplay";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import { swapTemporaryHitPointsAssignment } from "../../../shared";
import { formatFormulaCell, formatSignedFormulaTerm } from "../../../shared/formulas";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import type { DerivedFeatureStatusEntry, FeatureActionCard, FeatureActionFact } from "../../types";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";

export const fiendPatronSubclassId = "warlock-fiend-patron";
export const darkOnesBlessingActionKey = "warlock-fiend-patron-dark-ones-blessing";
export const darkOnesOwnLuckActionKey = "warlock-fiend-patron-dark-ones-own-luck";
export const hurlThroughHellActionKey = "warlock-fiend-patron-hurl-through-hell";

const fiendPatronSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Burning Hands", "Command", "Scorching Ray", "Suggestion"]),
  5: resolveSpellIdsByName(["Fireball", "Stinking Cloud"]),
  7: resolveSpellIdsByName(["Fire Shield", "Wall of Fire"]),
  9: resolveSpellIdsByName(["Geas", "Insect Plague"])
} as const;
const darkOnesBlessingName = "Dark One's Blessing";
const darkOnesOwnLuckName = "Dark One's Own Luck";
const darkOnesBlessingFormulaLabel = "Temporary HP Formula";
const fiendishResilienceName = "Fiendish Resilience";
const hurlThroughHellName = "Hurl Through Hell";
const fiendishResilienceSourceId = "feature-warlock-fiend-patron-fiendish-resilience";
const fiendPatronSubclassEntry = getSubclassEntryById(fiendPatronSubclassId);
export const warlockFiendPatronFiendishResilienceDamageTypeOptions = [
  DAMAGE_TYPE.PIERCING,
  DAMAGE_TYPE.BLUDGEONING,
  DAMAGE_TYPE.SLASHING,
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.LIGHTNING,
  DAMAGE_TYPE.THUNDER,
  DAMAGE_TYPE.POISON,
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.NECROTIC,
  DAMAGE_TYPE.RADIANT,
  DAMAGE_TYPE.PSYCHIC
] as const satisfies readonly DAMAGE_TYPE[];

type WarlockFiendPatronCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "level" | "spellSlotsExpended" | "subclassId"
    >
  >;

function getFiendPatronFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = fiendPatronSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const darkOnesBlessingDescription = getFiendPatronFeatureDescriptionEntries(
  CLASS_FEATURE.DARK_ONES_BLESSING
);
const darkOnesOwnLuckDescription = getFiendPatronFeatureDescriptionEntries(
  CLASS_FEATURE.DARK_ONES_OWN_LUCK
);
const hurlThroughHellDescription = getFiendPatronFeatureDescriptionEntries(
  CLASS_FEATURE.HURL_THROUGH_HELL
);

function hasWarlockFiendPatronDarkOnesBlessing(
  character: WarlockFiendPatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === fiendPatronSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWarlockFiendPatronDarkOnesOwnLuck(
  character: WarlockFiendPatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === fiendPatronSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasWarlockFiendPatronFiendishResilience(
  character: WarlockFiendPatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === fiendPatronSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function hasWarlockFiendPatronHurlThroughHell(
  character: WarlockFiendPatronCharacter
): boolean {
  return (
    character.className === "Warlock" &&
    character.subclassId === fiendPatronSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function getWarlockFiendPatronPactMagicSlotLevel(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  if (character.className !== "Warlock") {
    return 0;
  }

  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(character.level ?? 1)));
  const matchingRows = warlockFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);
  const featureRow = matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;

  return featureRow?.slotLevel ?? 0;
}

function getWarlockFiendPatronPactMagicSlotsRemaining(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "spellSlotsExpended">>
): number {
  const pactMagicSlotLevel = getWarlockFiendPatronPactMagicSlotLevel(character);

  if (pactMagicSlotLevel <= 0) {
    return 0;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level ?? 1);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const pactMagicSlotTotal = spellSlotTotals[pactMagicSlotLevel - 1] ?? 0;
  const pactMagicSlotsExpended = spellSlotsExpended[pactMagicSlotLevel - 1] ?? 0;

  return Math.max(0, pactMagicSlotTotal - pactMagicSlotsExpended);
}

export function normalizeWarlockFiendPatronFiendishResilienceDamageType(
  value: unknown
): DAMAGE_TYPE | undefined {
  return warlockFiendPatronFiendishResilienceDamageTypeOptions.some(
    (damageType) => damageType === value
  )
    ? (value as DAMAGE_TYPE)
    : undefined;
}

export function getWarlockFiendPatronFiendishResilienceDamageTypeSelection(
  character: WarlockFiendPatronCharacter
): DAMAGE_TYPE | null {
  if (!hasWarlockFiendPatronFiendishResilience(character)) {
    return null;
  }

  return (
    normalizeWarlockFiendPatronFiendishResilienceDamageType(
      character.classFeatureState?.warlock?.fiendishResilienceDamageType
    ) ?? null
  );
}

export function setWarlockFiendPatronFiendishResilienceDamageTypeSelection(
  character: Character,
  damageType: DAMAGE_TYPE
): Character {
  if (!hasWarlockFiendPatronFiendishResilience(character)) {
    return character;
  }

  const nextDamageType = normalizeWarlockFiendPatronFiendishResilienceDamageType(damageType);

  if (!nextDamageType) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        fiendishResilienceDamageType: nextDamageType
      }
    }
  };
}

export function getWarlockFiendPatronDarkOnesBlessingTemporaryHitPoints(
  character: WarlockFiendPatronCharacter
): number {
  if (!hasWarlockFiendPatronDarkOnesBlessing(character)) {
    return 0;
  }

  return Math.max(
    1,
    Math.floor(character.level ?? 0) + getAbilityModifierForCharacter(character, "CHA")
  );
}

function getWarlockFiendPatronDarkOnesBlessingFormulaFact(
  character: WarlockFiendPatronCharacter
): FeatureActionFact {
  const warlockLevel = Math.max(0, Math.floor(character.level ?? 0));
  const charismaModifier = getAbilityModifierForCharacter(character, "CHA");
  const temporaryHitPoints = getWarlockFiendPatronDarkOnesBlessingTemporaryHitPoints(character);

  return {
    label: darkOnesBlessingFormulaLabel,
    value: `${temporaryHitPoints} Temporary HP = ${warlockLevel} Warlock Level + ${charismaModifier} CHA`,
    fullWidth: true
  };
}

function getWarlockFiendPatronHurlThroughHellSpellDcFact(
  character: WarlockFiendPatronCharacter
): FeatureActionFact {
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const charismaModifier = getAbilityModifierForCharacter(character, "CHA");
  const dc = 8 + proficiencyBonus + charismaModifier;
  const formulaCell = formatFormulaCell({
    formula: String(dc),
    displayTerms: [
      "DC 8 (Base)",
      formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus"),
      formatSignedFormulaTerm(charismaModifier, "CHA")
    ]
  });

  return {
    label: "Spell DC Formula",
    value: `Charisma save DC ${dc} = ${formulaCell.value}`,
    breakdown: formulaCell.breakdown,
    fullWidth: true
  };
}

export function applyWarlockFiendPatronDarkOnesBlessing(character: Character): Character {
  const grantedTemporaryHitPoints =
    getWarlockFiendPatronDarkOnesBlessingTemporaryHitPoints(character);

  if (grantedTemporaryHitPoints <= 0) {
    return character;
  }

  return {
    ...character,
    ...swapTemporaryHitPointsAssignment(
      character.temporaryHitPoints,
      character.temporaryHitPointsSource,
      grantedTemporaryHitPoints,
      darkOnesBlessingName
    )
  };
}

export function getWarlockFiendPatronDarkOnesOwnLuckUsesTotal(
  character: WarlockFiendPatronCharacter
): number {
  if (!hasWarlockFiendPatronDarkOnesOwnLuck(character)) {
    return 0;
  }

  return Math.max(1, getAbilityModifierForCharacter(character, "CHA"));
}

export function getWarlockFiendPatronDarkOnesOwnLuckUsesRemaining(
  character: WarlockFiendPatronCharacter
): number {
  const totalUses = getWarlockFiendPatronDarkOnesOwnLuckUsesTotal(character);
  const rawUsesExpended = Number(
    character.classFeatureState?.warlock?.darkOnesOwnLuckUsesExpended
  );

  return Math.max(
    0,
    totalUses - (Number.isFinite(rawUsesExpended) ? Math.max(0, Math.floor(rawUsesExpended)) : 0)
  );
}

export function getWarlockFiendPatronDarkOnesOwnLuckDescriptionAdditions(
  character: WarlockFiendPatronCharacter
): SpellDescriptionEntry[][] {
  if (!hasWarlockFiendPatronDarkOnesOwnLuck(character) || darkOnesOwnLuckDescription.length <= 0) {
    return [];
  }

  const descriptionEntries = createFeatureSourcedDescriptionEntries(
    character,
    CLASS_FEATURE.DARK_ONES_OWN_LUCK,
    darkOnesOwnLuckDescription.slice(0, 3),
    darkOnesOwnLuckName
  );

  return descriptionEntries.length > 0 ? [descriptionEntries] : [];
}

export function getWarlockFiendPatronHurlThroughHellUsesTotal(
  character: WarlockFiendPatronCharacter
): number {
  return hasWarlockFiendPatronHurlThroughHell(character) ? 1 : 0;
}

export function getWarlockFiendPatronHurlThroughHellUsesRemaining(
  character: WarlockFiendPatronCharacter
): number {
  const totalUses = getWarlockFiendPatronHurlThroughHellUsesTotal(character);
  const rawUsesExpended = Number(character.classFeatureState?.warlock?.hurlThroughHellUsesExpended);

  return Math.max(
    0,
    totalUses - (Number.isFinite(rawUsesExpended) ? Math.max(0, Math.floor(rawUsesExpended)) : 0)
  );
}

export function normalizeWarlockFiendPatronFeatureState(
  value: Partial<CharacterWarlockFeatureState>,
  character: WarlockFiendPatronCharacter
): Pick<
  CharacterWarlockFeatureState,
  | "darkOnesOwnLuckUsesExpended"
  | "fiendishResilienceDamageType"
  | "hurlThroughHellUsesExpended"
> {
  const totalUses = getWarlockFiendPatronDarkOnesOwnLuckUsesTotal(character);
  const hurlThroughHellUsesTotal = getWarlockFiendPatronHurlThroughHellUsesTotal(character);
  const rawUsesExpended = Number(value.darkOnesOwnLuckUsesExpended);
  const rawHurlThroughHellUsesExpended = Number(value.hurlThroughHellUsesExpended);

  return {
    darkOnesOwnLuckUsesExpended:
      totalUses > 0 && Number.isFinite(rawUsesExpended)
        ? Math.max(0, Math.min(totalUses, Math.floor(rawUsesExpended)))
        : totalUses > 0
          ? 0
          : undefined,
    hurlThroughHellUsesExpended:
      hurlThroughHellUsesTotal > 0 && Number.isFinite(rawHurlThroughHellUsesExpended)
        ? Math.max(0, Math.min(hurlThroughHellUsesTotal, Math.floor(rawHurlThroughHellUsesExpended)))
        : hurlThroughHellUsesTotal > 0
          ? 0
          : undefined,
    fiendishResilienceDamageType: hasWarlockFiendPatronFiendishResilience(character)
      ? normalizeWarlockFiendPatronFiendishResilienceDamageType(
          value.fiendishResilienceDamageType
        )
      : undefined
  };
}

export function consumeWarlockFiendPatronDarkOnesOwnLuckUse(character: Character): Character {
  if (!hasWarlockFiendPatronDarkOnesOwnLuck(character)) {
    return character;
  }

  const totalUses = getWarlockFiendPatronDarkOnesOwnLuckUsesTotal(character);
  const usesRemaining = getWarlockFiendPatronDarkOnesOwnLuckUsesRemaining(character);

  if (totalUses <= 0 || usesRemaining <= 0) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};
  const rawUsesExpended = Number(warlockState.darkOnesOwnLuckUsesExpended);
  const usesExpended = Number.isFinite(rawUsesExpended)
    ? Math.max(0, Math.floor(rawUsesExpended))
    : 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        darkOnesOwnLuckUsesExpended: Math.min(totalUses, usesExpended + 1)
      }
    }
  };
}

export function restoreWarlockFiendPatronDarkOnesOwnLuckOnLongRest(
  character: Character
): Character {
  if (!hasWarlockFiendPatronDarkOnesOwnLuck(character)) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  if ((warlockState.darkOnesOwnLuckUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        darkOnesOwnLuckUsesExpended: 0
      }
    }
  };
}

export function consumeWarlockFiendPatronHurlThroughHellUse(character: Character): Character {
  if (!hasWarlockFiendPatronHurlThroughHell(character)) {
    return character;
  }

  const usesRemaining = getWarlockFiendPatronHurlThroughHellUsesRemaining(character);

  if (usesRemaining > 0) {
    const warlockState = character.classFeatureState?.warlock ?? {};
    const totalUses = getWarlockFiendPatronHurlThroughHellUsesTotal(character);
    const rawUsesExpended = Number(warlockState.hurlThroughHellUsesExpended);
    const usesExpended = Number.isFinite(rawUsesExpended)
      ? Math.max(0, Math.floor(rawUsesExpended))
      : 0;

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        warlock: {
          ...warlockState,
          hurlThroughHellUsesExpended: Math.min(totalUses, usesExpended + 1)
        }
      }
    };
  }

  const pactMagicSlotsRemaining = getWarlockFiendPatronPactMagicSlotsRemaining(character);
  const pactMagicSlotLevel = getWarlockFiendPatronPactMagicSlotLevel(character);

  if (pactMagicSlotsRemaining <= 0 || pactMagicSlotLevel <= 0) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level ?? 1);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[pactMagicSlotLevel - 1] =
    (nextSpellSlotsExpended[pactMagicSlotLevel - 1] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function restoreWarlockFiendPatronHurlThroughHellOnLongRest(
  character: Character
): Character {
  if (!hasWarlockFiendPatronHurlThroughHell(character)) {
    return character;
  }

  const warlockState = character.classFeatureState?.warlock ?? {};

  if ((warlockState.hurlThroughHellUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        hurlThroughHellUsesExpended: 0
      }
    }
  };
}

export function restoreWarlockFiendPatronFeaturesOnLongRest(character: Character): Character {
  return restoreWarlockFiendPatronHurlThroughHellOnLongRest(
    restoreWarlockFiendPatronDarkOnesOwnLuckOnLongRest(character)
  );
}

function getWarlockFiendPatronDerivedStatusEntries(
  character: WarlockFiendPatronCharacter
): DerivedFeatureStatusEntry[] {
  const damageType = getWarlockFiendPatronFiendishResilienceDamageTypeSelection(character);

  if (!damageType) {
    return [];
  }

  return [
    {
      id: `${fiendishResilienceSourceId}-resistance-${damageType.toLowerCase()}`,
      sourceId: fiendishResilienceSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: damageType,
      source: fiendishResilienceName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

function getWarlockFiendPatronDarkOnesBlessingAction(
  character: WarlockFiendPatronCharacter
): FeatureActionCard | null {
  if (!hasWarlockFiendPatronDarkOnesBlessing(character)) {
    return null;
  }

  const grantedTemporaryHitPoints =
    getWarlockFiendPatronDarkOnesBlessingTemporaryHitPoints(character);
  const temporaryHitPointsFormulaFact = getWarlockFiendPatronDarkOnesBlessingFormulaFact(character);

  return {
    key: darkOnesBlessingActionKey,
    name: darkOnesBlessingName,
    summary: "Gain Temporary Hit Points equal to your Charisma modifier plus your Warlock level.",
    detail: `Gain ${grantedTemporaryHitPoints} Temporary Hit Points (minimum 1).`,
    breakdown: "Gain Temp HP",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    description: [...darkOnesBlessingDescription],
    drawer: {
      kind: "confirm",
      eyebrow: "Fiend Patron",
      description: [...darkOnesBlessingDescription],
      facts: [temporaryHitPointsFormulaFact],
      factsSectionTitle: null
    },
    execute: {
      kind: "activate"
    }
  };
}

function getWarlockFiendPatronDarkOnesOwnLuckAction(
  character: WarlockFiendPatronCharacter
): FeatureActionCard | null {
  if (!hasWarlockFiendPatronDarkOnesOwnLuck(character)) {
    return null;
  }

  const usesRemaining = getWarlockFiendPatronDarkOnesOwnLuckUsesRemaining(character);
  const usesTotal = getWarlockFiendPatronDarkOnesOwnLuckUsesTotal(character);

  return {
    key: darkOnesOwnLuckActionKey,
    name: darkOnesOwnLuckName,
    summary: "Add 1d10 to an ability check or saving throw after seeing the roll.",
    detail: "Spend a use to apply Dark One's Own Luck to a roll.",
    breakdown: "1d10 check/save boost",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    description: [...darkOnesOwnLuckDescription],
    drawer: {
      kind: "confirm",
      eyebrow: "Fiend Patron",
      description: [...darkOnesOwnLuckDescription]
    },
    execute: {
      kind: "activate"
    },
    disabled: usesRemaining <= 0,
    disabledReason:
      usesRemaining <= 0 ? "Dark One's Own Luck recharges on a Long Rest." : undefined
  };
}

function getWarlockFiendPatronHurlThroughHellAction(
  character: WarlockFiendPatronCharacter
): FeatureActionCard | null {
  if (!hasWarlockFiendPatronHurlThroughHell(character)) {
    return null;
  }

  const usesRemaining = getWarlockFiendPatronHurlThroughHellUsesRemaining(character);
  const usesTotal = getWarlockFiendPatronHurlThroughHellUsesTotal(character);
  const pactMagicSlotLevel = getWarlockFiendPatronPactMagicSlotLevel(character);
  const pactMagicSlotsRemaining = getWarlockFiendPatronPactMagicSlotsRemaining(character);
  const pactMagicSlotsTotal =
    pactMagicSlotLevel > 0
      ? getSpellSlotTotalsForCharacter(character.className, character.level ?? 1)[
          pactMagicSlotLevel - 1
        ] ?? 0
      : 0;
  const hasFallbackSlot = usesRemaining <= 0 && pactMagicSlotsRemaining > 0 && pactMagicSlotLevel > 0;
  const disabled = usesRemaining <= 0 && !hasFallbackSlot;
  const spellDcFact = getWarlockFiendPatronHurlThroughHellSpellDcFact(character);
  const resources = [
    {
      kind: "tracker" as const,
      label: "Uses",
      current: usesRemaining,
      total: usesTotal,
      cost: 1
    },
    ...(pactMagicSlotsTotal > 0
      ? [
          {
            kind: "text" as const,
            label: "Pact Magic Slots",
            value: `${pactMagicSlotsRemaining}/${pactMagicSlotsTotal}`,
            icon: "sparkles" as const
          }
        ]
      : [])
  ];

  return {
    key: hurlThroughHellActionKey,
    name: hurlThroughHellName,
    summary: "Use your once-per-Long Rest Hurl Through Hell, or spend a Pact Magic slot after it is used.",
    detail: hasFallbackSlot
      ? "Spend a Pact Magic slot to use Hurl Through Hell again."
      : "Use Hurl Through Hell once per Long Rest.",
    breakdown: "1 charge per Long Rest",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createChargesOrResourceCardUsage(
      usesRemaining,
      usesTotal,
      createFeatureActionCardCost({
        resourceLabel: "Pact Magic Slot"
      })
    ),
    usesRemaining,
    usesTotal,
    hideUsesTrackerOnCard: true,
    usesLabel: `${usesRemaining}/${usesTotal} use`,
    usesInlineLabel: hasFallbackSlot ? "| Use Pact Magic Slot" : undefined,
    usesInlineIcon: hasFallbackSlot ? "sparkles" : undefined,
    usesInlineSuffix: hasFallbackSlot ? "instead" : undefined,
    description: [...hurlThroughHellDescription],
    facts: [spellDcFact],
    headerTags: createChargesAndUsageHeaderTags(
      usesRemaining,
      usesTotal,
      createFeatureActionCardCost({
        resourceLabel: "Pact Magic Slot"
      }),
      pactMagicSlotsRemaining,
      pactMagicSlotsTotal,
      {
        label: "Pact Magic Slots"
      }
    ),
    resources,
    drawer: {
      kind: "confirm",
      eyebrow: "Fiend Patron",
      description: [...hurlThroughHellDescription],
      factsSectionTitle: null,
      helperText: hasFallbackSlot
        ? "Your free use is spent. Activating this now expends one Pact Magic spell slot."
        : pactMagicSlotsTotal > 0
          ? "After your free use is spent, Hurl Through Hell can expend one Pact Magic spell slot instead."
          : undefined,
      resources
    },
    execute: {
      kind: "activate"
    },
    disabled,
    disabledReason: disabled
      ? "No Hurl Through Hell use or Pact Magic spell slots remaining."
      : undefined
  };
}

export const getWarlockFiendPatronDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Warlock" &&
  character.subclassId === fiendPatronSubclassId &&
  (character.level ?? 0) >= 3
    ? {
        featureActions: [
          getWarlockFiendPatronDarkOnesBlessingAction(character),
          getWarlockFiendPatronDarkOnesOwnLuckAction(character),
          getWarlockFiendPatronHurlThroughHellAction(character)
        ].filter((action): action is FeatureActionCard => action !== null),
        derivedStatusEntries: getWarlockFiendPatronDerivedStatusEntries(character),
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          fiendPatronSpellIdsByLevel
        )
      }
    : {};
