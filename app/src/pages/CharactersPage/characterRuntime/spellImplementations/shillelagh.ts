import {
  DICE,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  type SpellDescriptionEntry,
  type SpellEntry,
  type WeaponDamage
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

export const shillelaghSpellId = "spell-shillelagh";
export const shillelaghStatusSourceId = "spell-shillelagh-active";
export const shillelaghStatusValue = "Shillelagh";

type ShillelaghWeaponContext = {
  attackKind: "weapon" | "unarmed";
  baseWeapon?: WEAPON_BASE | null;
  combatType?: WEAPON_COMBAT_TYPE | null;
};

function formatStatusDescriptionEntry(entry: SpellDescriptionEntry): string {
  return typeof entry === "string" ? entry : entry.items.join("\n");
}

function getShillelaghStatusDescription(
  spell: Pick<SpellEntry, "description">
): string | undefined {
  const description = spell.description.map(formatStatusDescriptionEntry).join("\n").trim();

  return description.length > 0 ? description : undefined;
}

export function isShillelaghStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "sourceId" | "value">
): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceId === shillelaghStatusSourceId &&
    entry.value === shillelaghStatusValue
  );
}

export function hasShillelaghStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(isShillelaghStatusEntry);
}

export function getShillelaghDamageDiceForLevel(level: number): DICE[] {
  if (level >= 17) {
    return [DICE.D6, DICE.D6];
  }

  if (level >= 11) {
    return [DICE.D12];
  }

  if (level >= 5) {
    return [DICE.D10];
  }

  return [DICE.D8];
}

export function isShillelaghEligibleWeapon(context: ShillelaghWeaponContext): boolean {
  return (
    context.attackKind === "weapon" &&
    context.combatType === WEAPON_COMBAT_TYPE.MELEE &&
    (context.baseWeapon === WEAPON_BASE.CLUB ||
      context.baseWeapon === WEAPON_BASE.QUARTERSTAFF)
  );
}

export function getShillelaghSpellcastingAbilityForWeapon(
  character: Character,
  context: ShillelaghWeaponContext
): AbilityKey | null {
  if (!hasShillelaghStatus(character.statusEntries) || !isShillelaghEligibleWeapon(context)) {
    return null;
  }

  return getSpellcastingAbilityForCharacterSpell(character, shillelaghSpellId);
}

export function applyShillelaghDamageDice(
  damage: WeaponDamage,
  level: number
): { damage: WeaponDamage; applied: boolean } {
  if (damage.length === 0) {
    return {
      damage,
      applied: false
    };
  }

  const [, primaryDamageType] = damage[0];
  const shillelaghDice = getShillelaghDamageDiceForLevel(level);

  return {
    damage: [
      ...shillelaghDice.map((die) => [die, primaryDamageType] as WeaponDamage[number]),
      ...damage.slice(1)
    ],
    applied: true
  };
}

export function getShillelaghDamageAdjustmentForWeapon(
  character: Pick<Character, "level" | "statusEntries">,
  context: ShillelaghWeaponContext,
  damage: WeaponDamage
): { damage: WeaponDamage; applied: boolean } | null {
  if (!hasShillelaghStatus(character.statusEntries) || !isShillelaghEligibleWeapon(context)) {
    return null;
  }

  return applyShillelaghDamageDice(damage, character.level);
}

function applyShillelaghSpellImplementation({
  character,
  spell
}: SpellImplementationApplyContext): Character {
  if (spell.id !== shillelaghSpellId) {
    return character;
  }

  const normalizedStatusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextStatusEntries = [
    ...normalizedStatusEntries.filter((entry) => !isShillelaghStatusEntry(entry)),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: shillelaghStatusValue,
      source: spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: 10,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
      },
      sourceId: shillelaghStatusSourceId,
      sourceSpellId: spell.id,
      description: getShillelaghStatusDescription(spell)
    })
  ];

  return {
    ...character,
    statusEntries: pruneLinkedStatusEntries(nextStatusEntries)
  };
}

const shillelaghSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: shillelaghSpellId,
    label: shillelaghStatusValue
  },
  spellId: shillelaghSpellId,
  applyOnCast: applyShillelaghSpellImplementation
};

export const shillelaghSpellImplementations = compileSpellImplementationContributions([
  shillelaghSpellImplementationSpec
]);
