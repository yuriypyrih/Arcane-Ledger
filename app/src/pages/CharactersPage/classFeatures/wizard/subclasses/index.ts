import type { Character } from "../../../../../types";
import type { SpellEntry } from "../../../../../codex/entries";
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  abjurerSubclassId,
  applyWizardAbjurerArcaneWardAfterSpellCast,
  getWizardAbjurerDerivedFeatureState,
  restoreWizardAbjurerArcaneWardOnLongRest
} from "./wizardAbjurer";
import {
  advanceWizardBladesingerFeaturesForNewRound,
  activateWizardBladesong,
  applyWizardBladesingerFeaturesAfterSpellCast,
  bladesingerSubclassId,
  getWizardBladesingerDerivedFeatureState,
  restoreWizardBladesongOnLongRest,
  restoreWizardBladesongUseOnArcaneRecovery,
  wizardBladesongActionKey
} from "./wizardBladesinger";
import { divinerSubclassId, getWizardDivinerDerivedFeatureState } from "./wizardDiviner";
import { restoreWizardDivinerPortentOnLongRest } from "./wizardDivinerPortent";
import {
  evokerSubclassId,
  getWizardEvokerDerivedFeatureState,
  getWizardEvokerSpellbookSpellEntry
} from "./wizardEvoker";
import {
  activateWizardIllusionistIllusoryReality,
  getWizardIllusionistDerivedFeatureState,
  illusionistSubclassId,
  restoreWizardIllusionistIllusorySelfOnLongRest,
  restoreWizardIllusionistIllusorySelfOnShortRest,
  restoreWizardIllusionistPhantasmalCreaturesOnLongRest,
  wizardIllusionistIllusoryRealityActionKey
} from "./wizardIllusionist";

const wizardSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [abjurerSubclassId]: getWizardAbjurerDerivedFeatureState,
  [bladesingerSubclassId]: getWizardBladesingerDerivedFeatureState,
  [divinerSubclassId]: getWizardDivinerDerivedFeatureState,
  [evokerSubclassId]: getWizardEvokerDerivedFeatureState,
  [illusionistSubclassId]: getWizardIllusionistDerivedFeatureState
};
const wizardLongRestRestorers: Record<string, (character: Character) => Character> = {
  [abjurerSubclassId]: restoreWizardAbjurerArcaneWardOnLongRest,
  [bladesingerSubclassId]: restoreWizardBladesongOnLongRest,
  [divinerSubclassId]: restoreWizardDivinerPortentOnLongRest,
  [illusionistSubclassId]: (character) =>
    restoreWizardIllusionistIllusorySelfOnLongRest(
      restoreWizardIllusionistPhantasmalCreaturesOnLongRest(character)
    )
};
const wizardShortRestRestorers: Record<string, (character: Character) => Character> = {
  [illusionistSubclassId]: restoreWizardIllusionistIllusorySelfOnShortRest
};

export function getWizardSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Wizard" || !character.subclassId) {
    return {};
  }

  return wizardSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}

export function applyWizardSubclassFeaturesAfterSpellCast(
  character: Character,
  spell: Pick<SpellEntry, "castingTime" | "magicSchool" | "spellLevel">,
  spellSlotLevel: number | null | undefined
): Character {
  if (character.className !== "Wizard" || !character.subclassId) {
    return character;
  }

  if (character.subclassId === bladesingerSubclassId) {
    return applyWizardBladesingerFeaturesAfterSpellCast(character, spell);
  }

  if (character.subclassId === abjurerSubclassId) {
    return applyWizardAbjurerArcaneWardAfterSpellCast(character, spell, spellSlotLevel);
  }

  return character;
}

export function activateWizardSubclassFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (character.className !== "Wizard" || !character.subclassId) {
    return null;
  }

  if (character.subclassId === bladesingerSubclassId && actionKey === wizardBladesongActionKey) {
    return activateWizardBladesong(character);
  }

  if (
    character.subclassId === illusionistSubclassId &&
    actionKey === wizardIllusionistIllusoryRealityActionKey
  ) {
    return activateWizardIllusionistIllusoryReality(character);
  }

  return null;
}

export function getWizardSubclassSpellbookSpellEntry(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (character.className !== "Wizard" || !character.subclassId) {
    return spell;
  }

  if (character.subclassId === evokerSubclassId) {
    return getWizardEvokerSpellbookSpellEntry(character, spell);
  }

  return spell;
}

export function restoreWizardSubclassFeaturesOnLongRest(character: Character): Character {
  if (character.className !== "Wizard" || !character.subclassId) {
    return character;
  }

  return wizardLongRestRestorers[character.subclassId]?.(character) ?? character;
}

export function restoreWizardSubclassFeaturesOnArcaneRecovery(character: Character): Character {
  if (character.className !== "Wizard" || !character.subclassId) {
    return character;
  }

  return character.subclassId === bladesingerSubclassId
    ? restoreWizardBladesongUseOnArcaneRecovery(character)
    : character;
}

export function restoreWizardSubclassFeaturesOnShortRest(character: Character): Character {
  if (character.className !== "Wizard" || !character.subclassId) {
    return character;
  }

  return wizardShortRestRestorers[character.subclassId]?.(character) ?? character;
}

export function advanceWizardSubclassFeaturesForNewRound(character: Character): Character {
  if (character.className !== "Wizard" || !character.subclassId) {
    return character;
  }

  return character.subclassId === bladesingerSubclassId
    ? advanceWizardBladesingerFeaturesForNewRound(character)
    : character;
}
