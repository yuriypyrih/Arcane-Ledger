import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import CodexDivinityDrawer from "../../components/CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexFeatDrawer from "../../components/CodexPage/CodexFeatDrawer/CodexFeatDrawer";
import CodexSpellDrawer from "../../components/CodexPage/CodexSpellDrawer/CodexSpellDrawer";
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
  ABILITY_TYPES,
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  FEATS,
  FeatureMap,
  GENERAL_PROFICIENCIES,
  KeywordTooltip,
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
  formatWeaponCost,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponType,
  formatWeaponWeight
} from "../../utils/codex";
import sheetStyles from "../CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { isShieldArmorEntry } from "../CharactersPage/armor";
import { getKeywordReferences } from "../CharactersPage/keywordDescriptions";
import { useCodexEntry } from "./useCodexEntry";
import styles from "./CodexEntryPage.module.css";

const abilityDisplayOrder = [
  ABILITY_TYPES.STR,
  ABILITY_TYPES.DEX,
  ABILITY_TYPES.CON,
  ABILITY_TYPES.INT,
  ABILITY_TYPES.WIS,
  ABILITY_TYPES.CHA
];
const orderedWeaponProficiencies = [
  GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
  GENERAL_PROFICIENCIES.MARTIAL_WEAPONS
];
const orderedArmorProficiencies = [
  GENERAL_PROFICIENCIES.LIGHT_ARMOR,
  GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
  GENERAL_PROFICIENCIES.HEAVY_ARMOR,
  GENERAL_PROFICIENCIES.SHIELDS
];

function formatAbilityBonusList(abilityBonuses: Partial<Record<ABILITY_TYPES, number>>): string {
  const parts = abilityDisplayOrder
    .filter((ability) => (abilityBonuses[ability] ?? 0) !== 0)
    .map((ability) => {
      const bonusValue = abilityBonuses[ability] ?? 0;
      return `${ability} ${bonusValue >= 0 ? "+" : ""}${bonusValue}`;
    });

  return parts.length > 0 ? parts.join(", ") : "None";
}

