import { DAMAGE_TYPE } from "../../../../codex/entries";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type AbilityKey,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import type { FeatureArmorClassBonus, FeatureSpeedBonus } from "../../classFeatures/types";
import { getSpellcastingAbilityForCharacterSpell } from "../../shared/spellcastingAbility";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import type {
  SpellImplementationCastOption,
  SpellImplementationStatusOptionsContext
} from "./types";

export const tashasOtherworldlyGuiseSpellId = "spell-tashas-otherworldly-guise";
export const tashasOtherworldlyGuiseStatusValue = "Tasha's Otherworldly Guise";
export const tashasOtherworldlyGuisePlaneOptionId = "tashasOtherworldlyGuisePlane";
export const tashasOtherworldlyGuiseUpperPlanesStatusSourceId =
  "spell-tashas-otherworldly-guise-upper-planes";
export const tashasOtherworldlyGuiseLowerPlanesStatusSourceId =
  "spell-tashas-otherworldly-guise-lower-planes";
export const tashasOtherworldlyGuiseArmorClassBonus = 2;
export const tashasOtherworldlyGuiseFlySpeed = 40;

type TashasOtherworldlyGuisePlane = "upper-planes" | "lower-planes";

const tashasOtherworldlyGuiseUpperPlanesLabel = "Upper Planes";
const tashasOtherworldlyGuiseLowerPlanesLabel = "Lower Planes";
const tashasOtherworldlyGuisePlaneChoices = [
  { value: "upper-planes", label: tashasOtherworldlyGuiseUpperPlanesLabel },
  { value: "lower-planes", label: tashasOtherworldlyGuiseLowerPlanesLabel }
];

export function getTashasOtherworldlyGuiseCastOptions(): SpellImplementationCastOption[] {
  return [
    {
      id: tashasOtherworldlyGuisePlaneOptionId,
      label: "Plane",
      defaultValue: "upper-planes",
      choices: tashasOtherworldlyGuisePlaneChoices
    }
  ];
}

function getTashasOtherworldlyGuisePlaneFromOptions(
  context: Pick<SpellImplementationStatusOptionsContext, "options">
): TashasOtherworldlyGuisePlane {
  return context.options[tashasOtherworldlyGuisePlaneOptionId] === "lower-planes"
    ? "lower-planes"
    : "upper-planes";
}

function getTashasOtherworldlyGuiseStatusSourceId(
  plane: TashasOtherworldlyGuisePlane
): string {
  return plane === "lower-planes"
    ? tashasOtherworldlyGuiseLowerPlanesStatusSourceId
    : tashasOtherworldlyGuiseUpperPlanesStatusSourceId;
}

function getTashasOtherworldlyGuisePlaneFromSourceId(
  sourceId: string | null | undefined
): TashasOtherworldlyGuisePlane | null {
  switch (sourceId) {
    case tashasOtherworldlyGuiseUpperPlanesStatusSourceId:
      return "upper-planes";
    case tashasOtherworldlyGuiseLowerPlanesStatusSourceId:
      return "lower-planes";
    default:
      return null;
  }
}

function getTashasOtherworldlyGuisePlaneLabel(
  plane: TashasOtherworldlyGuisePlane
): string {
  return plane === "lower-planes"
    ? tashasOtherworldlyGuiseLowerPlanesLabel
    : tashasOtherworldlyGuiseUpperPlanesLabel;
}

export function getTashasOtherworldlyGuiseStatusOptionLabel(
  entry: Pick<CharacterStatusEntry, "sourceId" | "sourceSpellId"> | null | undefined
): string | null {
  if (!entry || entry.sourceSpellId !== tashasOtherworldlyGuiseSpellId) {
    return null;
  }

  const plane = getTashasOtherworldlyGuisePlaneFromSourceId(entry.sourceId);
  return plane ? getTashasOtherworldlyGuisePlaneLabel(plane) : null;
}

export function isActiveTashasOtherworldlyGuiseStatusEntry(
  entry: CharacterStatusEntry | null | undefined
): entry is CharacterStatusEntry {
  if (!entry) {
    return false;
  }

  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === tashasOtherworldlyGuiseSpellId &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    getTashasOtherworldlyGuisePlaneFromSourceId(entry.sourceId) !== null &&
    entry.disabled !== true
  );
}

export function getActiveTashasOtherworldlyGuisePlaneForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): TashasOtherworldlyGuisePlane | null {
  const activeEntry = normalizeCharacterStatusEntries(character.statusEntries).find(
    isActiveTashasOtherworldlyGuiseStatusEntry
  );

  return getTashasOtherworldlyGuisePlaneFromSourceId(activeEntry?.sourceId);
}

