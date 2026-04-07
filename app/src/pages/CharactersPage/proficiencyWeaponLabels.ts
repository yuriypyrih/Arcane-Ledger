import { WEAPON_PROFICIENCY } from "../../types";
import {
  RARITY_TYPES,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  type WeaponEntry
} from "../../codex/entries";
import { getWeaponEntries } from "../../codex/selectors";
import { formatCodexLabel } from "../../utils/codex";
import { isMartialMeleeLightWeapon, isSimpleMeleeWeapon } from "./monkWeapons";

export type WeaponType = WEAPON_TRAINING;

const weaponProficiencyByTraining: Record<WeaponType, WEAPON_PROFICIENCY> = {
  [WEAPON_TRAINING.SIMPLE]: WEAPON_PROFICIENCY.SIMPLE,
  [WEAPON_TRAINING.MARTIAL]: WEAPON_PROFICIENCY.MARTIAL
};

const weaponProficiencyByBaseWeapon: Record<WEAPON_BASE, WEAPON_PROFICIENCY> = {
  [WEAPON_BASE.CLUB]: WEAPON_PROFICIENCY.CLUB,
  [WEAPON_BASE.DAGGER]: WEAPON_PROFICIENCY.DAGGER,
  [WEAPON_BASE.GREATCLUB]: WEAPON_PROFICIENCY.GREATCLUB,
  [WEAPON_BASE.HANDAXE]: WEAPON_PROFICIENCY.HANDAXE,
  [WEAPON_BASE.JAVELIN]: WEAPON_PROFICIENCY.JAVELIN,
  [WEAPON_BASE.LIGHT_HAMMER]: WEAPON_PROFICIENCY.LIGHT_HAMMER,
  [WEAPON_BASE.MACE]: WEAPON_PROFICIENCY.MACE,
  [WEAPON_BASE.QUARTERSTAFF]: WEAPON_PROFICIENCY.QUARTERSTAFF,
  [WEAPON_BASE.SICKLE]: WEAPON_PROFICIENCY.SICKLE,
  [WEAPON_BASE.SPEAR]: WEAPON_PROFICIENCY.SPEAR,
  [WEAPON_BASE.DART]: WEAPON_PROFICIENCY.DART,
  [WEAPON_BASE.LIGHT_CROSSBOW]: WEAPON_PROFICIENCY.LIGHT_CROSSBOW,
  [WEAPON_BASE.SHORTBOW]: WEAPON_PROFICIENCY.SHORTBOW,
  [WEAPON_BASE.SLING]: WEAPON_PROFICIENCY.SLING,
  [WEAPON_BASE.BATTLEAXE]: WEAPON_PROFICIENCY.BATTLEAXE,
  [WEAPON_BASE.FLAIL]: WEAPON_PROFICIENCY.FLAIL,
  [WEAPON_BASE.GLAIVE]: WEAPON_PROFICIENCY.GLAIVE,
  [WEAPON_BASE.GREATAXE]: WEAPON_PROFICIENCY.GREATAXE,
  [WEAPON_BASE.GREATSWORD]: WEAPON_PROFICIENCY.GREATSWORD,
  [WEAPON_BASE.HALBERD]: WEAPON_PROFICIENCY.HALBERD,
  [WEAPON_BASE.LANCE]: WEAPON_PROFICIENCY.LANCE,
  [WEAPON_BASE.LONGSWORD]: WEAPON_PROFICIENCY.LONGSWORD,
  [WEAPON_BASE.MAUL]: WEAPON_PROFICIENCY.MAUL,
  [WEAPON_BASE.MORNINGSTAR]: WEAPON_PROFICIENCY.MORNINGSTAR,
  [WEAPON_BASE.PIKE]: WEAPON_PROFICIENCY.PIKE,
  [WEAPON_BASE.RAPIER]: WEAPON_PROFICIENCY.RAPIER,
  [WEAPON_BASE.SCIMITAR]: WEAPON_PROFICIENCY.SCIMITAR,
  [WEAPON_BASE.SHORTSWORD]: WEAPON_PROFICIENCY.SHORTSWORD,
  [WEAPON_BASE.TRIDENT]: WEAPON_PROFICIENCY.TRIDENT,
  [WEAPON_BASE.WARHAMMER]: WEAPON_PROFICIENCY.WARHAMMER,
  [WEAPON_BASE.WAR_PICK]: WEAPON_PROFICIENCY.WAR_PICK,
  [WEAPON_BASE.WHIP]: WEAPON_PROFICIENCY.WHIP,
  [WEAPON_BASE.BLOWGUN]: WEAPON_PROFICIENCY.BLOWGUN,
  [WEAPON_BASE.HAND_CROSSBOW]: WEAPON_PROFICIENCY.HAND_CROSSBOW,
  [WEAPON_BASE.HEAVY_CROSSBOW]: WEAPON_PROFICIENCY.HEAVY_CROSSBOW,
  [WEAPON_BASE.LONGBOW]: WEAPON_PROFICIENCY.LONGBOW,
  [WEAPON_BASE.MUSKET]: WEAPON_PROFICIENCY.MUSKET,
  [WEAPON_BASE.PISTOL]: WEAPON_PROFICIENCY.PISTOL
};

