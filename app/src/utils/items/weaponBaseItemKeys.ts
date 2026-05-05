import { WEAPON_BASE } from "../../codex/entries";

export const official2024BackendItemKeyByWeaponBase: Record<WEAPON_BASE, string> = {
  [WEAPON_BASE.CLUB]: "srd-2024_club",
  [WEAPON_BASE.DAGGER]: "srd-2024_dagger",
  [WEAPON_BASE.GREATCLUB]: "srd-2024_greatclub",
  [WEAPON_BASE.HANDAXE]: "srd-2024_handaxe",
  [WEAPON_BASE.JAVELIN]: "srd-2024_javelin",
  [WEAPON_BASE.LIGHT_HAMMER]: "srd-2024_light-hammer",
  [WEAPON_BASE.MACE]: "srd-2024_mace",
  [WEAPON_BASE.QUARTERSTAFF]: "srd-2024_quarterstaff",
  [WEAPON_BASE.SICKLE]: "srd-2024_sickle",
  [WEAPON_BASE.SPEAR]: "srd-2024_spear",
  [WEAPON_BASE.DART]: "srd-2024_dart",
  [WEAPON_BASE.LIGHT_CROSSBOW]: "srd-2024_light-crossbow",
  [WEAPON_BASE.SHORTBOW]: "srd-2024_shortbow",
  [WEAPON_BASE.SLING]: "srd-2024_sling",
  [WEAPON_BASE.BATTLEAXE]: "srd-2024_battleaxe",
  [WEAPON_BASE.FLAIL]: "srd-2024_flail",
  [WEAPON_BASE.GLAIVE]: "srd-2024_glaive",
  [WEAPON_BASE.GREATAXE]: "srd-2024_greataxe",
  [WEAPON_BASE.GREATSWORD]: "srd-2024_greatsword",
  [WEAPON_BASE.HALBERD]: "srd-2024_halberd",
  [WEAPON_BASE.LANCE]: "srd-2024_lance",
  [WEAPON_BASE.LONGSWORD]: "srd-2024_longsword",
  [WEAPON_BASE.MAUL]: "srd-2024_maul",
  [WEAPON_BASE.MORNINGSTAR]: "srd-2024_morningstar",
  [WEAPON_BASE.PIKE]: "srd-2024_pike",
  [WEAPON_BASE.RAPIER]: "srd-2024_rapier",
  [WEAPON_BASE.SCIMITAR]: "srd-2024_scimitar",
  [WEAPON_BASE.SHORTSWORD]: "srd-2024_shortsword",
  [WEAPON_BASE.TRIDENT]: "srd-2024_trident",
  [WEAPON_BASE.WARHAMMER]: "srd-2024_warhammer",
  [WEAPON_BASE.WAR_PICK]: "srd-2024_war-pick",
  [WEAPON_BASE.WHIP]: "srd-2024_whip",
  [WEAPON_BASE.BLOWGUN]: "srd-2024_blowgun",
  [WEAPON_BASE.HAND_CROSSBOW]: "srd-2024_hand-crossbow",
  [WEAPON_BASE.HEAVY_CROSSBOW]: "srd-2024_heavy-crossbow",
  [WEAPON_BASE.LONGBOW]: "srd-2024_longbow",
  [WEAPON_BASE.MUSKET]: "srd-2024_musket",
  [WEAPON_BASE.PISTOL]: "srd-2024_pistol"
};

export function getOfficial2024BackendItemKeyForWeaponBase(
  weaponBase: WEAPON_BASE | null | undefined
): string | null {
  return weaponBase ? (official2024BackendItemKeyByWeaponBase[weaponBase] ?? null) : null;
}
