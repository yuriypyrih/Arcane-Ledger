import {
  CONDITION_NAME,
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import type {
  Character,
  CharacterRageFeatureState,
  CharacterStatusEntry
} from "../../../../../types";
import { CLASS_FEATURE, getReactionEntryById } from "../../../../../codex/entries";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
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
  WeaponFeatureContext
} from "../../types";
import { removeCharacterConditionsForImmunities } from "../../../statusEntries";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const pathOfTheBerserkerSubclassId = "barbarian-path-of-the-berserker";
export const barbarianIntimidatingPresenceActionKey = "barbarian-intimidating-presence";
export const barbarianBerserkerRetaliationReactionId = "reaction-berserker-retaliation";
export const frenzyDamageBonusLabel = "Frenzy";

const mindlessRageCharmedImmunitySourceId = "feature-barbarian-mindless-rage-charmed-immunity";
const mindlessRageFrightenedImmunitySourceId =
  "feature-barbarian-mindless-rage-frightened-immunity";
const intimidatingPresenceUsesTotal = 1;

type BarbarianSubclassCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

export function isBarbarianPathOfTheBerserker(character: BarbarianSubclassCharacter): boolean {
  return (
    character.className === "Barbarian" &&
    character.subclassId === pathOfTheBerserkerSubclassId &&
    character.level >= 3
  );
}

export function hasBarbarianPathOfTheBerserkerMindlessRage(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheBerserker(character) && character.level >= 6;
}

export function hasBarbarianPathOfTheBerserkerRetaliation(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheBerserker(character) && character.level >= 10;
}

export function hasBarbarianPathOfTheBerserkerIntimidatingPresence(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheBerserker(character) && character.level >= 14;
}

export function normalizeBarbarianPathOfTheBerserkerRageState(
  value: Partial<CharacterRageFeatureState>,
  character: BarbarianSubclassCharacter
): Pick<
  CharacterRageFeatureState,
  "frenzyPending" | "retaliationAttacksRemaining" | "intimidatingPresenceUsesExpended"
> {
  const intimidatingPresenceUsesExpended = Number(value.intimidatingPresenceUsesExpended);
  const retaliationAttacksRemaining = Number(value.retaliationAttacksRemaining);

  return {
    frenzyPending:
      isBarbarianPathOfTheBerserker(character) && value.frenzyPending === true ? true : false,
    retaliationAttacksRemaining: hasBarbarianPathOfTheBerserkerRetaliation(character)
      ? Number.isFinite(retaliationAttacksRemaining)
        ? Math.max(0, Math.min(1, Math.floor(retaliationAttacksRemaining)))
        : 0
      : 0,
    intimidatingPresenceUsesExpended: hasBarbarianPathOfTheBerserkerIntimidatingPresence(character)
      ? Number.isFinite(intimidatingPresenceUsesExpended)
        ? Math.max(
            0,
            Math.min(intimidatingPresenceUsesTotal, Math.floor(intimidatingPresenceUsesExpended))
          )
        : 0
      : 0
  };
}

export function getBarbarianPathOfTheBerserkerMindlessRageImmunityEntries(): DerivedFeatureStatusEntry[] {
  return [
    {
      id: mindlessRageCharmedImmunitySourceId,
      sourceId: mindlessRageCharmedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.CHARMED,
      source: "Mindless Rage",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.RAGE
      }
    },
    {
      id: mindlessRageFrightenedImmunitySourceId,
      sourceId: mindlessRageFrightenedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.FRIGHTENED,
      source: "Mindless Rage",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.RAGE
      }
    }
  ];
}

export function getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesTotal(
  character: BarbarianSubclassCharacter
): number {
  return hasBarbarianPathOfTheBerserkerIntimidatingPresence(character)
    ? intimidatingPresenceUsesTotal
    : 0;
}

export function getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesRemaining(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): number {
  const totalUses = getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesTotal(character);

  return Math.max(0, totalUses - (rageState.intimidatingPresenceUsesExpended ?? 0));
}

export function getBarbarianPathOfTheBerserkerFeatureAction(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState,
  rageUsesRemaining: number,
  rageUsesTotal: number
): FeatureActionCard | null {
  if (!hasBarbarianPathOfTheBerserkerIntimidatingPresence(character)) {
    return null;
  }

  const usesRemaining = getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesRemaining(
    character,
    rageState
  );
  const isUsingRageCharges = usesRemaining <= 0;
  const disabled = usesRemaining <= 0 && rageUsesRemaining <= 0;

  return {
    key: barbarianIntimidatingPresenceActionKey,
    name: "Intimidating Presence",
    sourceFeature: CLASS_FEATURE.INTIMIDATING_PRESENCE,
    summary: "Frighten nearby creatures.",
    detail: "Project fear nearby.",
    breakdown: "Project fear nearby.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createChargesOrResourceCardUsage(
      usesRemaining,
      intimidatingPresenceUsesTotal,
      createFeatureActionCardCost({
        amountText: "1",
        icon: "flame"
      })
    ),
    usesRemaining,
    usesTotal: intimidatingPresenceUsesTotal,
    usesInlineLabel: isUsingRageCharges ? "Use 1" : undefined,
    usesInlineIcon: isUsingRageCharges ? "flame" : undefined,
    headerTags: createChargesAndUsageHeaderTags(
      usesRemaining,
      intimidatingPresenceUsesTotal,
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
    disabledReason: disabled ? "No Intimidating Presence or Rage uses remaining." : undefined
  };
}

