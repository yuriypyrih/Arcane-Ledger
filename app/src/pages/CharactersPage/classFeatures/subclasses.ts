import {
  ACTION_TYPE,
  CLASS_FEATURE,
  DAMAGE_TYPE,
  getSpellEntryByName,
  getReactionEntryById,
  type ReactionEntry,
  type SpellEntry
} from "../../../codex/entries";
import {
  blessingOfMoonlightDescription,
  inspiredEclipseDescription,
  mantleOfInspirationDescription,
  mantleOfMajestyDescription,
  shadowOfTheNewMoonDescription,
  unbreakableMajestyDescription
} from "../../../codex/subclasses/bard";
import {
  aquaticAffinityWrathOfTheSeaDescription,
  stormbornWrathOfTheSeaDescription,
  wrathOfTheSeaDescription
} from "../../../codex/subclasses/druid";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../subclasses";
import {
  type AbilityKey,
  CONDITION_NAME,
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character
} from "../../../types";
import { getEquipmentByName } from "../proficiencyCodexData";
import {
  getBardicInspirationDie,
  getBardicInspirationUsesRemaining,
  getBardicInspirationUsesTotal,
  getMantleOfMajestyFallbackSlotLevel,
  getMantleOfMajestyFallbackSlotSummary,
  getMantleOfMajestyUsesRemaining,
  getMantleOfMajestyUsesTotal,
  getUnbreakableMajestyUsesRemaining,
  getUnbreakableMajestyUsesTotal,
  hasActiveMantleOfMajesty,
  hasActiveUnbreakableMajesty,
  mantleOfInspirationActionKey,
  mantleOfMajestyActionKey,
  unbreakableMajestyActionKey
} from "./bard/bard";
import {
  getKnowledgeDomainFeatureActions,
  getKnowledgeDomainSavingThrowIndicators,
  getKnowledgeDomainSavingThrowProficiencyEntries,
  getKnowledgeDomainSkillIndicators,
  getKnowledgeDomainSkillProficiencyEntries
} from "./cleric/cleric";
import {
  druidLandsAidActionKey,
  druidMoonlightStepActionKey,
  druidNaturesSanctuaryActionKey,
  druidWrathOfTheSeaActionKey,
  druidWrathOfTheSeaStatusSourceId,
  circleOfTheStarsSubclassId,
  getDruidCircleOfTheLandChoice,
  getDruidMoonlightStepFallbackSlotLevel,
  getDruidMoonlightStepFallbackSlotSummary,
  getDruidMoonlightStepUsesRemaining,
  getDruidMoonlightStepUsesTotal,
  getDruidWildShapeUsesRemaining,
  getDruidWildShapeUsesTotal
} from "./druid/druid";
import {
  getCircleOfTheStarsAlwaysPreparedSpellIds,
  getCircleOfTheStarsFeatureActions,
  getCircleOfTheStarsWeaponActions
} from "./druid/druidStars";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import type {
  AbilityCheckIndicatorMap,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureLanguageProficiencyEntry,
  FeatureSavingThrowBonus,
  FeatureUnarmedStrikeConfig,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  WeaponFeatureContext,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SkillIndicatorMap
} from "./types";
import type { WeaponAction } from "../gameplay";

export type SubclassDerivedFeatureState = {
  featureActions?: FeatureActionCard[];
  featureActionOptions?: Partial<Record<string, FeatureActionOptionCard[]>>;
  weaponActions?: WeaponAction[];
  transformFeatureAction?: (action: FeatureActionCard) => FeatureActionCard;
  getSavingThrowBonuses?: (ability: AbilityKey) => FeatureSavingThrowBonus[];
  savingThrowIndicators?: SavingThrowIndicatorMap;
  abilityCheckIndicators?: AbilityCheckIndicatorMap;
  coreStatIndicators?: CoreStatIndicatorMap;
  skillIndicators?: SkillIndicatorMap;
  weaponAttackIndicators?: FeatureIndicator[];
  getWeaponDamageBonuses?: (context: WeaponFeatureContext) => FeatureDamageBonus[];
  getArmorClassModes?: (context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
  }) => FeatureArmorClassMode[];
  getArmorClassBonuses?: (context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
  }) => FeatureArmorClassBonus[];
  speedBonuses?: FeatureSpeedBonus[];
  abilityScoreBonuses?: FeatureAbilityScoreBonus[];
  cantripLimitBonus?: number;
  cantripDamageBonus?: number;
  weaponProficiencyEntries?: FeatureWeaponProficiencyEntry[];
  skillProficiencyEntries?: FeatureSkillProficiencyEntry[];
  savingThrowProficiencyEntries?: FeatureSavingThrowProficiencyEntry[];
  armorProficiencyEntries?: FeatureArmorProficiencyEntry[];
  languageProficiencyEntries?: FeatureLanguageProficiencyEntry[];
  alwaysPreparedSpellIds?: string[];
  derivedStatusEntries?: DerivedFeatureStatusEntry[];
  reactionEntries?: ReactionEntry[];
  spellDamageFormulaOverrides?: Record<string, string>;
  transformSpellEntry?: (spell: SpellEntry) => SpellEntry;
  getUnarmedStrikeConfig?: () => FeatureUnarmedStrikeConfig | null;
};

type SubclassRuntimeResolver = (
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        | "level"
        | "subclassId"
        | "equipment"
        | "customEquipment"
        | "abilities"
        | "classFeatureState"
        | "skillProficiencies"
        | "savingThrowProficiencies"
        | "feats"
        | "statusEntries"
        | "spellSlotsExpended"
      >
    >
) => SubclassDerivedFeatureState;

