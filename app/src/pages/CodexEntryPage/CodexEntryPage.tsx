import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import RarityPill from "../../components/CodexPage/RarityPill";
import {
  ABILITY_TYPES,
  ENTRY_CATEGORIES,
  GENERAL_PROFICIENCIES,
  KeywordTooltip
} from "../../codex/entries";
import {
  formatCodexLabel,
  formatCodexList,
  formatEquipmentCost,
  formatEquipmentWeight,
  formatSpellComponents,
  formatSpellSubtitle,
  formatWeaponCost,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponType,
  formatWeaponWeight
} from "../../utils/codex";
import { useCodexEntries } from "../CodexPage/useCodexEntries";
import sheetStyles from "../CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
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
const inlineBoldPattern = /<strong>(.*?)<\/strong>/g;

function renderSpellDescriptionLine(line: string): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(inlineBoldPattern)) {
    const index = match.index ?? 0;

    if (index > cursor) {
      nodes.push(line.slice(cursor, index));
    }

    nodes.push(<strong key={`${match[1]}-${index}`}>{match[1]}</strong>);
    cursor = index + match[0].length;
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }

  return nodes.length > 0 ? nodes : line;
}

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

function formatMaxDexModifier(maxDexModifier: number | null): string {
  if (maxDexModifier === null) {
    return "Full modifier";
  }

  if (maxDexModifier === 0) {
    return "No DEX modifier";
  }

  return `Capped at +${maxDexModifier}`;
}

function CodexEntryPage() {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const [searchParams] = useSearchParams();
  const { entries, status } = useCodexEntries();
  const [isComponentsTooltipOpen, setIsComponentsTooltipOpen] = useState(false);
  const entry = entries.find((item) => item.id === entryId);
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

  useEffect(() => {
    if (!isComponentsTooltipOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsComponentsTooltipOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isComponentsTooltipOpen]);

  useEffect(() => {
    if (!entry || entry.category !== ENTRY_CATEGORIES.SPELLS) {
      setIsComponentsTooltipOpen(false);
    }
  }, [entry]);

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
                      ? formatSpellSubtitle(entry)
                      : entry.summary}
                  </p>
                </div>
              </div>

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
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Properties</span>
                      <strong>{formatWeaponProperties(entry)}</strong>
                    </div>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Mastery</span>
                      <strong>{formatCodexLabel(entry.mastery)}</strong>
                    </div>
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
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Type</span>
                      <strong>{formatCodexList(entry.tags)}</strong>
                    </div>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Armor Base</span>
                      <strong>{entry.armorBase > 0 ? entry.armorBase : "-"}</strong>
                    </div>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Max DEX Modifier</span>
                      <strong>{formatMaxDexModifier(entry.maxDexModifier)}</strong>
                    </div>
                    <div className={sheetStyles.spellDrawerDetailCard}>
                      <span>Shield Bonus</span>
                      <strong>{entry.shieldBonus > 0 ? `+${entry.shieldBonus}` : "None"}</strong>
                    </div>
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
                      <strong>{entry.castingTime}</strong>
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
                <div className={sheetStyles.spellDrawerDescriptionList}>
                  {entry.description.map((line, index) => (
                    <p
                      key={`${entry.id}-description-${index}`}
                      className={sheetStyles.spellDrawerDescriptionLine}
                    >
                      {renderSpellDescriptionLine(line)}
                    </p>
                  ))}
                </div>
              ) : null}
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
                  <div className={styles.componentTooltipDescription}>
                    {componentsTooltipEntry.description.map((line, index) => (
                      <p key={`components-${index}`}>{renderSpellDescriptionLine(line)}</p>
                    ))}
                  </div>
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
