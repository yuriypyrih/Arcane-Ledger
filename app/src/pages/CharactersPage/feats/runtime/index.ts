import {
  DAMAGE_TYPE,
  FEATS,
  REACTION,
  SPELL_LIST_CLASS,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  getSpellEntryById,
  type ReactionEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import { getSpellEntriesForSpellListClass } from "../../../../codex/classes/spellAccess";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../types";
import type {
  AbilityKey,
  Character,
  CharacterFeatEntry,
  ItemRecord,
  MagicInitiateChoice
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
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
  createFeatureActionCardCost,
  createNamedResourceCardUsage,
  createTextHeaderTag
} from "../../classFeatures/cardUsage";
import {
  getHitDiceRemainingForCharacter,
  getHitDiceTotalForCharacter,
  getHitDieFormulaForClass,
  getHitDieLabelForCharacter
} from "../../hitDice";
import { getFeatDefinition, getFeatLabel, normalizeCharacterFeats } from "..";
import { formatCodexLabel } from "../../../../utils/codex";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

export type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

const blessedWarriorCantripOptionsById = new Map(
  getSpellEntriesForSpellListClass(SPELL_LIST_CLASS.CLERIC)
    .filter((spell) => spell.spellLevel === 0)
    .map((spell) => [spell.id, spell] as const)
);
const druidicWarriorCantripOptionsById = new Map(
  getSpellEntriesForSpellListClass(SPELL_LIST_CLASS.DRUID)
    .filter((spell) => spell.spellLevel === 0)
    .map((spell) => [spell.id, spell] as const)
);
const magicInitiateSpellLists = [
  SPELL_LIST_CLASS.CLERIC,
  SPELL_LIST_CLASS.DRUID,
  SPELL_LIST_CLASS.WIZARD
] as const;
const magicInitiateCantripOptionsBySpellListAndId = new Map<
  MagicInitiateChoice["spellList"],
  Map<string, SpellEntry>
>(
  magicInitiateSpellLists.map((spellList) => [
    spellList,
    new Map(
      getSpellEntriesForSpellListClass(spellList)
        .filter((spell) => spell.spellLevel === 0)
        .map((spell) => [spell.id, spell] as const)
    )
  ])
);
const magicInitiateLevelOneSpellOptionsBySpellListAndId = new Map<
  MagicInitiateChoice["spellList"],
  Map<string, SpellEntry>
>(
  magicInitiateSpellLists.map((spellList) => [
    spellList,
    new Map(
      getSpellEntriesForSpellListClass(spellList)
        .filter((spell) => spell.spellLevel === 1)
        .map((spell) => [spell.id, spell] as const)
    )
  ])
);
const featDerivedStateCache = new WeakMap<object, Map<number, FeatDerivedState>>();
const healerKitItemKeys = new Set([
  "srd_healers-kit",
  "srd-2024_healers-kit",
  "healers-kit",
  "healers_kit"
]);
const poisonersKitItemKeys = new Set([
  "srd_poisoners-kit",
  "srd-2024_poisoners-kit",
  "srd_poisoners_kit",
  "srd-2024_poisoners_kit",
  "poisoners-kit",
  "poisoners_kit"
]);
export const actorStatusSourceId = "feat-actor";
export const heavyArmorMasterDamageReductionStatusSourceId =
  "feat-heavy-armor-master-damage-reduction";
export const mageSlayerConcentrationBreakerStatusSourceId =
  "feat-mage-slayer-concentration-breaker";
export const speedyAgileMovementStatusSourceId = "feat-speedy-agile-movement";
export const defensiveDuelistParryReactionEntryId = "reaction-defensive-duelist-parry";
export const luckyFeatActionKey = "feat-lucky";
export const durableSpeedyRecoveryActionKey = "feat-durable-speedy-recovery";
const feyTouchedMistyStepSpellId = "spell-misty-step";
const elementalAdeptEnergyMasteryDescription =
  "Spells you cast ignore Resistance to damage of the chosen type. In addition, when you roll damage for a spell you cast that deals damage of that type, you can treat any 1 on a damage die as a 2.";
const feyTouchedFeyMagicDescription =
  "Choose one level 1 spell from the Divination or Enchantment school of magic. You always have that spell and the Misty Step spell prepared. You can cast each of these spells without expending a spell slot. Once you cast either spell in this way, you can't cast that spell in this way again until you finish a Long Rest. You can also cast these spells using spell slots you have of the appropriate level. The spells' spellcasting ability is the ability increased by this feat.";

type ChargerWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
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

type CrossbowExpertWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  baseWeapon?: WEAPON_BASE | null;
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

function getFeatCantripEntry(entry: CharacterFeatEntry): SpellEntry[] {
  if (entry.feat === FEATS.BLESSED_WARRIOR && entry.blessedWarrior) {
    return entry.blessedWarrior.cantripIds.flatMap((cantripId) => {
      const cantrip = blessedWarriorCantripOptionsById.get(cantripId);

      return cantrip ? [cantrip] : [];
    });
  }

  if (entry.feat === FEATS.DRUIDIC_WARRIOR && entry.druidicWarrior) {
    return entry.druidicWarrior.cantripIds.flatMap((cantripId) => {
      const cantrip = druidicWarriorCantripOptionsById.get(cantripId);

      return cantrip ? [cantrip] : [];
    });
  }

  if (entry.feat === FEATS.MAGIC_INITIATE && entry.magicInitiate) {
    const cantripOptionsById = magicInitiateCantripOptionsBySpellListAndId.get(
      entry.magicInitiate.spellList
    );

    return entry.magicInitiate.cantripIds.flatMap((cantripId) => {
      const cantrip = cantripOptionsById?.get(cantripId);

      return cantrip ? [cantrip] : [];
    });
  }

  return [];
}

function getMagicInitiateLevelOneSpellEntry(entry: CharacterFeatEntry): SpellEntry | null {
  if (entry.feat !== FEATS.MAGIC_INITIATE || !entry.magicInitiate) {
    return null;
  }

  return (
    magicInitiateLevelOneSpellOptionsBySpellListAndId
      .get(entry.magicInitiate.spellList)
      ?.get(entry.magicInitiate.levelOneSpellId) ?? null
  );
}

function getFeyTouchedSpellEntries(entry: CharacterFeatEntry): SpellEntry[] {
  if (entry.feat !== FEATS.FEY_TOUCHED || !entry.feyTouched) {
    return [];
  }

  return [entry.feyTouched.spellId, feyTouchedMistyStepSpellId].flatMap((spellId) => {
    const spell = getSpellEntryById(spellId);

    return spell ? [spell] : [];
  });
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

function createLuckyAction(
  remaining: number,
  total: number,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const usageLabel = `Lucky Points ${remaining}/${total}`;

  return {
    key: luckyFeatActionKey,
    name: "Lucky",
    summary: usageLabel,
    detail: "Spend Luck Points on d20 rolls.",
    breakdown: "Origin Feat",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    hideUsesTrackerOnCard: true,
    usesSupplementaryLabel: usageLabel,
    description,
    headerTags: [
      {
        kind: "text",
        label: "Lucky Points",
        value: `${remaining}/${total}`
      }
    ],
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use 1"
    },
    execute: {
      kind: "activate",
      label: "Use 1"
    }
  };
}

function createDurableSpeedyRecoveryAction(
  character: FeatRuntimeCharacter,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const hitDieLabel = getHitDieLabelForCharacter(character);
  const hitDiceRemaining = getHitDiceRemainingForCharacter(character);
  const hitDiceTotal = getHitDiceTotalForCharacter(character);
  const hitDieCost = createFeatureActionCardCost({
    amountText: "1",
    resourceLabel: `${hitDieLabel} Hit Point Die`
  });
  const hitPointDiceTag = createTextHeaderTag(
    "Hit Point Dice",
    `${hitDieLabel} ${hitDiceRemaining}/${hitDiceTotal}`,
    undefined,
    hitDiceRemaining > 0 ? undefined : "danger"
  );
  const disabledReason = hitDiceRemaining > 0 ? undefined : "No Hit Point Dice remaining.";

  return {
    key: durableSpeedyRecoveryActionKey,
    name: "Speedy Recovery",
    summary: `Use 1 ${hitDieLabel} Hit Point Die`,
    detail: "Recover healthpoints",
    breakdown: "Recover healthpoints",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    cardUsage: createNamedResourceCardUsage(hitDieCost),
    disabled: hitDiceRemaining <= 0,
    disabledReason,
    description,
    headerTags: [hitPointDiceTag],
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use Speedy Recovery",
      headerTags: [hitPointDiceTag]
    },
    execute: {
      kind: "activate",
      label: "Use Speedy Recovery",
      effectKind: "speedy-recovery"
    }
  };
}

