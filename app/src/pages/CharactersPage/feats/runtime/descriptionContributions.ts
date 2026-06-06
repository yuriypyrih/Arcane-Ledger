import { FEATS } from "../../../../codex/entries";
import type { FeatureDescriptionContribution } from "../../featureContributions";
import { getFeatDefinition, getFeatLabel } from "..";
import {
  filterDescriptionEntries,
  isArcheryWeaponActionDescriptionEntry,
  isBoonOfCombatProwessPeerlessAimDescriptionEntry,
  isBoonOfDimensionalTravelBlinkStepsDescriptionEntry,
  isBoonOfIrresistibleOffenseDescriptionEntry,
  isBoonOfSpeedEscapeArtistDescriptionEntry,
  isChargerChargeAttackDescriptionEntry,
  isChargerImprovedDashDescriptionEntry,
  isChefBolsteringTreatsDescriptionEntry,
  isChefReplenishingMealDescriptionEntry,
  isCrossbowExpertDescriptionEntry,
  isCrusherWeaponActionDescriptionEntry,
  isDualWielderEnhancedDualWieldingDescriptionEntry,
  isDuelingWeaponActionDescriptionEntry,
  isEmeraldEnclaveFledglingTagTeamDescriptionEntry,
  isGreatWeaponMasterHeavyWeaponMasteryDescriptionEntry,
  isGreatWeaponMasterHewDescriptionEntry,
  isHarperAgentDistractingMelodyDescriptionEntry,
  isInspiringLeaderBolsteringPerformanceDescriptionEntry,
  isKeenMindQuickStudyDescriptionEntry,
  isMageSlayerGuardedMindDescriptionEntry,
  isMediumArmorMasterDexterousWearerDescriptionEntry,
  isObservantQuickSearchDescriptionEntry,
  isPiercerWeaponActionDescriptionEntry,
  isPoisonerPotentPoisonDescriptionEntry,
  isPolearmMasterPoleStrikeDescriptionEntry,
  isPurpleDragonRookRallyingCryDescriptionEntry,
  isSharpshooterDescriptionEntry,
  isShieldMasterInterposeShieldDescriptionEntry,
  isShieldMasterShieldBashDescriptionEntry,
  isSkulkerHideDescriptionEntry,
  isSlasherWeaponActionDescriptionEntry,
  isSpeedyDashOverDifficultTerrainDescriptionEntry,
  isThrownWeaponFightingWeaponActionDescriptionEntry,
  isTyroOfTheGauntletVigilantDescriptionEntry,
  isTwoWeaponFightingWeaponActionDescriptionEntry,
  isUnarmedFightingWeaponActionDescriptionEntry,
  isWarCasterConcentrationDescriptionEntry,
  isWeaponMasterMasteryPropertyDescriptionEntry,
  isZhentarimRuffianFamilyFirstDescriptionEntry
} from "./descriptionMatchers";

type DescriptionPredicate = (entry: string) => boolean;

type FeatDescriptionContributionDefinition = {
  feat: FEATS;
  target: FeatureDescriptionContribution["target"];
  targetKey: string;
  targetPredicateId?: string;
  sourceLabel?: string | null;
  predicate?: DescriptionPredicate;
  fullDescription?: boolean;
};

