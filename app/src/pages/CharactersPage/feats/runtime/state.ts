import { FEATS, type ReactionEntry, type SpellDescriptionEntry, type SpellEntry } from "../../../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../types";
import type { AbilityKey, CharacterFeatEntry } from "../../../../types";
import type { FeatureActionCard, FeatureSpeedBonus, SpellSourceMap } from "../../classFeatures/types";
import { addSpellSource } from "../../classFeatures/spellSources";
import {
  getFeatAbilityIncreaseMaxScore,
  getFeatDefinition,
  getFeatLabel,
  normalizeCharacterFeats
} from "..";
import {
  getEpicBoonDerivedStatusEntries,
  getEpicBoonFeatHitPointMaximumBonus,
  getEpicBoonFeatResourceState,
  getEpicBoonFeatSpeedBonuses,
  getEpicBoonReactionEntries
} from "./epicBoon";
import {
  getFightingStyleDerivedStatusEntries,
  getFightingStyleReactionEntries,
  hasDefenseFightingStyle
} from "./fightingStyle";
import {
  getGeneralFeatReactionEntries,
  getGeneralFeatResourceState,
  getGeneralFeatSpeedBonuses
} from "./general";
import {
  getOriginFeatHitPointMaximumBonus,
  getOriginFeatReactionEntries,
  getOriginFeatResourceState
} from "./origin";
import {
  actorStatusSourceId,
  boonOfEnergyResistanceStatusSourceIdPrefix,
  heavyArmorMasterDamageReductionStatusSourceId,
  lordsAllianceAgentStatusSourceId,
  mageSlayerConcentrationBreakerStatusSourceId,
  sentinelGuardianHaltStatusSourceId,
  skulkerBlindsightStatusSourceId,
  speedyAgileMovementStatusSourceId,
  spellfireSparkMagicAbsorptionStatusSourceId,
  telepathicUtteranceStatusSourceId,
  zhentarimRuffianExploitOpeningStatusSourceId
} from "./constants";
import {
  getEmeraldEnclaveFledglingSpellEntry,
  getFeatCantripEntries,
  getFeyTouchedSpellEntries,
  getMagicInitiateLevelOneSpellEntry,
  getRitualCasterSpellEntries,
  getShadowTouchedSpellEntries,
  getSpellfireSparkSacredFlameSpellEntry,
  getTelekineticMageHandSpellEntry,
  getTelepathicDetectThoughtsSpellEntry
} from "./spells";
import {
  filterDescriptionEntries,
  isBoonOfEnergyResistanceEnergyResistancesDescriptionEntry,
  isHeavyArmorMasterDamageReductionDescriptionEntry,
  isMageSlayerConcentrationBreakerDescriptionEntry,
  isSentinelGuardianHaltDescriptionEntry,
  isSpeedyAgileMovementDescriptionEntry,
  isSpellfireSparkMagicAbsorptionDescriptionEntry,
  isTelepathicUtteranceDescriptionEntry,
  isZhentarimRuffianExploitOpeningDescriptionEntry
} from "./descriptionMatchers";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

const featDerivedStateCache = new WeakMap<object, Map<number, FeatDerivedState>>();

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

export function getFeatDescriptionSlice(
  feat: FEATS,
  predicate: (entry: string) => boolean
): SpellDescriptionEntry[] {
  return filterDescriptionEntries(getFeatDefinition(feat)?.description ?? [], predicate);
}

