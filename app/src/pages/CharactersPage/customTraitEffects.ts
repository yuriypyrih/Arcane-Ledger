import { WEAPON_COMBAT_TYPE } from "../../codex/entries";
import type {
  AbilityKey,
  CharacterCustomTraitEffect,
  CharacterStatusEntry
} from "../../types";

const abilityKeys: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const customTraitEffectTypes = new Set<CharacterCustomTraitEffect["type"]>([
  "armorClass",
  "initiative",
  "passivePerception",
  "abilityScore",
  "abilityModifier",
  "savingThrow",
  "weaponDamage"
]);
const customTraitWeaponDamageKinds = new Set<
  Extract<CharacterCustomTraitEffect, { type: "weaponDamage" }>["attackKind"]
>(["unarmed", WEAPON_COMBAT_TYPE.MELEE, WEAPON_COMBAT_TYPE.RANGED]);

export type CustomTraitFlatBonus = {
  label: string;
  value: number;
};

function normalizeCustomTraitEffectValue(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const normalizedValue = Math.trunc(value);
  return normalizedValue === 0 ? null : normalizedValue;
}

function isAbilityKey(value: unknown): value is AbilityKey {
  return typeof value === "string" && abilityKeys.includes(value as AbilityKey);
}

function normalizeCharacterCustomTraitEffect(
  value: unknown
): CharacterCustomTraitEffect | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<CharacterCustomTraitEffect>;

  if (!customTraitEffectTypes.has(record.type as CharacterCustomTraitEffect["type"])) {
    return null;
  }

  const normalizedValue = normalizeCustomTraitEffectValue(record.value);

  if (normalizedValue === null) {
    return null;
  }

  switch (record.type) {
    case "armorClass":
    case "initiative":
    case "passivePerception":
      return {
        type: record.type,
        value: normalizedValue
      };
    case "abilityScore":
    case "abilityModifier":
    case "savingThrow":
      return isAbilityKey(record.ability)
        ? {
            type: record.type,
            ability: record.ability,
            value: normalizedValue
          }
        : null;
    case "weaponDamage":
      return customTraitWeaponDamageKinds.has(
        record.attackKind as Extract<CharacterCustomTraitEffect, { type: "weaponDamage" }>["attackKind"]
      )
        ? {
            type: "weaponDamage",
            attackKind: record.attackKind as Extract<
              CharacterCustomTraitEffect,
              { type: "weaponDamage" }
            >["attackKind"],
            value: normalizedValue
          }
        : null;
    default:
      return null;
  }
}

function mapCustomTraitBonuses(
  statusEntries: CharacterStatusEntry[] | undefined,
  predicate: (effect: CharacterCustomTraitEffect) => boolean
): CustomTraitFlatBonus[] {
  return (statusEntries ?? []).flatMap((entry) => {
    if (entry.disabled || !isCustomFeatureTraitStatusEntry(entry)) {
      return [];
    }

    return entry.customEffects
      .filter(predicate)
      .map((effect) => ({
        label: String(entry.value).trim() || entry.source,
        value: effect.value
      }));
  });
}

export function normalizeCharacterCustomTraitEffects(value: unknown): CharacterCustomTraitEffect[] {
  return Array.isArray(value)
    ? value
        .map((entry) => normalizeCharacterCustomTraitEffect(entry))
        .filter((entry): entry is CharacterCustomTraitEffect => entry !== null)
    : [];
}

export function isCustomFeatureTraitStatusEntry(
  entry: Pick<CharacterStatusEntry, "customEffects">
): entry is CharacterStatusEntry & {
  customEffects: CharacterCustomTraitEffect[];
} {
  return Array.isArray(entry.customEffects) && entry.customEffects.length > 0;
}

export function getCustomTraitArmorClassBonuses(
  statusEntries: CharacterStatusEntry[] | undefined
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "armorClass");
}

export function getCustomTraitInitiativeBonuses(
  statusEntries: CharacterStatusEntry[] | undefined
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "initiative");
}

export function getCustomTraitPassivePerceptionBonuses(
  statusEntries: CharacterStatusEntry[] | undefined
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => effect.type === "passivePerception");
}

export function getCustomTraitAbilityScoreBonuses(
  statusEntries: CharacterStatusEntry[] | undefined,
  ability: AbilityKey
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(
    statusEntries,
    (effect) => effect.type === "abilityScore" && effect.ability === ability
  );
}

export function getCustomTraitAbilityModifierBonuses(
  statusEntries: CharacterStatusEntry[] | undefined,
  ability: AbilityKey
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(
    statusEntries,
    (effect) => effect.type === "abilityModifier" && effect.ability === ability
  );
}

export function getCustomTraitSavingThrowBonuses(
  statusEntries: CharacterStatusEntry[] | undefined,
  ability: AbilityKey
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(
    statusEntries,
    (effect) => effect.type === "savingThrow" && effect.ability === ability
  );
}

export function getCustomTraitWeaponDamageBonuses(
  statusEntries: CharacterStatusEntry[] | undefined,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
  }
): CustomTraitFlatBonus[] {
  return mapCustomTraitBonuses(statusEntries, (effect) => {
    if (effect.type !== "weaponDamage") {
      return false;
    }

    if (effect.attackKind === "unarmed") {
      return context.attackKind === "unarmed";
    }

    return context.attackKind === "weapon" && context.combatType === effect.attackKind;
  });
}

export function formatCharacterCustomTraitEffectTargetLabel(
  effect: CharacterCustomTraitEffect
): string {
  switch (effect.type) {
    case "armorClass":
      return "Armor Class";
    case "initiative":
      return "Initiative";
    case "passivePerception":
      return "Passive Perception";
    case "abilityScore":
      return `${effect.ability} Ability Score`;
    case "abilityModifier":
      return `${effect.ability} Modifier`;
    case "savingThrow":
      return `${effect.ability} Saving Throw`;
    case "weaponDamage":
      return effect.attackKind === "unarmed"
        ? "Unarmed Strike"
        : effect.attackKind === WEAPON_COMBAT_TYPE.MELEE
          ? "Melee Weapons"
          : "Ranged Weapons";
    default:
      return "Effect";
  }
}

export function formatCharacterCustomTraitEffectValue(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

export function formatCharacterCustomTraitEffectSummary(
  effect: CharacterCustomTraitEffect
): string {
  return `${formatCharacterCustomTraitEffectTargetLabel(effect)}: ${formatCharacterCustomTraitEffectValue(effect.value)}`;
}
