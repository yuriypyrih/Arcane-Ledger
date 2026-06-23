import clsx from "clsx";
import { CircleHelp, Pencil } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CLASS_FEATURE,
  ELDRITCH_INVOCATION,
  FEAT_CATEGORY,
  FEATS,
  FeatureMap,
  TRACKER,
  type ClassEntry,
  type DivinityEntry,
  type FeatureMapEntry,
  type SpellEntry
} from "../../../../codex/entries";
import { getClassEntries, getSpeciesEntryByName } from "../../../../codex/selectors";
import { getMonkDeflectAttacksDescription } from "../../../../codex/classes/monk";
import {
  getBlessedWarriorCantripOptions,
  getCharacterFeatSummary,
  getDruidicWarriorCantripOptions,
  getFeatDefinition,
  getFeatDefinitionsByCategory
} from "../../../../pages/CharactersPage/feats";
import {
  getWarlockEldritchInvocationInputStatusForCharacter,
  getWarlockPactOfTheBladeConjuredItemKeyFromSelectionIdsForCharacter,
  getWarlockInvocationSelectionIdsForCharacter,
  getWarlockLearnedInvocationOptionsForCharacter,
  normalizeCharacterClassFeatureState,
  setWarlockInvocationSelectionIdsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import { ApiRequestFailedError, fetchItemByKey } from "../../../../api";
import { captureAppError } from "../../../../lib/sentry";
import { getFeatEligibilityForCharacter } from "../../../../pages/CharactersPage/feats/eligibility";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getSelectedSubclassForCharacter,
  getSubclassFeatureDetails,
  getSubclassFeatureRowsForCharacter
} from "../../../../pages/CharactersPage/subclasses";
import type {
  AbilityKey,
  Character,
  CharacterClassRulesConfig,
  CharacterCustomSpeciesConfig,
  CharacterFeatEntry,
  CharacterSpeciesChoices,
  ItemRecord
} from "../../../../types";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import {
  normalizeCharacterSpeciesChoices,
  normalizeCharacterSpeciesFeatureState,
  normalizeSpeciesStatusEntriesForCharacter,
  reconcileHumanOriginFeatEntries
} from "../../../../pages/CharactersPage/species";
import {
  CUSTOM_CLASS_EXTRA_ATTACK_MAXIMUM,
  CUSTOM_CLASS_EXTRA_ATTACK_MINIMUM,
  areCharacterClassRulesEnforced,
  customClassHitDice,
  getCharacterClassRulesConfig,
  isCustomClassName,
  normalizeCharacterClassRulesConfig
} from "../../../../pages/CharactersPage/customClass";
import { seedClassRulesDefaultsForCharacter } from "../../../../pages/CharactersPage/classRulesDefaults";
import {
  getCharacterSubclassDisplayName,
  isCustomSpeciesName
} from "../../../../pages/CharactersPage/customOrigins";
import { hasBuiltInSpellcastingForCharacter } from "../../../../pages/CharactersPage/spellcasting";
import { resolveKeywordReference } from "../../../../utils/codex/renderCodexRichText";
import CodexDivinityDrawer from "../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../CodexPage/CodexSpellDrawer";
import { FeatureTrackingBadgeButton } from "../../../FeatureDisclosure";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import SelectInput from "../../FormInputs/SelectInput";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import FeatureOptInToggle from "../FeatureOptInToggle/FeatureOptInToggle";
import InlineToggleButton from "../InlineToggleButton";
import SheetActionButton from "../SheetActionButton";
import ClassFeatureList from "./ClassFeatureList";
import ClassFeaturesGuideModal from "./ClassFeaturesGuideModal";
import EldritchInvocationEditorModal from "./EldritchInvocationEditorModal";
import EldritchInvocationList from "./EldritchInvocationList";
import EldritchInvocationReferenceDrawer from "./EldritchInvocationReferenceDrawer";
import FeatEditorModal from "./FeatEditorModal";
import FeatList from "./FeatList";
import FeatReferenceDrawer from "./FeatReferenceDrawer";
import SpeciesBuildCard from "./SpeciesBuildCard";
import SpeciesEditorModal from "./SpeciesEditorModal";
import SpeciesReferenceDrawer from "./SpeciesReferenceDrawer";
import SubclassEditorModal from "./SubclassEditorModal";
import {
  createEmptyPendingFeatState,
  createPendingFeatStateForEntry,
  createPendingFeatStateForFeat,
  decodePendingBlessedWarriorChoice,
  decodePendingBoonOfEnergyResistanceChoice,
  decodePendingBoonOfSkillChoice,
  decodePendingChargerChoice,
  decodePendingChefChoice,
  decodePendingCultOfDragonInitiateChoice,
  decodePendingCrusherChoice,
  decodePendingDualWielderChoice,
  decodePendingEmeraldEnclaveFledglingChoice,
  decodePendingElementalAdeptChoice,
  decodePendingFeyTouchedChoice,
  decodePendingHarperAgentChoice,
  decodePendingHeavilyArmoredChoice,
  decodePendingHeavyArmorMasterChoice,
  decodePendingInspiringLeaderChoice,
  decodePendingKeenMindChoice,
  decodePendingLightlyArmoredChoice,
  decodePendingMageSlayerChoice,
  decodePendingMartialWeaponTrainingChoice,
  decodePendingMediumArmorMasterChoice,
  decodePendingModeratelyArmoredChoice,
  decodePendingMountedCombatantChoice,
  decodePendingObservantChoice,
  decodePendingPiercerChoice,
  decodePendingPoisonerChoice,
  decodePendingPolearmMasterChoice,
  decodePendingPurpleDragonRookChoice,
  decodePendingRitualCasterChoice,
  decodePendingResilientChoice,
  decodePendingSentinelChoice,
  decodePendingShadowTouchedChoice,
  decodePendingSlasherChoice,
  decodePendingSpellfireSparkChoice,
  decodePendingSpellSniperChoice,
  decodePendingTelekineticChoice,
  decodePendingTelepathicChoice,
  decodePendingWarCasterChoice,
  decodePendingSkillExpertChoice,
  decodePendingSpeedyChoice,
  decodePendingWeaponMasterChoice,
  decodePendingCrafterChoice,
  decodePendingDruidicWarriorChoice,
  decodePendingMagicInitiateChoice,
  decodePendingMusicianChoice,
  decodePendingSkilledChoice
} from "./featEditorUtils";
import {
  applyFeatEditorDraftToCharacter,
  createFeatEditorDraft,
  removeFeatFromDraft,
  updateFeatInDraft,
  upsertFeatInDraft,
  type FeatEditorDraft
} from "./featDrafts";
import {
  createClassFeatureFeatSource,
  createFeatEntryForContext,
  getDefaultFeatCategoryForFeature,
  isFeatFromClassFeatureSource
} from "./helpers";
import styles from "./ClassFeaturesAndFeats.module.css";
import type {
  FeatEditorContext,
  FeatEligibilityByFeat,
  FeatureRow,
  PendingFeatState,
  SelectedDivinityReference,
  SelectedFeatReference,
  SelectedKeyword,
  SelectedSpellReference,
  TrackingButtonRenderer
} from "./types";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";

type ClassFeaturesAndFeatsProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

const featCategoryTabs: FEAT_CATEGORY[] = [
  FEAT_CATEGORY.ORIGIN,
  FEAT_CATEGORY.GENERAL,
  FEAT_CATEGORY.FIGHTING_STYLE,
  FEAT_CATEGORY.EPIC_BOON
];

const classEntriesByName = new Map<string, ClassEntry>(
  getClassEntries().map((entry) => [entry.name, entry])
);

function isLessonsOfTheFirstOnesFeatEntry(
  entry: CharacterFeatEntry
): entry is CharacterFeatEntry & {
  source: Extract<CharacterFeatEntry["source"], { type: "eldritch-invocation" }>;
} {
  return (
    entry.source.type === "eldritch-invocation" &&
    entry.source.invocation === ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES
  );
}