const weaponProficiencyLabelsByCategory: Partial<Record<WEAPON_PROFICIENCY, string>> = {
  [WEAPON_PROFICIENCY.SIMPLE]: "Simple weapons",
  [WEAPON_PROFICIENCY.SIMPLE_MELEE]: "Simple melee weapons",
  [WEAPON_PROFICIENCY.MARTIAL]: "Martial weapons",
  [WEAPON_PROFICIENCY.MARTIAL_MELEE_LIGHT]: "Martial melee weapons with Light property"
};

const commonWeaponEntriesByBaseWeapon = new Map<WEAPON_BASE, WeaponEntry>(
  getWeaponEntries()
    .filter(
      (entry) =>
        entry.rarity === RARITY_TYPES.COMMON && typeof entry.baseWeapon === "string"
    )
    .map((entry) => [entry.baseWeapon as WEAPON_BASE, entry])
);

const weaponProficiencyLabelsByBaseWeapon = new Map<WEAPON_BASE, string>(
  [...commonWeaponEntriesByBaseWeapon.entries()].map(([baseWeapon, entry]) => [baseWeapon, entry.name])
);

const weaponSpecificProficiencyOptions = Object.values(WEAPON_BASE)
  .map((baseWeapon) => weaponProficiencyByBaseWeapon[baseWeapon])
  .sort((left, right) => getWeaponProficiencyLabel(left).localeCompare(getWeaponProficiencyLabel(right)));

const monkOnlyWeaponProficiencyOptions: WEAPON_PROFICIENCY[] = [
  WEAPON_PROFICIENCY.SIMPLE_MELEE,
  WEAPON_PROFICIENCY.MARTIAL_MELEE_LIGHT
];

export const weaponProficiencyOptions: WEAPON_PROFICIENCY[] = [
  WEAPON_PROFICIENCY.SIMPLE,
  WEAPON_PROFICIENCY.SIMPLE_MELEE,
  WEAPON_PROFICIENCY.MARTIAL,
  WEAPON_PROFICIENCY.MARTIAL_MELEE_LIGHT,
  ...weaponSpecificProficiencyOptions
];

export function getWeaponProficiencyForTraining(training: WeaponType): WEAPON_PROFICIENCY {
  return weaponProficiencyByTraining[training];
}

export function getWeaponProficiencyForBaseWeapon(baseWeapon: WEAPON_BASE): WEAPON_PROFICIENCY {
  return weaponProficiencyByBaseWeapon[baseWeapon];
}

