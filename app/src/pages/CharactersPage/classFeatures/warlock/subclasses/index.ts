import { hasCharacterClass, getClassSubclassId } from "../../../multiclassState";
import { restoreUnholyResuscitationOnRest } from "./warlockNecroticHusk";
import { normalizeWarlockVestigeFeatureState } from "./warlockVestigeSpells";
import {
  normalizeSemblanceOfLifeState,
  restoreSemblanceOfLifeOnLongRest
} from "./warlockSemblanceOfLife";
import {
  activateVestigeRecovery,
  normalizeVestigeRecoveryState,
  restoreVestigeRecoveryOnLongRest,
  vestigeRecoveryActionKey
} from "./warlockVestigeRecovery";
import {
  getWarlockVestigePatronDerivedFeatureState,
  vestigePatronSubclassId
} from "./warlockVestigePatron";
import {
  activateFormOfDread,
  formOfDreadActionKey,
  getWarlockUndeadPatronDerivedFeatureState,
  normalizeWarlockUndeadFeatureState,
  restoreFormOfDreadOnLongRest,
  undeadPatronSubclassId
} from "./warlockUndeadPatron";
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
  getWarlockCelestialPatronDerivedFeatureState,
  normalizeWarlockCelestialPatronFeatureState,
  restoreWarlockCelestialPatronFeaturesOnLongRest
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
  [vestigePatronSubclassId]: getWarlockVestigePatronDerivedFeatureState,
  [undeadPatronSubclassId]: getWarlockUndeadPatronDerivedFeatureState,
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
  [vestigePatronSubclassId]: (value, character) => ({
    ...normalizeWarlockVestigeFeatureState(value, character),
    ...normalizeVestigeRecoveryState(value, character),
    ...normalizeSemblanceOfLifeState(value, character)
  }),
  [undeadPatronSubclassId]: normalizeWarlockUndeadFeatureState,
  [archfeyPatronSubclassId]: normalizeWarlockArchfeyPatronFeatureState,
  [celestialPatronSubclassId]: normalizeWarlockCelestialPatronFeatureState,
  [fiendPatronSubclassId]: normalizeWarlockFiendPatronFeatureState,
  [greatOldOnePatronSubclassId]: normalizeWarlockGreatOldOnePatronFeatureState
};
const warlockShortRestRestorers: Record<string, (character: Character) => Character> = {
  [undeadPatronSubclassId]: restoreUnholyResuscitationOnRest,
  [greatOldOnePatronSubclassId]: restoreWarlockGreatOldOnePatronClairvoyantCombatantOnShortRest
};
const warlockLongRestRestorers: Record<string, (character: Character) => Character> = {
  [vestigePatronSubclassId]: (character) =>
    restoreSemblanceOfLifeOnLongRest(restoreVestigeRecoveryOnLongRest(character)),
  [undeadPatronSubclassId]: (character) =>
    restoreUnholyResuscitationOnRest(restoreFormOfDreadOnLongRest(character)),
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
  if (!hasCharacterClass(character, "Warlock") || !getClassSubclassId(character, "Warlock")) {
    return {};
  }

  return (
    warlockSubclassStateNormalizers[getClassSubclassId(character, "Warlock")]?.(value, character) ??
    {}
  );
}

export function getWarlockSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Warlock") || !getClassSubclassId(character, "Warlock")) {
    return {};
  }

  return (
    warlockSubclassRuntimeRegistry[getClassSubclassId(character, "Warlock")]?.(character) ?? {}
  );
}

export function activateWarlockSubclassFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (!hasCharacterClass(character, "Warlock") || !getClassSubclassId(character, "Warlock")) {
    return null;
  }

  if (
    getClassSubclassId(character, "Warlock") === vestigePatronSubclassId &&
    actionKey === vestigeRecoveryActionKey
  ) {
    return activateVestigeRecovery(character);
  }

  if (
    getClassSubclassId(character, "Warlock") === undeadPatronSubclassId &&
    actionKey === formOfDreadActionKey
  ) {
    return activateFormOfDread(character);
  }

  if (
    getClassSubclassId(character, "Warlock") === fiendPatronSubclassId &&
    actionKey === darkOnesBlessingActionKey
  ) {
    return applyWarlockFiendPatronDarkOnesBlessing(character);
  }

  if (
    getClassSubclassId(character, "Warlock") === fiendPatronSubclassId &&
    actionKey === darkOnesOwnLuckActionKey
  ) {
    return consumeWarlockFiendPatronDarkOnesOwnLuckUse(character);
  }

  if (
    getClassSubclassId(character, "Warlock") === fiendPatronSubclassId &&
    actionKey === hurlThroughHellActionKey
  ) {
    return consumeWarlockFiendPatronHurlThroughHellUse(character);
  }

  if (
    getClassSubclassId(character, "Warlock") === greatOldOnePatronSubclassId &&
    actionKey === awakenedMindActionKey
  ) {
    return activateWarlockGreatOldOnePatronAwakenedMind(character);
  }

  return null;
}

export function restoreWarlockSubclassFeaturesOnShortRest(character: Character): Character {
  if (!hasCharacterClass(character, "Warlock") || !getClassSubclassId(character, "Warlock")) {
    return character;
  }

  return (
    warlockShortRestRestorers[getClassSubclassId(character, "Warlock")]?.(character) ?? character
  );
}

export function restoreWarlockSubclassFeaturesOnLongRest(character: Character): Character {
  if (!hasCharacterClass(character, "Warlock") || !getClassSubclassId(character, "Warlock")) {
    return character;
  }

  return (
    warlockLongRestRestorers[getClassSubclassId(character, "Warlock")]?.(character) ?? character
  );
}
