import clsx from "clsx";
import { ChevronDown, CircleHelp, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CLASS_FEATURE,
  FEAT_CATEGORY,
  FEATS,
  FeatureMap,
  TRACKER,
  type ClassEntry,
  type DivinityEntry,
  type FeatureMapEntry,
  type SpellEntry
} from "../../../../codex/entries";
import { getClassEntries } from "../../../../codex/selectors";
import { getMonkDeflectAttacksDescription } from "../../../../codex/classes/monk";
import {
  getBlessedWarriorCantripOptions,
  getCharacterFeatSummary,
  getDruidicWarriorCantripOptions,
  getFeatDefinition,
  getFeatDefinitionsByCategory
} from "../../../../pages/CharactersPage/feats";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getSelectedSubclassForCharacter,
  getSubclassFeatureDetails,
  getSubclassFeatureRowsForCharacter
} from "../../../../pages/CharactersPage/subclasses";
import type { Character, CharacterFeatEntry } from "../../../../types";
import { resolveKeywordReference } from "../../../../utils/codex/renderCodexRichText";
import CodexDivinityDrawer from "../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../CodexPage/CodexSpellDrawer";
import { FeatureTrackingBadgeButton } from "../../../FeatureDisclosure";
import KeywordReferenceDrawer from "../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import InlineToggleButton from "../InlineToggleButton";
import ClassFeatureList from "./ClassFeatureList";
import ClassFeaturesGuideModal from "./ClassFeaturesGuideModal";
import FeatEditorModal from "./FeatEditorModal";
import FeatList from "./FeatList";
import FeatReferenceDrawer from "./FeatReferenceDrawer";
import {
  createEmptyPendingFeatState,
  createPendingFeatStateForFeat,
  decodePendingBlessedWarriorChoice,
  decodePendingDruidicWarriorChoice,
  decodePendingSkilledChoice
} from "./featEditorUtils";
import {
  applyFeatEditorDraftToCharacter,
  createFeatEditorDraft,
  removeFeatFromDraft,
  upsertFeatInDraft
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
  FeatureRow,
  PendingFeatState,
  SelectedDivinityReference,
  SelectedFeatReference,
  SelectedKeyword,
  SelectedSpellReference,
  TrackingButtonRenderer
} from "./types";

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

