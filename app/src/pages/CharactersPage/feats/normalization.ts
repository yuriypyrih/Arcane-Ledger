import {
  CLASS_FEATURE,
  ELDRITCH_INVOCATION,
  FEATS,
  getEldritchInvocationEntryById
} from "../../../codex/entries";
import type {
  AthleteChoice,
  BlessedWarriorChoice,
  CharacterFeatEntry,
  ChargerChoice,
  ChefChoice,
  CrusherChoice,
  CultOfDragonInitiateChoice,
  DualWielderChoice,
  ElementalAdeptChoice,
  CrafterChoice,
  DruidicWarriorChoice,
  EmeraldEnclaveFledglingChoice,
  FeyTouchedChoice,
  HeavilyArmoredChoice,
  HeavyArmorMasterChoice,
  InspiringLeaderChoice,
  KeenMindChoice,
  LightlyArmoredChoice,
  MageSlayerChoice,
  MartialWeaponTrainingChoice,
  MediumArmorMasterChoice,
  ModeratelyArmoredChoice,
  MountedCombatantChoice,
  ObservantChoice,
  PiercerChoice,
  PoisonerChoice,
  PolearmMasterChoice,
  RitualCasterChoice,
  ResilientChoice,
  SentinelChoice,
  ShadowTouchedChoice,
  SlasherChoice,
  SpellSniperChoice,
  TelekineticChoice,
  TelepathicChoice,
  WarCasterChoice,
  SkillExpertChoice,
  SpeedyChoice,
  WeaponMasterChoice,
  LuckyChoice,
  MagicInitiateChoice,
  MusicianChoice
} from "../../../types";
import type {
  AbilityScoreImprovementChoice,
  BoonOfEnergyResistanceChoice,
  BoonOfFateState,
  BoonOfIrresistibleOffenseChoice,
  BoonOfRecoveryState,
  BoonOfSkillChoice,
  CharacterFeatSource,
  EpicBoonAbilityChoice,
  SkilledChoice
} from "../../../types/feats";
import { formatCodexLabel } from "../../../utils/codex";
import {
  epicBoonAbilityIncreaseFeatOptions,
  normalizeAbilityScoreImprovementChoice,
  normalizeAthleteChoice,
  normalizeBlessedWarriorChoice,
  normalizeBoonOfEnergyResistanceChoice,
  normalizeBoonOfIrresistibleOffenseChoice,
  normalizeBoonOfSkillChoice,
  normalizeChargerChoice,
  normalizeChefChoice,
  normalizeCrusherChoice,
  normalizeCultOfDragonInitiateChoice,
  normalizeDualWielderChoice,
  normalizeEmeraldEnclaveFledglingChoice,
  normalizeElementalAdeptChoice,
  normalizeDruidicWarriorChoice,
  normalizeEpicBoonAbilityChoice,
  normalizeFeyTouchedChoice,
  normalizeHeavilyArmoredChoice,
  normalizeHeavyArmorMasterChoice,
  normalizeInspiringLeaderChoice,
  normalizeKeenMindChoice,
  normalizeLightlyArmoredChoice,
  normalizeMageSlayerChoice,
  normalizeMartialWeaponTrainingChoice,
  normalizeMediumArmorMasterChoice,
  normalizeModeratelyArmoredChoice,
  normalizeMountedCombatantChoice,
  normalizeObservantChoice,
  normalizePiercerChoice,
  normalizePoisonerChoice,
  normalizePolearmMasterChoice,
  normalizeRitualCasterChoice,
  normalizeResilientChoice,
  normalizeSentinelChoice,
  normalizeShadowTouchedChoice,
  normalizeSlasherChoice,
  normalizeSpellSniperChoice,
  normalizeTelekineticChoice,
  normalizeTelepathicChoice,
  normalizeWarCasterChoice,
  normalizeSkillExpertChoice,
  normalizeSpeedyChoice,
  normalizeWeaponMasterChoice,
  normalizeLuckyChoice,
  normalizeMagicInitiateChoice,
  normalizeMusicianChoice,
  normalizeSkilledChoice
} from "./choices";
import { normalizeCrafterChoice } from "./crafter";
import { featDefinitions } from "./definitions";