function getFeatDescriptionSlice(
  feat: FEATS,
  predicate: (entry: string) => boolean
): SpellDescriptionEntry[] {
  return filterDescriptionEntries(getFeatDefinition(feat)?.description ?? [], predicate);
}

function filterDescriptionEntries(
  description: SpellDescriptionEntry[],
  predicate: (entry: string) => boolean
): SpellDescriptionEntry[] {
  return description.filter(
    (entry): entry is string => typeof entry === "string" && predicate(entry)
  );
}

function isChargerImprovedDashDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Improved Dash.</strong>");
}

function isChargerChargeAttackDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Charge Attack.</strong>");
}

function isChefReplenishingMealDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Replenishing Meal.</strong>");
}

function isChefBolsteringTreatsDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Bolstering Treats.</strong>");
}

function isCrusherWeaponActionDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Push.</strong>") ||
    entry.startsWith("<strong>Enhanced Critical.</strong>")
  );
}

function isPiercerWeaponActionDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Puncture.</strong>") ||
    entry.startsWith("<strong>Enhanced Critical.</strong>")
  );
}

function isPoisonerPotentPoisonDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Potent Poison.</strong>");
}

function isPoisonerBrewPoisonDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Brew Poison.</strong>");
}

function isSpeedyDashOverDifficultTerrainDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Dash over Difficult Terrain.</strong>");
}

function isSpeedyAgileMovementDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Agile Movement.</strong>");
}

function isWeaponMasterMasteryPropertyDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Mastery Property.</strong>");
}

function isDefensiveDuelistParryDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Parry.</strong>");
}

function isDurableSpeedyRecoveryDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Speedy Recovery.</strong>");
}

function isDualWielderEnhancedDualWieldingDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Enhanced Dual Wielding.</strong>");
}

function isGreatWeaponMasterHeavyWeaponMasteryDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Heavy Weapon Mastery.</strong>");
}

function isGreatWeaponMasterHewDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Hew.</strong>");
}

function isHeavyArmorMasterDamageReductionDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Damage Reduction.</strong>");
}

function isInspiringLeaderBolsteringPerformanceDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Bolstering Performance.</strong>");
}

function isKeenMindQuickStudyDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Quick Study.</strong>");
}

function isObservantQuickSearchDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Quick Search.</strong>");
}

function isMageSlayerConcentrationBreakerDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Concentration Breaker.</strong>");
}

function isMageSlayerGuardedMindDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Guarded Mind.</strong>");
}

function isMediumArmorMasterDexterousWearerDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Dexterous Wearer.</strong>");
}

function isCrossbowExpertDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Ignore Loading.</strong>") ||
    entry.startsWith("<strong>Firing in Melee.</strong>") ||
    entry.startsWith("<strong>Dual Wielding.</strong>")
  );
}

function isChargerMeleeWeaponAction(action: ChargerWeaponActionContext): boolean {
  return (
    action.attackKind === "unarmed" ||
    (action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE)
  );
}

