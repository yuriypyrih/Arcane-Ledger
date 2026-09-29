import { singleAbilityChoices, type SingleAbilityFeat } from "../../singleAbilityChoices";
import type { FeatContributionContext } from "./types";

import { FEATS } from "../../../../../codex/entries/enums";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";

import {
  actorStatusSourceId,
  boonOfEnergyResistanceStatusSourceIdPrefix,
  heavyArmorMasterDamageReductionStatusSourceId,
  lordsAllianceAgentStatusSourceId,
  mageSlayerConcentrationBreakerStatusSourceId,
  sentinelGuardianHaltStatusSourceId,
  speedyAgileMovementStatusSourceId,
  spellfireSparkMagicAbsorptionStatusSourceId,
  telepathicUtteranceStatusSourceId,
  zhentarimRuffianExploitOpeningStatusSourceId
} from "../constants";

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
} from "../descriptionMatchers";

import type { FeatContributionBuilder, FeatContributionBuilders } from "./types";

function addSingleAbilityBonus(
  feat: SingleAbilityFeat,
  entry: FeatContributionContext["entry"],
  index: number,
  contribution: FeatContributionContext["contribution"]
) {
  const definition = singleAbilityChoices[feat];
  const choice = entry[definition.field];
  if (choice)
    contribution.abilityScoreBonuses!.push({
      ability: choice.ability,
      label: definition.label,
      value: 1,
      maxScore: definition.maxScore,
      order: entry.takenAtLevel + index / 100
    });
}

function singleAbilityBonusBuilder(feat: SingleAbilityFeat): FeatContributionBuilder {
  return ({ entry, index, contribution }) => {
    if (!entry[singleAbilityChoices[feat].field]) return false;
    addSingleAbilityBonus(feat, entry, index, contribution);
    return true;
  };
}

