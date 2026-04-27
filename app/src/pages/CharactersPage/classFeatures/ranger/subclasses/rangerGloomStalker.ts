import { CLASS_FEATURE, REACTION, type ReactionEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  type SavingThrowProficiencyEntry,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import {
  appendDescriptionAddition,
  appendFeatureSourcedDescriptionAddition,
  descriptionValueSomeText
} from "../../../actionModalDescriptions";
import type { WeaponAction } from "../../../gameplay";
import { getSavingThrowLevelFromEntries } from "../../../proficiencyResolvers";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureDamageBonus,
  FeatureInitiativeBonus,
  FeatureSavingThrowProficiencyEntry
} from "../../types";
import { getRangerFeatAdjustedWisdomModifier } from "../abilityModifiers";

export const gloomStalkerSubclassId = "ranger-gloom-stalker";
export const rangerGloomStalkerUmbralSightSenseSourceId =
  "feature-ranger-gloom-stalker-umbral-sight-sense";
export const rangerGloomStalkerUmbralSightStatusSourceId =
  "feature-ranger-gloom-stalker-umbral-sight";

const gloomStalkerSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Disguise Self"]),
  5: resolveSpellIdsByName(["Rope Trick"]),
  9: resolveSpellIdsByName(["Fear"]),
  13: resolveSpellIdsByName(["Greater Invisibility"]),
  17: resolveSpellIdsByName(["Seeming"])
} as const;
const dreadfulStrikeLabel = "Dreadful Strike";
const stalkersFlurrySource = "Stalker's Flurry";
const umbralSightName = "Umbral Sight";
const ironMindSource = "Iron Mind";
const rangerIronMindSavingThrowOptions = [
  SAVING_THROW_PROFICIENCY.WIS,
  SAVING_THROW_PROFICIENCY.INT,
  SAVING_THROW_PROFICIENCY.CHA
] as const;
const gloomStalkerSubclassEntry = getSubclassEntryById(gloomStalkerSubclassId);

type RangerGloomStalkerCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "classFeatureState"
      | "feats"
      | "level"
      | "savingThrowProficiencies"
      | "subclassId"
    >
  >;

type DreadAmbusherAction = Pick<WeaponAction, "attackKind">;

export type RangerGloomStalkerDreadAmbusherOptionState = {
  damageBonus: FeatureDamageBonus;
  disabled: boolean;
  disabledReason?: string;
  usesRemaining: number;
  usesTotal: number;
};

function getRangerGloomStalkerFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = gloomStalkerSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

function extractFeatureDescriptionSection(
  description: readonly string[],
  heading: string
): string[] {
  const startIndex = description.findIndex((entry) => entry.includes(heading));

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && entry.startsWith("<strong>")) {
      break;
    }

    section.push(entry);
  }

  return section;
}

const dreadAmbusherDescription = getRangerGloomStalkerFeatureDescriptionEntries(
  CLASS_FEATURE.DREAD_AMBUSHER
);
const dreadfulStrikeDescription = extractFeatureDescriptionSection(
  dreadAmbusherDescription,
  "<strong>Dreadful Strike.</strong>"
);
const stalkersFlurryDescription = getRangerGloomStalkerFeatureDescriptionEntries(
  CLASS_FEATURE.STALKERS_FLURRY
);
const shadowyDodgeDescription = getRangerGloomStalkerFeatureDescriptionEntries(
  CLASS_FEATURE.SHADOWY_DODGE
);
const shadowyDodgeReactionEntry: ReactionEntry = {
  id: "reaction-ranger-shadowy-dodge",
  reaction: REACTION.SHADOWY_DODGE,
  name: "Shadowy Dodge",
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.SHADOWY_DODGE,
  sourceLabel: "Gloom Stalker",
  description: [...shadowyDodgeDescription]
};
const dreadAmbusherInitiativeBonus: FeatureInitiativeBonus = {
  label: "Dread Ambusher",
  abilityModifierSource: "WIS"
};

function isRangerGloomStalker(character: RangerGloomStalkerCharacter): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === gloomStalkerSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function getWisdomModifier(
  character: Partial<Pick<Character, "abilities" | "feats" | "level">>
): number {
  return getRangerFeatAdjustedWisdomModifier(character);
}

function getDreadfulStrikeFormula(character: RangerGloomStalkerCharacter): string {
  return hasRangerGloomStalkerStalkersFlurryFeature(character) ? "2d8" : "2d6";
}

function createDreadfulStrikeDamageBonus(
  character: RangerGloomStalkerCharacter
): FeatureDamageBonus {
  const dreadfulStrikeFormula = getDreadfulStrikeFormula(character);

  return {
    label: dreadfulStrikeLabel,
    formula: dreadfulStrikeFormula,
    displayLabel: `${dreadfulStrikeFormula} Psychic`
  };
}