function ClassFeaturesAndFeats({
  character,
  className,
  onPersistCharacter
}: ClassFeaturesAndFeatsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFutureFeaturesVisible, setIsFutureFeaturesVisible] = useState(false);
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<string[]>([]);
  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);
  const [featEditorContext, setFeatEditorContext] = useState<FeatEditorContext>({
    mode: "general"
  });
  const [activeFeatCategory, setActiveFeatCategory] = useState<FEAT_CATEGORY>(
    FEAT_CATEGORY.GENERAL
  );
  const [pendingFeatState, setPendingFeatState] = useState<PendingFeatState>(
    createEmptyPendingFeatState
  );
  const [featEditorDraft, setFeatEditorDraft] = useState(() => createFeatEditorDraft(character));
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
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
  const selectedFeatDefinition = selectedFeatReference
    ? getFeatDefinition(selectedFeatReference.feat)
    : null;
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
      featCategoryTabs.reduce<Record<FEAT_CATEGORY, (typeof featDefinitionsByCategory)[FEAT_CATEGORY.GENERAL]>>(
        (groups, category) => {
          const additionalFightingStyleFeatSet = new Set(fightingStyleExtraFeatOptions);

          groups[category] = featDefinitionsByCategory[category].filter((definition) => {
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
          });

          return groups;
        },
        {
          [FEAT_CATEGORY.ORIGIN]: [],
          [FEAT_CATEGORY.GENERAL]: [],
          [FEAT_CATEGORY.FIGHTING_STYLE]: [],
          [FEAT_CATEGORY.EPIC_BOON]: []
        }
      ),
    [character.className, featDefinitionsByCategory, featEditorContext, fightingStyleExtraFeatOptions]
  );
  const visibleFeatCategories = useMemo(
    () =>
      featCategoryTabs.filter((category) => visibleFeatDefinitionsByCategory[category].length > 0),
    [visibleFeatDefinitionsByCategory]
  );

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

  function getLinkedFeatForFeature(
    level: number,
    feature: CLASS_FEATURE
  ): CharacterFeatEntry | null {
    return (
      selectedFeats.find((entry) => isFeatFromClassFeatureSource(entry, level, feature)) ?? null
    );
  }

  function upsertFeatForContext(featEntry: CharacterFeatEntry) {
    const sourceContext = getClassFeatureSourceContext();
    const nextDraft = upsertFeatInDraft(featEditorDraft, featEntry, sourceContext);

    setFeatEditorDraft(nextDraft);

    if (sourceContext) {
      closeFeatEditor(nextDraft);
      return;
    }

    resetPendingFeatState();
  }

  function removeFeat(entryToRemove: CharacterFeatEntry) {
    setFeatEditorDraft((currentDraft) => removeFeatFromDraft(currentDraft, entryToRemove));

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

  function openSpellReference(spell: SpellEntry) {
    setSelectedSpellReference(spell);
  }

  function openDivinityReference(divinity: DivinityEntry) {
    setSelectedDivinityReference(divinity);
  }

  function closeFeatEditor(draft = featEditorDraft) {
    onPersistCharacter((currentCharacter) =>
      applyFeatEditorDraftToCharacter(currentCharacter, draft)
    );
    resetPendingFeatState();
    setFeatEditorContext({ mode: "general" });
    setIsFeatModalOpen(false);
  }

  function openFeatEditor() {
    resetPendingFeatState();
    resetFeatEditorDraft();
    setFeatEditorContext({ mode: "general" });
    setActiveFeatCategory(FEAT_CATEGORY.GENERAL);
    setIsFeatModalOpen(true);
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
    const pendingState = createPendingFeatStateForFeat(feat);

    if (pendingState) {
      setPendingFeatState(pendingState);
      return;
    }

    upsertFeatForContext(createContextualFeatEntry(feat));
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
            <h2 className={shared.title}>Class Features &amp; Feats</h2>
            <p className={shared.helperText}>
              Review unlocked class features and manage feat selections for your build.
            </p>
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
              <h3 id="character-class-features-title" className={styles.subsectionTitle}>
                Class Features
              </h3>
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
                  onPersistCharacter={onPersistCharacter}
                  renderTrackingButton={renderTrackingButton}
                  getCharacterFeatSummary={(entry) => (entry ? getCharacterFeatSummary(entry) : null)}
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
                        onPersistCharacter={onPersistCharacter}
                        renderTrackingButton={renderTrackingButton}
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

      {isFeatModalOpen ? (
        <FeatEditorModal
          context={featEditorContext}
          activeFeatCategory={activeFeatCategory}
          visibleFeatCategories={visibleFeatCategories}
          visibleFeatDefinitionsByCategory={visibleFeatDefinitionsByCategory}
          selectedFeats={featEditorDraft.feats}
          pendingFeatState={pendingFeatState}
          blessedWarriorCantripOptions={blessedWarriorCantripOptions}
          druidicWarriorCantripOptions={druidicWarriorCantripOptions}
          onClose={closeFeatEditor}
          onSelectCategory={setActiveFeatCategory}
          onAddFeat={addFeat}
          onRemoveFeat={removeFeat}
          onOpenFeatReference={openFeatReference}
          onPendingFeatStateChange={setPendingFeatState}
          renderTrackingButton={renderTrackingButton}
          onSavePendingAbilityScoreImprovement={savePendingAbilityScoreImprovement}
          onSavePendingBoonOfIrresistibleOffense={savePendingBoonOfIrresistibleOffense}
          onSavePendingBlessedWarriorChoice={savePendingBlessedWarriorChoice}
          onSavePendingDruidicWarriorChoice={savePendingDruidicWarriorChoice}
          onSavePendingEpicBoonAbilityChoice={savePendingEpicBoonAbilityChoice}
          onSavePendingSkilledChoice={savePendingSkilledChoice}
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