function createFeatDerivedState(feats: unknown, level: number): FeatDerivedState {
  const normalizedFeats = normalizeCharacterFeats(feats, level);
  const featsByFeat = new Map<FEATS, CharacterFeatEntry[]>();
  const featSet = new Set<FEATS>();
  const grantedCantripEntriesById = new Map<string, SpellEntry>();
  const alwaysPreparedCantripEntriesById = new Map<string, SpellEntry>();
  const alwaysPreparedSpellEntriesById = new Map<string, SpellEntry>();
  const alwaysPreparedSpellSourceMap: SpellSourceMap = {};
  const magicInitiateSpellcastingAbilityBySpellId = new Map<string, AbilityKey>();
  const spellfireSparkSpellcastingAbilityBySpellId = new Map<string, AbilityKey>();
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
  const addAlwaysPreparedSpellSource = (spellId: string, feat: FEATS) => {
    addSpellSource(alwaysPreparedSpellSourceMap, spellId, getFeatLabel(feat));
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
        addAlwaysPreparedSpellSource(cantrip.id, entry.feat);
        magicInitiateSpellcastingAbilityBySpellId.set(
          cantrip.id,
          magicInitiate.spellcastingAbility
        );
      });

      const levelOneSpell = getMagicInitiateLevelOneSpellEntry(entry);

      if (levelOneSpell) {
        alwaysPreparedSpellEntriesById.set(levelOneSpell.id, levelOneSpell);
        addAlwaysPreparedSpellSource(levelOneSpell.id, entry.feat);
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

    if (entry.feat === FEATS.EMERALD_ENCLAVE_FLEDGLING && entry.emeraldEnclaveFledgling) {
      const speakWithAnimals = getEmeraldEnclaveFledglingSpellEntry(entry);

      if (speakWithAnimals) {
        alwaysPreparedSpellEntriesById.set(speakWithAnimals.id, speakWithAnimals);
        addAlwaysPreparedSpellSource(speakWithAnimals.id, entry.feat);
        magicInitiateSpellcastingAbilityBySpellId.set(
          speakWithAnimals.id,
          entry.emeraldEnclaveFledgling.spellcastingAbility
        );
      }
    }

    if (entry.feat === FEATS.SPELLFIRE_SPARK && entry.spellfireSpark) {
      const sacredFlame = getSpellfireSparkSacredFlameSpellEntry(entry);

      if (sacredFlame) {
        grantedCantripEntriesById.set(sacredFlame.id, sacredFlame);
        alwaysPreparedCantripEntriesById.set(sacredFlame.id, sacredFlame);
        addAlwaysPreparedSpellSource(sacredFlame.id, entry.feat);
        spellfireSparkSpellcastingAbilityBySpellId.set(
          sacredFlame.id,
          entry.spellfireSpark.spellcastingAbility
        );
      }
    }

    if (entry.feat === FEATS.FEY_TOUCHED && entry.feyTouched) {
      const feyTouched = entry.feyTouched;

      getFeyTouchedSpellEntries(entry).forEach((spell) => {
        alwaysPreparedSpellEntriesById.set(spell.id, spell);
        addAlwaysPreparedSpellSource(spell.id, entry.feat);
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
        addAlwaysPreparedSpellSource(spell.id, entry.feat);
        magicInitiateSpellcastingAbilityBySpellId.set(spell.id, ritualCaster.ability);
      });
    }

    if (entry.feat === FEATS.SHADOW_TOUCHED && entry.shadowTouched) {
      const shadowTouched = entry.shadowTouched;

      getShadowTouchedSpellEntries(entry).forEach((spell) => {
        alwaysPreparedSpellEntriesById.set(spell.id, spell);
        addAlwaysPreparedSpellSource(spell.id, entry.feat);
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
        addAlwaysPreparedSpellSource(mageHand.id, entry.feat);
        magicInitiateSpellcastingAbilityBySpellId.set(mageHand.id, entry.telekinetic.ability);
      }
    }

    if (entry.feat === FEATS.TELEPATHIC && entry.telepathic) {
      const detectThoughts = getTelepathicDetectThoughtsSpellEntry(entry);

      if (detectThoughts) {
        alwaysPreparedSpellEntriesById.set(detectThoughts.id, detectThoughts);
        addAlwaysPreparedSpellSource(detectThoughts.id, entry.feat);
        magicInitiateSpellcastingAbilityBySpellId.set(detectThoughts.id, entry.telepathic.ability);
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
    } else if (entry.feat === FEATS.LORDS_ALLIANCE_AGENT) {
      derivedStatusEntries.push({
        id: `${lordsAllianceAgentStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Lords' Alliance Agent",
        source: "Lords' Alliance Agent",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: lordsAllianceAgentStatusSourceId,
        description: getFeatDescription(FEATS.LORDS_ALLIANCE_AGENT).join("\n")
      });
    } else if (entry.feat === FEATS.SPELLFIRE_SPARK && entry.spellfireSpark) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.SPELLFIRE_SPARK),
        isSpellfireSparkMagicAbsorptionDescriptionEntry
      );

      derivedStatusEntries.push({
        id: `${spellfireSparkMagicAbsorptionStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Magic Absorption",
        source: "Spellfire Spark",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: spellfireSparkMagicAbsorptionStatusSourceId,
        description: description.join("\n")
      });
    } else if (entry.feat === FEATS.ZHENTARIM_RUFFIAN) {
      const description = filterDescriptionEntries(
        getFeatDescription(FEATS.ZHENTARIM_RUFFIAN),
        isZhentarimRuffianExploitOpeningDescriptionEntry
      );

      derivedStatusEntries.push({
        id: `${zhentarimRuffianExploitOpeningStatusSourceId}-${entry.id}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Exploit Opening",
        source: "Zhentarim Ruffian",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: zhentarimRuffianExploitOpeningStatusSourceId,
        description: description.join("\n")
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
        maxScore: getFeatAbilityIncreaseMaxScore(entry.feat) ?? 30,
        order
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

  const originResourceState = getOriginFeatResourceState(normalizedFeats, featSet, level);
  const generalResourceState = getGeneralFeatResourceState(
    normalizedFeats,
    featSet,
    telepathicDetectThoughtsFreeCastEntries
  );
  const epicBoonResourceState = getEpicBoonFeatResourceState(normalizedFeats, featSet);
  const hitPointMaximumBonus =
    getOriginFeatHitPointMaximumBonus(featSet, level) +
    getEpicBoonFeatHitPointMaximumBonus(featSet);
  const speedBonuses: FeatureSpeedBonus[] = [
    ...getGeneralFeatSpeedBonuses(featSet),
    ...getEpicBoonFeatSpeedBonuses(featSet)
  ];
  const actions: FeatureActionCard[] = [];
  const reactionEntries: ReactionEntry[] = [
    ...getOriginFeatReactionEntries(featSet, getFeatDescriptionSlice),
    ...getGeneralFeatReactionEntries(featSet, getFeatDescription),
    ...getFightingStyleReactionEntries(featSet, getFeatDescription),
    ...getEpicBoonReactionEntries(normalizedFeats, getFeatDescription)
  ];

  derivedStatusEntries.push(
    ...getFightingStyleDerivedStatusEntries(normalizedFeats),
    ...getEpicBoonDerivedStatusEntries(normalizedFeats, getFeatDescription)
  );

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
    alwaysPreparedSpellSourceMap,
    magicInitiateSpellcastingAbilityBySpellId,
    spellfireSparkSpellcastingAbilityBySpellId,
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
    hasCultOfDragonInitiate: originResourceState.hasCultOfDragonInitiate,
    hasDefenseFightingStyle: hasDefenseFightingStyle(featSet),
    hasHealer: featSet.has(FEATS.HEALER),
    hasFeyTouched: featSet.has(FEATS.FEY_TOUCHED),
    hasBoonOfFate: epicBoonResourceState.hasBoonOfFate,
    hasBoonOfRecovery: epicBoonResourceState.hasBoonOfRecovery,
    hasBoonOfSpellRecall: epicBoonResourceState.hasBoonOfSpellRecall,
    hasLucky: originResourceState.hasLucky,
    hasMageSlayer: generalResourceState.hasMageSlayer,
    hasMagicInitiate: featSet.has(FEATS.MAGIC_INITIATE),
    hasPurpleDragonRook: originResourceState.hasPurpleDragonRook,
    hasRitualCaster: generalResourceState.hasRitualCaster,
    hasShadowTouched: featSet.has(FEATS.SHADOW_TOUCHED),
    hasSpellfireSpark: originResourceState.hasSpellfireSpark,
    hasTelepathic: generalResourceState.hasTelepathic,
    luckyPointsRemaining: originResourceState.luckyPointsRemaining,
    luckyPointsTotal: originResourceState.luckyPointsTotal,
    cultOfDragonInitiateInspiredByFearRemaining:
      originResourceState.cultOfDragonInitiateInspiredByFearRemaining,
    cultOfDragonInitiateInspiredByFearTotal:
      originResourceState.cultOfDragonInitiateInspiredByFearTotal,
    purpleDragonRookRallyingCryRemaining:
      originResourceState.purpleDragonRookRallyingCryRemaining,
    purpleDragonRookRallyingCryTotal:
      originResourceState.purpleDragonRookRallyingCryTotal,
    spellfireSparkSpellfireFlameRemaining:
      originResourceState.spellfireSparkSpellfireFlameRemaining,
    spellfireSparkSpellfireFlameTotal:
      originResourceState.spellfireSparkSpellfireFlameTotal,
    boonOfFateImproveFateRemaining: epicBoonResourceState.boonOfFateImproveFateRemaining,
    boonOfFateImproveFateTotal: epicBoonResourceState.boonOfFateImproveFateTotal,
    boonOfRecoveryDiceRemaining: epicBoonResourceState.boonOfRecoveryDiceRemaining,
    boonOfRecoveryDiceTotal: epicBoonResourceState.boonOfRecoveryDiceTotal,
    mageSlayerGuardedMindRemaining: generalResourceState.mageSlayerGuardedMindRemaining,
    mageSlayerGuardedMindTotal: generalResourceState.mageSlayerGuardedMindTotal,
    ritualCasterQuickRitualRemaining: generalResourceState.ritualCasterQuickRitualRemaining,
    ritualCasterQuickRitualTotal: generalResourceState.ritualCasterQuickRitualTotal,
    telepathicDetectThoughtsRemaining: generalResourceState.telepathicDetectThoughtsRemaining,
    telepathicDetectThoughtsTotal: generalResourceState.telepathicDetectThoughtsTotal
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
