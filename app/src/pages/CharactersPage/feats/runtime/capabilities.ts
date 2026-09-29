import { FEATS } from "../../../../codex/entries/enums";

export type FeatRuntimeCapability =
  | "abilityBonus"
  | "actionCard"
  | "armorClass"
  | "choice"
  | "commonActionTransform"
  | "deathSave"
  | "discount"
  | "freeCast"
  | "hitPoints"
  | "itemDescription"
  | "proficiency"
  | "reaction"
  | "restRecovery"
  | "speed"
  | "spellGrant"
  | "spellTransform"
  | "status"
  | "weaponActionTransform";

export type FeatRuntimeCapabilityDescriptor = {
  feat: FEATS;
  capabilities: readonly FeatRuntimeCapability[];
};

export const featRuntimeCapabilityMatrix = {
  [FEATS.ABILITY_SCORE_IMPROVEMENT]: {
    feat: FEATS.ABILITY_SCORE_IMPROVEMENT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.ACTOR]: { feat: FEATS.ACTOR, capabilities: ["abilityBonus", "status"] },
  [FEATS.ALERT]: { feat: FEATS.ALERT, capabilities: [] },
  [FEATS.ARCHERY]: {
    feat: FEATS.ARCHERY,
    capabilities: ["weaponActionTransform"]
  },
  [FEATS.ATHLETE]: {
    feat: FEATS.ATHLETE,
    capabilities: ["abilityBonus", "choice", "speed", "commonActionTransform"]
  },
  [FEATS.BLESSED_WARRIOR]: {
    feat: FEATS.BLESSED_WARRIOR,
    capabilities: ["choice", "spellGrant"]
  },
  [FEATS.BLIND_FIGHTING]: { feat: FEATS.BLIND_FIGHTING, capabilities: ["status"] },
  [FEATS.BOON_OF_COMBAT_PROWESS]: {
    feat: FEATS.BOON_OF_COMBAT_PROWESS,
    capabilities: ["abilityBonus", "choice", "weaponActionTransform"]
  },
  [FEATS.BOON_OF_DIMENSIONAL_TRAVEL]: {
    feat: FEATS.BOON_OF_DIMENSIONAL_TRAVEL,
    capabilities: ["abilityBonus", "choice", "commonActionTransform", "spellTransform"]
  },
  [FEATS.BOON_OF_ENERGY_RESISTANCE]: {
    feat: FEATS.BOON_OF_ENERGY_RESISTANCE,
    capabilities: ["abilityBonus", "choice", "reaction", "status"]
  },
  [FEATS.BOON_OF_FATE]: {
    feat: FEATS.BOON_OF_FATE,
    capabilities: ["abilityBonus", "actionCard", "choice", "restRecovery"]
  },
  [FEATS.BOON_OF_FORTITUDE]: {
    feat: FEATS.BOON_OF_FORTITUDE,
    capabilities: ["abilityBonus", "choice", "hitPoints"]
  },
  [FEATS.BOON_OF_IRRESISTIBLE_OFFENSE]: {
    feat: FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
    capabilities: ["abilityBonus", "choice", "spellTransform", "weaponActionTransform"]
  },
  [FEATS.BOON_OF_RECOVERY]: {
    feat: FEATS.BOON_OF_RECOVERY,
    capabilities: ["abilityBonus", "actionCard", "choice", "restRecovery"]
  },
  [FEATS.BOON_OF_SKILL]: {
    feat: FEATS.BOON_OF_SKILL,
    capabilities: ["abilityBonus", "choice", "proficiency"]
  },
  [FEATS.BOON_OF_SPEED]: {
    feat: FEATS.BOON_OF_SPEED,
    capabilities: ["abilityBonus", "choice", "commonActionTransform", "speed"]
  },
  [FEATS.BOON_OF_THE_NIGHT_SPIRIT]: {
    feat: FEATS.BOON_OF_THE_NIGHT_SPIRIT,
    capabilities: ["abilityBonus", "choice", "status"]
  },
  [FEATS.BOON_OF_SPELL_RECALL]: {
    feat: FEATS.BOON_OF_SPELL_RECALL,
    capabilities: ["abilityBonus", "choice", "freeCast", "spellTransform"]
  },
  [FEATS.BOON_OF_TRUESIGHT]: {
    feat: FEATS.BOON_OF_TRUESIGHT,
    capabilities: ["abilityBonus", "choice", "status"]
  },
  [FEATS.CHARGER]: {
    feat: FEATS.CHARGER,
    capabilities: ["abilityBonus", "choice", "commonActionTransform", "weaponActionTransform"]
  },
  [FEATS.CHEF]: {
    feat: FEATS.CHEF,
    capabilities: ["abilityBonus", "choice", "proficiency", "restRecovery"]
  },
  [FEATS.CRAFTER]: {
    feat: FEATS.CRAFTER,
    capabilities: ["choice", "discount", "itemDescription", "proficiency"]
  },
  [FEATS.CROSSBOW_EXPERT]: {
    feat: FEATS.CROSSBOW_EXPERT,
    capabilities: ["abilityBonus", "weaponActionTransform"]
  },
  [FEATS.CRUSHER]: {
    feat: FEATS.CRUSHER,
    capabilities: ["abilityBonus", "choice", "weaponActionTransform"]
  },
  [FEATS.CULT_OF_THE_DRAGON_INITIATE]: {
    feat: FEATS.CULT_OF_THE_DRAGON_INITIATE,
    capabilities: ["actionCard", "choice", "proficiency", "restRecovery"]
  },
  [FEATS.DEFENSE]: { feat: FEATS.DEFENSE, capabilities: ["armorClass"] },
  [FEATS.DEFENSIVE_DUELIST]: {
    feat: FEATS.DEFENSIVE_DUELIST,
    capabilities: ["abilityBonus", "reaction"]
  },
  [FEATS.DRUIDIC_WARRIOR]: {
    feat: FEATS.DRUIDIC_WARRIOR,
    capabilities: ["choice", "spellGrant"]
  },
  [FEATS.DUAL_WIELDER]: {
    feat: FEATS.DUAL_WIELDER,
    capabilities: ["abilityBonus", "choice", "weaponActionTransform"]
  },
  [FEATS.DUELING]: {
    feat: FEATS.DUELING,
    capabilities: ["weaponActionTransform"]
  },
  [FEATS.DURABLE]: {
    feat: FEATS.DURABLE,
    capabilities: ["abilityBonus", "actionCard", "deathSave"]
  },
  [FEATS.ELEMENTAL_ADEPT]: {
    feat: FEATS.ELEMENTAL_ADEPT,
    capabilities: ["abilityBonus", "choice", "spellTransform"]
  },
  [FEATS.EMERALD_ENCLAVE_FLEDGLING]: {
    feat: FEATS.EMERALD_ENCLAVE_FLEDGLING,
    capabilities: ["choice", "commonActionTransform", "freeCast", "spellGrant", "spellTransform"]
  },
  [FEATS.FEY_TOUCHED]: {
    feat: FEATS.FEY_TOUCHED,
    capabilities: [
      "abilityBonus",
      "choice",
      "freeCast",
      "restRecovery",
      "spellGrant",
      "spellTransform"
    ]
  },
  [FEATS.GRAPPLER]: { feat: FEATS.GRAPPLER, capabilities: ["abilityBonus", "choice"] },
  [FEATS.GREAT_WEAPON_FIGHTING]: {
    feat: FEATS.GREAT_WEAPON_FIGHTING,
    capabilities: ["weaponActionTransform"]
  },
  [FEATS.GREAT_WEAPON_MASTER]: {
    feat: FEATS.GREAT_WEAPON_MASTER,
    capabilities: ["abilityBonus", "weaponActionTransform"]
  },
  [FEATS.HARPER_AGENT]: {
    feat: FEATS.HARPER_AGENT,
    capabilities: ["choice", "commonActionTransform", "proficiency"]
  },
  [FEATS.HEALER]: {
    feat: FEATS.HEALER,
    capabilities: ["itemDescription"]
  },
  [FEATS.HEAVILY_ARMORED]: {
    feat: FEATS.HEAVILY_ARMORED,
    capabilities: ["abilityBonus", "choice", "proficiency"]
  },
  [FEATS.HEAVY_ARMOR_MASTER]: {
    feat: FEATS.HEAVY_ARMOR_MASTER,
    capabilities: ["abilityBonus", "choice", "status"]
  },
  [FEATS.INSPIRING_LEADER]: {
    feat: FEATS.INSPIRING_LEADER,
    capabilities: ["abilityBonus", "choice", "restRecovery"]
  },
  [FEATS.INTERCEPTION]: { feat: FEATS.INTERCEPTION, capabilities: ["reaction"] },
  [FEATS.KEEN_MIND]: {
    feat: FEATS.KEEN_MIND,
    capabilities: ["abilityBonus", "commonActionTransform", "choice", "proficiency"]
  },
  [FEATS.LIGHTLY_ARMORED]: {
    feat: FEATS.LIGHTLY_ARMORED,
    capabilities: ["abilityBonus", "choice", "proficiency"]
  },
  [FEATS.LORDS_ALLIANCE_AGENT]: {
    feat: FEATS.LORDS_ALLIANCE_AGENT,
    capabilities: ["status"]
  },
  [FEATS.LUCKY]: {
    feat: FEATS.LUCKY,
    capabilities: ["actionCard", "restRecovery"]
  },
  [FEATS.MAGE_SLAYER]: {
    feat: FEATS.MAGE_SLAYER,
    capabilities: ["abilityBonus", "choice", "restRecovery", "spellTransform", "status"]
  },
  [FEATS.MAGIC_INITIATE]: {
    feat: FEATS.MAGIC_INITIATE,
    capabilities: ["choice", "freeCast", "restRecovery", "spellGrant"]
  },
  [FEATS.MARTIAL_WEAPON_TRAINING]: {
    feat: FEATS.MARTIAL_WEAPON_TRAINING,
    capabilities: ["abilityBonus", "choice", "proficiency"]
  },
  [FEATS.MEDIUM_ARMOR_MASTER]: {
    feat: FEATS.MEDIUM_ARMOR_MASTER,
    capabilities: ["abilityBonus", "armorClass", "choice"]
  },
  [FEATS.MODERATELY_ARMORED]: {
    feat: FEATS.MODERATELY_ARMORED,
    capabilities: ["abilityBonus", "choice", "proficiency"]
  },
  [FEATS.MOUNTED_COMBATANT]: {
    feat: FEATS.MOUNTED_COMBATANT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.MUSICIAN]: {
    feat: FEATS.MUSICIAN,
    capabilities: ["choice", "proficiency", "restRecovery"]
  },
  [FEATS.OBSERVANT]: {
    feat: FEATS.OBSERVANT,
    capabilities: ["abilityBonus", "commonActionTransform", "choice", "proficiency"]
  },
  [FEATS.PIERCER]: {
    feat: FEATS.PIERCER,
    capabilities: ["abilityBonus", "choice", "spellTransform", "weaponActionTransform"]
  },
  [FEATS.POISONER]: {
    feat: FEATS.POISONER,
    capabilities: [
      "abilityBonus",
      "choice",
      "itemDescription",
      "proficiency",
      "spellTransform",
      "weaponActionTransform"
    ]
  },
  [FEATS.POLEARM_MASTER]: {
    feat: FEATS.POLEARM_MASTER,
    capabilities: ["abilityBonus", "choice", "reaction", "weaponActionTransform"]
  },
  [FEATS.PROTECTION]: { feat: FEATS.PROTECTION, capabilities: ["reaction"] },
  [FEATS.PURPLE_DRAGON_ROOK]: {
    feat: FEATS.PURPLE_DRAGON_ROOK,
    capabilities: ["choice", "proficiency", "restRecovery"]
  },
  [FEATS.RESILIENT]: {
    feat: FEATS.RESILIENT,
    capabilities: ["abilityBonus", "choice", "proficiency"]
  },
  [FEATS.RITUAL_CASTER]: {
    feat: FEATS.RITUAL_CASTER,
    capabilities: [
      "abilityBonus",
      "choice",
      "freeCast",
      "restRecovery",
      "spellGrant",
      "spellTransform"
    ]
  },
  [FEATS.SAVAGE_ATTACKER]: {
    feat: FEATS.SAVAGE_ATTACKER,
    capabilities: ["weaponActionTransform"]
  },
  [FEATS.SENTINEL]: {
    feat: FEATS.SENTINEL,
    capabilities: ["abilityBonus", "choice", "status"]
  },
  [FEATS.SHADOW_TOUCHED]: {
    feat: FEATS.SHADOW_TOUCHED,
    capabilities: [
      "abilityBonus",
      "choice",
      "freeCast",
      "restRecovery",
      "spellGrant",
      "spellTransform"
    ]
  },
  [FEATS.SHARPSHOOTER]: {
    feat: FEATS.SHARPSHOOTER,
    capabilities: ["abilityBonus", "weaponActionTransform"]
  },
  [FEATS.SHIELD_MASTER]: {
    feat: FEATS.SHIELD_MASTER,
    capabilities: ["abilityBonus", "reaction", "weaponActionTransform"]
  },
  [FEATS.SKILL_EXPERT]: {
    feat: FEATS.SKILL_EXPERT,
    capabilities: ["abilityBonus", "choice", "proficiency"]
  },
  [FEATS.SKILLED]: {
    feat: FEATS.SKILLED,
    capabilities: ["choice", "proficiency"]
  },
  [FEATS.SKULKER]: {
    feat: FEATS.SKULKER,
    capabilities: ["abilityBonus", "commonActionTransform", "status"]
  },
  [FEATS.SLASHER]: {
    feat: FEATS.SLASHER,
    capabilities: ["abilityBonus", "choice", "weaponActionTransform"]
  },
  [FEATS.SPEEDY]: {
    feat: FEATS.SPEEDY,
    capabilities: ["abilityBonus", "choice", "commonActionTransform", "speed", "status"]
  },
  [FEATS.SPELLFIRE_SPARK]: {
    feat: FEATS.SPELLFIRE_SPARK,
    capabilities: ["choice", "restRecovery", "spellGrant", "spellTransform", "status"]
  },
  [FEATS.SPELL_SNIPER]: {
    feat: FEATS.SPELL_SNIPER,
    capabilities: ["abilityBonus", "choice", "spellTransform"]
  },
  [FEATS.TAVERN_BRAWLER]: {
    feat: FEATS.TAVERN_BRAWLER,
    capabilities: ["weaponActionTransform"]
  },
  [FEATS.TELEKINETIC]: {
    feat: FEATS.TELEKINETIC,
    capabilities: ["abilityBonus", "actionCard", "choice", "spellGrant", "spellTransform"]
  },
  [FEATS.TELEPATHIC]: {
    feat: FEATS.TELEPATHIC,
    capabilities: [
      "abilityBonus",
      "choice",
      "freeCast",
      "restRecovery",
      "spellGrant",
      "spellTransform",
      "status"
    ]
  },
  [FEATS.THROWN_WEAPON_FIGHTING]: {
    feat: FEATS.THROWN_WEAPON_FIGHTING,
    capabilities: ["weaponActionTransform"]
  },
  [FEATS.TOUGH]: { feat: FEATS.TOUGH, capabilities: ["hitPoints"] },
  [FEATS.TYRO_OF_THE_GAUNTLET]: {
    feat: FEATS.TYRO_OF_THE_GAUNTLET,
    capabilities: ["commonActionTransform", "reaction"]
  },
  [FEATS.TWO_WEAPON_FIGHTING]: {
    feat: FEATS.TWO_WEAPON_FIGHTING,
    capabilities: ["weaponActionTransform"]
  },
  [FEATS.UNARMED_FIGHTING]: {
    feat: FEATS.UNARMED_FIGHTING,
    capabilities: ["weaponActionTransform"]
  },
  [FEATS.WAR_CASTER]: {
    feat: FEATS.WAR_CASTER,
    capabilities: ["abilityBonus", "choice", "reaction", "spellTransform"]
  },
  [FEATS.WEAPON_MASTER]: {
    feat: FEATS.WEAPON_MASTER,
    capabilities: ["abilityBonus", "choice", "proficiency", "weaponActionTransform"]
  },
  [FEATS.BOON_OF_BLOODSHED]: {
    feat: FEATS.BOON_OF_BLOODSHED,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.BOON_OF_BOUNTIFUL_HEALTH]: {
    feat: FEATS.BOON_OF_BOUNTIFUL_HEALTH,
    capabilities: ["abilityBonus", "choice", "hitPoints", "restRecovery"]
  },
  [FEATS.BOON_OF_BRIGHT_SUN]: {
    feat: FEATS.BOON_OF_BRIGHT_SUN,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.BOON_OF_COMMUNICATION]: {
    feat: FEATS.BOON_OF_COMMUNICATION,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.BOON_OF_DESPERATE_RESILIENCE]: {
    feat: FEATS.BOON_OF_DESPERATE_RESILIENCE,
    capabilities: ["abilityBonus", "choice", "status"]
  },
  [FEATS.BOON_OF_EXQUISITE_RADIANCE]: {
    feat: FEATS.BOON_OF_EXQUISITE_RADIANCE,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.BOON_OF_FLUID_FORMS]: {
    feat: FEATS.BOON_OF_FLUID_FORMS,
    capabilities: ["abilityBonus", "actionCard", "choice", "restRecovery", "status"]
  },
  [FEATS.BOON_OF_FORTUNES_FAVOR]: {
    feat: FEATS.BOON_OF_FORTUNES_FAVOR,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.BOON_OF_FURIOUS_STORM]: {
    feat: FEATS.BOON_OF_FURIOUS_STORM,
    capabilities: ["abilityBonus", "choice", "status"]
  },
  [FEATS.BOON_OF_POISON_MASTERY]: {
    feat: FEATS.BOON_OF_POISON_MASTERY,
    capabilities: ["abilityBonus", "choice", "status"]
  },
  [FEATS.BOON_OF_REVELRY]: {
    feat: FEATS.BOON_OF_REVELRY,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.BOON_OF_SOUL_DRINKER]: {
    feat: FEATS.BOON_OF_SOUL_DRINKER,
    capabilities: ["abilityBonus", "choice", "reaction", "restRecovery", "status"]
  },
  [FEATS.BOON_OF_TERROR]: {
    feat: FEATS.BOON_OF_TERROR,
    capabilities: ["abilityBonus", "choice", "proficiency", "reaction", "status"]
  },
  [FEATS.COLD_CASTER]: {
    feat: FEATS.COLD_CASTER,
    capabilities: ["abilityBonus", "choice", "spellGrant", "spellTransform"]
  },
  [FEATS.DRAGONSCARRED]: {
    feat: FEATS.DRAGONSCARRED,
    capabilities: ["abilityBonus", "actionCard", "choice", "status"]
  },
  [FEATS.ENCLAVE_MAGIC]: {
    feat: FEATS.ENCLAVE_MAGIC,
    capabilities: ["abilityBonus", "choice", "restRecovery", "spellGrant"]
  },
  [FEATS.FAIRY_TRICKSTER]: {
    feat: FEATS.FAIRY_TRICKSTER,
    capabilities: ["abilityBonus", "actionCard", "choice", "commonActionTransform", "restRecovery"]
  },
  [FEATS.GENIE_MAGIC]: {
    feat: FEATS.GENIE_MAGIC,
    capabilities: ["abilityBonus", "actionCard", "choice", "restRecovery"]
  },
  [FEATS.HARPER_TEAMWORK]: {
    feat: FEATS.HARPER_TEAMWORK,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.LORDLY_RESOLVE]: {
    feat: FEATS.LORDLY_RESOLVE,
    capabilities: ["abilityBonus", "actionCard", "choice", "restRecovery", "status"]
  },
  [FEATS.MYTHAL_TOUCHED]: {
    feat: FEATS.MYTHAL_TOUCHED,
    capabilities: ["abilityBonus", "choice", "reaction", "restRecovery"]
  },
  [FEATS.ORDERS_RESILIENCE]: {
    feat: FEATS.ORDERS_RESILIENCE,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.PURPLE_DRAGON_COMMANDANT]: {
    feat: FEATS.PURPLE_DRAGON_COMMANDANT,
    capabilities: ["abilityBonus", "actionCard", "choice", "restRecovery", "weaponActionTransform"]
  },
  [FEATS.SPELLFIRE_ADEPT]: {
    feat: FEATS.SPELLFIRE_ADEPT,
    capabilities: ["abilityBonus", "choice", "spellTransform"]
  },
  [FEATS.STREET_JUSTICE]: {
    feat: FEATS.STREET_JUSTICE,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.ZHENTARIM_RUFFIAN]: {
    feat: FEATS.ZHENTARIM_RUFFIAN,
    capabilities: ["status"]
  },
  [FEATS.ZHENTARIM_TACTICS]: {
    feat: FEATS.ZHENTARIM_TACTICS,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.ABERRANT_ANATOMY]: {
    feat: FEATS.ABERRANT_ANATOMY,
    capabilities: []
  },
  [FEATS.ABJURATION_ADEPT]: {
    feat: FEATS.ABJURATION_ADEPT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.ARCANE_ARTIST]: {
    feat: FEATS.ARCANE_ARTIST,
    capabilities: []
  },
  [FEATS.ARCANE_ELOQUENCE]: {
    feat: FEATS.ARCANE_ELOQUENCE,
    capabilities: []
  },
  [FEATS.ARCANE_INFILTRATOR]: {
    feat: FEATS.ARCANE_INFILTRATOR,
    capabilities: []
  },
  [FEATS.ARCANE_OMENS]: {
    feat: FEATS.ARCANE_OMENS,
    capabilities: []
  },
  [FEATS.ARCANE_OVERLOAD]: {
    feat: FEATS.ARCANE_OVERLOAD,
    capabilities: []
  },
  [FEATS.ARCANE_SAFEGUARD]: {
    feat: FEATS.ARCANE_SAFEGUARD,
    capabilities: []
  },
  [FEATS.ARCANE_UNDERTAKER]: {
    feat: FEATS.ARCANE_UNDERTAKER,
    capabilities: []
  },
  [FEATS.ARCANE_WARRIOR]: {
    feat: FEATS.ARCANE_WARRIOR,
    capabilities: []
  },
  [FEATS.BOON_OF_ERUPTING_SPELLPOWER]: {
    feat: FEATS.BOON_OF_ERUPTING_SPELLPOWER,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.BOON_OF_MAGIC_SCHOOL_MASTERY]: {
    feat: FEATS.BOON_OF_MAGIC_SCHOOL_MASTERY,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.BOON_OF_THE_IRON_MIND]: {
    feat: FEATS.BOON_OF_THE_IRON_MIND,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.CONJURATION_ADEPT]: {
    feat: FEATS.CONJURATION_ADEPT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.DIVINATION_ADEPT]: {
    feat: FEATS.DIVINATION_ADEPT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.ECHOING_SOUL]: {
    feat: FEATS.ECHOING_SOUL,
    capabilities: []
  },
  [FEATS.ELEMENTAL_FAMILIAR]: {
    feat: FEATS.ELEMENTAL_FAMILIAR,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.ENCHANTMENT_ADEPT]: {
    feat: FEATS.ENCHANTMENT_ADEPT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.EVOCATION_ADEPT]: {
    feat: FEATS.EVOCATION_ADEPT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.FAMILIAR_FRIEND]: {
    feat: FEATS.FAMILIAR_FRIEND,
    capabilities: []
  },
  [FEATS.GATHERED_WHISPERS]: {
    feat: FEATS.GATHERED_WHISPERS,
    capabilities: []
  },
  [FEATS.ILLUSION_ADEPT]: {
    feat: FEATS.ILLUSION_ADEPT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.LIVING_SHADOW]: {
    feat: FEATS.LIVING_SHADOW,
    capabilities: []
  },
  [FEATS.MAGIC_CONNOISSEUR]: {
    feat: FEATS.MAGIC_CONNOISSEUR,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.MIST_WALKER]: {
    feat: FEATS.MIST_WALKER,
    capabilities: []
  },
  [FEATS.NECROMANCY_ADEPT]: {
    feat: FEATS.NECROMANCY_ADEPT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.OTHERWORLDLY_FAMILIAR]: {
    feat: FEATS.OTHERWORLDLY_FAMILIAR,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.PORTAL_JUMPER]: {
    feat: FEATS.PORTAL_JUMPER,
    capabilities: []
  },
  [FEATS.SECOND_SKIN]: {
    feat: FEATS.SECOND_SKIN,
    capabilities: []
  },
  [FEATS.SHARP_EYE]: {
    feat: FEATS.SHARP_EYE,
    capabilities: []
  },
  [FEATS.SOOTHING_FAMILIAR]: {
    feat: FEATS.SOOTHING_FAMILIAR,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.SPELL_RESISTANT]: {
    feat: FEATS.SPELL_RESISTANT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.SPELL_SUBTERFUGE]: {
    feat: FEATS.SPELL_SUBTERFUGE,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.SURVIVOR]: {
    feat: FEATS.SURVIVOR,
    capabilities: []
  },
  [FEATS.SYMBIOTIC_BEING]: {
    feat: FEATS.SYMBIOTIC_BEING,
    capabilities: []
  },
  [FEATS.TOUCH_OF_DEATH]: {
    feat: FEATS.TOUCH_OF_DEATH,
    capabilities: []
  },
  [FEATS.TRANSMUTATION_ADEPT]: {
    feat: FEATS.TRANSMUTATION_ADEPT,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.TRANSMUTED_ANATOMY]: {
    feat: FEATS.TRANSMUTED_ANATOMY,
    capabilities: []
  },
  [FEATS.WARLIKE_FAMILIAR]: {
    feat: FEATS.WARLIKE_FAMILIAR,
    capabilities: ["abilityBonus", "choice"]
  },
  [FEATS.WATCHERS]: {
    feat: FEATS.WATCHERS,
    capabilities: []
  }
} as const satisfies Record<FEATS, FeatRuntimeCapabilityDescriptor>;
