import { RARITY_TYPES, WEAPON_COMBAT_TYPE } from "../../../codex/entries";
import { getWeaponEntries } from "../../../codex/selectors";
import { WEAPON_PROFICIENCY } from "../../../types";

type WeaponMasteryOptionsConfig = {
  meleeOnly?: boolean;
};

export function getWeaponMasteryOptions({
  meleeOnly = false
}: WeaponMasteryOptionsConfig = {}): WEAPON_PROFICIENCY[] {
  const options: WEAPON_PROFICIENCY[] = [];

  getWeaponEntries()
    .filter(
      (entry) =>
        entry.rarity === RARITY_TYPES.COMMON &&
        typeof entry.baseWeapon === "string" &&
        (!meleeOnly || entry.type.combat === WEAPON_COMBAT_TYPE.MELEE)
    )
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((entry) => {
      const proficiency = entry.baseWeapon as unknown as WEAPON_PROFICIENCY;

      if (!options.includes(proficiency)) {
        options.push(proficiency);
      }
    });

  return options;
}

export function normalizeWeaponMasterySelections(
  selections: unknown,
  options: WEAPON_PROFICIENCY[],
  limit: number
): WEAPON_PROFICIENCY[] {
  if (!Array.isArray(selections) || limit <= 0) {
    return [];
  }

  const optionSet = new Set<WEAPON_PROFICIENCY>(options);

  return [...new Set(
    selections.filter(
      (selection): selection is WEAPON_PROFICIENCY =>
        typeof selection === "string" && optionSet.has(selection as WEAPON_PROFICIENCY)
    )
  )].slice(0, limit);
}
