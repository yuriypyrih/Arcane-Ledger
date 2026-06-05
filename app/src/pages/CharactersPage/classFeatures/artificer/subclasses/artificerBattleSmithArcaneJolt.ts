import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../../codex/entries";
import type {
  Character,
  CharacterArtificerFeatureState,
  MonsterTraitRecord
} from "../../../../../types";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import type { WeaponAction } from "../../../gameplay";
import { createChargesCardUsage } from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { FeatureActionCard } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const artificerArcaneJoltActionKey = "artificer-battle-smith-arcane-jolt";

const battleSmithSubclassId = "artificer-battle-smith";
const arcaneJoltName = "Arcane Jolt";
const arcaneJoltWeaponReminder =
  "When either you hit a target with an attack roll using a magic weapon or your Steel Defender hits a target, you can channel magical energy through the strike to create one effect.";
const arcaneJoltReadMoreReminder = "(Read the Arcane Jolt for more)";

type BattleSmithArcaneJoltCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "background"
      | "backgroundChoices"
      | "classFeatureState"
      | "feats"
      | "inventoryItems"
      | "level"
      | "statusEntries"
      | "subclassId"
    >
  >;

function normalizeUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

function getArcaneJoltReminderDescription(): SpellDescriptionEntry[] {
  return [arcaneJoltWeaponReminder, arcaneJoltReadMoreReminder];
}

function getArcaneJoltReminderText(): string {
  return getArcaneJoltReminderDescription().join("\n\n");
}

function descriptionEntryIncludes(entry: SpellDescriptionEntry, value: string): boolean {
  return typeof entry === "string"
    ? entry.includes(value)
    : entry.items.some((item) => item.includes(value));
}

function getImprovedDefenderDescriptionPart(
  character: BattleSmithArcaneJoltCharacter,
  partName: string
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.IMPROVED_DEFENDER).filter(
    (entry) => descriptionEntryIncludes(entry, partName)
  );
}

function getArtificerBattleSmithImprovedJoltDescriptionAdditions(
  character: BattleSmithArcaneJoltCharacter
): SpellDescriptionEntry[][] {
  if (!hasArtificerBattleSmithImprovedDefenderFeature(character)) {
    return [];
  }

  const section = createFeatureSourcedDescriptionEntries(
    character,
    CLASS_FEATURE.IMPROVED_DEFENDER,
    getImprovedDefenderDescriptionPart(character, "Improved Jolt"),
    "Improved Defender"
  );

  return section.length > 0 ? [section] : [];
}

export function hasArtificerBattleSmithArcaneJoltFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, battleSmithSubclassId, 9);
}

export function hasArtificerBattleSmithImprovedDefenderFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, battleSmithSubclassId, 15);
}

export function getArtificerArcaneJoltUsesTotal(
  character: BattleSmithArcaneJoltCharacter
): number {
  if (!hasArtificerBattleSmithArcaneJoltFeature(character)) {
    return 0;
  }

  return Math.max(1, getAbilityModifierForCharacter(character, "INT"));
}

export function getArtificerArcaneJoltUsesRemaining(
  character: BattleSmithArcaneJoltCharacter
): number {
  const usesTotal = getArtificerArcaneJoltUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  const usesExpended = normalizeUsesExpended(
    character.classFeatureState?.artificer?.battleSmithArcaneJoltUsesExpended,
    usesTotal
  );

  return Math.max(0, usesTotal - usesExpended);
}

export function normalizeArtificerBattleSmithArcaneJoltState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<
      Pick<
        Character,
        | "abilities"
        | "background"
        | "backgroundChoices"
        | "feats"
        | "inventoryItems"
        | "statusEntries"
        | "subclassId"
      >
    >
): Pick<
  CharacterArtificerFeatureState,
  "battleSmithArcaneJoltUsesExpended" | "battleSmithArcaneJoltUsedThisTurn"