const pathOfTheBerserkerSubclassId = "barbarian-path-of-the-berserker";
const pathOfTheWildHeartSubclassId = "barbarian-path-of-the-wild-heart";
const pathOfTheWorldTreeSubclassId = "barbarian-path-of-the-world-tree";
const collegeOfDanceSubclassId = "bard-college-of-dance";
const collegeOfGlamourSubclassId = "bard-college-of-glamour";
const collegeOfLoreSubclassId = "bard-college-of-lore";
const collegeOfTheMoonSubclassId = "bard-college-of-the-moon";
const circleOfTheLandSubclassId = "druid-circle-of-the-land";
const circleOfTheMoonSubclassId = "druid-circle-of-the-moon";
const circleOfTheSeaSubclassId = "druid-circle-of-the-sea";
const knowledgeDomainSubclassId = "cleric-knowledge-domain";
const lifeDomainSubclassId = "cleric-life-domain";
const lightDomainSubclassId = "cleric-light-domain";
const trickeryDomainSubclassId = "cleric-trickery-domain";
const warDomainSubclassId = "cleric-war-domain";
const oathOfTheAncientsSubclassId = "paladin-oath-of-the-ancients";
const oathOfDevotionSubclassId = "paladin-oath-of-devotion";
const oathOfGlorySubclassId = "paladin-oath-of-glory";
const oathOfTheNobleGeniesSubclassId = "paladin-oath-of-the-noble-genies";
const oathOfVengeanceSubclassId = "paladin-oath-of-vengeance";
const aberrantSorcerySubclassId = "sorcerer-aberrant-sorcery";
const clockworkSorcerySubclassId = "sorcerer-clockwork-sorcery";
const draconicSorcerySubclassId = "sorcerer-draconic-sorcery";
const spellfireSorcerySubclassId = "sorcerer-spellfire-sorcery";
const wildMagicSorcerySubclassId = "sorcerer-wild-magic-sorcery";
const wildHeartAnimalSpeakerSpellIds = ["spell-beast-sense", "spell-speak-with-animals"] as const;
const wildHeartNatureSpeakerSpellId = "spell-commune-with-nature";
const glamourBeguilingMagicSpellIds = ["spell-charm-person", "spell-mirror-image"] as const;
const glamourCommandSpellId = "spell-command";
const moonbeamSpellId = "spell-moonbeam";
const naturesWardPoisonedImmunitySourceId = "feature-druid-natures-ward-immunity-poisoned";
const naturesWardResistanceSourceIdPrefix = "feature-druid-natures-ward-resistance-";
export const circleOfTheLandSpellIdsByLand = {
  arid: {
    3: resolveSpellIdsByName(["Blur", "Burning Hands", "Fire Bolt"]),
    5: resolveSpellIdsByName(["Fireball"]),
    7: resolveSpellIdsByName(["Blight"]),
    9: resolveSpellIdsByName(["Wall of Stone"])
  },
  polar: {
    3: resolveSpellIdsByName(["Fog Cloud", "Hold Person", "Ray of Frost"]),
    5: resolveSpellIdsByName(["Sleet Storm"]),
    7: resolveSpellIdsByName(["Ice Storm"]),
    9: resolveSpellIdsByName(["Cone of Cold"])
  },
  temperate: {
    3: resolveSpellIdsByName(["Misty Step", "Shocking Grasp", "Sleep"]),
    5: resolveSpellIdsByName(["Lightning Bolt"]),
    7: resolveSpellIdsByName(["Freedom of Movement"]),
    9: resolveSpellIdsByName(["Tree Stride"])
  },
  tropical: {
    3: resolveSpellIdsByName(["Acid Splash", "Ray of Sickness", "Web"]),
    5: resolveSpellIdsByName(["Stinking Cloud"]),
    7: resolveSpellIdsByName(["Polymorph"]),
    9: resolveSpellIdsByName(["Insect Plague"])
  }
} as const;
export const circleOfTheMoonSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Cure Wounds", "Moonbeam", "Starry Wisp"]),
  5: resolveSpellIdsByName(["Conjure Animals"]),
  7: resolveSpellIdsByName(["Fount of Moonlight"]),
  9: resolveSpellIdsByName(["Mass Cure Wounds"])
} as const;
export const circleOfTheSeaSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Fog Cloud", "Gust of Wind", "Ray of Frost", "Shatter", "Thunderwave"]),
  5: resolveSpellIdsByName(["Lightning Bolt", "Water Breathing"]),
  7: resolveSpellIdsByName(["Control Water", "Ice Storm"]),
  9: resolveSpellIdsByName(["Conjure Elemental", "Hold Monster"])
} as const;
const knowledgeDomainSpellIdsByLevel = {
  3: [
    "spell-command",
    "spell-comprehend-languages",
    "spell-detect-magic",
    "spell-detect-thoughts",
    "spell-identify",
    "spell-mind-spike"
  ],
  5: ["spell-dispel-magic", "spell-nondetection", "spell-tongues"],
  7: ["spell-arcane-eye", "spell-banishment", "spell-confusion"],
  9: ["spell-legend-lore", "spell-scrying", "spell-synaptic-static"]
} as const;
const lifeDomainSpellIdsByLevel = {
  3: ["spell-aid", "spell-bless", "spell-cure-wounds", "spell-lesser-restoration"],
  5: ["spell-mass-healing-word", "spell-revivify"],
  7: ["spell-aura-of-life", "spell-death-ward"],
  9: ["spell-greater-restoration", "spell-mass-cure-wounds"]
} as const;
const lightDomainSpellIdsByLevel = {
  3: ["spell-burning-hands", "spell-faerie-fire", "spell-scorching-ray", "spell-see-invisibility"],
  5: ["spell-daylight", "spell-fireball"],
  7: ["spell-arcane-eye", "spell-wall-of-fire"],
  9: ["spell-flame-strike", "spell-scrying"]
} as const;
const trickeryDomainSpellIdsByLevel = {
  3: [
    "spell-charm-person",
    "spell-disguise-self",
    "spell-invisibility",
    "spell-pass-without-trace"
  ],
  5: ["spell-hypnotic-pattern", "spell-nondetection"],
  7: ["spell-confusion", "spell-dimension-door"],
  9: ["spell-dominate-person", "spell-modify-memory"]
} as const;
const warDomainSpellIdsByLevel = {
  3: [
    "spell-guiding-bolt",
    "spell-magic-weapon",
    "spell-shield-of-faith",
    "spell-spiritual-weapon"
  ],
  5: ["spell-crusaders-mantle", "spell-spirit-guardians"],
  7: ["spell-fire-shield", "spell-freedom-of-movement"],
  9: ["spell-hold-monster", "spell-steel-wind-strike"]
} as const;
const oathOfTheAncientsSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Ensnaring Strike", "Speak with Animals"]),
  5: resolveSpellIdsByName(["Misty Step", "Moonbeam"]),
  9: resolveSpellIdsByName(["Plant Growth", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Ice Storm", "Stoneskin"]),
  17: resolveSpellIdsByName(["Commune with Nature", "Tree Stride"])
} as const;
const oathOfDevotionSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Protection from Evil and Good", "Shield of Faith"]),
  5: resolveSpellIdsByName(["Aid", "Zone of Truth"]),
  9: resolveSpellIdsByName(["Beacon of Hope", "Dispel Magic"]),
  13: resolveSpellIdsByName(["Freedom of Movement", "Guardian of Faith"]),
  17: resolveSpellIdsByName(["Commune", "Flame Strike"])
} as const;
const oathOfGlorySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Guiding Bolt", "Heroism"]),
  5: resolveSpellIdsByName(["Enhance Ability", "Magic Weapon"]),
  9: resolveSpellIdsByName(["Haste", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Compulsion", "Freedom of Movement"]),
  17: resolveSpellIdsByName(["Legend Lore", "Yolande's Regal Presence"])
} as const;
const oathOfTheNobleGeniesSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Chromatic Orb", "Elementalism", "Thunderous Smite"]),
  5: resolveSpellIdsByName(["Mirror Image", "Phantasmal Force"]),
  9: resolveSpellIdsByName(["Fly", "Gaseous Form"]),
  13: resolveSpellIdsByName(["Conjure Minor Elementals", "Summon Elemental"]),
  17: resolveSpellIdsByName(["Banishing Smite", "Contact Other Plane"])
} as const;
const oathOfVengeanceSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Bane", "Hunter's Mark"]),
  5: resolveSpellIdsByName(["Hold Person", "Misty Step"]),
  9: resolveSpellIdsByName(["Haste", "Protection from Energy"]),
  13: resolveSpellIdsByName(["Banishment", "Dimension Door"]),
  17: resolveSpellIdsByName(["Hold Monster", "Scrying"])
} as const;
const aberrantSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName([
    "Arms of Hadar",
    "Calm Emotions",
    "Detect Thoughts",
    "Dissonant Whispers",
    "Mind Sliver"
  ]),
  5: resolveSpellIdsByName(["Hunger of Hadar", "Sending"]),
  7: resolveSpellIdsByName(["Evard's Black Tentacles", "Summon Aberration"]),
  9: resolveSpellIdsByName(["Rary's Telepathic Bond", "Telekinesis"])
} as const;
const clockworkSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Aid", "Alarm", "Lesser Restoration", "Protection from Evil and Good"]),
  5: resolveSpellIdsByName(["Dispel Magic", "Protection from Energy"]),
  7: resolveSpellIdsByName(["Freedom of Movement", "Summon Construct"]),
  9: resolveSpellIdsByName(["Greater Restoration", "Wall of Force"])
} as const;
const draconicSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Alter Self", "Chromatic Orb", "Command", "Dragon's Breath"]),
  5: resolveSpellIdsByName(["Fear", "Fly"]),
  7: resolveSpellIdsByName(["Arcane Eye", "Charm Monster"]),
  9: resolveSpellIdsByName(["Legend Lore", "Summon Dragon"])
} as const;
const spellfireSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Cure Wounds", "Guiding Bolt", "Lesser Restoration", "Scorching Ray"]),
  5: resolveSpellIdsByName(["Aura of Vitality", "Dispel Magic"]),
  7: resolveSpellIdsByName(["Fire Shield", "Wall of Fire"]),
  9: resolveSpellIdsByName(["Greater Restoration", "Flame Strike"])
} as const;
const spellfireSorceryBonusSpellIdsByLevel = {
  6: resolveSpellIdsByName(["Counterspell"])
} as const;
const agileStrikesDescription =
  "Agile Strikes: You can make one Unarmed Strike as part of this action.";
const dazzlingFootworkPerformanceIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: "Dazzling Footwork"
};

function resolveSpellIdsByName(names: readonly string[]): string[] {
  return names.flatMap((name) => {
    const spell = getSpellEntryByName(name);
    return spell ? [spell.id] : [];
  });
}

function hasCollegeOfDanceDazzlingFootwork(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfDanceSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWornBodyArmor(
  character: Partial<Pick<Character, "equipment" | "customEquipment">>
): boolean {
  return (
    (character.equipment ?? []).some((item) => {
      if (!item.worn) {
        return false;
      }

      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type !== "shield";
    }) ||
    (character.customEquipment ?? []).some(
      (entry) => entry.kind === "armor" && entry.armorType !== "shield" && entry.worn
    )
  );
}

function hasShieldEquipped(
  character: Partial<Pick<Character, "equipment" | "customEquipment">>
): boolean {
  return (
    (character.equipment ?? []).some((item) => {
      if (!item.onHand && !item.worn) {
        return false;
      }

      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield";
    }) ||
    (character.customEquipment ?? []).some(
      (entry) => entry.kind === "armor" && entry.armorType === "shield" && entry.worn
    )
  );
}

function hasActiveCollegeOfDanceCombatBenefits(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "equipment" | "customEquipment">>
): boolean {
  return (
    hasCollegeOfDanceDazzlingFootwork(character) &&
    !hasWornBodyArmor(character) &&
    !hasShieldEquipped(character)
  );
}

function createDefaultFeatureActionDescription(action: FeatureActionCard): string[] {
  const description: string[] = [];
  const normalizedDetail = action.detail.trim();
  const normalizedSummary = action.summary.trim();

  if (normalizedDetail) {
    description.push(normalizedDetail);
  }

  if (normalizedSummary && normalizedSummary !== normalizedDetail) {
    description.push(`<strong>${normalizedSummary}</strong>`);
  }

  return description;
}

function getCircleOfTheLandFeatureActions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): FeatureActionCard[] {
  if (character.className !== "Druid" || character.subclassId !== circleOfTheLandSubclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 3) {
    return [];
  }

  const druidResourceCharacter = {
    className: character.className,
    level,
    classFeatureState: character.classFeatureState
  };
  const usesRemaining = getDruidWildShapeUsesRemaining(druidResourceCharacter);
  const usesTotal = getDruidWildShapeUsesTotal(druidResourceCharacter);
  const description =
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      3,
      CLASS_FEATURE.LANDS_AID
    )?.description ?? [];
  const naturesSanctuaryDescription =
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      14,
      CLASS_FEATURE.NATURES_SANCTUARY
    )?.description ?? [];
  const resources = [
    {
      kind: "tracker" as const,
      label: "Wild Shape",
      current: usesRemaining,
      total: usesTotal,
      icon: "paw" as const,
      cost: 1
    }
  ];

  return [
    {
      key: druidLandsAidActionKey,
      name: "Lands Aid",
      summary: "Call life-draining thorns and healing flowers.",
      detail: "Expend a Wild Shape use to damage foes and restore an ally.",
      description,
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "paw",
      resources,
      drawer: {
        kind: "confirm",
        eyebrow: "Circle of the Land",
        description,
        confirmLabel: "Use Lands Aid",
        resources
      },
      execute: {
        kind: "activate"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
    },
    ...(level >= 14
      ? [
          {
            key: druidNaturesSanctuaryActionKey,
            name: "Nature's Sanctuary",
            summary: "Summon spectral trees and vines that shelter your allies.",
            detail: "Expend a Wild Shape use to create your sanctuary.",
            description: naturesSanctuaryDescription,
            economyType: ECONOMY_TYPE.ACTION,
            actionCategory: ACTION_CATEGORY.MAGIC,
            usesRemaining,
            usesTotal,
            hideUsesTrackerOnCard: true,
            usesInlineLabel: "Use 1",
            usesInlineIcon: "paw" as const,
            resources,
            drawer: {
              kind: "confirm" as const,
              eyebrow: "Circle of the Land",
              description: naturesSanctuaryDescription,
              confirmLabel: "Cast",
              resources
            },
            execute: {
              kind: "activate" as const,
              label: "Cast"
            },
            disabled: usesRemaining <= 0,
            disabledReason: usesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
          }
        ]
      : [])
  ];
}

