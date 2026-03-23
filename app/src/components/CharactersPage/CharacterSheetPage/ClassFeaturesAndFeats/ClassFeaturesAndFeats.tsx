import clsx from "clsx";
import { BadgeAlert, BadgeCheck, BadgeX, ChevronDown, Pencil, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  FEAT_CATEGORY,
  FEATS,
  FeatureMap,
  KeywordTooltip,
  getFeatureTrackingState,
  hardcodedCodexEntries,
  type ClassEntry,
  type FeatureMapEntry,
  type KeywordTooltipEntry
} from "../../../../codex/entries";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import {
  createCharacterFeatEntry,
  getAbilityScoreImprovementSummary,
  getCharacterFeatSummary,
  getEpicBoonAbilityChoiceSummary,
  getEpicBoonAbilityOptions,
  getFeatCategoryLabel,
  getFeatDefinition,
  getFeatDefinitionsByCategory,
  featDefinitions,
  getSkilledChoiceSummary
} from "../../../../pages/CharactersPage/feats";
import {
  classFeatureKeywordAliases,
  getKeywordDescription
} from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  addFeatGrantedSkillEntries,
  addFeatGrantedToolEntries,
  getToolProficiencyLabel,
  removeFeatGrantedSkillEntries,
  removeFeatGrantedToolEntries,
  skillsOptions,
  toolProficiencyOptions,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiency";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type {
  AbilityKey,
  Character,
  CharacterFeatEntry,
  SkillName,
  SkilledChoice,
  SkilledFeatSelection
} from "../../../../types";
import { formatCodexLabel } from "../../../../utils/codex";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import InlineToggleButton from "../InlineToggleButton";
import styles from "./ClassFeaturesAndFeats.module.css";

type ClassFeaturesAndFeatsProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type FeatureRow = {
  key: string;
  level: number;
  feature: CLASS_FEATURE;
  details: FeatureMapEntry;
};

type SelectedKeyword = {
  key: string;
  title: string;
  description: string[];
};

type SelectedFeatReference = {
  entry?: CharacterFeatEntry;
  feat: FEATS;
};

type PendingAbilityScoreImprovement = {
  mode: "single" | "split";
  primaryAbility: AbilityKey;
  secondaryAbility: AbilityKey;
};

type PendingBoonOfIrresistibleOffense = {
  ability: "STR" | "DEX";
};

type PendingEpicBoonAbilityChoice = {
  feat: FEATS;
  ability: AbilityKey;
};

type PendingSkilledChoice = {
  selections: [string, string, string];
};

const trackingBadgeConfig = {
  tracked: {
    label: "Tracked",
    icon: BadgeCheck,
    className: "featureTrackingButtonTracked"
  },
  "semi-tracked": {
    label: "Semi Tracked",
    icon: BadgeAlert,
    className: "featureTrackingButtonSemiTracked"
  },
  "not-tracked": {
    label: "Not Tracked",
    icon: BadgeX,
    className: "featureTrackingButtonNotTracked"
  }
} as const;

const featCategoryTabs: FEAT_CATEGORY[] = [
  FEAT_CATEGORY.ORIGIN,
  FEAT_CATEGORY.GENERAL,
  FEAT_CATEGORY.FIGHTING_STYLE,
  FEAT_CATEGORY.EPIC_BOON
];
const skilledSelectionIndices = [0, 1, 2] as const;
const skilledSkillOptionSet = new Set<string>(skillsOptions);
const skilledToolOptionSet = new Set<string>(toolProficiencyOptions);
const skilledNoneOptionValue = "none";

const classEntriesByName = new Map<string, ClassEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is ClassEntry => entry.category === ENTRY_CATEGORIES.CLASSES)
    .map((entry) => [entry.name, entry])
);

const inlineMarkupPattern = /<strong>(.*?)<\/strong>|<link:([^>]+)>(.*?)<\/link>/g;
type AutoLinkTarget =
  | {
      kind: "keyword";
      keyword: string;
    }
  | {
      kind: "feat";
      feat: FEATS;
    };

