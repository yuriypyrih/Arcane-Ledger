import {
  DAMAGE_TYPE,
  FEATS,
  REACTION,
  SPELL_COMPONENT,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  type ReactionEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../types";
import type { AbilityKey, Character, CharacterFeatEntry, ItemRecord } from "../../../../types";
import { getAbilityModifierForCharacter } from "../../abilities";
import {
  appendSourcedDescriptionAddition,
  createSourcedDescriptionEntries
} from "../../actionModalDescriptions";
import type {
  ArmorClassFeatureContext,
  FeatureActionCard,
  FeatureArmorClassBonus,
  FeatureSpeedBonus
} from "../../classFeatures/types";
import {
  getHitDiceRemainingForCharacter,
  getHitDieFormulaForClass
} from "../../hitDice";
import { getFeatDefinition, getFeatLabel, normalizeCharacterFeats } from "..";
import { formatCodexLabel } from "../../../../utils/codex";
import {
  createBoonOfFateImproveFateAction,
  createBoonOfRecoveryRecoverVitalityAction,
  createDurableSpeedyRecoveryAction,
  createLuckyAction,
  createTelekineticShoveAction
} from "./actions";
import {
  actorStatusSourceId,
  blindFightingBlindsightStatusSourceId,
  boonOfEnergyResistanceReactionEntryId,
  boonOfEnergyResistanceStatusSourceIdPrefix,
  boonOfNightSpiritStatusSourceId,
  defensiveDuelistParryReactionEntryId,
  elementalAdeptEnergyMasteryDescription,
  feyTouchedFeyMagicDescription,
  feyTouchedMistyStepSpellId,
  heavyArmorMasterDamageReductionStatusSourceId,
  interceptionReactionEntryId,
  mageSlayerConcentrationBreakerStatusSourceId,
  polearmMasterReactiveStrikeReactionEntryId,
  protectionReactionEntryId,
  ritualCasterQuickRitualDescription,
  sentinelGuardianHaltStatusSourceId,
  shadowTouchedInvisibilitySpellId,
  shadowTouchedShadowMagicDescription,
  shieldMasterReactionEntryId,
  skulkerBlindsightStatusSourceId,
  speedyAgileMovementStatusSourceId,
  telekineticMageHandSpellId,
  telepathicDetectThoughtsSpellId,
  telepathicUtteranceStatusSourceId,
  warCasterReactiveSpellReactionEntryId
} from "./constants";
import {
  getFeatCantripEntries,
  getFeyTouchedSpellEntries,
  getMagicInitiateLevelOneSpellEntry,
  getRitualCasterSpellEntries,
  getShadowTouchedSpellEntries,
  getTelekineticMageHandSpellEntry,
  getTelepathicDetectThoughtsSpellEntry
} from "./spells";
import {
  filterDescriptionEntries,
  isArcheryWeaponActionDescriptionEntry,
  isBoonOfCombatProwessPeerlessAimDescriptionEntry,
  isBoonOfDimensionalTravelBlinkStepsDescriptionEntry,
  isBoonOfEnergyResistanceEnergyRedirectionDescriptionEntry,
  isBoonOfEnergyResistanceEnergyResistancesDescriptionEntry,
  isBoonOfFateImproveFateDescriptionEntry,
  isBoonOfIrresistibleOffenseDescriptionEntry,
  isBoonOfNightSpiritDescriptionEntry,
  isBoonOfRecoveryRecoverVitalityDescriptionEntry,
  isBoonOfSpeedEscapeArtistDescriptionEntry,
  isBoonOfSpellRecallFreeCastingDescriptionEntry,
  isChargerChargeAttackDescriptionEntry,
  isChargerImprovedDashDescriptionEntry,
  isChefBolsteringTreatsDescriptionEntry,
  isChefReplenishingMealDescriptionEntry,
  isCrossbowExpertDescriptionEntry,
  isCrusherWeaponActionDescriptionEntry,
  isDefensiveDuelistParryDescriptionEntry,
  isDualWielderEnhancedDualWieldingDescriptionEntry,
  isDuelingWeaponActionDescriptionEntry,
  isDurableSpeedyRecoveryDescriptionEntry,
  isGreatWeaponMasterHeavyWeaponMasteryDescriptionEntry,
  isGreatWeaponMasterHewDescriptionEntry,
  isHeavyArmorMasterDamageReductionDescriptionEntry,
  isInspiringLeaderBolsteringPerformanceDescriptionEntry,
  isKeenMindQuickStudyDescriptionEntry,
  isMageSlayerConcentrationBreakerDescriptionEntry,
  isMageSlayerGuardedMindDescriptionEntry,
  isMediumArmorMasterDexterousWearerDescriptionEntry,
  isObservantQuickSearchDescriptionEntry,
  isPiercerWeaponActionDescriptionEntry,
  isPoisonerPotentPoisonDescriptionEntry,
  isPolearmMasterPoleStrikeDescriptionEntry,
  isPolearmMasterReactiveStrikeDescriptionEntry,
  isSentinelGuardianHaltDescriptionEntry,
  isSharpshooterDescriptionEntry,
  isShieldMasterInterposeShieldDescriptionEntry,
  isShieldMasterShieldBashDescriptionEntry,
  isSkulkerHideDescriptionEntry,
  isSlasherWeaponActionDescriptionEntry,
  isSpeedyAgileMovementDescriptionEntry,
  isSpeedyDashOverDifficultTerrainDescriptionEntry,
  isSpellSniperDescriptionEntry,
  isTelekineticMinorTelekinesisDescriptionEntry,
  isTelekineticShoveDescriptionEntry,
  isTelepathicDetectThoughtsDescriptionEntry,
  isTelepathicUtteranceDescriptionEntry,
  isThrownWeaponFightingWeaponActionDescriptionEntry,
  isTwoWeaponFightingWeaponActionDescriptionEntry,
  isUnarmedFightingWeaponActionDescriptionEntry,
  isWarCasterConcentrationDescriptionEntry,
  isWarCasterReactiveSpellDescriptionEntry,
  isWarCasterSomaticComponentsDescriptionEntry,
  isWeaponMasterMasteryPropertyDescriptionEntry
} from "./descriptionMatchers";
import { getFeatItemAdditionalDescription } from "./itemAdditions";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

export type { FeatDerivedState, FeatRuntimeCharacter } from "./types";
export * from "./capabilities";
export * from "./constants";

const featDerivedStateCache = new WeakMap<object, Map<number, FeatDerivedState>>();

type ChargerWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type ArcheryWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type DuelingWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type EpicBoonWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
};

type ThrownWeaponFightingWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  properties?: WEAPON_PROPERTY[];
};

type TwoWeaponFightingWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  properties?: WEAPON_PROPERTY[];
};

type UnarmedFightingWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
};

type CrusherWeaponActionContext = {
  damageLabel: string;
};

type DamageTypedWeaponActionContext = {
  damageLabel: string;
};

type DualWielderWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  properties?: WEAPON_PROPERTY[];
};

type GreatWeaponMasterWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
  properties?: WEAPON_PROPERTY[];
};

type PolearmMasterWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  baseWeapon?: WEAPON_BASE | null;
  properties?: WEAPON_PROPERTY[];
};

type CrossbowExpertWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  baseWeapon?: WEAPON_BASE | null;
};

type SharpshooterWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type ShieldMasterWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

const crossbowExpertBaseWeapons = new Set<WEAPON_BASE>([
  WEAPON_BASE.LIGHT_CROSSBOW,
  WEAPON_BASE.HAND_CROSSBOW,
  WEAPON_BASE.HEAVY_CROSSBOW
]);

function normalizeFeatRuntimeLevel(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.floor(parsed)));
}

function getCachedFeatDerivedState(feats: unknown, level: number): FeatDerivedState | undefined {
  if (!Array.isArray(feats)) {
    return undefined;
  }

  return featDerivedStateCache.get(feats)?.get(level);
}

function setCachedFeatDerivedState(feats: unknown, level: number, state: FeatDerivedState) {
  if (!Array.isArray(feats)) {
    return;
  }

  const cachedByLevel = featDerivedStateCache.get(feats) ?? new Map<number, FeatDerivedState>();

  cachedByLevel.set(level, state);
  featDerivedStateCache.set(feats, cachedByLevel);
}

function getFeatProficiencyBonusForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function getLuckyPointsExpended(normalizedFeats: CharacterFeatEntry[], total: number): number {
  const luckyEntry = normalizedFeats.find((entry) => entry.feat === FEATS.LUCKY);
  const pointsExpended = luckyEntry?.lucky?.pointsExpended ?? 0;

  return Math.max(0, Math.min(total, Math.floor(pointsExpended)));
}

function getFeatDescriptionSlice(
  feat: FEATS,
  predicate: (entry: string) => boolean
): SpellDescriptionEntry[] {
  return filterDescriptionEntries(getFeatDefinition(feat)?.description ?? [], predicate);
}

function isChargerMeleeWeaponAction(action: ChargerWeaponActionContext): boolean {
  return (
    action.attackKind === "unarmed" ||
    (action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE)
  );
}

function isArcheryWeaponAction(action: ArcheryWeaponActionContext): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.RANGED;
}

function isDuelingWeaponAction(action: DuelingWeaponActionContext): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE;
}

function isEpicBoonWeaponAction(action: EpicBoonWeaponActionContext): boolean {
  return action.attackKind === "weapon";
}

function isThrownWeaponFightingWeaponAction(
  action: ThrownWeaponFightingWeaponActionContext
): boolean {
  return action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.THROWN);
}

function isTwoWeaponFightingWeaponAction(action: TwoWeaponFightingWeaponActionContext): boolean {
  return action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.LIGHT);
}

function isUnarmedFightingWeaponAction(action: UnarmedFightingWeaponActionContext): boolean {
  return action.attackKind === "unarmed";
}

