import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../../../codex/entries";
import {
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterRageFeatureState
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import { clampNumber } from "../../../shared";
import type { WeaponAction } from "../../../gameplay";
import {
  createChargesAndUsageHeaderTags,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureDamageBonus,
  FeatureSpeedBonus,
  WeaponFeatureContext
} from "../../types";
import { normalizeRoundTracker } from "../../../combat";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const pathOfTheZealotSubclassId = "barbarian-path-of-the-zealot";
export const barbarianWarriorOfTheGodsActionKey = "barbarian-warrior-of-the-gods";
export const barbarianZealousPresenceActionKey = "barbarian-zealous-presence";

const divineFuryDamageBonusLabel = "Divine Fury";
const fanaticalFocusStatusSourceId = "feature-barbarian-fanatical-focus";
const rageOfTheGodsStatusSourceId = "feature-barbarian-rage-of-the-gods";
const zealousPresenceStatusSourceId = "feature-barbarian-zealous-presence";
const rageOfTheGodsUsesTotal = 1;
const warriorOfTheGodsBaseUses = 4;
const zealousPresenceUsesTotal = 1;
const divineFurySource = "Divine Fury";
const zealousPresenceEffectName = "Zealous Presence";

type BarbarianSubclassCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

export function isBarbarianPathOfTheZealot(character: BarbarianSubclassCharacter): boolean {
  return (
    character.className === "Barbarian" &&
    character.subclassId === pathOfTheZealotSubclassId &&
    character.level >= 3
  );
}

export function hasBarbarianPathOfTheZealotDivineFury(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheZealot(character);
}

export function hasBarbarianPathOfTheZealotWarriorOfTheGods(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheZealot(character);
}

export function hasBarbarianPathOfTheZealotFanaticalFocus(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheZealot(character) && character.level >= 6;
}

export function hasBarbarianPathOfTheZealotRageOfTheGods(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheZealot(character) && character.level >= 14;
}

export function hasBarbarianPathOfTheZealotZealousPresence(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheZealot(character) && character.level >= 10;
}

export function hasBarbarianPathOfTheZealotRageOfTheGodsTrait(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === rageOfTheGodsStatusSourceId
  );
}

export function normalizeBarbarianPathOfTheZealotRageState(
  value: Partial<CharacterRageFeatureState>,
  character: BarbarianSubclassCharacter
): Pick<
  CharacterRageFeatureState,
  | "divineFuryUsedThisTurn"
  | "warriorOfTheGodsUsesExpended"
  | "zealousPresenceUsesExpended"
  | "rageOfTheGodsUsesExpended"
> {
  const warriorOfTheGodsUsesExpended = Number(value.warriorOfTheGodsUsesExpended);
  const zealousPresenceUsesExpended = Number(value.zealousPresenceUsesExpended);
  const rageOfTheGodsUsesExpended = Number(value.rageOfTheGodsUsesExpended);
  const warriorOfTheGodsUsesTotal = getBarbarianPathOfTheZealotWarriorOfTheGodsUsesTotal(character);

  return {
    divineFuryUsedThisTurn: hasBarbarianPathOfTheZealotDivineFury(character)
      ? value.divineFuryUsedThisTurn === true
      : false,
    warriorOfTheGodsUsesExpended: hasBarbarianPathOfTheZealotWarriorOfTheGods(character)
      ? Number.isFinite(warriorOfTheGodsUsesExpended)
        ? Math.max(0, Math.min(warriorOfTheGodsUsesTotal, Math.floor(warriorOfTheGodsUsesExpended)))
        : 0
      : 0,
    zealousPresenceUsesExpended: hasBarbarianPathOfTheZealotZealousPresence(character)
      ? Number.isFinite(zealousPresenceUsesExpended)
        ? Math.max(0, Math.min(zealousPresenceUsesTotal, Math.floor(zealousPresenceUsesExpended)))
        : 0
      : 0,
    rageOfTheGodsUsesExpended: hasBarbarianPathOfTheZealotRageOfTheGods(character)
      ? Number.isFinite(rageOfTheGodsUsesExpended)
        ? Math.max(0, Math.min(rageOfTheGodsUsesTotal, Math.floor(rageOfTheGodsUsesExpended)))
        : 0
      : 0
  };
}

export function getBarbarianPathOfTheZealotRageOfTheGodsUsesTotal(
  character: BarbarianSubclassCharacter
): number {
  return hasBarbarianPathOfTheZealotRageOfTheGods(character) ? rageOfTheGodsUsesTotal : 0;
}

