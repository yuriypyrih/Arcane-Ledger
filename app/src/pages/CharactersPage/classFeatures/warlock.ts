import {
  FEAT_CATEGORY,
  SPELL_LIST_CLASS,
  CLASS_FEATURE,
  ELDRITCH_INVOCATION,
  getEldritchInvocationEntries,
  getEldritchInvocationEntryById,
  getSpellEntryById,
  type EldritchInvocationEntry,
  type FEATS,
  type SpellEntry
} from "../../../codex/entries";
import {
  getSpellEntriesForClassName,
  warlockFeatures,
  type WarlockFeatureClassObj
} from "../../../codex/classes";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import { getFeatDefinitionsByCategory } from "../feats";
import type { Character, CharacterWarlockFeatureState } from "../../../types";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../spellcasting";
import type { FeatureActionCard } from "./types";

const invocationSelectionSeparator = "::";
const placeholderSelectionSuffix = "placeholder";
const magicalCunningUsesTotal = 1;
const contactPatronUsesTotal = 1;
const contactOtherPlaneSpellId = "spell-contact-other-plane";
const mysticArcanumActionSummary = "Cast your chosen arcanum spells without spell slots.";
const mysticArcanumActionDetail =
  "Open your chosen Mystic Arcanum spells and cast each of them once per Long Rest.";

export const magicalCunningActionKey = "warlock-magical-cunning";
export const contactPatronActionKey = "warlock-contact-patron";
export const mysticArcanumActionKey = "warlock-mystic-arcanum";

export type MysticArcanumLevel = 6 | 7 | 8 | 9;

type MysticArcanumSpellIdMap = Partial<Record<MysticArcanumLevel, string>>;

export type WarlockMysticArcanumSelection = {
  spellLevel: MysticArcanumLevel;
  spellId: string | null;
  spell: SpellEntry | null;
  expended: boolean;
};

const mysticArcanumDefinitions = [
  { warlockLevel: 11, spellLevel: 6 },
  { warlockLevel: 13, spellLevel: 7 },
  { warlockLevel: 15, spellLevel: 8 },
  { warlockLevel: 17, spellLevel: 9 }
] as const;

export type WarlockEldritchInvocationOption = {
  selectionId: string;
  invocation: EldritchInvocationEntry;
  displayName: string;
  displaySubtitle: string | null;
  requirementLabel: string;
  isQualified: boolean;
  isPlaceholder: boolean;
};

function isMysticArcanumLevel(value: number): value is MysticArcanumLevel {
  return value === 6 || value === 7 || value === 8 || value === 9;
}

function clampWarlockLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

function getWarlockFeatureRow(level: number): WarlockFeatureClassObj | null {
  const normalizedLevel = clampWarlockLevel(level);
  const matchingRows = warlockFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getUnlockedWarlockFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = clampWarlockLevel(level);

  return warlockFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function createSelectionId(
  invocationId: ELDRITCH_INVOCATION,
  choiceValue?: string
): string {
  return choiceValue ? `${invocationId}${invocationSelectionSeparator}${choiceValue}` : invocationId;
}

function parseSelectionId(selectionId: string): {
  invocationId: ELDRITCH_INVOCATION | null;
  choiceValue: string | null;
} {
  const [rawInvocationId, rawChoiceValue] = selectionId.split(invocationSelectionSeparator);

  if (!rawInvocationId || !getEldritchInvocationEntryById(rawInvocationId)) {
    return {
      invocationId: null,
      choiceValue: null
    };
  }

  return {
    invocationId: rawInvocationId as ELDRITCH_INVOCATION,
    choiceValue: rawChoiceValue ?? null
  };
}

function getWarlockFeatureState(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "cantripIds" | "feats"
  >
): CharacterWarlockFeatureState {
  return normalizeWarlockFeatureState(character.classFeatureState?.warlock, character);
}

function getUnlockedMysticArcanumLevels(
  character: Pick<Character, "className" | "level">
): MysticArcanumLevel[] {
  if (!hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM)) {
    return [];
  }

  return mysticArcanumDefinitions
    .filter((definition) => clampWarlockLevel(character.level) >= definition.warlockLevel)
    .map((definition) => definition.spellLevel);
}

function getWarlockPactMagicSlotLevel(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC)) {
    return 0;
  }

  return getWarlockFeatureRow(character.level)?.slotLevel ?? 0;
}

export function getWarlockPactMagicSlotTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC)) {
    return 0;
  }

  const slotLevel = getWarlockPactMagicSlotLevel(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  return slotLevel > 0 ? (spellSlotTotals[slotLevel - 1] ?? 0) : 0;
}

