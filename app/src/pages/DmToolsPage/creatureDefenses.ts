import { DAMAGE_TYPE } from "../../codex/entries/enums";
import { CONDITION_NAME } from "../../types/traits";

export type DefenseFieldKey =
  | "conditionImmunities"
  | "damageImmunities"
  | "damageResistances"
  | "damageVulnerabilities";

export type DefenseField = {
  displayKey: string;
  key: DefenseFieldKey;
  kind: "condition" | "damage";
  label: string;
  referencesKey: string;
};

export const DEFENSE_FIELDS: DefenseField[] = [
  {
    displayKey: "damage_resistances_display",
    key: "damageResistances",
    kind: "damage",
    label: "Resistances",
    referencesKey: "damage_resistances"
  },
  {
    displayKey: "damage_immunities_display",
    key: "damageImmunities",
    kind: "damage",
    label: "Damage immunities",
    referencesKey: "damage_immunities"
  },
  {
    displayKey: "damage_vulnerabilities_display",
    key: "damageVulnerabilities",
    kind: "damage",
    label: "Vulnerabilities",
    referencesKey: "damage_vulnerabilities"
  },
  {
    displayKey: "condition_immunities_display",
    key: "conditionImmunities",
    kind: "condition",
    label: "Condition (status) immunities",
    referencesKey: "condition_immunities"
  }
];

export type DefenseOption = { label: string; value: string };

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DAMAGE_TYPE_OPTIONS: DefenseOption[] = Object.values(DAMAGE_TYPE).map((type) => ({
  label: capitalize(type.toLowerCase()),
  value: type.toLowerCase()
}));

const CONDITION_OPTIONS: DefenseOption[] = Object.values(CONDITION_NAME).map((name) => ({
  label: name,
  value: name.toLowerCase()
}));

export function getDefenseOptions(kind: DefenseField["kind"]) {
  return kind === "damage" ? DAMAGE_TYPE_OPTIONS : CONDITION_OPTIONS;
}

export function splitDefenseText(text: string) {
  return text
    .split(/[;,]/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/** Matches the ids the server builds when it filters what players see. */
export function getDefenseEntryId(field: DefenseFieldKey, entry: string) {
  return `${field}:${entry.trim().toLowerCase()}`;
}

function referenceNames(references: unknown) {
  return Array.isArray(references)
    ? references
        .map((entry) =>
          entry && typeof entry === "object" ? (entry as { name?: unknown }).name : null
        )
        .filter((name): name is string => typeof name === "string")
        .join(", ")
    : "";
}

/** The creature's saved defenses as lowercase entries per field. */
export function getCreatureDefenseEntries(creature: {
  inheritedCreatureEntry?: { resistances_and_immunities?: unknown } | null;
}) {
  const defenses = creature.inheritedCreatureEntry?.resistances_and_immunities as
    | Record<string, unknown>
    | null
    | undefined;

  return Object.fromEntries(
    DEFENSE_FIELDS.map(({ displayKey, key, referencesKey }) => {
      const display = defenses?.[displayKey];
      const text =
        typeof display === "string" && display.trim()
          ? display
          : referenceNames(defenses?.[referencesKey]);

      return [key, splitDefenseText(text)];
    })
  ) as Record<DefenseFieldKey, string[]>;
}

/** Keeps only the entries the GM revealed; without a reveal list everything stays visible. */
export function filterRevealedDefenses(
  defenses: Record<string, unknown> | undefined,
  revealed: string[] | undefined
) {
  if (!revealed || !defenses) {
    return defenses;
  }

  const next = { ...defenses };

  DEFENSE_FIELDS.forEach(({ displayKey, key, referencesKey }) => {
    const isRevealed = (name: string) => revealed.includes(getDefenseEntryId(key, name));
    const text = next[displayKey];

    if (typeof text === "string") {
      const kept = text
        .split(/[;,]/)
        .map((entry) => entry.trim())
        .filter((entry) => entry && isRevealed(entry));

      next[displayKey] = kept.length > 0 ? kept.join(", ") : null;
    }

    const entries = next[referencesKey];

    if (Array.isArray(entries)) {
      next[referencesKey] = entries.filter(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          isRevealed(String((entry as { name?: unknown }).name))
      );
    }
  });

  return next;
}