export function getBarbarianPathOfTheZealotRageOfTheGodsUsesRemaining(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): number {
  const totalUses = getBarbarianPathOfTheZealotRageOfTheGodsUsesTotal(character);
  return Math.max(0, totalUses - (rageState.rageOfTheGodsUsesExpended ?? 0));
}

export function getBarbarianPathOfTheZealotWarriorOfTheGodsUsesTotal(
  character: BarbarianSubclassCharacter
): number {
  if (!hasBarbarianPathOfTheZealotWarriorOfTheGods(character)) {
    return 0;
  }

  if (character.level >= 17) {
    return 7;
  }

  if (character.level >= 12) {
    return 6;
  }

  if (character.level >= 6) {
    return 5;
  }

  return warriorOfTheGodsBaseUses;
}

export function getBarbarianPathOfTheZealotWarriorOfTheGodsUsesRemaining(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): number {
  const totalUses = getBarbarianPathOfTheZealotWarriorOfTheGodsUsesTotal(character);
  return Math.max(0, totalUses - (rageState.warriorOfTheGodsUsesExpended ?? 0));
}

export function getBarbarianPathOfTheZealotWarriorOfTheGodsHealingFormula(
  character: Pick<Character, "level">
): string {
  const levelBonus = Math.floor(clampNumber(character.level, 0, 20, 0) / 2);
  return levelBonus > 0 ? `1d6 + ${levelBonus}` : "1d6";
}

export function getBarbarianPathOfTheZealotZealousPresenceUsesTotal(
  character: BarbarianSubclassCharacter
): number {
  return hasBarbarianPathOfTheZealotZealousPresence(character) ? zealousPresenceUsesTotal : 0;
}

export function getBarbarianPathOfTheZealotZealousPresenceUsesRemaining(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): number {
  const totalUses = getBarbarianPathOfTheZealotZealousPresenceUsesTotal(character);
  return Math.max(0, totalUses - (rageState.zealousPresenceUsesExpended ?? 0));
}

export function getBarbarianPathOfTheZealotWarriorOfTheGodsAction(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): FeatureActionCard | null {
  if (!hasBarbarianPathOfTheZealotWarriorOfTheGods(character)) {
    return null;
  }

  const totalUses = getBarbarianPathOfTheZealotWarriorOfTheGodsUsesTotal(character);
  const usesRemaining = getBarbarianPathOfTheZealotWarriorOfTheGodsUsesRemaining(
    character,
    rageState
  );

  return {
    key: barbarianWarriorOfTheGodsActionKey,
    name: "Warrior of the Gods",
    summary: "Spend divine healing charges.",
    detail: "Spend divine healing charges.",
    breakdown: "Spend charges to heal",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesLabel: `${usesRemaining}/${totalUses} charges`,
    usesRemaining,
    usesTotal: totalUses,
    drawer: {
      kind: "custom-form",
      eyebrow: "Barbarian",
      formKind: "warrior-of-the-gods"
    },
    execute: {
      kind: "custom-form",
      formKind: "warrior-of-the-gods"
    },
    disabled: usesRemaining <= 0,
    disabledReason: usesRemaining <= 0 ? "No Warrior of the Gods charges remaining." : undefined
  };
}

export function getBarbarianPathOfTheZealotZealousPresenceAction(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState,
  rageUsesRemaining: number,
  rageUsesTotal: number
): FeatureActionCard | null {
  if (!hasBarbarianPathOfTheZealotZealousPresence(character)) {
    return null;
  }

  const usesRemaining = getBarbarianPathOfTheZealotZealousPresenceUsesRemaining(
    character,
    rageState
  );
  const isUsingRageCharges = usesRemaining <= 0;
  const disabled = usesRemaining <= 0 && rageUsesRemaining <= 0;

  return {
    key: barbarianZealousPresenceActionKey,
    name: "Zealous Presence",
    summary: "Divine infused Battle Cry",
    detail: "Divine infused Battle Cry",
    breakdown: "Divine infused Battle Cry",
    sourceFeature: CLASS_FEATURE.ZEALOUS_PRESENCE,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createChargesOrResourceCardUsage(
      usesRemaining,
      zealousPresenceUsesTotal,
      createFeatureActionCardCost({
        amountText: "1",
        icon: "flame"
      })
    ),
    usesLabel: `${usesRemaining}/${zealousPresenceUsesTotal} charge`,
    usesRemaining,
    usesTotal: zealousPresenceUsesTotal,
    usesInlineLabel: isUsingRageCharges ? "Use 1" : undefined,
    usesInlineIcon: isUsingRageCharges ? "flame" : undefined,
    headerTags: createChargesAndUsageHeaderTags(
      usesRemaining,
      zealousPresenceUsesTotal,
      createFeatureActionCardCost({
        amountText: "1",
        icon: "flame"
      }),
      rageUsesRemaining,
      rageUsesTotal,
      {
        icon: "flame"
      }
    ),
    disabled,
    disabledReason: disabled ? "No Zealous Presence or Rage uses remaining." : undefined
  };
}

