import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import CodexDivinityDrawer from "../../components/CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexFeatDrawer from "../../components/CodexPage/CodexFeatDrawer/CodexFeatDrawer";
import CodexSpellDrawer from "../../components/CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import ClassProgressionTable from "../../components/CodexPage/ClassProgressionTable";
import CellContainer from "../../components/CellContainer/CellContainer";
import {
  FeatureDisclosureRow,
  FeatureDisclosureSection,
  FeatureTrackingBadgeButton,
  featureDisclosureStyles
} from "../../components/FeatureDisclosure";
import RarityPill from "../../components/CodexPage/RarityPill";
import KeywordReferenceDrawer from "../../components/KeywordReferenceDrawer/KeywordReferenceDrawer";
import SpellDescriptionContent from "../../components/SpellDescriptionContent";
import SpellSubtitle from "../../components/SpellSubtitle";
import {
  formatBackgroundAbilityScoreOptions,
  formatBackgroundEquipmentOptions,
  formatBackgroundOriginFeat,
  formatBackgroundProficiencies
} from "../../components/CodexPage/backgroundPresentation";
import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  FEATS,
  FeatureMap,
  KeywordTooltip,
  TRACKER,
  getFeatureTrackingState,
  type DivinityEntry,
  type FeatureMapEntry,
  type SpellEntry
} from "../../codex/entries";
import { getSubclassEntriesForClass } from "../../codex/subclasses";
import {
  resolveKeywordReference,
  type ResolvedKeywordReference
} from "../../utils/codex/renderCodexRichText";
import {
  formatCodexLabel,
  formatCodexList,
  formatEquipmentCost,
  formatEquipmentWeight,
  formatSpellCastingTime,
  formatSpellComponents,
  formatSpellHealing,
  formatWeaponCost,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponType,
  formatWeaponWeight
} from "../../utils/codex";
import sheetStyles from "../CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { isShieldArmorEntry } from "../CharactersPage/armor";
import { getKeywordReferences } from "../CharactersPage/keywordDescriptions";
import {
  getClassProficiencyProfile,
  getEquipmentProficiencyLabelsForClass,
  getPrimaryAbilityForClass,
  getSavingThrowAbilityKeysForClass
} from "../CharactersPage/proficiencyClassData";
import {
  getSpellAttackFormulaCell,
  getSpellSaveFormulaCell
} from "../CharactersPage/shared/spellFormulas";
import { getToolProficiencyLabel } from "../CharactersPage/proficiencyOptions";
import {
  formatStarterPackStartingEquipmentSummary,
  getLevelOneWeaponMasteryCountForClass
} from "../../codex/classes/starterPack";
import { useCodexEntry } from "./useCodexEntry";
import styles from "./CodexEntryPage.module.css";

function hasSpellHealing(spell: Pick<SpellEntry, "healing">): boolean {
  return Array.isArray(spell.healing)
    ? spell.healing.length > 0
    : spell.healing.label.trim().length > 0;
}
function formatSelectableProficiencyList(values: string[], count: number): string {
  if (values.length === 0 || count <= 0) {
    return "None";
  }

  return `Choose ${count}: ${values.join(", ")}`;
}

function formatClassToolProficiencyList(className: string): string {
  const profile = getClassProficiencyProfile(className);
  const grantedTools = (profile?.grantedToolProficiencies ?? []).map((entry) =>
    getToolProficiencyLabel(entry)
  );
  const selectableTools = (profile?.toolProficiencyChoices ?? []).map((entry) =>
    getToolProficiencyLabel(entry)
  );
  const selectableCount = profile?.toolProficiencyChoiceCount ?? 0;
  const parts = [
    ...grantedTools,
    selectableTools.length > 0 && selectableCount > 0
      ? `Choose ${selectableCount}: ${selectableTools.join(", ")}`
      : null
  ].filter((value): value is string => value !== null);

  return parts.length > 0 ? parts.join(" | ") : "None";
}

type ResolvedFeatureItem = {
  key: string;
  level: number;
  feature: CLASS_FEATURE;
  details: FeatureMapEntry;
};

type SelectedFeatReference = {
  feat: FEATS;
  label: string;
};

