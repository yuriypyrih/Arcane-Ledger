import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import RarityPill from "../../components/CodexPage/RarityPill";
import { ABILITY_TYPES, ENTRY_CATEGORIES, GENERAL_PROFICIENCIES } from "../../codex/entries";
import { formatCodexLabel, formatCodexList, formatDamageDice } from "../../utils/codex";
import { useCodexEntries } from "../CodexPage/useCodexEntries";
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
  const entry = entries.find((item) => item.id === entryId);
  const categoryParam = searchParams.get("category");
  const backToCodexPath = categoryParam ? `/codex?category=${categoryParam}` : "/codex";

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
        <article className={styles.card}>
          <p className={styles.badge}>{formatCodexLabel(entry.category)}</p>
          <div className={styles.titleRow}>
            <h2>{entry.name}</h2>
            {"rarity" in entry ? <RarityPill rarity={entry.rarity} /> : null}
          </div>
          <p>{entry.summary}</p>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span>Types</span>
              <strong>{formatCodexList(entry.tags)}</strong>
            </div>

            {entry.category === ENTRY_CATEGORIES.WEAPONS ||
            entry.category === ENTRY_CATEGORIES.SPELLS ? (
              <>
                <div className={styles.detailItem}>
                  <span>Damage</span>
                  <strong>{formatDamageDice(entry.damage)}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Damage Type</span>
                  <strong>{entry.damageType ? formatCodexLabel(entry.damageType) : "None"}</strong>
                </div>
              </>
            ) : null}

            {entry.category === ENTRY_CATEGORIES.ARMOR ? (
              <>
                <div className={styles.detailItem}>
                  <span>Armor Base</span>
                  <strong>{entry.armorBase > 0 ? entry.armorBase : "-"}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Max DEX Modifier</span>
                  <strong>{formatMaxDexModifier(entry.maxDexModifier)}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Shield Bonus</span>
                  <strong>{entry.shieldBonus > 0 ? `+${entry.shieldBonus}` : "None"}</strong>
                </div>
              </>
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
                  <span>Innate Proficiencies</span>
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
                  <span>Innate Proficiencies</span>
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
          </div>
        </article>
      ) : null}
    </section>
  );
}

export default CodexEntryPage;