export function getBarbarianPathOfTheBerserkerWeaponDamageBonuses(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState,
  context: WeaponFeatureContext,
  rageDamage: number,
  isRaging: boolean,
  hasRecklessAttack: boolean
): FeatureDamageBonus[] {
  if (
    !isBarbarianPathOfTheBerserker(character) ||
    !isRaging ||
    !hasRecklessAttack ||
    context.ability !== "STR" ||
    (context.attackKind !== "weapon" && context.attackKind !== "unarmed") ||
    rageState.frenzyPending !== true ||
    rageDamage <= 0
  ) {
    return [];
  }

  return [
    {
      label: frenzyDamageBonusLabel,
      formula: `${rageDamage}d6`,
      displayLabel: `${rageDamage}d6`
    }
  ];
}

export function getBarbarianPathOfTheBerserkerDerivedConditions(
  character: BarbarianSubclassCharacter,
  isRaging: boolean
): DerivedFeatureStatusEntry[] {
  if (!isRaging || !hasBarbarianPathOfTheBerserkerMindlessRage(character)) {
    return [];
  }

  return getBarbarianPathOfTheBerserkerMindlessRageImmunityEntries();
}

export function getBarbarianPathOfTheBerserkerRageStatusEntries(
  character: BarbarianSubclassCharacter,
  statusEntries: CharacterStatusEntry[] | undefined
): CharacterStatusEntry[] | undefined {
  if (!hasBarbarianPathOfTheBerserkerMindlessRage(character)) {
    return statusEntries;
  }

  return removeCharacterConditionsForImmunities(
    statusEntries,
    getBarbarianPathOfTheBerserkerMindlessRageImmunityEntries()
  );
}

export function getBarbarianPathOfTheBerserkerRecklessAttackPatch(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): Pick<CharacterRageFeatureState, "frenzyPending"> {
  return {
    frenzyPending: isBarbarianPathOfTheBerserker(character) && rageState.active === true
  };
}

export function getBarbarianPathOfTheBerserkerRecklessAttackDescriptionAdditions(
  character: BarbarianSubclassCharacter
) {
  if (!isBarbarianPathOfTheBerserker(character)) {
    return [];
  }

  const frenzyDescription = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.FRENZY);
  return frenzyDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.FRENZY,
          frenzyDescription,
          frenzyDamageBonusLabel
        )
      ]
    : [];
}

export function getBarbarianPathOfTheBerserkerRetaliationAttackMultiCount(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState
): number {
  return hasBarbarianPathOfTheBerserkerRetaliation(character)
    ? Math.max(0, rageState.retaliationAttacksRemaining ?? 0)
    : 0;
}

export function activateBarbarianPathOfTheBerserkerRetaliation(
  character: Character,
  rageState: CharacterRageFeatureState
): Character {
  if (!hasBarbarianPathOfTheBerserkerRetaliation(character)) {
    return character;
  }

  if ((rageState.retaliationAttacksRemaining ?? 0) >= 1) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        retaliationAttacksRemaining: 1
      }
    }
  };
}

export function consumeBarbarianPathOfTheBerserkerRetaliationAttack(
  character: Character,
  rageState: CharacterRageFeatureState
): Character {
  const retaliationAttacksRemaining = getBarbarianPathOfTheBerserkerRetaliationAttackMultiCount(
    character,
    rageState
  );

  if (retaliationAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        retaliationAttacksRemaining: retaliationAttacksRemaining - 1
      }
    }
  };
}

export function activateBarbarianPathOfTheBerserkerIntimidatingPresence(
  character: Character,
  rageState: CharacterRageFeatureState,
  rageUsesRemaining: number
): Character {
  if (!hasBarbarianPathOfTheBerserkerIntimidatingPresence(character)) {
    return character;
  }

  const usesRemaining = getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesRemaining(
    character,
    rageState
  );

  if (usesRemaining > 0) {
    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        rage: {
          ...rageState,
          intimidatingPresenceUsesExpended: (rageState.intimidatingPresenceUsesExpended ?? 0) + 1
        }
      }
    };
  }

  if (rageUsesRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: rageState.usesExpended + 1
      }
    }
  };
}

export function consumeBarbarianPathOfTheBerserkerFrenzyBonus(
  character: Character,
  rageState: CharacterRageFeatureState
): Character {
  if (rageState.frenzyPending !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        frenzyPending: false
      }
    }
  };
}

export function restoreBarbarianPathOfTheBerserkerIntimidatingPresenceOnLongRest(
  character: Character,
  rageState: CharacterRageFeatureState
): Character {
  if (!hasBarbarianPathOfTheBerserkerIntimidatingPresence(character)) {
    return character;
  }

  if ((rageState.intimidatingPresenceUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        intimidatingPresenceUsesExpended: 0
      }
    }
  };
}

export const getBarbarianPathOfTheBerserkerDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  if (
    character.className !== "Barbarian" ||
    character.subclassId !== pathOfTheBerserkerSubclassId ||
    (character.level ?? 0) < 10
  ) {
    return {};
  }

  const retaliation = getReactionEntryById(barbarianBerserkerRetaliationReactionId);

  return retaliation ? { reactionEntries: [retaliation] } : {};
};
