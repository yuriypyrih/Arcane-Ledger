import type { ClassEntry, FeatureClassObj, SubclassEntry } from "../../../codex/entries";
import { formatCodexLabel } from "../../../utils/codex";
import styles from "./ClassProgressionTable.module.css";

type ClassProgressionTableProps = {
  featureRows: ClassEntry["features"];
  subclassEntries?: SubclassEntry[];
};

type ValueColumn = {
  kind: "value";
  key: string;
  label: string;
  title: string;
};

type FeatureColumn = {
  kind: "features";
  label: string;
  title: string;
};

type SpellSlotColumn = {
  kind: "spell-slot";
  index: number;
  label: string;
  title: string;
};

type ProgressionColumn = FeatureColumn | ValueColumn | SpellSlotColumn;

const MAX_CLASS_LEVEL = 20;
const hiddenKeys = new Set(["level", "classFeatures", "featureOverrides"]);

const progressionFieldLabels: Record<string, { label: string; title?: string }> = {
  bardicDie: {
    label: "Bardic",
    title: "Bardic Inspiration Die"
  },
  cantrips: {
    label: "Cantrips"
  },
  channelDivinity: {
    label: "Divinity",
    title: "Channel Divinity Uses"
  },
  eldritchInvocations: {
    label: "Invocations",
    title: "Eldritch Invocations"
  },
  favoredEnemy: {
    label: "Favored",
    title: "Favored Enemy Uses"
  },
  focusPoints: {
    label: "Focus",
    title: "Focus Points"
  },
  martialArts: {
    label: "Martial Arts",
    title: "Martial Arts Die"
  },
  magicItems: {
    label: "Magic Items"
  },
  pactMagicSlots: {
    label: "Pact",
    title: "Pact Magic Slots"
  },
  plansKnown: {
    label: "Plans",
    title: "Plans Known"
  },
  preparedSpells: {
    label: "Prepared",
    title: "Prepared Spells"
  },
  rageDamage: {
    label: "Rage Dmg",
    title: "Rage Damage Bonus"
  },
  rages: {
    label: "Rages",
    title: "Rage Uses"
  },
  secondWind: {
    label: "2nd Wind",
    title: "Second Wind Uses"
  },
  slotLevel: {
    label: "Slot Lvl",
    title: "Pact Magic Slot Level"
  },
  sneakAttack: {
    label: "Sneak",
    title: "Sneak Attack"
  },
  sorceryPoints: {
    label: "Sorcery",
    title: "Sorcery Points"
  },
  unarmoredMovement: {
    label: "Move",
    title: "Unarmored Movement Bonus"
  },
  weaponMastery: {
    label: "Mastery",
    title: "Weapon Mastery Choices"
  },
  wildShape: {
    label: "Wild Shape",
    title: "Wild Shape Uses"
  }
};

function formatUnknownFieldLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function getProgressionFieldLabel(key: string) {
  const configuredLabel = progressionFieldLabels[key];

  if (configuredLabel) {
    return {
      label: configuredLabel.label,
      title: configuredLabel.title ?? configuredLabel.label
    };
  }

  const fallbackLabel = formatUnknownFieldLabel(key);
  return {
    label: fallbackLabel,
    title: fallbackLabel
  };
}

function getOrderedProgressionKeys(featureRows: ClassEntry["features"]): string[] {
  const orderedKeys: string[] = [];

  featureRows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (hiddenKeys.has(key) || orderedKeys.includes(key)) {
        return;
      }

      orderedKeys.push(key);
    });
  });

  return orderedKeys;
}

function getSpellSlotColumnCount(featureRows: ClassEntry["features"]): number {
  return featureRows.reduce(
    (maxCount, row) => Math.max(maxCount, row.spellSlots?.length ?? 0),
    0
  );
}

function buildColumns(featureRows: ClassEntry["features"]): ProgressionColumn[] {
  const spellSlotColumnCount = getSpellSlotColumnCount(featureRows);

  return getOrderedProgressionKeys(featureRows).reduce<ProgressionColumn[]>(
    (columns, key) => {
      if (key === "spellSlots") {
        columns.push(
          ...Array.from({ length: spellSlotColumnCount }, (_, index) => ({
            kind: "spell-slot" as const,
            index,
            label: String(index + 1),
            title: `Spell Slot Level ${index + 1}`
          }))
        );
        return columns;
      }

      const { label, title } = getProgressionFieldLabel(key);
      columns.push({
        kind: "value",
        key,
        label,
        title
      });
      return columns;
    },
    [
      {
        kind: "features",
        label: "Features",
        title: "Feature Unlocks"
      }
    ]
  );
}