function appendDreadAmbusherDescription(action: WeaponAction): WeaponAction {
  if (
    action.attackKind !== "weapon" ||
    dreadfulStrikeDescription.length <= 0 ||
    descriptionValueSomeText(action, (entry) => entry.includes("<strong>Dreadful Strike.</strong>"))
  ) {
    return action;
  }

  return appendDescriptionAddition(action, dreadfulStrikeDescription);
}

function appendStalkersFlurryDescription(
  character: RangerGloomStalkerCharacter,
  action: WeaponAction
): WeaponAction {
  if (
    action.attackKind !== "weapon" ||
    !hasRangerGloomStalkerStalkersFlurryFeature(character) ||
    stalkersFlurryDescription.length <= 0
  ) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(
    action,
    character,
    CLASS_FEATURE.STALKERS_FLURRY,
    stalkersFlurryDescription,
    stalkersFlurrySource
  );
}

function hasDreadAmbusherAction(action: DreadAmbusherAction | null): boolean {
  return action?.attackKind === "weapon";
}

export function hasRangerGloomStalkerDreadAmbusherFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isRangerGloomStalker(character);
}

function hasRangerGloomStalkerIronMindFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === gloomStalkerSubclassId &&
    (character.level ?? 0) >= 7
  );
}

function hasRangerGloomStalkerStalkersFlurryFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === gloomStalkerSubclassId &&
    (character.level ?? 0) >= 11
  );
}

function hasRangerGloomStalkerUmbralSightFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isRangerGloomStalker(character);
}

function hasRangerGloomStalkerShadowyDodgeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === gloomStalkerSubclassId &&
    (character.level ?? 0) >= 15
  );
}

export function normalizeRangerGloomStalkerIronMindSavingThrowSelection(
  value: unknown
): SAVING_THROW_PROFICIENCY | undefined {
  return rangerIronMindSavingThrowOptions.some((option) => option === value)
    ? (value as SAVING_THROW_PROFICIENCY)
    : undefined;
}

function getSavingThrowEntriesExcludingIronMind(
  character: Partial<Pick<Character, "savingThrowProficiencies">>
): SavingThrowProficiencyEntry[] {
  return (character.savingThrowProficiencies ?? []).filter(
    (entry) => entry.sourceStr !== ironMindSource
  );
}

function getIronMindAvailableSavingThrows(
  character: RangerGloomStalkerCharacter
): SAVING_THROW_PROFICIENCY[] {
  if (!hasRangerGloomStalkerIronMindFeature(character)) {
    return [];
  }

  const baseSavingThrowEntries = getSavingThrowEntriesExcludingIronMind(character);
  const hasExistingWisdomSavingThrow =
    getSavingThrowLevelFromEntries(baseSavingThrowEntries, SAVING_THROW_PROFICIENCY.WIS) !==
    PROF_LEVEL.NONE;

  if (!hasExistingWisdomSavingThrow) {
    return [SAVING_THROW_PROFICIENCY.WIS];
  }

  return [SAVING_THROW_PROFICIENCY.INT, SAVING_THROW_PROFICIENCY.CHA].filter(
    (proficiency) =>
      getSavingThrowLevelFromEntries(baseSavingThrowEntries, proficiency) === PROF_LEVEL.NONE
  );
}

export function isRangerGloomStalkerIronMindLockedToWis(
  character: RangerGloomStalkerCharacter
): boolean {
  return (
    hasRangerGloomStalkerIronMindFeature(character) &&
    getIronMindAvailableSavingThrows(character)[0] === SAVING_THROW_PROFICIENCY.WIS &&
    getIronMindAvailableSavingThrows(character).length === 1
  );
}

export function getRangerGloomStalkerIronMindSavingThrowSelection(
  character: RangerGloomStalkerCharacter
): SAVING_THROW_PROFICIENCY | null {
  if (!hasRangerGloomStalkerIronMindFeature(character)) {
    return null;
  }

  const availableSavingThrows = getIronMindAvailableSavingThrows(character);

  if (availableSavingThrows.length === 0) {
    return null;
  }

  if (isRangerGloomStalkerIronMindLockedToWis(character)) {
    return SAVING_THROW_PROFICIENCY.WIS;
  }

  const savedSelection = normalizeRangerGloomStalkerIronMindSavingThrowSelection(
    character.classFeatureState?.ranger?.ironMindSavingThrow
  );

  return savedSelection && availableSavingThrows.includes(savedSelection)
    ? savedSelection
    : availableSavingThrows[0];
}

export function getRangerGloomStalkerIronMindSavingThrowOptions(
  character: RangerGloomStalkerCharacter
): SAVING_THROW_PROFICIENCY[] {
  return getIronMindAvailableSavingThrows(character);
}

export function setRangerGloomStalkerIronMindSavingThrowSelection(
  character: Character,
  proficiency: SAVING_THROW_PROFICIENCY | null
): Character {
  if (!hasRangerGloomStalkerIronMindFeature(character)) {
    return character;
  }

  const availableSavingThrows = getIronMindAvailableSavingThrows(character);
  const nextSelection = isRangerGloomStalkerIronMindLockedToWis(character)
    ? undefined
    : proficiency && availableSavingThrows.includes(proficiency)
      ? proficiency
      : undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...character.classFeatureState?.ranger,
        ironMindSavingThrow: nextSelection
      }
    }
  };
}

