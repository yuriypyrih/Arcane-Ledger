import {
  barbarianFeatureMap,
  paladinFeatureMap,
  rogueFeatureMap,
  sorcererFeatureMap
} from "../../codex/classes";
import { divineForeknowledgeDescription } from "../../codex/subclasses/cleric";
import { banneretTeamTacticsDescription } from "../../codex/subclasses/fighterBanneret";
import {
  psiWarriorBulwarkOfForceDescription,
  psiWarriorPsiPoweredLeapDescription
} from "../../codex/subclasses/fighterPsiWarrior";
import { psiWarriorTelekineticMasterDescription } from "../../codex/subclasses/fighterPsiWarrior";
import {
  aquaticAffinityWrathOfTheSeaDescription,
  naturesSanctuaryDescription,
  starryFormDescription,
  wrathOfTheSeaDescription
} from "../../codex/subclasses/druid";
import { getSubclassEntryById } from "../../codex/subclasses";
import type { SpellDescriptionEntry, SpellDurationPart } from "../../codex/entries";
import { CLASS_FEATURE, DAMAGE_TYPE, DURATION } from "../../codex/entries";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_DURATION_PRESET,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusDuration,
  type CharacterStatusEntry,
  type CharacterStatusValue,
  type ImmunityValue
} from "../../types";
import { formatCodexLabel } from "../../utils/codex";
import { fighterBanneretTeamTacticsStatusSourceId } from "./classFeatures/fighter/subclasses/fighterBanneretShared";
import {
  fighterPsiWarriorBulwarkOfForceStatusSourceId,
  fighterPsiWarriorPsiPoweredLeapStatusSourceId,
  fighterPsiWarriorTelekineticMasterStatusSourceId
} from "./classFeatures/fighter/subclasses/fighterPsiWarriorShared";
import {
  rangerHunterEscapeTheHordeStatusSourceId,
  rangerHunterMultiattackDefenseStatusSourceId,
  rangerHunterSuperiorHuntersDefenseStatusSourceId
} from "./classFeatures/ranger/subclasses/rangerHunter";
import {
  rangerGloomStalkerUmbralSightSenseSourceId,
  rangerGloomStalkerUmbralSightStatusSourceId
} from "./classFeatures/ranger/subclasses/rangerGloomStalker";
import {
  rangerWinterWalkerBitingColdStatusSourceId,
  rangerWinterWalkerFrozenHauntStatusSourceId
} from "./classFeatures/ranger/subclasses/rangerWinterWalker";
import { getSorcererDraconicResilienceHitPointMaximumBonus } from "./classFeatures/sorcerer/subclasses/sorcererDraconicSorcery";
import {
  isRogueArcaneTricksterSpellThiefStatusSourceId,
  rogueArcaneTricksterMagicalAmbushStatusSourceId
} from "./classFeatures/rogue/subclasses/rogueArcaneTrickster";
import { getKeywordDescriptionLines } from "./keywordDescriptions";
import { clampInteger } from "./shared";

const senseValues = new Set<SENSE>(Object.values(SENSE));
const effectValues = new Set<EFFECT_NAME>(Object.values(EFFECT_NAME));
const conditionValues = new Set<CONDITION_NAME>(Object.values(CONDITION_NAME));
const damageTypeValues = new Set<DAMAGE_TYPE>(Object.values(DAMAGE_TYPE));
const statusGroupValues = new Set<STATUS_ENTRY_GROUP>(Object.values(STATUS_ENTRY_GROUP));
const statusSourceTypeValues = new Set<STATUS_ENTRY_SOURCE_TYPE>(
  Object.values(STATUS_ENTRY_SOURCE_TYPE)
);
const exhaustionConditionOptionPrefix = "EXHAUSTION_LEVEL_";
const unbreakableMajestyStatusSourceId = "feature-bard-unbreakable-majesty";
const divineForeknowledgeStatusSourceId = "feature-cleric-divine-foreknowledge";
const druidNaturesSanctuaryStatusSourceId = "feature-druid-natures-sanctuary";
const druidStarryFormStatusSourceId = "feature-druid-starry-form";
const druidWrathOfTheSeaStatusSourceId = "feature-druid-wrath-of-the-sea";
const monkCloakOfShadowStatusSourceId = "feature-monk-warrior-of-shadow-cloak-of-shadow";
const monkQuiveringPalmStatusSourceId = "feature-monk-warrior-of-the-open-hand-quivering-palm";
const monkElementalAttunementStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement";
const monkElementalAttunementStrideStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement-stride";
const monkElementalAttunementEpitomeStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement-epitome";
const paladinAuraOfDevotionStatusSourceId = "feature-paladin-oath-of-devotion-aura-of-devotion";
const paladinAuraOfDevotionImmunitySourceId =
  "feature-paladin-oath-of-devotion-aura-of-devotion-immunity";
const paladinAuraOfWardingStatusSourceId = "feature-paladin-oath-of-the-ancients-aura-of-warding";
const paladinAuraOfElementalShieldingStatusSourceId =
  "feature-paladin-oath-of-the-noble-genies-aura-of-elemental-shielding";
const paladinElderChampionStatusSourceId = "feature-paladin-oath-of-the-ancients-elder-champion";
const paladinDiminishDefianceStatusSourceId =
  "feature-paladin-oath-of-the-ancients-diminish-defiance";
const paladinHolyNimbusStatusSourceId = "feature-paladin-oath-of-devotion-holy-nimbus";
const paladinPeerlessAthleteStatusSourceId = "feature-paladin-oath-of-glory-peerless-athlete";
const paladinAuraOfAlacrityProtectionStatusSourceId =
  "feature-paladin-aura-of-protection-oath-of-glory-aura-of-alacrity";
const paladinLivingLegendStatusSourceId = "feature-paladin-oath-of-glory-living-legend";
const paladinNobleScionStatusSourceId = "feature-paladin-oath-of-the-noble-genies-noble-scion";
const paladinMinorWishStatusSourceId = "feature-paladin-oath-of-the-noble-genies-minor-wish";
const paladinAvengingAngelStatusSourceId = "feature-paladin-oath-of-vengeance-avenging-angel";
const paladinFrightfulAuraStatusSourceId = "feature-paladin-oath-of-vengeance-frightful-aura";
const sorcererTelepathicSpeechStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-telepathic-speech";
const sorcererPsychicDefensesStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-psychic-defenses";
const sorcererClockworkBastionOfLawStatusSourceId =
  "feature-sorcerer-clockwork-sorcery-bastion-of-law";
const sorcererClockworkTranceOfOrderStatusSourceId =
  "feature-sorcerer-clockwork-sorcery-trance-of-order";
const sorcererSpellfireCrownOfSpellfireStatusSourceId =
  "feature-sorcerer-spellfire-sorcery-crown-of-spellfire";
const sorcererRevelationInFleshAquaticAdaptationStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-revelation-in-flesh-aquatic-adaptation";
const sorcererRevelationInFleshGlisteningFlightStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-revelation-in-flesh-glistening-flight";
const sorcererRevelationInFleshSeeTheInvisibleStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-revelation-in-flesh-see-the-invisible";
const sorcererRevelationInFleshWormlikeMovementStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-revelation-in-flesh-wormlike-movement";
const monkWarriorOfShadowSubclassEntry = getSubclassEntryById("monk-warrior-of-shadow");
const monkWarriorOfTheElementsSubclassEntry = getSubclassEntryById(
  "monk-warrior-of-the-elements"
);
const paladinOathOfTheAncientsSubclassEntry = getSubclassEntryById("paladin-oath-of-the-ancients");
const paladinOathOfDevotionSubclassEntry = getSubclassEntryById("paladin-oath-of-devotion");
const paladinOathOfGlorySubclassEntry = getSubclassEntryById("paladin-oath-of-glory");
const paladinOathOfTheNobleGeniesSubclassEntry = getSubclassEntryById(
  "paladin-oath-of-the-noble-genies"
);
const paladinOathOfVengeanceSubclassEntry = getSubclassEntryById("paladin-oath-of-vengeance");
const rangerHunterSubclassEntry = getSubclassEntryById("ranger-hunter");
const rangerGloomStalkerSubclassEntry = getSubclassEntryById("ranger-gloom-stalker");
const rangerWinterWalkerSubclassEntry = getSubclassEntryById("ranger-winter-walker");
const rogueArcaneTricksterSubclassEntry = getSubclassEntryById("rogue-arcane-trickster");
const sorcererAberrantSorcerySubclassEntry = getSubclassEntryById("sorcerer-aberrant-sorcery");
const sorcererClockworkSorcerySubclassEntry = getSubclassEntryById("sorcerer-clockwork-sorcery");
const sorcererSpellfireSorcerySubclassEntry = getSubclassEntryById("sorcerer-spellfire-sorcery");

function extractSubclassFeatureDescriptionSection(
  description: readonly string[],
  heading: string
): string[] {
  const startIndex = description.findIndex((entry) => entry.includes(heading));

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && entry.startsWith("<strong>")) {
      break;
    }

    section.push(entry);
  }

  return section;
}
const monkCloakOfShadowsDescription =
  monkWarriorOfShadowSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.CLOAK_OF_SHADOWS))
    ?.featureOverrides?.[CLASS_FEATURE.CLOAK_OF_SHADOWS]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const monkElementalAttunementTraitDescription =
  monkWarriorOfTheElementsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.ELEMENTAL_ATTUNEMENT))
    ?.featureOverrides?.[CLASS_FEATURE.ELEMENTAL_ATTUNEMENT]?.description?.filter(
      (entry): entry is string =>
        typeof entry === "string" &&
        (entry.startsWith("<strong>Reach.</strong>") ||
          entry.startsWith("<strong>Elemental Strikes.</strong>"))
    ) ?? [];
