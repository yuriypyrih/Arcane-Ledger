import {
  barbarianFeatureMap,
  monkFeatureMap,
  paladinFeatureMap,
  rogueFeatureMap,
  sorcererFeatureMap
} from "../../codex/classes";
import { getSpellEntryById, getSpellEntryByName } from "../../codex/entries";
import {
  blessingOfTheTricksterDescription,
  coronaOfLightDescription,
  divineForeknowledgeDescription,
  invokeDuplicityDescription
} from "../../codex/subclasses/cleric";
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
import {
  mantleOfMajestyDescription,
  unbreakableMajestyDescription
} from "../../codex/subclasses/bard";
import { getSubclassEntryById } from "../../codex/subclasses";
import type { SpellDescriptionEntry } from "../../codex/entries";
import { CLASS_FEATURE, DAMAGE_TYPE } from "../../codex/entries";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  type Character,
  type CharacterStatusDuration,
  type CharacterStatusEntry,
  type ImmunityValue
} from "../../types";
import { formatCodexLabel } from "../../utils/codex";
import { fighterBanneretTeamTacticsStatusSourceId } from "./classFeatures/fighter/subclasses/fighterBanneretShared";
import { coronaOfLightStatusSourceId } from "./classFeatures/cleric/subclasses/clericLightDomainShared";
import {
  blessingOfTheTricksterStatusSourceId,
  invokeDuplicityStatusSourceId
} from "./classFeatures/cleric/subclasses/clericTrickeryDomainShared";
import { getClericInvokeDuplicityDescriptionAdditions } from "./classFeatures/cleric/subclasses/clericTrickeryDomain";
import {
  fighterPsiWarriorBulwarkOfForceStatusSourceId,
  fighterPsiWarriorPsiPoweredLeapStatusSourceId,
  fighterPsiWarriorTelekineticMasterConcentrationStatusSourceId,
  fighterPsiWarriorTelekineticMasterEffectName,
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
import { getRangerHuntersMarkConcentrationDescriptionAdditions } from "./classFeatures/ranger/ranger";
import { paladinOathOfDevotionSacredWeaponStatusSourceId } from "./classFeatures/paladin/subclasses/paladinOathOfDevotion";
import { paladinOathOfVengeanceVowOfEnmityStatusSourceId } from "./classFeatures/paladin/subclasses/paladinOathOfVengeance";
import {
  dragonWingsDescription,
  getSorcererDraconicResilienceHitPointMaximumBonus,
  sorcererDragonWingsStatusSourceId
} from "./classFeatures/sorcerer/subclasses/sorcererDraconicSorcery";
import {
  isRogueArcaneTricksterSpellThiefStatusSourceId,
  rogueArcaneTricksterMagicalAmbushStatusSourceId
} from "./classFeatures/rogue/subclasses/rogueArcaneTrickster";
import { wizardAbjurerSpellResistanceStatusSourceId } from "./classFeatures/wizard/subclasses/wizardAbjurer";
import {
  wizardBladesingerBladesongDescription,
  wizardBladesongStatusSourceId
} from "./classFeatures/wizard/subclasses/wizardBladesinger";
import {
  wizardIllusionistIllusoryRealityDescription,
  wizardIllusionistIllusoryRealityStatusSourceId
} from "./classFeatures/wizard/subclasses/wizardIllusionist";
import {
  wizardDivinerThirdEyeDarkvisionDescription,
  wizardDivinerThirdEyeDarkvisionStatusSourceId,
  wizardDivinerThirdEyeGreaterComprehensionDescription,
  wizardDivinerThirdEyeGreaterComprehensionStatusSourceId,
  wizardDivinerThirdEyeSeeInvisibilityDescription,
  wizardDivinerThirdEyeSeeInvisibilityStatusSourceId
} from "./classFeatures/wizard/subclasses/wizardDivinerThirdEyeConfig";
import { thoughtShieldStatusSourceId } from "./classFeatures/warlock/subclasses/warlockGreatOldOnePatron";
import { getBarbarianRageDescriptionContent } from "./classFeatures/barbarian/barbarianDescriptionSections";
import {
  createFeatureSourcedDescriptionEntries,
  createSourcedDescriptionEntries
} from "./actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "./classFeatures/featureDescriptions";
import { getBarbarianPathOfTheWildHeartStatusDescriptionEntries } from "./classFeatures/barbarian/subclasses/barbarianPathOfTheWildHeart";
import { getFeatHitPointMaximumBonusForCharacter } from "./feats/runtime";
import { getKeywordDescriptionLines } from "./keywordDescriptions";
import { getDwarvenToughnessHitPointMaximumBonus } from "./speciesDwarf";
import { removeConjuredInventoryItems } from "./inventoryItems";
import {
  getExhaustionLevel as getStoredExhaustionLevel,
  hasStatusCondition,
  isExhaustionStatusEntry,
  normalizeCharacterStatusEntries,
  normalizeExhaustionLevel,
  normalizeStatusDurationRoundTick,
  pruneLinkedStatusEntries,
  setCharacterExhaustionLevel as setStoredCharacterExhaustionLevel
} from "./statusEntries";

const conditionValues = new Set<CONDITION_NAME>(Object.values(CONDITION_NAME));
const damageTypeValues = new Set<DAMAGE_TYPE>(Object.values(DAMAGE_TYPE));
const exhaustionConditionOptionPrefix = "EXHAUSTION_LEVEL_";
const inspiredEclipseStatusSourceId = "feature-bard-inspired-eclipse";
const mantleOfMajestyStatusSourceId = "feature-bard-mantle-of-majesty";
const unbreakableMajestyStatusSourceId = "feature-bard-unbreakable-majesty";
const divineForeknowledgeStatusSourceId = "feature-cleric-divine-foreknowledge";
const druidNaturesSanctuaryStatusSourceId = "feature-druid-natures-sanctuary";
const druidStarryFormStatusSourceId = "feature-druid-starry-form";
const druidWrathOfTheSeaStatusSourceId = "feature-druid-wrath-of-the-sea";
const monkCloakOfShadowStatusSourceId = "feature-monk-warrior-of-shadow-cloak-of-shadow";
const monkSelfRestorationStatusSourceId = "feature-monk-self-restoration";
const monkSuperiorDefenseStatusSourceId = "feature-monk-superior-defense";
const monkQuiveringPalmStatusSourceId = "feature-monk-warrior-of-the-open-hand-quivering-palm";
const monkElementalAttunementStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement";
const monkElementalAttunementStrideStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement-stride";
const monkElementalAttunementEpitomeStatusSourceId =
  "feature-monk-warrior-of-the-elements-elemental-attunement-epitome";
const monkWarriorOfTheElementsSubclassId = "monk-warrior-of-the-elements";
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
const warlockAwakenedMindStatusSourceId = "feature-warlock-great-old-one-patron-awakened-mind";
const sorcererPsychicDefensesStatusSourceId = "feature-sorcerer-aberrant-sorcery-psychic-defenses";
const sorcererPsychicDefensesTraitStatusSourceId =
  "feature-sorcerer-aberrant-sorcery-psychic-defenses-trait";
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
const monkWarriorOfTheElementsSubclassEntry = getSubclassEntryById("monk-warrior-of-the-elements");
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
const warlockGreatOldOnePatronSubclassEntry = getSubclassEntryById("warlock-great-old-one-patron");
const wizardAbjurerSubclassEntry = getSubclassEntryById("wizard-abjurer");

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
    ?.featureOverrides?.[
      CLASS_FEATURE.CLOAK_OF_SHADOWS
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const monkElementalAttunementTraitDescription =
  monkWarriorOfTheElementsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.ELEMENTAL_ATTUNEMENT))
    ?.featureOverrides?.[
      CLASS_FEATURE.ELEMENTAL_ATTUNEMENT
    ]?.description?.filter((entry): entry is string => typeof entry === "string" && (entry.startsWith("<strong>Reach.</strong>") || entry.startsWith("<strong>Elemental Strikes.</strong>"))) ??
  [];
