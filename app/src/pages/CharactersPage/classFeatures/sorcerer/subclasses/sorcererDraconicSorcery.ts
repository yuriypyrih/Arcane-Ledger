import { sorcererFeatures } from "../../../../../codex/classes";
import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../statusEntries";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import type {
  ArmorClassFeatureContext,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureArmorClassMode,
  FeatureSpeedBonus
} from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getPreparedSpellIdsByLevel, resolveSpellIdsByName } from "../../subclassRuntime";

export const draconicSorcerySubclassId = "sorcerer-draconic-sorcery";
export const sorcererDragonWingsActionKey = "sorcerer-draconic-sorcery-dragon-wings";
const elementalAffinityName = "Elemental Affinity";
const dragonWingsName = "Dragon Wings";
const sorcererDraconicElementalAffinitySourceId =
  "feature-sorcerer-draconic-sorcery-elemental-affinity";
export const sorcererDragonWingsStatusSourceId =
  "feature-sorcerer-draconic-sorcery-dragon-wings";
const draconicSorcerySubclassEntry = getSubclassEntryById(draconicSorcerySubclassId);
const dragonWingsUsesTotal = 1;
const dragonWingsDurationHours = 1;
const dragonWingsFlySpeed = 60;
const dragonWingsFallbackSorceryPointCost = 3;

const draconicSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Alter Self", "Chromatic Orb", "Command", "Dragon's Breath"]),
  5: resolveSpellIdsByName(["Fear", "Fly"]),
  7: resolveSpellIdsByName(["Arcane Eye", "Charm Monster"]),
  9: resolveSpellIdsByName(["Legend Lore", "Summon Dragon"])
} as const;

type DraconicSorceryCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "statusEntries" | "subclassId">>;

function getDraconicFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  return (
    draconicSorcerySubclassEntry?.features.find((row) => row.classFeatures.includes(feature))
      ?.featureOverrides?.[feature]?.description ?? []
  ).filter((entry): entry is string => typeof entry === "string");
}

export const dragonWingsDescription = getDraconicFeatureDescriptionEntries(
  CLASS_FEATURE.DRAGON_WINGS
);

export const sorcererDraconicElementalAffinityDamageTypeOptions = [
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.LIGHTNING,
  DAMAGE_TYPE.POISON
] as const;

function hasSorcererDraconicResilienceFeature(character: DraconicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === draconicSorcerySubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function getSorcererDraconicResilienceHitPointMaximumBonus(
  character: DraconicSorceryCharacter
): number {
  return hasSorcererDraconicResilienceFeature(character) ? Math.max(0, character.level ?? 0) : 0;
}

export function hasSorcererDraconicElementalAffinityFeature(
  character: DraconicSorceryCharacter
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === draconicSorcerySubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasSorcererDragonWingsFeature(character: DraconicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === draconicSorcerySubclassId &&
    (character.level ?? 0) >= 14
  );
}

function getSorcererFeatureRow(level: number | undefined) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level ?? 0)));
  const matchingRows = sorcererFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getSorcererDraconicSorceryPointsTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  return character.className === "Sorcerer"
    ? Math.max(0, getSorcererFeatureRow(character.level)?.sorceryPoints ?? 0)
    : 0;
}

function getSorcererDraconicSorceryPointsRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level">>
): number {
  const totalPoints = getSorcererDraconicSorceryPointsTotal(character);
  const expendedPoints = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);

  return Math.max(
    0,
    totalPoints -
      (Number.isFinite(expendedPoints)
        ? Math.max(0, Math.min(totalPoints, Math.floor(expendedPoints)))
        : 0)
  );
}

function spendSorcererDraconicSorceryPoints(character: Character, cost: number): Character {
  const normalizedCost = Math.max(0, Math.floor(cost));

  if (normalizedCost <= 0) {
    return character;
  }

  const totalPoints = getSorcererDraconicSorceryPointsTotal(character);
  const remainingPoints = getSorcererDraconicSorceryPointsRemaining(character);

  if (totalPoints <= 0 || remainingPoints < normalizedCost) {
    return character;
  }

  const currentExpended = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);
  const nextExpended = Math.max(
    0,
    Math.min(
      totalPoints,
      (Number.isFinite(currentExpended) ? Math.floor(currentExpended) : 0) + normalizedCost
    )
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        sorceryPointsExpended: nextExpended
      }
    }
  };
}

export function getSorcererDraconicDragonWingsUsesTotal(
  character: DraconicSorceryCharacter
): number {
  return hasSorcererDragonWingsFeature(character) ? dragonWingsUsesTotal : 0;
}

function getSorcererDraconicDragonWingsUsesRemaining(
  character: DraconicSorceryCharacter
): number {
  const totalUses = getSorcererDraconicDragonWingsUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.dragonWingsUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

function clearSorcererDragonWingsStatuses(statusEntries: Character["statusEntries"]) {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== sorcererDragonWingsStatusSourceId
  );
}

function hasActiveSorcererDragonWings(character: DraconicSorceryCharacter): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === sorcererDragonWingsStatusSourceId
  );
}

