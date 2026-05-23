import {
  CLASS_FEATURE,
  ELDRITCH_INVOCATION,
  getEldritchInvocationEntryById,
  type SpellDescriptionEntry
} from "../../../codex/entries";
import type { Character } from "../../../types";
import {
  createFeatureSourcedDescriptionEntries,
  createSourcedDescriptionEntries
} from "../actionModalDescriptions";
import { normalizeDeathSaveTrack } from "../deathSaves";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../traits";
import {
  getSoulOfArtificeLifeAndDeathDescriptionAdditions,
  isArtificerSoulOfArtificeCheatDeathAvailable
} from "./artificer/soulOfArtifice";
import {
  activateBarbarianRelentlessRage,
  getBarbarianRageState,
  hasBarbarianRelentlessRageFeature
} from "./barbarian/barbarian";
import { getFeatureDescriptionForCharacter } from "./featureDescriptions";
import {
  activatePaladinOathOfTheAncientsUndyingSentinel,
  getPaladinOathOfTheAncientsUndyingSentinelUsesRemaining,
  getPaladinOathOfTheAncientsUndyingSentinelUsesTotal,
  hasPaladinOathOfTheAncientsUndyingSentinelFeature
} from "./paladin/subclasses/paladinOathOfTheAncients";
import {
  consumeWarlockGiftOfTheProtectorsUse,
  consumeWarlockSearingVengeanceUse,
  getWarlockGiftOfTheProtectorsUsesRemaining,
  getWarlockGiftOfTheProtectorsUsesTotal,
  getWarlockSearingVengeanceUsesRemaining,
  getWarlockSearingVengeanceUsesTotal
} from "./warlock/warlock";

export type LifeAndDeathLedgerHeaderItem =
  | {
      kind: "dots";
      key: string;
      label: string;
      current: number;
      total: number;
    }
  | {
      kind: "text";
      key: string;
      label: string;
    };

const relentlessRageBaseDc = 10;

function isLifeAndDeathUnconscious(character: Character): boolean {
  const deathSaves = normalizeDeathSaveTrack(character.deathSaves);

  return (
    character.currentHitPoints <= 0 &&
    deathSaves.resolution !== "instant-death" &&
    deathSaves.successes < 3 &&
    deathSaves.failures < 3
  );
}

export function getLifeAndDeathRelentlessRageDc(character: Character): number {
  const rageState = getBarbarianRageState(character);

  return relentlessRageBaseDc + (rageState.relentlessRageDcBonus ?? 0);
}

export function isLifeAndDeathRelentlessRageAvailable(character: Character): boolean {
  return (
    hasBarbarianRelentlessRageFeature(character) &&
    isLifeAndDeathUnconscious(character) &&
    getBarbarianRageState(character).active === true
  );
}

export function isLifeAndDeathUndyingSentinelAvailable(character: Character): boolean {
  return (
    hasPaladinOathOfTheAncientsUndyingSentinelFeature(character) &&
    isLifeAndDeathUnconscious(character) &&
    getPaladinOathOfTheAncientsUndyingSentinelUsesRemaining(character) > 0
  );
}

export function hasLifeAndDeathSearingVengeanceFeature(character: Character): boolean {
  return getWarlockSearingVengeanceUsesTotal(character) > 0;
}

export function isLifeAndDeathSearingVengeanceAvailable(character: Character): boolean {
  return (
    hasLifeAndDeathSearingVengeanceFeature(character) &&
    getWarlockSearingVengeanceUsesRemaining(character) > 0
  );
}

export function hasLifeAndDeathGiftOfTheProtectorsFeature(character: Character): boolean {
  return getWarlockGiftOfTheProtectorsUsesTotal(character) > 0;
}

export function isLifeAndDeathGiftOfTheProtectorsAvailable(character: Character): boolean {
  return (
    hasLifeAndDeathGiftOfTheProtectorsFeature(character) &&
    getWarlockGiftOfTheProtectorsUsesRemaining(character) > 0
  );
}

export function hasActiveLifeAndDeathLedgerFeature(character: Character): boolean {
  return (
    isArtificerSoulOfArtificeCheatDeathAvailable(character) ||
    isLifeAndDeathRelentlessRageAvailable(character) ||
    isLifeAndDeathUndyingSentinelAvailable(character) ||
    (isLifeAndDeathUnconscious(character) && isLifeAndDeathSearingVengeanceAvailable(character)) ||
    (isLifeAndDeathUnconscious(character) && isLifeAndDeathGiftOfTheProtectorsAvailable(character))
  );
}