const monkStrideOfTheElementsDescription =
  monkWarriorOfTheElementsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.STRIDE_OF_THE_ELEMENTS))
    ?.featureOverrides?.[
      CLASS_FEATURE.STRIDE_OF_THE_ELEMENTS
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const monkElementalEpitomeDescription =
  monkWarriorOfTheElementsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.ELEMENTAL_EPITOME))
    ?.featureOverrides?.[
      CLASS_FEATURE.ELEMENTAL_EPITOME
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];

function getMonkElementalAttunementDescriptionContent(
  entry: CharacterStatusEntry,
  character?: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): {
  description: SpellDescriptionEntry[];
  descriptionAdditions: SpellDescriptionEntry[][];
} {
  const useCurrentSubclassLevel =
    character?.className === "Monk" && character.subclassId === monkWarriorOfTheElementsSubclassId;
  const hasStrideOfTheElements = useCurrentSubclassLevel
    ? (character.level ?? 0) >= 11
    : entry.sourceId === monkElementalAttunementStrideStatusSourceId ||
      entry.sourceId === monkElementalAttunementEpitomeStatusSourceId;
  const hasElementalEpitome = useCurrentSubclassLevel
    ? (character.level ?? 0) >= 17
    : entry.sourceId === monkElementalAttunementEpitomeStatusSourceId;

  return {
    description: [...monkElementalAttunementTraitDescription],
    descriptionAdditions: [
      ...(hasStrideOfTheElements && monkStrideOfTheElementsDescription.length > 0
        ? [
            character
              ? createFeatureSourcedDescriptionEntries(
                  character,
                  CLASS_FEATURE.STRIDE_OF_THE_ELEMENTS,
                  monkStrideOfTheElementsDescription,
                  "Stride of the Elements"
                )
              : createSourcedDescriptionEntries(
                  "Stride of the Elements",
                  monkStrideOfTheElementsDescription
                )
          ]
        : []),
      ...(hasElementalEpitome && monkElementalEpitomeDescription.length > 0
        ? [
            character
              ? createFeatureSourcedDescriptionEntries(
                  character,
                  CLASS_FEATURE.ELEMENTAL_EPITOME,
                  monkElementalEpitomeDescription,
                  "Elemental Epitome"
                )
              : createSourcedDescriptionEntries(
                  "Elemental Epitome",
                  monkElementalEpitomeDescription
                )
          ]
        : [])
    ]
  };
}
const paladinAuraOfDevotionDescription =
  paladinOathOfDevotionSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AURA_OF_DEVOTION))
    ?.featureOverrides?.[
      CLASS_FEATURE.AURA_OF_DEVOTION
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinAuraOfWardingDescription =
  paladinOathOfTheAncientsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AURA_OF_WARDING))
    ?.featureOverrides?.[
      CLASS_FEATURE.AURA_OF_WARDING
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinAuraOfElementalShieldingDescription =
  paladinOathOfTheNobleGeniesSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AURA_OF_ELEMENTAL_SHIELDING))
    ?.featureOverrides?.[
      CLASS_FEATURE.AURA_OF_ELEMENTAL_SHIELDING
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinElderChampionDescription =
  paladinOathOfTheAncientsSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.ELDER_CHAMPION))
    ?.featureOverrides?.[
      CLASS_FEATURE.ELDER_CHAMPION
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinDiminishDefianceDescription = [
  "Enemies in the aura have Disadvantage on saving throws against your spells and Channel Divinity options."
];
const paladinHolyNimbusDescription =
  paladinOathOfDevotionSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.HOLY_NIMBUS))
    ?.featureOverrides?.[
      CLASS_FEATURE.HOLY_NIMBUS
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinPeerlessAthleteDescription =
  paladinOathOfGlorySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.PEERLESS_ATHLETE))
    ?.featureOverrides?.[
      CLASS_FEATURE.PEERLESS_ATHLETE
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinLivingLegendDescription =
  paladinOathOfGlorySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.LIVING_LEGEND))
    ?.featureOverrides?.[
      CLASS_FEATURE.LIVING_LEGEND
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinNobleScionDescription =
  paladinOathOfTheNobleGeniesSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.NOBLE_SCION))
    ?.featureOverrides?.[
      CLASS_FEATURE.NOBLE_SCION
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinMinorWishDescription = [
  "When you or an ally in your Aura of Protection fails a D20 Test, you can take a Reaction to make the D20 Test succeed instead."
];
const paladinAvengingAngelDescription =
  paladinOathOfVengeanceSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AVENGING_ANGEL))
    ?.featureOverrides?.[
      CLASS_FEATURE.AVENGING_ANGEL
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const paladinFrightfulAuraDescription = [
  "Whenever an enemy starts its turn in your Aura of Protection, that creature must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute or until it takes any damage.",
  "Attack rolls against the Frightened creature have Advantage."
];
const sorcererTelepathicSpeechDescription =
  sorcererAberrantSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.TELEPATHIC_SPEECH))
    ?.featureOverrides?.[
      CLASS_FEATURE.TELEPATHIC_SPEECH
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const warlockAwakenedMindDescription =
  warlockGreatOldOnePatronSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.AWAKENED_MIND))
    ?.featureOverrides?.[
      CLASS_FEATURE.AWAKENED_MIND
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const sorcererPsychicDefensesDescription =
  sorcererAberrantSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.PSYCHIC_DEFENSES))
    ?.featureOverrides?.[
      CLASS_FEATURE.PSYCHIC_DEFENSES
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const sorcererBastionOfLawDescription =
  sorcererClockworkSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.BASTION_OF_LAW))
    ?.featureOverrides?.[
      CLASS_FEATURE.BASTION_OF_LAW
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const sorcererTranceOfOrderDescription =
  sorcererClockworkSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.TRANCE_OF_ORDER))
    ?.featureOverrides?.[
      CLASS_FEATURE.TRANCE_OF_ORDER
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const sorcererCrownOfSpellfireDescription =
  sorcererSpellfireSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.CROWN_OF_SPELLFIRE))
    ?.featureOverrides?.[
      CLASS_FEATURE.CROWN_OF_SPELLFIRE
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const sorcererRevelationInFleshDescription =
  sorcererAberrantSorcerySubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.REVELATION_IN_FLESH))
    ?.featureOverrides?.[
      CLASS_FEATURE.REVELATION_IN_FLESH
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
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
    ?.featureOverrides?.[
      CLASS_FEATURE.DEFENSIVE_TACTICS
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
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
    ?.featureOverrides?.[
      CLASS_FEATURE.SUPERIOR_HUNTERS_DEFENSE
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const rangerUmbralSightDescription =
  rangerGloomStalkerSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.UMBRAL_SIGHT))
    ?.featureOverrides?.[
      CLASS_FEATURE.UMBRAL_SIGHT
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const rangerFrigidExplorerDescription =
  rangerWinterWalkerSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.FRIGID_EXPLORER))
    ?.featureOverrides?.[
      CLASS_FEATURE.FRIGID_EXPLORER
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const rangerBitingColdDescription = extractSubclassFeatureDescriptionSection(
  rangerFrigidExplorerDescription,
  "<strong>Biting Cold.</strong>"
);
const rangerFrozenHauntDescription =
  rangerWinterWalkerSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.FROZEN_HAUNT))
    ?.featureOverrides?.[
      CLASS_FEATURE.FROZEN_HAUNT
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const rogueArcaneTricksterMagicalAmbushDescription =
  rogueArcaneTricksterSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.MAGICAL_AMBUSH))
    ?.featureOverrides?.[
      CLASS_FEATURE.MAGICAL_AMBUSH
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const rogueArcaneTricksterSpellThiefDescription =
  rogueArcaneTricksterSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.SPELL_THIEF))
    ?.featureOverrides?.[
      CLASS_FEATURE.SPELL_THIEF
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
const wizardAbjurerSpellResistanceDescription =
  wizardAbjurerSubclassEntry?.features
    .find((row) => row.classFeatures.includes(CLASS_FEATURE.SPELL_RESISTANCE))
    ?.featureOverrides?.[
      CLASS_FEATURE.SPELL_RESISTANCE
    ]?.description?.filter((entry): entry is string => typeof entry === "string") ?? [];
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
  "Each Exhaustion level strengthens the same penalties.",
  "<strong>D20 Tests.</strong> You take a penalty to each D20 Test equal to 2 times your Exhaustion level.",
  "<strong>Speed.</strong> Your <link:Speed>Speed</link> is reduced by 5 feet for each Exhaustion level.",
  "<strong>Level 6.</strong> You die. This death bypasses death saving throws."
];