function ClassFeaturesAndFeats({
  character,
  className,
  onPersistCharacter
}: ClassFeaturesAndFeatsProps) {
  const [isFutureFeaturesVisible, setIsFutureFeaturesVisible] = useState(false);
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<string[]>([]);
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false);
  const [isSubclassModalOpen, setIsSubclassModalOpen] = useState(false);
  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);
  const [isEldritchInvocationModalOpen, setIsEldritchInvocationModalOpen] = useState(false);
  const [featEditorContext, setFeatEditorContext] = useState<FeatEditorContext>({
    mode: "general"
  });
  const [activeFeatCategory, setActiveFeatCategory] = useState<FEAT_CATEGORY>(
    FEAT_CATEGORY.GENERAL
  );
  const [pendingFeatState, setPendingFeatState] = useState<PendingFeatState>(
    createEmptyPendingFeatState
  );
  const [editingFeatEntryId, setEditingFeatEntryId] = useState<string | null>(null);
  const [featEditorDraft, setFeatEditorDraftState] = useState(() =>
    createFeatEditorDraft(character)
  );
  const featEditorDraftRef = useRef(featEditorDraft);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const [isSpeciesReferenceOpen, setIsSpeciesReferenceOpen] = useState(false);
  const [selectedInvocationReference, setSelectedInvocationReference] =
    useState<WarlockEldritchInvocationOption | null>(null);
  const [selectedSpellReference, setSelectedSpellReference] =
    useState<SelectedSpellReference | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] =
    useState<SelectedDivinityReference | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedKeyword | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const classEntry = classEntriesByName.get(character.className) ?? null;
  const isCustomClass = isCustomClassName(character.className);
  const resolvedClassRules = useMemo(() => getCharacterClassRulesConfig(character), [character]);
  const classRulesEnforced = areCharacterClassRulesEnforced(character);
  const shouldRenderClassNeutralMechanics = isCustomClass || !classRulesEnforced;
  const hasBuiltInSpellcastingRules = hasBuiltInSpellcastingForCharacter(
    character.className,
    character.level,
    character.subclassId
  );
  const hasBuiltInEldritchInvocations = character.className === "Warlock";
  const isSpellcastingMechanicChecked =
    hasBuiltInSpellcastingRules || resolvedClassRules.mechanics.spellcasting.enabled;
  const isEldritchInvocationMechanicChecked =
    hasBuiltInEldritchInvocations || resolvedClassRules.mechanics.eldritchInvocations.enabled;
  const isSpellcastingMechanicLocked = hasBuiltInSpellcastingRules;
  const isEldritchInvocationMechanicLocked = hasBuiltInEldritchInvocations;
  const isNeutralSpellcastingAbilityVisible = isSpellcastingMechanicChecked;
  const mechanics = resolvedClassRules.mechanics;
  const extraAttackCount = mechanics.extraAttacks.count;
  const selectedHitDie = resolvedClassRules.hitDie;
  const selectedSpellcastingAbility = resolvedClassRules.spellcastingAbility;
  const hitDieOptions = useMemo(
    () => customClassHitDice.map((hitDie) => ({ value: hitDie, label: hitDie.toUpperCase() })),
    []
  );
  const selectedSubclass = useMemo(
    () =>
      getSelectedSubclassForCharacter({
        className: character.className,
        subclassId: character.subclassId
      }),
    [character.className, character.subclassId]
  );
  const selectedSubclassLabel =
    selectedSubclass?.name ?? getCharacterSubclassDisplayName(character) ?? "No subclass selected";
  const allFeatures = useMemo<FeatureRow[]>(() => {
    if (!classEntry) {
      return [];
    }

    const subclassFeatureRows = getSubclassFeatureRowsForCharacter({
      className: character.className,
      subclassId: character.subclassId
    });
    const subclassFeatureRowsByLevel = subclassFeatureRows.reduce<
      Map<number, typeof subclassFeatureRows>
    >((rowsByLevel, featureRow) => {
      const rowsAtLevel = rowsByLevel.get(featureRow.level) ?? [];
      rowsByLevel.set(featureRow.level, [...rowsAtLevel, featureRow]);
      return rowsByLevel;
    }, new Map<number, typeof subclassFeatureRows>());

    function createFeatureRow(
      level: number,
      feature: CLASS_FEATURE,
      index: number,
      details: FeatureMapEntry,
      isSubclass = false
    ): FeatureRow {
      return {
        key: `${level}-${feature}-${index}`,
        level,
        feature,
        details,
        isSubclass
      };
    }

    function resolveFeatureDetails(
      level: number,
      feature: CLASS_FEATURE,
      details: FeatureMapEntry
    ): FeatureMapEntry {
      if (
        character.className === "Monk" &&
        feature === CLASS_FEATURE.DEFLECT_ATTACKS &&
        character.level >= 13
      ) {
        return {
          ...details,
          description: getMonkDeflectAttacksDescription(true)
        };
      }

      return details;
    }

    function createSubclassFeatureRows(level: number): FeatureRow[] {
      const rowsAtLevel = subclassFeatureRowsByLevel.get(level);

      if (!rowsAtLevel || rowsAtLevel.length === 0) {
        return [];
      }

      return rowsAtLevel.flatMap((subclassFeatureRow, rowIndex) =>
        subclassFeatureRow.classFeatures.map((feature, index) => {
          const resolvedDetails = getSubclassFeatureDetails(
            selectedSubclass,
            Math.max(level, character.level),
            feature
          ) ??
            FeatureMap[feature] ?? {
              description: ["You gain a feature from your chosen subclass."],
              trackingState: TRACKER.NOT_TRACKED
            };

          return createFeatureRow(
            level,
            feature,
            rowIndex * 100 + index,
            resolveFeatureDetails(level, feature, resolvedDetails),
            true
          );
        })
      );
    }

    return classEntry.features.flatMap((featureRow) => {
      const baseFeatureRows = featureRow.classFeatures.flatMap((feature, index) => {
        const resolvedDetails = featureRow.featureOverrides?.[feature] ?? FeatureMap[feature];
        const featureDetails = resolveFeatureDetails(featureRow.level, feature, resolvedDetails);

        return [createFeatureRow(featureRow.level, feature, index, featureDetails)];
      });

      return [...baseFeatureRows, ...createSubclassFeatureRows(featureRow.level)];
    });
  }, [character.className, character.level, character.subclassId, classEntry, selectedSubclass]);
  const unlockedFeatures = useMemo(
    () => allFeatures.filter((featureRow) => featureRow.level <= character.level),
    [allFeatures, character.level]
  );
  const futureFeatures = useMemo(
    () => allFeatures.filter((featureRow) => featureRow.level > character.level),
    [allFeatures, character.level]
  );
  const visibleClassFeatureKeys = useMemo(
    () => [
      ...unlockedFeatures.map((featureRow) => featureRow.key),
      ...(isFutureFeaturesVisible ? futureFeatures.map((featureRow) => featureRow.key) : [])
    ],
    [futureFeatures, isFutureFeaturesVisible, unlockedFeatures]
  );
  const hasExpandedVisibleClassFeature = useMemo(() => {
    const visibleFeatureKeySet = new Set(visibleClassFeatureKeys);
    return expandedFeatureKeys.some((featureKey) => visibleFeatureKeySet.has(featureKey));
  }, [expandedFeatureKeys, visibleClassFeatureKeys]);
  const featDefinitionsByCategory = useMemo(() => getFeatDefinitionsByCategory(), []);
  const blessedWarriorCantripOptions = useMemo(() => getBlessedWarriorCantripOptions(), []);
  const druidicWarriorCantripOptions = useMemo(() => getDruidicWarriorCantripOptions(), []);
  const selectedFeats = useMemo(() => character.feats ?? [], [character.feats]);
  const selectedInvocationIds = useMemo(
    () => getWarlockInvocationSelectionIdsForCharacter(character),
    [character]
  );
  const learnedInvocationOptions = useMemo(
    () => getWarlockLearnedInvocationOptionsForCharacter(character),
    [character]
  );
  const eldritchInvocationInputStatus = useMemo(
    () => getWarlockEldritchInvocationInputStatusForCharacter(character),
    [character]
  );
  const customExtraAttackCountOptions = useMemo(
    () =>
      Array.from(
        { length: CUSTOM_CLASS_EXTRA_ATTACK_MAXIMUM - CUSTOM_CLASS_EXTRA_ATTACK_MINIMUM + 1 },
        (_, index) => CUSTOM_CLASS_EXTRA_ATTACK_MINIMUM + index
      ),
    []
  );
  const selectedFeatDefinition = selectedFeatReference
    ? getFeatDefinition(selectedFeatReference.feat)
    : null;
  const speciesEntry = useMemo(() => getSpeciesEntryByName(character.species), [character.species]);
  const selectedSpeciesEntry = isSpeciesReferenceOpen ? speciesEntry : null;
  const fightingStyleExtraFeatOptions = useMemo(() => {
    if (!isFeatModalOpen) {
      return [];
    }

    if (
      featEditorContext.mode === "class-feature" &&
      featEditorContext.source.feature === CLASS_FEATURE.FIGHTING_STYLE &&
      character.className === "Paladin"
    ) {
      return [FEATS.BLESSED_WARRIOR];
    }

    if (
      featEditorContext.mode === "class-feature" &&
      featEditorContext.source.feature === CLASS_FEATURE.FIGHTING_STYLE &&
      character.className === "Ranger"
    ) {
      return [FEATS.DRUIDIC_WARRIOR];
    }

    return [];
  }, [character.className, featEditorContext, isFeatModalOpen]);
  const visibleFeatDefinitionsByCategory = useMemo(() => {
    const emptyGroups: Record<
      FEAT_CATEGORY,
      (typeof featDefinitionsByCategory)[FEAT_CATEGORY.GENERAL]
    > = {
      [FEAT_CATEGORY.ORIGIN]: [],
      [FEAT_CATEGORY.GENERAL]: [],
      [FEAT_CATEGORY.FIGHTING_STYLE]: [],
      [FEAT_CATEGORY.EPIC_BOON]: []
    };

    if (!isFeatModalOpen) {
      return emptyGroups;
    }

    return featCategoryTabs.reduce<
      Record<FEAT_CATEGORY, (typeof featDefinitionsByCategory)[FEAT_CATEGORY.GENERAL]>
    >((groups, category) => {
      const additionalFightingStyleFeatSet = new Set(fightingStyleExtraFeatOptions);

      groups[category] = featDefinitionsByCategory[category]
        .filter((definition) => {
          const isFightingStyleContext =
            featEditorContext.mode === "class-feature" &&
            (featEditorContext.source.feature === CLASS_FEATURE.FIGHTING_STYLE ||
              featEditorContext.source.feature === CLASS_FEATURE.ADDITIONAL_FIGHTING_STYLE);

          if (definition.feat === FEATS.BLESSED_WARRIOR) {
            return (
              featEditorContext.mode === "class-feature" &&
              featEditorContext.source.feature === CLASS_FEATURE.FIGHTING_STYLE &&
              character.className === "Paladin"
            );
          }

          if (definition.feat === FEATS.DRUIDIC_WARRIOR) {
            return (
              featEditorContext.mode === "class-feature" &&
              featEditorContext.source.feature === CLASS_FEATURE.FIGHTING_STYLE &&
              character.className === "Ranger"
            );
          }

          if (isFightingStyleContext) {
            return (
              definition.category === FEAT_CATEGORY.FIGHTING_STYLE ||
              additionalFightingStyleFeatSet.has(definition.feat)
            );
          }

          return true;
        })
        .sort((left, right) => left.label.localeCompare(right.label));

      return groups;
    }, emptyGroups);
  }, [
    character.className,
    featDefinitionsByCategory,
    featEditorContext,
    fightingStyleExtraFeatOptions,
    isFeatModalOpen
  ]);
  const visibleFeatCategories = useMemo(
    () =>
      isFeatModalOpen
        ? featCategoryTabs.filter(
            (category) => visibleFeatDefinitionsByCategory[category].length > 0
          )
        : [],
    [isFeatModalOpen, visibleFeatDefinitionsByCategory]
  );
  const featEligibilityCharacter = useMemo<Character | null>(
    () =>
      isFeatModalOpen
        ? {
            ...character,
            level:
              featEditorContext.mode === "class-feature"
                ? featEditorContext.source.level
                : character.level,
            feats: featEditorDraft.feats,
            armorProficiencies: featEditorDraft.armorProficiencies,
            skillProficiencies: featEditorDraft.skillProficiencies,
            toolProficiencies: featEditorDraft.toolProficiencies,
            weaponProficiencies: featEditorDraft.weaponProficiencies
          }
        : null,
    [character, featEditorContext, featEditorDraft, isFeatModalOpen]
  );
  const featEligibilityByFeat = useMemo<FeatEligibilityByFeat>(() => {
    if (!featEligibilityCharacter) {
      return {};
    }

    return featCategoryTabs.reduce<FeatEligibilityByFeat>((eligibilityByFeat, category) => {
      visibleFeatDefinitionsByCategory[category].forEach((definition) => {
        eligibilityByFeat[definition.feat] = getFeatEligibilityForCharacter(
          featEligibilityCharacter,
          definition
        );
      });

      return eligibilityByFeat;
    }, {});
  }, [featEligibilityCharacter, visibleFeatDefinitionsByCategory]);

  useEffect(() => {
    const validFeatureKeys = new Set(allFeatures.map((featureRow) => featureRow.key));

    setExpandedFeatureKeys((current) =>
      current.filter((featureKey) => validFeatureKeys.has(featureKey))
    );
  }, [allFeatures]);

  useEffect(() => {
    if (!isFeatModalOpen) {
      return;
    }

    if (visibleFeatCategories.includes(activeFeatCategory)) {
      return;
    }

    setActiveFeatCategory(visibleFeatCategories[0] ?? FEAT_CATEGORY.GENERAL);
  }, [activeFeatCategory, isFeatModalOpen, visibleFeatCategories]);

  function resetPendingFeatState() {
    setPendingFeatState(createEmptyPendingFeatState());
    setEditingFeatEntryId(null);
  }

  function setFeatEditorDraft(
    draftOrUpdater: FeatEditorDraft | ((currentDraft: FeatEditorDraft) => FeatEditorDraft)
  ) {
    const nextDraft =
      typeof draftOrUpdater === "function"
        ? draftOrUpdater(featEditorDraftRef.current)
        : draftOrUpdater;

    featEditorDraftRef.current = nextDraft;
    setFeatEditorDraftState(nextDraft);
  }

  function resetFeatEditorDraft() {
    setFeatEditorDraft(createFeatEditorDraft(character));
  }

  function getClassFeatureSourceContext() {
    return featEditorContext.mode === "class-feature" ? featEditorContext.source : null;
  }

  function createContextualFeatEntry(
    feat: FEATS,
    options?: Parameters<typeof createFeatEntryForContext>[2]
  ) {
    const sourceContext = getClassFeatureSourceContext();

    return createFeatEntryForContext(feat, sourceContext?.level ?? character.level, {
      source: sourceContext ?? undefined,
      ...options
    });
  }

  function isFeatEligibleForCurrentEditor(feat: FEATS): boolean {
    const definition = getFeatDefinition(feat);

    if (!definition || !featEligibilityCharacter) {
      return false;
    }

    return getFeatEligibilityForCharacter(featEligibilityCharacter, definition).isEligible;
  }

  function getLinkedFeatForFeature(
    level: number,
    feature: CLASS_FEATURE
  ): CharacterFeatEntry | null {
    return (
      selectedFeats.find((entry) => isFeatFromClassFeatureSource(entry, level, feature)) ?? null
    );
  }

  function upsertFeatForContext(featEntry: CharacterFeatEntry) {
    if (!isFeatEligibleForCurrentEditor(featEntry.feat)) {
      return;
    }

    const editingEntry = editingFeatEntryId
      ? featEditorDraftRef.current.feats.find((entry) => entry.id === editingFeatEntryId)
      : null;

    if (editingEntry && editingEntry.feat === featEntry.feat) {
      const nextDraft = updateFeatInDraft(featEditorDraftRef.current, editingEntry, {
        ...featEntry,
        id: editingEntry.id,
        source: editingEntry.source,
        takenAtLevel: editingEntry.takenAtLevel
      });

      setFeatEditorDraft(nextDraft);
      resetPendingFeatState();
      return;
    }

    const sourceContext = getClassFeatureSourceContext();
    const nextDraft = upsertFeatInDraft(featEditorDraftRef.current, featEntry, sourceContext);

    setFeatEditorDraft(nextDraft);
    resetPendingFeatState();
  }

  function removeFeat(entryToRemove: CharacterFeatEntry) {
    setFeatEditorDraft((currentDraft) => removeFeatFromDraft(currentDraft, entryToRemove));
    setEditingFeatEntryId((currentEntryId) =>
      currentEntryId === entryToRemove.id ? null : currentEntryId
    );

    setSelectedFeatReference((current) =>
      current?.entry?.id === entryToRemove.id ? null : current
    );
  }

  function openKeyword(keywordKey: string, title?: string, trackingMessage?: string) {
    const resolvedKeyword = resolveKeywordReference(keywordKey, title, trackingMessage);

    if (!resolvedKeyword) {
      return;
    }

    setSelectedKeyword({
      key: keywordKey,
      title: resolvedKeyword.title,
      description: resolvedKeyword.description,
      trackingMessage: resolvedKeyword.trackingMessage
    });
  }

  function openFeatReference(feat: FEATS, entry?: CharacterFeatEntry) {
    if (!getFeatDefinition(feat)) {
      return;
    }

    setSelectedFeatReference({
      feat,
      entry
    });
  }

  function openSpeciesReference() {
    if (!speciesEntry) {
      return;
    }

    setIsSpeciesReferenceOpen(true);
  }

  function openSpellReference(spell: SpellEntry) {
    setSelectedSpellReference(spell);
  }

  function openDivinityReference(divinity: DivinityEntry) {
    setSelectedDivinityReference(divinity);
  }

  function openInvocationReference(option: WarlockEldritchInvocationOption) {
    setSelectedInvocationReference(option);
  }

  function closeFeatEditor() {
    onPersistCharacter((currentCharacter) =>
      applyFeatEditorDraftToCharacter(currentCharacter, featEditorDraftRef.current)
    );
    resetPendingFeatState();
    setFeatEditorContext({ mode: "general" });
    setIsFeatModalOpen(false);
  }

  function saveSpecies(
    species: string,
    speciesChoices?: CharacterSpeciesChoices,
    customSpecies?: CharacterCustomSpeciesConfig
  ) {
    setIsSpeciesModalOpen(false);
    onPersistCharacter((currentCharacter) => {
      const normalizedSpecies = species.trim();
      const normalizedChoices = normalizeCharacterSpeciesChoices(normalizedSpecies, speciesChoices);
      const normalizedCustomSpecies = isCustomSpeciesName(normalizedSpecies)
        ? customSpecies
        : undefined;

      return {
        ...currentCharacter,
        species: normalizedSpecies,
        speciesChoices: normalizedChoices,
        customSpecies: normalizedCustomSpecies,
        speciesFeatureState: normalizeCharacterSpeciesFeatureState(
          normalizedSpecies,
          currentCharacter.species === normalizedSpecies
            ? currentCharacter.speciesFeatureState
            : undefined
        ),
        feats: reconcileHumanOriginFeatEntries(
          currentCharacter.feats ?? [],
          normalizedSpecies,
          normalizedChoices,
          currentCharacter.level
        ),
        statusEntries: normalizeSpeciesStatusEntriesForCharacter({
          species: normalizedSpecies,
          level: currentCharacter.level,
          statusEntries: currentCharacter.statusEntries
        })
      };
    });
  }

  function saveSubclass({
    subclassId,
    classRulesEnforced: nextClassRulesEnforced,
    customClass,
    customSubclass
  }: {
    subclassId: string;
    classRulesEnforced: boolean;
    customClass?: Character["customClass"];
    customSubclass?: Character["customSubclass"];
  }) {
    setIsSubclassModalOpen(false);
    onPersistCharacter((currentCharacter) => {
      const currentClassRules = getCharacterClassRulesConfig(currentCharacter);
      const isCurrentCustomClass = isCustomClassName(currentCharacter.className);
      const nextClassRulesInput = {
        ...currentClassRules,
        classRulesEnforced: isCurrentCustomClass ? false : nextClassRulesEnforced
      };
      const nextClassRules = normalizeCharacterClassRulesConfig(
        !isCurrentCustomClass && currentClassRules.classRulesEnforced && !nextClassRulesEnforced
          ? seedClassRulesDefaultsForCharacter(
              {
                className: currentCharacter.className,
                subclassId
              },
              nextClassRulesInput
            )
          : nextClassRulesInput,
        {
          className: currentCharacter.className,
          legacyCustomClass: customClass ?? currentCharacter.customClass
        }
      );
      const nextSubclassId = isCurrentCustomClass ? "" : subclassId;
      const nextCustomClass = isCurrentCustomClass
        ? (customClass ?? currentCharacter.customClass)
        : currentCharacter.customClass;
      const nextCustomSubclass =
        !isCurrentCustomClass && customSubclass?.id === subclassId ? customSubclass : undefined;

      return {
        ...currentCharacter,
        subclassId: nextSubclassId,
        customClass: nextCustomClass,
        customSubclass: nextCustomSubclass,
        classRules: nextClassRules,
        classFeatureState: normalizeCharacterClassFeatureState(currentCharacter.classFeatureState, {
          className: currentCharacter.className,
          level: currentCharacter.level,
          subclassId: nextSubclassId,
          classRules: nextClassRules,
          customClass: nextCustomClass,
          abilities: currentCharacter.abilities,
          cantripIds: currentCharacter.cantripIds,
          feats: currentCharacter.feats
        })
      };
    });
  }

  function openFeatEditor() {
    resetPendingFeatState();
    resetFeatEditorDraft();
    setFeatEditorContext({ mode: "general" });
    setActiveFeatCategory(FEAT_CATEGORY.GENERAL);
    setIsFeatModalOpen(true);
  }

  function openEldritchInvocationEditor() {
    setIsEldritchInvocationModalOpen(true);
  }

  function updateClassRulesConfig(
    updater: (currentConfig: CharacterClassRulesConfig) => CharacterClassRulesConfig
  ) {
    onPersistCharacter((currentCharacter) => {
      const currentClassRules = getCharacterClassRulesConfig(currentCharacter);
      const nextClassRules = normalizeCharacterClassRulesConfig(updater(currentClassRules), {
        className: currentCharacter.className,
        legacyCustomClass: currentCharacter.customClass
      });

      if (Object.is(nextClassRules, currentClassRules)) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        classRules: nextClassRules,
        classFeatureState: normalizeCharacterClassFeatureState(currentCharacter.classFeatureState, {
          className: currentCharacter.className,
          level: currentCharacter.level,
          subclassId: currentCharacter.subclassId,
          classRules: nextClassRules,
          customClass: currentCharacter.customClass,
          abilities: currentCharacter.abilities,
          cantripIds: currentCharacter.cantripIds,
          feats: currentCharacter.feats
        })
      };
    });
  }

  async function closeEldritchInvocationEditor(
    selectionIds: string[],
    lessonsFeatEntries: CharacterFeatEntry[]
  ) {
    setIsEldritchInvocationModalOpen(false);
    const pactBladeConjuredItemKey =
      getWarlockPactOfTheBladeConjuredItemKeyFromSelectionIdsForCharacter(selectionIds);
    let pactBladeConjuredItem: ItemRecord | null = null;

    if (pactBladeConjuredItemKey) {
      try {
        pactBladeConjuredItem = await fetchItemByKey(pactBladeConjuredItemKey);
      } catch (error) {
        if (
          !(
            error instanceof ApiRequestFailedError &&
            error.status !== undefined &&
            error.status < 500
          )
        ) {
          console.error("Failed to fetch Pact of the Blade conjured weapon.", error);
          captureAppError(error, {
            area: "class-features",
            action: "fetch-pact-blade-item",
            extra: {
              itemKey: pactBladeConjuredItemKey
            }
          });
        }
      }
    }

    onPersistCharacter((currentCharacter) => {
      const characterWithInvocations = setWarlockInvocationSelectionIdsForCharacter(
        currentCharacter,
        selectionIds,
        {
          pactBladeConjuredItem
        }
      );
      const selectedLessonsSelectionIds = new Set(selectionIds);
      const nextLessonsFeatEntries = lessonsFeatEntries.filter(
        (entry) =>
          isLessonsOfTheFirstOnesFeatEntry(entry) &&
          selectedLessonsSelectionIds.has(entry.source.selectionId)
      );
      const characterWithInvocationFeatDraft = (characterWithInvocations.feats ?? [])
        .filter(isLessonsOfTheFirstOnesFeatEntry)
        .reduce(
          (draft, entry) => removeFeatFromDraft(draft, entry),
          createFeatEditorDraft(characterWithInvocations)
        );
      const nextInvocationFeatDraft = nextLessonsFeatEntries.reduce(
        (draft, entry) => upsertFeatInDraft(draft, entry, null),
        characterWithInvocationFeatDraft
      );

      return applyFeatEditorDraftToCharacter(characterWithInvocations, nextInvocationFeatDraft);
    });
  }

  function openFeatEditorForFeature(level: number, feature: CLASS_FEATURE) {
    const linkedFeat = getLinkedFeatForFeature(level, feature);
    const linkedFeatDefinition = linkedFeat ? getFeatDefinition(linkedFeat.feat) : null;

    resetPendingFeatState();
    resetFeatEditorDraft();
    setFeatEditorContext({
      mode: "class-feature",
      source: createClassFeatureFeatSource(level, feature)
    });
    setActiveFeatCategory(
      linkedFeatDefinition?.category ?? getDefaultFeatCategoryForFeature(feature)
    );
    setIsFeatModalOpen(true);
  }

  function addFeat(feat: FEATS) {
    if (!isFeatEligibleForCurrentEditor(feat)) {
      return;
    }

    const pendingState = createPendingFeatStateForFeat(feat, {
      languageProficiencies: featEditorDraftRef.current.languageProficiencies
    });

    if (pendingState) {
      setEditingFeatEntryId(null);
      setPendingFeatState(pendingState);
      return;
    }

    upsertFeatForContext(createContextualFeatEntry(feat));
  }

  function editFeat(entry: CharacterFeatEntry) {
    if (!isFeatEligibleForCurrentEditor(entry.feat)) {
      return;
    }

    const pendingState = createPendingFeatStateForEntry(entry);

    if (!pendingState) {
      return;
    }

    setEditingFeatEntryId(entry.id);
    setPendingFeatState(pendingState);
  }

  function savePendingAbilityScoreImprovement() {
    const choice = pendingFeatState.abilityScoreImprovement;

    if (!choice) {
      return;
    }

    if (choice.mode === "split" && choice.primaryAbility === choice.secondaryAbility) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.ABILITY_SCORE_IMPROVEMENT, {
        abilityScoreImprovement: choice
      })
    );
  }

  function savePendingBoonOfIrresistibleOffense() {
    const choice = pendingFeatState.boonOfIrresistibleOffense;

    if (!choice) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.BOON_OF_IRRESISTIBLE_OFFENSE, {
        boonOfIrresistibleOffense: choice
      })
    );
  }

  function savePendingBoonOfEnergyResistanceChoice() {
    const choice = pendingFeatState.boonOfEnergyResistanceChoice;

    if (!choice) {
      return;
    }

    const boonOfEnergyResistance = decodePendingBoonOfEnergyResistanceChoice(choice);

    if (!boonOfEnergyResistance) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.BOON_OF_ENERGY_RESISTANCE, {
        boonOfEnergyResistance
      })
    );
  }

  function savePendingBoonOfSkillChoice() {
    const choice = pendingFeatState.boonOfSkillChoice;

    if (!choice) {
      return;
    }

    const boonOfSkill = decodePendingBoonOfSkillChoice(choice);

    if (!boonOfSkill) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.BOON_OF_SKILL, {
        boonOfSkill
      })
    );
  }

  function savePendingAthleteChoice() {
    const choice = pendingFeatState.athleteChoice;

    if (!choice) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.ATHLETE, {
        athlete: choice
      })
    );
  }

  function savePendingChargerChoice() {
    const choice = pendingFeatState.chargerChoice;

    if (!choice) {
      return;
    }

    const charger = decodePendingChargerChoice(choice);

    if (!charger) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.CHARGER, {
        charger
      })
    );
  }

  function savePendingChefChoice() {
    const choice = pendingFeatState.chefChoice;

    if (!choice) {
      return;
    }

    const chef = decodePendingChefChoice(choice);

    if (!chef) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.CHEF, {
        chef
      })
    );
  }

  function savePendingCrusherChoice() {
    const choice = pendingFeatState.crusherChoice;

    if (!choice) {
      return;
    }

    const crusher = decodePendingCrusherChoice(choice);

    if (!crusher) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.CRUSHER, {
        crusher
      })
    );
  }

  function savePendingDualWielderChoice() {
    const choice = pendingFeatState.dualWielderChoice;

    if (!choice) {
      return;
    }

    const dualWielder = decodePendingDualWielderChoice(choice);

    if (!dualWielder) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.DUAL_WIELDER, {
        dualWielder
      })
    );
  }

  function savePendingElementalAdeptChoice() {
    const choice = pendingFeatState.elementalAdeptChoice;

    if (!choice) {
      return;
    }

    const elementalAdept = decodePendingElementalAdeptChoice(choice);

    if (!elementalAdept) {
      return;
    }

    const duplicateEntry = featEditorDraftRef.current.feats.find(
      (entry) =>
        entry.id !== editingFeatEntryId &&
        entry.feat === FEATS.ELEMENTAL_ADEPT &&
        entry.elementalAdept?.damageType === elementalAdept.damageType
    );

    if (duplicateEntry) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.ELEMENTAL_ADEPT, {
        elementalAdept
      })
    );
  }

  function savePendingFeyTouchedChoice() {
    const choice = pendingFeatState.feyTouchedChoice;

    if (!choice) {
      return;
    }

    const feyTouched = decodePendingFeyTouchedChoice(choice);

    if (!feyTouched) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.FEY_TOUCHED, {
        feyTouched
      })
    );
  }

  function savePendingHeavilyArmoredChoice() {
    const choice = pendingFeatState.heavilyArmoredChoice;

    if (!choice) {
      return;
    }

    const heavilyArmored = decodePendingHeavilyArmoredChoice(choice);

    if (!heavilyArmored) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.HEAVILY_ARMORED, {
        heavilyArmored
      })
    );
  }

  function savePendingHeavyArmorMasterChoice() {
    const choice = pendingFeatState.heavyArmorMasterChoice;

    if (!choice) {
      return;
    }

    const heavyArmorMaster = decodePendingHeavyArmorMasterChoice(choice);

    if (!heavyArmorMaster) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.HEAVY_ARMOR_MASTER, {
        heavyArmorMaster
      })
    );
  }

  function savePendingInspiringLeaderChoice() {
    const choice = pendingFeatState.inspiringLeaderChoice;

    if (!choice) {
      return;
    }

    const inspiringLeader = decodePendingInspiringLeaderChoice(choice);

    if (!inspiringLeader) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.INSPIRING_LEADER, {
        inspiringLeader
      })
    );
  }

  function savePendingKeenMindChoice() {
    const choice = pendingFeatState.keenMindChoice;

    if (!choice) {
      return;
    }

    const keenMind = decodePendingKeenMindChoice(choice);

    if (!keenMind) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.KEEN_MIND, {
        keenMind
      })
    );
  }

  function savePendingLightlyArmoredChoice() {
    const choice = pendingFeatState.lightlyArmoredChoice;

    if (!choice) {
      return;
    }

    const lightlyArmored = decodePendingLightlyArmoredChoice(choice);

    if (!lightlyArmored) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.LIGHTLY_ARMORED, {
        lightlyArmored
      })
    );
  }

  function savePendingMageSlayerChoice() {
    const choice = pendingFeatState.mageSlayerChoice;

    if (!choice) {
      return;
    }

    const mageSlayer = decodePendingMageSlayerChoice(choice);

    if (!mageSlayer) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.MAGE_SLAYER, {
        mageSlayer
      })
    );
  }

  function savePendingMartialWeaponTrainingChoice() {
    const choice = pendingFeatState.martialWeaponTrainingChoice;

    if (!choice) {
      return;
    }

    const martialWeaponTraining = decodePendingMartialWeaponTrainingChoice(choice);

    if (!martialWeaponTraining) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.MARTIAL_WEAPON_TRAINING, {
        martialWeaponTraining
      })
    );
  }

  function savePendingMediumArmorMasterChoice() {
    const choice = pendingFeatState.mediumArmorMasterChoice;

    if (!choice) {
      return;
    }

    const mediumArmorMaster = decodePendingMediumArmorMasterChoice(choice);

    if (!mediumArmorMaster) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.MEDIUM_ARMOR_MASTER, {
        mediumArmorMaster
      })
    );
  }

  function savePendingModeratelyArmoredChoice() {
    const choice = pendingFeatState.moderatelyArmoredChoice;

    if (!choice) {
      return;
    }

    const moderatelyArmored = decodePendingModeratelyArmoredChoice(choice);

    if (!moderatelyArmored) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.MODERATELY_ARMORED, {
        moderatelyArmored
      })
    );
  }

  function savePendingMountedCombatantChoice() {
    const choice = pendingFeatState.mountedCombatantChoice;

    if (!choice) {
      return;
    }

    const mountedCombatant = decodePendingMountedCombatantChoice(choice);

    if (!mountedCombatant) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.MOUNTED_COMBATANT, {
        mountedCombatant
      })
    );
  }

  function savePendingObservantChoice() {
    const choice = pendingFeatState.observantChoice;

    if (!choice) {
      return;
    }

    const observant = decodePendingObservantChoice(choice);

    if (!observant) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.OBSERVANT, {
        observant
      })
    );
  }

  function savePendingPiercerChoice() {
    const choice = pendingFeatState.piercerChoice;

    if (!choice) {
      return;
    }

    const piercer = decodePendingPiercerChoice(choice);

    if (!piercer) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.PIERCER, {
        piercer
      })
    );
  }

  function savePendingPoisonerChoice() {
    const choice = pendingFeatState.poisonerChoice;

    if (!choice) {
      return;
    }

    const poisoner = decodePendingPoisonerChoice(choice);

    if (!poisoner) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.POISONER, {
        poisoner
      })
    );
  }

  function savePendingPolearmMasterChoice() {
    const choice = pendingFeatState.polearmMasterChoice;

    if (!choice) {
      return;
    }

    const polearmMaster = decodePendingPolearmMasterChoice(choice);

    if (!polearmMaster) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.POLEARM_MASTER, {
        polearmMaster
      })
    );
  }

  function savePendingRitualCasterChoice() {
    const choice = pendingFeatState.ritualCasterChoice;

    if (!choice) {
      return;
    }

    const ritualCaster = decodePendingRitualCasterChoice(choice, character.level);

    if (!ritualCaster) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.RITUAL_CASTER, {
        ritualCaster
      })
    );
  }

  function savePendingResilientChoice() {
    const choice = pendingFeatState.resilientChoice;

    if (!choice) {
      return;
    }

    const resilient = decodePendingResilientChoice(choice);

    if (!resilient) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.RESILIENT, {
        resilient
      })
    );
  }

  function savePendingSentinelChoice() {
    const choice = pendingFeatState.sentinelChoice;

    if (!choice) {
      return;
    }

    const sentinel = decodePendingSentinelChoice(choice);

    if (!sentinel) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.SENTINEL, {
        sentinel
      })
    );
  }

  function savePendingShadowTouchedChoice() {
    const choice = pendingFeatState.shadowTouchedChoice;

    if (!choice) {
      return;
    }

    const shadowTouched = decodePendingShadowTouchedChoice(choice);

    if (!shadowTouched) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.SHADOW_TOUCHED, {
        shadowTouched
      })
    );
  }

  function savePendingSlasherChoice() {
    const choice = pendingFeatState.slasherChoice;

    if (!choice) {
      return;
    }

    const slasher = decodePendingSlasherChoice(choice);

    if (!slasher) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.SLASHER, {
        slasher
      })
    );
  }

  function savePendingSpellSniperChoice() {
    const choice = pendingFeatState.spellSniperChoice;

    if (!choice) {
      return;
    }

    const spellSniper = decodePendingSpellSniperChoice(choice);

    if (!spellSniper) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.SPELL_SNIPER, {
        spellSniper
      })
    );
  }

  function savePendingTelekineticChoice() {
    const choice = pendingFeatState.telekineticChoice;

    if (!choice) {
      return;
    }

    const telekinetic = decodePendingTelekineticChoice(choice);

    if (!telekinetic) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.TELEKINETIC, {
        telekinetic
      })
    );
  }

  function savePendingTelepathicChoice() {
    const choice = pendingFeatState.telepathicChoice;

    if (!choice) {
      return;
    }

    const telepathic = decodePendingTelepathicChoice(choice);

    if (!telepathic) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.TELEPATHIC, {
        telepathic
      })
    );
  }

  function savePendingWarCasterChoice() {
    const choice = pendingFeatState.warCasterChoice;

    if (!choice) {
      return;
    }

    const warCaster = decodePendingWarCasterChoice(choice);

    if (!warCaster) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.WAR_CASTER, {
        warCaster
      })
    );
  }

  function savePendingSkillExpertChoice() {
    const choice = pendingFeatState.skillExpertChoice;

    if (!choice) {
      return;
    }

    const skillExpert = decodePendingSkillExpertChoice(choice);

    if (!skillExpert) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.SKILL_EXPERT, {
        skillExpert
      })
    );
  }

  function savePendingSpeedyChoice() {
    const choice = pendingFeatState.speedyChoice;

    if (!choice) {
      return;
    }

    const speedy = decodePendingSpeedyChoice(choice);

    if (!speedy) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.SPEEDY, {
        speedy
      })
    );
  }

  function savePendingWeaponMasterChoice() {
    const choice = pendingFeatState.weaponMasterChoice;

    if (!choice) {
      return;
    }

    const weaponMaster = decodePendingWeaponMasterChoice(choice);

    if (!weaponMaster) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.WEAPON_MASTER, {
        weaponMaster
      })
    );
  }

  function savePendingBlessedWarriorChoice() {
    const choice = pendingFeatState.blessedWarriorChoice;

    if (!choice) {
      return;
    }

    const blessedWarrior = decodePendingBlessedWarriorChoice(choice);

    if (!blessedWarrior) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.BLESSED_WARRIOR, {
        blessedWarrior
      })
    );
  }

  function savePendingDruidicWarriorChoice() {
    const choice = pendingFeatState.druidicWarriorChoice;

    if (!choice) {
      return;
    }

    const druidicWarrior = decodePendingDruidicWarriorChoice(choice);

    if (!druidicWarrior) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.DRUIDIC_WARRIOR, {
        druidicWarrior
      })
    );
  }

  function savePendingCrafterChoice() {
    const choice = pendingFeatState.crafterChoice;

    if (!choice) {
      return;
    }

    const crafter = decodePendingCrafterChoice(choice);

    if (!crafter) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.CRAFTER, {
        crafter
      })
    );
  }

  function savePendingCultOfDragonInitiateChoice() {
    const choice = pendingFeatState.cultOfDragonInitiateChoice;

    if (!choice) {
      return;
    }

    const cultOfDragonInitiate = decodePendingCultOfDragonInitiateChoice(
      choice,
      featEditorDraftRef.current.languageProficiencies,
      editingFeatEntryId
    );

    if (!cultOfDragonInitiate) {
      return;
    }

    const editingEntry = editingFeatEntryId
      ? featEditorDraftRef.current.feats.find((entry) => entry.id === editingFeatEntryId)
      : null;
    const inspiredByFearExpended =
      editingEntry?.feat === FEATS.CULT_OF_THE_DRAGON_INITIATE
        ? editingEntry.cultOfDragonInitiate?.inspiredByFearExpended
        : undefined;

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.CULT_OF_THE_DRAGON_INITIATE, {
        cultOfDragonInitiate: {
          ...cultOfDragonInitiate,
          ...(inspiredByFearExpended === undefined ? {} : { inspiredByFearExpended })
        }
      })
    );
  }

  function savePendingMagicInitiateChoice() {
    const choice = pendingFeatState.magicInitiateChoice;

    if (!choice) {
      return;
    }

    const magicInitiate = decodePendingMagicInitiateChoice(choice);

    if (!magicInitiate) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.MAGIC_INITIATE, {
        magicInitiate
      })
    );
  }

  function savePendingEmeraldEnclaveFledglingChoice() {
    const choice = pendingFeatState.emeraldEnclaveFledglingChoice;

    if (!choice) {
      return;
    }

    const emeraldEnclaveFledgling = decodePendingEmeraldEnclaveFledglingChoice(choice);

    if (!emeraldEnclaveFledgling) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.EMERALD_ENCLAVE_FLEDGLING, {
        emeraldEnclaveFledgling
      })
    );
  }

  function savePendingHarperAgentChoice() {
    const choice = pendingFeatState.harperAgentChoice;

    if (!choice) {
      return;
    }

    const harperAgent = decodePendingHarperAgentChoice(choice);

    if (!harperAgent) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.HARPER_AGENT, {
        harperAgent
      })
    );
  }

  function savePendingPurpleDragonRookChoice() {
    const choice = pendingFeatState.purpleDragonRookChoice;

    if (!choice) {
      return;
    }

    const purpleDragonRook = decodePendingPurpleDragonRookChoice(choice);

    if (!purpleDragonRook) {
      return;
    }

    const editingEntry = editingFeatEntryId
      ? featEditorDraftRef.current.feats.find((entry) => entry.id === editingFeatEntryId)
      : null;
    const rallyingCryExpended =
      editingEntry?.feat === FEATS.PURPLE_DRAGON_ROOK
        ? editingEntry.purpleDragonRook?.rallyingCryExpended
        : undefined;

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.PURPLE_DRAGON_ROOK, {
        purpleDragonRook: {
          ...purpleDragonRook,
          ...(rallyingCryExpended === undefined ? {} : { rallyingCryExpended })
        }
      })
    );
  }

  function savePendingSpellfireSparkChoice() {
    const choice = pendingFeatState.spellfireSparkChoice;

    if (!choice) {
      return;
    }

    const spellfireSpark = decodePendingSpellfireSparkChoice(choice);

    if (!spellfireSpark) {
      return;
    }

    const editingEntry = editingFeatEntryId
      ? featEditorDraftRef.current.feats.find((entry) => entry.id === editingFeatEntryId)
      : null;
    const spellfireFlameExpended =
      editingEntry?.feat === FEATS.SPELLFIRE_SPARK
        ? editingEntry.spellfireSpark?.spellfireFlameExpended
        : undefined;

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.SPELLFIRE_SPARK, {
        spellfireSpark: {
          ...spellfireSpark,
          ...(spellfireFlameExpended === undefined ? {} : { spellfireFlameExpended })
        }
      })
    );
  }

  function savePendingMusicianChoice() {
    const choice = pendingFeatState.musicianChoice;

    if (!choice) {
      return;
    }

    const musician = decodePendingMusicianChoice(choice);

    if (!musician) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.MUSICIAN, {
        musician
      })
    );
  }

  function savePendingEpicBoonAbilityChoice() {
    const choice = pendingFeatState.epicBoonAbilityChoice;

    if (!choice) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(choice.feat, {
        epicBoonAbilityChoice: {
          ability: choice.ability
        }
      })
    );
  }

  function savePendingSkilledChoice() {
    const choice = pendingFeatState.skilledChoice;

    if (!choice) {
      return;
    }

    const skilled = decodePendingSkilledChoice(choice);

    if (!skilled) {
      return;
    }

    upsertFeatForContext(
      createContextualFeatEntry(FEATS.SKILLED, {
        skilled
      })
    );
  }

  function toggleFeature(featureKey: string) {
    setExpandedFeatureKeys((current) =>
      current.includes(featureKey)
        ? current.filter((currentKey) => currentKey !== featureKey)
        : [...current, featureKey]
    );
  }

  function closeExpandedClassFeatures() {
    setExpandedFeatureKeys([]);
  }

  function renderCustomInvocationSelectionLabel() {
    return eldritchInvocationInputStatus.limit === null
      ? `${eldritchInvocationInputStatus.selectedCount}/Unlimited selected`
      : `${eldritchInvocationInputStatus.selectedCount}/${eldritchInvocationInputStatus.limit} selected`;
  }

  function renderClassNeutralMechanicsPanel() {
    if (!shouldRenderClassNeutralMechanics) {
      return null;
    }

    return (
      <div className={styles.customMechanicsList}>
        <div className={styles.featureChoiceRow}>
          <div className={styles.featureChoiceSummary}>
            <span className={styles.featureChoiceLabel}>Hit die</span>
            <span className={styles.featureChoiceValueText}>{selectedHitDie.toUpperCase()}</span>
          </div>
          <SelectInput
            compact
            value={selectedHitDie}
            onChange={(event) =>
              updateClassRulesConfig((currentConfig) => ({
                ...currentConfig,
                hitDie: event.target.value as CharacterClassRulesConfig["hitDie"]
              }))
            }
            aria-label="Class hit die"
          >
            {hitDieOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </div>

        <FeatureOptInToggle
          label="Extra Attacks"
          checked={mechanics.extraAttacks.enabled}
          onCheckedChange={(enabled) =>
            updateClassRulesConfig((currentConfig) => ({
              ...currentConfig,
              mechanics: {
                ...currentConfig.mechanics,
                extraAttacks: {
                  ...currentConfig.mechanics.extraAttacks,
                  enabled
                }
              }
            }))
          }
          metaItems={[
            {
              kind: "text",
              label: mechanics.extraAttacks.enabled
                ? `${extraAttackCount} extra ${extraAttackCount === 1 ? "attack" : "attacks"}`
                : "Off"
            }
          ]}
        />
        {mechanics.extraAttacks.enabled ? (
          <div className={styles.featureChoiceRow}>
            <div className={styles.featureChoiceSummary}>
              <span className={styles.featureChoiceLabel}>Extra attacks per turn</span>
              <span className={styles.featureChoiceValueText}>{extraAttackCount}</span>
            </div>
            <SelectInput
              compact
              value={extraAttackCount}
              onChange={(event) =>
                updateClassRulesConfig((currentConfig) => ({
                  ...currentConfig,
                  mechanics: {
                    ...currentConfig.mechanics,
                    extraAttacks: {
                      ...currentConfig.mechanics.extraAttacks,
                      count: Number(event.target.value)
                    }
                  }
                }))
              }
              aria-label="Extra attacks per turn"
            >
              {customExtraAttackCountOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </SelectInput>
          </div>
        ) : null}

        <FeatureOptInToggle
          label="Eldritch Invocations"
          checked={isEldritchInvocationMechanicChecked}
          disabled={isEldritchInvocationMechanicLocked}
          onCheckedChange={(enabled) =>
            updateClassRulesConfig((currentConfig) => ({
              ...currentConfig,
              mechanics: {
                ...currentConfig.mechanics,
                eldritchInvocations: {
                  ...currentConfig.mechanics.eldritchInvocations,
                  enabled
                }
              }
            }))
          }
          metaItems={[
            {
              kind: "text",
              label: isEldritchInvocationMechanicChecked
                ? renderCustomInvocationSelectionLabel()
                : "Off"
            }
          ]}
        />
        {isEldritchInvocationMechanicChecked ? (
          <>
            <div className={styles.featureChoiceRow}>
              <div className={styles.featureChoiceSummary}>
                <span className={styles.featureChoiceLabel}>Selected invocations</span>
                <span className={styles.featureChoiceValueText}>
                  {renderCustomInvocationSelectionLabel()}
                </span>
              </div>
              <SheetActionButton
                onClick={openEldritchInvocationEditor}
                disabled={isEldritchInvocationModalOpen}
              >
                <Pencil size={16} />
                Edit
              </SheetActionButton>
            </div>
            <EldritchInvocationList
              invocations={learnedInvocationOptions}
              onOpenInvocationReference={openInvocationReference}
              renderTrackingButton={renderTrackingButton}
            />
          </>
        ) : null}

        <FeatureOptInToggle
          label="Spellcasting"
          checked={isSpellcastingMechanicChecked}
          disabled={isSpellcastingMechanicLocked}
          onCheckedChange={(enabled) =>
            updateClassRulesConfig((currentConfig) => ({
              ...currentConfig,
              mechanics: {
                ...currentConfig.mechanics,
                spellcasting: {
                  enabled
                }
              }
            }))
          }
          metaItems={[
            {
              kind: "text",
              label: isSpellcastingMechanicChecked ? selectedSpellcastingAbility : "Off"
            }
          ]}
        />
        {isNeutralSpellcastingAbilityVisible ? (
          <div className={styles.featureChoiceRow}>
            <div className={styles.featureChoiceSummary}>
              <span className={styles.featureChoiceLabel}>Spellcasting ability</span>
              <span className={styles.featureChoiceValueText}>{selectedSpellcastingAbility}</span>
            </div>
            <SelectInput
              compact
              value={selectedSpellcastingAbility}
              onChange={(event) =>
                updateClassRulesConfig((currentConfig) => ({
                  ...currentConfig,
                  spellcastingAbility: event.target.value as AbilityKey
                }))
              }
              aria-label="Spellcasting ability"
            >
              {abilityKeys.map((ability) => (
                <option key={ability} value={ability}>
                  {ability}
                </option>
              ))}
            </SelectInput>
          </div>
        ) : null}
      </div>
    );
  }

  const renderTrackingButton: TrackingButtonRenderer = (trackingState, trackingMessage) => {
    return (
      <FeatureTrackingBadgeButton
        trackingState={trackingState}
        trackingMessage={trackingMessage}
        onClick={(nextTrackingState, nextTrackingMessage) =>
          openKeyword(nextTrackingState, undefined, nextTrackingMessage)
        }
      />
    );
  };

  return (
    <>
      <article className={clsx(shared.sectionCard, className)}>
        <div className={clsx(shared.sectionHeader, styles.buildSectionHeader)}>
          <div className={styles.buildHeaderContent}>
            <div className={shared.eyebrowHelpRow}>
              <p className={clsx(shared.eyebrow, shared.eyebrowInHelpRow)}>Build</p>
              <button
                type="button"
                className={shared.helpButton}
                onClick={() => setIsGuideOpen(true)}
                aria-label="Open class features guide"
                title="Open class features guide"
              >
                <CircleHelp size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.sectionStack}>
          <section className={styles.subsection} aria-labelledby="character-species-title">
            <div className={styles.subsectionHeader}>
              <h3 id="character-species-title" className={styles.subsectionTitle}>
                Species
              </h3>
              <SheetActionButton
                onClick={() => setIsSpeciesModalOpen(true)}
                disabled={isSpeciesModalOpen}
              >
                <Pencil size={16} />
                Edit
              </SheetActionButton>
            </div>
            <SpeciesBuildCard
              character={character}
              onOpenReference={speciesEntry ? openSpeciesReference : undefined}
            />
          </section>

          <section className={styles.subsection} aria-labelledby="character-feats-title">
            <div className={styles.subsectionHeader}>
              <h3 id="character-feats-title" className={styles.subsectionTitle}>
                Feats
              </h3>
              <SheetActionButton onClick={openFeatEditor} disabled={isFeatModalOpen}>
                <Pencil size={16} />
                Edit
              </SheetActionButton>
            </div>
            <FeatList
              feats={selectedFeats}
              emptyText="No feats added yet."
              onOpenFeatReference={openFeatReference}
              renderTrackingButton={renderTrackingButton}
            />
          </section>

          <section className={styles.subsection} aria-labelledby="character-class-features-title">
            <div className={styles.subsectionHeader}>
              <div className={styles.subsectionHeaderText}>
                <div className={styles.subsectionTitleRow}>
                  <h3 id="character-class-features-title" className={styles.subsectionTitle}>
                    Class Features
                  </h3>
                  {hasExpandedVisibleClassFeature ? (
                    <InlineToggleButton
                      label="Close Expanded Items"
                      onClick={closeExpandedClassFeatures}
                    />
                  ) : null}
                </div>
                <p className={styles.subsectionMeta}>
                  {isCustomClass ? "Custom class mechanics" : `Subclass: ${selectedSubclassLabel}`}
                </p>
              </div>
              <SheetActionButton
                onClick={() => setIsSubclassModalOpen(true)}
                disabled={isSubclassModalOpen}
              >
                <Pencil size={16} />
                Edit
              </SheetActionButton>
            </div>

            {renderClassNeutralMechanicsPanel()}

            {unlockedFeatures.length > 0 ? (
              <>
                <ClassFeatureList
                  character={character}
                  features={unlockedFeatures}
                  expandedFeatureKeys={expandedFeatureKeys}
                  onToggleFeature={toggleFeature}
                  getLinkedFeatForFeature={getLinkedFeatForFeature}
                  onOpenFeatEditorForFeature={openFeatEditorForFeature}
                  onOpenKeyword={openKeyword}
                  onOpenFeatReference={openFeatReference}
                  onOpenSpellReference={openSpellReference}
                  onOpenDivinityReference={openDivinityReference}
                  onOpenInvocationReference={openInvocationReference}
                  onOpenEldritchInvocationEditor={openEldritchInvocationEditor}
                  onPersistCharacter={onPersistCharacter}
                  renderTrackingButton={renderTrackingButton}
                  eldritchInvocationInputStatus={eldritchInvocationInputStatus}
                  learnedInvocationOptions={learnedInvocationOptions}
                  getCharacterFeatSummary={(entry) =>
                    entry ? getCharacterFeatSummary(entry) : null
                  }
                  getFeatDefinition={getFeatDefinition}
                />

                {futureFeatures.length > 0 ? (
                  <>
                    <InlineToggleButton
                      label={
                        isFutureFeaturesVisible
                          ? "Hide unlockable features"
                          : "Show unlockable features"
                      }
                      expanded={isFutureFeaturesVisible}
                      onClick={() => setIsFutureFeaturesVisible((current) => !current)}
                    />
                    {isFutureFeaturesVisible ? (
                      <ClassFeatureList
                        character={character}
                        features={futureFeatures}
                        expandedFeatureKeys={expandedFeatureKeys}
                        onToggleFeature={toggleFeature}
                        getLinkedFeatForFeature={getLinkedFeatForFeature}
                        onOpenFeatEditorForFeature={openFeatEditorForFeature}
                        onOpenKeyword={openKeyword}
                        onOpenFeatReference={openFeatReference}
                        onOpenSpellReference={openSpellReference}
                        onOpenDivinityReference={openDivinityReference}
                        onOpenInvocationReference={openInvocationReference}
                        onOpenEldritchInvocationEditor={openEldritchInvocationEditor}
                        onPersistCharacter={onPersistCharacter}
                        renderTrackingButton={renderTrackingButton}
                        eldritchInvocationInputStatus={eldritchInvocationInputStatus}
                        learnedInvocationOptions={learnedInvocationOptions}
                        getCharacterFeatSummary={(entry) =>
                          entry ? getCharacterFeatSummary(entry) : null
                        }
                        getFeatDefinition={getFeatDefinition}
                      />
                    ) : null}
                  </>
                ) : null}
              </>
            ) : classEntry ? (
              <p className={shared.emptyText}>
                No class features are available for this level yet.
              </p>
            ) : shouldRenderClassNeutralMechanics ? null : (
              <p className={shared.emptyText}>
                No class feature progression is available for this class yet.
              </p>
            )}
          </section>
        </div>
      </article>

      {isGuideOpen ? <ClassFeaturesGuideModal onClose={() => setIsGuideOpen(false)} /> : null}

      {isSpeciesModalOpen ? (
        <SpeciesEditorModal
          character={character}
          onCancel={() => setIsSpeciesModalOpen(false)}
          onSave={saveSpecies}
        />
      ) : null}

      {isSubclassModalOpen ? (
        <SubclassEditorModal
          character={character}
          onCancel={() => setIsSubclassModalOpen(false)}
          onSave={saveSubclass}
        />
      ) : null}

      {isFeatModalOpen ? (
        <FeatEditorModal
          context={featEditorContext}
          activeFeatCategory={activeFeatCategory}
          characterLevel={character.level}
          visibleFeatCategories={visibleFeatCategories}
          visibleFeatDefinitionsByCategory={visibleFeatDefinitionsByCategory}
          featEligibilityByFeat={featEligibilityByFeat}
          skillProficiencies={featEditorDraft.skillProficiencies}
          savingThrowProficiencies={featEditorDraft.savingThrowProficiencies}
          weaponProficiencies={featEditorDraft.weaponProficiencies}
          toolProficiencies={featEditorDraft.toolProficiencies}
          languageProficiencies={featEditorDraft.languageProficiencies}
          selectedFeats={featEditorDraft.feats}
          editingFeatEntryId={editingFeatEntryId}
          pendingFeatState={pendingFeatState}
          blessedWarriorCantripOptions={blessedWarriorCantripOptions}
          druidicWarriorCantripOptions={druidicWarriorCantripOptions}
          onClose={closeFeatEditor}
          onSelectCategory={setActiveFeatCategory}
          onAddFeat={addFeat}
          onEditFeat={editFeat}
          onRemoveFeat={removeFeat}
          onOpenFeatReference={openFeatReference}
          onPendingFeatStateChange={setPendingFeatState}
          renderTrackingButton={renderTrackingButton}
          onSavePendingAbilityScoreImprovement={savePendingAbilityScoreImprovement}
          onSavePendingAthleteChoice={savePendingAthleteChoice}
          onSavePendingChargerChoice={savePendingChargerChoice}
          onSavePendingChefChoice={savePendingChefChoice}
          onSavePendingCrusherChoice={savePendingCrusherChoice}
          onSavePendingDualWielderChoice={savePendingDualWielderChoice}
          onSavePendingElementalAdeptChoice={savePendingElementalAdeptChoice}
          onSavePendingFeyTouchedChoice={savePendingFeyTouchedChoice}
          onSavePendingHeavilyArmoredChoice={savePendingHeavilyArmoredChoice}
          onSavePendingHeavyArmorMasterChoice={savePendingHeavyArmorMasterChoice}
          onSavePendingInspiringLeaderChoice={savePendingInspiringLeaderChoice}
          onSavePendingKeenMindChoice={savePendingKeenMindChoice}
          onSavePendingLightlyArmoredChoice={savePendingLightlyArmoredChoice}
          onSavePendingMageSlayerChoice={savePendingMageSlayerChoice}
          onSavePendingMartialWeaponTrainingChoice={savePendingMartialWeaponTrainingChoice}
          onSavePendingMediumArmorMasterChoice={savePendingMediumArmorMasterChoice}
          onSavePendingModeratelyArmoredChoice={savePendingModeratelyArmoredChoice}
          onSavePendingMountedCombatantChoice={savePendingMountedCombatantChoice}
          onSavePendingObservantChoice={savePendingObservantChoice}
          onSavePendingPiercerChoice={savePendingPiercerChoice}
          onSavePendingPoisonerChoice={savePendingPoisonerChoice}
          onSavePendingPolearmMasterChoice={savePendingPolearmMasterChoice}
          onSavePendingRitualCasterChoice={savePendingRitualCasterChoice}
          onSavePendingResilientChoice={savePendingResilientChoice}
          onSavePendingSentinelChoice={savePendingSentinelChoice}
          onSavePendingShadowTouchedChoice={savePendingShadowTouchedChoice}
          onSavePendingSlasherChoice={savePendingSlasherChoice}
          onSavePendingSpellSniperChoice={savePendingSpellSniperChoice}
          onSavePendingTelekineticChoice={savePendingTelekineticChoice}
          onSavePendingTelepathicChoice={savePendingTelepathicChoice}
          onSavePendingWarCasterChoice={savePendingWarCasterChoice}
          onSavePendingSkillExpertChoice={savePendingSkillExpertChoice}
          onSavePendingSpeedyChoice={savePendingSpeedyChoice}
          onSavePendingWeaponMasterChoice={savePendingWeaponMasterChoice}
          onSavePendingBoonOfEnergyResistanceChoice={savePendingBoonOfEnergyResistanceChoice}
          onSavePendingBoonOfIrresistibleOffense={savePendingBoonOfIrresistibleOffense}
          onSavePendingBoonOfSkillChoice={savePendingBoonOfSkillChoice}
          onSavePendingBlessedWarriorChoice={savePendingBlessedWarriorChoice}
          onSavePendingCultOfDragonInitiateChoice={savePendingCultOfDragonInitiateChoice}
          onSavePendingEmeraldEnclaveFledglingChoice={savePendingEmeraldEnclaveFledglingChoice}
          onSavePendingHarperAgentChoice={savePendingHarperAgentChoice}
          onSavePendingPurpleDragonRookChoice={savePendingPurpleDragonRookChoice}
          onSavePendingSpellfireSparkChoice={savePendingSpellfireSparkChoice}
          onSavePendingCrafterChoice={savePendingCrafterChoice}
          onSavePendingDruidicWarriorChoice={savePendingDruidicWarriorChoice}
          onSavePendingEpicBoonAbilityChoice={savePendingEpicBoonAbilityChoice}
          onSavePendingMagicInitiateChoice={savePendingMagicInitiateChoice}
          onSavePendingMusicianChoice={savePendingMusicianChoice}
          onSavePendingSkilledChoice={savePendingSkilledChoice}
        />
      ) : null}

      {isEldritchInvocationModalOpen ? (
        <EldritchInvocationEditorModal
          character={character}
          selectedInvocationIds={selectedInvocationIds}
          onClose={closeEldritchInvocationEditor}
          onOpenInvocationReference={openInvocationReference}
          renderTrackingButton={renderTrackingButton}
        />
      ) : null}

      {selectedSpeciesEntry ? (
        <SpeciesReferenceDrawer
          speciesEntry={selectedSpeciesEntry}
          onClose={() => setIsSpeciesReferenceOpen(false)}
          renderTrackingButton={renderTrackingButton}
          onOpenKeyword={openKeyword}
          onOpenFeatReference={openFeatReference}
          onOpenSpellReference={openSpellReference}
          onOpenDivinityReference={openDivinityReference}
        />
      ) : null}

      {selectedFeatReference && selectedFeatDefinition ? (
        <FeatReferenceDrawer
          selectedFeatReference={selectedFeatReference}
          featDefinition={selectedFeatDefinition}
          onClose={() => setSelectedFeatReference(null)}
          renderTrackingButton={renderTrackingButton}
          onOpenKeyword={openKeyword}
          onOpenFeatReference={openFeatReference}
          onOpenSpellReference={openSpellReference}
          onOpenDivinityReference={openDivinityReference}
          getCharacterFeatSummary={(entry) => (entry ? getCharacterFeatSummary(entry) : null)}
        />
      ) : null}

      {selectedInvocationReference ? (
        <EldritchInvocationReferenceDrawer
          option={selectedInvocationReference}
          onClose={() => setSelectedInvocationReference(null)}
          backdropClassName={
            isEldritchInvocationModalOpen ? styles.referenceDrawerBackdrop : undefined
          }
        />
      ) : null}

      {selectedKeyword ? (
        <KeywordReferenceDrawer
          title={selectedKeyword.title}
          entries={[
            {
              title: selectedKeyword.title,
              description: selectedKeyword.description,
              trackingMessage: selectedKeyword.trackingMessage
            }
          ]}
          badgeLabel="Keyword"
          backdropClassName={styles.referenceDrawerBackdrop}
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          character={character}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
    </>
  );
}

export default ClassFeaturesAndFeats;