export function getWarlockPactMagicSlotsExpended(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number {
  const slotLevel = getWarlockPactMagicSlotLevel(character);

  if (slotLevel <= 0) {
    return 0;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals);

  return spellSlotsExpended[slotLevel - 1] ?? 0;
}

function getWarlockKnownCantripEntries(
  character: Pick<Character, "cantripIds">
): SpellEntry[] {
  const rawIds = Array.isArray(character.cantripIds)
    ? character.cantripIds.filter((entry): entry is string => typeof entry === "string")
    : [];

  return [...new Set(rawIds)]
    .map((spellId) => getSpellEntryById(spellId))
    .filter(
      (spell): spell is SpellEntry =>
        spell !== null &&
        spell.spellLevel === 0 &&
        spell.spellLists.includes(SPELL_LIST_CLASS.WARLOCK)
    );
}

function spellHasAttackRoll(spell: Pick<SpellEntry, "description">): boolean {
  return spell.description.some(
    (entry) =>
      typeof entry === "string" &&
      /\b(?:make|requires?)\b.*\b(?:melee|ranged)?\s*spell attack\b/i.test(entry)
  );
}

function getSpellRangeFeet(spell: Pick<SpellEntry, "range">): number | null {
  const match = spell.range.match(/(\d+)\s*feet\b/i);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function getEligibleWarlockCantripEntries(
  character: Pick<Character, "cantripIds">,
  rule: "damaging" | "damaging-range-10" | "damaging-attack-roll"
): SpellEntry[] {
  return getWarlockKnownCantripEntries(character).filter((spell) => {
    const dealsDamage = spell.damage.length > 0;

    if (!dealsDamage) {
      return false;
    }

    if (rule === "damaging") {
      return true;
    }

    if (rule === "damaging-range-10") {
      return (getSpellRangeFeet(spell) ?? 0) >= 10;
    }

    return spellHasAttackRoll(spell);
  });
}

function getRequirementLabels(invocation: EldritchInvocationEntry): string[] {
  const requirementLabels = (invocation.prerequisites ?? []).map((requirement) => {
    if (requirement.type === "warlock-level") {
      return `Level ${requirement.minimumLevel}+ Warlock`;
    }

    return getEldritchInvocationEntryById(requirement.invocation)?.name ?? "Missing invocation";
  });

  if (invocation.selection?.kind === "warlock-cantrip") {
    if (invocation.selection.rule === "damaging") {
      requirementLabels.push("Damaging Warlock cantrip");
    } else if (invocation.selection.rule === "damaging-range-10") {
      requirementLabels.push("Damaging Warlock cantrip, 10+ ft");
    } else {
      requirementLabels.push("Warlock cantrip via attack roll");
    }
  }

  if (invocation.selection?.kind === "origin-feat") {
    requirementLabels.push("Origin feat choice");
  }

  return requirementLabels.length > 0 ? requirementLabels : ["No prerequisite"];
}

function getSelectedInvocationBaseCounts(selectionIds: string[]): Map<ELDRITCH_INVOCATION, number> {
  return selectionIds.reduce((counts, selectionId) => {
    const { invocationId } = parseSelectionId(selectionId);

    if (!invocationId) {
      return counts;
    }

    counts.set(invocationId, (counts.get(invocationId) ?? 0) + 1);
    return counts;
  }, new Map<ELDRITCH_INVOCATION, number>());
}

function meetsInvocationPrerequisites(
  invocation: EldritchInvocationEntry,
  character: Pick<Character, "level">,
  selectedBaseInvocations: Set<ELDRITCH_INVOCATION>
): boolean {
  return (invocation.prerequisites ?? []).every((requirement) => {
    if (requirement.type === "warlock-level") {
      return clampWarlockLevel(character.level) >= requirement.minimumLevel;
    }

    return selectedBaseInvocations.has(requirement.invocation);
  });
}

function getChoiceLabelForSpell(spell: SpellEntry): string {
  return `Warlock cantrip: ${spell.name}`;
}

function getChoiceLabelForOriginFeat(feat: { label: string }): string {
  return `Origin feat: ${feat.label}`;
}

function getOriginFeatDefinitions() {
  return getFeatDefinitionsByCategory()[FEAT_CATEGORY.ORIGIN];
}

function createPlaceholderOption(
  invocation: EldritchInvocationEntry,
  subtitle: string
): WarlockEldritchInvocationOption {
  return {
    selectionId: createSelectionId(invocation.id, placeholderSelectionSuffix),
    invocation,
    displayName: invocation.name,
    displaySubtitle: subtitle,
    requirementLabel: getRequirementLabels(invocation).join(" • "),
    isQualified: false,
    isPlaceholder: true
  };
}

function sortSelectionIdsForNormalization(selectionIds: string[]): string[] {
  return selectionIds
    .map((selectionId, index) => {
      const { invocationId } = parseSelectionId(selectionId);
      const invocation = invocationId ? getEldritchInvocationEntryById(invocationId) : null;
      const dependencyDepth = (invocation?.prerequisites ?? []).filter(
        (requirement) => requirement.type === "invocation"
      ).length;

      return {
        selectionId,
        dependencyDepth,
        index
      };
    })
    .sort((left, right) =>
      left.dependencyDepth === right.dependencyDepth
        ? left.index - right.index
        : left.dependencyDepth - right.dependencyDepth
    )
    .map((entry) => entry.selectionId);
}

export function hasWarlockFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Warlock") {
    return false;
  }

  return getUnlockedWarlockFeatures(character.level).has(feature);
}