function getRangerGloomStalkerIronMindSavingThrowProficiencyEntries(
  character: RangerGloomStalkerCharacter
): FeatureSavingThrowProficiencyEntry[] {
  const proficiency = getRangerGloomStalkerIronMindSavingThrowSelection(character);

  if (!proficiency) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: ironMindSource,
      proficiency,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies SavingThrowProficiencyEntry
  ];
}

export function getRangerGloomStalkerDreadAmbusherUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "feats" | "level" | "subclassId">>
): number {
  return hasRangerGloomStalkerDreadAmbusherFeature(character)
    ? Math.max(1, getWisdomModifier(character))
    : 0;
}

export function getRangerGloomStalkerDreadAmbusherUsesRemaining(
  character: RangerGloomStalkerCharacter
): number {
  const totalUses = getRangerGloomStalkerDreadAmbusherUsesTotal(character);
  const usesExpended = character.classFeatureState?.ranger?.dreadAmbusherUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getRangerGloomStalkerDreadAmbusherOptionState(
  character: RangerGloomStalkerCharacter,
  action: DreadAmbusherAction | null
): RangerGloomStalkerDreadAmbusherOptionState | null {
  if (!hasRangerGloomStalkerDreadAmbusherFeature(character) || !hasDreadAmbusherAction(action)) {
    return null;
  }

  const usesTotal = getRangerGloomStalkerDreadAmbusherUsesTotal(character);
  const usesRemaining = getRangerGloomStalkerDreadAmbusherUsesRemaining(character);
  const usedThisTurn = character.classFeatureState?.ranger?.dreadAmbusherUsedThisTurn === true;
  let disabledReason: string | undefined;

  if (usedThisTurn) {
    disabledReason = "Dreadful Strike was already used this turn.";
  } else if (usesRemaining <= 0) {
    disabledReason = "No Dread Ambusher uses remaining.";
  }

  return {
    damageBonus: createDreadfulStrikeDamageBonus(character),
    disabled: Boolean(disabledReason),
    disabledReason,
    usesRemaining,
    usesTotal
  };
}

export function consumeRangerGloomStalkerDreadAmbusherUse(character: Character): Character {
  if (!hasRangerGloomStalkerDreadAmbusherFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};
  const totalUses = getRangerGloomStalkerDreadAmbusherUsesTotal(character);
  const usesExpended = rangerState.dreadAmbusherUsesExpended ?? 0;

  if (rangerState.dreadAmbusherUsedThisTurn === true || usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        dreadAmbusherUsesExpended: usesExpended + 1,
        dreadAmbusherUsedThisTurn: true
      }
    }
  };
}

export function restoreRangerGloomStalkerDreadAmbusherOnLongRest(character: Character): Character {
  if (!hasRangerGloomStalkerDreadAmbusherFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};

  if (
    (rangerState.dreadAmbusherUsesExpended ?? 0) === 0 &&
    rangerState.dreadAmbusherUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        dreadAmbusherUsesExpended: 0,
        dreadAmbusherUsedThisTurn: false
      }
    }
  };
}

function getRangerGloomStalkerDerivedStatusEntries(
  character: RangerGloomStalkerCharacter
): DerivedFeatureStatusEntry[] {
  if (!hasRangerGloomStalkerUmbralSightFeature(character)) {
    return [];
  }

  return [
    {
      id: rangerGloomStalkerUmbralSightSenseSourceId,
      sourceId: rangerGloomStalkerUmbralSightSenseSourceId,
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      source: umbralSightName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: 60
    },
    {
      id: rangerGloomStalkerUmbralSightStatusSourceId,
      sourceId: rangerGloomStalkerUmbralSightStatusSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: umbralSightName,
      source: umbralSightName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

export const getRangerGloomStalkerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Ranger" && character.subclassId === gloomStalkerSubclassId
    ? {
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          gloomStalkerSpellIdsByLevel
        ),
        derivedStatusEntries: getRangerGloomStalkerDerivedStatusEntries(character),
        savingThrowProficiencyEntries:
          getRangerGloomStalkerIronMindSavingThrowProficiencyEntries(character),
        reactionEntries: hasRangerGloomStalkerShadowyDodgeFeature(character)
          ? [shadowyDodgeReactionEntry]
          : [],
        getInitiativeBonuses: hasRangerGloomStalkerDreadAmbusherFeature(character)
          ? () => [dreadAmbusherInitiativeBonus]
          : undefined,
        transformWeaponAction: hasRangerGloomStalkerDreadAmbusherFeature(character)
          ? (action) =>
              appendStalkersFlurryDescription(character, appendDreadAmbusherDescription(action))
          : undefined
      }
    : {};
