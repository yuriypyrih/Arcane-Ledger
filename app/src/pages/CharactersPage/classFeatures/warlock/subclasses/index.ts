import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  archfeyPatronSubclassId,
  getWarlockArchfeyPatronDerivedFeatureState,
  normalizeWarlockArchfeyPatronFeatureState,
  restoreWarlockArchfeyPatronFeaturesOnLongRest
} from "./warlockArchfeyPatron";
import {
  celestialPatronSubclassId,
  consumeWarlockCelestialPatronSearingVengeanceUse,
  getWarlockCelestialPatronDerivedFeatureState,
  normalizeWarlockCelestialPatronFeatureState,
  restoreWarlockCelestialPatronFeaturesOnLongRest,
  searingVengeanceActionKey
} from "./warlockCelestialPatron";
import {
  applyWarlockFiendPatronDarkOnesBlessing,
  consumeWarlockFiendPatronDarkOnesOwnLuckUse,
  consumeWarlockFiendPatronHurlThroughHellUse,
  darkOnesBlessingActionKey,
  darkOnesOwnLuckActionKey,
  fiendPatronSubclassId,
  getWarlockFiendPatronDerivedFeatureState,
  hurlThroughHellActionKey,
  normalizeWarlockFiendPatronFeatureState,
  restoreWarlockFiendPatronFeaturesOnLongRest
} from "./warlockFiendPatron";
import {
  activateWarlockGreatOldOnePatronAwakenedMind,
  awakenedMindActionKey,
  getWarlockGreatOldOnePatronDerivedFeatureState,
  greatOldOnePatronSubclassId,
  normalizeWarlockGreatOldOnePatronFeatureState,
  restoreWarlockGreatOldOnePatronClairvoyantCombatantOnLongRest,
  restoreWarlockGreatOldOnePatronClairvoyantCombatantOnShortRest
} from "./warlockGreatOldOnePatron";

const warlockSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [archfeyPatronSubclassId]: getWarlockArchfeyPatronDerivedFeatureState,
  [celestialPatronSubclassId]: getWarlockCelestialPatronDerivedFeatureState,
  [fiendPatronSubclassId]: getWarlockFiendPatronDerivedFeatureState,
  [greatOldOnePatronSubclassId]: getWarlockGreatOldOnePatronDerivedFeatureState
};
const warlockSubclassStateNormalizers: Record<
  string,
  (
    value: Partial<CharacterWarlockFeatureState>,
    character: Pick<Character, "className"> &
      Partial<Pick<Character, "abilities" | "level" | "subclassId">>
  ) => Partial<CharacterWarlockFeatureState>
> = {
  [archfeyPatronSubclassId]: normalizeWarlockArchfeyPatronFeatureState,
  [celestialPatronSubclassId]: normalizeWarlockCelestialPatronFeatureState,
  [fiendPatronSubclassId]: normalizeWarlockFiendPatronFeatureState,
  [greatOldOnePatronSubclassId]: normalizeWarlockGreatOldOnePatronFeatureState
};
const warlockShortRestRestorers: Record<string, (character: Character) => Character> = {
  [greatOldOnePatronSubclassId]: restoreWarlockGreatOldOnePatronClairvoyantCombatantOnShortRest
};
const warlockLongRestRestorers: Record<string, (character: Character) => Character> = {
  [archfeyPatronSubclassId]: restoreWarlockArchfeyPatronFeaturesOnLongRest,
  [celestialPatronSubclassId]: restoreWarlockCelestialPatronFeaturesOnLongRest,
  [fiendPatronSubclassId]: restoreWarlockFiendPatronFeaturesOnLongRest,
  [greatOldOnePatronSubclassId]: restoreWarlockGreatOldOnePatronClairvoyantCombatantOnLongRest
};

export function normalizeWarlockSubclassFeatureState(
  value: Partial<CharacterWarlockFeatureState>,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): Partial<CharacterWarlockFeatureState> {
  if (character.className !== "Warlock" || !character.subclassId) {
    return {};
  }

  return warlockSubclassStateNormalizers[character.subclassId]?.(value, character) ?? {};
}

export function getWarlockSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Warlock" || !character.subclassId) {
    return {};
  }

  return warlockSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}

export function activateWarlockSubclassFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (character.className !== "Warlock" || !character.subclassId) {
    return null;
  }

  if (character.subclassId === fiendPatronSubclassId && actionKey === darkOnesBlessingActionKey) {
    return applyWarlockFiendPatronDarkOnesBlessing(character);
  }

  if (character.subclassId === fiendPatronSubclassId && actionKey === darkOnesOwnLuckActionKey) {
    return consumeWarlockFiendPatronDarkOnesOwnLuckUse(character);
  }

  if (character.subclassId === fiendPatronSubclassId && actionKey === hurlThroughHellActionKey) {
    return consumeWarlockFiendPatronHurlThroughHellUse(character);
  }

  if (
    character.subclassId === celestialPatronSubclassId &&
    actionKey === searingVengeanceActionKey
  ) {
    return consumeWarlockCelestialPatronSearingVengeanceUse(character);
  }

  if (
    character.subclassId === greatOldOnePatronSubclassId &&
    actionKey === awakenedMindActionKey
  ) {
    return activateWarlockGreatOldOnePatronAwakenedMind(character);
  }

  return null;
}

export function restoreWarlockSubclassFeaturesOnShortRest(character: Character): Character {
  if (character.className !== "Warlock" || !character.subclassId) {
    return character;
  }

  return warlockShortRestRestorers[character.subclassId]?.(character) ?? character;
}

export function restoreWarlockSubclassFeaturesOnLongRest(character: Character): Character {
  if (character.className !== "Warlock" || !character.subclassId) {
    return character;
  }

  return warlockLongRestRestorers[character.subclassId]?.(character) ?? character;
}