function isCrossbowExpertWeaponAction(action: CrossbowExpertWeaponActionContext): boolean {
  return (
    action.attackKind === "weapon" &&
    typeof action.baseWeapon === "string" &&
    crossbowExpertBaseWeapons.has(action.baseWeapon)
  );
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

function doesSpellDealDamageType(spell: SpellEntry, chosenDamageType: DAMAGE_TYPE): boolean {
  return spell.damage.some(([, damageType]) =>
    Array.isArray(damageType)
      ? damageType.includes(chosenDamageType)
      : damageType === chosenDamageType
  );
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

    const featCantripEntries = getFeatCantripEntry(entry);

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
    } else if (entry.feat === FEATS.RESILIENT && entry.resilient) {
      abilityScoreBonuses.push({
        ability: entry.resilient.ability,
        label: "Resilient",
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
    } else if (entry.epicBoonAbilityChoice) {
      abilityScoreBonuses.push({
        ability: entry.epicBoonAbilityChoice.ability,
        label: getFeatLabel(entry.feat),
        value: 1,
        maxScore: 30,
        order
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
  });

  const luckyPointsTotal = featSet.has(FEATS.LUCKY) ? getFeatProficiencyBonusForLevel(level) : 0;
  const hitPointMaximumBonus = featSet.has(FEATS.TOUGH) ? level * 2 : 0;
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

  const luckyPointsExpended = getLuckyPointsExpended(normalizedFeats, luckyPointsTotal);
  const luckyPointsRemaining = Math.max(0, luckyPointsTotal - luckyPointsExpended);
  const mageSlayerGuardedMindTotal = featSet.has(FEATS.MAGE_SLAYER) ? 1 : 0;
  const mageSlayerGuardedMindExpended = normalizedFeats.some(
    (entry) => entry.feat === FEATS.MAGE_SLAYER && entry.mageSlayer?.guardedMindExpended === true
  );
  const mageSlayerGuardedMindRemaining =
    mageSlayerGuardedMindTotal > 0 && !mageSlayerGuardedMindExpended ? 1 : 0;
  const actions: FeatureActionCard[] = featSet.has(FEATS.LUCKY)
    ? [createLuckyAction(luckyPointsRemaining, luckyPointsTotal, getFeatDescription(FEATS.LUCKY))]
    : [];
  const reactionEntries: ReactionEntry[] = featSet.has(FEATS.DEFENSIVE_DUELIST)
    ? [
        {
          id: defensiveDuelistParryReactionEntryId,
          reaction: REACTION.PARRY,
          name: "Parry",
          sourceType: "feat",
          sourceLabel: "Defensive Duelist",
          description: filterDescriptionEntries(
            getFeatDescription(FEATS.DEFENSIVE_DUELIST),
            isDefensiveDuelistParryDescriptionEntry
          )
        }
      ]
    : [];

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
    hasLucky: featSet.has(FEATS.LUCKY),
    hasMageSlayer: featSet.has(FEATS.MAGE_SLAYER),
    hasMagicInitiate: featSet.has(FEATS.MAGIC_INITIATE),
    luckyPointsRemaining,
    luckyPointsTotal,
    mageSlayerGuardedMindRemaining,
    mageSlayerGuardedMindTotal
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

export function transformFeatCommonActionForCharacter<T extends Pick<FeatureActionCard, "key">>(
  character: FeatRuntimeCharacter,
  action: T & Pick<FeatureActionCard, "descriptionAdditions">
): T & Pick<FeatureActionCard, "descriptionAdditions"> {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (action.key === "common-action-dash") {
    descriptionAdditions.push(...getChargerDashDescriptionAdditionsForCharacter(character));
    descriptionAdditions.push(...getSpeedyDashDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-study") {
    descriptionAdditions.push(...getKeenMindStudyDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-search") {
    descriptionAdditions.push(...getObservantSearchDescriptionAdditionsForCharacter(character));
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

export function getFeatActionsForCharacter(character: FeatRuntimeCharacter): FeatureActionCard[] {
  const derivedState = collectFeatDerivedState(character);
  const actions = [...derivedState.actions];

  if (derivedState.featSet.has(FEATS.DURABLE)) {
    actions.push(
      createDurableSpeedyRecoveryAction(
        character,
        getFeatDescriptionSlice(FEATS.DURABLE, isDurableSpeedyRecoveryDescriptionEntry)
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

function normalizeItemRuntimeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, "-");
}

function getItemRuntimeKeys(item: Pick<ItemRecord, "id" | "key" | "name">): string[] {
  return [
    item.id,
    typeof item.key === "string" ? item.key : null,
    typeof item.name === "string" ? item.name : null
  ].flatMap((value) => {
    if (!value || value.trim().length === 0) {
      return [];
    }

    const normalized = normalizeItemRuntimeKey(value);
    return [normalized, normalized.replace(/-/g, "_")];
  });
}

function itemMatchesRuntimeKeySet(
  item: Pick<ItemRecord, "id" | "key" | "name">,
  keySet: Set<string>
): boolean {
  return getItemRuntimeKeys(item).some((key) => keySet.has(key));
}

export function getFeatItemAdditionalDescriptionForCharacter(
  character: FeatRuntimeCharacter,
  item: Pick<ItemRecord, "id" | "key" | "name"> | null | undefined
): SpellDescriptionEntry[] {
  if (!item) {
    return [];
  }

  const derivedState = collectFeatDerivedState(character);
  const additions: SpellDescriptionEntry[] = [];

  if (derivedState.hasHealer && itemMatchesRuntimeKeySet(item, healerKitItemKeys)) {
    const healerDescription = getFeatDefinition(FEATS.HEALER)?.description ?? [];
    additions.push(
      ...createSourcedDescriptionEntries(getFeatLabel(FEATS.HEALER), healerDescription)
    );
  }

  if (
    derivedState.featSet.has(FEATS.POISONER) &&
    itemMatchesRuntimeKeySet(item, poisonersKitItemKeys)
  ) {
    const poisonerDescription = getFeatDescriptionSlice(
      FEATS.POISONER,
      isPoisonerBrewPoisonDescriptionEntry
    );

    additions.push(
      ...createSourcedDescriptionEntries("Poisoner: Brew Poison", poisonerDescription)
    );
  }

  return additions;
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
