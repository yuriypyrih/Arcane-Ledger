import { ACTION_TYPE, CLASS_FEATURE, type SpellEntry } from "../../../../../codex/entries";
import type {
  ArmorProficiencyEntry,
  Character,
  CharacterBardFeatureState,
  WeaponProficiencyEntry
} from "../../../../../types";
import {
  ARMOR_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  WEAPON_PROFICIENCY
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ECONOMY_TYPE } from "../../../actionEconomy";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../../combat";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type {
  FeatureActionCard,
  FeatureArmorProficiencyEntry,
  FeatureWeaponProficiencyEntry,
  WeaponAttackConsumptionContext
} from "../../types";
import {
  createDefaultFeatureActionDescription,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";

export const collegeOfValorSubclassId = "bard-college-of-valor";
const bardValorMartialTrainingSourceLabel = "College of Valor: Martial Training";
const bardicInspirationActionKey = "bard-bardic-inspiration";
const combatInspirationSource = "Combat Inspiration";

type BardValorCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "roundTracker">>;

export function hasBardCollegeOfValorMartialTrainingFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfValorSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasBardCollegeOfValorCombatInspirationFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfValorSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasBardCollegeOfValorExtraAttackFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfValorSubclassId &&
    (character.level ?? 0) >= 6
  );
}

export function hasBardCollegeOfValorBattleMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfValorSubclassId &&
    (character.level ?? 0) >= 14
  );
}

export function normalizeBardCollegeOfValorFeatureState(
  value: Partial<CharacterBardFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterBardFeatureState,
  | "extraAttacksRemainingThisTurn"
  | "valorCantripReplacementUsedThisTurn"
  | "battleMagicBonusAttackAvailable"
> {
  const extraAttacksRemainingThisTurn = Number(value.extraAttacksRemainingThisTurn);

  return {
    extraAttacksRemainingThisTurn: hasBardCollegeOfValorExtraAttackFeature(character)
      ? Number.isFinite(extraAttacksRemainingThisTurn)
        ? Math.max(0, Math.min(1, Math.floor(extraAttacksRemainingThisTurn)))
        : 0
      : undefined,
    valorCantripReplacementUsedThisTurn: hasBardCollegeOfValorExtraAttackFeature(character)
      ? Boolean(value.valorCantripReplacementUsedThisTurn)
      : undefined,
    battleMagicBonusAttackAvailable: hasBardCollegeOfValorBattleMagicFeature(character)
      ? Boolean(value.battleMagicBonusAttackAvailable)
      : undefined
  };
}

export function getBardCollegeOfValorWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureWeaponProficiencyEntry[] {
  if (!hasBardCollegeOfValorMartialTrainingFeature(character)) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: bardValorMartialTrainingSourceLabel,
      proficiency: WEAPON_PROFICIENCY.MARTIAL,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies WeaponProficiencyEntry
  ];
}

export function getBardCollegeOfValorArmorProficiencyEntries(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureArmorProficiencyEntry[] {
  if (!hasBardCollegeOfValorMartialTrainingFeature(character)) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: bardValorMartialTrainingSourceLabel,
      proficiency: ARMOR_PROFICIENCY.MEDIUM,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies ArmorProficiencyEntry,
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: bardValorMartialTrainingSourceLabel,
      proficiency: ARMOR_PROFICIENCY.SHIELD,
      proficiencyLevel: PROF_LEVEL.PROFICIENT,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    } satisfies ArmorProficiencyEntry
  ];
}

export function getBardCollegeOfValorAdditionalAttackCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasBardCollegeOfValorExtraAttackFeature(character) ? 1 : 0;
}

export function getBardCollegeOfValorWeaponAttackMultiCount(character: BardValorCharacter): number {
  if (getBardCollegeOfValorAdditionalAttackCount(character) <= 0) {
    return 0;
  }

  return character.classFeatureState?.bard?.extraAttacksRemainingThisTurn ?? 0;
}

export function hasBardCollegeOfValorBattleMagicBonusAttackAvailable(
  character: BardValorCharacter
): boolean {
  return (
    hasBardCollegeOfValorBattleMagicFeature(character) &&
    character.classFeatureState?.bard?.battleMagicBonusAttackAvailable === true
  );
}

