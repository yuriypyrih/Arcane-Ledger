import { DAMAGE_TYPE, TRACKER, type SpellDescriptionEntry } from "../../../../../codex/entries";
import {
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type BarbarianWildHeartAspect,
  type Character,
  type CharacterRageFeatureState,
  type CharacterStatusEntry
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionDrawerConfig,
  FeatureActionExecuteConfig,
  FeatureActionOptionCard,
  FeatureActionResource,
  FeatureSpeedBonus,
  SpeedFeatureContext
} from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const pathOfTheWildHeartSubclassId = "barbarian-path-of-the-wild-heart";

const wildHeartAnimalSpeakerSpellIds = ["spell-beast-sense", "spell-speak-with-animals"] as const;
const wildHeartNatureSpeakerSpellId = "spell-commune-with-nature";
const rageOfTheWildsBearStatusSourceId = "feature-barbarian-rage-of-the-wilds-bear";
const rageOfTheWildsEffectSourceId = "feature-barbarian-rage-of-the-wilds-effect";
const powerOfTheWildsEffectSourceId = "feature-barbarian-power-of-the-wilds-effect";
const aspectOfTheWildsStatusSourcePrefix = "feature-barbarian-aspect-of-the-wilds-";

export type WildHeartRageOption = "bear" | "eagle" | "wolf";
export type WildHeartPowerOption = "falcon" | "lion" | "ram";
export type WildHeartAspect = BarbarianWildHeartAspect;

type BarbarianSubclassCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

const wildHeartRageOptionDefinitions = [
  {
    key: "bear",
    name: "Bear",
    summary: "Tracked",
    trackingState: TRACKER.TRACKED,
    description:
      "While your Rage is active, you have Resistance to every damage type except Force, Necrotic, Psychic, and Radiant."
  },
  {
    key: "eagle",
    name: "Eagle",
    summary: "Not Tracked",
    trackingState: TRACKER.NOT_TRACKED,
    description:
      "When you activate your Rage, you can take the Disengage and Dash actions as part of that Bonus Action. While your Rage is active, you can take a Bonus Action to take both of those actions."
  },
  {
    key: "wolf",
    name: "Wolf",
    summary: "Not Tracked",
    trackingState: TRACKER.NOT_TRACKED,
    description:
      "While your Rage is active, your allies have Advantage on attack rolls against any enemy of yours within 5 feet of you."
  }
] as const satisfies ReadonlyArray<{
  key: WildHeartRageOption;
  name: string;
  summary: string;
  trackingState: TRACKER.TRACKED | TRACKER.NOT_TRACKED;
  description: string;
}>;

const wildHeartPowerOptionDefinitions = [
  {
    key: "falcon",
    name: "Falcon",
    summary: "Tracked",
    trackingState: TRACKER.TRACKED,
    description:
      "While your Rage is active, you have a Fly Speed equal to your Speed if you aren't wearing any armor."
  },
  {
    key: "lion",
    name: "Lion",
    summary: "Not Tracked",
    trackingState: TRACKER.NOT_TRACKED,
    description:
      "While your Rage is active, any of your enemies within 5 feet of you have Disadvantage on attack rolls against targets other than you or another Barbarian who has this option active."
  },
  {
    key: "ram",
    name: "Ram",
    summary: "Not Tracked",
    trackingState: TRACKER.NOT_TRACKED,
    description:
      "While your Rage is active, you can cause a Large or smaller creature to have the Prone condition when you hit it with a melee attack."
  }
] as const satisfies ReadonlyArray<{
  key: WildHeartPowerOption;
  name: string;
  summary: string;
  trackingState: TRACKER.TRACKED | TRACKER.NOT_TRACKED;
  description: string;
}>;

const wildHeartAspectDefinitions = [
  {
    key: "owl",
    name: "Owl",
    description:
      "You have <link:Darkvision>Darkvision</link> with a range of 60 feet. If you already have Darkvision, its range increases by 60 feet."
  },
  {
    key: "panther",
    name: "Panther",
    description: "You have a Climb Speed equal to your Speed."
  },
  {
    key: "salmon",
    name: "Salmon",
    description: "You have a Swim Speed equal to your Speed."
  }
] as const satisfies ReadonlyArray<{
  key: WildHeartAspect;
  name: string;
  description: string;
}>;

export function isBarbarianPathOfTheWildHeart(character: BarbarianSubclassCharacter): boolean {
  return (
    character.className === "Barbarian" &&
    character.subclassId === pathOfTheWildHeartSubclassId &&
    character.level >= 3
  );
}