const monkStrideOfTheElementsDescription =
  monkWarriorOfTheElementsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.STRIDE_OF_THE_ELEMENTS))
    ?.featureOverrides?.[CLASS_FEATURE.STRIDE_OF_THE_ELEMENTS]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const monkElementalEpitomeDescription =
  monkWarriorOfTheElementsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.ELEMENTAL_EPITOME))
    ?.featureOverrides?.[CLASS_FEATURE.ELEMENTAL_EPITOME]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinAuraOfDevotionDescription =
  paladinOathOfDevotionSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AURA_OF_DEVOTION))
    ?.featureOverrides?.[CLASS_FEATURE.AURA_OF_DEVOTION]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinAuraOfWardingDescription =
  paladinOathOfTheAncientsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AURA_OF_WARDING))
    ?.featureOverrides?.[CLASS_FEATURE.AURA_OF_WARDING]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinAuraOfElementalShieldingDescription =
  paladinOathOfTheNobleGeniesSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AURA_OF_ELEMENTAL_SHIELDING))
    ?.featureOverrides?.[CLASS_FEATURE.AURA_OF_ELEMENTAL_SHIELDING]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinElderChampionDescription =
  paladinOathOfTheAncientsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.ELDER_CHAMPION))
    ?.featureOverrides?.[CLASS_FEATURE.ELDER_CHAMPION]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinDiminishDefianceDescription = [
  "Enemies in the aura have Disadvantage on saving throws against your spells and Channel Divinity options."
];
const paladinHolyNimbusDescription =
  paladinOathOfDevotionSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.HOLY_NIMBUS))
    ?.featureOverrides?.[CLASS_FEATURE.HOLY_NIMBUS]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinPeerlessAthleteDescription =
  paladinOathOfGlorySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.PEERLESS_ATHLETE))
    ?.featureOverrides?.[CLASS_FEATURE.PEERLESS_ATHLETE]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinAuraOfAlacrityDescription =
  paladinOathOfGlorySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AURA_OF_ALACRITY))
    ?.featureOverrides?.[CLASS_FEATURE.AURA_OF_ALACRITY]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinLivingLegendDescription =
  paladinOathOfGlorySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.LIVING_LEGEND))
    ?.featureOverrides?.[CLASS_FEATURE.LIVING_LEGEND]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinNobleScionDescription =
  paladinOathOfTheNobleGeniesSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.NOBLE_SCION))
    ?.featureOverrides?.[CLASS_FEATURE.NOBLE_SCION]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinMinorWishDescription = [
  "When you or an ally in your Aura of Protection fails a D20 Test, you can take a Reaction to make the D20 Test succeed instead."
];
const paladinAvengingAngelDescription =
  paladinOathOfVengeanceSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AVENGING_ANGEL))
    ?.featureOverrides?.[CLASS_FEATURE.AVENGING_ANGEL]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const paladinFrightfulAuraDescription = [
  "Whenever an enemy starts its turn in your Aura of Protection, that creature must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute or until it takes any damage.",
  "Attack rolls against the Frightened creature have Advantage."
];
const sorcererTelepathicSpeechDescription =
  sorcererAberrantSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.TELEPATHIC_SPEECH))
    ?.featureOverrides?.[CLASS_FEATURE.TELEPATHIC_SPEECH]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const sorcererPsychicDefensesDescription =
  sorcererAberrantSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.PSYCHIC_DEFENSES))
    ?.featureOverrides?.[CLASS_FEATURE.PSYCHIC_DEFENSES]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const sorcererBastionOfLawDescription =
  sorcererClockworkSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.BASTION_OF_LAW))
    ?.featureOverrides?.[CLASS_FEATURE.BASTION_OF_LAW]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const sorcererTranceOfOrderDescription =
  sorcererClockworkSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.TRANCE_OF_ORDER))
    ?.featureOverrides?.[CLASS_FEATURE.TRANCE_OF_ORDER]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const sorcererCrownOfSpellfireDescription =
  sorcererSpellfireSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.CROWN_OF_SPELLFIRE))
    ?.featureOverrides?.[CLASS_FEATURE.CROWN_OF_SPELLFIRE]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const sorcererRevelationInFleshDescription =
  sorcererAberrantSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.REVELATION_IN_FLESH))
    ?.featureOverrides?.[CLASS_FEATURE.REVELATION_IN_FLESH]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const sorcererRevelationInFleshAquaticAdaptationDescription =
  extractSubclassFeatureDescriptionSection(
    sorcererRevelationInFleshDescription,
    "<strong>Aquatic Adaptation.</strong>"
  );
const sorcererRevelationInFleshGlisteningFlightDescription =
  extractSubclassFeatureDescriptionSection(
    sorcererRevelationInFleshDescription,
    "<strong>Glistening Flight.</strong>"
  );
const sorcererRevelationInFleshSeeTheInvisibleDescription =
  extractSubclassFeatureDescriptionSection(
    sorcererRevelationInFleshDescription,
    "<strong>See the Invisible.</strong>"
  );
const sorcererRevelationInFleshWormlikeMovementDescription =
  extractSubclassFeatureDescriptionSection(
    sorcererRevelationInFleshDescription,
    "<strong>Wormlike Movement.</strong>"
  );
const rangerDefensiveTacticsDescription =
  rangerHunterSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.DEFENSIVE_TACTICS))
    ?.featureOverrides?.[CLASS_FEATURE.DEFENSIVE_TACTICS]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const rangerEscapeTheHordeDescription = extractSubclassFeatureDescriptionSection(
  rangerDefensiveTacticsDescription,
  "<strong>Escape the Horde.</strong>"
);
const rangerMultiattackDefenseDescription = extractSubclassFeatureDescriptionSection(
  rangerDefensiveTacticsDescription,
  "<strong>Multiattack Defense.</strong>"
);
const rangerSuperiorHuntersDefenseDescription =
  rangerHunterSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.SUPERIOR_HUNTERS_DEFENSE))
    ?.featureOverrides?.[CLASS_FEATURE.SUPERIOR_HUNTERS_DEFENSE]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const rangerUmbralSightDescription =
  rangerGloomStalkerSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.UMBRAL_SIGHT))
    ?.featureOverrides?.[CLASS_FEATURE.UMBRAL_SIGHT]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const rangerFrigidExplorerDescription =
  rangerWinterWalkerSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.FRIGID_EXPLORER))
    ?.featureOverrides?.[CLASS_FEATURE.FRIGID_EXPLORER]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const rangerBitingColdDescription = extractSubclassFeatureDescriptionSection(
  rangerFrigidExplorerDescription,
  "<strong>Biting Cold.</strong>"
);
const rangerFrozenHauntDescription =
  rangerWinterWalkerSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.FROZEN_HAUNT))
    ?.featureOverrides?.[CLASS_FEATURE.FROZEN_HAUNT]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const rogueArcaneTricksterMagicalAmbushDescription =
  rogueArcaneTricksterSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.MAGICAL_AMBUSH))
    ?.featureOverrides?.[CLASS_FEATURE.MAGICAL_AMBUSH]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const rogueArcaneTricksterSpellThiefDescription =
  rogueArcaneTricksterSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.SPELL_THIEF))
    ?.featureOverrides?.[CLASS_FEATURE.SPELL_THIEF]?.description?.filter(
      (entry): entry is string => typeof entry === "string"
    ) ?? [];
const monkQuiveringPalmTraitDescription = ["You have marked a creature with Quivering Palm."];
export const exhaustionLevels = [1, 2, 3, 4, 5, 6] as const;
export type ExhaustionLevel = (typeof exhaustionLevels)[number];
export type ExhaustionConditionOptionValue =
  `${typeof exhaustionConditionOptionPrefix}${ExhaustionLevel}`;
export type ConditionOptionValue = CONDITION_NAME | ExhaustionConditionOptionValue;
const exhaustionConditionOptionValues = exhaustionLevels.map(
  (level) => `${exhaustionConditionOptionPrefix}${level}` as ExhaustionConditionOptionValue
);
const exhaustionDescriptionEntries: SpellDescriptionEntry[] = [
  "Higher Exhaustion levels include all lower-level effects.",
  "<strong>Level 1.</strong> You have <link:Disadvantage>Disadvantage</link> on ability checks.",
  "<strong>Level 2.</strong> Your <link:Speed>Speed</link> is halved.",
  "<strong>Level 3.</strong> You have <link:Disadvantage>Disadvantage</link> on attack rolls and saving throws.",
  "<strong>Level 4.</strong> Your Hit Point maximum is halved.",
  "<strong>Level 5.</strong> Your <link:Speed>Speed</link> is reduced to 0.",
  "<strong>Level 6.</strong> You die. This death bypasses death saving throws."
];

export const statusGroupOrder: STATUS_ENTRY_GROUP[] = [
  STATUS_ENTRY_GROUP.EFFECTS,
  STATUS_ENTRY_GROUP.REACTIONS,
  STATUS_ENTRY_GROUP.SENSES,
  STATUS_ENTRY_GROUP.AURAS,
  STATUS_ENTRY_GROUP.RESISTANCES,
  STATUS_ENTRY_GROUP.VULNERABILITIES,
  STATUS_ENTRY_GROUP.IMMUNITIES,
  STATUS_ENTRY_GROUP.CONDITIONS
];