function createResolvedFeatureItems(
  rows: Array<{
    level: number;
    classFeatures: CLASS_FEATURE[];
    featureOverrides?: Partial<Record<CLASS_FEATURE, FeatureMapEntry>>;
  }>
): ResolvedFeatureItem[] {
  return rows.flatMap((row) =>
    row.classFeatures.flatMap((feature, index) => {
      const details = row.featureOverrides?.[feature] ?? FeatureMap[feature];

      if (!details) {
        return [];
      }

      return [
        {
          key: `${row.level}-${feature}-${index}`,
          level: row.level,
          feature,
          details
        }
      ];
    })
  );
}

function CodexEntryPage() {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const [searchParams] = useSearchParams();
  const { entry, status } = useCodexEntry(entryId);
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);
  const [selectedWeaponReference, setSelectedWeaponReference] = useState<{
    title: string;
    entries: ReturnType<typeof getKeywordReferences>;
  } | null>(null);
  const [selectedKeywordReference, setSelectedKeywordReference] =
    useState<ResolvedKeywordReference | null>(null);
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const [expandedSectionKeys, setExpandedSectionKeys] = useState<string[]>([]);
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<string[]>([]);
  const codexSearch = searchParams.toString();
  const backToCodexPath = codexSearch.length > 0 ? `/library?${codexSearch}` : "/library";
  const componentsTooltipEntry =
    entry && entry.category === ENTRY_CATEGORIES.SPELLS
      ? (KeywordTooltip.components ?? null)
      : null;
  const spellFormulaCells =
    entry?.category === ENTRY_CATEGORIES.SPELLS
      ? [getSpellSaveFormulaCell(entry), getSpellAttackFormulaCell(entry)].filter(
          (cell): cell is NonNullable<typeof cell> => cell !== null
        )
      : [];
  const isDrawerStyledEntry =
    entry?.category === ENTRY_CATEGORIES.WEAPONS ||
    entry?.category === ENTRY_CATEGORIES.ARMOR ||
    entry?.category === ENTRY_CATEGORIES.SPELLS;
  const classFeatureItems =
    entry?.category === ENTRY_CATEGORIES.CLASSES ? createResolvedFeatureItems(entry.features) : [];
  const classPrimaryAbility =
    entry?.category === ENTRY_CATEGORIES.CLASSES ? getPrimaryAbilityForClass(entry.name) : null;
  const classStarterPack =
    entry?.category === ENTRY_CATEGORIES.CLASSES ? (entry.starterPack ?? null) : null;
  const classSavingThrows =
    entry?.category === ENTRY_CATEGORIES.CLASSES
      ? getSavingThrowAbilityKeysForClass(entry.name)
      : [];
  const classProfile =
    entry?.category === ENTRY_CATEGORIES.CLASSES ? getClassProficiencyProfile(entry.name) : null;
  const classEquipmentLabels =
    entry?.category === ENTRY_CATEGORIES.CLASSES
      ? getEquipmentProficiencyLabelsForClass(entry.name)
      : { weapons: [], armor: [] };
  const classSubclassEntries =
    entry?.category === ENTRY_CATEGORIES.CLASSES ? getSubclassEntriesForClass(entry.name) : [];
  const classStartingEquipment =
    entry?.category === ENTRY_CATEGORIES.CLASSES && classStarterPack
      ? formatStarterPackStartingEquipmentSummary(classStarterPack.startingEquipment)
      : "None";
  const classWeaponMasteryCount =
    entry?.category === ENTRY_CATEGORIES.CLASSES
      ? (classStarterPack?.weaponMasteryCount ?? getLevelOneWeaponMasteryCountForClass(entry.name))
      : 0;
  const classFeaturesSectionKey =
    entry?.category === ENTRY_CATEGORIES.CLASSES ? `class-features-${entry.id}` : null;

  useEffect(() => {
    if (!entry || entry.category !== ENTRY_CATEGORIES.SPELLS) {
      setIsComponentsTooltipOpen(false);
    }

    if (!entry || entry.category !== ENTRY_CATEGORIES.WEAPONS) {
      setSelectedWeaponReference(null);
    }

    setSelectedKeywordReference(null);
    setSelectedSpellReference(null);
    setSelectedDivinityReference(null);
    setSelectedFeatReference(null);
    setExpandedSectionKeys(classFeaturesSectionKey ? [classFeaturesSectionKey] : []);
    setExpandedFeatureKeys([]);
  }, [entry, classFeaturesSectionKey]);

  function openWeaponReference(title: string, keywords: string[]) {
    const referenceEntries = getKeywordReferences(keywords);

    if (referenceEntries.length === 0) {
      return;
    }

    setSelectedWeaponReference({
      title,
      entries: referenceEntries
    });
  }

  function toggleExpandedKey(key: string, setExpandedKeys: Dispatch<SetStateAction<string[]>>) {
    setExpandedKeys((currentKeys) =>
      currentKeys.includes(key)
        ? currentKeys.filter((currentKey) => currentKey !== key)
        : [...currentKeys, key]
    );
  }

  function openTrackingReference(trackingState: TRACKER) {
    const reference = resolveKeywordReference(trackingState);

    if (!reference) {
      return;
    }

    setSelectedKeywordReference(reference);
  }

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate(backToCodexPath)}>
        Back to library
      </button>

      {status === "loading" ? (
        <article className={styles.card}>
          <h2>Loading entry...</h2>
          <p>Loading library data.</p>
        </article>
      ) : null}

      {status === "error" ? (
        <article className={styles.card}>
          <h2>Entry unavailable</h2>
          <p>The library data could not be loaded.</p>
        </article>
      ) : null}

      {status === "ready" && !entry ? (
        <article className={styles.card}>
          <h2>Entry not found</h2>
          <p>The selected library entry does not exist.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to library
          </Link>
        </article>
      ) : null}

      {status === "ready" && entry ? (
        <article className={isDrawerStyledEntry ? styles.drawerCard : styles.card}>
          {isDrawerStyledEntry ? (
            <div className={styles.entryDrawer}>
              <div className={sheetStyles.spellDrawerHeader}>
                <div className={sheetStyles.spellDrawerHeaderContent}>
                  <p className={sheetStyles.spellDrawerBadge}>{formatCodexLabel(entry.category)}</p>
                  <div className={`${sheetStyles.spellDrawerTitleRow} ${styles.drawerTitleRow}`}>
                    <h2 className={sheetStyles.spellDrawerTitle}>{entry.name}</h2>
                    {"rarity" in entry ? <RarityPill rarity={entry.rarity} /> : null}
                  </div>
                  <p className={sheetStyles.spellDrawerSummary}>
                    {entry.category === ENTRY_CATEGORIES.SPELLS ? (
                      <SpellSubtitle spell={entry} />
                    ) : (
                      entry.summary
                    )}
                  </p>
                </div>
              </div>

              <div className={sheetStyles.spellDrawerBody}>
                <div className={sheetStyles.spellDrawerDetails}>
                  {entry.category === ENTRY_CATEGORIES.WEAPONS ? (
                    <>
                      <CellContainer
                        label="Type"
                        content={`${formatWeaponType(entry.type)} weapon`}
                      />
                      <CellContainer label="Damage" content={formatWeaponDamage(entry.damage)} />
                      <CellContainer
                        type="button"
                        as="button"
                        className={styles.drawerDetailButton}
                        label="Properties"
                        content={formatWeaponProperties(entry)}
                        onClick={() =>
                          openWeaponReference(
                            "Properties",
                            entry.properties.map((property) => formatCodexLabel(property))
                          )
                        }
                      />
                      <CellContainer
                        type="button"
                        as="button"
                        className={styles.drawerDetailButton}
                        label="Mastery"
                        content={formatCodexLabel(entry.mastery)}
                        onClick={() =>
                          openWeaponReference("Mastery", [formatCodexLabel(entry.mastery)])
                        }
                      />
                      <CellContainer label="Weight" content={formatWeaponWeight(entry.weight)} />
                      <CellContainer label="Cost" content={formatWeaponCost(entry.cost)} />
                    </>
                  ) : null}

                  {entry.category === ENTRY_CATEGORIES.ARMOR ? (
                    <>
                      {!isShieldArmorEntry(entry) ? (
                        <CellContainer label="Type" content={formatCodexList(entry.tags)} />
                      ) : null}
                      {!isShieldArmorEntry(entry) ? (
                        <CellContainer
                          label="Armor Base"
                          content={entry.armorBase > 0 ? entry.armorBase : "-"}
                        />
                      ) : null}
                      <CellContainer label="Weight" content={formatEquipmentWeight(entry.weight)} />
                      <CellContainer label="Cost" content={formatEquipmentCost(entry.cost)} />
                    </>
                  ) : null}

                  {entry.category === ENTRY_CATEGORIES.SPELLS ? (
                    <>
                      <CellContainer
                        label="Casting Time"
                        content={formatSpellCastingTime(entry.castingTime)}
                      />
                      <CellContainer label="Range" content={entry.range} />
                      <CellContainer
                        type="button"
                        as="button"
                        className={styles.drawerDetailButton}
                        label="Components"
                        content={formatSpellComponents(entry.components)}
                        onClick={() => {
                          if (componentsTooltipEntry) {
                            setIsComponentsTooltipOpen(true);
                          }
                        }}
                      />
                      <CellContainer label="Duration" content={entry.duration} />
                      <CellContainer
                        label="Spell Lists"
                        content={formatCodexList(entry.spellLists)}
                      />
                      <CellContainer
                        label={
                          entry.damage.length > 0
                            ? "Damage"
                            : hasSpellHealing(entry)
                              ? "Healing"
                              : "Damage"
                        }
                        content={
                          entry.damage.length > 0
                            ? formatWeaponDamage(entry.damage)
                            : formatSpellHealing(entry.healing)
                        }
                      />
                    </>
                  ) : null}
                </div>

                {entry.category === ENTRY_CATEGORIES.SPELLS ? (
                  <>
                    <SpellDescriptionContent
                      description={entry.description}
                      className={`${sheetStyles.spellDrawerDescriptionList} ${sheetStyles.spellDrawerDescriptionSection}`}
                      entryClassName={sheetStyles.spellDrawerDescriptionLine}
                      strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                      linkClassName={featureDisclosureStyles.inlineLinkButton}
                      onOpenKeyword={setSelectedKeywordReference}
                      onOpenSpell={setSelectedSpellReference}
                      onOpenDivinity={setSelectedDivinityReference}
                      onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                    />
                    {spellFormulaCells.length > 0 ? (
                      <div className={sheetStyles.spellDrawerDetails}>
                        {spellFormulaCells.map((cell) => (
                          <CellContainer
                            key={cell.label}
                            className={sheetStyles.spellDrawerFormulaCell}
                            label={cell.label}
                            content={cell.content}
                            breakdown={cell.breakdown}
                          />
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <p className={styles.badge}>
                {entry.category === ENTRY_CATEGORIES.CLASSES
                  ? "Class"
                  : formatCodexLabel(entry.category)}
              </p>
              <div className={styles.titleRow}>
                <h2>{entry.name}</h2>
                {"rarity" in entry ? <RarityPill rarity={entry.rarity} /> : null}
              </div>
              {entry.summary.trim().length > 0 ? <p>{entry.summary}</p> : null}

              <div className={styles.detailsGrid}>
                {"tags" in entry && entry.category !== ENTRY_CATEGORIES.BACKGROUNDS ? (
                  <div className={styles.detailItem}>
                    <span>Types</span>
                    <strong>{formatCodexList(entry.tags)}</strong>
                  </div>
                ) : null}

                {entry.category === ENTRY_CATEGORIES.CLASSES ? (
                  <>
                    <div className={styles.detailItem}>
                      <span>Primary Ability</span>
                      <strong>
                        {classStarterPack?.primaryAbilityLabel ??
                          (classPrimaryAbility ? formatCodexLabel(classPrimaryAbility) : "None")}
                      </strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Hit Point Die</span>
                      <strong>
                        {classStarterPack?.hitPointDieLabel ?? formatCodexLabel(entry.hitPointDie)}
                      </strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Saving Throws</span>
                      <strong>
                        {classSavingThrows.length > 0 ? formatCodexList(classSavingThrows) : "None"}
                      </strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Weapon Proficiencies</span>
                      <strong>
                        {classEquipmentLabels.weapons.length > 0
                          ? classEquipmentLabels.weapons.join(", ")
                          : "None"}
                      </strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Weapon Masteries</span>
                      <strong>
                        {classWeaponMasteryCount > 0 ? classWeaponMasteryCount : "None"}
                      </strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Armor Training</span>
                      <strong>
                        {classEquipmentLabels.armor.length > 0
                          ? classEquipmentLabels.armor.join(", ")
                          : "None"}
                      </strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Possible Skill Proficiencies</span>
                      <strong>
                        {formatSelectableProficiencyList(
                          classProfile?.skillProficiencyOptions ?? [],
                          classProfile?.skillProficiencyCount ?? 0
                        )}
                      </strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Tool Proficiencies</span>
                      <strong>{formatClassToolProficiencyList(entry.name)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Starting Equipment</span>
                      <strong>{classStartingEquipment}</strong>
                    </div>
                    {entry.features.length > 0 ? (
                      <div className={`${styles.detailItem} ${styles.detailItemFullWidth}`}>
                        <span>Level Progression</span>
                        <ClassProgressionTable
                          featureRows={entry.features}
                          subclassEntries={classSubclassEntries}
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}

                {entry.category === ENTRY_CATEGORIES.SPECIES ? (
                  <>
                    <div className={styles.detailItem}>
                      <span>Speed</span>
                      <strong>{entry.speed} ft</strong>
                    </div>
                  </>
                ) : null}

                {entry.category === ENTRY_CATEGORIES.BACKGROUNDS ? (
                  <>
                    <div className={styles.detailItem}>
                      <span>Ability Scores</span>
                      <strong>{formatBackgroundAbilityScoreOptions(entry)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Feat</span>
                      <strong>{formatBackgroundOriginFeat(entry)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Skill + Tool Proficiencies</span>
                      <strong>{formatBackgroundProficiencies(entry)}</strong>
                    </div>
                    <div className={`${styles.detailItem} ${styles.detailItemFullWidth}`}>
                      <span>Equipment</span>
                      <strong>{formatBackgroundEquipmentOptions(entry)}</strong>
                    </div>
                  </>
                ) : null}
              </div>

              {entry.category === ENTRY_CATEGORIES.SPECIES ? (
                <SpellDescriptionContent
                  description={entry.description}
                  className={featureDisclosureStyles.descriptionList}
                  entryClassName={featureDisclosureStyles.descriptionLine}
                  linkClassName={featureDisclosureStyles.inlineLinkButton}
                  onOpenKeyword={setSelectedKeywordReference}
                  onOpenSpell={setSelectedSpellReference}
                  onOpenDivinity={setSelectedDivinityReference}
                  onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                />
              ) : null}
            </>
          )}
        </article>
      ) : null}

      {status === "ready" && entry?.category === ENTRY_CATEGORIES.CLASSES ? (
        <>
          {classFeaturesSectionKey ? (
            <FeatureDisclosureSection
              className={styles.card}
              bodyId={`${classFeaturesSectionKey}-content`}
              bodyClassName={styles.collapsibleBody}
              isExpanded={expandedSectionKeys.includes(classFeaturesSectionKey)}
              onToggle={() => toggleExpandedKey(classFeaturesSectionKey, setExpandedSectionKeys)}
              header={
                <>
                  <span className={styles.badge}>Class Features</span>
                  <div className={styles.sectionHeader}>
                    <h3>{`${entry.name} Features`}</h3>
                    <p>Core class progression and default feature unlocks.</p>
                  </div>
                </>
              }
            >
              <div className={featureDisclosureStyles.featureList}>
                {classFeatureItems.map((item, index) => {
                  const featureKey = `${classFeaturesSectionKey}-${item.key}`;

                  return (
                    <FeatureDisclosureRow
                      key={featureKey}
                      title={`Level: ${item.level} ${formatCodexLabel(item.feature)}`}
                      isExpanded={expandedFeatureKeys.includes(featureKey)}
                      onToggle={() => toggleExpandedKey(featureKey, setExpandedFeatureKeys)}
                      bodyId={`${featureKey}-content`}
                      bodyClassName={featureDisclosureStyles.descriptionList}
                      trackingButton={
                        <FeatureTrackingBadgeButton
                          trackingState={getFeatureTrackingState(item.details)}
                          onClick={openTrackingReference}
                        />
                      }
                      showDivider={index > 0}
                    >
                      <SpellDescriptionContent
                        description={item.details.description}
                        className={featureDisclosureStyles.descriptionList}
                        entryClassName={featureDisclosureStyles.descriptionLine}
                        linkClassName={featureDisclosureStyles.inlineLinkButton}
                        onOpenKeyword={setSelectedKeywordReference}
                        onOpenSpell={setSelectedSpellReference}
                        onOpenDivinity={setSelectedDivinityReference}
                        onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                      />
                    </FeatureDisclosureRow>
                  );
                })}
              </div>
            </FeatureDisclosureSection>
          ) : null}

          {classSubclassEntries.map((subclass) => {
            const subclassFeatureItems = createResolvedFeatureItems(subclass.features);
            const sectionKey = `subclass-${subclass.id}`;

            return (
              <FeatureDisclosureSection
                key={subclass.id}
                className={styles.card}
                bodyId={`${sectionKey}-content`}
                bodyClassName={styles.collapsibleBody}
                isExpanded={expandedSectionKeys.includes(sectionKey)}
                onToggle={() => toggleExpandedKey(sectionKey, setExpandedSectionKeys)}
                header={
                  <>
                    <span className={styles.badge}>Subclass</span>
                    <div className={styles.sectionHeader}>
                      <h3>{subclass.name}</h3>
                      {subclass.tagline ? (
                        <p className={styles.sectionTagline}>{subclass.tagline}</p>
                      ) : null}
                      {subclass.summary ? <p>{subclass.summary}</p> : null}
                    </div>
                  </>
                }
              >
                <div className={featureDisclosureStyles.featureList}>
                  {subclassFeatureItems.map((item, index) => {
                    const featureKey = `${sectionKey}-${item.key}`;

                    return (
                      <FeatureDisclosureRow
                        key={featureKey}
                        title={`Level: ${item.level} ${formatCodexLabel(item.feature)}`}
                        isExpanded={expandedFeatureKeys.includes(featureKey)}
                        onToggle={() => toggleExpandedKey(featureKey, setExpandedFeatureKeys)}
                        bodyId={`${featureKey}-content`}
                        bodyClassName={featureDisclosureStyles.descriptionList}
                        trackingButton={
                          <FeatureTrackingBadgeButton
                            trackingState={getFeatureTrackingState(item.details)}
                            onClick={openTrackingReference}
                          />
                        }
                        showDivider={index > 0}
                      >
                        <SpellDescriptionContent
                          description={item.details.description}
                          className={featureDisclosureStyles.descriptionList}
                          entryClassName={featureDisclosureStyles.descriptionLine}
                          linkClassName={featureDisclosureStyles.inlineLinkButton}
                          onOpenKeyword={setSelectedKeywordReference}
                          onOpenSpell={setSelectedSpellReference}
                          onOpenDivinity={setSelectedDivinityReference}
                          onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                        />
                      </FeatureDisclosureRow>
                    );
                  })}
                </div>
              </FeatureDisclosureSection>
            );
          })}
        </>
      ) : null}

      {selectedWeaponReference ? (
        <KeywordReferenceDrawer
          title={selectedWeaponReference.title}
          entries={selectedWeaponReference.entries}
          onClose={() => setSelectedWeaponReference(null)}
        />
      ) : null}
      {selectedKeywordReference ? (
        <KeywordReferenceDrawer
          title={selectedKeywordReference.title}
          entries={[
            {
              title: selectedKeywordReference.title,
              description: selectedKeywordReference.description
            }
          ]}
          badgeLabel="Keyword"
          onClose={() => setSelectedKeywordReference(null)}
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
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedFeatReference ? (
        <CodexFeatDrawer
          feat={selectedFeatReference.feat}
          label={selectedFeatReference.label}
          onClose={() => setSelectedFeatReference(null)}
        />
      ) : null}

      {entry &&
      entry.category === ENTRY_CATEGORIES.SPELLS &&
      isComponentsTooltipOpen &&
      componentsTooltipEntry ? (
        <KeywordReferenceDrawer
          title={componentsTooltipEntry.title}
          entries={[
            {
              title: componentsTooltipEntry.title,
              description: componentsTooltipEntry.description
            }
          ]}
          badgeLabel="Keyword"
          onClose={() => setIsComponentsTooltipOpen(false)}
        />
      ) : null}
    </section>
  );
}

export default CodexEntryPage;