function applyBarbarianPathOfTheZealotZealousPresenceStatus(character: Character): Character {
  if (!hasBarbarianPathOfTheZealotZealousPresence(character)) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== zealousPresenceStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: zealousPresenceEffectName,
        source: zealousPresenceEffectName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 1,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
        },
        sourceId: zealousPresenceStatusSourceId
      })
    ]
  };
}

export function getBarbarianPathOfTheZealotWeaponDamageBonuses(
  character: Pick<Character, "level" | "roundTracker" | "className"> & Partial<Pick<Character, "subclassId">>,
  rageState: CharacterRageFeatureState,
  context: WeaponFeatureContext,
  isRaging: boolean
): FeatureDamageBonus[] {
  if (
    !hasBarbarianPathOfTheZealotDivineFury(character) ||
    !isRaging ||
    !normalizeRoundTracker(character.roundTracker).turnStarted ||
    (context.attackKind !== "weapon" && context.attackKind !== "unarmed") ||
    rageState.divineFuryUsedThisTurn === true
  ) {
    return [];
  }

  const divineFuryLevelBonus = Math.floor(clampNumber(character.level, 0, 20, 0) / 2);
  const divineFuryFormula = divineFuryLevelBonus > 0 ? `1d6+${divineFuryLevelBonus}` : "1d6";
  const divineFuryDisplayLabel =
    divineFuryLevelBonus > 0
      ? `1d6 + ${divineFuryLevelBonus} Necrotic/Radiant`
      : "1d6 Necrotic/Radiant";

  return [
    {
      label: divineFuryDamageBonusLabel,
      formula: divineFuryFormula,
      displayLabel: divineFuryDisplayLabel
    }
  ];
}

export function getBarbarianPathOfTheZealotSpeedBonuses(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureSpeedBonus[] {
  if (!hasBarbarianPathOfTheZealotRageOfTheGodsTrait(character)) {
    return [];
  }

  return [
    {
      label: "Rage of the Gods",
      movementType: "fly",
      value: 0,
      setBaseFromWalkMultiplier: 1,
      hover: true
    }
  ];
}

export function getBarbarianPathOfTheZealotDerivedConditions(
  character: Partial<Pick<Character, "statusEntries">>
): DerivedFeatureStatusEntry[] {
  if (!hasBarbarianPathOfTheZealotRageOfTheGodsTrait(character)) {
    return [];
  }

  return [
    {
      id: "feature-barbarian-rage-of-the-gods-necrotic",
      sourceId: rageOfTheGodsStatusSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.NECROTIC,
      source: "Rage of the Gods",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: "Rage of the Gods"
      }
    },
    {
      id: "feature-barbarian-rage-of-the-gods-psychic",
      sourceId: rageOfTheGodsStatusSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.PSYCHIC,
      source: "Rage of the Gods",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: "Rage of the Gods"
      }
    },
    {
      id: "feature-barbarian-rage-of-the-gods-radiant",
      sourceId: rageOfTheGodsStatusSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.RADIANT,
      source: "Rage of the Gods",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: "Rage of the Gods"
      }
    }
  ];
}

export function getBarbarianPathOfTheZealotRageStatusEntries(
  character: Character,
  statusEntries: Character["statusEntries"],
  rageState: CharacterRageFeatureState,
  useRageOfTheGods: boolean
): {
  statusEntries: Character["statusEntries"];
  rageStatePatch: Pick<CharacterRageFeatureState, "rageOfTheGodsUsesExpended">;
} {
  const nextNormalizedStatusEntries = normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) =>
      entry.sourceId !== fanaticalFocusStatusSourceId && entry.sourceId !== rageOfTheGodsStatusSourceId
  );
  const nextRageLinkedStatusEntries = hasBarbarianPathOfTheZealotFanaticalFocus(character)
    ? [
        ...nextNormalizedStatusEntries,
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Fanatical Focus",
          source: "Path of the Zealot",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.RAGE
          },
          sourceId: fanaticalFocusStatusSourceId
        })
      ]
    : nextNormalizedStatusEntries;
  const canUseRageOfTheGods =
    useRageOfTheGods &&
    getBarbarianPathOfTheZealotRageOfTheGodsUsesRemaining(character, rageState) > 0;
  const nextStatusEntries = canUseRageOfTheGods
    ? [
        ...nextRageLinkedStatusEntries,
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Rage of the Gods",
          source: "Path of the Zealot",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.MINUTES,
            amount: 1
          },
          sourceId: rageOfTheGodsStatusSourceId
        })
      ]
    : nextRageLinkedStatusEntries;

  return {
    statusEntries: nextStatusEntries,
    rageStatePatch: {
      rageOfTheGodsUsesExpended: canUseRageOfTheGods
        ? (rageState.rageOfTheGodsUsesExpended ?? 0) + 1
        : rageState.rageOfTheGodsUsesExpended
    }
  };
}