function getCircleOfTheMoonFeatureActions(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        "level" | "subclassId" | "classFeatureState" | "spellSlotsExpended" | "abilities"
      >
    >
): FeatureActionCard[] {
  if (character.className !== "Druid" || character.subclassId !== circleOfTheMoonSubclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 10) {
    return [];
  }

  const druidResourceCharacter = {
    className: character.className,
    level,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState,
    spellSlotsExpended: character.spellSlotsExpended ?? [],
    abilities: character.abilities
  };
  const usesRemaining = getDruidMoonlightStepUsesRemaining(druidResourceCharacter);
  const usesTotal = getDruidMoonlightStepUsesTotal(druidResourceCharacter);
  const fallbackSlotLevel = getDruidMoonlightStepFallbackSlotLevel(druidResourceCharacter);
  const fallbackSlotSummary = getDruidMoonlightStepFallbackSlotSummary(druidResourceCharacter);
  const description =
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      10,
      CLASS_FEATURE.MOONLIGHT_STEP
    )?.description ?? [];
  const resources = [
    {
      kind: "tracker" as const,
      label: "Uses",
      current: usesRemaining,
      total: usesTotal,
      cost: 1
    },
    ...(fallbackSlotSummary.total > 0
      ? [
          {
            kind: "text" as const,
            label: "2+ Spell Slots",
            value: `${fallbackSlotSummary.remaining}/${fallbackSlotSummary.total}`
          }
        ]
      : [])
  ];
  const disabled = usesRemaining <= 0 && fallbackSlotLevel === null;

  return [
    {
      key: druidMoonlightStepActionKey,
      name: "Moonlight Step",
      summary: "Teleport up to 30 feet and empower your next attack.",
      detail: "Teleport up to 30 feet and gain Advantage on your next attack roll this turn.",
      description,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      usesInlineLabel:
        usesRemaining <= 0 && fallbackSlotLevel !== null ? "| Use 2+ Spell Slot" : undefined,
      resources,
      drawer: {
        kind: "confirm",
        eyebrow: "Circle of the Moon",
        description,
        confirmLabel: "Step",
        helperText:
          fallbackSlotSummary.total > 0
            ? "When your uses are gone, Moonlight Step spends your lowest available 2+ spell slot."
            : undefined,
        resources
      },
      execute: {
        kind: "activate",
        label: "Step"
      },
      disabled,
      disabledReason: disabled ? "No Moonlight Step uses or 2+ spell slots available." : undefined
    }
  ];
}

function getCircleOfTheSeaFeatureActions(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries">>
): FeatureActionCard[] {
  if (character.className !== "Druid" || character.subclassId !== circleOfTheSeaSubclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 3) {
    return [];
  }

  const druidResourceCharacter = {
    className: character.className,
    level,
    classFeatureState: character.classFeatureState
  };
  const usesRemaining = getDruidWildShapeUsesRemaining(druidResourceCharacter);
  const usesTotal = getDruidWildShapeUsesTotal(druidResourceCharacter);
  const wrathActive = getActiveWrathOfTheSeaStatusValue(character.statusEntries) !== null;
  const description =
    getSubclassFeatureDetails(
      getSelectedSubclassForCharacter(character),
      level,
      CLASS_FEATURE.WRATH_OF_THE_SEA
    )?.description ??
    (level >= 10
      ? [...stormbornWrathOfTheSeaDescription]
      : level >= 6
        ? [...aquaticAffinityWrathOfTheSeaDescription]
        : [...wrathOfTheSeaDescription]);
  const resources = [
    {
      kind: "tracker" as const,
      label: "Wild Shape",
      current: usesRemaining,
      total: usesTotal,
      icon: "paw" as const,
      cost: 1
    }
  ];

  return [
    {
      key: druidWrathOfTheSeaActionKey,
      name: "Wrath of the Sea",
      summary: "Manifest an ocean-spray aura that damages and pushes nearby creatures.",
      detail: "Expend a Wild Shape use to manifest your sea wrath for 10 minutes.",
      description,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "paw",
      isActive: wrathActive,
      resources,
      drawer: {
        kind: "confirm",
        eyebrow: "Circle of the Sea",
        description,
        confirmLabel: "Manifest",
        resources
      },
      execute: {
        kind: "activate"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
    }
  ];
}

function getActiveWrathOfTheSeaStatusValue(
  statusEntries: Character["statusEntries"] | undefined
): string | null {
  const activeEntry = statusEntries?.find(
    (entry) =>
      entry.sourceId === druidWrathOfTheSeaStatusSourceId && typeof entry.value === "string"
  );

  return typeof activeEntry?.value === "string" ? activeEntry.value : null;
}

function getCircleOfTheSeaSpeedBonuses(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "statusEntries">>
): FeatureSpeedBonus[] {
  if (character.className !== "Druid" || character.subclassId !== circleOfTheSeaSubclassId) {
    return [];
  }

  if ((character.level ?? 0) < 6) {
    return [];
  }

  return [
    {
      label: "Aquatic Affinity",
      movementType: "swim",
      value: 0,
      setBaseFromWalkMultiplier: 1
    },
    ...((character.level ?? 0) >= 10 &&
    getActiveWrathOfTheSeaStatusValue(character.statusEntries) !== null
      ? [
          {
            label: "Stormborn",
            movementType: "fly" as const,
            value: 0,
            setBaseFromWalkMultiplier: 1
          }
        ]
      : [])
  ];
}

function getCircleOfTheSeaStormbornEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "statusEntries">>
): DerivedFeatureStatusEntry[] {
  if (
    character.className !== "Druid" ||
    character.subclassId !== circleOfTheSeaSubclassId ||
    (character.level ?? 0) < 10
  ) {
    return [];
  }

  const wrathValue = getActiveWrathOfTheSeaStatusValue(character.statusEntries);

  if (!wrathValue) {
    return [];
  }

  return [DAMAGE_TYPE.COLD, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.THUNDER].map((damageType) => ({
    id: `feature-druid-stormborn-resistance-${damageType.toLowerCase()}`,
    sourceId: `feature-druid-stormborn-resistance-${damageType.toLowerCase()}`,
    group: STATUS_ENTRY_GROUP.RESISTANCES,
    value: damageType,
    source: "Stormborn",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
    duration: {
      kind: STATUS_DURATION_KIND.LINKED,
      linkedGroup: STATUS_ENTRY_GROUP.AURAS,
      linkedValue: wrathValue
    }
  }));
}

