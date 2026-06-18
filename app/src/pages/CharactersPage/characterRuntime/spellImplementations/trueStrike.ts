import {
  DAMAGE_TYPE,
  DICE,
  type SpellDescriptionEntry,
  type SpellEntry,
  type WeaponDamage,
  type WeaponDamageType
} from "../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type AbilityKey,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import { getSpellcastingAbilityForCharacterSpell } from "../../shared/spellcastingAbility";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
  pruneLinkedStatusEntries
} from "../../statusEntries";
import { compileSpellImplementationContributions } from "./contributions";
import type { SpellImplementationApplyContext } from "./types";

export const trueStrikeSpellId = "spell-true-strike";
export const trueStrikeStatusSourceId = "spell-true-strike-pending-attack";
export const trueStrikeStatusValue = "True Strike";

type TrueStrikeWeaponContext = {
  attackKind: "weapon" | "unarmed";
};

function formatStatusDescriptionEntry(entry: SpellDescriptionEntry): string {
  return typeof entry === "string" ? entry : entry.items.join("\n");
}

function getTrueStrikeStatusDescription(
  spell: Pick<SpellEntry, "description">
): string | undefined {
  const description = spell.description.map(formatStatusDescriptionEntry).join("\n").trim();

  return description.length > 0 ? description : undefined;
}

function appendRadiantDamageType(damageType: WeaponDamageType): WeaponDamageType {
  const damageTypes = Array.isArray(damageType) ? damageType : [damageType];

  return damageTypes.includes(DAMAGE_TYPE.RADIANT)
    ? damageType
    : [...damageTypes, DAMAGE_TYPE.RADIANT];
}

export function isTrueStrikePendingAttackStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "sourceId" | "value">
): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceId === trueStrikeStatusSourceId &&
    entry.value === trueStrikeStatusValue
  );
}

export function hasTrueStrikePendingAttack(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(isTrueStrikePendingAttackStatusEntry);
}

export function isTrueStrikeEligibleWeapon(context: TrueStrikeWeaponContext): boolean {
  return context.attackKind === "weapon";
}

export function getTrueStrikeSpellcastingAbilityForWeapon(
  character: Character,
  context: TrueStrikeWeaponContext
): AbilityKey | null {
  if (!hasTrueStrikePendingAttack(character.statusEntries) || !isTrueStrikeEligibleWeapon(context)) {
    return null;
  }

  return getSpellcastingAbilityForCharacterSpell(character, trueStrikeSpellId);
}

export function applyTrueStrikeRadiantDamageType(
  damage: WeaponDamage
): { damage: WeaponDamage; applied: boolean } {
  if (damage.length === 0) {
    return {
      damage,
      applied: false
    };
  }

  const [primaryDamageAmount, primaryDamageType] = damage[0];

  return {
    damage: [
      [primaryDamageAmount, appendRadiantDamageType(primaryDamageType)],
      ...damage.slice(1)
    ],
    applied: true
  };
}

export function getTrueStrikeDamageAdjustmentForWeapon(
  character: Pick<Character, "statusEntries">,
  context: TrueStrikeWeaponContext,
  damage: WeaponDamage
): { damage: WeaponDamage; applied: boolean } | null {
  if (!hasTrueStrikePendingAttack(character.statusEntries) || !isTrueStrikeEligibleWeapon(context)) {
    return null;
  }

  return applyTrueStrikeRadiantDamageType(damage);
}

export function getTrueStrikeExtraRadiantDamageFormulaForLevel(level: number): string | null {
  if (level >= 17) {
    return `3${DICE.D6.toLowerCase()}`;
  }

  if (level >= 11) {
    return `2${DICE.D6.toLowerCase()}`;
  }

  if (level >= 5) {
    return `1${DICE.D6.toLowerCase()}`;
  }

  return null;
}

export function getTrueStrikeEconomyMultiCountForWeapon(
  character: Pick<Character, "statusEntries">,
  context: TrueStrikeWeaponContext
): number {
  return hasTrueStrikePendingAttack(character.statusEntries) &&
    isTrueStrikeEligibleWeapon(context)
    ? 1
    : 0;
}

export function consumeTrueStrikePendingAttackForCharacter(
  character: Character,
  context: TrueStrikeWeaponContext
): Character {
  if (!isTrueStrikeEligibleWeapon(context)) {
    return character;
  }

  const statusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextStatusEntries = statusEntries.filter(
    (entry) => !isTrueStrikePendingAttackStatusEntry(entry)
  );

  if (nextStatusEntries.length === statusEntries.length) {
    return character;
  }

  return {
    ...character,
    statusEntries: pruneLinkedStatusEntries(nextStatusEntries)
  };
}

function applyTrueStrikeSpellImplementation({
  character,
  spell
}: SpellImplementationApplyContext): Character {
  if (spell.id !== trueStrikeSpellId) {
    return character;
  }

  const normalizedStatusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextStatusEntries = [
    ...normalizedStatusEntries.filter((entry) => !isTrueStrikePendingAttackStatusEntry(entry)),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: trueStrikeStatusValue,
      source: spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: 1,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
      },
      sourceId: trueStrikeStatusSourceId,
      sourceSpellId: spell.id,
      description: getTrueStrikeStatusDescription(spell)
    })
  ];

  return {
    ...character,
    statusEntries: pruneLinkedStatusEntries(nextStatusEntries)
  };
}

const trueStrikeSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: trueStrikeSpellId,
    label: trueStrikeStatusValue
  },
  spellId: trueStrikeSpellId,
  applyOnCast: applyTrueStrikeSpellImplementation
};

export const trueStrikeSpellImplementations = compileSpellImplementationContributions([
  trueStrikeSpellImplementationSpec
]);