export function consumeBarbarianPathOfTheZealotWarriorOfTheGodsCharges(
  character: Character,
  rageState: CharacterRageFeatureState,
  chargeCount: number
): Character {
  if (!hasBarbarianPathOfTheZealotWarriorOfTheGods(character)) {
    return character;
  }

  const normalizedChargeCount = Math.max(0, Math.floor(chargeCount));

  if (normalizedChargeCount <= 0) {
    return character;
  }

  const usesRemaining = getBarbarianPathOfTheZealotWarriorOfTheGodsUsesRemaining(
    character,
    rageState
  );
  const chargesToSpend = Math.min(usesRemaining, normalizedChargeCount);

  if (chargesToSpend <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        warriorOfTheGodsUsesExpended: (rageState.warriorOfTheGodsUsesExpended ?? 0) + chargesToSpend
      }
    }
  };
}

export function activateBarbarianPathOfTheZealotZealousPresence(
  character: Character,
  rageState: CharacterRageFeatureState,
  rageUsesRemaining: number
): Character {
  if (!hasBarbarianPathOfTheZealotZealousPresence(character)) {
    return character;
  }

  const usesRemaining = getBarbarianPathOfTheZealotZealousPresenceUsesRemaining(
    character,
    rageState
  );

  if (usesRemaining > 0) {
    return applyBarbarianPathOfTheZealotZealousPresenceStatus({
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        rage: {
          ...rageState,
          zealousPresenceUsesExpended: (rageState.zealousPresenceUsesExpended ?? 0) + 1
        }
      }
    });
  }

  if (rageUsesRemaining <= 0) {
    return character;
  }

  return applyBarbarianPathOfTheZealotZealousPresenceStatus({
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: rageState.usesExpended + 1
      }
    }
  });
}

export function consumeBarbarianPathOfTheZealotDivineFuryBonus(
  character: Character,
  rageState: CharacterRageFeatureState
): Character {
  if (!hasBarbarianPathOfTheZealotDivineFury(character)) {
    return character;
  }

  if (rageState.divineFuryUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        divineFuryUsedThisTurn: true
      }
    }
  };
}

export function restoreBarbarianPathOfTheZealotWarriorOfTheGodsOnLongRest(
  character: Character,
  rageState: CharacterRageFeatureState
): Character {
  if (!hasBarbarianPathOfTheZealotWarriorOfTheGods(character)) {
    return character;
  }

  if ((rageState.warriorOfTheGodsUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        warriorOfTheGodsUsesExpended: 0
      }
    }
  };
}

export function restoreBarbarianPathOfTheZealotZealousPresenceOnLongRest(
  character: Character,
  rageState: CharacterRageFeatureState
): Character {
  if (!hasBarbarianPathOfTheZealotZealousPresence(character)) {
    return character;
  }

  if ((rageState.zealousPresenceUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        zealousPresenceUsesExpended: 0
      }
    }
  };
}

export function restoreBarbarianPathOfTheZealotRageOfTheGodsOnLongRest(
  character: Character,
  rageState: CharacterRageFeatureState
): Character {
  if (!hasBarbarianPathOfTheZealotRageOfTheGods(character)) {
    return character;
  }

  if ((rageState.rageOfTheGodsUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        rageOfTheGodsUsesExpended: 0
      }
    }
  };
}

function appendDivineFuryDescription(
  action: WeaponAction,
  descriptionEntries: ReturnType<typeof getFeatureDescriptionForCharacter>
): WeaponAction {
  return appendSourcedDescriptionAddition(action, divineFurySource, descriptionEntries);
}

export const getBarbarianPathOfTheZealotDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  const normalizedCharacter = {
    className: character.className,
    subclassId: character.subclassId,
    level: character.level ?? 0
  };

  if (!hasBarbarianPathOfTheZealotDivineFury(normalizedCharacter)) {
    return {};
  }

  const divineFuryDescription = getFeatureDescriptionForCharacter(
    normalizedCharacter,
    CLASS_FEATURE.DIVINE_FURY
  );

  return divineFuryDescription.length > 0
    ? {
        transformWeaponAction: (action: WeaponAction) =>
          appendDivineFuryDescription(action, divineFuryDescription)
      }
    : {};
};