export function hasBarbarianPathOfTheWildHeartRageOfTheWilds(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheWildHeart(character);
}

export function hasBarbarianPathOfTheWildHeartAspectOfTheWilds(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheWildHeart(character) && character.level >= 6;
}

export function hasBarbarianPathOfTheWildHeartPowerOfTheWilds(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheWildHeart(character) && character.level >= 14;
}

export function normalizeBarbarianPathOfTheWildHeartRageOption(
  value: unknown
): WildHeartRageOption | undefined {
  return value === "bear" || value === "eagle" || value === "wolf" ? value : undefined;
}

export function normalizeBarbarianPathOfTheWildHeartAspect(
  value: unknown
): WildHeartAspect | undefined {
  return value === "owl" || value === "panther" || value === "salmon" ? value : undefined;
}

export function normalizeBarbarianPathOfTheWildHeartPowerOption(
  value: unknown
): WildHeartPowerOption | undefined {
  return value === "falcon" || value === "lion" || value === "ram" ? value : undefined;
}

export function normalizeBarbarianPathOfTheWildHeartRageState(
  value: Partial<CharacterRageFeatureState>,
  character: BarbarianSubclassCharacter
): Pick<CharacterRageFeatureState, "wildHeartRageOption" | "wildHeartPowerOption" | "wildHeartAspect"> {
  return {
    wildHeartRageOption: hasBarbarianPathOfTheWildHeartRageOfTheWilds(character)
      ? normalizeBarbarianPathOfTheWildHeartRageOption(value.wildHeartRageOption)
      : undefined,
    wildHeartPowerOption: hasBarbarianPathOfTheWildHeartPowerOfTheWilds(character)
      ? normalizeBarbarianPathOfTheWildHeartPowerOption(value.wildHeartPowerOption)
      : undefined,
    wildHeartAspect: hasBarbarianPathOfTheWildHeartAspectOfTheWilds(character)
      ? normalizeBarbarianPathOfTheWildHeartAspect(value.wildHeartAspect)
      : undefined
  };
}

export function getBarbarianPathOfTheWildHeartRageOptions(
  character: BarbarianSubclassCharacter
): FeatureActionOptionCard[] {
  if (!hasBarbarianPathOfTheWildHeartRageOfTheWilds(character)) {
    return [];
  }

  return wildHeartRageOptionDefinitions.map((definition) => ({
    key: definition.key,
    name: definition.name,
    summary: definition.summary,
    detail: definition.description,
    breakdown: definition.description,
    trackingState: definition.trackingState,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE
  }));
}

export function getBarbarianPathOfTheWildHeartPowerOptions(
  character: BarbarianSubclassCharacter
): FeatureActionOptionCard[] {
  if (!hasBarbarianPathOfTheWildHeartPowerOfTheWilds(character)) {
    return [];
  }

  return wildHeartPowerOptionDefinitions.map((definition) => ({
    key: definition.key,
    name: definition.name,
    summary: definition.summary,
    detail: definition.description,
    breakdown: definition.description,
    trackingState: definition.trackingState,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE
  }));
}

export function getBarbarianPathOfTheWildHeartAspectChoice(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): WildHeartAspect | null {
  if (!hasBarbarianPathOfTheWildHeartAspectOfTheWilds(character)) {
    return null;
  }

  return rageState.wildHeartAspect ?? null;
}

export function getBarbarianPathOfTheWildHeartPowerOptionChoice(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): WildHeartPowerOption | null {
  if (!hasBarbarianPathOfTheWildHeartPowerOfTheWilds(character)) {
    return null;
  }

  return rageState.wildHeartPowerOption ?? null;
}

export function setBarbarianPathOfTheWildHeartAspectChoice(
  character: Character,
  rageState: CharacterRageFeatureState,
  selection: WildHeartAspect
): Character {
  if (!hasBarbarianPathOfTheWildHeartAspectOfTheWilds(character)) {
    return character;
  }

  const normalizedSelection =
    wildHeartAspectDefinitions.find((option) => option.key === selection)?.key ?? undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        wildHeartAspect: normalizedSelection
      }
    }
  };
}