function getCircleOfTheLandNaturesWardEntries(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): DerivedFeatureStatusEntry[] {
  if (character.className !== "Druid" || character.subclassId !== circleOfTheLandSubclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 10) {
    return [];
  }

  const landChoice = getDruidCircleOfTheLandChoice({
    className: character.className,
    level,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState
  });

  const landResistanceByChoice: Partial<Record<NonNullable<typeof landChoice>, DAMAGE_TYPE>> = {
    arid: DAMAGE_TYPE.FIRE,
    polar: DAMAGE_TYPE.COLD,
    temperate: DAMAGE_TYPE.LIGHTNING,
    tropical: DAMAGE_TYPE.POISON
  };
  const resistance = landChoice ? landResistanceByChoice[landChoice] : null;
  const entries: DerivedFeatureStatusEntry[] = [
    {
      id: naturesWardPoisonedImmunitySourceId,
      sourceId: naturesWardPoisonedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.POISONED,
      source: "Nature's Ward",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];

  if (resistance) {
    entries.push({
      id: `${naturesWardResistanceSourceIdPrefix}${resistance.toLowerCase()}`,
      sourceId: `${naturesWardResistanceSourceIdPrefix}${resistance.toLowerCase()}`,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: resistance,
      source: "Nature's Ward",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    });
  }

  return entries;
}

function shouldAppendAgileStrikesDescription(action: FeatureActionCard): boolean {
  if (action.key === "bard-bardic-inspiration") {
    return true;
  }

  const searchableText = [action.name, action.summary, action.detail, ...(action.description ?? [])]
    .join(" ")
    .toLowerCase();

  return searchableText.includes("bardic inspiration") && searchableText.includes("expend");
}

function appendAgileStrikesDescription(action: FeatureActionCard): FeatureActionCard {
  if (!shouldAppendAgileStrikesDescription(action)) {
    return action;
  }

  const description = action.description?.length
    ? [...action.description]
    : createDefaultFeatureActionDescription(action);

  if (description.includes(agileStrikesDescription)) {
    return action;
  }

  return {
    ...action,
    description: [...description, agileStrikesDescription]
  };
}

function getBerserkerReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  if (
    character.className !== "Barbarian" ||
    character.subclassId !== pathOfTheBerserkerSubclassId ||
    (character.level ?? 0) < 10
  ) {
    return [];
  }

  const retaliation = getReactionEntryById("reaction-berserker-retaliation");

  return retaliation ? [retaliation] : [];
}

function getWorldTreeReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  if (
    character.className !== "Barbarian" ||
    character.subclassId !== pathOfTheWorldTreeSubclassId ||
    (character.level ?? 0) < 6
  ) {
    return [];
  }

  const branchesOfTheTree = getReactionEntryById("reaction-world-tree-branches-of-the-tree");

  return branchesOfTheTree ? [branchesOfTheTree] : [];
}

function getCollegeOfDanceReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  if (!hasCollegeOfDanceDazzlingFootwork(character) || (character.level ?? 0) < 6) {
    return [];
  }

  const inspiringMovement = getReactionEntryById("reaction-inspiring-movement");

  return inspiringMovement ? [inspiringMovement] : [];
}

function getCollegeOfLoreReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  if (
    character.className !== "Bard" ||
    character.subclassId !== collegeOfLoreSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return [];
  }

  const cuttingWords = getReactionEntryById("reaction-cutting-words");

  return cuttingWords ? [cuttingWords] : [];
}

function hasCollegeOfGlamourMantleOfInspiration(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasCollegeOfGlamourMantleOfMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasCollegeOfGlamourUnbreakableMajesty(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfGlamourSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function hasCollegeOfTheMoonMoonsInspiration(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasCollegeOfTheMoonBlessingOfMoonlight(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasCollegeOfTheMoonEventidesSplendor(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfTheMoonSubclassId &&
    (character.level ?? 0) >= 14
  );
}

type DomainSpellIdsByLevel = {
  3: readonly string[];
  5: readonly string[];
  7: readonly string[];
  9: readonly string[];
};

type PaladinOathSpellIdsByLevel = {
  3: readonly string[];
  5: readonly string[];
  9: readonly string[];
  13: readonly string[];
  17: readonly string[];
};

type SorcererSubclassSpellIdsByLevel = {
  3: readonly string[];
  5: readonly string[];
  7: readonly string[];
  9: readonly string[];
};

type DruidCircleOfTheLandSpellIdsByLevel = {
  3: readonly string[];
  5: readonly string[];
  7: readonly string[];
  9: readonly string[];
};

type DruidCircleOfTheMoonSpellIdsByLevel = {
  3: readonly string[];
  5: readonly string[];
  7: readonly string[];
  9: readonly string[];
};

function getClericDomainSpellIds(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  subclassId: string,
  spellIdsByLevel: DomainSpellIdsByLevel
): string[] {
  if (character.className !== "Cleric" || character.subclassId !== subclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 3) {
    return [];
  }

  return [
    ...spellIdsByLevel[3],
    ...(level >= 5 ? spellIdsByLevel[5] : []),
    ...(level >= 7 ? spellIdsByLevel[7] : []),
    ...(level >= 9 ? spellIdsByLevel[9] : [])
  ];
}

export function getDruidCircleOfTheLandSpellIdsForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>,
  spellIdsByLand: Record<string, DruidCircleOfTheLandSpellIdsByLevel>
): string[] {
  if (character.className !== "Druid" || character.subclassId !== circleOfTheLandSubclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 3) {
    return [];
  }

  const landChoice = getDruidCircleOfTheLandChoice({
    className: character.className,
    level,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState
  });

  if (!landChoice) {
    return [];
  }

  const spellIdsByLevel = spellIdsByLand[landChoice];

  return [
    ...spellIdsByLevel[3],
    ...(level >= 5 ? spellIdsByLevel[5] : []),
    ...(level >= 7 ? spellIdsByLevel[7] : []),
    ...(level >= 9 ? spellIdsByLevel[9] : [])
  ];
}

export function getDruidCircleOfTheMoonSpellIdsForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spellIdsByLevel: DruidCircleOfTheMoonSpellIdsByLevel
): string[] {
  if (character.className !== "Druid" || character.subclassId !== circleOfTheMoonSubclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 3) {
    return [];
  }

  return [
    ...spellIdsByLevel[3],
    ...(level >= 5 ? spellIdsByLevel[5] : []),
    ...(level >= 7 ? spellIdsByLevel[7] : []),
    ...(level >= 9 ? spellIdsByLevel[9] : [])
  ];
}

export function getDruidCircleOfTheSeaSpellIdsForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spellIdsByLevel: DruidCircleOfTheMoonSpellIdsByLevel
): string[] {
  if (character.className !== "Druid" || character.subclassId !== circleOfTheSeaSubclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 3) {
    return [];
  }

  return [
    ...spellIdsByLevel[3],
    ...(level >= 5 ? spellIdsByLevel[5] : []),
    ...(level >= 7 ? spellIdsByLevel[7] : []),
    ...(level >= 9 ? spellIdsByLevel[9] : [])
  ];
}