const tooltipKeywordAliases = [
  { matchText: "Short Rest", keyword: "short-rest" },
  { matchText: "Long Rest", keyword: "long-rest" },
  { matchText: "Resistance", keyword: "resistance" }
] as const;
const featReferenceAliases = featDefinitions.map((definition) => ({
  matchText: definition.label,
  feat: definition.feat
}));
const featureAutoLinkAliases = [
  ...tooltipKeywordAliases.map(
    ({ matchText, keyword }): { matchText: string; target: AutoLinkTarget } => ({
      matchText,
      target: {
        kind: "keyword",
        keyword
      }
    })
  ),
  ...classFeatureKeywordAliases.map(
    ({ matchText, keyword }): { matchText: string; target: AutoLinkTarget } => ({
      matchText,
      target: {
        kind: "keyword",
        keyword
      }
    })
  ),
  ...featReferenceAliases.map(
    ({ matchText, feat }): { matchText: string; target: AutoLinkTarget } => ({
      matchText,
      target: {
        kind: "feat",
        feat
      }
    })
  )
] as const;
const featureAutoLinkLookup = new Map(
  featureAutoLinkAliases.map(({ matchText, target }) => [matchText.toLowerCase(), target])
);
const featureAutoLinkPatternSource = [...featureAutoLinkAliases]
  .sort((left, right) => right.matchText.length - left.matchText.length)
  .map(({ matchText }) => matchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

function createDefaultPendingAbilityScoreImprovement(): PendingAbilityScoreImprovement {
  return {
    mode: "single",
    primaryAbility: "STR",
    secondaryAbility: "DEX"
  };
}

function createDefaultPendingBoonOfIrresistibleOffense(): PendingBoonOfIrresistibleOffense {
  return {
    ability: "STR"
  };
}

function createDefaultPendingEpicBoonAbilityChoice(
  feat: FEATS
): PendingEpicBoonAbilityChoice | null {
  const abilityOptions = getEpicBoonAbilityOptions(feat);

  if (!abilityOptions || abilityOptions.length === 0) {
    return null;
  }

  return {
    feat,
    ability: abilityOptions[0]
  };
}

function decodeSkilledSelection(value: string): SkilledFeatSelection | null {
  if (value === skilledNoneOptionValue) {
    return null;
  }

  if (value.startsWith("skill:")) {
    const skill = value.slice("skill:".length) as SkillName;

    if (skilledSkillOptionSet.has(skill)) {
      return {
        kind: "skill",
        skill
      };
    }

    return null;
  }

  if (value.startsWith("tool:")) {
    const tool = value.slice("tool:".length) as ToolProficiency;

    if (skilledToolOptionSet.has(tool)) {
      return {
        kind: "tool",
        tool
      };
    }
  }

  return null;
}

function decodePendingSkilledChoice(choice: PendingSkilledChoice): SkilledChoice | null {
  const selections = choice.selections
    .map((selection) => decodeSkilledSelection(selection))
    .filter((selection): selection is SkilledFeatSelection => selection !== null);

  if (selections.length !== 3) {
    return null;
  }

  return {
    selections: selections as SkilledChoice["selections"]
  };
}

function createDefaultPendingSkilledChoice(): PendingSkilledChoice {
  return {
    selections: [skilledNoneOptionValue, skilledNoneOptionValue, skilledNoneOptionValue]
  };
}

function isPendingSkilledChoiceValid(choice: PendingSkilledChoice): boolean {
  return new Set(choice.selections).size === choice.selections.length && decodePendingSkilledChoice(choice) !== null;
}

function getPendingSkilledChoiceSummary(choice: PendingSkilledChoice): string | null {
  return getSkilledChoiceSummary(decodePendingSkilledChoice(choice) ?? undefined);
}

function splitSkilledSelections(choice?: SkilledChoice): {
  skills: SkillName[];
  tools: ToolProficiency[];
} {
  return (choice?.selections ?? []).reduce<{
    skills: SkillName[];
    tools: ToolProficiency[];
  }>(
    (result, selection) => {
      if (selection.kind === "skill") {
        result.skills.push(selection.skill);
      } else {
        result.tools.push(selection.tool);
      }

      return result;
    },
    {
      skills: [],
      tools: []
    }
  );
}

function resolveKeywordReference(
  keywordKey: string,
  fallbackTitle?: string
): KeywordTooltipEntry | null {
  const tooltip = KeywordTooltip[keywordKey];

  if (tooltip) {
    return tooltip;
  }

  const description = getKeywordDescription(keywordKey);

  if (!description) {
    return null;
  }

  return {
    title: fallbackTitle ?? keywordKey,
    description: [description]
  };
}

function renderAutoLinkedText(
  text: string,
  onOpenKeyword: (keywordKey: string, title?: string) => void,
  onOpenFeat: (feat: FEATS) => void
): ReactNode {
  if (!text || !featureAutoLinkPatternSource) {
    return text;
  }

  const nodes: ReactNode[] = [];
  const keywordPattern = new RegExp(featureAutoLinkPatternSource, "gi");
  let cursor = 0;

  for (const match of text.matchAll(keywordPattern)) {
    const index = match.index ?? 0;
    const matchedText = match[0];

    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }

    const target = featureAutoLinkLookup.get(matchedText.toLowerCase());

    if (target?.kind === "feat") {
      nodes.push(
        <button
          key={`${target.feat}-${index}`}
          type="button"
          className={styles.keywordButton}
          onClick={() => onOpenFeat(target.feat)}
        >
          {matchedText}
        </button>
      );
    } else {
      const keywordKey = target?.kind === "keyword" ? target.keyword : matchedText;
      const resolvedKeyword = resolveKeywordReference(keywordKey, matchedText);

      nodes.push(
        resolvedKeyword ? (
          <button
            key={`${keywordKey}-${index}`}
            type="button"
            className={styles.keywordButton}
            onClick={() => onOpenKeyword(keywordKey)}
          >
            {matchedText}
          </button>
        ) : (
          matchedText
        )
      );
    }

    cursor = index + matchedText.length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes.length > 0 ? nodes : text;
}

function renderDescriptionLine(
  line: string,
  onOpenKeyword: (keywordKey: string, title?: string) => void,
  onOpenFeat: (feat: FEATS) => void
): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(inlineMarkupPattern)) {
    const index = match.index ?? 0;

    if (index > cursor) {
      nodes.push(renderAutoLinkedText(line.slice(cursor, index), onOpenKeyword, onOpenFeat));
    }

    if (match[1]) {
      nodes.push(<strong key={`${match[1]}-${index}`}>{match[1]}</strong>);
    }

    if (match[2]) {
      const keywordKey = match[2];
      const label = match[3] ?? keywordKey;
      const resolvedKeyword = resolveKeywordReference(keywordKey, label);

      nodes.push(
        resolvedKeyword ? (
          <button
            key={`${keywordKey}-${index}`}
            type="button"
            className={styles.keywordButton}
            onClick={() => onOpenKeyword(keywordKey, label)}
          >
            {label}
          </button>
        ) : (
          label
        )
      );
    }

    cursor = index + match[0].length;
  }

  if (cursor < line.length) {
    nodes.push(renderAutoLinkedText(line.slice(cursor), onOpenKeyword, onOpenFeat));
  }

  return nodes.length > 0 ? nodes : line;
}