function isCrossbowExpertWeaponAction(action: CrossbowExpertWeaponActionContext): boolean {
  return (
    action.attackKind === "weapon" &&
    typeof action.baseWeapon === "string" &&
    crossbowExpertBaseWeapons.has(action.baseWeapon)
  );
}

function isSharpshooterWeaponAction(action: SharpshooterWeaponActionContext): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.RANGED;
}

function isShieldMasterWeaponAction(action: ShieldMasterWeaponActionContext): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE;
}

function isCrusherWeaponAction(action: CrusherWeaponActionContext): boolean {
  return /\bbludgeoning\b/i.test(action.damageLabel);
}

function isPiercerWeaponAction(action: DamageTypedWeaponActionContext): boolean {
  return /\bpiercing\b/i.test(action.damageLabel);
}

function isPoisonerWeaponAction(action: DamageTypedWeaponActionContext): boolean {
  return /\bpoison\b/i.test(action.damageLabel);
}

function isSlasherWeaponAction(action: DamageTypedWeaponActionContext): boolean {
  return /\bslashing\b/i.test(action.damageLabel);
}

function isBoonOfIrresistibleOffenseWeaponAction(action: DamageTypedWeaponActionContext): boolean {
  return /\b(?:bludgeoning|piercing|slashing)\b/i.test(action.damageLabel);
}

function isDualWielderWeaponAction(action: DualWielderWeaponActionContext): boolean {
  return action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.LIGHT);
}

function isGreatWeaponMasterHeavyWeaponAction(
  action: GreatWeaponMasterWeaponActionContext
): boolean {
  return action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.HEAVY);
}

function isGreatWeaponMasterMeleeWeaponAction(
  action: GreatWeaponMasterWeaponActionContext
): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE;
}

function isPolearmMasterWeaponAction(action: PolearmMasterWeaponActionContext): boolean {
  if (action.attackKind !== "weapon") {
    return false;
  }

  if (action.baseWeapon === WEAPON_BASE.QUARTERSTAFF || action.baseWeapon === WEAPON_BASE.SPEAR) {
    return true;
  }

  const properties = action.properties ?? [];

  return (
    properties.includes(WEAPON_PROPERTY.HEAVY) && properties.includes(WEAPON_PROPERTY.REACH)
  );
}

function doesSpellDealDamageType(spell: SpellEntry, chosenDamageType: DAMAGE_TYPE): boolean {
  return spell.damage.some(([, damageType]) =>
    Array.isArray(damageType)
      ? damageType.includes(chosenDamageType)
      : damageType === chosenDamageType
  );
}

function doesSpellDealAnyDamageType(spell: SpellEntry, damageTypes: DAMAGE_TYPE[]): boolean {
  return damageTypes.some((damageType) => doesSpellDealDamageType(spell, damageType));
}