export const benefitsBuilders: FeatContributionBuilders = {
  [FEATS.ABILITY_SCORE_IMPROVEMENT]: ({ entry, index, contribution }) => {
    if (!entry.abilityScoreImprovement) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

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

    return true;
  },
  [FEATS.ATHLETE]: singleAbilityBonusBuilder(FEATS.ATHLETE),
  [FEATS.CHARGER]: singleAbilityBonusBuilder(FEATS.CHARGER),
  [FEATS.GRAPPLER]: singleAbilityBonusBuilder(FEATS.GRAPPLER),
  [FEATS.COLD_CASTER]: ({ entry, index, contribution }) => {
    if (!entry.coldCaster) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.coldCaster.ability,
      label: "Cold Caster",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.DRAGONSCARRED]: ({ entry, index, contribution }) => {
    if (!entry.dragonscarred) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.dragonscarred.ability,
      label: "Dragonscarred",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.CHEF]: singleAbilityBonusBuilder(FEATS.CHEF),
  [FEATS.CRUSHER]: singleAbilityBonusBuilder(FEATS.CRUSHER),
  [FEATS.CROSSBOW_EXPERT]: ({ entry, index, contribution }) => {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: "DEX",
      label: "Crossbow Expert",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.DEFENSIVE_DUELIST]: ({ entry, index, contribution }) => {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: "DEX",
      label: "Defensive Duelist",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.DURABLE]: ({ entry, index, contribution }) => {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: "CON",
      label: "Durable",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.DUAL_WIELDER]: singleAbilityBonusBuilder(FEATS.DUAL_WIELDER),
  [FEATS.ELEMENTAL_ADEPT]: ({ entry, index, contribution }) => {
    if (!entry.elementalAdept) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.elementalAdept.ability,
      label: "Elemental Adept",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.FEY_TOUCHED]: ({ entry, index, contribution }) => {
    if (!entry.feyTouched) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.feyTouched.ability,
      label: "Fey-Touched",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.GREAT_WEAPON_MASTER]: ({ entry, index, contribution }) => {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: "STR",
      label: "Great Weapon Master",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.HEAVILY_ARMORED]: singleAbilityBonusBuilder(FEATS.HEAVILY_ARMORED),
  [FEATS.HEAVY_ARMOR_MASTER]: ({ entry, index, contribution, getFeatDescription }) => {
    if (!entry.heavyArmorMaster) return false;
    const derivedStatusEntries = contribution.statuses!;

    const description = filterDescriptionEntries(
      getFeatDescription(FEATS.HEAVY_ARMOR_MASTER),
      isHeavyArmorMasterDamageReductionDescriptionEntry
    );

    addSingleAbilityBonus(FEATS.HEAVY_ARMOR_MASTER, entry, index, contribution);
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

    return true;
  },
  [FEATS.INSPIRING_LEADER]: singleAbilityBonusBuilder(FEATS.INSPIRING_LEADER),
  [FEATS.LORDS_ALLIANCE_AGENT]: ({ entry, contribution, getFeatDescription }) => {
    const derivedStatusEntries = contribution.statuses!;

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

    return true;
  },
  [FEATS.SPELLFIRE_SPARK]: ({ entry, contribution, getFeatDescription }) => {
    if (!entry.spellfireSpark) return false;
    const derivedStatusEntries = contribution.statuses!;

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

    return true;
  },
  [FEATS.ZHENTARIM_RUFFIAN]: ({ entry, contribution, getFeatDescription }) => {
    const derivedStatusEntries = contribution.statuses!;

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

    return true;
  },
  [FEATS.KEEN_MIND]: ({ entry, index, contribution }) => {
    if (!entry.keenMind) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: "INT",
      label: "Keen Mind",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.LIGHTLY_ARMORED]: singleAbilityBonusBuilder(FEATS.LIGHTLY_ARMORED),
  [FEATS.MAGE_SLAYER]: ({ entry, index, contribution, getFeatDescription }) => {
    if (!entry.mageSlayer) return false;
    const derivedStatusEntries = contribution.statuses!;

    const description = filterDescriptionEntries(
      getFeatDescription(FEATS.MAGE_SLAYER),
      isMageSlayerConcentrationBreakerDescriptionEntry
    );

    addSingleAbilityBonus(FEATS.MAGE_SLAYER, entry, index, contribution);
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

    return true;
  },
  [FEATS.MARTIAL_WEAPON_TRAINING]: singleAbilityBonusBuilder(FEATS.MARTIAL_WEAPON_TRAINING),
  [FEATS.MEDIUM_ARMOR_MASTER]: singleAbilityBonusBuilder(FEATS.MEDIUM_ARMOR_MASTER),
  [FEATS.MODERATELY_ARMORED]: singleAbilityBonusBuilder(FEATS.MODERATELY_ARMORED),
  [FEATS.MOUNTED_COMBATANT]: singleAbilityBonusBuilder(FEATS.MOUNTED_COMBATANT),
  [FEATS.OBSERVANT]: ({ entry, index, contribution }) => {
    if (!entry.observant) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.observant.ability,
      label: "Observant",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.PIERCER]: singleAbilityBonusBuilder(FEATS.PIERCER),
  [FEATS.POISONER]: singleAbilityBonusBuilder(FEATS.POISONER),
  [FEATS.POLEARM_MASTER]: singleAbilityBonusBuilder(FEATS.POLEARM_MASTER),
  [FEATS.RITUAL_CASTER]: ({ entry, index, contribution }) => {
    if (!entry.ritualCaster) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.ritualCaster.ability,
      label: "Ritual Caster",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.RESILIENT]: ({ entry, index, contribution }) => {
    if (!entry.resilient) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.resilient.ability,
      label: "Resilient",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.SENTINEL]: ({ entry, index, contribution, getFeatDescription }) => {
    if (!entry.sentinel) return false;
    const derivedStatusEntries = contribution.statuses!;

    const description = filterDescriptionEntries(
      getFeatDescription(FEATS.SENTINEL),
      isSentinelGuardianHaltDescriptionEntry
    );

    addSingleAbilityBonus(FEATS.SENTINEL, entry, index, contribution);
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

    return true;
  },
  [FEATS.SHADOW_TOUCHED]: ({ entry, index, contribution }) => {
    if (!entry.shadowTouched) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.shadowTouched.ability,
      label: "Shadow-Touched",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.SHARPSHOOTER]: ({ entry, index, contribution }) => {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: "DEX",
      label: "Sharpshooter",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.SHIELD_MASTER]: ({ entry, index, contribution }) => {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: "STR",
      label: "Shield Master",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.SKULKER]: ({ entry, index, contribution }) => {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: "DEX",
      label: "Skulker",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.SKILL_EXPERT]: ({ entry, index, contribution }) => {
    if (!entry.skillExpert) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.skillExpert.ability,
      label: "Skill Expert",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.SLASHER]: singleAbilityBonusBuilder(FEATS.SLASHER),
  [FEATS.SPELL_SNIPER]: singleAbilityBonusBuilder(FEATS.SPELL_SNIPER),
  [FEATS.TELEKINETIC]: singleAbilityBonusBuilder(FEATS.TELEKINETIC),
  [FEATS.TELEPATHIC]: ({ entry, index, contribution, getFeatDescription }) => {
    if (!entry.telepathic) return false;
    const derivedStatusEntries = contribution.statuses!;

    const description = filterDescriptionEntries(
      getFeatDescription(FEATS.TELEPATHIC),
      isTelepathicUtteranceDescriptionEntry
    );

    addSingleAbilityBonus(FEATS.TELEPATHIC, entry, index, contribution);
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

    return true;
  },
  [FEATS.WAR_CASTER]: singleAbilityBonusBuilder(FEATS.WAR_CASTER),
  [FEATS.SPEEDY]: ({ entry, index, contribution, getFeatDescription }) => {
    if (!entry.speedy) return false;
    const derivedStatusEntries = contribution.statuses!;

    const agileMovementDescription = filterDescriptionEntries(
      getFeatDescription(FEATS.SPEEDY),
      isSpeedyAgileMovementDescriptionEntry
    );

    addSingleAbilityBonus(FEATS.SPEEDY, entry, index, contribution);
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

    return true;
  },
  [FEATS.WEAPON_MASTER]: ({ entry, index, contribution }) => {
    if (!entry.weaponMaster) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.weaponMaster.ability,
      label: "Weapon Master",
      value: 1,
      maxScore: 20,
      order
    });

    return true;
  },
  [FEATS.ACTOR]: ({ entry, index, contribution, getFeatDescription }) => {
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const derivedStatusEntries = contribution.statuses!;
    const order = entry.takenAtLevel + index / 100;

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

    return true;
  },
  [FEATS.BOON_OF_ENERGY_RESISTANCE]: ({ entry, index, contribution, getFeatDescription }) => {
    if (!entry.boonOfEnergyResistance) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const derivedStatusEntries = contribution.statuses!;
    const order = entry.takenAtLevel + index / 100;

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

    return true;
  },
  [FEATS.BOON_OF_IRRESISTIBLE_OFFENSE]: singleAbilityBonusBuilder(
    FEATS.BOON_OF_IRRESISTIBLE_OFFENSE
  ),
  [FEATS.BOON_OF_SKILL]: ({ entry, index, contribution }) => {
    if (!entry.boonOfSkill) return false;
    const abilityScoreBonuses = contribution.abilityScoreBonuses!;
    const order = entry.takenAtLevel + index / 100;

    abilityScoreBonuses.push({
      ability: entry.boonOfSkill.ability,
      label: "Boon of Skill",
      value: 1,
      maxScore: 30,
      order
    });

    return true;
  }
};