export function getWarlockEldritchInvocationLimit(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_INVOCATIONS)) {
    return 0;
  }

  return Math.max(0, getWarlockFeatureRow(character.level)?.eldritchInvocations ?? 0);
}

export function getWarlockInvocationSelectionIds(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
): string[] {
  return getWarlockFeatureState(character).eldritchInvocationIds ?? [];
}

export function getWarlockMysticArcanumSpellOptions(
  character: Pick<Character, "className" | "level">,
  spellLevel: MysticArcanumLevel
): SpellEntry[] {
  if (!getUnlockedMysticArcanumLevels(character).includes(spellLevel)) {
    return [];
  }

  return getSpellEntriesForClassName("Warlock")
    .filter((spell) => spell.spellLevel === spellLevel)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getWarlockMysticArcanumSpellId(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">,
  spellLevel: MysticArcanumLevel
): string | null {
  const spellId = getWarlockFeatureState(character).mysticArcanumSpellIds?.[spellLevel];
  return typeof spellId === "string" && spellId.length > 0 ? spellId : null;
}

export function getWarlockMysticArcanumSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
): WarlockMysticArcanumSelection[] {
  const unlockedLevels = getUnlockedMysticArcanumLevels(character);
  const expendedLevels = new Set(getWarlockFeatureState(character).mysticArcanumExpendedLevels ?? []);

  return unlockedLevels.map((spellLevel) => {
    const spellId = getWarlockMysticArcanumSpellId(character, spellLevel);
    const spell = spellId ? getSpellEntryById(spellId) : null;

    return {
      spellLevel,
      spellId,
      spell,
      expended: expendedLevels.has(spellLevel)
    };
  });
}

export function getWarlockMagicalCunningUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING) ? magicalCunningUsesTotal : 0;
}

export function getWarlockMagicalCunningUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getWarlockMagicalCunningUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const usesExpended = getWarlockFeatureState(character).magicalCunningUsesExpended ?? 0;
  return Math.max(0, totalUses - usesExpended);
}

export function getContactPatronUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON) ? contactPatronUsesTotal : 0;
}

export function getContactPatronUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getContactPatronUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const usesExpended = getWarlockFeatureState(character).contactPatronUsesExpended ?? 0;
  return Math.max(0, totalUses - usesExpended);
}