function getPaladinOathSpellIds(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  subclassId: string,
  spellIdsByLevel: PaladinOathSpellIdsByLevel
): string[] {
  if (character.className !== "Paladin" || character.subclassId !== subclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 3) {
    return [];
  }

  return [
    ...spellIdsByLevel[3],
    ...(level >= 5 ? spellIdsByLevel[5] : []),
    ...(level >= 9 ? spellIdsByLevel[9] : []),
    ...(level >= 13 ? spellIdsByLevel[13] : []),
    ...(level >= 17 ? spellIdsByLevel[17] : [])
  ];
}

function getSorcererSubclassSpellIds(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  subclassId: string,
  spellIdsByLevel: SorcererSubclassSpellIdsByLevel,
  bonusSpellIdsByLevel: Partial<Record<6, readonly string[]>> = {}
): string[] {
  if (character.className !== "Sorcerer" || character.subclassId !== subclassId) {
    return [];
  }

  const level = character.level ?? 0;

  if (level < 3) {
    return [];
  }

  return [
    ...spellIdsByLevel[3],
    ...(level >= 5 ? spellIdsByLevel[5] : []),
    ...(level >= 6 ? (bonusSpellIdsByLevel[6] ?? []) : []),
    ...(level >= 7 ? spellIdsByLevel[7] : []),
    ...(level >= 9 ? spellIdsByLevel[9] : [])
  ];
}

function appendInspiredEclipseDescription(
  action: FeatureActionCard,
  includeShadowOfTheNewMoon = false
): FeatureActionCard {
  if (action.key !== "bard-bardic-inspiration") {
    return action;
  }

  const description = action.description?.length
    ? [...action.description]
    : createDefaultFeatureActionDescription(action);
  const extraDescriptionEntries = includeShadowOfTheNewMoon
    ? [...inspiredEclipseDescription, ...shadowOfTheNewMoonDescription]
    : [...inspiredEclipseDescription];

  if (
    description.some(
      (entry) =>
        typeof entry === "string" &&
        extraDescriptionEntries.some((descriptionEntry) => descriptionEntry === entry)
    )
  ) {
    const missingEntries = extraDescriptionEntries.filter(
      (descriptionEntry) =>
        !description.some((entry) => typeof entry === "string" && entry === descriptionEntry)
    );

    return missingEntries.length > 0
      ? {
          ...action,
          description: [...description, ...missingEntries]
        }
      : action;
  }

  return {
    ...action,
    description: [...description, ...extraDescriptionEntries]
  };
}

function appendBlessingOfMoonlightDescription(spell: SpellEntry): SpellEntry {
  if (spell.id !== moonbeamSpellId) {
    return spell;
  }

  const hasBlessingDescription = spell.description.some(
    (entry) =>
      typeof entry === "string" &&
      blessingOfMoonlightDescription.some((descriptionEntry) => descriptionEntry === entry)
  );

  if (hasBlessingDescription) {
    return spell;
  }

  return {
    ...spell,
    description: [...spell.description, ...blessingOfMoonlightDescription]
  };
}