export const statusGroupTitles: Record<STATUS_ENTRY_GROUP, string> = {
  [STATUS_ENTRY_GROUP.EFFECTS]: "Features",
  [STATUS_ENTRY_GROUP.REACTIONS]: "Reactions",
  [STATUS_ENTRY_GROUP.SENSES]: "Senses",
  [STATUS_ENTRY_GROUP.AURAS]: "Auras",
  [STATUS_ENTRY_GROUP.RESISTANCES]: "Resistances",
  [STATUS_ENTRY_GROUP.VULNERABILITIES]: "Vulnerabilities",
  [STATUS_ENTRY_GROUP.IMMUNITIES]: "Immunities",
  [STATUS_ENTRY_GROUP.CONDITIONS]: "Conditions"
};

export const durationPresetOptions: Array<{
  value: STATUS_DURATION_PRESET;
  label: string;
}> = [
  { value: STATUS_DURATION_PRESET.INFINITE, label: "Infinity" },
  { value: STATUS_DURATION_PRESET.CONCENTRATION, label: "Concentration" },
  { value: STATUS_DURATION_PRESET.ONE_MINUTE, label: "1 minute" },
  { value: STATUS_DURATION_PRESET.TEN_MINUTES, label: "10 minutes" },
  { value: STATUS_DURATION_PRESET.ONE_HOUR, label: "1 hour" },
  { value: STATUS_DURATION_PRESET.TWO_HOURS, label: "2 hours" },
  { value: STATUS_DURATION_PRESET.EIGHT_HOURS, label: "8 hours" },
  { value: STATUS_DURATION_PRESET.TWELVE_HOURS, label: "12 hours" },
  { value: STATUS_DURATION_PRESET.TWENTY_FOUR_HOURS, label: "24 hours" },
  ...Array.from({ length: 20 }, (_, index) => ({
    value: roundCountToDurationPreset(index + 1),
    label: `${index + 1} round${index === 0 ? "" : "s"}`
  }))
];

export const statusRoundTickOptions: Array<{
  value: STATUS_DURATION_ROUND_TICK;
  label: string;
}> = [
  { value: STATUS_DURATION_ROUND_TICK.ROUND_START, label: "Round Start" },
  { value: STATUS_DURATION_ROUND_TICK.ROUND_END, label: "Round End" }
];

function roundCountToDurationPreset(rounds: number): STATUS_DURATION_PRESET {
  return [
    STATUS_DURATION_PRESET.ONE_ROUND,
    STATUS_DURATION_PRESET.TWO_ROUNDS,
    STATUS_DURATION_PRESET.THREE_ROUNDS,
    STATUS_DURATION_PRESET.FOUR_ROUNDS,
    STATUS_DURATION_PRESET.FIVE_ROUNDS,
    STATUS_DURATION_PRESET.SIX_ROUNDS,
    STATUS_DURATION_PRESET.SEVEN_ROUNDS,
    STATUS_DURATION_PRESET.EIGHT_ROUNDS,
    STATUS_DURATION_PRESET.NINE_ROUNDS,
    STATUS_DURATION_PRESET.TEN_ROUNDS,
    STATUS_DURATION_PRESET.ELEVEN_ROUNDS,
    STATUS_DURATION_PRESET.TWELVE_ROUNDS,
    STATUS_DURATION_PRESET.THIRTEEN_ROUNDS,
    STATUS_DURATION_PRESET.FOURTEEN_ROUNDS,
    STATUS_DURATION_PRESET.FIFTEEN_ROUNDS,
    STATUS_DURATION_PRESET.SIXTEEN_ROUNDS,
    STATUS_DURATION_PRESET.SEVENTEEN_ROUNDS,
    STATUS_DURATION_PRESET.EIGHTEEN_ROUNDS,
    STATUS_DURATION_PRESET.NINETEEN_ROUNDS,
    STATUS_DURATION_PRESET.TWENTY_ROUNDS
  ][Math.max(0, Math.min(19, rounds - 1))];
}

function durationPresetToRoundCount(preset: STATUS_DURATION_PRESET): number | null {
  const mapping = new Map<STATUS_DURATION_PRESET, number>([
    [STATUS_DURATION_PRESET.ONE_ROUND, 1],
    [STATUS_DURATION_PRESET.TWO_ROUNDS, 2],
    [STATUS_DURATION_PRESET.THREE_ROUNDS, 3],
    [STATUS_DURATION_PRESET.FOUR_ROUNDS, 4],
    [STATUS_DURATION_PRESET.FIVE_ROUNDS, 5],
    [STATUS_DURATION_PRESET.SIX_ROUNDS, 6],
    [STATUS_DURATION_PRESET.SEVEN_ROUNDS, 7],
    [STATUS_DURATION_PRESET.EIGHT_ROUNDS, 8],
    [STATUS_DURATION_PRESET.NINE_ROUNDS, 9],
    [STATUS_DURATION_PRESET.TEN_ROUNDS, 10],
    [STATUS_DURATION_PRESET.ELEVEN_ROUNDS, 11],
    [STATUS_DURATION_PRESET.TWELVE_ROUNDS, 12],
    [STATUS_DURATION_PRESET.THIRTEEN_ROUNDS, 13],
    [STATUS_DURATION_PRESET.FOURTEEN_ROUNDS, 14],
    [STATUS_DURATION_PRESET.FIFTEEN_ROUNDS, 15],
    [STATUS_DURATION_PRESET.SIXTEEN_ROUNDS, 16],
    [STATUS_DURATION_PRESET.SEVENTEEN_ROUNDS, 17],
    [STATUS_DURATION_PRESET.EIGHTEEN_ROUNDS, 18],
    [STATUS_DURATION_PRESET.NINETEEN_ROUNDS, 19],
    [STATUS_DURATION_PRESET.TWENTY_ROUNDS, 20]
  ]);

  return mapping.get(preset) ?? null;
}

export function isRoundDurationPreset(preset: STATUS_DURATION_PRESET): boolean {
  return durationPresetToRoundCount(preset) !== null;
}

export function normalizeStatusDurationRoundTick(value: unknown): STATUS_DURATION_ROUND_TICK {
  return value === STATUS_DURATION_ROUND_TICK.ROUND_END
    ? STATUS_DURATION_ROUND_TICK.ROUND_END
    : STATUS_DURATION_ROUND_TICK.ROUND_START;
}