export function getWarlockInvocationOptions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">,
  selectedIds: string[] = getWarlockInvocationSelectionIds(character)
): WarlockEldritchInvocationOption[] {
  if (!hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_INVOCATIONS)) {
    return [];
  }

  const selectedBaseInvocations = new Set(
    selectedIds
      .map((selectionId) => parseSelectionId(selectionId).invocationId)
      .filter((invocationId): invocationId is ELDRITCH_INVOCATION => invocationId !== null)
  );

  return getEldritchInvocationEntries().flatMap((invocation) => {
    const baseQualified = meetsInvocationPrerequisites(invocation, character, selectedBaseInvocations);
    const requirementLabel = getRequirementLabels(invocation).join(" • ");

    if (invocation.selection?.kind === "warlock-cantrip") {
      const eligibleCantrips = getEligibleWarlockCantripEntries(character, invocation.selection.rule);

      if (eligibleCantrips.length === 0) {
        return [
          createPlaceholderOption(
            invocation,
            "No eligible Warlock cantrip known"
          )
        ];
      }

      return eligibleCantrips
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((spell) => ({
          selectionId: createSelectionId(invocation.id, spell.id),
          invocation,
          displayName: invocation.name,
          displaySubtitle: getChoiceLabelForSpell(spell),
          requirementLabel,
          isQualified: baseQualified,
          isPlaceholder: false
        }));
    }

    if (invocation.selection?.kind === "origin-feat") {
      return getOriginFeatDefinitions()
        .slice()
        .sort((left, right) => left.label.localeCompare(right.label))
        .map((definition) => ({
          selectionId: createSelectionId(invocation.id, definition.feat),
          invocation,
          displayName: invocation.name,
          displaySubtitle: getChoiceLabelForOriginFeat(definition),
          requirementLabel,
          isQualified: baseQualified,
          isPlaceholder: false
        }));
    }

    return [
      {
        selectionId: createSelectionId(invocation.id),
        invocation,
        displayName: invocation.name,
        displaySubtitle: null,
        requirementLabel,
        isQualified: baseQualified,
        isPlaceholder: false
      }
    ];
  });
}

export function getWarlockLearnedInvocationOptions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
): WarlockEldritchInvocationOption[] {
  const selectedIds = getWarlockInvocationSelectionIds(character);
  const optionMap = new Map(
    getWarlockInvocationOptions(character, selectedIds).map((option) => [option.selectionId, option])
  );

  return selectedIds
    .map((selectionId) => optionMap.get(selectionId))
    .filter((option): option is WarlockEldritchInvocationOption => Boolean(option));
}

export function getWarlockInvocationBlockingSelectionNames(
  selectionId: string,
  selectedIds: string[]
): string[] {
  const { invocationId } = parseSelectionId(selectionId);

  if (!invocationId) {
    return [];
  }

  const selectedBaseCounts = getSelectedInvocationBaseCounts(selectedIds);

  if ((selectedBaseCounts.get(invocationId) ?? 0) > 1) {
    return [];
  }

  const blockedByNames = selectedIds
    .filter((currentSelectionId) => currentSelectionId !== selectionId)
    .map((currentSelectionId) => parseSelectionId(currentSelectionId).invocationId)
    .filter((currentInvocationId): currentInvocationId is ELDRITCH_INVOCATION => Boolean(currentInvocationId))
    .flatMap((currentInvocationId) => {
      const invocation = getEldritchInvocationEntryById(currentInvocationId);

      if (
        !invocation ||
        !(invocation.prerequisites ?? []).some(
          (requirement) =>
            requirement.type === "invocation" && requirement.invocation === invocationId
        )
      ) {
        return [];
      }

      return [invocation.name];
    });

  return [...new Set(blockedByNames)];
}