export function getLifeAndDeathLedgerDescriptionAdditions(
  character: Character
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [
    ...getSoulOfArtificeLifeAndDeathDescriptionAdditions(character)
  ];

  if (hasBarbarianRelentlessRageFeature(character)) {
    const relentlessRageDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.RELENTLESS_RAGE
    );

    if (relentlessRageDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.RELENTLESS_RAGE,
          relentlessRageDescription
        )
      );
    }
  }

  if (hasPaladinOathOfTheAncientsUndyingSentinelFeature(character)) {
    const undyingSentinelDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.UNDYING_SENTINEL
    );

    if (undyingSentinelDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.UNDYING_SENTINEL,
          undyingSentinelDescription
        )
      );
    }
  }

  if (hasLifeAndDeathSearingVengeanceFeature(character)) {
    const searingVengeanceDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.SEARING_VENGEANCE
    );

    if (searingVengeanceDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.SEARING_VENGEANCE,
          searingVengeanceDescription
        )
      );
    }
  }

  if (hasLifeAndDeathGiftOfTheProtectorsFeature(character)) {
    const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.GIFT_OF_THE_PROTECTORS);

    if (invocation?.description.length) {
      descriptionAdditions.push(
        createSourcedDescriptionEntries(invocation.name, invocation.description)
      );
    }
  }

  return descriptionAdditions;
}

export function hasLifeAndDeathLedgerDescriptionAdditions(character: Character): boolean {
  return getLifeAndDeathLedgerDescriptionAdditions(character).length > 0;
}

export function getLifeAndDeathLedgerHeaderItems(
  character: Character
): LifeAndDeathLedgerHeaderItem[] {
  const headerItems: LifeAndDeathLedgerHeaderItem[] = [];

  if (hasBarbarianRelentlessRageFeature(character)) {
    headerItems.push({
      kind: "text",
      key: "relentless-rage-dc",
      label: `Relentless Rage DC ${getLifeAndDeathRelentlessRageDc(character)}`
    });
  }

  if (hasPaladinOathOfTheAncientsUndyingSentinelFeature(character)) {
    const total = getPaladinOathOfTheAncientsUndyingSentinelUsesTotal(character);

    if (total > 0) {
      headerItems.push({
        kind: "dots",
        key: "undying-sentinel-uses",
        label: "Undying Sentinel",
        current: getPaladinOathOfTheAncientsUndyingSentinelUsesRemaining(character),
        total
      });
    }
  }

  if (hasLifeAndDeathSearingVengeanceFeature(character)) {
    const total = getWarlockSearingVengeanceUsesTotal(character);

    if (total > 0) {
      headerItems.push({
        kind: "dots",
        key: "searing-vengeance-uses",
        label: "Searing Vengeance",
        current: getWarlockSearingVengeanceUsesRemaining(character),
        total
      });
    }
  }

  if (hasLifeAndDeathGiftOfTheProtectorsFeature(character)) {
    const total = getWarlockGiftOfTheProtectorsUsesTotal(character);

    if (total > 0) {
      headerItems.push({
        kind: "dots",
        key: "gift-of-the-protectors-uses",
        label: "Gift of the Protectors",
        current: getWarlockGiftOfTheProtectorsUsesRemaining(character),
        total
      });
    }
  }

  return headerItems;
}

export function applyLifeAndDeathRelentlessRageForCharacter(character: Character): Character {
  if (!isLifeAndDeathRelentlessRageAvailable(character)) {
    return character;
  }

  const characterWithSpentRage = activateBarbarianRelentlessRage(character);
  const effectiveHitPointMaximum = getEffectiveHitPointMaximumForCharacter(characterWithSpentRage);
  const nextCurrentHitPoints = Math.min(
    effectiveHitPointMaximum,
    Math.max(0, 2 * (characterWithSpentRage.level ?? 0))
  );

  return reconcileCharacterStatusConsequences({
    ...characterWithSpentRage,
    currentHitPoints: nextCurrentHitPoints,
    deathSaves: {
      successes: 0,
      failures: 0
    }
  });
}

export function applyLifeAndDeathUndyingSentinelForCharacter(character: Character): Character {
  if (!isLifeAndDeathUndyingSentinelAvailable(character)) {
    return character;
  }

  return activatePaladinOathOfTheAncientsUndyingSentinel(character);
}

export function applyLifeAndDeathSearingVengeanceForCharacter(character: Character): Character {
  if (!isLifeAndDeathSearingVengeanceAvailable(character)) {
    return character;
  }

  const wasUnconscious = isLifeAndDeathUnconscious(character);
  const characterWithSpentUse = consumeWarlockSearingVengeanceUse(character);

  if (!wasUnconscious) {
    return characterWithSpentUse;
  }

  return reconcileCharacterStatusConsequences({
    ...characterWithSpentUse,
    currentHitPoints: Math.max(
      1,
      Math.floor(getEffectiveHitPointMaximumForCharacter(characterWithSpentUse) / 2)
    ),
    deathSaves: {
      successes: 0,
      failures: 0
    }
  });
}

export function applyLifeAndDeathGiftOfTheProtectorsForCharacter(character: Character): Character {
  if (!isLifeAndDeathGiftOfTheProtectorsAvailable(character)) {
    return character;
  }

  const wasUnconscious = isLifeAndDeathUnconscious(character);
  const characterWithSpentUse = consumeWarlockGiftOfTheProtectorsUse(character);

  if (!wasUnconscious) {
    return characterWithSpentUse;
  }

  return reconcileCharacterStatusConsequences({
    ...characterWithSpentUse,
    currentHitPoints: 1,
    deathSaves: {
      successes: 0,
      failures: 0
    }
  });
}