function canGainBardCollegeOfValorBattleMagicFromSpell(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  spell: Pick<SpellEntry, "castingTime">
): boolean {
  return (
    hasBardCollegeOfValorBattleMagicFeature(character) &&
    spell.castingTime.includes(ACTION_TYPE.ACTION)
  );
}

function isBardCollegeOfValorActionCantrip(
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return spell.spellLevel === 0 && spell.castingTime.includes(ACTION_TYPE.ACTION);
}

export function applyBardCollegeOfValorBattleMagicAfterSpellCast(
  character: Character,
  bardState: CharacterBardFeatureState,
  spell: Pick<SpellEntry, "castingTime">
): Character {
  if (!canGainBardCollegeOfValorBattleMagicFromSpell(character, spell)) {
    return character;
  }

  if (bardState.battleMagicBonusAttackAvailable) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        battleMagicBonusAttackAvailable: true
      }
    }
  };
}

export function canUseBardCollegeOfValorActionCantripReplacement(
  character: Pick<Character, "className" | "level" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  bardState: CharacterBardFeatureState,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  if (
    !hasBardCollegeOfValorExtraAttackFeature(character) ||
    !isBardCollegeOfValorActionCantrip(spell)
  ) {
    return false;
  }

  if (bardState.valorCantripReplacementUsedThisTurn) {
    return false;
  }

  return (
    isRoundTrackerResourceAvailable(character.roundTracker, "action") ||
    (bardState.extraAttacksRemainingThisTurn ?? 0) > 0
  );
}

export function consumeBardCollegeOfValorWeaponAttack(
  character: Character,
  bardState: CharacterBardFeatureState,
  action: WeaponAttackConsumptionContext
): Character {
  const extraAttacksRemaining = bardState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");
  const canUseBattleMagicBonusAttack =
    action.attackKind === "weapon" &&
    bardState.battleMagicBonusAttackAvailable === true &&
    isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction");

  if (action.economyType === ECONOMY_TYPE.BONUS_ACTION) {
    if (!canUseBattleMagicBonusAttack) {
      return character;
    }

    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "bonusAction"),
      classFeatureState: {
        ...character.classFeatureState,
        bard: {
          ...bardState,
          battleMagicBonusAttackAvailable: false
        }
      }
    };
  }

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        bard: {
          ...bardState,
          extraAttacksRemainingThisTurn: getBardCollegeOfValorAdditionalAttackCount(character)
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function consumeBardCollegeOfValorActionCantrip(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (!hasBardCollegeOfValorExtraAttackFeature(character)) {
    return character;
  }

  if (bardState.valorCantripReplacementUsedThisTurn) {
    return character;
  }

  const extraAttacksRemaining = bardState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        bard: {
          ...bardState,
          extraAttacksRemainingThisTurn: getBardCollegeOfValorAdditionalAttackCount(character),
          valorCantripReplacementUsedThisTurn: true
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1,
        valorCantripReplacementUsedThisTurn: true
      }
    }
  };
}

export function clearBardCollegeOfValorTurnState(
  character: Character,
  bardState: CharacterBardFeatureState
): Character {
  if (
    (bardState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    !bardState.valorCantripReplacementUsedThisTurn &&
    !bardState.battleMagicBonusAttackAvailable
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        extraAttacksRemainingThisTurn: 0,
        valorCantripReplacementUsedThisTurn: false,
        battleMagicBonusAttackAvailable: false
      }
    }
  };
}

export function shouldAdvanceBardCollegeOfValorFeaturesForNewRound(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    getBardCollegeOfValorAdditionalAttackCount(character) > 0 ||
    hasBardCollegeOfValorBattleMagicFeature(character)
  );
}

function appendCombatInspirationDescription(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  action: FeatureActionCard
): FeatureActionCard {
  if (action.key !== bardicInspirationActionKey) {
    return action;
  }

  return appendSourcedDescriptionAddition(
    {
      ...action,
      description: action.description?.length
        ? [...action.description]
        : createDefaultFeatureActionDescription(action)
    },
    combatInspirationSource,
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.COMBAT_INSPIRATION)
  );
}

export const getBardCollegeOfValorDerivedFeatureState: SubclassRuntimeResolver = (character) => ({
  transformFeatureAction: hasBardCollegeOfValorCombatInspirationFeature(character)
    ? (action) => appendCombatInspirationDescription(character, action)
    : undefined
});
