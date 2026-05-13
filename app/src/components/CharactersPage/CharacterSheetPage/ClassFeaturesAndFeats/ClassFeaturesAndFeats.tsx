import clsx from "clsx";
import { ChevronDown, CircleHelp, Pencil } from "lucide-react";
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
import { fetchItemByKey } from "../../../../api";
import { getFeatEligibilityForCharacter } from "../../../../pages/CharactersPage/feats/eligibility";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getSelectedSubclassForCharacter,
  getSubclassOptionsForClassName,
  getSubclassFeatureDetails,
  getSubclassFeatureRowsForCharacter
} from "../../../../pages/CharactersPage/subclasses";
import type {
  Character,
  CharacterFeatEntry,
  CharacterSpeciesChoices,
  ItemRecord
} from "../../../../types";
import {
  normalizeCharacterSpeciesChoices,
  normalizeCharacterSpeciesFeatureState,
  normalizeSpeciesStatusEntriesForCharacter,
  reconcileHumanOriginFeatEntries
} from "../../../../pages/CharactersPage/species";
import { resolveKeywordReference } from "../../../../utils/codex/renderCodexRichText";
import CodexDivinityDrawer from "../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../CodexPage/CodexSpellDrawer";
import { FeatureTrackingBadgeButton } from "../../../FeatureDisclosure";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import InlineToggleButton from "../InlineToggleButton";
import ClassFeatureList from "./ClassFeatureList";
import ClassFeaturesGuideModal from "./ClassFeaturesGuideModal";
import EldritchInvocationEditorModal from "./EldritchInvocationEditorModal";
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
  decodePendingCrusherChoice,
  decodePendingDualWielderChoice,
  decodePendingElementalAdeptChoice,
  decodePendingFeyTouchedChoice,
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
  decodePendingRitualCasterChoice,
  decodePendingResilientChoice,
  decodePendingSentinelChoice,
  decodePendingShadowTouchedChoice,
  decodePendingSlasherChoice,
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
  const [isExpanded, setIsExpanded] = useState(true);
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
  const selectedSubclass = useMemo(
    () =>
      getSelectedSubclassForCharacter({
        className: character.className,
        subclassId: character.subclassId
      }),
    [character.className, character.subclassId]
  );
  const subclassOptions = useMemo(
    () => getSubclassOptionsForClassName(character.className),
    [character.className]
  );
  const selectedSubclassLabel = selectedSubclass?.name ?? "No subclass selected";
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
  const selectedFeatDefinition = selectedFeatReference
    ? getFeatDefinition(selectedFeatReference.feat)
    : null;
  const speciesEntry = useMemo(() => getSpeciesEntryByName(character.species), [character.species]);
  const selectedSpeciesEntry = isSpeciesReferenceOpen ? speciesEntry : null;
  const fightingStyleExtraFeatOptions = useMemo(() => {
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
  }, [character.className, featEditorContext]);
  const visibleFeatDefinitionsByCategory = useMemo(
    () =>
      featCategoryTabs.reduce<
        Record<FEAT_CATEGORY, (typeof featDefinitionsByCategory)[FEAT_CATEGORY.GENERAL]>
      >(
        (groups, category) => {
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
        },
        {
          [FEAT_CATEGORY.ORIGIN]: [],
          [FEAT_CATEGORY.GENERAL]: [],
          [FEAT_CATEGORY.FIGHTING_STYLE]: [],
          [FEAT_CATEGORY.EPIC_BOON]: []
        }
      ),
    [
      character.className,
      featDefinitionsByCategory,
      featEditorContext,
      fightingStyleExtraFeatOptions
    ]
  );
  const visibleFeatCategories = useMemo(
    () =>
      featCategoryTabs.filter((category) => visibleFeatDefinitionsByCategory[category].length > 0),
    [visibleFeatDefinitionsByCategory]
  );
  const featEligibilityCharacter = useMemo<Character>(
    () => ({
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
    }),
    [character, featEditorContext, featEditorDraft]
  );
  const featEligibilityByFeat = useMemo<FeatEligibilityByFeat>(() => {
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
    if (isExpanded) {
      return;
    }

    setExpandedFeatureKeys([]);
    setIsFutureFeaturesVisible(false);
  }, [isExpanded]);

  useEffect(() => {
    if (visibleFeatCategories.includes(activeFeatCategory)) {
      return;
    }

    setActiveFeatCategory(visibleFeatCategories[0] ?? FEAT_CATEGORY.GENERAL);
  }, [activeFeatCategory, visibleFeatCategories]);

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

    return definition
      ? getFeatEligibilityForCharacter(featEligibilityCharacter, definition).isEligible
      : false;
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

  function openKeyword(keywordKey: string, title?: string) {
    const resolvedKeyword = resolveKeywordReference(keywordKey, title);

    if (!resolvedKeyword) {
      return;
    }

    setSelectedKeyword({
      key: keywordKey,
      title: resolvedKeyword.title,
      description: resolvedKeyword.description
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

  function saveSpecies(species: string, speciesChoices?: CharacterSpeciesChoices) {
    setIsSpeciesModalOpen(false);
    onPersistCharacter((currentCharacter) => {
      const normalizedSpecies = species.trim();
      const normalizedChoices = normalizeCharacterSpeciesChoices(normalizedSpecies, speciesChoices);

      return {
        ...currentCharacter,
        species: normalizedSpecies,
        speciesChoices: normalizedChoices,
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

  function saveSubclass(subclassId: string) {
    setIsSubclassModalOpen(false);
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      subclassId,
      classFeatureState: normalizeCharacterClassFeatureState(currentCharacter.classFeatureState, {
        className: currentCharacter.className,
        level: currentCharacter.level,
        subclassId,
        abilities: currentCharacter.abilities,
        cantripIds: currentCharacter.cantripIds,
        feats: currentCharacter.feats
      })
    }));
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
        console.error("Failed to fetch Pact of the Blade conjured weapon.", error);
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

    const pendingState = createPendingFeatStateForFeat(feat);

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

  function toggleSection() {
    setIsExpanded((current) => !current);
  }

  const renderTrackingButton: TrackingButtonRenderer = (trackingState) => {
    return <FeatureTrackingBadgeButton trackingState={trackingState} onClick={openKeyword} />;
  };

  return (
    <>
      <article className={clsx(shared.sectionCard, className)}>
        <div className={clsx(shared.sectionHeader, styles.buildSectionHeader)}>
          <div className={styles.buildHeaderContent}>
            <div className={styles.buildHeading}>
              <p className={shared.eyebrow}>Build</p>
              <button
                type="button"
                className={styles.helpButton}
                onClick={() => setIsGuideOpen(true)}
                aria-label="Open class features guide"
                title="Open class features guide"
              >
                <CircleHelp size={16} />
              </button>
            </div>
          </div>
          <button
            type="button"
            className={styles.sectionCollapseButton}
            onClick={toggleSection}
            aria-expanded={isExpanded}
            aria-controls="class-features-and-feats-content"
            aria-label={isExpanded ? "Collapse build section" : "Expand build section"}
          >
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={clsx(
                styles.sectionCollapseIcon,
                !isExpanded && styles.sectionCollapseIconCollapsed
              )}
            />
          </button>
        </div>

        {isExpanded ? (
          <div id="class-features-and-feats-content" className={styles.sectionStack}>
            <section className={styles.subsection} aria-labelledby="character-species-title">
              <div className={styles.subsectionHeader}>
                <h3 id="character-species-title" className={styles.subsectionTitle}>
                  Species
                </h3>
                <button
                  type="button"
                  className={shared.editButton}
                  onClick={() => setIsSpeciesModalOpen(true)}
                  disabled={isSpeciesModalOpen}
                >
                  <Pencil size={16} />
                  Edit
                </button>
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
                <button
                  type="button"
                  className={shared.editButton}
                  onClick={openFeatEditor}
                  disabled={isFeatModalOpen}
                >
                  <Pencil size={16} />
                  Edit
                </button>
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
                  <h3 id="character-class-features-title" className={styles.subsectionTitle}>
                    Class Features
                  </h3>
                  <p className={styles.subsectionMeta}>Subclass: {selectedSubclassLabel}</p>
                </div>
                <button
                  type="button"
                  className={shared.editButton}
                  onClick={() => setIsSubclassModalOpen(true)}
                  disabled={isSubclassModalOpen || subclassOptions.length === 0}
                >
                  <Pencil size={16} />
                  Edit
                </button>
              </div>

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
              ) : (
                <p className={shared.emptyText}>
                  {classEntry
                    ? "No class features are available for this level yet."
                    : "No class feature progression is available for this class yet."}
                </p>
              )}
            </section>
          </div>
        ) : null}
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
              description: selectedKeyword.description
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