export function getBarbarianPathOfTheWildHeartRageActionOverride(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState,
  resources: FeatureActionResource[]
): Pick<FeatureActionCard, "drawer" | "execute"> {
  if (rageState.active || !hasBarbarianPathOfTheWildHeartRageOfTheWilds(character)) {
    return {
      drawer: {
        kind: "confirm",
        eyebrow: "Barbarian",
        resources
      },
      execute: {
        kind: "activate"
      }
    };
  }

  return {
    drawer: {
      kind: "custom-form",
      eyebrow: "Barbarian",
      formKind: "wild-heart-rage",
      resources
    } satisfies FeatureActionDrawerConfig,
    execute: {
      kind: "custom-form",
      formKind: "wild-heart-rage"
    } satisfies FeatureActionExecuteConfig
  };
}

export function getBarbarianPathOfTheWildHeartSpeedBonuses(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState,
  context: SpeedFeatureContext,
  isRaging: boolean
): FeatureSpeedBonus[] {
  const speedBonuses: FeatureSpeedBonus[] = [];
  const wildHeartAspect = getBarbarianPathOfTheWildHeartAspectChoice(character, rageState);

  if (wildHeartAspect === "panther") {
    speedBonuses.push({
      label: "Panther",
      movementType: "climb",
      value: 0,
      setBaseFromWalkMultiplier: 1
    });
  }

  if (wildHeartAspect === "salmon") {
    speedBonuses.push({
      label: "Salmon",
      movementType: "swim",
      value: 0,
      setBaseFromWalkMultiplier: 1
    });
  }

  if (
    isRaging &&
    getBarbarianPathOfTheWildHeartPowerOptionChoice(character, rageState) === "falcon" &&
    context.wornBodyArmorType === null
  ) {
    speedBonuses.push({
      label: "Falcon",
      movementType: "fly",
      value: 0,
      setBaseFromWalkMultiplier: 1,
      hover: true
    });
  }

  return speedBonuses;
}