function formatInnateProficiencyList({
  grantedSkillProficiencies,
  innateProficiencies,
  grantedToolProficiencies
}: {
  grantedSkillProficiencies: string[];
  innateProficiencies: string[];
  grantedToolProficiencies: string[];
}): string {
  const innateSet = new Set(innateProficiencies);
  const orderedProficiencies = [
    ...grantedSkillProficiencies,
    ...orderedWeaponProficiencies
      .filter((proficiency) => innateSet.has(proficiency))
      .map((proficiency) => formatCodexLabel(proficiency)),
    ...orderedArmorProficiencies
      .filter((proficiency) => innateSet.has(proficiency))
      .map((proficiency) => formatCodexLabel(proficiency)),
    ...grantedToolProficiencies.map((proficiency) => formatCodexLabel(proficiency))
  ];

  return orderedProficiencies.length > 0 ? orderedProficiencies.join(", ") : "None";
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
  }>,
  {
    omitSubclassPlaceholder = false
  }: {
    omitSubclassPlaceholder?: boolean;
  } = {}
): ResolvedFeatureItem[] {
  return rows.flatMap((row) =>
    row.classFeatures.flatMap((feature, index) => {
      if (omitSubclassPlaceholder && feature === CLASS_FEATURE.SUBCLASS_FEATURE) {
        return [];
      }

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
  const [selectedDivinityReference, setSelectedDivinityReference] =
    useState<DivinityEntry | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const [expandedSectionKeys, setExpandedSectionKeys] = useState<string[]>([]);
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<string[]>([]);
  const codexSearch = searchParams.toString();
  const backToCodexPath = codexSearch.length > 0 ? `/codex?${codexSearch}` : "/codex";
  const componentsTooltipEntry =
    entry && entry.category === ENTRY_CATEGORIES.SPELLS
      ? (KeywordTooltip.components ?? null)
      : null;
  const isDrawerStyledEntry =
    entry?.category === ENTRY_CATEGORIES.WEAPONS ||
    entry?.category === ENTRY_CATEGORIES.ARMOR ||
    entry?.category === ENTRY_CATEGORIES.SPELLS;
  const classFeatureItems =
    entry?.category === ENTRY_CATEGORIES.CLASSES
      ? createResolvedFeatureItems(entry.features, { omitSubclassPlaceholder: true })
      : [];
  const classSubclassEntries =
    entry?.category === ENTRY_CATEGORIES.CLASSES ? getSubclassEntriesForClass(entry.name) : [];
  const classFeaturesSectionKey =
    entry?.category === ENTRY_CATEGORIES.CLASSES ? `class-features-${entry.id}` : null;

  useEffect(() => {
    if (!isComponentsTooltipOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedFeatReference) {
          setSelectedFeatReference(null);
          return;
        }

        if (selectedKeywordReference) {
          setSelectedKeywordReference(null);
          return;
        }

        if (selectedDivinityReference) {
          setSelectedDivinityReference(null);
          return;
        }

        if (selectedSpellReference) {
          setSelectedSpellReference(null);
          return;
        }

        if (selectedWeaponReference) {
          setSelectedWeaponReference(null);
          return;
        }

        setIsComponentsTooltipOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isComponentsTooltipOpen,
    selectedWeaponReference,
    selectedKeywordReference,
    selectedSpellReference,
    selectedDivinityReference,
    selectedFeatReference
  ]);

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
    setExpandedSectionKeys([]);
    setExpandedFeatureKeys([]);
  }, [entry]);

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

  function openTrackingReference(trackingState: "tracked" | "semi-tracked" | "not-tracked") {
    const reference = resolveKeywordReference(trackingState);

    if (!reference) {
      return;
    }

    setSelectedKeywordReference(reference);
  }

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate(backToCodexPath)}>
        Go back
      </button>

      {status === "loading" ? (
        <article className={styles.card}>
          <h2>Loading entry...</h2>
          <p>Loading codex data.</p>
        </article>
      ) : null}

      {status === "error" ? (
        <article className={styles.card}>
          <h2>Entry unavailable</h2>
          <p>The codex data could not be loaded.</p>
        </article>
      ) : null}

      {status === "ready" && !entry ? (
        <article className={styles.card}>
          <h2>Entry not found</h2>
          <p>The selected codex entry does not exist.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to codex
          </Link>
        </article>
      ) : null}

      {status === "ready" && entry ? (
        <article className={isDrawerStyledEntry ? styles.drawerCard : styles.card}>
          {isDrawerStyledEntry ? (
            <div className={styles.entryDrawer}>
              <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
              <div className={sheetStyles.spellDrawerHeader}>
                <div className={sheetStyles.spellDrawerHeaderContent}>
                  <p className={sheetStyles.spellDrawerBadge}>{formatCodexLabel(entry.category)}</p>
                  <div className={`${sheetStyles.spellDrawerTitleRow} ${styles.drawerTitleRow}`}>
                    <h2>{entry.name}</h2>
                    {"rarity" in entry ? <RarityPill rarity={entry.rarity} /> : null}
                  </div>
                  <p className={sheetStyles.spellDrawerSummary}>
                    {entry.category === ENTRY_CATEGORIES.SPELLS
                      ? <SpellSubtitle spell={entry} />
                      : entry.summary}
                  </p>
                </div>
              </div>

              <div className={sheetStyles.spellDrawerBody}>
                <div className={sheetStyles.spellDrawerDetails}>
                  {entry.category === ENTRY_CATEGORIES.WEAPONS ? (
                    <>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Type</span>
                        <strong>{formatWeaponType(entry.type)} weapon</strong>
                      </div>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Damage</span>
                        <strong>{formatWeaponDamage(entry.damage)}</strong>
                      </div>
                      <button
                        type="button"
                        className={`${sheetStyles.spellDrawerDetailCard} ${styles.drawerDetailButton}`}
                        onClick={() =>
                          openWeaponReference(
                            "Properties",
                            entry.properties.map((property) => formatCodexLabel(property))
                          )
                        }
                      >
                        <span>Properties</span>
                        <strong>{formatWeaponProperties(entry)}</strong>
                      </button>
                      <button
                        type="button"
                        className={`${sheetStyles.spellDrawerDetailCard} ${styles.drawerDetailButton}`}
                        onClick={() =>
                          openWeaponReference("Mastery", [formatCodexLabel(entry.mastery)])
                        }
                      >
                        <span>Mastery</span>
                        <strong>{formatCodexLabel(entry.mastery)}</strong>
                      </button>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Weight</span>
                        <strong>{formatWeaponWeight(entry.weight)}</strong>
                      </div>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Cost</span>
                        <strong>{formatWeaponCost(entry.cost)}</strong>
                      </div>
                    </>
                  ) : null}

                  {entry.category === ENTRY_CATEGORIES.ARMOR ? (
                    <>
                      {!isShieldArmorEntry(entry) ? (
                        <div className={sheetStyles.spellDrawerDetailCard}>
                          <span>Type</span>
                          <strong>{formatCodexList(entry.tags)}</strong>
                        </div>
                      ) : null}
                      {!isShieldArmorEntry(entry) ? (
                        <div className={sheetStyles.spellDrawerDetailCard}>
                          <span>Armor Base</span>
                          <strong>{entry.armorBase > 0 ? entry.armorBase : "-"}</strong>
                        </div>
                      ) : null}
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Weight</span>
                        <strong>{formatEquipmentWeight(entry.weight)}</strong>
                      </div>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Cost</span>
                        <strong>{formatEquipmentCost(entry.cost)}</strong>
                      </div>
                    </>
                  ) : null}

                  {entry.category === ENTRY_CATEGORIES.SPELLS ? (
                    <>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Casting Time</span>
                        <strong>{formatSpellCastingTime(entry.castingTime)}</strong>
                      </div>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Range</span>
                        <strong>{entry.range}</strong>
                      </div>
                      <button
                        type="button"
                        className={`${sheetStyles.spellDrawerDetailCard} ${styles.drawerDetailButton}`}
                        onClick={() => {
                          if (componentsTooltipEntry) {
                            setIsComponentsTooltipOpen(true);
                          }
                        }}
                      >
                        <span>Components</span>
                        <strong>{formatSpellComponents(entry.components)}</strong>
                      </button>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Duration</span>
                        <strong>{entry.duration}</strong>
                      </div>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Spell Lists</span>
                        <strong>{formatCodexList(entry.spellLists)}</strong>
                      </div>
                      <div className={sheetStyles.spellDrawerDetailCard}>
                        <span>Damage</span>
                        <strong>{formatWeaponDamage(entry.damage)}</strong>
                      </div>
                    </>
                  ) : null}
                </div>

                {entry.category === ENTRY_CATEGORIES.SPELLS ? (
                  <SpellDescriptionContent
                    description={entry.description}
                    className={`${sheetStyles.spellDrawerDescriptionList} ${sheetStyles.spellDrawerDescriptionSection}`}
                    entryClassName={sheetStyles.spellDrawerDescriptionLine}
                    linkClassName={featureDisclosureStyles.inlineLinkButton}
                    onOpenKeyword={setSelectedKeywordReference}
                    onOpenSpell={setSelectedSpellReference}
                    onOpenDivinity={setSelectedDivinityReference}
                    onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <p className={styles.badge}>{formatCodexLabel(entry.category)}</p>
              <div className={styles.titleRow}>
                <h2>{entry.name}</h2>
                {"rarity" in entry ? <RarityPill rarity={entry.rarity} /> : null}
              </div>
              <p>{entry.summary}</p>

              <div className={styles.detailsGrid}>
                {"tags" in entry ? (
                  <div className={styles.detailItem}>
                    <span>Types</span>
                    <strong>{formatCodexList(entry.tags)}</strong>
                  </div>
                ) : null}

                {entry.category === ENTRY_CATEGORIES.CLASSES ? (
                  <>
                    <div className={styles.detailItem}>
                      <span>Primary Abilities</span>
                      <strong>{formatCodexList(entry.primaryAbilityModifiers)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Hit Point Die</span>
                      <strong>{formatCodexLabel(entry.hitPointDie)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Saving Throws</span>
                      <strong>{formatCodexList(entry.savingThrowProficiencies)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Granted Proficiencies</span>
                      <strong>
                        {formatInnateProficiencyList({
                          grantedSkillProficiencies: entry.grantedSkillProficiencies,
                          innateProficiencies: entry.innateProficiencies,
                          grantedToolProficiencies: entry.grantedToolProficiencies
                        })}
                      </strong>
                    </div>
                  </>
                ) : null}

                {entry.category === ENTRY_CATEGORIES.SPECIES ? (
                  <>
                    <div className={styles.detailItem}>
                      <span>Speed</span>
                      <strong>{entry.speed} ft</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Ability Bonuses</span>
                      <strong>{formatAbilityBonusList(entry.abilityBonuses)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Granted Proficiencies</span>
                      <strong>
                        {formatInnateProficiencyList({
                          grantedSkillProficiencies: entry.grantedSkillProficiencies,
                          innateProficiencies: entry.innateProficiencies,
                          grantedToolProficiencies: entry.grantedToolProficiencies
                        })}
                      </strong>
                    </div>
                  </>
                ) : null}

                {entry.category === ENTRY_CATEGORIES.BACKGROUNDS ? (
                  <div className={styles.detailItem}>
                    <span>Granted Proficiencies</span>
                    <strong>
                      {formatInnateProficiencyList({
                        grantedSkillProficiencies: entry.grantedSkillProficiencies,
                        innateProficiencies: [],
                        grantedToolProficiencies: entry.grantedToolProficiencies
                      })}
                    </strong>
                  </div>
                ) : null}
              </div>
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

      {entry && entry.category === ENTRY_CATEGORIES.SPELLS && isComponentsTooltipOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setIsComponentsTooltipOpen(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spell-components-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Spell Reference</p>
                <h3 id="spell-components-title">{componentsTooltipEntry?.title ?? "Components"}</h3>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsComponentsTooltipOpen(false)}
                aria-label="Close components tooltip"
              >
                ×
              </button>
            </div>
            <div className={styles.componentTooltipList}>
              {componentsTooltipEntry ? (
                <article className={styles.componentTooltipItem}>
                  <SpellDescriptionContent
                    description={componentsTooltipEntry.description}
                    className={styles.componentTooltipDescription}
                    entryClassName={featureDisclosureStyles.descriptionLine}
                    linkClassName={featureDisclosureStyles.inlineLinkButton}
                    onOpenKeyword={setSelectedKeywordReference}
                    onOpenSpell={setSelectedSpellReference}
                    onOpenDivinity={setSelectedDivinityReference}
                    onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                  />
                </article>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CodexEntryPage;