function getCollegeOfGlamourFeatureActions(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        | "level"
        | "classFeatureState"
        | "subclassId"
        | "abilities"
        | "feats"
        | "statusEntries"
        | "spellSlotsExpended"
      >
    >
): FeatureActionCard[] {
  if (character.level === undefined || !character.abilities || !character.feats) {
    return [];
  }

  const actions: FeatureActionCard[] = [];
  const bardResourceCharacter = {
    className: character.className,
    level: character.level,
    abilities: character.abilities,
    classFeatureState: character.classFeatureState,
    feats: character.feats
  };
  const glamourCharacter = {
    className: character.className,
    level: character.level,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState,
    spellSlotsExpended: character.spellSlotsExpended
  };
  const mantleActive = hasActiveMantleOfMajesty(character);
  const unbreakableMajestyActive = hasActiveUnbreakableMajesty(character);

  if (hasCollegeOfGlamourMantleOfInspiration(character)) {
    const usesRemaining = getBardicInspirationUsesRemaining(bardResourceCharacter);
    const usesTotal = getBardicInspirationUsesTotal(bardResourceCharacter);

    actions.push({
      key: mantleOfInspirationActionKey,
      name: "Mantle of Inspiration",
      summary: "Grant Temporary Hit Points and movement.",
      detail: "Expend a Bardic Inspiration die to empower nearby allies.",
      breakdown: "Grant TempHP to creatures",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining,
      usesTotal,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "music",
      description: [...mantleOfInspirationDescription],
      drawer: {
        kind: "confirm",
        eyebrow: "College of Glamour",
        confirmLabel: "Roll Bardic Dice",
        resources: [
          {
            kind: "tracker",
            label: "Uses",
            current: usesRemaining,
            total: usesTotal,
            icon: "music",
            cost: 1
          }
        ]
      },
      execute: {
        kind: "activate",
        effectKind: "bardic-inspiration-roll"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Bardic Inspiration uses remaining." : undefined
    });
  }

  if (hasCollegeOfGlamourMantleOfMajesty(character) && character.spellSlotsExpended !== undefined) {
    const usesRemaining = getMantleOfMajestyUsesRemaining(glamourCharacter);
    const usesTotal = getMantleOfMajestyUsesTotal(glamourCharacter);
    const fallbackSlotLevel = getMantleOfMajestyFallbackSlotLevel({
      className: character.className,
      level: character.level,
      spellSlotsExpended: character.spellSlotsExpended
    });
    const fallbackSlotSummary = getMantleOfMajestyFallbackSlotSummary({
      className: character.className,
      level: character.level,
      spellSlotsExpended: character.spellSlotsExpended
    });
    const hasFallbackSlot = fallbackSlotLevel !== null;

    actions.push({
      key: mantleOfMajestyActionKey,
      name: "Mantle of Majesty",
      summary: "Cast Command and assume your unearthly majesty.",
      detail: "Open Command and cast it through Mantle of Majesty.",
      breakdown: "Command as the Majesty you are.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      isActive: mantleActive,
      description: [...mantleOfMajestyDescription],
      resources: [
        {
          kind: "tracker",
          label: "Uses",
          current: usesRemaining,
          total: usesTotal
        },
        ...(usesRemaining <= 0 && hasFallbackSlot
          ? [
              {
                kind: "text" as const,
                label: "Level 3+ Slots",
                value: `${fallbackSlotSummary.remaining}/${fallbackSlotSummary.total}`
              }
            ]
          : [])
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "College of Glamour",
        confirmLabel: "Open Command"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "mantle-of-majesty",
        spellId: glamourCommandSpellId,
        spellLevel: 1,
        label: "Open Command",
        actionContextText: "Using Mantle of Majesty"
      },
      disabled: mantleActive || (usesRemaining <= 0 && !hasFallbackSlot),
      disabledReason: mantleActive
        ? "Mantle of Majesty is already active."
        : usesRemaining <= 0 && !hasFallbackSlot
          ? "No Mantle of Majesty use or level 3+ spell slots remaining."
          : undefined
    });
  }

  if (hasCollegeOfGlamourUnbreakableMajesty(character)) {
    const usesRemaining = getUnbreakableMajestyUsesRemaining(glamourCharacter);
    const usesTotal = getUnbreakableMajestyUsesTotal(glamourCharacter);

    actions.push({
      key: unbreakableMajestyActionKey,
      name: "Unbreakable Majesty",
      summary: "Assume a magically majestic presence.",
      detail: "Take on a magically majestic presence for 10 turns.",
      breakdown: "Assume magically majestic presense",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesRemaining,
      usesTotal,
      isActive: unbreakableMajestyActive,
      description: [...unbreakableMajestyDescription],
      resources: [
        {
          kind: "tracker",
          label: "Uses",
          current: usesRemaining,
          total: usesTotal
        }
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "College of Glamour",
        confirmLabel: "Assume Majesty"
      },
      execute: {
        kind: "activate"
      },
      disabled: unbreakableMajestyActive || usesRemaining <= 0,
      disabledReason: unbreakableMajestyActive
        ? "Unbreakable Majesty is already active."
        : usesRemaining <= 0
          ? "No Unbreakable Majesty uses remaining."
          : undefined
    });
  }

  return actions;
}

const subclassRuntimeResolvers: Record<string, SubclassRuntimeResolver> = {
  [pathOfTheBerserkerSubclassId]: (character) => ({
    reactionEntries: getBerserkerReactionEntries(character)
  }),
  [pathOfTheWildHeartSubclassId]: (character) => ({
    alwaysPreparedSpellIds:
      character.className === "Barbarian" &&
      character.subclassId === pathOfTheWildHeartSubclassId &&
      (character.level ?? 0) >= 3
        ? [
            ...wildHeartAnimalSpeakerSpellIds,
            ...((character.level ?? 0) >= 10 ? [wildHeartNatureSpeakerSpellId] : [])
          ]
        : []
  }),
  [pathOfTheWorldTreeSubclassId]: (character) => ({
    reactionEntries: getWorldTreeReactionEntries(character)
  }),
  [collegeOfDanceSubclassId]: (character) => ({
    reactionEntries: getCollegeOfDanceReactionEntries(character),
    skillIndicators: hasCollegeOfDanceDazzlingFootwork(character)
      ? {
          [SKILL.PERFORMANCE]: [dazzlingFootworkPerformanceIndicator]
        }
      : {},
    transformFeatureAction: hasActiveCollegeOfDanceCombatBenefits(character)
      ? appendAgileStrikesDescription
      : undefined,
    getArmorClassModes: (context) =>
      hasCollegeOfDanceDazzlingFootwork(character) &&
      !context.hasWornBodyArmor &&
      !context.hasShieldEquipped
        ? [
            {
              key: "bard-dance-unarmored-defense",
              label: "Unarmored Defense",
              baseValue: 10,
              abilityModifiers: ["DEX", "CHA"],
              shieldAllowed: false,
              detail: "College of Dance feature"
            }
          ]
        : [],
    getUnarmedStrikeConfig: () => {
      if (!hasActiveCollegeOfDanceCombatBenefits(character)) {
        return null;
      }

      const bardicDie = getBardicInspirationDie({
        className: character.className,
        level: character.level ?? 0
      });

      return {
        attackAbility: "finesse",
        damageAbility: "DEX",
        damageFormula: bardicDie ? `1${String(bardicDie).toLowerCase()}` : undefined,
        damageTypeLabel: "Bludgeoning"
      };
    }
  }),
  [collegeOfLoreSubclassId]: (character) => ({
    reactionEntries: getCollegeOfLoreReactionEntries(character)
  }),
  [circleOfTheLandSubclassId]: (character) => ({
    featureActions: getCircleOfTheLandFeatureActions(character),
    alwaysPreparedSpellIds: getDruidCircleOfTheLandSpellIdsForCharacter(
      character,
      circleOfTheLandSpellIdsByLand
    ),
    derivedStatusEntries: getCircleOfTheLandNaturesWardEntries(character)
  }),
  [circleOfTheMoonSubclassId]: (character) => ({
    featureActions: getCircleOfTheMoonFeatureActions(character),
    alwaysPreparedSpellIds: getDruidCircleOfTheMoonSpellIdsForCharacter(
      character,
      circleOfTheMoonSpellIdsByLevel
    )
  }),
  [circleOfTheSeaSubclassId]: (character) => ({
    featureActions: getCircleOfTheSeaFeatureActions(character),
    alwaysPreparedSpellIds: getDruidCircleOfTheSeaSpellIdsForCharacter(
      character,
      circleOfTheSeaSpellIdsByLevel
    ),
    speedBonuses: getCircleOfTheSeaSpeedBonuses(character),
    derivedStatusEntries: getCircleOfTheSeaStormbornEntries(character)
  }),
  [circleOfTheStarsSubclassId]: (character) => ({
    featureActions: getCircleOfTheStarsFeatureActions(character),
    weaponActions: getCircleOfTheStarsWeaponActions(character),
    alwaysPreparedSpellIds: getCircleOfTheStarsAlwaysPreparedSpellIds(character)
  }),
  [collegeOfTheMoonSubclassId]: (character) => ({
    transformFeatureAction: hasCollegeOfTheMoonMoonsInspiration(character)
      ? (action) =>
          appendInspiredEclipseDescription(action, hasCollegeOfTheMoonEventidesSplendor(character))
      : undefined,
    alwaysPreparedSpellIds:
      character.className === "Bard" &&
      character.subclassId === collegeOfTheMoonSubclassId &&
      (character.level ?? 0) >= 6
        ? [moonbeamSpellId]
        : [],
    transformSpellEntry: hasCollegeOfTheMoonBlessingOfMoonlight(character)
      ? appendBlessingOfMoonlightDescription
      : undefined
  }),
  [collegeOfGlamourSubclassId]: (character) => ({
    featureActions: getCollegeOfGlamourFeatureActions(character),
    alwaysPreparedSpellIds:
      character.className === "Bard" &&
      character.subclassId === collegeOfGlamourSubclassId &&
      (character.level ?? 0) >= 3
        ? [
            ...glamourBeguilingMagicSpellIds,
            ...((character.level ?? 0) >= 6 ? [glamourCommandSpellId] : [])
          ]
        : [],
    transformSpellEntry: (spell) =>
      hasActiveMantleOfMajesty(character) && spell.id === glamourCommandSpellId
        ? {
            ...spell,
            castingTime: [ACTION_TYPE.BONUS_ACTION]
          }
        : spell
  }),
  [knowledgeDomainSubclassId]: (character) => ({
    featureActions: getKnowledgeDomainFeatureActions(character),
    skillProficiencyEntries: getKnowledgeDomainSkillProficiencyEntries(character),
    savingThrowProficiencyEntries: getKnowledgeDomainSavingThrowProficiencyEntries(character),
    skillIndicators: getKnowledgeDomainSkillIndicators(character),
    savingThrowIndicators: getKnowledgeDomainSavingThrowIndicators(character),
    alwaysPreparedSpellIds: getClericDomainSpellIds(
      character,
      knowledgeDomainSubclassId,
      knowledgeDomainSpellIdsByLevel
    )
  }),
  [lifeDomainSubclassId]: (character) => ({
    alwaysPreparedSpellIds: getClericDomainSpellIds(
      character,
      lifeDomainSubclassId,
      lifeDomainSpellIdsByLevel
    )
  }),
  [lightDomainSubclassId]: (character) => ({
    alwaysPreparedSpellIds: getClericDomainSpellIds(
      character,
      lightDomainSubclassId,
      lightDomainSpellIdsByLevel
    )
  }),
  [trickeryDomainSubclassId]: (character) => ({
    alwaysPreparedSpellIds: getClericDomainSpellIds(
      character,
      trickeryDomainSubclassId,
      trickeryDomainSpellIdsByLevel
    )
  }),
  [warDomainSubclassId]: (character) => ({
    alwaysPreparedSpellIds: getClericDomainSpellIds(
      character,
      warDomainSubclassId,
      warDomainSpellIdsByLevel
    )
  }),
  [oathOfTheAncientsSubclassId]: (character) => ({
    alwaysPreparedSpellIds: getPaladinOathSpellIds(
      character,
      oathOfTheAncientsSubclassId,
      oathOfTheAncientsSpellIdsByLevel
    )
  }),
  [oathOfDevotionSubclassId]: (character) => ({
    alwaysPreparedSpellIds: getPaladinOathSpellIds(
      character,
      oathOfDevotionSubclassId,
      oathOfDevotionSpellIdsByLevel
    )
  }),
  [oathOfGlorySubclassId]: (character) => ({
    alwaysPreparedSpellIds: getPaladinOathSpellIds(
      character,
      oathOfGlorySubclassId,
      oathOfGlorySpellIdsByLevel
    )
  }),
  [oathOfTheNobleGeniesSubclassId]: (character) => ({
    alwaysPreparedSpellIds: getPaladinOathSpellIds(
      character,
      oathOfTheNobleGeniesSubclassId,
      oathOfTheNobleGeniesSpellIdsByLevel
    )
  }),
  [oathOfVengeanceSubclassId]: (character) => ({
    alwaysPreparedSpellIds: getPaladinOathSpellIds(
      character,
      oathOfVengeanceSubclassId,
      oathOfVengeanceSpellIdsByLevel
    )
  }),
  [aberrantSorcerySubclassId]: (character) => ({
    alwaysPreparedSpellIds: getSorcererSubclassSpellIds(
      character,
      aberrantSorcerySubclassId,
      aberrantSorcerySpellIdsByLevel
    )
  }),
  [clockworkSorcerySubclassId]: (character) => ({
    alwaysPreparedSpellIds: getSorcererSubclassSpellIds(
      character,
      clockworkSorcerySubclassId,
      clockworkSorcerySpellIdsByLevel
    )
  }),
  [draconicSorcerySubclassId]: (character) => ({
    alwaysPreparedSpellIds: getSorcererSubclassSpellIds(
      character,
      draconicSorcerySubclassId,
      draconicSorcerySpellIdsByLevel
    )
  }),
  [spellfireSorcerySubclassId]: (character) => ({
    alwaysPreparedSpellIds: getSorcererSubclassSpellIds(
      character,
      spellfireSorcerySubclassId,
      spellfireSorcerySpellIdsByLevel,
      spellfireSorceryBonusSpellIdsByLevel
    )
  }),
  [wildMagicSorcerySubclassId]: () => ({
    alwaysPreparedSpellIds: []
  })
};

export function getSubclassDerivedFeatureState(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        | "level"
        | "subclassId"
        | "equipment"
        | "customEquipment"
        | "abilities"
        | "classFeatureState"
        | "skillProficiencies"
        | "savingThrowProficiencies"
        | "feats"
        | "statusEntries"
        | "spellSlotsExpended"
      >
    >
): SubclassDerivedFeatureState {
  const subclass = getSelectedSubclassForCharacter(character);

  if (!subclass) {
    return {};
  }

  const runtimeResolver =
    subclassRuntimeResolvers[subclass.runtimeHookId ?? subclass.id] ??
    subclassRuntimeResolvers[subclass.id];

  return runtimeResolver ? runtimeResolver(character) : {};
}