export const statusGroupOrder: STATUS_ENTRY_GROUP[] = [
  STATUS_ENTRY_GROUP.EFFECTS,
  STATUS_ENTRY_GROUP.COMPANIONS,
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
  [STATUS_ENTRY_GROUP.COMPANIONS]: "Companions",
  [STATUS_ENTRY_GROUP.REACTIONS]: "Reactions",
  [STATUS_ENTRY_GROUP.SENSES]: "Senses",
  [STATUS_ENTRY_GROUP.AURAS]: "Auras",
  [STATUS_ENTRY_GROUP.RESISTANCES]: "Resistances",
  [STATUS_ENTRY_GROUP.VULNERABILITIES]: "Vulnerabilities",
  [STATUS_ENTRY_GROUP.IMMUNITIES]: "Immunities",
  [STATUS_ENTRY_GROUP.CONDITIONS]: "Conditions"
};

export {
  advanceCharacterStatusEntries,
  applyLongRestToCharacterStatusEntries,
  applyShortRestToCharacterStatusEntries,
  applySpellConcentrationToStatusEntries,
  createCharacterStatusEntry,
  getExhaustionD20TestPenalty,
  getExhaustionStatusEntry,
  hasStatusCondition,
  isExhaustionStatusEntry,
  normalizeCharacterStatusEntries,
  normalizeCharacterStatusDuration,
  normalizeStatusDurationRoundTick,
  removeCharacterConditionsForImmunities,
  removeCharacterStatusEntry,
  resolveCharacterStatusEntries,
  updateCharacterStatusEntryDuration,
  upsertManualStatusEntry
} from "./statusEntries";