export function doesWeaponProficiencyMatchWeapon(
  proficiency: WEAPON_PROFICIENCY,
  training: WeaponType,
  options?: {
    baseWeapon?: WEAPON_BASE;
    combatType?: WEAPON_COMBAT_TYPE;
    properties?: WEAPON_PROPERTY[];
  }
): boolean {
  if (options?.baseWeapon && proficiency === getWeaponProficiencyForBaseWeapon(options.baseWeapon)) {
    return true;
  }

  if (proficiency === getWeaponProficiencyForTraining(training)) {
    return true;
  }

  if (
    options?.combatType === undefined ||
    options?.properties === undefined
  ) {
    return false;
  }

  const weaponCandidate = {
    type: {
      training,
      combat: options.combatType
    },
    properties: options.properties
  };

  if (proficiency === WEAPON_PROFICIENCY.SIMPLE_MELEE) {
    return isSimpleMeleeWeapon(weaponCandidate);
  }

  if (proficiency === WEAPON_PROFICIENCY.MARTIAL_MELEE_LIGHT) {
    return isMartialMeleeLightWeapon(weaponCandidate);
  }

  return false;
}

export function getMatchingWeaponProficiencies(
  training: WeaponType,
  options?: {
    baseWeapon?: WEAPON_BASE;
    combatType?: WEAPON_COMBAT_TYPE;
    properties?: WEAPON_PROPERTY[];
  }
): WEAPON_PROFICIENCY[] {
  const candidates: WEAPON_PROFICIENCY[] = [];

  if (options?.baseWeapon) {
    candidates.push(getWeaponProficiencyForBaseWeapon(options.baseWeapon));
  }

  if (
    options?.combatType !== undefined &&
    options?.properties !== undefined
  ) {
    const weaponCandidate = {
      type: {
        training,
        combat: options.combatType
      },
      properties: options.properties
    };

    if (isSimpleMeleeWeapon(weaponCandidate)) {
      candidates.push(WEAPON_PROFICIENCY.SIMPLE_MELEE);
    }

    if (isMartialMeleeLightWeapon(weaponCandidate)) {
      candidates.push(WEAPON_PROFICIENCY.MARTIAL_MELEE_LIGHT);
    }
  }

  candidates.push(getWeaponProficiencyForTraining(training));

  return candidates.filter(
    (candidate, index) => candidates.indexOf(candidate) === index
  );
}

export function isMonkOnlyWeaponProficiency(proficiency: WEAPON_PROFICIENCY): boolean {
  return monkOnlyWeaponProficiencyOptions.includes(proficiency);
}

export function getWeaponProficiencyOptionsForClass(className?: string): WEAPON_PROFICIENCY[] {
  if (className === "Monk") {
    return weaponProficiencyOptions;
  }

  return weaponProficiencyOptions.filter((proficiency) => !isMonkOnlyWeaponProficiency(proficiency));
}

export function getEditableWeaponProficiencyOptions(): WEAPON_PROFICIENCY[] {
  return weaponProficiencyOptions.filter((proficiency) => !isMonkOnlyWeaponProficiency(proficiency));
}

export function isWeaponMasteryProficiency(proficiency: WEAPON_PROFICIENCY): boolean {
  return ![
    WEAPON_PROFICIENCY.SIMPLE,
    WEAPON_PROFICIENCY.SIMPLE_MELEE,
    WEAPON_PROFICIENCY.MARTIAL,
    WEAPON_PROFICIENCY.MARTIAL_MELEE_LIGHT
  ].includes(proficiency);
}

export function getWeaponProficiencyLabel(proficiency: WEAPON_PROFICIENCY): string {
  const categoryLabel = weaponProficiencyLabelsByCategory[proficiency];

  if (categoryLabel) {
    return categoryLabel;
  }

  return (
    weaponProficiencyLabelsByBaseWeapon.get(
      proficiency as unknown as WEAPON_BASE
    ) ??
    proficiency.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

export function getWeaponProficiencyTypeLabel(
  proficiency: WEAPON_PROFICIENCY
): string | null {
  if (!isWeaponMasteryProficiency(proficiency)) {
    return null;
  }

  const weaponEntry = commonWeaponEntriesByBaseWeapon.get(
    proficiency as unknown as WEAPON_BASE
  );

  return weaponEntry
    ? `${formatCodexLabel(weaponEntry.type.training)} ${formatCodexLabel(weaponEntry.type.combat)}`
    : null;
}