export function normalizeWarlockFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level" | "cantripIds" | "feats">
): CharacterWarlockFeatureState {
  if (!hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_INVOCATIONS)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterWarlockFeatureState>) : {};
  const rawSelectionIds = Array.isArray(record.eldritchInvocationIds)
    ? record.eldritchInvocationIds.filter(
        (selectionId): selectionId is string => typeof selectionId === "string"
      )
    : [];
  const limit = getWarlockEldritchInvocationLimit(character);
  let normalizedSelectionIds = [...new Set(sortSelectionIdsForNormalization(rawSelectionIds))];

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const optionMap = new Map(
      getWarlockInvocationOptions(character, normalizedSelectionIds).map((option) => [
        option.selectionId,
        option
      ])
    );

    const nextSelectionIds = normalizedSelectionIds
      .filter((selectionId) => {
        const option = optionMap.get(selectionId);
        return Boolean(option && option.isQualified && !option.isPlaceholder);
      })
      .slice(0, limit);

    if (
      nextSelectionIds.length === normalizedSelectionIds.length &&
      nextSelectionIds.every((selectionId, index) => selectionId === normalizedSelectionIds[index])
    ) {
      normalizedSelectionIds = nextSelectionIds;
      break;
    }

    normalizedSelectionIds = nextSelectionIds;
  }

  const totalMagicalCunningUses = getWarlockMagicalCunningUsesTotal(character);
  const rawMagicalCunningUsesExpended = Number(record.magicalCunningUsesExpended);
  const magicalCunningUsesExpended =
    totalMagicalCunningUses > 0 && Number.isFinite(rawMagicalCunningUsesExpended)
      ? Math.max(0, Math.min(totalMagicalCunningUses, Math.floor(rawMagicalCunningUsesExpended)))
      : undefined;
  const totalContactPatronUses = getContactPatronUsesTotal(character);
  const rawContactPatronUsesExpended = Number(record.contactPatronUsesExpended);
  const contactPatronUsesExpended =
    totalContactPatronUses > 0 && Number.isFinite(rawContactPatronUsesExpended)
      ? Math.max(0, Math.min(totalContactPatronUses, Math.floor(rawContactPatronUsesExpended)))
      : undefined;
  const unlockedMysticArcanumLevels = getUnlockedMysticArcanumLevels(character);
  const rawMysticArcanumSpellIds =
    record.mysticArcanumSpellIds && typeof record.mysticArcanumSpellIds === "object"
      ? (record.mysticArcanumSpellIds as MysticArcanumSpellIdMap)
      : {};
  const mysticArcanumSpellIds = unlockedMysticArcanumLevels.reduce<MysticArcanumSpellIdMap>(
    (selectionMap, spellLevel) => {
      const spellId = rawMysticArcanumSpellIds[spellLevel];
      const isValidSpell = getWarlockMysticArcanumSpellOptions(character, spellLevel).some(
        (spell) => spell.id === spellId
      );

      if (isValidSpell && spellId) {
        selectionMap[spellLevel] = spellId;
      }

      return selectionMap;
    },
    {}
  );
  const rawMysticArcanumExpendedLevels = Array.isArray(record.mysticArcanumExpendedLevels)
    ? record.mysticArcanumExpendedLevels
        .map((entry) => Number(entry))
        .filter((entry): entry is MysticArcanumLevel => isMysticArcanumLevel(entry))
    : [];
  const mysticArcanumExpendedLevels = rawMysticArcanumExpendedLevels.filter((spellLevel) =>
    unlockedMysticArcanumLevels.includes(spellLevel)
  );

  return {
    eldritchInvocationIds: normalizedSelectionIds,
    magicalCunningUsesExpended,
    contactPatronUsesExpended,
    mysticArcanumSpellIds,
    mysticArcanumExpendedLevels
  };
}

export function getWarlockAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level">
): string[] {
  if (!hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    return [];
  }

  return [contactOtherPlaneSpellId];
}

export function setWarlockMysticArcanumSpellId(
  character: Character,
  spellLevel: MysticArcanumLevel,
  spellId: string | null
): Character {
  if (character.className !== "Warlock") {
    return character;
  }

  const nextWarlockState = normalizeWarlockFeatureState(
    {
      ...character.classFeatureState?.warlock,
      mysticArcanumSpellIds: {
        ...(character.classFeatureState?.warlock?.mysticArcanumSpellIds ?? {}),
        [spellLevel]: spellId ?? undefined
      }
    },
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: nextWarlockState
    }
  };
}

export function setWarlockInvocationSelectionIds(
  character: Character,
  selectionIds: string[]
): Character {
  if (character.className !== "Warlock") {
    return character;
  }

  const nextWarlockState = normalizeWarlockFeatureState(
    {
      ...character.classFeatureState?.warlock,
      eldritchInvocationIds: selectionIds
    },
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: nextWarlockState
    }
  };
}

export function getWarlockInvocationFeatChoice(selectionId: string): FEATS | null {
  const { invocationId, choiceValue } = parseSelectionId(selectionId);

  if (
    invocationId !== ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES ||
    !choiceValue
  ) {
    return null;
  }

  return choiceValue as FEATS;
}