function ClassFeaturesAndFeats({ className, onPersistCharacter }: ClassFeaturesAndFeatsProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFutureFeaturesVisible, setIsFutureFeaturesVisible] = useState(false);
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<string[]>([]);
  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);
  const [activeFeatCategory, setActiveFeatCategory] = useState<FEAT_CATEGORY>(
    FEAT_CATEGORY.GENERAL
  );
  const [pendingAbilityScoreImprovement, setPendingAbilityScoreImprovement] =
    useState<PendingAbilityScoreImprovement | null>(null);
  const [pendingBoonOfIrresistibleOffense, setPendingBoonOfIrresistibleOffense] =
    useState<PendingBoonOfIrresistibleOffense | null>(null);
  const [pendingEpicBoonAbilityChoice, setPendingEpicBoonAbilityChoice] =
    useState<PendingEpicBoonAbilityChoice | null>(null);
  const [pendingSkilledChoice, setPendingSkilledChoice] = useState<PendingSkilledChoice | null>(
    null
  );
  const [selectedFeatReference, setSelectedFeatReference] = useState<SelectedFeatReference | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedKeyword | null>(null);

  useBodyScrollLock(Boolean(selectedKeyword) || Boolean(selectedFeatReference) || isFeatModalOpen);

  useEffect(() => {
    if (!selectedKeyword && !selectedFeatReference && !isFeatModalOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedKeyword) {
          setSelectedKeyword(null);
          return;
        }

        if (selectedFeatReference) {
          setSelectedFeatReference(null);
          return;
        }

        if (isFeatModalOpen) {
          setPendingAbilityScoreImprovement(null);
          setPendingBoonOfIrresistibleOffense(null);
          setPendingEpicBoonAbilityChoice(null);
          setPendingSkilledChoice(null);
          setIsFeatModalOpen(false);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFeatModalOpen, selectedFeatReference, selectedKeyword]);

  const classEntry = classEntriesByName.get(character.className) ?? null;
  const allFeatures = useMemo<FeatureRow[]>(() => {
    if (!classEntry) {
      return [];
    }

    return classEntry.features.flatMap((featureRow) =>
      featureRow.classFeatures.map((feature, index) => ({
        key: `${featureRow.level}-${feature}-${index}`,
        level: featureRow.level,
        feature,
        details: featureRow.featureOverrides?.[feature] ?? FeatureMap[feature]
      }))
    );
  }, [classEntry]);

  const unlockedFeatures = useMemo(
    () => allFeatures.filter((featureRow) => featureRow.level <= character.level),
    [allFeatures, character.level]
  );
  const futureFeatures = useMemo(
    () => allFeatures.filter((featureRow) => featureRow.level > character.level),
    [allFeatures, character.level]
  );
  const featDefinitionsByCategory = useMemo(() => getFeatDefinitionsByCategory(), []);
  const selectedFeats = character.feats ?? [];
  const selectedFeatDefinition = selectedFeatReference
    ? getFeatDefinition(selectedFeatReference.feat)
    : null;

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

  function closeFeatEditor() {
    setPendingAbilityScoreImprovement(null);
    setPendingBoonOfIrresistibleOffense(null);
    setPendingEpicBoonAbilityChoice(null);
    setPendingSkilledChoice(null);
    setIsFeatModalOpen(false);
  }

  function openFeatEditor() {
    setPendingAbilityScoreImprovement(null);
    setPendingBoonOfIrresistibleOffense(null);
    setPendingEpicBoonAbilityChoice(null);
    setPendingSkilledChoice(null);
    setActiveFeatCategory(FEAT_CATEGORY.GENERAL);
    setIsFeatModalOpen(true);
  }

  function updateCharacterFeats(
    updater: (currentFeats: CharacterFeatEntry[]) => CharacterFeatEntry[]
  ) {
    const nextFeats = updater(character.feats ?? []);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      feats: nextFeats
    }));
  }

  function removeFeat(entryToRemove: CharacterFeatEntry) {
    if (entryToRemove.feat !== FEATS.SKILLED || !entryToRemove.skilled) {
      updateCharacterFeats((current) => current.filter((entry) => entry.id !== entryToRemove.id));
      return;
    }

    const { skills, tools } = splitSkilledSelections(entryToRemove.skilled);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      feats: (currentCharacter.feats ?? []).filter((entry) => entry.id !== entryToRemove.id),
      skillProficiencies: removeFeatGrantedSkillEntries(
        currentCharacter.skillProficiencies ?? [],
        skills,
        "Skilled",
        entryToRemove.id
      ),
      toolProficiencies: removeFeatGrantedToolEntries(
        currentCharacter.toolProficiencies ?? [],
        tools,
        "Skilled",
        entryToRemove.id
      )
    }));

    setSelectedFeatReference((current) =>
      current?.entry?.id === entryToRemove.id ? null : current
    );
  }

  function addFeat(feat: FEATS) {
    if (feat === FEATS.ABILITY_SCORE_IMPROVEMENT) {
      setPendingBoonOfIrresistibleOffense(null);
      setPendingEpicBoonAbilityChoice(null);
      setPendingSkilledChoice(null);
      setPendingAbilityScoreImprovement(createDefaultPendingAbilityScoreImprovement());
      return;
    }

    if (feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) {
      setPendingAbilityScoreImprovement(null);
      setPendingEpicBoonAbilityChoice(null);
      setPendingSkilledChoice(null);
      setPendingBoonOfIrresistibleOffense(createDefaultPendingBoonOfIrresistibleOffense());
      return;
    }

    const pendingEpicBoon = createDefaultPendingEpicBoonAbilityChoice(feat);

    if (pendingEpicBoon) {
      setPendingAbilityScoreImprovement(null);
      setPendingBoonOfIrresistibleOffense(null);
      setPendingSkilledChoice(null);
      setPendingEpicBoonAbilityChoice(pendingEpicBoon);
      return;
    }

    if (feat === FEATS.SKILLED) {
      setPendingAbilityScoreImprovement(null);
      setPendingBoonOfIrresistibleOffense(null);
      setPendingEpicBoonAbilityChoice(null);
      setPendingSkilledChoice(createDefaultPendingSkilledChoice());
      return;
    }

    setPendingAbilityScoreImprovement(null);
    setPendingBoonOfIrresistibleOffense(null);
    setPendingEpicBoonAbilityChoice(null);
    setPendingSkilledChoice(null);
    updateCharacterFeats((current) => [...current, createCharacterFeatEntry(feat, character.level)]);
  }

  function savePendingAbilityScoreImprovement() {
    if (!pendingAbilityScoreImprovement) {
      return;
    }

    if (
      pendingAbilityScoreImprovement.mode === "split" &&
      pendingAbilityScoreImprovement.primaryAbility === pendingAbilityScoreImprovement.secondaryAbility
    ) {
      return;
    }

    updateCharacterFeats((current) => [
      ...current,
      createCharacterFeatEntry(FEATS.ABILITY_SCORE_IMPROVEMENT, character.level, {
        abilityScoreImprovement: pendingAbilityScoreImprovement
      })
    ]);
    setPendingAbilityScoreImprovement(null);
  }

  function savePendingBoonOfIrresistibleOffense() {
    if (!pendingBoonOfIrresistibleOffense) {
      return;
    }

    updateCharacterFeats((current) => [
      ...current,
      createCharacterFeatEntry(FEATS.BOON_OF_IRRESISTIBLE_OFFENSE, character.level, {
        boonOfIrresistibleOffense: pendingBoonOfIrresistibleOffense
      })
    ]);
    setPendingBoonOfIrresistibleOffense(null);
  }

  function savePendingEpicBoonAbilityChoice() {
    if (!pendingEpicBoonAbilityChoice) {
      return;
    }

    updateCharacterFeats((current) => [
      ...current,
      createCharacterFeatEntry(pendingEpicBoonAbilityChoice.feat, character.level, {
        epicBoonAbilityChoice: {
          ability: pendingEpicBoonAbilityChoice.ability
        }
      })
    ]);
    setPendingEpicBoonAbilityChoice(null);
  }

  function savePendingSkilledChoice() {
    if (!pendingSkilledChoice || !isPendingSkilledChoiceValid(pendingSkilledChoice)) {
      return;
    }

    const skilled = decodePendingSkilledChoice(pendingSkilledChoice);

    if (!skilled) {
      return;
    }

    const featEntry = createCharacterFeatEntry(FEATS.SKILLED, character.level, {
      skilled
    });
    const { skills, tools } = splitSkilledSelections(skilled);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      feats: [...(currentCharacter.feats ?? []), featEntry],
      skillProficiencies: addFeatGrantedSkillEntries(
        currentCharacter.skillProficiencies ?? [],
        skills,
        "Skilled",
        featEntry.id
      ),
      toolProficiencies: addFeatGrantedToolEntries(
        currentCharacter.toolProficiencies ?? [],
        tools,
        "Skilled",
        featEntry.id
      )
    }));

    setPendingSkilledChoice(null);
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

  function renderFeatureList(features: FeatureRow[]) {
    return (
      <ul className={styles.featureList}>
        {features.map((featureRow) => {
          const featureDetails = featureRow.details;
          const trackingKeywordKey = getFeatureTrackingState(featureDetails);
          const trackingBadge = trackingBadgeConfig[trackingKeywordKey];
          const isFeatureExpanded = expandedFeatureKeys.includes(featureRow.key);
          const featurePanelId = `class-feature-panel-${featureRow.key}`;

          return (
            <li key={featureRow.key} className={styles.featureItem}>
              <div className={styles.featureHeadingRow}>
                <button
                  type="button"
                  className={styles.featureToggleButton}
                  onClick={() => toggleFeature(featureRow.key)}
                  aria-expanded={isFeatureExpanded}
                  aria-controls={featurePanelId}
                >
                  <span className={styles.featureHeading}>
                    {`Level ${featureRow.level}: ${formatCodexLabel(featureRow.feature)}`}
                  </span>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={clsx(
                      styles.featureToggleIcon,
                      !isFeatureExpanded && styles.featureToggleIconCollapsed
                    )}
                  />
                </button>
                <button
                  type="button"
                  className={clsx(
                    styles.featureTrackingButton,
                    styles[trackingBadge.className]
                  )}
                  onClick={() => openKeyword(trackingKeywordKey)}
                >
                  <trackingBadge.icon size={18} aria-hidden="true" />
                  <span>{trackingBadge.label}</span>
                </button>
              </div>

              {isFeatureExpanded ? (
                featureDetails.description.length > 0 ? (
                  <div id={featurePanelId} className={styles.descriptionList}>
                    {featureDetails.description.map((line, index) => (
                      <p key={`${featureRow.key}-line-${index}`} className={styles.descriptionLine}>
                        {renderDescriptionLine(line, openKeyword, (feat) => openFeatReference(feat))}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p id={featurePanelId} className={styles.emptyFeatureText}>
                    Details coming soon.
                  </p>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  function renderTrackingButton(trackingState: "tracked" | "semi-tracked" | "not-tracked") {
    const trackingBadge = trackingBadgeConfig[trackingState];

    return (
      <button
        type="button"
        className={clsx(styles.featureTrackingButton, styles[trackingBadge.className])}
        onClick={(event) => {
          event.stopPropagation();
          openKeyword(trackingState);
        }}
      >
        <trackingBadge.icon size={18} aria-hidden="true" />
        <span>{trackingBadge.label}</span>
      </button>
    );
  }

  function renderFeatCards(
    featsToRender: CharacterFeatEntry[],
    options?: {
      emptyText?: string;
    }
  ) {
    if (featsToRender.length === 0) {
      return <p className={shared.emptyText}>{options?.emptyText ?? "No feats added yet."}</p>;
    }

    const groupedEntries = featsToRender.reduce<Array<{ feat: FEATS; entries: CharacterFeatEntry[] }>>(
      (groups, entry) => {
        const existingGroup = groups.find((group) => group.feat === entry.feat);

        if (existingGroup) {
          existingGroup.entries.push(entry);
          return groups;
        }

        groups.push({
          feat: entry.feat,
          entries: [entry]
        });
        return groups;
      },
      []
    );

    return (
      <ul className={styles.featList}>
        {groupedEntries.map(({ feat, entries }) => {
          const featDefinition = getFeatDefinition(feat);

          if (!featDefinition) {
            return null;
          }

          const trackingState = getFeatureTrackingState(featDefinition);
          const isRepeatable = Boolean(featDefinition.repeatable);
          const firstEntry = entries[0];
          const featSummary = firstEntry ? getCharacterFeatSummary(firstEntry) : null;

          return (
            <li
              key={featDefinition.feat}
              className={clsx(styles.featItem, styles.featItemInteractive)}
              role="button"
              tabIndex={0}
              onClick={() => openFeatReference(featDefinition.feat)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFeatReference(featDefinition.feat);
                }
              }}
            >
              <div className={styles.featHeaderRow}>
                <div className={styles.featNameButton}>
                  <span className={styles.featName}>{featDefinition.label}</span>
                  {isRepeatable ? (
                    <span className={styles.featOptionRepeatable}>(repeatable)</span>
                  ) : null}
                </div>
                <div className={styles.featHeaderActions}>
                  {renderTrackingButton(trackingState)}
                </div>
              </div>
              <p className={styles.featMeta}>{getFeatCategoryLabel(featDefinition.category)}</p>
              {isRepeatable ? (
                <ul className={styles.featSelectedList}>
                  {entries.map((entry) => {
                    const summary = getCharacterFeatSummary(entry);

                    return (
                      <li key={entry.id} className={styles.featSelectedItem}>
                        <span className={styles.featSelectedText}>
                          {summary ? `Picked: ${summary}` : "Picked"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : featSummary ? (
                <p className={styles.featSummary}>{featSummary}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  function renderAvailableFeatList() {
    return (
      <div className={styles.featOptionList}>
        {featDefinitionsByCategory[activeFeatCategory].map((featDefinition) => {
          const selectedEntries = selectedFeats.filter((entry) => entry.feat === featDefinition.feat);
          const selectedCount = selectedEntries.length;
          const isRepeatable = Boolean(featDefinition.repeatable);
          const isAddDisabled = !isRepeatable && selectedCount > 0;
          const isSelected = selectedCount > 0;
          const trackingState = getFeatureTrackingState(featDefinition);
          const isPendingAbilityScoreImprovement =
            featDefinition.feat === FEATS.ABILITY_SCORE_IMPROVEMENT &&
            pendingAbilityScoreImprovement !== null;
          const isPendingBoonOfIrresistibleOffense =
            featDefinition.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE &&
            pendingBoonOfIrresistibleOffense !== null;
          const isPendingEpicBoonAbilityChoice =
            pendingEpicBoonAbilityChoice?.feat === featDefinition.feat;
          const isPendingSkilled =
            featDefinition.feat === FEATS.SKILLED && pendingSkilledChoice !== null;

          return (
            <article
              key={featDefinition.feat}
              className={clsx(styles.featOptionCard, isSelected && styles.featOptionCardSelected)}
              role="button"
              tabIndex={0}
              onClick={() => openFeatReference(featDefinition.feat)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFeatReference(featDefinition.feat);
                }
              }}
            >
              <div className={styles.featOptionHeader}>
                <div className={styles.featOptionTitleBlock}>
                  <span className={styles.featOptionTitle}>{featDefinition.label}</span>
                  {featDefinition.repeatable ? (
                    <span className={styles.featOptionRepeatable}>(repeatable)</span>
                  ) : null}
                </div>
                {renderTrackingButton(trackingState)}
              </div>
              {featDefinition.prerequisite ? (
                <p className={styles.featMeta}>{`Prerequisite: ${featDefinition.prerequisite}`}</p>
              ) : null}
              {isRepeatable && selectedEntries.length > 0 ? (
                <ul className={styles.featSelectedList}>
                  {selectedEntries.map((entry) => {
                    const summary = getCharacterFeatSummary(entry);

                    return (
                      <li key={entry.id} className={styles.featSelectedItem}>
                        <span className={styles.featSelectedText}>
                          {summary ? `Picked: ${summary}` : "Picked"}
                        </span>
                        <button
                          type="button"
                          className={styles.featSelectedRemoveButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeFeat(entry);
                          }}
                          aria-label={`Remove ${featDefinition.label}`}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {isPendingAbilityScoreImprovement && pendingAbilityScoreImprovement ? (
                <section
                  className={clsx(styles.asiEditorCard, styles.featInlineEditor)}
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.asiEditorHeader}>
                    <p className={styles.featSelectionTitle}>Ability Score Improvement</p>
                    <button
                      type="button"
                      className={styles.featRemoveButton}
                      onClick={() => setPendingAbilityScoreImprovement(null)}
                      aria-label="Cancel ability score improvement selection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.asiModeRow}>
                    <button
                      type="button"
                      className={clsx(
                        styles.asiModeButton,
                        pendingAbilityScoreImprovement.mode === "single" &&
                          styles.asiModeButtonActive
                      )}
                      onClick={() =>
                        setPendingAbilityScoreImprovement((current) =>
                          current
                            ? {
                                ...current,
                                mode: "single"
                              }
                            : current
                        )
                      }
                    >
                      +2 to one ability
                    </button>
                    <button
                      type="button"
                      className={clsx(
                        styles.asiModeButton,
                        pendingAbilityScoreImprovement.mode === "split" &&
                          styles.asiModeButtonActive
                      )}
                      onClick={() =>
                        setPendingAbilityScoreImprovement((current) =>
                          current
                            ? {
                                ...current,
                                mode: "split"
                              }
                            : current
                        )
                      }
                    >
                      +1 and +1
                    </button>
                  </div>
                  <div className={styles.asiAbilityGrid}>
                    <label className={styles.asiField}>
                      <span>
                        {pendingAbilityScoreImprovement.mode === "single"
                          ? "Ability"
                          : "First ability"}
                      </span>
                      <select
                        className={styles.asiSelect}
                        value={pendingAbilityScoreImprovement.primaryAbility}
                        onChange={(event) =>
                          setPendingAbilityScoreImprovement((current) =>
                            current
                              ? {
                                  ...current,
                                  primaryAbility: event.target.value as AbilityKey
                                }
                              : current
                          )
                        }
                      >
                        {abilityKeys.map((ability) => (
                          <option key={ability} value={ability}>
                            {ability}
                          </option>
                        ))}
                      </select>
                    </label>
                    {pendingAbilityScoreImprovement.mode === "split" ? (
                      <label className={styles.asiField}>
                        <span>Second ability</span>
                        <select
                          className={styles.asiSelect}
                          value={pendingAbilityScoreImprovement.secondaryAbility}
                          onChange={(event) =>
                            setPendingAbilityScoreImprovement((current) =>
                              current
                                ? {
                                    ...current,
                                    secondaryAbility: event.target.value as AbilityKey
                                  }
                                : current
                            )
                          }
                        >
                          {abilityKeys.map((ability) => (
                            <option key={ability} value={ability}>
                              {ability}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>
                  <p className={styles.asiSummary}>
                    {getAbilityScoreImprovementSummary(pendingAbilityScoreImprovement)}
                  </p>
                  <div className={styles.asiActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      disabled={
                        pendingAbilityScoreImprovement.mode === "split" &&
                        pendingAbilityScoreImprovement.primaryAbility ===
                          pendingAbilityScoreImprovement.secondaryAbility
                      }
                      onClick={savePendingAbilityScoreImprovement}
                    >
                      <Plus size={16} />
                      Add Feat
                    </button>
                  </div>
                </section>
              ) : null}
              {isPendingBoonOfIrresistibleOffense && pendingBoonOfIrresistibleOffense ? (
                <section
                  className={clsx(styles.asiEditorCard, styles.featInlineEditor)}
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.asiEditorHeader}>
                    <p className={styles.featSelectionTitle}>Boon of Irresistible Offense</p>
                    <button
                      type="button"
                      className={styles.featRemoveButton}
                      onClick={() => setPendingBoonOfIrresistibleOffense(null)}
                      aria-label="Cancel boon of irresistible offense selection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.asiAbilityGridSingle}>
                    <label className={styles.asiField}>
                      <span>Ability</span>
                      <select
                        className={styles.asiSelect}
                        value={pendingBoonOfIrresistibleOffense.ability}
                        onChange={(event) =>
                          setPendingBoonOfIrresistibleOffense({
                            ability: event.target.value as "STR" | "DEX"
                          })
                        }
                      >
                        <option value="STR">STR</option>
                        <option value="DEX">DEX</option>
                      </select>
                    </label>
                  </div>
                  <p className={styles.asiSummary}>
                    {`${pendingBoonOfIrresistibleOffense.ability} +1 (max 30)`}
                  </p>
                  <div className={styles.asiActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      onClick={savePendingBoonOfIrresistibleOffense}
                    >
                      <Plus size={16} />
                      Add Feat
                    </button>
                  </div>
                </section>
              ) : null}
              {isPendingEpicBoonAbilityChoice && pendingEpicBoonAbilityChoice ? (
                <section
                  className={clsx(styles.asiEditorCard, styles.featInlineEditor)}
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.asiEditorHeader}>
                    <p className={styles.featSelectionTitle}>{featDefinition.label}</p>
                    <button
                      type="button"
                      className={styles.featRemoveButton}
                      onClick={() => setPendingEpicBoonAbilityChoice(null)}
                      aria-label={`Cancel ${featDefinition.label} selection`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.asiAbilityGridSingle}>
                    <label className={styles.asiField}>
                      <span>Ability</span>
                      <select
                        className={styles.asiSelect}
                        value={pendingEpicBoonAbilityChoice.ability}
                        onChange={(event) =>
                          setPendingEpicBoonAbilityChoice((current) =>
                            current
                              ? {
                                  ...current,
                                  ability: event.target.value as AbilityKey
                                }
                              : current
                          )
                        }
                      >
                        {(getEpicBoonAbilityOptions(featDefinition.feat) ?? []).map((ability) => (
                          <option key={ability} value={ability}>
                            {ability}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className={styles.asiSummary}>
                    {getEpicBoonAbilityChoiceSummary({
                      ability: pendingEpicBoonAbilityChoice.ability
                    })}
                    {" (max 30)"}
                  </p>
                  <div className={styles.asiActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      onClick={savePendingEpicBoonAbilityChoice}
                    >
                      <Plus size={16} />
                      Add Feat
                    </button>
                  </div>
                </section>
              ) : null}
              {isPendingSkilled && pendingSkilledChoice ? (
                <section
                  className={clsx(styles.asiEditorCard, styles.featInlineEditor)}
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.asiEditorHeader}>
                    <p className={styles.featSelectionTitle}>Skilled</p>
                    <button
                      type="button"
                      className={styles.featRemoveButton}
                      onClick={() => setPendingSkilledChoice(null)}
                      aria-label="Cancel skilled selection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.asiAbilityGridSingle}>
                    {skilledSelectionIndices.map((selectionIndex) => (
                      <label
                        key={`${featDefinition.feat}-selection-${selectionIndex}`}
                        className={styles.asiField}
                      >
                        <span>{`Choice ${selectionIndex + 1}`}</span>
                        <select
                          className={styles.asiSelect}
                          value={pendingSkilledChoice.selections[selectionIndex]}
                          onChange={(event) =>
                            setPendingSkilledChoice((current) => {
                              if (!current) {
                                return current;
                              }

                              const nextSelections = [...current.selections] as PendingSkilledChoice["selections"];
                              nextSelections[selectionIndex] = event.target.value;

                              return {
                                selections: nextSelections
                              };
                            })
                          }
                        >
                          <option value={skilledNoneOptionValue}>None</option>
                          <optgroup label="Skills">
                            {skillsOptions.map((skill) => (
                              <option key={skill} value={`skill:${skill}`}>
                                {skill}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Tools">
                            {toolProficiencyOptions.map((tool) => (
                              <option key={tool} value={`tool:${tool}`}>
                                {getToolProficiencyLabel(tool)}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </label>
                    ))}
                  </div>
                  {getPendingSkilledChoiceSummary(pendingSkilledChoice) ? (
                    <p className={styles.asiSummary}>
                      {getPendingSkilledChoiceSummary(pendingSkilledChoice)}
                    </p>
                  ) : null}
                  {!isPendingSkilledChoiceValid(pendingSkilledChoice) ? (
                    <p className={styles.featOptionValidation}>
                      Choose three different skills or tools.
                    </p>
                  ) : null}
                  <div className={styles.asiActions}>
                    <button
                      type="button"
                      className={shared.saveButton}
                      disabled={!isPendingSkilledChoiceValid(pendingSkilledChoice)}
                      onClick={savePendingSkilledChoice}
                    >
                      <Plus size={16} />
                      Add Feat
                    </button>
                  </div>
                </section>
              ) : null}
              <div className={styles.featOptionFooter}>
                {isRepeatable || !isSelected ? (
                  <button
                    type="button"
                    className={clsx(shared.editButton, styles.featAddButton)}
                    disabled={isAddDisabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      addFeat(featDefinition.feat);
                    }}
                  >
                    <Plus size={16} />
                    {isRepeatable && isSelected ? "Add Another" : isAddDisabled ? "Added" : "Add"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={clsx(shared.editButton, styles.featRemoveActionButton)}
                    onClick={(event) => {
                      event.stopPropagation();

                      if (selectedEntries[0]) {
                        removeFeat(selectedEntries[0]);
                      }
                    }}
                  >
                    <X size={16} />
                    Remove
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <button
        type="button"
        className={styles.sectionToggle}
        onClick={toggleSection}
        aria-expanded={isExpanded}
        aria-controls="class-features-and-feats-content"
      >
        <div>
          <p className={shared.eyebrow}>Build</p>
          <h2 className={shared.title}>Class Features &amp; Feats</h2>
          <p className={shared.helperText}>
            Review unlocked class features and manage feat selections for your build.
          </p>
        </div>
        <span className={styles.sectionToggleMeta}>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={clsx(
              styles.sectionToggleIcon,
              !isExpanded && styles.sectionToggleIconCollapsed
            )}
          />
        </span>
      </button>

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
            {renderFeatCards(selectedFeats, {
              emptyText: "No feats added yet."
            })}
          </section>

          <section className={styles.subsection} aria-labelledby="character-class-features-title">
            <h3 id="character-class-features-title" className={styles.subsectionTitle}>
              Class Features
            </h3>

            {unlockedFeatures.length > 0 ? (
              <>
                {renderFeatureList(unlockedFeatures)}

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
                    {isFutureFeaturesVisible ? renderFeatureList(futureFeatures) : null}
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

      {isFeatModalOpen ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={closeFeatEditor}
        >
          <section
            className={clsx(sheetStyles.spellManagementModal, styles.featEditorModal)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-feat-editor-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div className={styles.modalHeading}>
                <h3 id="character-feat-editor-title">Edit Feats</h3>
                <p className={shared.helperText}>
                  Always choose the appropriate feats based on your class features or your
                  DM&apos;s instructions.
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closeFeatEditor}
                aria-label="Close feat editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.tabRow} role="tablist" aria-label="Feat categories">
              {featCategoryTabs.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeFeatCategory === category}
                  className={clsx(
                    styles.tabButton,
                    activeFeatCategory === category && styles.tabButtonActive
                  )}
                  onClick={() => setActiveFeatCategory(category)}
                >
                  {getFeatCategoryLabel(category)}
                </button>
              ))}
            </div>

            <div className={styles.featEditorScrollArea}>
              {renderAvailableFeatList()}
            </div>
          </section>
        </div>
      ) : null}

      {selectedFeatReference && selectedFeatDefinition ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.featDrawerBackdrop)}
          role="presentation"
          onClick={() => setSelectedFeatReference(null)}
        >
          <aside
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feat-reference-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Feat</p>
                <div className={clsx(sheetStyles.spellDrawerTitleRow, styles.featDrawerTitleRow)}>
                  <h3 id="feat-reference-drawer-title">{selectedFeatDefinition.label}</h3>
                  {renderTrackingButton(getFeatureTrackingState(selectedFeatDefinition))}
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {getFeatCategoryLabel(selectedFeatDefinition.category)} Feat
                  {selectedFeatDefinition.prerequisite
                    ? ` • Prerequisite: ${selectedFeatDefinition.prerequisite}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedFeatReference(null)}
                aria-label={`Close ${selectedFeatDefinition.label} reference`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.keywordDrawerBody}>
              {selectedFeatReference.entry && getCharacterFeatSummary(selectedFeatReference.entry) ? (
                <p className={styles.featReferenceSummary}>
                  {`Selection: ${getCharacterFeatSummary(selectedFeatReference.entry)}`}
                </p>
              ) : null}
              {selectedFeatDefinition.description.map((line, index) => (
                <p
                  key={`${selectedFeatDefinition.feat}-line-${index}`}
                  className={styles.descriptionLine}
                >
                  {renderDescriptionLine(line, openKeyword, (feat) => openFeatReference(feat))}
                </p>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {selectedKeyword ? (
        <div
          className={clsx(sheetStyles.spellDrawerBackdrop, styles.referenceDrawerBackdrop)}
          role="presentation"
          onClick={() => setSelectedKeyword(null)}
        >
          <aside
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-feature-keyword-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                  <p className={sheetStyles.spellDrawerBadge}>Keyword</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="class-feature-keyword-drawer-title">{selectedKeyword.title}</h3>
                </div>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedKeyword(null)}
                aria-label={`Close ${selectedKeyword.title} reference`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.keywordDrawerBody}>
              {selectedKeyword.description.map((line, index) => (
                <p key={`${selectedKeyword.key}-line-${index}`} className={styles.descriptionLine}>
                  {renderDescriptionLine(line, openKeyword, (feat) => openFeatReference(feat))}
                </p>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </article>
  );
}

export default ClassFeaturesAndFeats;