> {
  if (!hasArtificerBattleSmithArcaneJoltFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const usesTotal = getArtificerArcaneJoltUsesTotal(character);

  return {
    battleSmithArcaneJoltUsesExpended: normalizeUsesExpended(
      record.battleSmithArcaneJoltUsesExpended,
      usesTotal
    ),
    battleSmithArcaneJoltUsedThisTurn: record.battleSmithArcaneJoltUsedThisTurn === true
  };
}

export function getArtificerArcaneJoltAction(
  character: BattleSmithArcaneJoltCharacter
): FeatureActionCard | null {
  if (!hasArtificerBattleSmithArcaneJoltFeature(character)) {
    return null;
  }

  const usesTotal = getArtificerArcaneJoltUsesTotal(character);
  const usesRemaining = getArtificerArcaneJoltUsesRemaining(character);
  const usedThisTurn =
    character.classFeatureState?.artificer?.battleSmithArcaneJoltUsedThisTurn === true;
  const description = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ARCANE_JOLT);
  const descriptionAdditions = getArtificerBattleSmithImprovedJoltDescriptionAdditions(character);
  const disabledReason =
    usesRemaining <= 0
      ? "Arcane Jolt recharges when you finish a Long Rest."
      : usedThisTurn
        ? "Arcane Jolt has already been used this turn."
        : undefined;

  return {
    key: artificerArcaneJoltActionKey,
    name: arcaneJoltName,
    sourceFeature: CLASS_FEATURE.ARCANE_JOLT,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Channel energy through a strike.",
    detail: "Use a charge after you or your Steel Defender hits to deal force damage or heal.",
    breakdown: "Damage or heal on hit",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    descriptionAdditions,
    drawer: {
      kind: "confirm",
      eyebrow: "Battle Smith",
      description,
      descriptionAdditions,
      blockedReason: disabledReason
    },
    execute: {
      kind: "activate"
    }
  };
}

export function consumeArtificerArcaneJoltUse(character: Character): Character {
  if (!hasArtificerBattleSmithArcaneJoltFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const arcaneJoltState = normalizeArtificerBattleSmithArcaneJoltState(
    currentArtificerState,
    character
  );
  const usesTotal = getArtificerArcaneJoltUsesTotal(character);
  const usesExpended = arcaneJoltState.battleSmithArcaneJoltUsesExpended ?? 0;

  if (usesExpended >= usesTotal || arcaneJoltState.battleSmithArcaneJoltUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...arcaneJoltState,
        battleSmithArcaneJoltUsesExpended: usesExpended + 1,
        battleSmithArcaneJoltUsedThisTurn: true
      }
    }
  };
}

export function restoreArtificerArcaneJoltOnLongRest(character: Character): Character {
  if (!hasArtificerBattleSmithArcaneJoltFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const arcaneJoltState = normalizeArtificerBattleSmithArcaneJoltState(
    currentArtificerState,
    character
  );

  if (
    (arcaneJoltState.battleSmithArcaneJoltUsesExpended ?? 0) <= 0 &&
    arcaneJoltState.battleSmithArcaneJoltUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...arcaneJoltState,
        battleSmithArcaneJoltUsesExpended: 0,
        battleSmithArcaneJoltUsedThisTurn: false
      }
    }
  };
}

export function clearArtificerArcaneJoltForNewRound(character: Character): Character {
  if (!hasArtificerBattleSmithArcaneJoltFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};

  if (currentArtificerState.battleSmithArcaneJoltUsedThisTurn !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        battleSmithArcaneJoltUsedThisTurn: false
      }
    }
  };
}

export function transformArtificerBattleSmithArcaneJoltWeaponAction(
  character: BattleSmithArcaneJoltCharacter,
  action: WeaponAction
): WeaponAction {
  if (!hasArtificerBattleSmithArcaneJoltFeature(character) || action.isMagicWeapon !== true) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(
    action,
    character,
    CLASS_FEATURE.ARCANE_JOLT,
    getArcaneJoltReminderDescription(),
    arcaneJoltName
  );
}

export function getArtificerBattleSmithArcaneJoltSpecialAbility(
  character: BattleSmithArcaneJoltCharacter
): MonsterTraitRecord | null {
  return hasArtificerBattleSmithArcaneJoltFeature(character)
    ? {
        name: arcaneJoltName,
        desc: getArcaneJoltReminderText()
      }
    : null;
}

export function getArtificerBattleSmithImprovedDeflectionDescription(
  character: BattleSmithArcaneJoltCharacter
): SpellDescriptionEntry[] {
  return hasArtificerBattleSmithImprovedDefenderFeature(character)
    ? getImprovedDefenderDescriptionPart(character, "Improved Deflection")
    : [];
}
