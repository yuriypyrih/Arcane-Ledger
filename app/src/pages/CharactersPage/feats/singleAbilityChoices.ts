import { FEATS } from "../../../codex/entries/enums";
import type { AbilityKey, CharacterFeatEntry } from "../../../types";

function defineSingleAbilityChoice<
  const F extends keyof CharacterFeatEntry,
  const A extends readonly AbilityKey[]
>(field: F, label: string, abilities: A, defaultAbility: A[number], maxScore = 20) {
  return {
    field,
    label,
    abilities,
    maxScore,
    createDefault: (): { ability: A[number] } => ({ ability: defaultAbility }),
    normalize: (value: unknown): { ability: A[number] } | undefined => {
      if (!value || typeof value !== "object" || !("ability" in value)) return undefined;
      const ability = value.ability;
      return typeof ability === "string" && abilities.some((option) => option === ability)
        ? { ability: ability as A[number] }
        : undefined;
    }
  };
}

/** Existing saved fields and option order are part of the feat editing contract. */
export const singleAbilityChoices = {
  [FEATS.ATHLETE]: defineSingleAbilityChoice("athlete", "Athlete", ["STR", "DEX"], "STR"),
  [FEATS.CHARGER]: defineSingleAbilityChoice("charger", "Charger", ["STR", "DEX"], "STR"),
  [FEATS.GRAPPLER]: defineSingleAbilityChoice("grappler", "Grappler", ["STR", "DEX"], "STR"),
  [FEATS.CHEF]: defineSingleAbilityChoice("chef", "Chef", ["CON", "WIS"], "CON"),
  [FEATS.CRUSHER]: defineSingleAbilityChoice("crusher", "Crusher", ["STR", "CON"], "STR"),
  [FEATS.DUAL_WIELDER]: defineSingleAbilityChoice(
    "dualWielder",
    "Dual Wielder",
    ["STR", "DEX"],
    "STR"
  ),
  [FEATS.HEAVILY_ARMORED]: defineSingleAbilityChoice(
    "heavilyArmored",
    "Heavily Armored",
    ["CON", "STR"],
    "CON"
  ),
  [FEATS.HEAVY_ARMOR_MASTER]: defineSingleAbilityChoice(
    "heavyArmorMaster",
    "Heavy Armor Master",
    ["CON", "STR"],
    "CON"
  ),
  [FEATS.INSPIRING_LEADER]: defineSingleAbilityChoice(
    "inspiringLeader",
    "Inspiring Leader",
    ["WIS", "CHA"],
    "WIS"
  ),
  [FEATS.LIGHTLY_ARMORED]: defineSingleAbilityChoice(
    "lightlyArmored",
    "Lightly Armored",
    ["STR", "DEX"],
    "STR"
  ),
  [FEATS.MAGE_SLAYER]: defineSingleAbilityChoice(
    "mageSlayer",
    "Mage Slayer",
    ["STR", "DEX"],
    "STR"
  ),
  [FEATS.MARTIAL_WEAPON_TRAINING]: defineSingleAbilityChoice(
    "martialWeaponTraining",
    "Martial Weapon Training",
    ["STR", "DEX"],
    "STR"
  ),
  [FEATS.MEDIUM_ARMOR_MASTER]: defineSingleAbilityChoice(
    "mediumArmorMaster",
    "Medium Armor Master",
    ["STR", "DEX"],
    "STR"
  ),
  [FEATS.MODERATELY_ARMORED]: defineSingleAbilityChoice(
    "moderatelyArmored",
    "Moderately Armored",
    ["STR", "DEX"],
    "STR"
  ),
  [FEATS.MOUNTED_COMBATANT]: defineSingleAbilityChoice(
    "mountedCombatant",
    "Mounted Combatant",
    ["STR", "DEX", "WIS"],
    "STR"
  ),
  [FEATS.PIERCER]: defineSingleAbilityChoice("piercer", "Piercer", ["STR", "DEX"], "STR"),
  [FEATS.POISONER]: defineSingleAbilityChoice("poisoner", "Poisoner", ["DEX", "INT"], "DEX"),
  [FEATS.POLEARM_MASTER]: defineSingleAbilityChoice(
    "polearmMaster",
    "Polearm Master",
    ["DEX", "STR"],
    "DEX"
  ),
  [FEATS.SENTINEL]: defineSingleAbilityChoice("sentinel", "Sentinel", ["STR", "DEX"], "STR"),
  [FEATS.SLASHER]: defineSingleAbilityChoice("slasher", "Slasher", ["STR", "DEX"], "STR"),
  [FEATS.SPELL_SNIPER]: defineSingleAbilityChoice(
    "spellSniper",
    "Spell Sniper",
    ["INT", "WIS", "CHA"],
    "INT"
  ),
  [FEATS.TELEKINETIC]: defineSingleAbilityChoice(
    "telekinetic",
    "Telekinetic",
    ["INT", "WIS", "CHA"],
    "INT"
  ),
  [FEATS.TELEPATHIC]: defineSingleAbilityChoice(
    "telepathic",
    "Telepathic",
    ["INT", "WIS", "CHA"],
    "INT"
  ),
  [FEATS.WAR_CASTER]: defineSingleAbilityChoice(
    "warCaster",
    "War Caster",
    ["INT", "WIS", "CHA"],
    "INT"
  ),
  [FEATS.SPEEDY]: defineSingleAbilityChoice("speedy", "Speedy", ["DEX", "CON"], "DEX"),
  [FEATS.BOON_OF_IRRESISTIBLE_OFFENSE]: defineSingleAbilityChoice(
    "boonOfIrresistibleOffense",
    "Boon of Irresistible Offense",
    ["STR", "DEX"],
    "STR",
    30
  )
};
export type SingleAbilityFeat = keyof typeof singleAbilityChoices;
export function getSingleAbilityChoiceSummary(
  choice?: { ability: AbilityKey } | null
): string | null {
  return choice ? `${choice.ability} +1` : null;
}