const deprecatedSubclassPlaceholderFeatures = new Set<CLASS_FEATURE>([
  CLASS_FEATURE.ARTIFICER_SUBCLASS,
  CLASS_FEATURE.BARBARIAN_SUBCLASS,
  CLASS_FEATURE.BARD_SUBCLASS,
  CLASS_FEATURE.CLERIC_SUBCLASS,
  CLASS_FEATURE.DRUID_SUBCLASS,
  CLASS_FEATURE.FIGHTER_SUBCLASS,
  CLASS_FEATURE.MONK_SUBCLASS,
  CLASS_FEATURE.PALADIN_SUBCLASS,
  CLASS_FEATURE.RANGER_SUBCLASS,
  CLASS_FEATURE.ROGUE_SUBCLASS,
  CLASS_FEATURE.SORCERER_SUBCLASS,
  CLASS_FEATURE.WARLOCK_SUBCLASS,
  CLASS_FEATURE.WIZARD_SUBCLASS,
  CLASS_FEATURE.SUBCLASS_FEATURE
]);

const featValues = Object.values(FEATS);
const featValueSet = new Set<string>(featValues);
const eldritchInvocationValueSet = new Set<string>(Object.values(ELDRITCH_INVOCATION));

function normalizeFeatLookupKey(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/['’]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const featLookupByNormalizedKey = new Map<string, FEATS>();

featValues.forEach((feat) => {
  featLookupByNormalizedKey.set(normalizeFeatLookupKey(feat), feat);
});

featDefinitions.forEach((definition) => {
  featLookupByNormalizedKey.set(normalizeFeatLookupKey(definition.label), definition.feat);
});

function clampFeatLevel(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.min(20, Math.floor(parsed)));
}

function normalizeCharacterFeatSource(value: unknown, takenAtLevel: number): CharacterFeatSource {
  if (!value || typeof value !== "object") {
    return {
      type: "manual"
    };
  }

  const record = value as Partial<CharacterFeatSource>;

  if (record.type === "background") {
    return typeof record.background === "string" && record.background.trim().length > 0
      ? {
          type: "background",
          background: record.background.trim()
        }
      : {
          type: "manual"
        };
  }

  if (record.type === "species") {
    return typeof record.species === "string" && record.species.trim().length > 0
      ? {
          type: "species",
          species: record.species.trim()
        }
      : {
          type: "manual"
        };
  }

  if (record.type === "class-feature") {
    if (typeof record.feature !== "string") {
      return {
        type: "manual"
      };
    }

    if (deprecatedSubclassPlaceholderFeatures.has(record.feature as CLASS_FEATURE)) {
      return {
        type: "manual"
      };
    }

    return {
      type: "class-feature",
      feature: record.feature as CLASS_FEATURE,
      level: clampFeatLevel(record.level, takenAtLevel)
    };
  }

  if (record.type === "eldritch-invocation") {
    if (
      typeof record.invocation === "string" &&
      eldritchInvocationValueSet.has(record.invocation) &&
      typeof record.selectionId === "string" &&
      record.selectionId.trim().length > 0
    ) {
      return {
        type: "eldritch-invocation",
        invocation: record.invocation as ELDRITCH_INVOCATION,
        selectionId: record.selectionId.trim()
      };
    }

    return {
      type: "manual"
    };
  }

  return {
    type: "manual"
  };
}

function createFeatEntryId(feat: FEATS): string {
  return `${feat}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resolveFeatValue(value: unknown): FEATS | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (featValueSet.has(trimmedValue)) {
    return trimmedValue as FEATS;
  }

  return featLookupByNormalizedKey.get(normalizeFeatLookupKey(trimmedValue)) ?? null;
}

function getRawFeatEntries(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getRawFeatValue(rawEntry: unknown): unknown {
  if (!rawEntry || typeof rawEntry !== "object") {
    return null;
  }

  const record = rawEntry as Record<string, unknown>;

  return record.feat;
}

export function normalizeCharacterFeats(
  value: unknown,
  currentLevel: number
): CharacterFeatEntry[] {
  const rawEntries = getRawFeatEntries(value);

  if (rawEntries.length === 0) {
    return [];
  }

  return rawEntries.flatMap((rawEntry, index): CharacterFeatEntry[] => {
    if (!rawEntry || typeof rawEntry !== "object") {
      const feat = resolveFeatValue(rawEntry);

      if (!feat) {
        return [];
      }

      return [
        {
          id: `${createFeatEntryId(feat)}-${index}`,
          feat,
          takenAtLevel: clampFeatLevel(undefined, currentLevel),
          source: {
            type: "manual"
          }
        }
      ];
    }

    const record = rawEntry as Partial<CharacterFeatEntry>;
    const feat = resolveFeatValue(getRawFeatValue(rawEntry));

    if (!feat) {
      return [];
    }

    const abilityScoreImprovement =
      feat === FEATS.ABILITY_SCORE_IMPROVEMENT
        ? normalizeAbilityScoreImprovementChoice(record.abilityScoreImprovement)
        : undefined;
    const boonOfIrresistibleOffense =
      feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE
        ? normalizeBoonOfIrresistibleOffenseChoice(record.boonOfIrresistibleOffense)
        : undefined;
    const boonOfEnergyResistance =
      feat === FEATS.BOON_OF_ENERGY_RESISTANCE
        ? normalizeBoonOfEnergyResistanceChoice(record.boonOfEnergyResistance)
        : undefined;
    const boonOfFate =
      feat === FEATS.BOON_OF_FATE && record.boonOfFate
        ? {
            improveFateExpended: record.boonOfFate.improveFateExpended === true ? true : undefined
          }
        : undefined;
    const boonOfRecovery =
      feat === FEATS.BOON_OF_RECOVERY && record.boonOfRecovery
        ? {
            recoverVitalityDiceExpended: Math.max(
              0,
              Math.min(
                10,
                Math.floor(Number(record.boonOfRecovery.recoverVitalityDiceExpended) || 0)
              )
            )
          }
        : undefined;
    const boonOfSkill =
      feat === FEATS.BOON_OF_SKILL ? normalizeBoonOfSkillChoice(record.boonOfSkill) : undefined;
    const athlete = feat === FEATS.ATHLETE ? normalizeAthleteChoice(record.athlete) : undefined;
    const charger = feat === FEATS.CHARGER ? normalizeChargerChoice(record.charger) : undefined;
    const chef = feat === FEATS.CHEF ? normalizeChefChoice(record.chef) : undefined;
    const crusher = feat === FEATS.CRUSHER ? normalizeCrusherChoice(record.crusher) : undefined;
    const dualWielder =
      feat === FEATS.DUAL_WIELDER ? normalizeDualWielderChoice(record.dualWielder) : undefined;
    const elementalAdept =
      feat === FEATS.ELEMENTAL_ADEPT
        ? normalizeElementalAdeptChoice(record.elementalAdept)
        : undefined;
    const feyTouched =
      feat === FEATS.FEY_TOUCHED ? normalizeFeyTouchedChoice(record.feyTouched) : undefined;
    const heavilyArmored =
      feat === FEATS.HEAVILY_ARMORED
        ? normalizeHeavilyArmoredChoice(record.heavilyArmored)
        : undefined;
    const heavyArmorMaster =
      feat === FEATS.HEAVY_ARMOR_MASTER
        ? normalizeHeavyArmorMasterChoice(record.heavyArmorMaster)
        : undefined;
    const inspiringLeader =
      feat === FEATS.INSPIRING_LEADER
        ? normalizeInspiringLeaderChoice(record.inspiringLeader)
        : undefined;
    const keenMind =
      feat === FEATS.KEEN_MIND ? normalizeKeenMindChoice(record.keenMind) : undefined;
    const lightlyArmored =
      feat === FEATS.LIGHTLY_ARMORED
        ? normalizeLightlyArmoredChoice(record.lightlyArmored)
        : undefined;
    const mageSlayer =
      feat === FEATS.MAGE_SLAYER ? normalizeMageSlayerChoice(record.mageSlayer) : undefined;
    const martialWeaponTraining =
      feat === FEATS.MARTIAL_WEAPON_TRAINING
        ? normalizeMartialWeaponTrainingChoice(record.martialWeaponTraining)
        : undefined;
    const mediumArmorMaster =
      feat === FEATS.MEDIUM_ARMOR_MASTER
        ? normalizeMediumArmorMasterChoice(record.mediumArmorMaster)
        : undefined;
    const moderatelyArmored =
      feat === FEATS.MODERATELY_ARMORED
        ? normalizeModeratelyArmoredChoice(record.moderatelyArmored)
        : undefined;
    const mountedCombatant =
      feat === FEATS.MOUNTED_COMBATANT
        ? normalizeMountedCombatantChoice(record.mountedCombatant)
        : undefined;
    const observant =
      feat === FEATS.OBSERVANT ? normalizeObservantChoice(record.observant) : undefined;
    const piercer = feat === FEATS.PIERCER ? normalizePiercerChoice(record.piercer) : undefined;
    const poisoner = feat === FEATS.POISONER ? normalizePoisonerChoice(record.poisoner) : undefined;
    const polearmMaster =
      feat === FEATS.POLEARM_MASTER
        ? normalizePolearmMasterChoice(record.polearmMaster)
        : undefined;
    const ritualCaster =
      feat === FEATS.RITUAL_CASTER ? normalizeRitualCasterChoice(record.ritualCaster) : undefined;
    const resilient =
      feat === FEATS.RESILIENT ? normalizeResilientChoice(record.resilient) : undefined;
    const sentinel = feat === FEATS.SENTINEL ? normalizeSentinelChoice(record.sentinel) : undefined;
    const shadowTouched =
      feat === FEATS.SHADOW_TOUCHED
        ? normalizeShadowTouchedChoice(record.shadowTouched)
        : undefined;
    const slasher = feat === FEATS.SLASHER ? normalizeSlasherChoice(record.slasher) : undefined;
    const spellSniper =
      feat === FEATS.SPELL_SNIPER ? normalizeSpellSniperChoice(record.spellSniper) : undefined;
    const telekinetic =
      feat === FEATS.TELEKINETIC ? normalizeTelekineticChoice(record.telekinetic) : undefined;
    const telepathic =
      feat === FEATS.TELEPATHIC ? normalizeTelepathicChoice(record.telepathic) : undefined;
    const warCaster =
      feat === FEATS.WAR_CASTER ? normalizeWarCasterChoice(record.warCaster) : undefined;
    const skillExpert =
      feat === FEATS.SKILL_EXPERT ? normalizeSkillExpertChoice(record.skillExpert) : undefined;
    const speedy = feat === FEATS.SPEEDY ? normalizeSpeedyChoice(record.speedy) : undefined;
    const weaponMaster =
      feat === FEATS.WEAPON_MASTER ? normalizeWeaponMasterChoice(record.weaponMaster) : undefined;
    const blessedWarrior =
      feat === FEATS.BLESSED_WARRIOR
        ? normalizeBlessedWarriorChoice(record.blessedWarrior)
        : undefined;
    const druidicWarrior =
      feat === FEATS.DRUIDIC_WARRIOR
        ? normalizeDruidicWarriorChoice(record.druidicWarrior)
        : undefined;
    const magicInitiate =
      feat === FEATS.MAGIC_INITIATE
        ? normalizeMagicInitiateChoice(record.magicInitiate)
        : undefined;
    const cultOfDragonInitiate =
      feat === FEATS.CULT_OF_THE_DRAGON_INITIATE
        ? normalizeCultOfDragonInitiateChoice(record.cultOfDragonInitiate)
        : undefined;
    const emeraldEnclaveFledgling =
      feat === FEATS.EMERALD_ENCLAVE_FLEDGLING
        ? normalizeEmeraldEnclaveFledglingChoice(record.emeraldEnclaveFledgling)
        : undefined;
    const crafter = feat === FEATS.CRAFTER ? normalizeCrafterChoice(record.crafter) : undefined;
    const epicBoonAbilityChoice = epicBoonAbilityIncreaseFeatOptions.has(feat)
      ? (normalizeEpicBoonAbilityChoice(feat, record.epicBoonAbilityChoice) ??
        (feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE && boonOfIrresistibleOffense
          ? { ability: boonOfIrresistibleOffense.ability }
          : undefined))
      : undefined;
    const skilled = feat === FEATS.SKILLED ? normalizeSkilledChoice(record.skilled) : undefined;
    const musician = feat === FEATS.MUSICIAN ? normalizeMusicianChoice(record.musician) : undefined;
    const lucky =
      feat === FEATS.LUCKY ? normalizeLuckyChoice(record.lucky, currentLevel) : undefined;

    return [
      {
        id:
          typeof record.id === "string" && record.id.trim().length > 0
            ? record.id.trim()
            : `${createFeatEntryId(feat)}-${index}`,
        feat,
        takenAtLevel: clampFeatLevel(record.takenAtLevel, currentLevel),
        source: normalizeCharacterFeatSource(
          record.source,
          clampFeatLevel(record.takenAtLevel, currentLevel)
        ),
        abilityScoreImprovement,
        athlete,
        charger,
        chef,
        crusher,
        dualWielder,
        elementalAdept,
        feyTouched,
        heavilyArmored,
        heavyArmorMaster,
        inspiringLeader,
        keenMind,
        lightlyArmored,
        mageSlayer,
        martialWeaponTraining,
        mediumArmorMaster,
        moderatelyArmored,
        mountedCombatant,
        observant,
        piercer,
        poisoner,
        polearmMaster,
        ritualCaster,
        resilient,
        sentinel,
        shadowTouched,
        slasher,
        spellSniper,
        telekinetic,
        telepathic,
        warCaster,
        skillExpert,
        speedy,
        weaponMaster,
        blessedWarrior,
        druidicWarrior,
        magicInitiate,
        cultOfDragonInitiate,
        emeraldEnclaveFledgling,
        crafter,
        boonOfEnergyResistance,
        boonOfFate,
        boonOfIrresistibleOffense,
        boonOfRecovery,
        boonOfSkill,
        epicBoonAbilityChoice,
        skilled,
        musician,
        lucky
      }
    ];
  });
}

export function createCharacterFeatEntry(
  feat: FEATS,
  takenAtLevel: number,
  options?: {
    source?: CharacterFeatSource;
    abilityScoreImprovement?: AbilityScoreImprovementChoice;
    athlete?: AthleteChoice;
    charger?: ChargerChoice;
    chef?: ChefChoice;
    crusher?: CrusherChoice;
    dualWielder?: DualWielderChoice;
    elementalAdept?: ElementalAdeptChoice;
    feyTouched?: FeyTouchedChoice;
    heavilyArmored?: HeavilyArmoredChoice;
    heavyArmorMaster?: HeavyArmorMasterChoice;
    inspiringLeader?: InspiringLeaderChoice;
    keenMind?: KeenMindChoice;
    lightlyArmored?: LightlyArmoredChoice;
    mageSlayer?: MageSlayerChoice;
    martialWeaponTraining?: MartialWeaponTrainingChoice;
    mediumArmorMaster?: MediumArmorMasterChoice;
    moderatelyArmored?: ModeratelyArmoredChoice;
    mountedCombatant?: MountedCombatantChoice;
    observant?: ObservantChoice;
    piercer?: PiercerChoice;
    poisoner?: PoisonerChoice;
    polearmMaster?: PolearmMasterChoice;
    ritualCaster?: RitualCasterChoice;
    resilient?: ResilientChoice;
    sentinel?: SentinelChoice;
    shadowTouched?: ShadowTouchedChoice;
    slasher?: SlasherChoice;
    spellSniper?: SpellSniperChoice;
    telekinetic?: TelekineticChoice;
    telepathic?: TelepathicChoice;
    warCaster?: WarCasterChoice;
    skillExpert?: SkillExpertChoice;
    speedy?: SpeedyChoice;
    weaponMaster?: WeaponMasterChoice;
    blessedWarrior?: BlessedWarriorChoice;
    druidicWarrior?: DruidicWarriorChoice;
    magicInitiate?: MagicInitiateChoice;
    cultOfDragonInitiate?: CultOfDragonInitiateChoice;
    emeraldEnclaveFledgling?: EmeraldEnclaveFledglingChoice;
    musician?: MusicianChoice;
    crafter?: CrafterChoice;
    boonOfEnergyResistance?: BoonOfEnergyResistanceChoice;
    boonOfFate?: BoonOfFateState;
    boonOfIrresistibleOffense?: BoonOfIrresistibleOffenseChoice;
    boonOfRecovery?: BoonOfRecoveryState;
    boonOfSkill?: BoonOfSkillChoice;
    epicBoonAbilityChoice?: EpicBoonAbilityChoice;
    skilled?: SkilledChoice;
    lucky?: LuckyChoice;
  }
): CharacterFeatEntry {
  return {
    id: createFeatEntryId(feat),
    feat,
    takenAtLevel: clampFeatLevel(takenAtLevel, takenAtLevel),
    source: options?.source ?? { type: "manual" },
    abilityScoreImprovement:
      feat === FEATS.ABILITY_SCORE_IMPROVEMENT ? options?.abilityScoreImprovement : undefined,
    athlete: feat === FEATS.ATHLETE ? options?.athlete : undefined,
    charger: feat === FEATS.CHARGER ? options?.charger : undefined,
    chef: feat === FEATS.CHEF ? options?.chef : undefined,
    crusher: feat === FEATS.CRUSHER ? options?.crusher : undefined,
    dualWielder: feat === FEATS.DUAL_WIELDER ? options?.dualWielder : undefined,
    elementalAdept: feat === FEATS.ELEMENTAL_ADEPT ? options?.elementalAdept : undefined,
    feyTouched: feat === FEATS.FEY_TOUCHED ? options?.feyTouched : undefined,
    heavilyArmored: feat === FEATS.HEAVILY_ARMORED ? options?.heavilyArmored : undefined,
    heavyArmorMaster: feat === FEATS.HEAVY_ARMOR_MASTER ? options?.heavyArmorMaster : undefined,
    inspiringLeader: feat === FEATS.INSPIRING_LEADER ? options?.inspiringLeader : undefined,
    keenMind: feat === FEATS.KEEN_MIND ? options?.keenMind : undefined,
    lightlyArmored: feat === FEATS.LIGHTLY_ARMORED ? options?.lightlyArmored : undefined,
    mageSlayer: feat === FEATS.MAGE_SLAYER ? options?.mageSlayer : undefined,
    martialWeaponTraining:
      feat === FEATS.MARTIAL_WEAPON_TRAINING ? options?.martialWeaponTraining : undefined,
    mediumArmorMaster: feat === FEATS.MEDIUM_ARMOR_MASTER ? options?.mediumArmorMaster : undefined,
    moderatelyArmored: feat === FEATS.MODERATELY_ARMORED ? options?.moderatelyArmored : undefined,
    mountedCombatant: feat === FEATS.MOUNTED_COMBATANT ? options?.mountedCombatant : undefined,
    observant: feat === FEATS.OBSERVANT ? options?.observant : undefined,
    piercer: feat === FEATS.PIERCER ? options?.piercer : undefined,
    poisoner: feat === FEATS.POISONER ? options?.poisoner : undefined,
    polearmMaster: feat === FEATS.POLEARM_MASTER ? options?.polearmMaster : undefined,
    ritualCaster: feat === FEATS.RITUAL_CASTER ? options?.ritualCaster : undefined,
    resilient: feat === FEATS.RESILIENT ? options?.resilient : undefined,
    sentinel: feat === FEATS.SENTINEL ? options?.sentinel : undefined,
    shadowTouched: feat === FEATS.SHADOW_TOUCHED ? options?.shadowTouched : undefined,
    slasher: feat === FEATS.SLASHER ? options?.slasher : undefined,
    spellSniper: feat === FEATS.SPELL_SNIPER ? options?.spellSniper : undefined,
    telekinetic: feat === FEATS.TELEKINETIC ? options?.telekinetic : undefined,
    telepathic: feat === FEATS.TELEPATHIC ? options?.telepathic : undefined,
    warCaster: feat === FEATS.WAR_CASTER ? options?.warCaster : undefined,
    skillExpert: feat === FEATS.SKILL_EXPERT ? options?.skillExpert : undefined,
    speedy: feat === FEATS.SPEEDY ? options?.speedy : undefined,
    weaponMaster: feat === FEATS.WEAPON_MASTER ? options?.weaponMaster : undefined,
    blessedWarrior: feat === FEATS.BLESSED_WARRIOR ? options?.blessedWarrior : undefined,
    druidicWarrior: feat === FEATS.DRUIDIC_WARRIOR ? options?.druidicWarrior : undefined,
    magicInitiate: feat === FEATS.MAGIC_INITIATE ? options?.magicInitiate : undefined,
    cultOfDragonInitiate:
      feat === FEATS.CULT_OF_THE_DRAGON_INITIATE ? options?.cultOfDragonInitiate : undefined,
    emeraldEnclaveFledgling:
      feat === FEATS.EMERALD_ENCLAVE_FLEDGLING
        ? options?.emeraldEnclaveFledgling
        : undefined,
    musician: feat === FEATS.MUSICIAN ? options?.musician : undefined,
    crafter: feat === FEATS.CRAFTER ? options?.crafter : undefined,
    boonOfEnergyResistance:
      feat === FEATS.BOON_OF_ENERGY_RESISTANCE ? options?.boonOfEnergyResistance : undefined,
    boonOfFate: feat === FEATS.BOON_OF_FATE ? options?.boonOfFate : undefined,
    boonOfIrresistibleOffense:
      feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE ? options?.boonOfIrresistibleOffense : undefined,
    boonOfRecovery: feat === FEATS.BOON_OF_RECOVERY ? options?.boonOfRecovery : undefined,
    boonOfSkill: feat === FEATS.BOON_OF_SKILL ? options?.boonOfSkill : undefined,
    epicBoonAbilityChoice: epicBoonAbilityIncreaseFeatOptions.has(feat)
      ? options?.epicBoonAbilityChoice
      : undefined,
    skilled: feat === FEATS.SKILLED ? options?.skilled : undefined,
    lucky: feat === FEATS.LUCKY ? options?.lucky : undefined
  };
}

export function getCharacterFeatSourceLabel(entry: CharacterFeatEntry): string {
  if (entry.source.type === "manual") {
    return "MANUAL";
  }

  if (entry.source.type === "background") {
    return `Background: ${entry.source.background}`;
  }

  if (entry.source.type === "species") {
    return `Species: ${entry.source.species}`;
  }

  if (entry.source.type === "eldritch-invocation") {
    return getEldritchInvocationEntryById(entry.source.invocation)?.name ?? "Eldritch Invocation";
  }

  if (entry.source.feature === CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT) {
    return `Level ${entry.source.level}: ASI`;
  }

  return `Level ${entry.source.level}: ${formatCodexLabel(entry.source.feature)}`;
}

export function isFeatFromBackgroundSource(
  entry: CharacterFeatEntry,
  background?: string
): boolean {
  return (
    entry.source.type === "background" &&
    (background === undefined || entry.source.background === background)
  );
}

export function isFeatEntryRemovable(entry: CharacterFeatEntry): boolean {
  return (
    !isFeatFromBackgroundSource(entry) &&
    entry.source.type !== "species" &&
    entry.source.type !== "eldritch-invocation"
  );
}