export const featDescriptionTargetKeys = {
  speed: "speed",
  armorClass: "armorClass",
  commonActionChargerDash: "charger:improved-dash",
  commonActionSpeedyDash: "speedy:dash-over-difficult-terrain",
  commonActionBoonOfSpeedDisengage: "boon-of-speed:escape-artist",
  commonActionKeenMindStudy: "keen-mind:quick-study",
  commonActionObservantSearch: "observant:quick-search",
  commonActionSkulkerHide: "skulker:hide",
  commonActionEmeraldEnclaveHelp: "emerald-enclave-fledgling:tag-team",
  commonActionHarperAgentHelp: "harper-agent:distracting-melody",
  commonActionTyroReady: "tyro-of-the-gauntlet:vigilant",
  savingThrowInt: "savingThrow:INT",
  savingThrowWis: "savingThrow:WIS",
  savingThrowCha: "savingThrow:CHA",
  savingThrowDex: "savingThrow:DEX",
  savingThrowConcentration: "savingThrow:CON:concentration",
  shortRest: "shortRest",
  longRest: "longRest",
  musicianEncouragingSong: "musician:encouraging-song",
  initiativeRallyingCry: "purple-dragon-rook:rallying-cry",
  initiativeFamilyFirst: "zhentarim-ruffian:family-first",
  weaponSavageAttacker: "savage-attacker",
  weaponTavernBrawler: "tavern-brawler",
  weaponChargerChargeAttack: "charger:charge-attack",
  weaponArchery: "archery",
  weaponDueling: "dueling",
  weaponBoonOfCombatProwess: "boon-of-combat-prowess:peerless-aim",
  weaponBoonOfDimensionalTravel: "boon-of-dimensional-travel:blink-steps",
  weaponBoonOfIrresistibleOffense: "boon-of-irresistible-offense",
  weaponThrownWeaponFighting: "thrown-weapon-fighting",
  weaponTwoWeaponFighting: "two-weapon-fighting",
  weaponUnarmedFighting: "unarmed-fighting",
  weaponCrusher: "crusher",
  weaponPiercer: "piercer",
  weaponSlasher: "slasher",
  weaponPoisoner: "poisoner:potent-poison",
  weaponDualWielder: "dual-wielder:enhanced-dual-wielding",
  weaponGreatWeaponMasterHeavy: "great-weapon-master:heavy-weapon-mastery",
  weaponGreatWeaponMasterHew: "great-weapon-master:hew",
  weaponPolearmMaster: "polearm-master:pole-strike",
  weaponCrossbowExpert: "crossbow-expert",
  weaponSharpshooter: "sharpshooter",
  weaponShieldMaster: "shield-master:shield-bash"
} as const;