function isConditionName(value: unknown): value is CONDITION_NAME {
  return typeof value === "string" && conditionValues.has(value as CONDITION_NAME);
}

function getExhaustionLevelFromConditionOption(value: string): ExhaustionLevel | null {
  if (!value.startsWith(exhaustionConditionOptionPrefix)) {
    return null;
  }

  return normalizeExhaustionLevel(
    value.slice(exhaustionConditionOptionPrefix.length)
  ) as ExhaustionLevel | null;
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

export function getExhaustionLevel(value: unknown): ExhaustionLevel | null {
  return getStoredExhaustionLevel(value) as ExhaustionLevel | null;
}

export function setCharacterExhaustionLevel(
  value: unknown,
  nextLevel: ExhaustionLevel | null
): CharacterStatusEntry[] {
  return setStoredCharacterExhaustionLevel(value, nextLevel);
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

  return {
    label: "Exhaustion",
    value: -5 * exhaustionLevel
  };
}

export function getEffectiveHitPointMaximumForCharacter(
  character: Pick<Character, "className" | "hitPoints" | "statusEntries"> &
    Partial<Pick<Character, "feats" | "level" | "species" | "subclassId">>
): number {
  const baseHitPoints = Math.max(1, Math.floor(character.hitPoints));
  const featureHitPointMaximumBonus = getSorcererDraconicResilienceHitPointMaximumBonus(character);
  const featHitPointMaximumBonus = getFeatHitPointMaximumBonusForCharacter({
    level: character.level ?? 1,
    feats: character.feats
  });
  const speciesHitPointMaximumBonus = getDwarvenToughnessHitPointMaximumBonus({
    level: character.level,
    species: character.species
  });
  const effectiveBaseHitPoints = Math.max(
    1,
    Math.floor(
      baseHitPoints +
        featureHitPointMaximumBonus +
        featHitPointMaximumBonus +
        speciesHitPointMaximumBonus
    )
  );
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
  const nextInventoryItems = isDeadFromExhaustion
    ? removeConjuredInventoryItems(character.inventoryItems)
    : character.inventoryItems;
  const inventoryItemsChanged = nextInventoryItems !== character.inventoryItems;
  const deathSavesUnchanged = isDeadFromExhaustion
    ? character.deathSaves?.successes === 0 &&
      character.deathSaves?.failures === 3 &&
      character.deathSaves?.resolution !== "instant-death"
    : true;

  if (
    nextCurrentHitPoints === character.currentHitPoints &&
    (!isDeadFromExhaustion || deathSavesUnchanged) &&
    !shouldEndRageFromIncapacitated &&
    !statusEntriesChanged &&
    !inventoryItemsChanged
  ) {
    return character;
  }

  return {
    ...character,
    currentHitPoints: nextCurrentHitPoints,
    deathSaves: nextDeathSaves,
    statusEntries: nextStatusEntries,
    inventoryItems: nextInventoryItems,
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

export function getStatusEntryTitle(entry: CharacterStatusEntry): string {
  if (isExhaustionStatusEntry(entry)) {
    const exhaustionLevel = normalizeExhaustionLevel(entry.conditionLevel) ?? 1;

    return `Exhaustion ${exhaustionLevel}`;
  }

  if (
    (entry.group === STATUS_ENTRY_GROUP.RESISTANCES ||
      entry.group === STATUS_ENTRY_GROUP.VULNERABILITIES ||
      entry.group === STATUS_ENTRY_GROUP.IMMUNITIES) &&
    damageTypeValues.has(entry.value as DAMAGE_TYPE)
  ) {
    return formatCodexLabel(String(entry.value));
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

export function hasStatusEntryDescriptionAdditions(entry: CharacterStatusEntry): boolean {
  return (entry.descriptionAdditions ?? []).some((section) => section.length > 0);
}

function getDefaultStatusEntryDescriptionEntries(
  entry: CharacterStatusEntry
): SpellDescriptionEntry[] {
  if (entry.description?.trim()) {
    return entry.description
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  if (isExhaustionStatusEntry(entry)) {
    const exhaustionLevel = normalizeExhaustionLevel(entry.conditionLevel) ?? 1;

    return [
      `<strong>Current Level.</strong> Level ${exhaustionLevel}. D20 Tests take a -${2 * exhaustionLevel} penalty, and Speed is reduced by ${5 * exhaustionLevel} feet.`,
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
    return (
      paladinFeatureMap[CLASS_FEATURE.AURA_OF_PROTECTION]?.description ?? [
        "An aura passively affects creatures or spaces around you."
      ]
    );
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

  if (entry.sourceId === wizardAbjurerSpellResistanceStatusSourceId) {
    return wizardAbjurerSpellResistanceDescription.length > 0
      ? wizardAbjurerSpellResistanceDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === wizardBladesongStatusSourceId) {
    return wizardBladesingerBladesongDescription.length > 0
      ? wizardBladesingerBladesongDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === wizardIllusionistIllusoryRealityStatusSourceId) {
    return wizardIllusionistIllusoryRealityDescription.length > 0
      ? wizardIllusionistIllusoryRealityDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === wizardDivinerThirdEyeDarkvisionStatusSourceId) {
    return wizardDivinerThirdEyeDarkvisionDescription;
  }

  if (entry.sourceId === wizardDivinerThirdEyeGreaterComprehensionStatusSourceId) {
    return wizardDivinerThirdEyeGreaterComprehensionDescription;
  }

  if (entry.sourceId === wizardDivinerThirdEyeSeeInvisibilityStatusSourceId) {
    return wizardDivinerThirdEyeSeeInvisibilityDescription;
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

  if (entry.sourceId === monkSelfRestorationStatusSourceId) {
    return (
      monkFeatureMap[CLASS_FEATURE.SELF_RESTORATION]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === monkSuperiorDefenseStatusSourceId) {
    return (
      monkFeatureMap[CLASS_FEATURE.SUPERIOR_DEFENSE]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
  }

  if (entry.sourceId === "feature-barbarian-zealous-presence") {
    return (
      barbarianFeatureMap[CLASS_FEATURE.ZEALOUS_PRESENCE]?.description ?? [
        "A current effect or trait that may change how your character plays."
      ]
    );
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

  if (entry.sourceId === warlockAwakenedMindStatusSourceId) {
    return warlockAwakenedMindDescription.length > 0
      ? warlockAwakenedMindDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (
    entry.sourceId === sorcererPsychicDefensesStatusSourceId ||
    entry.sourceId === sorcererPsychicDefensesTraitStatusSourceId
  ) {
    return sorcererPsychicDefensesDescription.length > 0
      ? sorcererPsychicDefensesDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === sorcererClockworkBastionOfLawStatusSourceId) {
    return sorcererBastionOfLawDescription.length > 0
      ? [
          `<strong>Current Ward.</strong> ${getStatusEntryTitle(entry)}.`,
          ...sorcererBastionOfLawDescription
        ]
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

  if (entry.sourceId === sorcererDragonWingsStatusSourceId) {
    return dragonWingsDescription.length > 0
      ? dragonWingsDescription
      : ["A current effect or trait that may change how your character plays."];
  }

  if (entry.sourceId === mantleOfMajestyStatusSourceId) {
    return [...mantleOfMajestyDescription];
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
    return [...unbreakableMajestyDescription];
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

function getConcentrationSourceSpellDescriptionAddition(
  entry: CharacterStatusEntry
): SpellDescriptionEntry[] {
  if (entry.group !== STATUS_ENTRY_GROUP.EFFECTS || entry.value !== EFFECT_NAME.CONCENTRATION) {
    return [];
  }

  const sourceSpell =
    (entry.sourceSpellId ? getSpellEntryById(entry.sourceSpellId) : null) ??
    getSpellEntryByName(entry.source);

  if (!sourceSpell || sourceSpell.description.length === 0) {
    return [];
  }

  return createSourcedDescriptionEntries(sourceSpell.name, sourceSpell.description);
}

function getConcentrationDescriptionAdditions(
  entry: CharacterStatusEntry,
  character?: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellDescriptionEntry[][] {
  return [
    getConcentrationSourceSpellDescriptionAddition(entry),
    ...(character ? getRangerHuntersMarkConcentrationDescriptionAdditions(character, entry) : [])
  ].filter((section) => section.length > 0);
}

export function getStatusEntryDescriptionContent(
  entry: CharacterStatusEntry,
  character?: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): {
  description: SpellDescriptionEntry[];
  descriptionAdditions: SpellDescriptionEntry[][];
} {
  if (
    entry.sourceId === paladinOathOfDevotionSacredWeaponStatusSourceId &&
    character?.className === "Paladin"
  ) {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.SACRED_WEAPON
    );

    if (descriptionEntries.length > 0) {
      return {
        description: descriptionEntries,
        descriptionAdditions: []
      };
    }
  }

  if (
    entry.sourceId === paladinOathOfVengeanceVowOfEnmityStatusSourceId &&
    character?.className === "Paladin"
  ) {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.VOW_OF_ENMITY
    );

    if (descriptionEntries.length > 0) {
      return {
        description: descriptionEntries,
        descriptionAdditions: []
      };
    }
  }

  if (entry.sourceId === paladinHolyNimbusStatusSourceId && character?.className === "Paladin") {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.HOLY_NIMBUS
    );

    if (descriptionEntries.length > 0) {
      return {
        description: descriptionEntries,
        descriptionAdditions: []
      };
    }
  }

  if (entry.sourceId === monkQuiveringPalmStatusSourceId && character?.className === "Monk") {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.QUIVERING_PALM
    );

    return {
      description:
        descriptionEntries.length > 0 ? descriptionEntries : [...monkQuiveringPalmTraitDescription],
      descriptionAdditions: []
    };
  }

  if (
    entry.sourceId === "feature-rage" &&
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    character?.className === "Barbarian"
  ) {
    const rageDescriptionContent = getBarbarianRageDescriptionContent(character);

    if (
      rageDescriptionContent.description.length > 0 ||
      rageDescriptionContent.descriptionAdditions.length > 0
    ) {
      return rageDescriptionContent;
    }
  }

  if (character?.className === "Barbarian") {
    const wildHeartDescriptionEntries =
      getBarbarianPathOfTheWildHeartStatusDescriptionEntries(entry);

    if (wildHeartDescriptionEntries && wildHeartDescriptionEntries.length > 0) {
      return {
        description: wildHeartDescriptionEntries,
        descriptionAdditions: []
      };
    }
  }

  if (entry.sourceId === inspiredEclipseStatusSourceId && character?.className === "Bard") {
    const moonsInspirationDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.MOONS_INSPIRATION
    ).filter(
      (descriptionEntry): descriptionEntry is string => typeof descriptionEntry === "string"
    );
    const inspiredEclipseSection = extractSubclassFeatureDescriptionSection(
      moonsInspirationDescription,
      "Inspired Eclipse."
    );

    if (inspiredEclipseSection.length > 0) {
      return {
        description: inspiredEclipseSection,
        descriptionAdditions: []
      };
    }
  }

  if (entry.sourceId === coronaOfLightStatusSourceId && character?.className === "Cleric") {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.CORONA_OF_LIGHT
    );

    return {
      description:
        descriptionEntries.length > 0 ? descriptionEntries : [...coronaOfLightDescription],
      descriptionAdditions: []
    };
  }

  if (
    entry.sourceId === blessingOfTheTricksterStatusSourceId &&
    character?.className === "Cleric"
  ) {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.BLESSING_OF_THE_TRICKSTER
    );

    return {
      description:
        descriptionEntries.length > 0 ? descriptionEntries : [...blessingOfTheTricksterDescription],
      descriptionAdditions: []
    };
  }

  if (entry.sourceId === druidStarryFormStatusSourceId && character?.className === "Druid") {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.STARRY_FORM
    );
    const twinklingConstellationsDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.TWINKLING_CONSTELLATIONS
    );

    return {
      description: descriptionEntries.length > 0 ? descriptionEntries : [...starryFormDescription],
      descriptionAdditions:
        twinklingConstellationsDescription.length > 0
          ? [
              createFeatureSourcedDescriptionEntries(
                character,
                CLASS_FEATURE.TWINKLING_CONSTELLATIONS,
                twinklingConstellationsDescription,
                "Twinkling Constellations"
              )
            ]
          : []
    };
  }

  if (entry.sourceId === invokeDuplicityStatusSourceId && character?.className === "Cleric") {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.INVOKE_DUPLICITY
    );

    return {
      description:
        descriptionEntries.length > 0 ? descriptionEntries : [...invokeDuplicityDescription],
      descriptionAdditions: getClericInvokeDuplicityDescriptionAdditions(character)
    };
  }

  if (entry.sourceId === thoughtShieldStatusSourceId && character?.className === "Warlock") {
    const descriptionEntries = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.THOUGHT_SHIELD
    );

    if (descriptionEntries.length > 0) {
      return {
        description: descriptionEntries,
        descriptionAdditions: []
      };
    }
  }

  if (
    character?.className === "Paladin" &&
    (entry.sourceId === "feature-paladin-aura-of-protection" ||
      entry.sourceId === paladinAuraOfAlacrityProtectionStatusSourceId)
  ) {
    const descriptionAdditions: SpellDescriptionEntry[][] = [];
    const auraOfAlacrityDescription =
      entry.sourceId === paladinAuraOfAlacrityProtectionStatusSourceId
        ? getFeatureDescriptionForCharacter(character, CLASS_FEATURE.AURA_OF_ALACRITY)
        : [];
    const auraExpansionDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.AURA_EXPANSION
    );

    if (auraOfAlacrityDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.AURA_OF_ALACRITY,
          auraOfAlacrityDescription,
          "Aura of Alacrity"
        )
      );
    }

    if (auraExpansionDescription.length > 0) {
      descriptionAdditions.push(
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.AURA_EXPANSION,
          auraExpansionDescription,
          "Aura Expansion"
        )
      );
    }

    return {
      description: getDefaultStatusEntryDescriptionEntries(entry),
      descriptionAdditions
    };
  }

  if (
    entry.sourceId === fighterPsiWarriorTelekineticMasterConcentrationStatusSourceId &&
    character?.className === "Fighter"
  ) {
    const telekineticMasterDescription = getFeatureDescriptionForCharacter(
      character,
      CLASS_FEATURE.TELEKINETIC_MASTER
    ).filter(
      (descriptionEntry): descriptionEntry is string =>
        typeof descriptionEntry === "string" &&
        descriptionEntry.includes("you can make one attack with a weapon as a Bonus Action")
    );

    return {
      description: getDefaultStatusEntryDescriptionEntries(entry),
      descriptionAdditions:
        telekineticMasterDescription.length > 0
          ? [
              createFeatureSourcedDescriptionEntries(
                character,
                CLASS_FEATURE.TELEKINETIC_MASTER,
                telekineticMasterDescription,
                fighterPsiWarriorTelekineticMasterEffectName
              ),
              ...getConcentrationDescriptionAdditions(entry, character)
            ].filter((section) => section.length > 0)
          : getConcentrationDescriptionAdditions(entry, character)
    };
  }

  if (
    entry.sourceId === monkElementalAttunementStatusSourceId ||
    entry.sourceId === monkElementalAttunementStrideStatusSourceId ||
    entry.sourceId === monkElementalAttunementEpitomeStatusSourceId
  ) {
    return getMonkElementalAttunementDescriptionContent(entry, character);
  }

  return {
    description: getDefaultStatusEntryDescriptionEntries(entry),
    descriptionAdditions: [
      ...(entry.descriptionAdditions ?? []),
      ...getConcentrationDescriptionAdditions(entry, character)
    ]
  };
}

export function getStatusEntryDescriptionEntries(
  entry: CharacterStatusEntry,
  character?: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellDescriptionEntry[] {
  const { description, descriptionAdditions } = getStatusEntryDescriptionContent(entry, character);

  return [...description, ...descriptionAdditions.flatMap((section) => section)];
}

export function getStatusEntryDescription(
  entry: CharacterStatusEntry,
  character?: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string {
  return getStatusEntryDescriptionEntries(entry, character)
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
    case STATUS_DURATION_KIND.SHORT_REST:
      return "Short Rest";
    case STATUS_DURATION_KIND.LONG_REST:
      return "Long Rest";
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

export function getStatusDurationShortLabel(duration: CharacterStatusDuration): string | null {
  switch (duration.kind) {
    case STATUS_DURATION_KIND.INFINITE:
      return null;
    case STATUS_DURATION_KIND.CONCENTRATION:
      return "Conc.";
    case STATUS_DURATION_KIND.LINKED:
      return formatLinkedStatusDurationLabel(duration);
    case STATUS_DURATION_KIND.SHORT_REST:
      return "SR";
    case STATUS_DURATION_KIND.LONG_REST:
      return "LR";
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