function getSorcererDragonWingsAction(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureActionCard | null {
  if (!hasSorcererDragonWingsFeature(character)) {
    return null;
  }

  const usesRemaining = getSorcererDraconicDragonWingsUsesRemaining(character);
  const totalPoints = getSorcererDraconicSorceryPointsTotal(character);
  const remainingPoints = getSorcererDraconicSorceryPointsRemaining(character);
  const isActive = hasActiveSorcererDragonWings(character);
  const fallbackAvailable =
    usesRemaining <= 0 && remainingPoints >= dragonWingsFallbackSorceryPointCost;
  const disabledReason = isActive
    ? `${dragonWingsName} is already active.`
    : usesRemaining > 0 || fallbackAvailable
      ? undefined
      : `You need ${dragonWingsFallbackSorceryPointCost} Sorcery Points.`;

  return {
    key: sorcererDragonWingsActionKey,
    name: dragonWingsName,
    summary: "Manifest draconic wings for 1 hour.",
    detail: `Gain a Fly Speed of ${dragonWingsFlySpeed} feet for 1 hour.`,
    breakdown: "Manifest dragon wings",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    cardUsage: createChargesOrResourceCardUsage(
      usesRemaining,
      getSorcererDraconicDragonWingsUsesTotal(character),
      createFeatureActionCardCost({
        amountText: String(dragonWingsFallbackSorceryPointCost),
        icon: "sparkles"
      })
    ),
    usesRemaining,
    usesTotal: getSorcererDraconicDragonWingsUsesTotal(character),
    usesInlineLabel:
      usesRemaining <= 0 ? `| Use ${dragonWingsFallbackSorceryPointCost}` : undefined,
    usesInlineIcon: usesRemaining <= 0 ? "sparkles" : undefined,
    usesInlineSuffix: usesRemaining <= 0 ? "instead" : undefined,
    description: dragonWingsDescription,
    headerTags:
      totalPoints > 0
        ? createChargesAndUsageHeaderTags(
            usesRemaining,
            getSorcererDraconicDragonWingsUsesTotal(character),
            createFeatureActionCardCost({
              amountText: String(dragonWingsFallbackSorceryPointCost),
              icon: "sparkles"
            }),
            remainingPoints,
            totalPoints,
            {
              icon: "sparkles"
            }
          )
        : undefined,
    drawer: {
      kind: "confirm",
      eyebrow: "Draconic Sorcery",
      description: dragonWingsDescription,
      helperText:
        usesRemaining > 0
          ? `Manifest your wings for ${dragonWingsDurationHours} hour and gain a Fly Speed of ${dragonWingsFlySpeed} feet.`
          : fallbackAvailable
            ? `Your normal use is depleted, so activating this feature will spend ${dragonWingsFallbackSorceryPointCost} Sorcery Points.`
            : `You need ${dragonWingsFallbackSorceryPointCost} Sorcery Points to activate ${dragonWingsName} again.`
    },
    execute: {
      kind: "activate"
    },
    isActive,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getSorcererDragonWingsSpeedBonuses(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureSpeedBonus[] {
  return hasActiveSorcererDragonWings(character)
    ? [
        {
          label: dragonWingsName,
          value: 0,
          movementType: "fly",
          setTotal: dragonWingsFlySpeed
        }
      ]
    : [];
}

export function activateSorcererDragonWings(character: Character): Character {
  if (!hasSorcererDragonWingsFeature(character) || hasActiveSorcererDragonWings(character)) {
    return character;
  }

  const usesRemaining = getSorcererDraconicDragonWingsUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const sorcererState = character.classFeatureState?.sorcerer ?? {};

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        sorcerer: {
          ...sorcererState,
          dragonWingsUsesExpended: Math.max(
            0,
            Math.min(dragonWingsUsesTotal, (sorcererState.dragonWingsUsesExpended ?? 0) + 1)
          )
        }
      }
    };
  } else {
    nextCharacter = spendSorcererDraconicSorceryPoints(
      character,
      dragonWingsFallbackSorceryPointCost
    );

    if (nextCharacter === character) {
      return character;
    }
  }

  return {
    ...nextCharacter,
    statusEntries: [
      ...clearSorcererDragonWingsStatuses(nextCharacter.statusEntries),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: dragonWingsName,
        source: dragonWingsName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.HOURS,
          amount: dragonWingsDurationHours
        },
        sourceId: sorcererDragonWingsStatusSourceId
      })
    ]
  };
}

export function restoreSorcererDragonWingsOnLongRest(character: Character): Character {
  if (!hasSorcererDragonWingsFeature(character)) {
    return character;
  }

  const sorcererState = character.classFeatureState?.sorcerer ?? {};

  if ((sorcererState.dragonWingsUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        dragonWingsUsesExpended: 0
      }
    }
  };
}

export function normalizeSorcererDraconicElementalAffinityDamageType(
  value: unknown
): DAMAGE_TYPE | undefined {
  return sorcererDraconicElementalAffinityDamageTypeOptions.some((damageType) => damageType === value)
    ? (value as DAMAGE_TYPE)
    : undefined;
}