export function hasActiveTashasOtherworldlyGuiseStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return getActiveTashasOtherworldlyGuisePlaneForCharacter(character) !== null;
}

function createLinkedTashasOtherworldlyGuiseStatusEntry(
  id: string,
  group: STATUS_ENTRY_GROUP,
  value: CharacterStatusEntry["value"],
  description: string
): CharacterStatusEntry {
  return {
    id,
    group,
    value,
    source: tashasOtherworldlyGuiseStatusValue,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
    duration: {
      kind: STATUS_DURATION_KIND.LINKED,
      linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
      linkedValue: EFFECT_NAME.CONCENTRATION
    },
    sourceId: id,
    description
  };
}

function getTashasOtherworldlyGuiseImmunityValues(
  plane: TashasOtherworldlyGuisePlane
): Array<{
  value: CharacterStatusEntry["value"];
  description: string;
}> {
  return plane === "lower-planes"
    ? [
        {
          value: DAMAGE_TYPE.FIRE,
          description: "While Lower Planes is active, you are immune to Fire damage."
        },
        {
          value: DAMAGE_TYPE.POISON,
          description: "While Lower Planes is active, you are immune to Poison damage."
        },
        {
          value: CONDITION_NAME.POISONED,
          description: "While Lower Planes is active, you are immune to the Poisoned condition."
        }
      ]
    : [
        {
          value: DAMAGE_TYPE.RADIANT,
          description: "While Upper Planes is active, you are immune to Radiant damage."
        },
        {
          value: DAMAGE_TYPE.NECROTIC,
          description: "While Upper Planes is active, you are immune to Necrotic damage."
        },
        {
          value: CONDITION_NAME.CHARMED,
          description: "While Upper Planes is active, you are immune to the Charmed condition."
        }
      ];
}

export function getTashasOtherworldlyGuiseSpellDerivedStatusEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): CharacterStatusEntry[] {
  const activePlane = getActiveTashasOtherworldlyGuisePlaneForCharacter(character);

  if (!activePlane) {
    return [];
  }

  return getTashasOtherworldlyGuiseImmunityValues(activePlane).map((entry) =>
    createLinkedTashasOtherworldlyGuiseStatusEntry(
      `${getTashasOtherworldlyGuiseStatusSourceId(activePlane)}-${String(entry.value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-immunity`,
      STATUS_ENTRY_GROUP.IMMUNITIES,
      entry.value,
      entry.description
    )
  );
}

export function getTashasOtherworldlyGuiseArmorClassBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureArmorClassBonus[] {
  if (!hasActiveTashasOtherworldlyGuiseStatus(character)) {
    return [];
  }

  return [
    {
      label: tashasOtherworldlyGuiseStatusValue,
      value: tashasOtherworldlyGuiseArmorClassBonus
    }
  ];
}

export function getTashasOtherworldlyGuiseSpeedBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureSpeedBonus[] {
  if (!hasActiveTashasOtherworldlyGuiseStatus(character)) {
    return [];
  }

  return [
    {
      label: tashasOtherworldlyGuiseStatusValue,
      value: 0,
      movementType: "fly",
      setTotal: tashasOtherworldlyGuiseFlySpeed
    }
  ];
}

export function getTashasOtherworldlyGuiseSpellcastingAbilityForWeapon(
  character: Character,
  context: {
    attackKind: "weapon" | "unarmed";
  }
): AbilityKey | null {
  if (!hasActiveTashasOtherworldlyGuiseStatus(character) || context.attackKind !== "weapon") {
    return null;
  }

  return getSpellcastingAbilityForCharacterSpell(character, tashasOtherworldlyGuiseSpellId);
}

function getTashasOtherworldlyGuiseStatusOptions(
  context: SpellImplementationStatusOptionsContext
) {
  return {
    sourceId: getTashasOtherworldlyGuiseStatusSourceId(
      getTashasOtherworldlyGuisePlaneFromOptions(context)
    )
  };
}

export const tashasOtherworldlyGuiseSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: tashasOtherworldlyGuiseSpellId,
    label: tashasOtherworldlyGuiseStatusValue
  },
  spellId: tashasOtherworldlyGuiseSpellId,
  getCastOptions: getTashasOtherworldlyGuiseCastOptions,
  getStatusOptions: getTashasOtherworldlyGuiseStatusOptions
};