function createFeatDerivedState(feats: unknown, level: number): FeatDerivedState {
  const normalizedFeats = normalizeCharacterFeats(feats, level);
  const featsByFeat = new Map<FEATS, CharacterFeatEntry[]>();
  const featSet = new Set<FEATS>();
  const grantedCantripEntriesById = new Map<string, SpellEntry>();
  const alwaysPreparedCantripEntriesById = new Map<string, SpellEntry>();
  const alwaysPreparedSpellEntriesById = new Map<string, SpellEntry>();
  const magicInitiateSpellcastingAbilityBySpellId = new Map<string, AbilityKey>();
  const magicInitiateFreeCastEntries: FeatDerivedState["magicInitiateFreeCastEntries"] = [];
  const feyTouchedFreeCastEntries: FeatDerivedState["feyTouchedFreeCastEntries"] = [];
  const shadowTouchedFreeCastEntries: FeatDerivedState["shadowTouchedFreeCastEntries"] = [];
  const telepathicDetectThoughtsFreeCastEntries: FeatDerivedState["telepathicDetectThoughtsFreeCastEntries"] =
    [];
  const abilityScoreBonuses: FeatDerivedState["abilityScoreBonuses"] = [];
  const derivedStatusEntries: FeatDerivedState["derivedStatusEntries"] = [];
  const featDefinitionCache = new Map<FEATS, SpellDescriptionEntry[]>();
  const getFeatDescription = (feat: FEATS) => {
    const cachedDescription = featDefinitionCache.get(feat);

    if (cachedDescription) {
      return cachedDescription;
    }

    const description = getFeatDefinition(feat)?.description ?? [];
    featDefinitionCache.set(feat, description);
    return description;
  };

  normalizedFeats.forEach((entry, index) => {
    featSet.add(entry.feat);
    featsByFeat.set(entry.feat, [...(featsByFeat.get(entry.feat) ?? []), entry]);

    const featCantripEntries = getFeatCantripEntries(entry);

    featCantripEntries.forEach((cantrip) => {
      grantedCantripEntriesById.set(cantrip.id, cantrip);
    });

    if (entry.feat === FEATS.MAGIC_INITIATE && entry.magicInitiate) {
      const magicInitiate = entry.magicInitiate;

      featCantripEntries.forEach((cantrip) => {
        alwaysPreparedCantripEntriesById.set(cantrip.id, cantrip);
        magicInitiateSpellcastingAbilityBySpellId.set(
          cantrip.id,
          magicInitiate.spellcastingAbility
        );
      });

      const levelOneSpell = getMagicInitiateLevelOneSpellEntry(entry);

      if (levelOneSpell) {
        alwaysPreparedSpellEntriesById.set(levelOneSpell.id, levelOneSpell);
        magicInitiateSpellcastingAbilityBySpellId.set(
          levelOneSpell.id,
          magicInitiate.spellcastingAbility
        );
        magicInitiateFreeCastEntries.push({
          featEntryId: entry.id,
          spellId: levelOneSpell.id,
          expended: magicInitiate.freeCastExpended === true
        });
      }
    }

    if (entry.feat === FEATS.FEY_TOUCHED && entry.feyTouched) {
      const feyTouched = entry.feyTouched;

      getFeyTouchedSpellEntries(entry).forEach((spell) => {
        alwaysPreparedSpellEntriesById.set(spell.id, spell);
        magicInitiateSpellcastingAbilityBySpellId.set(spell.id, feyTouched.ability);
        feyTouchedFreeCastEntries.push({
          featEntryId: entry.id,
          spellId: spell.id,
          expended: feyTouched.freeCastExpendedSpellIds?.includes(spell.id) === true
        });
      });
    }

    if (entry.feat === FEATS.RITUAL_CASTER && entry.ritualCaster) {
      const ritualCaster = entry.ritualCaster;

      getRitualCasterSpellEntries(entry).forEach((spell) => {
        alwaysPreparedSpellEntriesById.set(spell.id, spell);
        magicInitiateSpellcastingAbilityBySpellId.set(spell.id, ritualCaster.ability);
      });
    }

    if (entry.feat === FEATS.SHADOW_TOUCHED && entry.shadowTouched) {
      const shadowTouched = entry.shadowTouched;

      getShadowTouchedSpellEntries(entry).forEach((spell) => {
        alwaysPreparedSpellEntriesById.set(spell.id, spell);
        magicInitiateSpellcastingAbilityBySpellId.set(spell.id, shadowTouched.ability);
        shadowTouchedFreeCastEntries.push({
          featEntryId: entry.id,
          spellId: spell.id,
          expended: shadowTouched.freeCastExpendedSpellIds?.includes(spell.id) === true
        });
      });
    }

    if (entry.feat === FEATS.TELEKINETIC && entry.telekinetic) {
      const mageHand = getTelekineticMageHandSpellEntry(entry);

      if (mageHand) {
        alwaysPreparedCantripEntriesById.set(mageHand.id, mageHand);
        magicInitiateSpellcastingAbilityBySpellId.set(mageHand.id, entry.telekinetic.ability);
      }
    }

    if (entry.feat === FEATS.TELEPATHIC && entry.telepathic) {
      const detectThoughts = getTelepathicDetectThoughtsSpellEntry(entry);

      if (detectThoughts) {
        alwaysPreparedSpellEntriesById.set(detectThoughts.id, detectThoughts);
        magicInitiateSpellcastingAbilityBySpellId.set(
          detectThoughts.id,
          entry.telepathic.ability
        );
        telepathicDetectThoughtsFreeCastEntries.push({
          featEntryId: entry.id,
          spellId: detectThoughts.id,
          expended: entry.telepathic.detectThoughtsExpended === true
        });
      }
    }

    const order = entry.takenAtLevel + index / 100;

    if (entry.feat === FEATS.ABILITY_SCORE_IMPROVEMENT && entry.abilityScoreImprovement) {
      if (entry.abilityScoreImprovement.mode === "single") {
        abilityScoreBonuses.push({
          ability: entry.abilityScoreImprovement.primaryAbility,
          label: "Ability Score Improvement",
          value: 2,
          maxScore: 20,
          order
        });
      } else {
        abilityScoreBonuses.push(
          {
            ability: entry.abilityScoreImprovement.primaryAbility,
            label: "Ability Score Improvement",
            value: 1,
            maxScore: 20,
            order
          },
          {
            ability: entry.abilityScoreImprovement.secondaryAbility,
            label: "Ability Score Improvement",
            value: 1,
            maxScore: 20,
            order
          }
        );
      }
    } else if (entry.feat === FEATS.ATHLETE && entry.athlete) {
      abilityScoreBonuses.push({
        ability: entry.athlete.ability,
        label: "Athlete",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.CHARGER && entry.charger) {
      abilityScoreBonuses.push({
        ability: entry.charger.ability,
        label: "Charger",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.CHEF && entry.chef) {
      abilityScoreBonuses.push({
        ability: entry.chef.ability,
        label: "Chef",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.CRUSHER && entry.crusher) {
      abilityScoreBonuses.push({
        ability: entry.crusher.ability,
        label: "Crusher",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.CROSSBOW_EXPERT) {
      abilityScoreBonuses.push({
        ability: "DEX",
        label: "Crossbow Expert",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.DEFENSIVE_DUELIST) {
      abilityScoreBonuses.push({
        ability: "DEX",
        label: "Defensive Duelist",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.DURABLE) {
      abilityScoreBonuses.push({
        ability: "CON",
        label: "Durable",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.DUAL_WIELDER && entry.dualWielder) {
      abilityScoreBonuses.push({
        ability: entry.dualWielder.ability,
        label: "Dual Wielder",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.ELEMENTAL_ADEPT && entry.elementalAdept) {
      abilityScoreBonuses.push({
        ability: entry.elementalAdept.ability,
        label: "Elemental Adept",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.FEY_TOUCHED && entry.feyTouched) {
      abilityScoreBonuses.push({
        ability: entry.feyTouched.ability,
        label: "Fey-Touched",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.GREAT_WEAPON_MASTER) {
      abilityScoreBonuses.push({
        ability: "STR",
        label: "Great Weapon Master",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.HEAVILY_ARMORED && entry.heavilyArmored) {
      abilityScoreBonuses.push({
        ability: entry.heavilyArmored.ability,
        label: "Heavily Armored",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.HEAVY_ARMOR_MASTER && entry.heavyArmorMaster) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.HEAVY_ARMOR_MASTER),
        isHeavyArmorMasterDamageReductionDescriptionEntry
      );

      abilityScoreBonuses.push({
        ability: entry.heavyArmorMaster.ability,
        label: "Heavy Armor Master",
        value: 1,
        maxScore: 20,
        order
      });
      derivedStatusEntries.push({
        id: `${heavyArmorMasterDamageReductionStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Damage Reduction",
        source: "Heavy Armor Master",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: heavyArmorMasterDamageReductionStatusSourceId,
        description: description.join("\n")
      });
    } else if (entry.feat === FEATS.INSPIRING_LEADER && entry.inspiringLeader) {
      abilityScoreBonuses.push({
        ability: entry.inspiringLeader.ability,
        label: "Inspiring Leader",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.KEEN_MIND && entry.keenMind) {
      abilityScoreBonuses.push({
        ability: "INT",
        label: "Keen Mind",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.LIGHTLY_ARMORED && entry.lightlyArmored) {
      abilityScoreBonuses.push({
        ability: entry.lightlyArmored.ability,
        label: "Lightly Armored",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.MAGE_SLAYER && entry.mageSlayer) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.MAGE_SLAYER),
        isMageSlayerConcentrationBreakerDescriptionEntry
      );

      abilityScoreBonuses.push({
        ability: entry.mageSlayer.ability,
        label: "Mage Slayer",
        value: 1,
        maxScore: 20,
        order
      });
      derivedStatusEntries.push({
        id: `${mageSlayerConcentrationBreakerStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Concentration Breaker",
        source: "Mage Slayer",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: mageSlayerConcentrationBreakerStatusSourceId,
        description: description.join("\n")
      });
    } else if (entry.feat === FEATS.MARTIAL_WEAPON_TRAINING && entry.martialWeaponTraining) {
      abilityScoreBonuses.push({
        ability: entry.martialWeaponTraining.ability,
        label: "Martial Weapon Training",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.MEDIUM_ARMOR_MASTER && entry.mediumArmorMaster) {
      abilityScoreBonuses.push({
        ability: entry.mediumArmorMaster.ability,
        label: "Medium Armor Master",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.MODERATELY_ARMORED && entry.moderatelyArmored) {
      abilityScoreBonuses.push({
        ability: entry.moderatelyArmored.ability,
        label: "Moderately Armored",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.MOUNTED_COMBATANT && entry.mountedCombatant) {
      abilityScoreBonuses.push({
        ability: entry.mountedCombatant.ability,
        label: "Mounted Combatant",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.OBSERVANT && entry.observant) {
      abilityScoreBonuses.push({
        ability: entry.observant.ability,
        label: "Observant",
        value: 1,
        maxScore: 10,
        order
      });
    } else if (entry.feat === FEATS.PIERCER && entry.piercer) {
      abilityScoreBonuses.push({
        ability: entry.piercer.ability,
        label: "Piercer",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.POISONER && entry.poisoner) {
      abilityScoreBonuses.push({
        ability: entry.poisoner.ability,
        label: "Poisoner",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.POLEARM_MASTER && entry.polearmMaster) {
      abilityScoreBonuses.push({
        ability: entry.polearmMaster.ability,
        label: "Polearm Master",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.RITUAL_CASTER && entry.ritualCaster) {
      abilityScoreBonuses.push({
        ability: entry.ritualCaster.ability,
        label: "Ritual Caster",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.RESILIENT && entry.resilient) {
      abilityScoreBonuses.push({
        ability: entry.resilient.ability,
        label: "Resilient",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.SENTINEL && entry.sentinel) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.SENTINEL),
        isSentinelGuardianHaltDescriptionEntry
      );

      abilityScoreBonuses.push({
        ability: entry.sentinel.ability,
        label: "Sentinel",
        value: 1,
        maxScore: 20,
        order
      });
      derivedStatusEntries.push({
        id: `${sentinelGuardianHaltStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Sentinel",
        source: "Sentinel",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: sentinelGuardianHaltStatusSourceId,
        description: description.join("\n")
      });
    } else if (entry.feat === FEATS.SHADOW_TOUCHED && entry.shadowTouched) {
      abilityScoreBonuses.push({
        ability: entry.shadowTouched.ability,
        label: "Shadow-Touched",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.SHARPSHOOTER) {
      abilityScoreBonuses.push({
        ability: "DEX",
        label: "Sharpshooter",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.SHIELD_MASTER) {
      abilityScoreBonuses.push({
        ability: "STR",
        label: "Shield Master",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.SKULKER) {
      abilityScoreBonuses.push({
        ability: "DEX",
        label: "Skulker",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.SKILL_EXPERT && entry.skillExpert) {
      abilityScoreBonuses.push({
        ability: entry.skillExpert.ability,
        label: "Skill Expert",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.SLASHER && entry.slasher) {
      abilityScoreBonuses.push({
        ability: entry.slasher.ability,
        label: "Slasher",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.SPELL_SNIPER && entry.spellSniper) {
      abilityScoreBonuses.push({
        ability: entry.spellSniper.ability,
        label: "Spell Sniper",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.TELEKINETIC && entry.telekinetic) {
      abilityScoreBonuses.push({
        ability: entry.telekinetic.ability,
        label: "Telekinetic",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.TELEPATHIC && entry.telepathic) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.TELEPATHIC),
        isTelepathicUtteranceDescriptionEntry
      );

      abilityScoreBonuses.push({
        ability: entry.telepathic.ability,
        label: "Telepathic",
        value: 1,
        maxScore: 20,
        order
      });
      derivedStatusEntries.push({
        id: `${telepathicUtteranceStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Telepathic",
        source: "Telepathic",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: telepathicUtteranceStatusSourceId,
        description: description.join("\n")
      });
    } else if (entry.feat === FEATS.WAR_CASTER && entry.warCaster) {
      abilityScoreBonuses.push({
        ability: entry.warCaster.ability,
        label: "War Caster",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.SPEEDY && entry.speedy) {
      const agileMovementDescription = filterDescriptionEntries(
        getFeatDescription(FEATS.SPEEDY),
        isSpeedyAgileMovementDescriptionEntry
      );

      abilityScoreBonuses.push({
        ability: entry.speedy.ability,
        label: "Speedy",
        value: 1,
        maxScore: 20,
        order
      });
      derivedStatusEntries.push({
        id: `${speedyAgileMovementStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Agile Movement",
        source: "Speedy",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: speedyAgileMovementStatusSourceId,
        description: agileMovementDescription.join("\n")
      });
    } else if (entry.feat === FEATS.WEAPON_MASTER && entry.weaponMaster) {
      abilityScoreBonuses.push({
        ability: entry.weaponMaster.ability,
        label: "Weapon Master",
        value: 1,
        maxScore: 20,
        order
      });
    } else if (entry.feat === FEATS.ACTOR) {
      const actorDescription = getFeatDescription(FEATS.ACTOR).filter(
        (descriptionEntry) =>
          typeof descriptionEntry === "string" &&
          (descriptionEntry.includes("<strong>Impersonation.</strong>") ||
            descriptionEntry.includes("<strong>Mimicry.</strong>"))
      );

      abilityScoreBonuses.push({
        ability: "CHA",
        label: "Actor",
        value: 1,
        maxScore: 20,
        order
      });
      derivedStatusEntries.push({
        id: `${actorStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Actor",
        source: "Actor",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: actorStatusSourceId,
        description: actorDescription.join("\n")
      });
    } else if (entry.feat === FEATS.BOON_OF_ENERGY_RESISTANCE && entry.boonOfEnergyResistance) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_ENERGY_RESISTANCE),
        isBoonOfEnergyResistanceEnergyResistancesDescriptionEntry
      );

      abilityScoreBonuses.push({
        ability: entry.boonOfEnergyResistance.ability,
        label: "Boon of Energy Resistance",
        value: 1,
        maxScore: 30,
        order
      });
      entry.boonOfEnergyResistance.damageTypes.forEach((damageType) => {
        derivedStatusEntries.push({
          id: `${boonOfEnergyResistanceStatusSourceIdPrefix}${entry.id}-${damageType.toLowerCase()}`,
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: damageType,
          source: "Boon of Energy Resistance",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
          duration: {
            kind: STATUS_DURATION_KIND.INFINITE
          },
          sourceId: `${boonOfEnergyResistanceStatusSourceIdPrefix}${entry.id}-${damageType.toLowerCase()}`,
          description: description.join("\n")
        });
      });
    } else if (
      entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE &&
      entry.boonOfIrresistibleOffense
    ) {
      abilityScoreBonuses.push({
        ability: entry.boonOfIrresistibleOffense.ability,
        label: "Boon of Irresistible Offense",
        value: 1,
        maxScore: 30,
        order
      });
    } else if (entry.feat === FEATS.BOON_OF_SKILL && entry.boonOfSkill) {
      abilityScoreBonuses.push({
        ability: entry.boonOfSkill.ability,
        label: "Boon of Skill",
        value: 1,
        maxScore: 30,
        order
      });
    } else if (entry.epicBoonAbilityChoice) {
      abilityScoreBonuses.push({
        ability: entry.epicBoonAbilityChoice.ability,
        label: getFeatLabel(entry.feat),
        value: 1,
        maxScore: 30,
        order
      });
    }

    if (entry.feat === FEATS.BOON_OF_THE_NIGHT_SPIRIT) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_THE_NIGHT_SPIRIT),
        isBoonOfNightSpiritDescriptionEntry
      );

      derivedStatusEntries.push({
        id: `${boonOfNightSpiritStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Night Spirit",
        source: "Boon of the Night Spirit",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: boonOfNightSpiritStatusSourceId,
        description: description.join("\n")
      });
    }

    if (entry.feat === FEATS.BOON_OF_TRUESIGHT) {
      derivedStatusEntries.push({
        id: `feat-boon-of-truesight-${index}`,
        group: STATUS_ENTRY_GROUP.SENSES,
        value: SENSE.TRUESIGHT,
        source: "Boon of Truesight",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        rangeFeet: 60
      });
    }

    if (entry.feat === FEATS.BLIND_FIGHTING) {
      derivedStatusEntries.push({
        id: `${blindFightingBlindsightStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.SENSES,
        value: SENSE.BLINDSIGHT,
        source: "Blind Fighting",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: blindFightingBlindsightStatusSourceId,
        rangeFeet: 10
      });
    }

    if (entry.feat === FEATS.SKULKER) {
      derivedStatusEntries.push({
        id: `${skulkerBlindsightStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.SENSES,
        value: SENSE.BLINDSIGHT,
        source: "Skulker",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: skulkerBlindsightStatusSourceId,
        rangeFeet: 10
      });
    }
  });

  const luckyPointsTotal = featSet.has(FEATS.LUCKY) ? getFeatProficiencyBonusForLevel(level) : 0;
  const hitPointMaximumBonus =
    (featSet.has(FEATS.TOUGH) ? level * 2 : 0) +
    (featSet.has(FEATS.BOON_OF_FORTITUDE) ? 40 : 0);
  const speedBonuses: FeatureSpeedBonus[] = [];

  if (featSet.has(FEATS.ATHLETE)) {
    speedBonuses.push({
      label: "Athlete",
      movementType: "climb",
      value: 0,
      setBaseFromWalkMultiplier: 1
    });
  }

  if (featSet.has(FEATS.SPEEDY)) {
    speedBonuses.push({
      label: "Speedy: Speed Increase",
      movementType: "walk",
      value: 10
    });
  }

  if (featSet.has(FEATS.BOON_OF_SPEED)) {
    speedBonuses.push({
      label: "Boon of Speed: Quickness",
      movementType: "walk",
      value: 30
    });
  }

  const luckyPointsExpended = getLuckyPointsExpended(normalizedFeats, luckyPointsTotal);
  const luckyPointsRemaining = Math.max(0, luckyPointsTotal - luckyPointsExpended);
  const boonOfFateImproveFateTotal = featSet.has(FEATS.BOON_OF_FATE) ? 1 : 0;
  const boonOfFateImproveFateExpended = normalizedFeats.some(
    (entry) =>
      entry.feat === FEATS.BOON_OF_FATE && entry.boonOfFate?.improveFateExpended === true
  );
  const boonOfFateImproveFateRemaining =
    boonOfFateImproveFateTotal > 0 && !boonOfFateImproveFateExpended ? 1 : 0;
  const boonOfRecoveryDiceTotal = featSet.has(FEATS.BOON_OF_RECOVERY) ? 10 : 0;
  const boonOfRecoveryDiceExpended = Math.max(
    0,
    Math.min(
      boonOfRecoveryDiceTotal,
      normalizedFeats.reduce(
        (total, entry) =>
          entry.feat === FEATS.BOON_OF_RECOVERY
            ? total + (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0)
            : total,
        0
      )
    )
  );
  const boonOfRecoveryDiceRemaining = Math.max(
    0,
    boonOfRecoveryDiceTotal - boonOfRecoveryDiceExpended
  );
  const mageSlayerGuardedMindTotal = featSet.has(FEATS.MAGE_SLAYER) ? 1 : 0;
  const mageSlayerGuardedMindExpended = normalizedFeats.some(
    (entry) => entry.feat === FEATS.MAGE_SLAYER && entry.mageSlayer?.guardedMindExpended === true
  );
  const mageSlayerGuardedMindRemaining =
    mageSlayerGuardedMindTotal > 0 && !mageSlayerGuardedMindExpended ? 1 : 0;
  const ritualCasterEntries = normalizedFeats.filter(
    (entry) => entry.feat === FEATS.RITUAL_CASTER && entry.ritualCaster
  );
  const ritualCasterQuickRitualTotal = ritualCasterEntries.length;
  const ritualCasterQuickRitualExpended = ritualCasterEntries.filter(
    (entry) => entry.ritualCaster?.quickRitualExpended === true
  ).length;
  const ritualCasterQuickRitualRemaining = Math.max(
    0,
    ritualCasterQuickRitualTotal - ritualCasterQuickRitualExpended
  );
  const telepathicDetectThoughtsTotal = telepathicDetectThoughtsFreeCastEntries.length;
  const telepathicDetectThoughtsExpended = telepathicDetectThoughtsFreeCastEntries.filter(
    (entry) => entry.expended
  ).length;
  const telepathicDetectThoughtsRemaining = Math.max(
    0,
    telepathicDetectThoughtsTotal - telepathicDetectThoughtsExpended
  );
  const actions: FeatureActionCard[] = featSet.has(FEATS.LUCKY)
    ? [createLuckyAction(luckyPointsRemaining, luckyPointsTotal, getFeatDescription(FEATS.LUCKY))]
    : [];
  const reactionEntries: ReactionEntry[] = [];

  if (featSet.has(FEATS.DEFENSIVE_DUELIST)) {
    reactionEntries.push({
      id: defensiveDuelistParryReactionEntryId,
      reaction: REACTION.PARRY,
      name: "Parry",
      sourceType: "feat",
      sourceLabel: "Defensive Duelist",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.DEFENSIVE_DUELIST),
        isDefensiveDuelistParryDescriptionEntry
      )
    });
  }

  if (
    normalizedFeats.some(
      (entry) => entry.feat === FEATS.BOON_OF_ENERGY_RESISTANCE && entry.boonOfEnergyResistance
    )
  ) {
    reactionEntries.push({
      id: boonOfEnergyResistanceReactionEntryId,
      reaction: REACTION.ENERGY_REDIRECTION,
      name: "Energy Redirection",
      sourceType: "feat",
      sourceLabel: "Boon of Energy Resistance",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.BOON_OF_ENERGY_RESISTANCE),
        isBoonOfEnergyResistanceEnergyRedirectionDescriptionEntry
      )
    });
  }

  if (featSet.has(FEATS.INTERCEPTION)) {
    reactionEntries.push({
      id: interceptionReactionEntryId,
      reaction: REACTION.INTERCEPTION,
      name: "Interception",
      sourceType: "feat",
      sourceLabel: "Interception",
      description: getFeatDescription(FEATS.INTERCEPTION)
    });
  }

  if (featSet.has(FEATS.PROTECTION)) {
    reactionEntries.push({
      id: protectionReactionEntryId,
      reaction: REACTION.PROTECTION,
      name: "Interception",
      sourceType: "feat",
      sourceLabel: "Protection",
      description: getFeatDescription(FEATS.PROTECTION)
    });
  }

  if (featSet.has(FEATS.POLEARM_MASTER)) {
    reactionEntries.push({
      id: polearmMasterReactiveStrikeReactionEntryId,
      reaction: REACTION.REACTIVE_STRIKE,
      name: "Reactive Strike",
      sourceType: "feat",
      sourceLabel: "Polearm Master",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.POLEARM_MASTER),
        isPolearmMasterReactiveStrikeDescriptionEntry
      )
    });
  }

  if (featSet.has(FEATS.SHIELD_MASTER)) {
    reactionEntries.push({
      id: shieldMasterReactionEntryId,
      reaction: REACTION.SHIELD_MASTER,
      name: "Shield Master",
      sourceType: "feat",
      sourceLabel: "Shield Master",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.SHIELD_MASTER),
        isShieldMasterInterposeShieldDescriptionEntry
      )
    });
  }

  if (featSet.has(FEATS.WAR_CASTER)) {
    reactionEntries.push({
      id: warCasterReactiveSpellReactionEntryId,
      reaction: REACTION.REACTIVE_SPELL,
      name: "Reactive Spell",
      sourceType: "feat",
      sourceLabel: "War Caster",
      description: filterDescriptionEntries(
        getFeatDescription(FEATS.WAR_CASTER),
        isWarCasterReactiveSpellDescriptionEntry
      )
    });
  }

  return {
    normalizedFeats,
    featsByFeat,
    featSet,
    grantedCantripEntries: [...grantedCantripEntriesById.values()].sort((left, right) =>
      left.name.localeCompare(right.name)
    ),
    alwaysPreparedCantripEntries: [...alwaysPreparedCantripEntriesById.values()].sort(
      (left, right) => left.name.localeCompare(right.name)
    ),
    alwaysPreparedSpellEntries: [...alwaysPreparedSpellEntriesById.values()].sort((left, right) =>
      left.name.localeCompare(right.name)
    ),
    magicInitiateSpellcastingAbilityBySpellId,
    magicInitiateFreeCastEntries,
    feyTouchedFreeCastEntries,
    shadowTouchedFreeCastEntries,
    telepathicDetectThoughtsFreeCastEntries,
    abilityScoreBonuses,
    speedBonuses,
    hitPointMaximumBonus,
    derivedStatusEntries,
    actions,
    reactionEntries,
    hasCrafterDiscount: featSet.has(FEATS.CRAFTER),
    hasDefenseFightingStyle: featSet.has(FEATS.DEFENSE),
    hasHealer: featSet.has(FEATS.HEALER),
    hasFeyTouched: featSet.has(FEATS.FEY_TOUCHED),
    hasBoonOfFate: featSet.has(FEATS.BOON_OF_FATE),
    hasBoonOfRecovery: featSet.has(FEATS.BOON_OF_RECOVERY),
    hasBoonOfSpellRecall: featSet.has(FEATS.BOON_OF_SPELL_RECALL),
    hasLucky: featSet.has(FEATS.LUCKY),
    hasMageSlayer: featSet.has(FEATS.MAGE_SLAYER),
    hasMagicInitiate: featSet.has(FEATS.MAGIC_INITIATE),
    hasRitualCaster: featSet.has(FEATS.RITUAL_CASTER),
    hasShadowTouched: featSet.has(FEATS.SHADOW_TOUCHED),
    hasTelepathic: featSet.has(FEATS.TELEPATHIC),
    luckyPointsRemaining,
    luckyPointsTotal,
    boonOfFateImproveFateRemaining,
    boonOfFateImproveFateTotal,
    boonOfRecoveryDiceRemaining,
    boonOfRecoveryDiceTotal,
    mageSlayerGuardedMindRemaining,
    mageSlayerGuardedMindTotal,
    ritualCasterQuickRitualRemaining,
    ritualCasterQuickRitualTotal,
    telepathicDetectThoughtsRemaining,
    telepathicDetectThoughtsTotal
  };
}

export function collectFeatDerivedState(character: FeatRuntimeCharacter): FeatDerivedState {
  const level = normalizeFeatRuntimeLevel(character.level);
  const cachedState = getCachedFeatDerivedState(character.feats, level);

  if (cachedState) {
    return cachedState;
  }

  const state = createFeatDerivedState(character.feats, level);

  setCachedFeatDerivedState(character.feats, level, state);
  return state;
}

export function getNormalizedFeatsForCharacter(character: FeatRuntimeCharacter) {
  return collectFeatDerivedState(character).normalizedFeats;
}

export function hasFeatForCharacter(character: FeatRuntimeCharacter, feat: FEATS): boolean {
  return collectFeatDerivedState(character).featSet.has(feat);
}

export function transformFeatSpellEntryForCharacter(
  character: FeatRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  return collectFeatDerivedState(character).normalizedFeats.reduce<SpellEntry>(
    (currentSpell, entry) => {
      if (entry.feat === FEATS.BOON_OF_DIMENSIONAL_TRAVEL) {
        const description = getFeatDescriptionSlice(
          FEATS.BOON_OF_DIMENSIONAL_TRAVEL,
          isBoonOfDimensionalTravelBlinkStepsDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(
              currentSpell,
              getFeatLabel(FEATS.BOON_OF_DIMENSIONAL_TRAVEL),
              description
            )
          : currentSpell;
      }

      if (
        entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE &&
        entry.boonOfIrresistibleOffense &&
        doesSpellDealAnyDamageType(currentSpell, [
          DAMAGE_TYPE.BLUDGEONING,
          DAMAGE_TYPE.PIERCING,
          DAMAGE_TYPE.SLASHING
        ])
      ) {
        const description = getFeatDescriptionSlice(
          FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
          isBoonOfIrresistibleOffenseDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(
              currentSpell,
              getFeatLabel(FEATS.BOON_OF_IRRESISTIBLE_OFFENSE),
              description
            )
          : currentSpell;
      }

      if (
        entry.feat === FEATS.BOON_OF_SPELL_RECALL &&
        currentSpell.spellLevel >= 1 &&
        currentSpell.spellLevel <= 4
      ) {
        const description = getFeatDescriptionSlice(
          FEATS.BOON_OF_SPELL_RECALL,
          isBoonOfSpellRecallFreeCastingDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(
              currentSpell,
              getFeatLabel(FEATS.BOON_OF_SPELL_RECALL),
              description
            )
          : currentSpell;
      }

      if (
        entry.feat === FEATS.ELEMENTAL_ADEPT &&
        entry.elementalAdept &&
        doesSpellDealDamageType(currentSpell, entry.elementalAdept.damageType)
      ) {
        return appendSourcedDescriptionAddition(
          currentSpell,
          `Elemental Adept: Energy Mastery (${formatCodexLabel(entry.elementalAdept.damageType)})`,
          [elementalAdeptEnergyMasteryDescription]
        );
      }

      if (
        entry.feat === FEATS.SPELL_SNIPER &&
        entry.spellSniper &&
        currentSpell.isAttackSpell === true
      ) {
        const description = getFeatDescriptionSlice(
          FEATS.SPELL_SNIPER,
          isSpellSniperDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(
              currentSpell,
              getFeatLabel(FEATS.SPELL_SNIPER),
              description
            )
          : currentSpell;
      }

      if (
        entry.feat === FEATS.TELEKINETIC &&
        entry.telekinetic &&
        currentSpell.id === telekineticMageHandSpellId
      ) {
        const description = getFeatDescriptionSlice(
          FEATS.TELEKINETIC,
          isTelekineticMinorTelekinesisDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(
              currentSpell,
              "Telekinetic: Minor Telekinesis",
              description
            )
          : currentSpell;
      }

      if (
        entry.feat === FEATS.TELEPATHIC &&
        entry.telepathic &&
        currentSpell.id === telepathicDetectThoughtsSpellId
      ) {
        const description = getFeatDescriptionSlice(
          FEATS.TELEPATHIC,
          isTelepathicDetectThoughtsDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(
              currentSpell,
              "Telepathic: Detect Thoughts",
              description
            )
          : currentSpell;
      }

      if (
        entry.feat === FEATS.WAR_CASTER &&
        entry.warCaster &&
        currentSpell.components.includes(SPELL_COMPONENT.S)
      ) {
        const description = getFeatDescriptionSlice(
          FEATS.WAR_CASTER,
          isWarCasterSomaticComponentsDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(
              currentSpell,
              "War Caster: Somatic Components",
              description
            )
          : currentSpell;
      }

      if (
        entry.feat === FEATS.PIERCER &&
        entry.piercer &&
        doesSpellDealDamageType(currentSpell, DAMAGE_TYPE.PIERCING)
      ) {
        const description = getFeatDescriptionSlice(
          FEATS.PIERCER,
          isPiercerWeaponActionDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(
              currentSpell,
              getFeatLabel(FEATS.PIERCER),
              description
            )
          : currentSpell;
      }

      if (
        entry.feat === FEATS.POISONER &&
        entry.poisoner &&
        doesSpellDealDamageType(currentSpell, DAMAGE_TYPE.POISON)
      ) {
        const description = getFeatDescriptionSlice(
          FEATS.POISONER,
          isPoisonerPotentPoisonDescriptionEntry
        );

        return description.length > 0
          ? appendSourcedDescriptionAddition(currentSpell, "Poisoner: Potent Poison", description)
          : currentSpell;
      }

      if (
        entry.feat === FEATS.RITUAL_CASTER &&
        entry.ritualCaster &&
        currentSpell.ritual === true
      ) {
        return appendSourcedDescriptionAddition(
          currentSpell,
          "Ritual Caster: Quick Ritual",
          [ritualCasterQuickRitualDescription]
        );
      }

      if (
        entry.feat === FEATS.SHADOW_TOUCHED &&
        entry.shadowTouched &&
        (currentSpell.id === entry.shadowTouched.spellId ||
          currentSpell.id === shadowTouchedInvisibilitySpellId)
      ) {
        return appendSourcedDescriptionAddition(
          currentSpell,
          "Shadow-Touched: Shadow Magic",
          [shadowTouchedShadowMagicDescription]
        );
      }

      if (
        entry.feat !== FEATS.FEY_TOUCHED ||
        !entry.feyTouched ||
        (currentSpell.id !== entry.feyTouched.spellId &&
          currentSpell.id !== feyTouchedMistyStepSpellId)
      ) {
        return currentSpell;
      }

      return appendSourcedDescriptionAddition(
        currentSpell,
        "Fey-Touched: Fey Magic",
        [feyTouchedFeyMagicDescription]
      );
    },
    spell
  );
}

export function getFeatGrantedCantripEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellEntry[] {
  return collectFeatDerivedState(character).grantedCantripEntries;
}

export function getFeatAlwaysPreparedCantripEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellEntry[] {
  return collectFeatDerivedState(character).alwaysPreparedCantripEntries;
}

export function getFeatAlwaysPreparedSpellEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellEntry[] {
  return collectFeatDerivedState(character).alwaysPreparedSpellEntries;
}

export function getMagicInitiateSpellcastingAbilityForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): AbilityKey | null {
  return (
    collectFeatDerivedState(character).magicInitiateSpellcastingAbilityBySpellId.get(spellId) ??
    null
  );
}

export function getMagicInitiateFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = collectFeatDerivedState(character).magicInitiateFreeCastEntries.filter(
    (entry) => entry.spellId === spellId
  );

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function getFeyTouchedFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = collectFeatDerivedState(character).feyTouchedFreeCastEntries.filter(
    (entry) => entry.spellId === spellId
  );

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function getShadowTouchedFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = collectFeatDerivedState(character).shadowTouchedFreeCastEntries.filter(
    (entry) => entry.spellId === spellId
  );

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function getTelepathicDetectThoughtsFreeCastStateForCharacter(
  character: FeatRuntimeCharacter,
  spellId: string
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = collectFeatDerivedState(
    character
  ).telepathicDetectThoughtsFreeCastEntries.filter((entry) => entry.spellId === spellId);

  if (entries.length === 0) {
    return null;
  }

  const usesRemaining = entries.filter((entry) => !entry.expended).length;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: entries.length
  };
}

export function getRitualCasterQuickRitualStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasRitualCaster || derivedState.ritualCasterQuickRitualTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.ritualCasterQuickRitualRemaining > 0,
    expended: derivedState.ritualCasterQuickRitualRemaining <= 0,
    usesRemaining: derivedState.ritualCasterQuickRitualRemaining,
    usesTotal: derivedState.ritualCasterQuickRitualTotal
  };
}

export function getFeatAbilityScoreBonusesForCharacter(
  character: FeatRuntimeCharacter
): FeatDerivedState["abilityScoreBonuses"] {
  return collectFeatDerivedState(character).abilityScoreBonuses;
}

export function getFeatSpeedBonusesForCharacter(
  character: FeatRuntimeCharacter
): FeatDerivedState["speedBonuses"] {
  return collectFeatDerivedState(character).speedBonuses;
}

export function getFeatHitPointMaximumBonusForCharacter(character: FeatRuntimeCharacter): number {
  return collectFeatDerivedState(character).hitPointMaximumBonus;
}

export function getFeatArmorClassBonusesForCharacter(
  character: FeatRuntimeCharacter,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  if (!context.hasWornBodyArmor || !collectFeatDerivedState(character).hasDefenseFightingStyle) {
    return [];
  }

  return [
    {
      label: "Defense",
      value: 1
    }
  ];
}

export function getFeatDerivedStatusEntriesForCharacter(
  character: FeatRuntimeCharacter
): FeatDerivedState["derivedStatusEntries"] {
  return collectFeatDerivedState(character).derivedStatusEntries;
}

export function getAthleteSpeedDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.ATHLETE)) {
    return [];
  }

  const athleteDescription = getFeatDescriptionSlice(
    FEATS.ATHLETE,
    (descriptionEntry) =>
      descriptionEntry.startsWith("<strong>Hop Up.</strong>") ||
      descriptionEntry.startsWith("<strong>Jumping.</strong>")
  );

  return athleteDescription.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.ATHLETE), athleteDescription)]
    : [];
}

export function getChargerDashDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CHARGER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CHARGER, isChargerImprovedDashDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.CHARGER), description)]
    : [];
}

export function getSpeedyDashDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SPEEDY)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.SPEEDY,
    isSpeedyDashOverDifficultTerrainDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SPEEDY), description)]
    : [];
}

export function getBoonOfSpeedDisengageDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.BOON_OF_SPEED)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.BOON_OF_SPEED,
    isBoonOfSpeedEscapeArtistDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.BOON_OF_SPEED), description)]
    : [];
}

export function hasBoonOfSpeedDisengageBonusActionPath(
  character: FeatRuntimeCharacter,
  actionKey: string
): boolean {
  return actionKey === "common-action-disengage" && hasFeatForCharacter(character, FEATS.BOON_OF_SPEED);
}

export function getChargerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ChargerWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CHARGER) || !isChargerMeleeWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CHARGER, isChargerChargeAttackDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.CHARGER), description)]
    : [];
}

export function getArcheryWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ArcheryWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.ARCHERY) || !isArcheryWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.ARCHERY, isArcheryWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.ARCHERY), description)]
    : [];
}

export function getDuelingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DuelingWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.DUELING) || !isDuelingWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.DUELING, isDuelingWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.DUELING), description)]
    : [];
}

export function getBoonOfCombatProwessWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: EpicBoonWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.BOON_OF_COMBAT_PROWESS) ||
    !isEpicBoonWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.BOON_OF_COMBAT_PROWESS,
    isBoonOfCombatProwessPeerlessAimDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.BOON_OF_COMBAT_PROWESS), description)]
    : [];
}

export function getBoonOfDimensionalTravelWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: EpicBoonWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.BOON_OF_DIMENSIONAL_TRAVEL) ||
    !isEpicBoonWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.BOON_OF_DIMENSIONAL_TRAVEL,
    isBoonOfDimensionalTravelBlinkStepsDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.BOON_OF_DIMENSIONAL_TRAVEL), description)]
    : [];
}

export function getBoonOfIrresistibleOffenseWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) ||
    !isBoonOfIrresistibleOffenseWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
    isBoonOfIrresistibleOffenseDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.BOON_OF_IRRESISTIBLE_OFFENSE), description)]
    : [];
}

export function getThrownWeaponFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ThrownWeaponFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.THROWN_WEAPON_FIGHTING) ||
    !isThrownWeaponFightingWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.THROWN_WEAPON_FIGHTING,
    isThrownWeaponFightingWeaponActionDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.THROWN_WEAPON_FIGHTING), description)]
    : [];
}

export function getTwoWeaponFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: TwoWeaponFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.TWO_WEAPON_FIGHTING) ||
    !isTwoWeaponFightingWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.TWO_WEAPON_FIGHTING,
    isTwoWeaponFightingWeaponActionDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.TWO_WEAPON_FIGHTING), description)]
    : [];
}

export function getUnarmedFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: UnarmedFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.UNARMED_FIGHTING) ||
    !isUnarmedFightingWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.UNARMED_FIGHTING,
    isUnarmedFightingWeaponActionDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.UNARMED_FIGHTING), description)]
    : [];
}

export function getCrusherWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: CrusherWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CRUSHER) || !isCrusherWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CRUSHER, isCrusherWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.CRUSHER), description)]
    : [];
}

export function getPiercerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.PIERCER) || !isPiercerWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.PIERCER, isPiercerWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.PIERCER), description)]
    : [];
}

export function getSlasherWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SLASHER) || !isSlasherWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.SLASHER, isSlasherWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SLASHER), description)]
    : [];
}

export function getPoisonerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.POISONER) || !isPoisonerWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.POISONER,
    isPoisonerPotentPoisonDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries("Poisoner: Potent Poison", description)]
    : [];
}

export function getDualWielderWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DualWielderWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.DUAL_WIELDER) || !isDualWielderWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.DUAL_WIELDER,
    isDualWielderEnhancedDualWieldingDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.DUAL_WIELDER), description)]
    : [];
}

export function getGreatWeaponMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: GreatWeaponMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.GREAT_WEAPON_MASTER)) {
    return [];
  }

  const description: SpellDescriptionEntry[] = [
    ...(isGreatWeaponMasterHeavyWeaponAction(action)
      ? getFeatDescriptionSlice(
          FEATS.GREAT_WEAPON_MASTER,
          isGreatWeaponMasterHeavyWeaponMasteryDescriptionEntry
        )
      : []),
    ...(isGreatWeaponMasterMeleeWeaponAction(action)
      ? getFeatDescriptionSlice(FEATS.GREAT_WEAPON_MASTER, isGreatWeaponMasterHewDescriptionEntry)
      : [])
  ];

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.GREAT_WEAPON_MASTER), description)]
    : [];
}

export function getPolearmMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: PolearmMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.POLEARM_MASTER) ||
    !isPolearmMasterWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.POLEARM_MASTER,
    isPolearmMasterPoleStrikeDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.POLEARM_MASTER), description)]
    : [];
}

export function getCrossbowExpertWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: CrossbowExpertWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.CROSSBOW_EXPERT) ||
    !isCrossbowExpertWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.CROSSBOW_EXPERT,
    isCrossbowExpertDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.CROSSBOW_EXPERT), description)]
    : [];
}

export function getSharpshooterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: SharpshooterWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SHARPSHOOTER) || !isSharpshooterWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.SHARPSHOOTER, isSharpshooterDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SHARPSHOOTER), description)]
    : [];
}

export function getShieldMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ShieldMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SHIELD_MASTER) || !isShieldMasterWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.SHIELD_MASTER,
    isShieldMasterShieldBashDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SHIELD_MASTER), description)]
    : [];
}

export function getChefShortRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CHEF)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CHEF, isChefReplenishingMealDescriptionEntry);

  return description.length > 0 ? [createSourcedDescriptionEntries("Chef", description)] : [];
}

export function getChefLongRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CHEF)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CHEF, isChefBolsteringTreatsDescriptionEntry);

  return description.length > 0 ? [createSourcedDescriptionEntries("Chef", description)] : [];
}

export function getInspiringLeaderRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.INSPIRING_LEADER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.INSPIRING_LEADER,
    isInspiringLeaderBolsteringPerformanceDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.INSPIRING_LEADER), description)]
    : [];
}

export function getWeaponMasterLongRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.WEAPON_MASTER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.WEAPON_MASTER,
    isWeaponMasterMasteryPropertyDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.WEAPON_MASTER), description)]
    : [];
}

export function getKeenMindStudyDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.KEEN_MIND)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.KEEN_MIND, isKeenMindQuickStudyDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.KEEN_MIND), description)]
    : [];
}

export function getObservantSearchDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.OBSERVANT)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.OBSERVANT,
    isObservantQuickSearchDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.OBSERVANT), description)]
    : [];
}

export function getSkulkerHideDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SKULKER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.SKULKER, isSkulkerHideDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SKULKER), description)]
    : [];
}

export function getMageSlayerGuardedMindDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.MAGE_SLAYER) ||
    (ability !== "INT" && ability !== "WIS" && ability !== "CHA")
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.MAGE_SLAYER,
    isMageSlayerGuardedMindDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries("Mage Slayer: Guarded Mind", description)]
    : [];
}

export function getShieldMasterInterposeShieldDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SHIELD_MASTER) || ability !== "DEX") {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.SHIELD_MASTER,
    isShieldMasterInterposeShieldDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SHIELD_MASTER), description)]
    : [];
}

export function getWarCasterConcentrationDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.WAR_CASTER) || ability !== "CON") {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.WAR_CASTER,
    isWarCasterConcentrationDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries("War Caster: Concentration", description)]
    : [];
}

export function getMageSlayerGuardedMindStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasMageSlayer || derivedState.mageSlayerGuardedMindTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.mageSlayerGuardedMindRemaining > 0,
    expended: derivedState.mageSlayerGuardedMindRemaining <= 0,
    usesRemaining: derivedState.mageSlayerGuardedMindRemaining,
    usesTotal: derivedState.mageSlayerGuardedMindTotal
  };
}

export function getMediumArmorMasterArmorClassDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.MEDIUM_ARMOR_MASTER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.MEDIUM_ARMOR_MASTER,
    isMediumArmorMasterDexterousWearerDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.MEDIUM_ARMOR_MASTER), description)]
    : [];
}

export function hasMediumArmorMasterForCharacter(character: FeatRuntimeCharacter): boolean {
  return hasFeatForCharacter(character, FEATS.MEDIUM_ARMOR_MASTER);
}

export function hasKeenMindStudyBonusActionPath(
  character: FeatRuntimeCharacter,
  actionKey: string
): boolean {
  return actionKey === "common-action-study" && hasFeatForCharacter(character, FEATS.KEEN_MIND);
}

export function hasObservantSearchBonusActionPath(
  character: FeatRuntimeCharacter,
  actionKey: string
): boolean {
  return actionKey === "common-action-search" && hasFeatForCharacter(character, FEATS.OBSERVANT);
}

export function transformFeatWeaponActionForCharacter<
  T extends ArcheryWeaponActionContext & {
    attackBonusEntries?: Array<{
      label: string;
      value: number;
    }>;
  }
>(character: FeatRuntimeCharacter, action: T): T {
  if (!hasFeatForCharacter(character, FEATS.ARCHERY) || !isArcheryWeaponAction(action)) {
    return action;
  }

  return {
    ...action,
    attackBonusEntries: [
      ...(action.attackBonusEntries ?? []),
      {
        label: getFeatLabel(FEATS.ARCHERY),
        value: 2
      }
    ]
  };
}

export function transformFeatCommonActionForCharacter<T extends Pick<FeatureActionCard, "key">>(
  character: FeatRuntimeCharacter,
  action: T & Pick<FeatureActionCard, "descriptionAdditions">
): T & Pick<FeatureActionCard, "descriptionAdditions"> {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (action.key === "common-action-dash") {
    descriptionAdditions.push(...getChargerDashDescriptionAdditionsForCharacter(character));
    descriptionAdditions.push(...getSpeedyDashDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-disengage") {
    descriptionAdditions.push(...getBoonOfSpeedDisengageDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-study") {
    descriptionAdditions.push(...getKeenMindStudyDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-search") {
    descriptionAdditions.push(...getObservantSearchDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-hide") {
    descriptionAdditions.push(...getSkulkerHideDescriptionAdditionsForCharacter(character));
  }

  if (descriptionAdditions.length === 0) {
    return action;
  }

  return {
    ...action,
    descriptionAdditions: [...(action.descriptionAdditions ?? []), ...descriptionAdditions]
  };
}

export function characterHasCrafterDiscount(character: FeatRuntimeCharacter): boolean {
  return collectFeatDerivedState(character).hasCrafterDiscount;
}

export function getDurableSpeedyRecoveryHealingFormulaForCharacter(
  character: FeatRuntimeCharacter
): string {
  return getHitDieFormulaForClass(character.className);
}

export function spendDurableSpeedyRecoveryHitDieForCharacter(character: Character): Character {
  if (!hasFeatForCharacter(character, FEATS.DURABLE)) {
    return character;
  }

  const hitDiceRemaining = getHitDiceRemainingForCharacter(character);

  if (hitDiceRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    hitDiceRemaining: hitDiceRemaining - 1
  };
}

export function getBoonOfFateImproveFateStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfFate || derivedState.boonOfFateImproveFateTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.boonOfFateImproveFateRemaining > 0,
    expended: derivedState.boonOfFateImproveFateRemaining <= 0,
    usesRemaining: derivedState.boonOfFateImproveFateRemaining,
    usesTotal: derivedState.boonOfFateImproveFateTotal
  };
}

export function consumeBoonOfFateImproveFateForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendImproveFate = false;

  if (!derivedState.hasBoonOfFate || derivedState.boonOfFateImproveFateRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendImproveFate ||
      entry.feat !== FEATS.BOON_OF_FATE ||
      entry.boonOfFate?.improveFateExpended === true
    ) {
      return entry;
    }

    didSpendImproveFate = true;

    return {
      ...entry,
      boonOfFate: {
        ...(entry.boonOfFate ?? {}),
        improveFateExpended: true
      }
    };
  });

  return didSpendImproveFate
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreBoonOfFateImproveFateForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreImproveFate = false;

  if (!derivedState.hasBoonOfFate) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (entry.feat !== FEATS.BOON_OF_FATE || entry.boonOfFate?.improveFateExpended !== true) {
      return entry;
    }

    didRestoreImproveFate = true;

    return {
      ...entry,
      boonOfFate: undefined
    };
  });

  return didRestoreImproveFate
    ? {
        ...character,
        feats
      }
    : character;
}

export function getBoonOfRecoveryRecoverVitalityStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasBoonOfRecovery || derivedState.boonOfRecoveryDiceTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.boonOfRecoveryDiceRemaining > 0,
    expended: derivedState.boonOfRecoveryDiceRemaining <= 0,
    usesRemaining: derivedState.boonOfRecoveryDiceRemaining,
    usesTotal: derivedState.boonOfRecoveryDiceTotal
  };
}

export function getBoonOfRecoveryRecoverVitalityFormula(diceCount: number): string {
  const normalizedDiceCount = Math.max(1, Math.min(10, Math.floor(Number(diceCount) || 1)));

  return `${normalizedDiceCount}d10`;
}

export function spendBoonOfRecoveryDiceForCharacter(
  character: Character,
  diceCount: number
): Character {
  const derivedState = collectFeatDerivedState(character);
  const normalizedDiceCount = Math.max(1, Math.min(10, Math.floor(Number(diceCount) || 1)));
  let didSpendRecoverVitalityDice = false;

  if (
    !derivedState.hasBoonOfRecovery ||
    normalizedDiceCount > derivedState.boonOfRecoveryDiceRemaining
  ) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendRecoverVitalityDice ||
      entry.feat !== FEATS.BOON_OF_RECOVERY ||
      (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0) >= 10
    ) {
      return entry;
    }

    didSpendRecoverVitalityDice = true;

    return {
      ...entry,
      boonOfRecovery: {
        ...(entry.boonOfRecovery ?? {}),
        recoverVitalityDiceExpended: Math.max(
          0,
          Math.min(
            10,
            (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0) + normalizedDiceCount
          )
        )
      }
    };
  });

  return didSpendRecoverVitalityDice
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreBoonOfRecoveryDiceForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreRecoverVitalityDice = false;

  if (!derivedState.hasBoonOfRecovery) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.BOON_OF_RECOVERY ||
      (entry.boonOfRecovery?.recoverVitalityDiceExpended ?? 0) <= 0
    ) {
      return entry;
    }

    didRestoreRecoverVitalityDice = true;

    return {
      ...entry,
      boonOfRecovery: undefined
    };
  });

  return didRestoreRecoverVitalityDice
    ? {
        ...character,
        feats
      }
    : character;
}

export function getBoonOfFortitudeHealingBonusForCharacter(
  character: FeatRuntimeCharacter
): number {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.featSet.has(FEATS.BOON_OF_FORTITUDE)) {
    return 0;
  }

  return Math.max(
    0,
    getAbilityModifierForCharacter(
      {
        ...character,
        feats: derivedState.normalizedFeats
      },
      "CON"
    )
  );
}

export function canUseBoonOfSpellRecallFreeCastingForSpell(
  character: FeatRuntimeCharacter,
  spell: SpellEntry
): boolean {
  const derivedState = collectFeatDerivedState(character);

  return derivedState.hasBoonOfSpellRecall && spell.spellLevel >= 1 && spell.spellLevel <= 4;
}

export function getFeatActionsForCharacter(character: FeatRuntimeCharacter): FeatureActionCard[] {
  const derivedState = collectFeatDerivedState(character);
  const actions = [...derivedState.actions];
  const telekineticEntry = derivedState.normalizedFeats.find(
    (entry) => entry.feat === FEATS.TELEKINETIC && entry.telekinetic
  );

  if (telekineticEntry?.telekinetic) {
    actions.push(
      createTelekineticShoveAction(
        character,
        telekineticEntry.telekinetic.ability,
        derivedState.normalizedFeats,
        getFeatDescriptionSlice(FEATS.TELEKINETIC, isTelekineticShoveDescriptionEntry)
      )
    );
  }

  if (derivedState.featSet.has(FEATS.DURABLE)) {
    actions.push(
      createDurableSpeedyRecoveryAction(
        character,
        getFeatDescriptionSlice(FEATS.DURABLE, isDurableSpeedyRecoveryDescriptionEntry)
      )
    );
  }

  if (derivedState.hasBoonOfFate) {
    actions.push(
      createBoonOfFateImproveFateAction(
        derivedState.boonOfFateImproveFateRemaining,
        derivedState.boonOfFateImproveFateTotal,
        getFeatDescriptionSlice(FEATS.BOON_OF_FATE, isBoonOfFateImproveFateDescriptionEntry)
      )
    );
  }

  if (derivedState.hasBoonOfRecovery) {
    actions.push(
      createBoonOfRecoveryRecoverVitalityAction(
        derivedState.boonOfRecoveryDiceRemaining,
        derivedState.boonOfRecoveryDiceTotal,
        getFeatDescriptionSlice(
          FEATS.BOON_OF_RECOVERY,
          isBoonOfRecoveryRecoverVitalityDescriptionEntry
        )
      )
    );
  }

  return actions;
}

export function getFeatReactionEntriesForCharacter(
  character: FeatRuntimeCharacter
): ReactionEntry[] {
  return collectFeatDerivedState(character).reactionEntries;
}

export function getFeatItemAdditionalDescriptionForCharacter(
  character: FeatRuntimeCharacter,
  item: Pick<ItemRecord, "id" | "key" | "name"> | null | undefined
): SpellDescriptionEntry[] {
  return getFeatItemAdditionalDescription(collectFeatDerivedState(character), item);
}

export function getSavageAttackerWeaponActionDescriptionAdditions(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SAVAGE_ATTACKER)) {
    return [];
  }

  const description = getFeatDefinition(FEATS.SAVAGE_ATTACKER)?.description ?? [];

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SAVAGE_ATTACKER), description)]
    : [];
}

export function getTavernBrawlerUnarmedStrikeDescriptionAdditions(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.TAVERN_BRAWLER)) {
    return [];
  }

  const description = getFeatDefinition(FEATS.TAVERN_BRAWLER)?.description ?? [];

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.TAVERN_BRAWLER), description)]
    : [];
}

export function getMusicianEncouragingSongDescriptionEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[] {
  if (!hasFeatForCharacter(character, FEATS.MUSICIAN)) {
    return [];
  }

  return filterDescriptionEntries(getFeatDefinition(FEATS.MUSICIAN)?.description ?? [], (entry) =>
    entry.includes("Encouraging Song")
  );
}

export function consumeMagicInitiateFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (!derivedState.hasMagicInitiate) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.MAGIC_INITIATE ||
      !entry.magicInitiate ||
      entry.magicInitiate.levelOneSpellId !== spellId ||
      entry.magicInitiate.freeCastExpended === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      magicInitiate: {
        ...entry.magicInitiate,
        freeCastExpended: true
      }
    };
  });

  return didSpendFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreMagicInitiateFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (!derivedState.hasMagicInitiate) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.MAGIC_INITIATE ||
      !entry.magicInitiate ||
      entry.magicInitiate.freeCastExpended !== true
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      magicInitiate: {
        ...entry.magicInitiate,
        freeCastExpended: undefined
      }
    };
  });

  return didRestoreFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeFeyTouchedFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (!derivedState.hasFeyTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.FEY_TOUCHED ||
      !entry.feyTouched ||
      (entry.feyTouched.spellId !== spellId && spellId !== feyTouchedMistyStepSpellId) ||
      entry.feyTouched.freeCastExpendedSpellIds?.includes(spellId) === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      feyTouched: {
        ...entry.feyTouched,
        freeCastExpendedSpellIds: [
          ...new Set([...(entry.feyTouched.freeCastExpendedSpellIds ?? []), spellId])
        ]
      }
    };
  });

  return didSpendFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreFeyTouchedFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (!derivedState.hasFeyTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.FEY_TOUCHED ||
      !entry.feyTouched ||
      !entry.feyTouched.freeCastExpendedSpellIds ||
      entry.feyTouched.freeCastExpendedSpellIds.length === 0
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      feyTouched: {
        ...entry.feyTouched,
        freeCastExpendedSpellIds: undefined
      }
    };
  });

  return didRestoreFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeRitualCasterQuickRitualForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendQuickRitual = false;

  if (!derivedState.hasRitualCaster || derivedState.ritualCasterQuickRitualRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendQuickRitual ||
      entry.feat !== FEATS.RITUAL_CASTER ||
      !entry.ritualCaster ||
      entry.ritualCaster.quickRitualExpended === true
    ) {
      return entry;
    }

    didSpendQuickRitual = true;

    return {
      ...entry,
      ritualCaster: {
        ...entry.ritualCaster,
        quickRitualExpended: true
      }
    };
  });

  return didSpendQuickRitual
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreRitualCasterQuickRitualForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreQuickRitual = false;

  if (!derivedState.hasRitualCaster) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.RITUAL_CASTER ||
      !entry.ritualCaster ||
      entry.ritualCaster.quickRitualExpended !== true
    ) {
      return entry;
    }

    didRestoreQuickRitual = true;

    return {
      ...entry,
      ritualCaster: {
        ...entry.ritualCaster,
        quickRitualExpended: undefined
      }
    };
  });

  return didRestoreQuickRitual
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeShadowTouchedFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (!derivedState.hasShadowTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.SHADOW_TOUCHED ||
      !entry.shadowTouched ||
      (entry.shadowTouched.spellId !== spellId && spellId !== shadowTouchedInvisibilitySpellId) ||
      entry.shadowTouched.freeCastExpendedSpellIds?.includes(spellId) === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      shadowTouched: {
        ...entry.shadowTouched,
        freeCastExpendedSpellIds: [
          ...new Set([...(entry.shadowTouched.freeCastExpendedSpellIds ?? []), spellId])
        ]
      }
    };
  });

  return didSpendFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreShadowTouchedFreeCastsForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (!derivedState.hasShadowTouched) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.SHADOW_TOUCHED ||
      !entry.shadowTouched ||
      !entry.shadowTouched.freeCastExpendedSpellIds ||
      entry.shadowTouched.freeCastExpendedSpellIds.length === 0
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      shadowTouched: {
        ...entry.shadowTouched,
        freeCastExpendedSpellIds: undefined
      }
    };
  });

  return didRestoreFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function consumeTelepathicDetectThoughtsFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendFreeCast = false;

  if (!derivedState.hasTelepathic || spellId !== telepathicDetectThoughtsSpellId) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendFreeCast ||
      entry.feat !== FEATS.TELEPATHIC ||
      !entry.telepathic ||
      entry.telepathic.detectThoughtsExpended === true
    ) {
      return entry;
    }

    didSpendFreeCast = true;

    return {
      ...entry,
      telepathic: {
        ...entry.telepathic,
        detectThoughtsExpended: true
      }
    };
  });

  return didSpendFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreTelepathicDetectThoughtsFreeCastForCharacter(
  character: Character
): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreFreeCast = false;

  if (!derivedState.hasTelepathic) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.TELEPATHIC ||
      !entry.telepathic ||
      entry.telepathic.detectThoughtsExpended !== true
    ) {
      return entry;
    }

    didRestoreFreeCast = true;

    return {
      ...entry,
      telepathic: {
        ...entry.telepathic,
        detectThoughtsExpended: undefined
      }
    };
  });

  return didRestoreFreeCast
    ? {
        ...character,
        feats
      }
    : character;
}

export function spendMageSlayerGuardedMindForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didSpendGuardedMind = false;

  if (!derivedState.hasMageSlayer || derivedState.mageSlayerGuardedMindRemaining <= 0) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      didSpendGuardedMind ||
      entry.feat !== FEATS.MAGE_SLAYER ||
      !entry.mageSlayer ||
      entry.mageSlayer.guardedMindExpended === true
    ) {
      return entry;
    }

    didSpendGuardedMind = true;

    return {
      ...entry,
      mageSlayer: {
        ...entry.mageSlayer,
        guardedMindExpended: true
      }
    };
  });

  return didSpendGuardedMind
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreMageSlayerGuardedMindForCharacter(character: Character): Character {
  const derivedState = collectFeatDerivedState(character);
  let didRestoreGuardedMind = false;

  if (!derivedState.hasMageSlayer) {
    return character;
  }

  const feats = derivedState.normalizedFeats.map((entry) => {
    if (
      entry.feat !== FEATS.MAGE_SLAYER ||
      !entry.mageSlayer ||
      entry.mageSlayer.guardedMindExpended !== true
    ) {
      return entry;
    }

    didRestoreGuardedMind = true;

    return {
      ...entry,
      mageSlayer: {
        ...entry.mageSlayer,
        guardedMindExpended: undefined
      }
    };
  });

  return didRestoreGuardedMind
    ? {
        ...character,
        feats
      }
    : character;
}

function setLuckyPointsExpendedForCharacter(
  character: Character,
  getNextPointsExpended: (current: number, total: number) => number
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasLucky || derivedState.luckyPointsTotal <= 0) {
    return character;
  }

  const currentPointsExpended = derivedState.luckyPointsTotal - derivedState.luckyPointsRemaining;
  const nextPointsExpended = Math.max(
    0,
    Math.min(
      derivedState.luckyPointsTotal,
      Math.floor(getNextPointsExpended(currentPointsExpended, derivedState.luckyPointsTotal))
    )
  );

  if (nextPointsExpended === currentPointsExpended) {
    return character;
  }

  return {
    ...character,
    feats: derivedState.normalizedFeats.map((entry) =>
      entry.feat === FEATS.LUCKY
        ? {
            ...entry,
            lucky:
              nextPointsExpended > 0
                ? {
                    pointsExpended: nextPointsExpended
                  }
                : undefined
          }
        : entry
    )
  };
}

export function spendLuckyPointForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, (currentPointsExpended, total) =>
    currentPointsExpended >= total ? currentPointsExpended : currentPointsExpended + 1
  );
}

export function resetLuckyPointForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, (currentPointsExpended) =>
    currentPointsExpended <= 0 ? currentPointsExpended : currentPointsExpended - 1
  );
}

export function restoreLuckyPointsForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, () => 0);
}