export function getBarbarianPathOfTheWildHeartDerivedConditions(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState,
  isRaging: boolean
): DerivedFeatureStatusEntry[] {
  const derivedEntries: DerivedFeatureStatusEntry[] = [];
  const wildHeartAspect = getBarbarianPathOfTheWildHeartAspectChoice(character, rageState);

  if (wildHeartAspect === "owl") {
    derivedEntries.push({
      id: "feature-barbarian-aspect-of-the-wilds-owl",
      sourceId: "feature-barbarian-aspect-of-the-wilds-owl",
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      source: "Aspect of the Wilds",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: 60
    });
  }

  if (!isRaging) {
    return derivedEntries;
  }

  const selectedRageOption = wildHeartRageOptionDefinitions.find(
    (definition) => definition.key === rageState.wildHeartRageOption
  );

  if (selectedRageOption) {
    derivedEntries.push({
      id: `${rageOfTheWildsEffectSourceId}-${selectedRageOption.key}`,
      sourceId: `${rageOfTheWildsEffectSourceId}-${selectedRageOption.key}`,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: selectedRageOption.name,
      source: "Rage of the Wilds",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.RAGE
      }
    });
  }

  const selectedPowerOption = wildHeartPowerOptionDefinitions.find(
    (definition) => definition.key === rageState.wildHeartPowerOption
  );

  if (selectedPowerOption) {
    derivedEntries.push({
      id: `${powerOfTheWildsEffectSourceId}-${selectedPowerOption.key}`,
      sourceId: `${powerOfTheWildsEffectSourceId}-${selectedPowerOption.key}`,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: selectedPowerOption.name,
      source: "Power of the Wilds",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.RAGE
      }
    });
  }

  if (
    hasBarbarianPathOfTheWildHeartRageOfTheWilds(character) &&
    rageState.wildHeartRageOption === "bear"
  ) {
    derivedEntries.push(
      {
        id: "feature-rage-of-the-wilds-bear-acid",
        sourceId: rageOfTheWildsBearStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.ACID,
        source: "Rage of the Wilds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      },
      {
        id: "feature-rage-of-the-wilds-bear-cold",
        sourceId: rageOfTheWildsBearStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.COLD,
        source: "Rage of the Wilds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      },
      {
        id: "feature-rage-of-the-wilds-bear-fire",
        sourceId: rageOfTheWildsBearStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.FIRE,
        source: "Rage of the Wilds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      },
      {
        id: "feature-rage-of-the-wilds-bear-lightning",
        sourceId: rageOfTheWildsBearStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.LIGHTNING,
        source: "Rage of the Wilds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      },
      {
        id: "feature-rage-of-the-wilds-bear-poison",
        sourceId: rageOfTheWildsBearStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.POISON,
        source: "Rage of the Wilds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      },
      {
        id: "feature-rage-of-the-wilds-bear-thunder",
        sourceId: rageOfTheWildsBearStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.THUNDER,
        source: "Rage of the Wilds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      }
    );
  }

  return derivedEntries;
}

export function getBarbarianPathOfTheWildHeartActivationPatch(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): Pick<CharacterRageFeatureState, "wildHeartRageOption" | "wildHeartPowerOption"> {
  return {
    wildHeartRageOption: hasBarbarianPathOfTheWildHeartRageOfTheWilds(character)
      ? undefined
      : rageState.wildHeartRageOption,
    wildHeartPowerOption: hasBarbarianPathOfTheWildHeartPowerOfTheWilds(character)
      ? undefined
      : rageState.wildHeartPowerOption
  };
}

export function getBarbarianPathOfTheWildHeartActivationSelection(
  character: BarbarianSubclassCharacter,
  rageOptionKey: string,
  powerOptionKey?: string
):
  | {
      rageOption: WildHeartRageOption;
      powerOption?: WildHeartPowerOption;
    }
  | null {
  if (!hasBarbarianPathOfTheWildHeartRageOfTheWilds(character)) {
    return null;
  }

  const rageOption = normalizeBarbarianPathOfTheWildHeartRageOption(rageOptionKey);
  const powerOption = hasBarbarianPathOfTheWildHeartPowerOfTheWilds(character)
    ? normalizeBarbarianPathOfTheWildHeartPowerOption(powerOptionKey)
    : undefined;

  if (!rageOption || (hasBarbarianPathOfTheWildHeartPowerOfTheWilds(character) && !powerOption)) {
    return null;
  }

  return { rageOption, powerOption };
}

function getWildHeartRageOptionDescriptionEntries(
  sourceId: string | undefined
): SpellDescriptionEntry[] | null {
  if (!sourceId) {
    return null;
  }

  const definition =
    sourceId === rageOfTheWildsBearStatusSourceId
      ? wildHeartRageOptionDefinitions.find((option) => option.key === "bear") ?? null
      : sourceId.startsWith(`${rageOfTheWildsEffectSourceId}-`)
        ? (wildHeartRageOptionDefinitions.find(
            (option) => option.key === sourceId.slice(`${rageOfTheWildsEffectSourceId}-`.length)
          ) ?? null)
        : null;

  return definition ? [definition.description] : null;
}

function getWildHeartPowerOptionDescriptionEntries(
  sourceId: string | undefined
): SpellDescriptionEntry[] | null {
  if (!sourceId) {
    return null;
  }

  const definition = sourceId.startsWith(`${powerOfTheWildsEffectSourceId}-`)
    ? (wildHeartPowerOptionDefinitions.find(
        (option) => option.key === sourceId.slice(`${powerOfTheWildsEffectSourceId}-`.length)
      ) ?? null)
    : null;

  return definition ? [definition.description] : null;
}

function getWildHeartAspectDescriptionEntries(
  sourceId: string | undefined
): SpellDescriptionEntry[] | null {
  if (!sourceId) {
    return null;
  }

  const definition = sourceId.startsWith(aspectOfTheWildsStatusSourcePrefix)
    ? (wildHeartAspectDefinitions.find(
        (option) => option.key === sourceId.slice(aspectOfTheWildsStatusSourcePrefix.length)
      ) ?? null)
    : null;

  return definition ? [definition.description] : null;
}

export function getBarbarianPathOfTheWildHeartStatusDescriptionEntries(
  entry: Pick<CharacterStatusEntry, "sourceId">
): SpellDescriptionEntry[] | null {
  return (
    getWildHeartRageOptionDescriptionEntries(entry.sourceId) ??
    getWildHeartPowerOptionDescriptionEntries(entry.sourceId) ??
    getWildHeartAspectDescriptionEntries(entry.sourceId)
  );
}

function getBarbarianPathOfTheWildHeartSpeakerSpellIds(
  character: Partial<Pick<Character, "level">>
): string[] {
  return [
    ...wildHeartAnimalSpeakerSpellIds,
    ...((character.level ?? 0) >= 10 ? [wildHeartNatureSpeakerSpellId] : [])
  ];
}

export const getBarbarianPathOfTheWildHeartDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  if (
    character.className !== "Barbarian" ||
    character.subclassId !== pathOfTheWildHeartSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return {};
  }

  return {
    alwaysPreparedSpellIds: getBarbarianPathOfTheWildHeartSpeakerSpellIds(character),
    ritualOnlySpellIds: getBarbarianPathOfTheWildHeartSpeakerSpellIds(character)
  };
};