export function getWarlockFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING)) {
    const usesRemaining = getWarlockMagicalCunningUsesRemaining(character);
    const usesTotal = getWarlockMagicalCunningUsesTotal(character);
    const expendedPactMagicSlots = getWarlockPactMagicSlotsExpended(character);
    const restoresAllPactMagicSlots = hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_MASTER);
    const disabledReason =
      usesRemaining <= 0
        ? "Magical Cunning recharges on a Long Rest."
        : expendedPactMagicSlots <= 0
          ? "No Pact Magic spell slots to restore."
          : undefined;

    actions.push({
      key: magicalCunningActionKey,
      name: "Magical Cunning",
      summary: restoresAllPactMagicSlots
        ? "Restore all your Pact Magic spell slots."
        : "Restore half your Pact Magic spell slots.",
      detail: restoresAllPactMagicSlots
        ? "Restore all of your expended Pact Magic spell slots."
        : "Restore half your maximum Pact Magic spell slots, rounded up.",
      breakdown: restoresAllPactMagicSlots
        ? "Restore all your Pact Magic spell slots"
        : "Restore half your Pact Magic spell slots",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    const usesRemaining = getContactPatronUsesRemaining(character);

    actions.push({
      key: contactPatronActionKey,
      name: "Contact Patron",
      summary: "Cast Contact Other Plane without a spell slot.",
      detail: "Open Contact Other Plane and cast it to contact your patron directly.",
      breakdown: "Auto-succeed on the saving throw",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      interaction: "select",
      usesRemaining,
      usesTotal: contactPatronUsesTotal,
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Contact Patron recharges on a Long Rest." : undefined
    });
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM)) {
    const selectedArcanumSelections = getWarlockMysticArcanumSelections(character).filter(
      (selection) => selection.spell !== null
    );
    const selectedArcanumCount = selectedArcanumSelections.length;
    const remainingArcanumCount = selectedArcanumSelections.filter(
      (selection) => selection.expended === false
    ).length;

    actions.push({
      key: mysticArcanumActionKey,
      name: "Mystic Arcanum",
      summary: mysticArcanumActionSummary,
      detail: mysticArcanumActionDetail,
      breakdown: "Cast your arcanum spells",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.MAGIC,
      interaction: "select",
      usesRemaining: remainingArcanumCount,
      usesTotal: selectedArcanumCount,
      disabled: selectedArcanumCount <= 0,
      disabledReason:
        selectedArcanumCount <= 0
          ? "Choose your Mystic Arcanum spells in Class Features & Feats first."
          : undefined
    });
  }

  return actions;
}

export function activateWarlockMagicalCunning(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING)) {
    return character;
  }

  const usesRemaining = getWarlockMagicalCunningUsesRemaining(character);
  const pactMagicSlotLevel = getWarlockPactMagicSlotLevel(character);
  const pactMagicSlotTotal = getWarlockPactMagicSlotTotal(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals);
  const expendedSlots = pactMagicSlotLevel > 0 ? (spellSlotsExpended[pactMagicSlotLevel - 1] ?? 0) : 0;

  if (usesRemaining <= 0 || pactMagicSlotLevel <= 0 || expendedSlots <= 0) {
    return character;
  }

  const restoresAllPactMagicSlots = hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_MASTER);
  const slotsToRestore = restoresAllPactMagicSlots
    ? expendedSlots
    : Math.min(expendedSlots, Math.ceil(pactMagicSlotTotal / 2));

  if (slotsToRestore <= 0) {
    return character;
  }

  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[pactMagicSlotLevel - 1] = Math.max(
    0,
    expendedSlots - slotsToRestore
  );
  const warlockState = getWarlockFeatureState(character);

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        magicalCunningUsesExpended: (warlockState.magicalCunningUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreWarlockPactMagicSpellSlots(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC)) {
    return character;
  }

  const pactMagicSlotLevel = getWarlockPactMagicSlotLevel(character);

  if (pactMagicSlotLevel <= 0) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals);

  if ((spellSlotsExpended[pactMagicSlotLevel - 1] ?? 0) <= 0) {
    return character;
  }

  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[pactMagicSlotLevel - 1] = 0;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function consumeContactPatronUse(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    return character;
  }

  const usesRemaining = getContactPatronUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        contactPatronUsesExpended: (warlockState.contactPatronUsesExpended ?? 0) + 1
      }
    }
  };
}

export function consumeMysticArcanumUse(
  character: Character,
  spellLevel: MysticArcanumLevel
): Character {
  if (!getUnlockedMysticArcanumLevels(character).includes(spellLevel)) {
    return character;
  }

  const currentSpellId = getWarlockMysticArcanumSpellId(character, spellLevel);

  if (!currentSpellId) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);
  const expendedLevels = warlockState.mysticArcanumExpendedLevels ?? [];

  if (expendedLevels.includes(spellLevel)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        mysticArcanumExpendedLevels: [...expendedLevels, spellLevel].sort((left, right) => left - right)
      }
    }
  };
}

export function restoreWarlockMagicalCunningOnLongRest(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING)) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);

  if ((warlockState.magicalCunningUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        magicalCunningUsesExpended: 0
      }
    }
  };
}

export function restoreContactPatronOnLongRest(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);

  if ((warlockState.contactPatronUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        contactPatronUsesExpended: 0
      }
    }
  };
}

export function restoreMysticArcanumOnLongRest(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM)) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);

  if ((warlockState.mysticArcanumExpendedLevels ?? []).length <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        mysticArcanumExpendedLevels: []
      }
    }
  };
}