function normalizeFeatureRows(featureRows: ClassEntry["features"]): FeatureClassObj[] {
  const rowsByLevel = new Map(featureRows.map((row) => [row.level, row]));
  let previousRow: FeatureClassObj | null = null;

  return Array.from({ length: MAX_CLASS_LEVEL }, (_, index) => {
    const level = index + 1;
    const row = rowsByLevel.get(level);

    if (row) {
      previousRow = row;
      return row;
    }

    if (!previousRow) {
      return {
        level,
        classFeatures: []
      };
    }

    const {
      level: _ignoredLevel,
      classFeatures: _ignoredFeatures,
      featureOverrides: _ignoredOverrides,
      ...progressionValues
    } = previousRow;

    return {
      level,
      classFeatures: [],
      ...progressionValues
    };
  });
}

function getSubclassUnlockLevels(subclassEntries: SubclassEntry[]): Set<number> {
  return subclassEntries.reduce<Set<number>>((levels, subclassEntry) => {
    subclassEntry.features.forEach((featureRow) => {
      if (featureRow.classFeatures.length > 0) {
        levels.add(featureRow.level);
      }
    });

    return levels;
  }, new Set<number>());
}

function formatValueCell(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "number") {
    if (key === "rageDamage") {
      return value > 0 ? `+${value}` : "0";
    }

    if (key === "sneakAttack") {
      return `${value}d6`;
    }

    if (key === "unarmoredMovement") {
      return value > 0 ? `+${value}` : "0";
    }

    return String(value);
  }

  if (typeof value === "string") {
    return formatCodexLabel(value);
  }

  return String(value);
}

function renderFeatureCellValue(row: FeatureClassObj, subclassUnlockLevels: Set<number>) {
  const hasSubclassUnlock = subclassUnlockLevels.has(row.level);
  const featureLabel =
    row.classFeatures.length > 0
      ? row.classFeatures.map((feature) => formatCodexLabel(feature)).join(", ")
      : null;

  if (!featureLabel && !hasSubclassUnlock) {
    return "—";
  }

  return (
    <span className={styles.featureCellContent}>
      {featureLabel ? <span>{featureLabel}</span> : null}
      {hasSubclassUnlock ? <span className={styles.subclassIndicator}>Subclass</span> : null}
    </span>
  );
}

function formatCellValue(
  row: FeatureClassObj,
  column: ProgressionColumn,
  subclassUnlockLevels: Set<number>
) {
  if (column.kind === "spell-slot") {
    const slotCount = row.spellSlots?.[column.index] ?? 0;
    return slotCount > 0 ? String(slotCount) : "—";
  }

  if (column.kind === "features") {
    return renderFeatureCellValue(row, subclassUnlockLevels);
  }

  return formatValueCell(column.key, row[column.key as keyof FeatureClassObj]);
}

function ClassProgressionTable({
  featureRows,
  subclassEntries = []
}: ClassProgressionTableProps) {
  const columns = buildColumns(featureRows);

  if (columns.length === 0) {
    return null;
  }

  const rows = normalizeFeatureRows(featureRows);
  const subclassUnlockLevels = getSubclassUnlockLevels(subclassEntries);
  const hasSpellSlots = columns.some((column) => column.kind === "spell-slot");
  const spellSlotColumns = columns.filter(
    (column): column is SpellSlotColumn => column.kind === "spell-slot"
  );

  return (
    <div className={styles.scrollArea}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.levelHeader} rowSpan={hasSpellSlots ? 2 : 1} scope="col">
              Lvl
            </th>
            {columns.map((column) => {
              if (column.kind === "spell-slot") {
                if (column.index > 0) {
                  return null;
                }

                return (
                  <th
                    key="spell-slots"
                    className={styles.groupHeader}
                    colSpan={spellSlotColumns.length}
                    scope="colgroup"
                    title="Spell Slots"
                  >
                    Spell Slots
                  </th>
                );
              }

              return (
                <th
                  key={column.kind === "features" ? "features" : column.key}
                  rowSpan={hasSpellSlots ? 2 : 1}
                  scope="col"
                  title={column.title}
                >
                  {column.label}
                </th>
              );
            })}
          </tr>
          {hasSpellSlots ? (
            <tr>
              {spellSlotColumns.map((column) => (
                <th key={`spell-slot-${column.index}`} scope="col" title={column.title}>
                  {column.label}
                </th>
              ))}
            </tr>
          ) : null}
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.level}>
              <th className={styles.levelCell} scope="row">
                {row.level}
              </th>
              {columns.map((column) => (
                <td
                  key={
                    column.kind === "spell-slot"
                      ? `spell-slot-${column.index}`
                      : column.kind === "features"
                        ? "features"
                        : column.key
                  }
                  className={
                    column.kind === "features"
                      ? `${styles.valueCell} ${styles.featureCell}`
                      : styles.valueCell
                  }
                >
                  {formatCellValue(row, column, subclassUnlockLevels)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClassProgressionTable;