const featDescriptionContributionDefinitions: FeatDescriptionContributionDefinition[] = [
  {
    feat: FEATS.ATHLETE,
    target: "stat",
    targetKey: featDescriptionTargetKeys.speed,
    predicate: (entry) =>
      entry.startsWith("<strong>Hop Up.</strong>") ||
      entry.startsWith("<strong>Jumping.</strong>")
  },
  {
    feat: FEATS.CHARGER,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionChargerDash,
    targetPredicateId: "common-action-dash",
    predicate: isChargerImprovedDashDescriptionEntry
  },
  {
    feat: FEATS.SPEEDY,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionSpeedyDash,
    targetPredicateId: "common-action-dash",
    predicate: isSpeedyDashOverDifficultTerrainDescriptionEntry
  },
  {
    feat: FEATS.BOON_OF_SPEED,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionBoonOfSpeedDisengage,
    targetPredicateId: "common-action-disengage",
    predicate: isBoonOfSpeedEscapeArtistDescriptionEntry
  },
  {
    feat: FEATS.KEEN_MIND,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionKeenMindStudy,
    targetPredicateId: "common-action-study",
    predicate: isKeenMindQuickStudyDescriptionEntry
  },
  {
    feat: FEATS.OBSERVANT,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionObservantSearch,
    targetPredicateId: "common-action-search",
    predicate: isObservantQuickSearchDescriptionEntry
  },
  {
    feat: FEATS.SKULKER,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionSkulkerHide,
    targetPredicateId: "common-action-hide",
    predicate: isSkulkerHideDescriptionEntry
  },
  {
    feat: FEATS.EMERALD_ENCLAVE_FLEDGLING,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionEmeraldEnclaveHelp,
    targetPredicateId: "common-action-help",
    predicate: isEmeraldEnclaveFledglingTagTeamDescriptionEntry
  },
  {
    feat: FEATS.HARPER_AGENT,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionHarperAgentHelp,
    targetPredicateId: "common-action-help",
    predicate: isHarperAgentDistractingMelodyDescriptionEntry
  },
  {
    feat: FEATS.TYRO_OF_THE_GAUNTLET,
    target: "commonAction",
    targetKey: featDescriptionTargetKeys.commonActionTyroReady,
    targetPredicateId: "common-action-ready",
    predicate: isTyroOfTheGauntletVigilantDescriptionEntry
  },
  {
    feat: FEATS.CHEF,
    target: "rest",
    targetKey: featDescriptionTargetKeys.shortRest,
    sourceLabel: "Chef",
    predicate: isChefReplenishingMealDescriptionEntry
  },
  {
    feat: FEATS.CHEF,
    target: "rest",
    targetKey: featDescriptionTargetKeys.longRest,
    sourceLabel: "Chef",
    predicate: isChefBolsteringTreatsDescriptionEntry
  },
  {
    feat: FEATS.INSPIRING_LEADER,
    target: "rest",
    targetKey: featDescriptionTargetKeys.shortRest,
    predicate: isInspiringLeaderBolsteringPerformanceDescriptionEntry
  },
  {
    feat: FEATS.INSPIRING_LEADER,
    target: "rest",
    targetKey: featDescriptionTargetKeys.longRest,
    predicate: isInspiringLeaderBolsteringPerformanceDescriptionEntry
  },
  {
    feat: FEATS.WEAPON_MASTER,
    target: "rest",
    targetKey: featDescriptionTargetKeys.longRest,
    predicate: isWeaponMasterMasteryPropertyDescriptionEntry
  },
  {
    feat: FEATS.MUSICIAN,
    target: "rest",
    targetKey: featDescriptionTargetKeys.musicianEncouragingSong,
    sourceLabel: null,
    predicate: (entry) => entry.includes("Encouraging Song")
  },
  {
    feat: FEATS.PURPLE_DRAGON_ROOK,
    target: "initiative",
    targetKey: featDescriptionTargetKeys.initiativeRallyingCry,
    predicate: isPurpleDragonRookRallyingCryDescriptionEntry
  },
  {
    feat: FEATS.ZHENTARIM_RUFFIAN,
    target: "initiative",
    targetKey: featDescriptionTargetKeys.initiativeFamilyFirst,
    predicate: isZhentarimRuffianFamilyFirstDescriptionEntry
  },
  {
    feat: FEATS.MAGE_SLAYER,
    target: "stat",
    targetKey: featDescriptionTargetKeys.savingThrowInt,
    sourceLabel: "Mage Slayer: Guarded Mind",
    predicate: isMageSlayerGuardedMindDescriptionEntry
  },
  {
    feat: FEATS.MAGE_SLAYER,
    target: "stat",
    targetKey: featDescriptionTargetKeys.savingThrowWis,
    sourceLabel: "Mage Slayer: Guarded Mind",
    predicate: isMageSlayerGuardedMindDescriptionEntry
  },
  {
    feat: FEATS.MAGE_SLAYER,
    target: "stat",
    targetKey: featDescriptionTargetKeys.savingThrowCha,
    sourceLabel: "Mage Slayer: Guarded Mind",
    predicate: isMageSlayerGuardedMindDescriptionEntry
  },
  {
    feat: FEATS.SHIELD_MASTER,
    target: "stat",
    targetKey: featDescriptionTargetKeys.savingThrowDex,
    predicate: isShieldMasterInterposeShieldDescriptionEntry
  },
  {
    feat: FEATS.WAR_CASTER,
    target: "stat",
    targetKey: featDescriptionTargetKeys.savingThrowConcentration,
    sourceLabel: "War Caster: Concentration",
    predicate: isWarCasterConcentrationDescriptionEntry
  },
  {
    feat: FEATS.MEDIUM_ARMOR_MASTER,
    target: "stat",
    targetKey: featDescriptionTargetKeys.armorClass,
    predicate: isMediumArmorMasterDexterousWearerDescriptionEntry
  },
  {
    feat: FEATS.SAVAGE_ATTACKER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponSavageAttacker,
    fullDescription: true
  },
  {
    feat: FEATS.TAVERN_BRAWLER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponTavernBrawler,
    fullDescription: true
  },
  {
    feat: FEATS.CHARGER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponChargerChargeAttack,
    predicate: isChargerChargeAttackDescriptionEntry
  },
  {
    feat: FEATS.ARCHERY,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponArchery,
    predicate: isArcheryWeaponActionDescriptionEntry
  },
  {
    feat: FEATS.DUELING,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponDueling,
    predicate: isDuelingWeaponActionDescriptionEntry
  },
  {
    feat: FEATS.BOON_OF_COMBAT_PROWESS,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponBoonOfCombatProwess,
    predicate: isBoonOfCombatProwessPeerlessAimDescriptionEntry
  },
  {
    feat: FEATS.BOON_OF_DIMENSIONAL_TRAVEL,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponBoonOfDimensionalTravel,
    predicate: isBoonOfDimensionalTravelBlinkStepsDescriptionEntry
  },
  {
    feat: FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponBoonOfIrresistibleOffense,
    predicate: isBoonOfIrresistibleOffenseDescriptionEntry
  },
  {
    feat: FEATS.THROWN_WEAPON_FIGHTING,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponThrownWeaponFighting,
    predicate: isThrownWeaponFightingWeaponActionDescriptionEntry
  },
  {
    feat: FEATS.TWO_WEAPON_FIGHTING,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponTwoWeaponFighting,
    predicate: isTwoWeaponFightingWeaponActionDescriptionEntry
  },
  {
    feat: FEATS.UNARMED_FIGHTING,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponUnarmedFighting,
    predicate: isUnarmedFightingWeaponActionDescriptionEntry
  },
  {
    feat: FEATS.CRUSHER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponCrusher,
    predicate: isCrusherWeaponActionDescriptionEntry
  },
  {
    feat: FEATS.PIERCER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponPiercer,
    predicate: isPiercerWeaponActionDescriptionEntry
  },
  {
    feat: FEATS.SLASHER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponSlasher,
    predicate: isSlasherWeaponActionDescriptionEntry
  },
  {
    feat: FEATS.POISONER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponPoisoner,
    sourceLabel: "Poisoner: Potent Poison",
    predicate: isPoisonerPotentPoisonDescriptionEntry
  },
  {
    feat: FEATS.DUAL_WIELDER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponDualWielder,
    predicate: isDualWielderEnhancedDualWieldingDescriptionEntry
  },
  {
    feat: FEATS.GREAT_WEAPON_MASTER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponGreatWeaponMasterHeavy,
    predicate: isGreatWeaponMasterHeavyWeaponMasteryDescriptionEntry
  },
  {
    feat: FEATS.GREAT_WEAPON_MASTER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponGreatWeaponMasterHew,
    predicate: isGreatWeaponMasterHewDescriptionEntry
  },
  {
    feat: FEATS.POLEARM_MASTER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponPolearmMaster,
    predicate: isPolearmMasterPoleStrikeDescriptionEntry
  },
  {
    feat: FEATS.CROSSBOW_EXPERT,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponCrossbowExpert,
    predicate: isCrossbowExpertDescriptionEntry
  },
  {
    feat: FEATS.SHARPSHOOTER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponSharpshooter,
    predicate: isSharpshooterDescriptionEntry
  },
  {
    feat: FEATS.SHIELD_MASTER,
    target: "weaponAction",
    targetKey: featDescriptionTargetKeys.weaponShieldMaster,
    predicate: isShieldMasterShieldBashDescriptionEntry
  }
];

function getFeatDescriptionEntries(definition: FeatDescriptionContributionDefinition) {
  const description = getFeatDefinition(definition.feat)?.description ?? [];

  return definition.fullDescription
    ? description
    : filterDescriptionEntries(description, definition.predicate ?? (() => false));
}

export function getFeatDescriptionContributions(
  feat: FEATS
): FeatureDescriptionContribution[] {
  return featDescriptionContributionDefinitions.flatMap((definition) => {
    if (definition.feat !== feat) {
      return [];
    }

    const descriptionEntries = getFeatDescriptionEntries(definition);

    if (descriptionEntries.length === 0) {
      return [];
    }

    return [
      {
        id: `${definition.feat}:${definition.target}:${definition.targetKey}`,
        target: definition.target,
        targetKey: definition.targetKey,
        targetPredicateId: definition.targetPredicateId,
        sourceLabel:
          definition.sourceLabel === null
            ? undefined
            : (definition.sourceLabel ?? getFeatLabel(definition.feat)),
        descriptionEntries
      }
    ];
  });
}