function createStatusEntryId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `status-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isConditionName(value: unknown): value is CONDITION_NAME {
  return typeof value === "string" && conditionValues.has(value as CONDITION_NAME);
}

function normalizeExhaustionLevel(value: unknown): ExhaustionLevel | null {
  const normalizedValue = clampInteger(
    value,
    exhaustionLevels[0],
    exhaustionLevels[exhaustionLevels.length - 1] ?? 6,
    1
  );

  return exhaustionLevels.includes(normalizedValue as ExhaustionLevel)
    ? (normalizedValue as ExhaustionLevel)
    : null;
}

function getExhaustionLevelFromConditionOption(value: string): ExhaustionLevel | null {
  if (!value.startsWith(exhaustionConditionOptionPrefix)) {
    return null;
  }

  return normalizeExhaustionLevel(value.slice(exhaustionConditionOptionPrefix.length));
}

export function isExhaustionConditionOptionValue(
  value: string
): value is ExhaustionConditionOptionValue {
  return getExhaustionLevelFromConditionOption(value) !== null;
}

export function formatConditionOptionLabel(value: string): string {
  const exhaustionLevel = getExhaustionLevelFromConditionOption(value);

  if (exhaustionLevel !== null) {
    return `Exhaustion Level ${exhaustionLevel}`;
  }

  return value;
}

export function parseConditionOptionValue(value: string): {
  value: CONDITION_NAME;
  conditionLevel?: ExhaustionLevel;
} | null {
  const exhaustionLevel = getExhaustionLevelFromConditionOption(value);

  if (exhaustionLevel !== null) {
    return {
      value: CONDITION_NAME.EXHAUSTION,
      conditionLevel: exhaustionLevel
    };
  }

  return isConditionName(value)
    ? {
        value
      }
    : null;
}

export function isExhaustionStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "value"> | null | undefined
): boolean {
  return (
    entry?.group === STATUS_ENTRY_GROUP.CONDITIONS && entry.value === CONDITION_NAME.EXHAUSTION
  );
}

function isSense(value: unknown): value is SENSE {
  return typeof value === "string" && senseValues.has(value as SENSE);
}

function isEffectName(value: unknown): value is EFFECT_NAME {
  return typeof value === "string" && effectValues.has(value as EFFECT_NAME);
}

function isDamageType(value: unknown): value is DAMAGE_TYPE {
  return typeof value === "string" && damageTypeValues.has(value as DAMAGE_TYPE);
}

function parseSpellConcentrationDurationLabel(label: string): CharacterStatusDuration | null {
  const normalizedLabel = label
    .trim()
    .toLowerCase()
    .replace(/^up to\s+/, "");

  if (!normalizedLabel) {
    return {
      kind: STATUS_DURATION_KIND.INFINITE
    };
  }

  const roundMatch = normalizedLabel.match(/^(\d+)\s+rounds?$/);

  if (roundMatch) {
    return {
      kind: STATUS_DURATION_KIND.ROUNDS,
      amount: clampInteger(roundMatch[1], 1, 999, 1),
      tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
    };
  }

  const minuteMatch = normalizedLabel.match(/^(\d+)\s+minutes?$/);

  if (minuteMatch) {
    return {
      kind: STATUS_DURATION_KIND.MINUTES,
      amount: clampInteger(minuteMatch[1], 1, 999, 1)
    };
  }

  const hourMatch = normalizedLabel.match(/^(\d+)\s+hours?$/);

  if (hourMatch) {
    return {
      kind: STATUS_DURATION_KIND.HOURS,
      amount: clampInteger(hourMatch[1], 1, 999, 1)
    };
  }

  const dayMatch = normalizedLabel.match(/^(\d+)\s+days?$/);

  if (dayMatch) {
    return {
      kind: STATUS_DURATION_KIND.DAYS,
      amount: clampInteger(dayMatch[1], 1, 999, 1)
    };
  }

  return null;
}

export function getSpellConcentrationDuration(
  durationParts: SpellDurationPart[]
): CharacterStatusDuration | null {
  if (!durationParts.includes(DURATION.CONCENTRATION)) {
    return null;
  }

  const detailText = durationParts
    .filter((part) => part !== DURATION.CONCENTRATION)
    .map((part) => String(part).trim())
    .filter((part) => part.length > 0)
    .join(", ");

  return parseSpellConcentrationDurationLabel(detailText);
}

function normalizeStatusDuration(value: unknown): CharacterStatusDuration | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<CharacterStatusDuration>;

  switch (record.kind) {
    case STATUS_DURATION_KIND.INFINITE:
      return { kind: STATUS_DURATION_KIND.INFINITE };
    case STATUS_DURATION_KIND.CONCENTRATION:
      return {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      };
    case STATUS_DURATION_KIND.LINKED: {
      const rawLinkedGroup = statusGroupValues.has(record.linkedGroup as STATUS_ENTRY_GROUP)
        ? (record.linkedGroup as STATUS_ENTRY_GROUP)
        : null;
      const linkedGroup =
        rawLinkedGroup === STATUS_ENTRY_GROUP.CONDITIONS &&
        record.linkedValue === EFFECT_NAME.CONCENTRATION
          ? STATUS_ENTRY_GROUP.EFFECTS
          : rawLinkedGroup;

      if (!linkedGroup) {
        return null;
      }

      const linkedValue = normalizeStatusValue(linkedGroup, record.linkedValue);

      if (!linkedValue) {
        return null;
      }

      return {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup,
        linkedValue
      };
    }
    case STATUS_DURATION_KIND.MINUTES:
      return Number.isFinite(record.amount)
        ? {
            kind: STATUS_DURATION_KIND.MINUTES,
            amount: clampInteger(record.amount, 1, 999, 1)
          }
        : null;
    case STATUS_DURATION_KIND.HOURS:
      return Number.isFinite(record.amount)
        ? {
            kind: STATUS_DURATION_KIND.HOURS,
            amount: clampInteger(record.amount, 1, 999, 1)
          }
        : null;
    case STATUS_DURATION_KIND.DAYS:
      return Number.isFinite(record.amount)
        ? {
            kind: STATUS_DURATION_KIND.DAYS,
            amount: clampInteger(record.amount, 1, 999, 1)
          }
        : null;
    case STATUS_DURATION_KIND.ROUNDS:
      return {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: clampInteger(record.amount, 1, 999, 1),
        tickOn: normalizeStatusDurationRoundTick(record.tickOn)
      };
    default:
      return null;
  }
}

function normalizeLegacyDuration(roundsRemaining: unknown): CharacterStatusDuration | null {
  const parsed = Number(roundsRemaining);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed === Number.POSITIVE_INFINITY || parsed === 0) {
    return {
      kind: STATUS_DURATION_KIND.INFINITE
    };
  }

  return {
    kind: STATUS_DURATION_KIND.ROUNDS,
    amount: clampInteger(parsed, 1, 999, 1),
    tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
  };
}

function normalizeStatusValue(
  group: STATUS_ENTRY_GROUP,
  value: unknown
): CharacterStatusValue | null {
  if (group === STATUS_ENTRY_GROUP.AURAS) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  }

  switch (group) {
    case STATUS_ENTRY_GROUP.EFFECTS:
      return isEffectName(value)
        ? value
        : typeof value === "string" && value.trim().length > 0
          ? value.trim()
          : null;
    case STATUS_ENTRY_GROUP.REACTIONS:
      return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
    case STATUS_ENTRY_GROUP.SENSES:
      return isSense(value) ? value : null;
    case STATUS_ENTRY_GROUP.RESISTANCES:
    case STATUS_ENTRY_GROUP.VULNERABILITIES:
      return isDamageType(value) ? value : null;
    case STATUS_ENTRY_GROUP.IMMUNITIES:
      return isDamageType(value) || isConditionName(value) ? value : null;
    case STATUS_ENTRY_GROUP.CONDITIONS:
      return isConditionName(value) ? value : null;
    default:
      return null;
  }
}

function normalizeStatusEntry(value: unknown): CharacterStatusEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<CharacterStatusEntry> & {
    roundsRemaining?: unknown;
  };
  const rawGroup = statusGroupValues.has(record.group as STATUS_ENTRY_GROUP)
    ? (record.group as STATUS_ENTRY_GROUP)
    : null;
  const group =
    rawGroup === STATUS_ENTRY_GROUP.CONDITIONS && record.value === EFFECT_NAME.CONCENTRATION
      ? STATUS_ENTRY_GROUP.EFFECTS
      : rawGroup;

  if (!group) {
    return null;
  }

  const normalizedValue = normalizeStatusValue(group, record.value);

  if (!normalizedValue) {
    return null;
  }

  const source =
    typeof record.source === "string" && record.source.trim().length > 0
      ? record.source.trim()
      : "Manual";
  const sourceType = statusSourceTypeValues.has(record.sourceType as STATUS_ENTRY_SOURCE_TYPE)
    ? (record.sourceType as STATUS_ENTRY_SOURCE_TYPE)
    : STATUS_ENTRY_SOURCE_TYPE.MANUAL;
  const duration = normalizeStatusDuration(record.duration) ??
    normalizeLegacyDuration(record.roundsRemaining) ?? {
      kind: STATUS_DURATION_KIND.INFINITE
    };

  return {
    id:
      typeof record.id === "string" && record.id.trim().length > 0
        ? record.id
        : createStatusEntryId(),
    group,
    value: normalizedValue,
    conditionLevel:
      group === STATUS_ENTRY_GROUP.CONDITIONS && normalizedValue === CONDITION_NAME.EXHAUSTION
        ? (normalizeExhaustionLevel(record.conditionLevel) ?? 1)
        : null,
    disabled: record.disabled === true,
    disabledReason:
      typeof record.disabledReason === "string" && record.disabledReason.trim().length > 0
        ? record.disabledReason.trim()
        : undefined,
    source,
    sourceType,
    duration,
    sourceId:
      typeof record.sourceId === "string" && record.sourceId.trim().length > 0
        ? record.sourceId
        : undefined,
    rangeFeet:
      typeof record.rangeFeet === "number" &&
      Number.isFinite(record.rangeFeet) &&
      record.rangeFeet > 0
        ? Math.floor(record.rangeFeet)
        : null
  };
}

function normalizeLegacyConditionEntry(value: unknown, index: number): CharacterStatusEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as {
    name?: unknown;
    roundsRemaining?: unknown;
  };

  if (!isConditionName(record.name)) {
    return null;
  }

  const duration = normalizeLegacyDuration(record.roundsRemaining);

  if (!duration) {
    return null;
  }

  return {
    id: `legacy-condition-${index}-${record.name.toLowerCase().replace(/\s+/g, "-")}`,
    group: STATUS_ENTRY_GROUP.CONDITIONS,
    value: record.name,
    source: "Manual",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration,
    rangeFeet: null
  };
}

export function createStatusDurationFromPreset(
  preset: STATUS_DURATION_PRESET,
  roundTickOn: STATUS_DURATION_ROUND_TICK = STATUS_DURATION_ROUND_TICK.ROUND_START
): CharacterStatusDuration {
  switch (preset) {
    case STATUS_DURATION_PRESET.CONCENTRATION:
      return {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      };
    case STATUS_DURATION_PRESET.ONE_MINUTE:
      return { kind: STATUS_DURATION_KIND.MINUTES, amount: 1 };
    case STATUS_DURATION_PRESET.TEN_MINUTES:
      return { kind: STATUS_DURATION_KIND.MINUTES, amount: 10 };
    case STATUS_DURATION_PRESET.ONE_HOUR:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 1 };
    case STATUS_DURATION_PRESET.TWO_HOURS:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 2 };
    case STATUS_DURATION_PRESET.EIGHT_HOURS:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 8 };
    case STATUS_DURATION_PRESET.TWELVE_HOURS:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 12 };
    case STATUS_DURATION_PRESET.TWENTY_FOUR_HOURS:
      return { kind: STATUS_DURATION_KIND.HOURS, amount: 24 };
    case STATUS_DURATION_PRESET.INFINITE:
      return { kind: STATUS_DURATION_KIND.INFINITE };
    default: {
      const roundCount = durationPresetToRoundCount(preset);

      return {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: roundCount ?? 1,
        tickOn: roundTickOn
      };
    }
  }
}

export function normalizeCharacterStatusEntries(
  value: unknown,
  legacyConditions?: unknown
): CharacterStatusEntry[] {
  const normalizedEntries = Array.isArray(value)
    ? value
        .map((entry) => normalizeStatusEntry(entry))
        .filter((entry): entry is CharacterStatusEntry => entry !== null)
    : [];

  const migratedLegacyConditions = Array.isArray(legacyConditions)
    ? legacyConditions
        .map((entry, index) => normalizeLegacyConditionEntry(entry, index))
        .filter((entry): entry is CharacterStatusEntry => entry !== null)
    : [];

  if (normalizedEntries.length > 0) {
    return normalizedEntries;
  }

  return migratedLegacyConditions;
}

export function createCharacterStatusEntry(options: {
  group: STATUS_ENTRY_GROUP;
  value: CharacterStatusValue;
  conditionLevel?: number | null;
  disabled?: boolean;
  disabledReason?: string;
  source: string;
  sourceType?: STATUS_ENTRY_SOURCE_TYPE;
  duration?: CharacterStatusDuration;
  sourceId?: string;
  rangeFeet?: number | null;
}): CharacterStatusEntry {
  return {
    id: createStatusEntryId(),
    group: options.group,
    value: options.value,
    conditionLevel:
      options.group === STATUS_ENTRY_GROUP.CONDITIONS && options.value === CONDITION_NAME.EXHAUSTION
        ? (normalizeExhaustionLevel(options.conditionLevel) ?? 1)
        : null,
    disabled: options.disabled === true,
    disabledReason:
      typeof options.disabledReason === "string" && options.disabledReason.trim().length > 0
        ? options.disabledReason.trim()
        : undefined,
    source: options.source.trim() || "Manual",
    sourceType: options.sourceType ?? STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration: options.duration ?? {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null
  };
}

export function resolveCharacterStatusEntries(
  manualEntries: unknown,
  derivedEntries: CharacterStatusEntry[] = []
): CharacterStatusEntry[] {
  const normalizedEntries = normalizeCharacterStatusEntries(manualEntries);
  const overrideEntries = normalizedEntries.filter(
    (entry) =>
      entry.sourceType !== STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
      typeof entry.sourceId === "string" &&
      entry.sourceId.length > 0
  );
  const standaloneEntries = normalizedEntries.filter(
    (entry) =>
      entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL ||
      typeof entry.sourceId !== "string" ||
      entry.sourceId.length === 0
  );
  const overrideEntriesBySourceId = new Map<string, CharacterStatusEntry>();

  overrideEntries.forEach((entry) => {
    if (entry.sourceId) {
      overrideEntriesBySourceId.set(entry.sourceId, entry);
    }
  });

  return pruneLinkedStatusEntries([
    ...standaloneEntries,
    ...derivedEntries.map((entry) => {
      const durationOverride = overrideEntriesBySourceId.get(entry.sourceId ?? entry.id);

      return durationOverride && entry.duration.kind !== STATUS_DURATION_KIND.LINKED
        ? {
            ...entry,
            duration: durationOverride.duration
          }
        : entry;
    })
  ]);
}

export function removeCharacterStatusEntry(
  value: unknown,
  entryId: string
): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).filter((entry) => entry.id !== entryId)
  );
}

export function removeCharacterConditionsForImmunities(
  value: unknown,
  immunityEntries: ReadonlyArray<Pick<CharacterStatusEntry, "group" | "value">>
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const immuneConditions = getImmuneConditionSet([...entries, ...immunityEntries]);

  if (immuneConditions.size === 0) {
    return entries;
  }

  return pruneLinkedStatusEntries(
    entries.filter(
      (entry) =>
        !(
          entry.group === STATUS_ENTRY_GROUP.CONDITIONS &&
          isConditionName(entry.value) &&
          immuneConditions.has(entry.value)
        )
    )
  );
}

export function upsertManualStatusEntry(
  value: unknown,
  nextEntry: Omit<CharacterStatusEntry, "id" | "sourceType"> & {
    sourceType?: STATUS_ENTRY_SOURCE_TYPE.MANUAL;
  }
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const existingEntry = entries.find(
    (entry) =>
      entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
      entry.group === nextEntry.group &&
      entry.value === nextEntry.value &&
      (entry.rangeFeet ?? null) === (nextEntry.rangeFeet ?? null)
  );

  if (!existingEntry) {
    return ensureLinkedStatusDependencies([
      ...entries,
      createCharacterStatusEntry({
        ...nextEntry,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL
      })
    ]);
  }

  return ensureLinkedStatusDependencies(
    entries.map((entry) =>
      entry.id === existingEntry.id
        ? {
            ...entry,
            conditionLevel:
              nextEntry.group === STATUS_ENTRY_GROUP.CONDITIONS &&
              nextEntry.value === CONDITION_NAME.EXHAUSTION
                ? (normalizeExhaustionLevel(nextEntry.conditionLevel) ?? 1)
                : null,
            source: nextEntry.source,
            duration: nextEntry.duration,
            rangeFeet: nextEntry.rangeFeet ?? null
          }
        : entry
    )
  );
}

export function updateCharacterStatusEntryDuration(
  value: unknown,
  entryToUpdate: CharacterStatusEntry,
  duration: CharacterStatusDuration
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const storedEntry = entries.find((entry) => entry.id === entryToUpdate.id);

  if (storedEntry) {
    return ensureLinkedStatusDependencies(
      entries.map((entry) =>
        entry.id === entryToUpdate.id
          ? {
              ...entry,
              duration
            }
          : entry
      )
    );
  }

  const existingDurationOverride = entries.find(
    (entry) =>
      entry.sourceId === (entryToUpdate.sourceId ?? entryToUpdate.id) &&
      entry.sourceType === entryToUpdate.sourceType &&
      entry.group === entryToUpdate.group
  );

  if (existingDurationOverride) {
    return ensureLinkedStatusDependencies(
      entries.map((entry) =>
        entry.id === existingDurationOverride.id
          ? {
              ...entry,
              duration
            }
          : entry
      )
    );
  }

  return ensureLinkedStatusDependencies([
    ...entries,
    createCharacterStatusEntry({
      group: entryToUpdate.group,
      value: entryToUpdate.value,
      conditionLevel: entryToUpdate.conditionLevel,
      source: entryToUpdate.source,
      sourceType: entryToUpdate.sourceType,
      duration,
      sourceId: entryToUpdate.sourceId ?? entryToUpdate.id,
      rangeFeet: entryToUpdate.rangeFeet ?? null
    })
  ]);
}

export function applySpellConcentrationToStatusEntries(
  value: unknown,
  spell: { name: string; duration: SpellDurationPart[] }
): CharacterStatusEntry[] {
  const concentrationDuration = getSpellConcentrationDuration(spell.duration);
  const entries = normalizeCharacterStatusEntries(value);

  if (!concentrationDuration) {
    return entries;
  }

  return ensureLinkedStatusDependencies([
    ...entries.filter(
      (entry) =>
        !(
          (entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
            entry.value === EFFECT_NAME.CONCENTRATION) ||
          isLinkedToConcentration(entry.duration)
        )
    ),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: EFFECT_NAME.CONCENTRATION,
      source: spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: concentrationDuration
    })
  ]);
}

export function hasStatusCondition(value: unknown, condition: CONDITION_NAME): boolean {
  return normalizeCharacterStatusEntries(value).some(
    (entry) => entry.group === STATUS_ENTRY_GROUP.CONDITIONS && entry.value === condition
  );
}

export function getExhaustionStatusEntry(value: unknown): CharacterStatusEntry | null {
  return (
    normalizeCharacterStatusEntries(value).find((entry) => isExhaustionStatusEntry(entry)) ?? null
  );
}

export function getExhaustionLevel(value: unknown): ExhaustionLevel | null {
  const exhaustionEntry = getExhaustionStatusEntry(value);

  if (!exhaustionEntry) {
    return null;
  }

  return normalizeExhaustionLevel(exhaustionEntry.conditionLevel) ?? 1;
}

export function setCharacterExhaustionLevel(
  value: unknown,
  nextLevel: ExhaustionLevel | null
): CharacterStatusEntry[] {
  const entries = normalizeCharacterStatusEntries(value);
  const existingEntry = entries.find((entry) => isExhaustionStatusEntry(entry));

  if (nextLevel === null) {
    return ensureLinkedStatusDependencies(
      entries.filter((entry) => !isExhaustionStatusEntry(entry))
    );
  }

  if (existingEntry) {
    return ensureLinkedStatusDependencies(
      entries.map((entry) =>
        entry.id === existingEntry.id
          ? {
              ...entry,
              conditionLevel: nextLevel,
              duration: { kind: STATUS_DURATION_KIND.INFINITE }
            }
          : entry
      )
    );
  }

  return ensureLinkedStatusDependencies([
    ...entries,
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.CONDITIONS,
      value: CONDITION_NAME.EXHAUSTION,
      conditionLevel: nextLevel,
      source: "Manual",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: { kind: STATUS_DURATION_KIND.INFINITE }
    })
  ]);
}

export function hasExhaustionAbilityCheckDisadvantage(value: unknown): boolean {
  return (getExhaustionLevel(value) ?? 0) >= 1;
}

export function hasExhaustionAttackRollDisadvantage(value: unknown): boolean {
  return (getExhaustionLevel(value) ?? 0) >= 3;
}

export function hasExhaustionSavingThrowDisadvantage(value: unknown): boolean {
  return (getExhaustionLevel(value) ?? 0) >= 3;
}

export function getExhaustionSpeedAdjustment(
  baseSpeed: number,
  value: unknown
): {
  label: string;
  value: number;
} | null {
  const exhaustionLevel = getExhaustionLevel(value);

  if (exhaustionLevel === null || baseSpeed <= 0) {
    return null;
  }

  if (exhaustionLevel >= 5) {
    return {
      label: "Exhaustion",
      value: -baseSpeed
    };
  }

  if (exhaustionLevel >= 2) {
    return {
      label: "Exhaustion",
      value: Math.floor(baseSpeed / 2) - baseSpeed
    };
  }

  return null;
}

export function getEffectiveHitPointMaximumForCharacter(
  character: Pick<Character, "className" | "hitPoints" | "statusEntries"> &
    Partial<Pick<Character, "level" | "subclassId">>
): number {
  const baseHitPoints = Math.max(1, Math.floor(character.hitPoints));
  const featureHitPointMaximumBonus = getSorcererDraconicResilienceHitPointMaximumBonus(character);
  const effectiveBaseHitPoints = Math.max(
    1,
    Math.floor(baseHitPoints + featureHitPointMaximumBonus)
  );
  const exhaustionLevel = getExhaustionLevel(character.statusEntries);

  if (exhaustionLevel !== null && exhaustionLevel >= 4) {
    return Math.max(1, Math.floor(effectiveBaseHitPoints / 2));
  }

  return effectiveBaseHitPoints;
}

export function reconcileCharacterStatusConsequences(character: Character): Character {
  const normalizedStatusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const effectiveHitPointMaximum = getEffectiveHitPointMaximumForCharacter(character);
  const exhaustionLevel = getExhaustionLevel(normalizedStatusEntries);
  const isDeadFromExhaustion = exhaustionLevel !== null && exhaustionLevel >= 6;
  const rageState = character.classFeatureState?.rage;
  const hasIncapacitated = hasStatusCondition(
    normalizedStatusEntries,
    CONDITION_NAME.INCAPACITATED
  );
  const shouldEndRageFromIncapacitated =
    character.className === "Barbarian" && rageState?.active === true && hasIncapacitated;
  const nextStatusEntries = hasIncapacitated
    ? pruneLinkedStatusEntries(
        normalizedStatusEntries.filter(
          (entry) =>
            !(
              (entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
                entry.value === EFFECT_NAME.CONCENTRATION) ||
              entry.sourceId === unbreakableMajestyStatusSourceId
            )
        )
      )
    : normalizedStatusEntries;
  const statusEntriesChanged =
    nextStatusEntries.length !== normalizedStatusEntries.length ||
    nextStatusEntries.some((entry, index) => entry.id !== normalizedStatusEntries[index]?.id);
  const nextCurrentHitPoints = isDeadFromExhaustion
    ? 0
    : Math.max(0, Math.min(effectiveHitPointMaximum, character.currentHitPoints));
  const nextDeathSaves = isDeadFromExhaustion
    ? {
        successes: 0,
        failures: 3
      }
    : character.deathSaves;
  const deathSavesUnchanged = isDeadFromExhaustion
    ? character.deathSaves?.successes === 0 && character.deathSaves?.failures === 3
    : true;

  if (
    nextCurrentHitPoints === character.currentHitPoints &&
    (!isDeadFromExhaustion || deathSavesUnchanged) &&
    !shouldEndRageFromIncapacitated &&
    !statusEntriesChanged
  ) {
    return character;
  }

  return {
    ...character,
    currentHitPoints: nextCurrentHitPoints,
    deathSaves: nextDeathSaves,
    statusEntries: nextStatusEntries,
    classFeatureState:
      shouldEndRageFromIncapacitated && rageState
        ? {
            ...character.classFeatureState,
            rage: {
              ...rageState,
              active: false,
              frenzyPending: false
            }
          }
        : character.classFeatureState
  };
}

export function advanceCharacterStatusEntries(
  value: unknown,
  tickOn: STATUS_DURATION_ROUND_TICK = STATUS_DURATION_ROUND_TICK.ROUND_START
): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).flatMap((entry) => {
      if (entry.duration.kind !== STATUS_DURATION_KIND.ROUNDS) {
        return [entry];
      }

      if (normalizeStatusDurationRoundTick(entry.duration.tickOn) !== tickOn) {
        return [entry];
      }

      const nextAmount = entry.duration.amount - 1;

      if (nextAmount <= 0) {
        return [];
      }

      return [
        {
          ...entry,
          duration: {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: nextAmount,
            tickOn: normalizeStatusDurationRoundTick(entry.duration.tickOn)
          }
        }
      ];
    })
  );
}

export function applyShortRestToCharacterStatusEntries(value: unknown): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).filter((entry) => {
      switch (entry.duration.kind) {
        case STATUS_DURATION_KIND.INFINITE:
          return (
            entry.group !== STATUS_ENTRY_GROUP.EFFECTS || entry.value !== EFFECT_NAME.CONCENTRATION
          );
        case STATUS_DURATION_KIND.HOURS:
        case STATUS_DURATION_KIND.DAYS:
          return entry.duration.amount >= 1;
        case STATUS_DURATION_KIND.MINUTES:
        case STATUS_DURATION_KIND.ROUNDS:
        case STATUS_DURATION_KIND.CONCENTRATION:
          return false;
        case STATUS_DURATION_KIND.LINKED:
          return true;
        default:
          return true;
      }
    })
  );
}

export function applyLongRestToCharacterStatusEntries(value: unknown): CharacterStatusEntry[] {
  return pruneLinkedStatusEntries(
    normalizeCharacterStatusEntries(value).filter(
      (entry) =>
        (entry.duration.kind === STATUS_DURATION_KIND.INFINITE ||
          entry.duration.kind === STATUS_DURATION_KIND.LINKED ||
          entry.duration.kind === STATUS_DURATION_KIND.DAYS) &&
        (entry.group !== STATUS_ENTRY_GROUP.EFFECTS || entry.value !== EFFECT_NAME.CONCENTRATION)
    )
  );
}

export function getStatusEntryTitle(entry: CharacterStatusEntry): string {
  if (isExhaustionStatusEntry(entry)) {
    const exhaustionLevel = normalizeExhaustionLevel(entry.conditionLevel) ?? 1;

    return `Exhaustion ${exhaustionLevel}`;
  }

  return typeof entry.value === "string" ? entry.value : formatCodexLabel(String(entry.value));
}

export function getStatusEntryKeyword(entry: CharacterStatusEntry): string {
  if (isExhaustionStatusEntry(entry)) {
    return CONDITION_NAME.EXHAUSTION;
  }

  if (typeof entry.value === "string") {
    return entry.value;
  }

  return formatCodexLabel(String(entry.value));
}

export function getStatusEntryDescriptionEntries(
  entry: CharacterStatusEntry
): SpellDescriptionEntry[] {
  if (isExhaustionStatusEntry(entry)) {
    const exhaustionLevel = normalizeExhaustionLevel(entry.conditionLevel) ?? 1;

    return [
      `<strong>Current Level.</strong> Level ${exhaustionLevel}. Higher Exhaustion levels include all lower-level effects.`,
      ...exhaustionDescriptionEntries.slice(1)
    ];
  }

  if (entry.sourceId === "feature-paladin-aura-of-protection") {
    return (
      paladinFeatureMap[CLASS_FEATURE.AURA_OF_PROTECTION]?.description ?? [
        "An aura passively affects creatures or spaces around you."
      ]
    );
  }

  if (entry.sourceId === paladinAuraOfAlacrityProtectionStatusSourceId) {
    return [
      ...(paladinFeatureMap[CLASS_FEATURE.AURA_OF_PROTECTION]?.description ?? [
        "An aura passively affects creatures or spaces around you."
      ]),
      ...paladinAuraOfAlacrityDescription
    ];
  }

  if (entry.sourceId === "feature-paladin-aura-of-courage") {
    return (
      paladinFeatureMap[CLASS_FEATURE.AURA_OF_COURAGE]?.description ?? [
        "An aura passively affects creatures or spaces around you."
      ]
    );
  }

  if (
    entry.sourceId === paladinAuraOfDevotionStatusSourceId ||
    entry.sourceId === paladinAuraOfDevotionImmunitySourceId
  ) {
    return paladinAuraOfDevotionDescription.length > 0
      ? paladinAuraOfDevotionDescription
      : ["An aura passively affects creatures or spaces around you."];
  }

  if (entry.sourceId === paladinAuraOfWardingStatusSourceId) {
    return paladinAuraOfWardingDescription.length > 0
      ? paladinAuraOfWardingDescription
      : ["An aura passively affects creatures or spaces around you."];
  }

  if (entry.sourceId === paladinAuraOfElementalShieldingStatusSourceId) {
    return paladinAuraOfElementalShieldingDescription.length > 0
      ? paladinAuraOfElementalShieldingDescription
      : ["An aura passively affects creatures or spaces around you."];
  }

  if (entry.sourceId === paladinElderChampionStatusSourceId) {
    return paladinElderChampionDescription.length > 0
      ? paladinElderChampionDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === paladinDiminishDefianceStatusSourceId) {
    return paladinDiminishDefianceDescription;
  }

  if (entry.sourceId === paladinHolyNimbusStatusSourceId) {
    return paladinHolyNimbusDescription.length > 0
      ? paladinHolyNimbusDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === paladinPeerlessAthleteStatusSourceId) {
    return paladinPeerlessAthleteDescription.length > 0
      ? paladinPeerlessAthleteDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === paladinLivingLegendStatusSourceId) {
    return paladinLivingLegendDescription.length > 0
      ? paladinLivingLegendDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === paladinNobleScionStatusSourceId) {
    return paladinNobleScionDescription.length > 0
      ? paladinNobleScionDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === paladinMinorWishStatusSourceId) {
    return paladinMinorWishDescription;
  }

  if (entry.sourceId === paladinAvengingAngelStatusSourceId) {
    return paladinAvengingAngelDescription.length > 0
      ? paladinAvengingAngelDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === paladinFrightfulAuraStatusSourceId) {
    return paladinFrightfulAuraDescription;
  }

  if (
    entry.sourceId === rangerGloomStalkerUmbralSightSenseSourceId ||
    entry.sourceId === rangerGloomStalkerUmbralSightStatusSourceId
  ) {
    return rangerUmbralSightDescription.length > 0
      ? rangerUmbralSightDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === rangerHunterEscapeTheHordeStatusSourceId) {
    return rangerEscapeTheHordeDescription.length > 0
      ? rangerEscapeTheHordeDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === rangerHunterMultiattackDefenseStatusSourceId) {
    return rangerMultiattackDefenseDescription.length > 0
      ? rangerMultiattackDefenseDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === rangerHunterSuperiorHuntersDefenseStatusSourceId) {
    return rangerSuperiorHuntersDefenseDescription.length > 0
      ? rangerSuperiorHuntersDefenseDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === rangerWinterWalkerBitingColdStatusSourceId) {
    return rangerBitingColdDescription.length > 0
      ? rangerBitingColdDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === rogueArcaneTricksterMagicalAmbushStatusSourceId) {
    return rogueArcaneTricksterMagicalAmbushDescription.length > 0
      ? rogueArcaneTricksterMagicalAmbushDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (isRogueArcaneTricksterSpellThiefStatusSourceId(entry.sourceId)) {
    return rogueArcaneTricksterSpellThiefDescription.length > 0
      ? rogueArcaneTricksterSpellThiefDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (
    entry.sourceId === rangerWinterWalkerFrozenHauntStatusSourceId &&
    entry.group === STATUS_ENTRY_GROUP.EFFECTS
  ) {
    return rangerFrozenHauntDescription.length > 0
      ? rangerFrozenHauntDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === "feature-rogue-evasion") {
    return (
      rogueFeatureMap[CLASS_FEATURE.EVASION]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-rogue-elusive") {
    return (
      rogueFeatureMap[CLASS_FEATURE.ELUSIVE]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-barbarian-reckless-attack") {
    return (
      barbarianFeatureMap[CLASS_FEATURE.RECKLESS_ATTACK]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-barbarian-instinctive-pounce") {
    return (
      barbarianFeatureMap[CLASS_FEATURE.INSTINCTIVE_POUNCE]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-barbarian-fanatical-focus") {
    return (
      barbarianFeatureMap[CLASS_FEATURE.FANATICAL_FOCUS]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-barbarian-rage-of-the-gods") {
    return [
      "When you activate your Rage, you can assume the form of a divine warrior.",
      "This form lasts for 1 minute or until you drop to 0 Hit Points.",
      "<strong>Flight.</strong> You have a Fly Speed equal to your Speed and can hover.",
      "<strong>Resistance.</strong> You have Resistance to Necrotic, Psychic, and Radiant damage.",
      "<strong>Revivification.</strong> When a creature within 30 feet of you would drop to 0 Hit Points, you can take a Reaction to expend a use of your Rage to instead change the target's Hit Points to a number equal to your Barbarian level."
    ];
  }

  if (entry.sourceId === "feature-sorcerer-innate-sorcery") {
    return (
      sorcererFeatureMap[CLASS_FEATURE.INNATE_SORCERY]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === sorcererTelepathicSpeechStatusSourceId) {
    return sorcererTelepathicSpeechDescription.length > 0
      ? sorcererTelepathicSpeechDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererPsychicDefensesStatusSourceId) {
    return sorcererPsychicDefensesDescription.length > 0
      ? sorcererPsychicDefensesDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererClockworkBastionOfLawStatusSourceId) {
    return sorcererBastionOfLawDescription.length > 0
      ? [`<strong>Current Ward.</strong> ${getStatusEntryTitle(entry)}.`, ...sorcererBastionOfLawDescription]
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererClockworkTranceOfOrderStatusSourceId) {
    return sorcererTranceOfOrderDescription.length > 0
      ? sorcererTranceOfOrderDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererSpellfireCrownOfSpellfireStatusSourceId) {
    return sorcererCrownOfSpellfireDescription.length > 0
      ? sorcererCrownOfSpellfireDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererRevelationInFleshAquaticAdaptationStatusSourceId) {
    return sorcererRevelationInFleshAquaticAdaptationDescription.length > 0
      ? sorcererRevelationInFleshAquaticAdaptationDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererRevelationInFleshGlisteningFlightStatusSourceId) {
    return sorcererRevelationInFleshGlisteningFlightDescription.length > 0
      ? sorcererRevelationInFleshGlisteningFlightDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererRevelationInFleshSeeTheInvisibleStatusSourceId) {
    return sorcererRevelationInFleshSeeTheInvisibleDescription.length > 0
      ? sorcererRevelationInFleshSeeTheInvisibleDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererRevelationInFleshWormlikeMovementStatusSourceId) {
    return sorcererRevelationInFleshWormlikeMovementDescription.length > 0
      ? sorcererRevelationInFleshWormlikeMovementDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === fighterBanneretTeamTacticsStatusSourceId) {
    return [...banneretTeamTacticsDescription];
  }

  if (entry.sourceId === fighterPsiWarriorBulwarkOfForceStatusSourceId) {
    return [...psiWarriorBulwarkOfForceDescription];
  }

  if (entry.sourceId === fighterPsiWarriorPsiPoweredLeapStatusSourceId) {
    return [...psiWarriorPsiPoweredLeapDescription];
  }

  if (entry.sourceId === fighterPsiWarriorTelekineticMasterStatusSourceId) {
    return [...psiWarriorTelekineticMasterDescription];
  }

  if (entry.sourceId === unbreakableMajestyStatusSourceId) {
    return [
      "As a Bonus Action, you can assume a magically majestic presence for 10 turns or until you have the Incapacitated condition.",
      "For the duration, whenever any creature hits you with an attack roll for the first time on a turn, the attacker must succeed on a Charisma saving throw against your spell save DC, or the attack misses instead, as the creature recoils from your majesty."
    ];
  }

  if (entry.sourceId === divineForeknowledgeStatusSourceId) {
    return [...divineForeknowledgeDescription];
  }

  if (entry.sourceId === druidNaturesSanctuaryStatusSourceId) {
    return [...naturesSanctuaryDescription];
  }

  if (entry.sourceId === druidStarryFormStatusSourceId) {
    return [...starryFormDescription];
  }

  if (entry.sourceId === druidWrathOfTheSeaStatusSourceId) {
    return getStatusEntryTitle(entry).includes("(10 FT.)")
      ? [...aquaticAffinityWrathOfTheSeaDescription]
      : [...wrathOfTheSeaDescription];
  }

  if (entry.sourceId === monkCloakOfShadowStatusSourceId) {
    return [...monkCloakOfShadowsDescription];
  }

  if (entry.sourceId === monkQuiveringPalmStatusSourceId) {
    return [...monkQuiveringPalmTraitDescription];
  }

  if (entry.sourceId === monkElementalAttunementStatusSourceId) {
    return [...monkElementalAttunementTraitDescription];
  }

  if (entry.sourceId === monkElementalAttunementStrideStatusSourceId) {
    return [...monkElementalAttunementTraitDescription, ...monkStrideOfTheElementsDescription];
  }

  if (entry.sourceId === monkElementalAttunementEpitomeStatusSourceId) {
    return [
      ...monkElementalAttunementTraitDescription,
      ...monkStrideOfTheElementsDescription,
      ...monkElementalEpitomeDescription
    ];
  }

  const keywordDescriptionEntries = getKeywordDescriptionLines(getStatusEntryKeyword(entry));

  if (
    entry.group === STATUS_ENTRY_GROUP.SENSES ||
    entry.group === STATUS_ENTRY_GROUP.CONDITIONS ||
    entry.group === STATUS_ENTRY_GROUP.EFFECTS
  ) {
    return (
      keywordDescriptionEntries ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  const valueLabel = getStatusEntryTitle(entry);

  switch (entry.group) {
    case STATUS_ENTRY_GROUP.REACTIONS:
      return [
        `A spell, cantrip, or feature you can use as a Reaction. Using ${valueLabel} spends your Reaction for the round.`
      ];
    case STATUS_ENTRY_GROUP.RESISTANCES:
      return [
        `Resistance to ${valueLabel.toLowerCase()} damage. You usually take half damage from that type unless a rule says otherwise.`
      ];
    case STATUS_ENTRY_GROUP.VULNERABILITIES:
      return [
        `Vulnerability to ${valueLabel.toLowerCase()} damage. You usually take double damage from that type unless a rule says otherwise.`
      ];
    case STATUS_ENTRY_GROUP.IMMUNITIES:
      return [
        isConditionName(entry.value)
          ? `Immunity to the ${valueLabel} condition. Effects that would apply it have no effect on you unless a rule says otherwise.`
          : `Immunity to ${valueLabel.toLowerCase()} damage. You usually take no damage from that type unless a rule says otherwise.`
      ];
    case STATUS_ENTRY_GROUP.AURAS:
      return (
        keywordDescriptionEntries ?? ["An aura passively affects creatures or spaces around you."]
      );
    default:
      return (
        keywordDescriptionEntries ?? [
          "A current effect or trait that may change how your character plays."
        ]
      );
  }
}

export function getStatusEntryDescription(entry: CharacterStatusEntry): string {
  return getStatusEntryDescriptionEntries(entry)
    .map((descriptionEntry) =>
      typeof descriptionEntry === "string" ? descriptionEntry : descriptionEntry.items.join(" ")
    )
    .join(" ");
}

export function getStatusEntrySourceLabel(entry: CharacterStatusEntry): string {
  const sourceLabel = entry.rangeFeet ? `${entry.source} (${entry.rangeFeet} ft.)` : entry.source;

  if (entry.disabled && entry.disabledReason) {
    return `${sourceLabel} - ${entry.disabledReason}`;
  }

  if (entry.rangeFeet) {
    return `${entry.source} (${entry.rangeFeet} ft.)`;
  }

  return sourceLabel;
}

export function getStatusDurationLabel(duration: CharacterStatusDuration): string {
  switch (duration.kind) {
    case STATUS_DURATION_KIND.INFINITE:
      return "Infinite";
    case STATUS_DURATION_KIND.CONCENTRATION:
      return "Concentration";
    case STATUS_DURATION_KIND.LINKED:
      return formatLinkedStatusDurationLabel(duration);
    case STATUS_DURATION_KIND.MINUTES:
      return `${duration.amount} minute${duration.amount === 1 ? "" : "s"}`;
    case STATUS_DURATION_KIND.HOURS:
      return `${duration.amount} hour${duration.amount === 1 ? "" : "s"}`;
    case STATUS_DURATION_KIND.DAYS:
      return `${duration.amount} day${duration.amount === 1 ? "" : "s"}`;
    case STATUS_DURATION_KIND.ROUNDS:
      return `${duration.amount} round${duration.amount === 1 ? "" : "s"} (${getStatusDurationTickOnLabel(duration)})`;
    default:
      return "Infinite";
  }
}

export function getStatusDurationPreset(duration: CharacterStatusDuration): STATUS_DURATION_PRESET {
  switch (duration.kind) {
    case STATUS_DURATION_KIND.CONCENTRATION:
      return STATUS_DURATION_PRESET.CONCENTRATION;
    case STATUS_DURATION_KIND.LINKED:
      return duration.linkedGroup === STATUS_ENTRY_GROUP.EFFECTS &&
        duration.linkedValue === EFFECT_NAME.CONCENTRATION
        ? STATUS_DURATION_PRESET.CONCENTRATION
        : STATUS_DURATION_PRESET.INFINITE;
    case STATUS_DURATION_KIND.MINUTES:
      switch (duration.amount) {
        case 1:
          return STATUS_DURATION_PRESET.ONE_MINUTE;
        case 10:
          return STATUS_DURATION_PRESET.TEN_MINUTES;
        default:
          return STATUS_DURATION_PRESET.INFINITE;
      }
    case STATUS_DURATION_KIND.HOURS:
      switch (duration.amount) {
        case 1:
          return STATUS_DURATION_PRESET.ONE_HOUR;
        case 2:
          return STATUS_DURATION_PRESET.TWO_HOURS;
        case 8:
          return STATUS_DURATION_PRESET.EIGHT_HOURS;
        case 12:
          return STATUS_DURATION_PRESET.TWELVE_HOURS;
        case 24:
          return STATUS_DURATION_PRESET.TWENTY_FOUR_HOURS;
        default:
          return STATUS_DURATION_PRESET.INFINITE;
      }
    case STATUS_DURATION_KIND.DAYS:
      return STATUS_DURATION_PRESET.INFINITE;
    case STATUS_DURATION_KIND.ROUNDS:
      return roundCountToDurationPreset(duration.amount);
    case STATUS_DURATION_KIND.INFINITE:
    default:
      return STATUS_DURATION_PRESET.INFINITE;
  }
}

export function getStatusDurationShortLabel(duration: CharacterStatusDuration): string | null {
  switch (duration.kind) {
    case STATUS_DURATION_KIND.INFINITE:
      return null;
    case STATUS_DURATION_KIND.CONCENTRATION:
      return "Conc.";
    case STATUS_DURATION_KIND.LINKED:
      return formatLinkedStatusDurationLabel(duration);
    case STATUS_DURATION_KIND.MINUTES:
      return `${duration.amount}m`;
    case STATUS_DURATION_KIND.HOURS:
      return `${duration.amount}h`;
    case STATUS_DURATION_KIND.DAYS:
      return `${duration.amount}d`;
    case STATUS_DURATION_KIND.ROUNDS:
      return String(duration.amount);
    default:
      return null;
  }
}

export function getStatusDurationTickOn(
  duration: CharacterStatusDuration
): STATUS_DURATION_ROUND_TICK | null {
  if (duration.kind !== STATUS_DURATION_KIND.ROUNDS) {
    return null;
  }

  return normalizeStatusDurationRoundTick(duration.tickOn);
}

export function getStatusDurationTickOnLabel(duration: CharacterStatusDuration): string | null {
  const tickOn = getStatusDurationTickOn(duration);

  if (!tickOn) {
    return null;
  }

  return tickOn === STATUS_DURATION_ROUND_TICK.ROUND_END ? "Round End" : "Round Start";
}

export function getStatusEntrySortRank(group: STATUS_ENTRY_GROUP): number {
  return statusGroupOrder.indexOf(group);
}

export function getSenseOptions(): SENSE[] {
  return [...Object.values(SENSE)];
}

export function getConditionOptions(): ConditionOptionValue[] {
  return [
    ...Object.values(CONDITION_NAME).filter((condition) => condition !== CONDITION_NAME.EXHAUSTION),
    ...exhaustionConditionOptionValues
  ];
}

export function getDamageTypeOptions(): DAMAGE_TYPE[] {
  return [...Object.values(DAMAGE_TYPE)];
}

export function getImmunityOptions(): ImmunityValue[] {
  return [...Object.values(DAMAGE_TYPE), ...Object.values(CONDITION_NAME)];
}

function formatLinkedStatusDurationLabel(
  duration: Extract<CharacterStatusDuration, { kind: STATUS_DURATION_KIND.LINKED }>
): string {
  return typeof duration.linkedValue === "string"
    ? duration.linkedValue
    : formatCodexLabel(String(duration.linkedValue));
}

function isLinkedToConcentration(duration: CharacterStatusDuration): boolean {
  return (
    duration.kind === STATUS_DURATION_KIND.LINKED &&
    duration.linkedGroup === STATUS_ENTRY_GROUP.EFFECTS &&
    duration.linkedValue === EFFECT_NAME.CONCENTRATION
  );
}

function isLinkedStatusEntrySatisfied(
  entry: CharacterStatusEntry,
  entries: CharacterStatusEntry[]
): boolean {
  if (!entry.duration || entry.duration.kind !== STATUS_DURATION_KIND.LINKED) {
    return true;
  }

  const linkedDuration = entry.duration;

  return entries.some(
    (candidate) =>
      candidate.id !== entry.id &&
      candidate.group === linkedDuration.linkedGroup &&
      candidate.value === linkedDuration.linkedValue
  );
}

function getImmuneConditionSet(
  entries: ReadonlyArray<Pick<CharacterStatusEntry, "group" | "value">>
): Set<CONDITION_NAME> {
  return entries.reduce<Set<CONDITION_NAME>>((immuneConditions, entry) => {
    if (entry.group === STATUS_ENTRY_GROUP.IMMUNITIES && isConditionName(entry.value)) {
      immuneConditions.add(entry.value);
    }

    return immuneConditions;
  }, new Set<CONDITION_NAME>());
}

function removeConditionEntriesBlockedByImmunities(
  entries: CharacterStatusEntry[]
): CharacterStatusEntry[] {
  const immuneConditions = getImmuneConditionSet(entries);

  if (immuneConditions.size === 0) {
    return entries;
  }

  return entries.filter(
    (entry) =>
      !(
        entry.group === STATUS_ENTRY_GROUP.CONDITIONS &&
        isConditionName(entry.value) &&
        immuneConditions.has(entry.value)
      )
  );
}

function pruneLinkedStatusEntries(entries: CharacterStatusEntry[]): CharacterStatusEntry[] {
  let currentEntries = entries;

  while (true) {
    const nextEntries = removeConditionEntriesBlockedByImmunities(
      currentEntries.filter((entry) => isLinkedStatusEntrySatisfied(entry, currentEntries))
    );

    if (nextEntries.length === currentEntries.length) {
      return nextEntries;
    }

    currentEntries = nextEntries;
  }
}

function ensureLinkedStatusDependencies(entries: CharacterStatusEntry[]): CharacterStatusEntry[] {
  let nextEntries = [...entries];
  const hasConcentrationLinkedEntry = nextEntries.some((entry) =>
    isLinkedToConcentration(entry.duration)
  );
  const hasConcentrationAnchor = nextEntries.some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS && entry.value === EFFECT_NAME.CONCENTRATION
  );

  if (hasConcentrationLinkedEntry && !hasConcentrationAnchor) {
    const concentrationSourceEntry = nextEntries.find((entry) =>
      isLinkedToConcentration(entry.duration)
    );

    nextEntries = [
      ...nextEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: EFFECT_NAME.CONCENTRATION,
        source: concentrationSourceEntry?.source ?? "Manual",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: { kind: STATUS_DURATION_KIND.INFINITE }
      })
    ];
  }

  return pruneLinkedStatusEntries(nextEntries);
}