export function getSorcererDraconicElementalAffinityDamageTypeSelection(
  character: DraconicSorceryCharacter
): DAMAGE_TYPE | null {
  if (!hasSorcererDraconicElementalAffinityFeature(character)) {
    return null;
  }

  return (
    normalizeSorcererDraconicElementalAffinityDamageType(
      character.classFeatureState?.sorcerer?.draconicElementalAffinityDamageType
    ) ?? null
  );
}

export function setSorcererDraconicElementalAffinityDamageTypeSelection(
  character: Character,
  damageType: DAMAGE_TYPE
): Character {
  if (!hasSorcererDraconicElementalAffinityFeature(character)) {
    return character;
  }

  const nextDamageType = normalizeSorcererDraconicElementalAffinityDamageType(damageType);

  if (!nextDamageType) {
    return character;
  }

  const sorcererState = character.classFeatureState?.sorcerer ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        draconicElementalAffinityDamageType: nextDamageType
      }
    }
  };
}

export function getSorcererDraconicResilienceArmorClassModes(
  character: DraconicSorceryCharacter,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  if (!hasSorcererDraconicResilienceFeature(character)) {
    return [];
  }

  return [
    {
      key: "sorcerer-draconic-resilience",
      label: "Draconic Resilience",
      unlockedAtLevel: 3,
      baseValue: 10,
      abilityModifiers: ["DEX", "CHA"],
      shieldAllowed: true,
      isApplicable: !context.hasWornBodyArmor,
      unavailableReason: context.hasWornBodyArmor
        ? "Requires you to wear no body armor."
        : undefined,
      detail: "Draconic Sorcery feature"
    }
  ];
}

function getSorcererDraconicElementalAffinityDerivedStatusEntries(
  character: DraconicSorceryCharacter
): DerivedFeatureStatusEntry[] {
  const damageType = getSorcererDraconicElementalAffinityDamageTypeSelection(character);

  if (!damageType) {
    return [];
  }

  return [
    {
      id: `${sorcererDraconicElementalAffinitySourceId}-resistance-${damageType.toLowerCase()}`,
      sourceId: sorcererDraconicElementalAffinitySourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: damageType,
      source: elementalAffinityName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function createSorcererDraconicLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource(input)
  };
}

function createSorcererDraconicResilienceContribution(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "sorcerer-draconic-sorcery-draconic-resilience",
      label: "Draconic Resilience",
      entryId: CLASS_FEATURE.DRACONIC_RESILIENCE
    }),
    hitPointMaximumBonus: getSorcererDraconicResilienceHitPointMaximumBonus(character),
    armorClassModes: [
      {
        id: "sorcerer-draconic-sorcery-draconic-resilience-ac-mode",
        getModes: (context) => getSorcererDraconicResilienceArmorClassModes(character, context)
      }
    ]
  };
}

function createSorcererDraconicSpellsContribution(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "sorcerer-draconic-sorcery-draconic-spells",
      label: "Draconic Spells",
      entryId: CLASS_FEATURE.DRACONIC_SPELLS
    }),
    alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
      character.level ?? 0,
      draconicSorcerySpellIdsByLevel
    )
  };
}

function createSorcererDraconicElementalAffinityContribution(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "sorcerer-draconic-sorcery-elemental-affinity",
      label: elementalAffinityName,
      entryId: CLASS_FEATURE.ELEMENTAL_AFFINITY
    }),
    statuses: getSorcererDraconicElementalAffinityDerivedStatusEntries(character)
  };
}

function createSorcererDraconicDragonWingsContribution(
  character: Parameters<SubclassRuntimeResolver>[0],
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "sorcerer-draconic-sorcery-dragon-wings",
      label: dragonWingsName,
      entryId: CLASS_FEATURE.DRAGON_WINGS
    }),
    actions: getFeatureActionByKey(featureActions, sorcererDragonWingsActionKey),
    speedBonuses: getSorcererDragonWingsSpeedBonuses(character)
  };
}

function collectSorcererDraconicSorceryContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (!hasSorcererDraconicResilienceFeature(character)) {
    return [];
  }

  const featureActions = [getSorcererDragonWingsAction(character)].filter(
    (action): action is FeatureActionCard => action !== null
  );
  const contributions: FeatureContributionSpec[] = [
    createSorcererDraconicResilienceContribution(character),
    createSorcererDraconicSpellsContribution(character)
  ];

  if (hasSorcererDraconicElementalAffinityFeature(character)) {
    contributions.push(createSorcererDraconicElementalAffinityContribution(character));
  }

  if (hasSorcererDragonWingsFeature(character)) {
    contributions.push(createSorcererDraconicDragonWingsContribution(character, featureActions));
  }

  if ((character.level ?? 0) >= 18) {
    contributions.push(
      createSorcererDraconicLocalHookContribution({
        id: "sorcerer-draconic-sorcery-dragon-companion",
        label: "Dragon Companion",
        entryId: CLASS_FEATURE.DRAGON_COMPANION
      })
    );
  }

  return contributions;
}

export const getSorcererDraconicSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectSorcererDraconicSorceryContributions(character)),
    {
      character: character as Character
    }
  );
