import clsx from "clsx";
import { Pencil, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DivinityListRow from "../../../DivinityListRow/DivinityListRow";
import EldritchInvocationListRow from "../../../EldritchInvocationListRow";
import SpellListRow from "../../../SpellListRow";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import CharacterSpellDrawer, { type CharacterSpellDrawerMode } from "./CharacterSpellDrawer";
import EldritchInvocationDrawer from "./EldritchInvocationDrawer";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../codex/classes";
import {
  ACTION_TYPE,
  CLASS_FEATURE,
  getDivinityEntryById,
  getSpellEntryById,
  type DivinityEntry,
  type SpellEntry
} from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  formatDivinitySubtitle,
  formatSpellCastingTime,
  formatCodexLabel
} from "../../../../utils/codex";
import {
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import { getRoundTrackerResourceForEconomyType } from "../../../../pages/CharactersPage/actionEconomy";
import {
  activateFeatureActionOptionForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  getFeatureActionsForCharacter,
  getFeatureActionOptionsForCharacter,
  getSpellEntryForCharacter,
  getSpellcastingStateForCharacter,
  getWarlockEldritchInvocationLimitForCharacter,
  getWarlockInvocationBlockingSelectionNamesForCharacter,
  getWarlockInvocationOptionsForCharacter,
  getWarlockInvocationSelectionIdsForCharacter,
  getWarlockLearnedInvocationOptionsForCharacter,
  consumeWizardSignatureSpellFreeCastForCharacter,
  getWizardSignatureSpellIdsForCharacter,
  hasWizardSignatureSpellFreeCastAvailableForCharacter,
  getWizardSpellMasterySpellIdsForCharacter,
  setWarlockInvocationSelectionIdsForCharacter,
  syncWizardSignatureSpellsToSpellbookForCharacter,
  syncWizardSpellMasterySelectionsToSpellbookForCharacter,
  type FeatureActionCard,
  type FeatureActionOptionCard
} from "../../../../pages/CharactersPage/classFeatures";
import { getClericResolvedDivinityDisplay } from "../../../../pages/CharactersPage/classFeatures/cleric";
import { paladinChannelDivinityActionKey } from "../../../../pages/CharactersPage/classFeatures/paladin";
import { restoreWarlockPactMagicSpellSlots } from "../../../../pages/CharactersPage/classFeatures/warlock";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  hasClassFeatureForCharacter,
  isSpellcastingClass,
  normalizeTrackedSpellIds,
  normalizePreparedSpellIds,
  normalizeSpellbookSpellIds,
  normalizeSpellSlotsExpended,
  usesSpellbookForCharacter,
  usesPreparedSpellsForCharacter
} from "../../../../pages/CharactersPage/spellcasting";
import { getSpellSelectionInputStatusForCharacter } from "../../../../pages/CharactersPage/spellSelection";
import { getFeatGrantedCantripEntriesForCharacter } from "../../../../pages/CharactersPage/feats";
import { formatFeatureActionOptionRangeLabel } from "../../../../pages/CharactersPage/actionOutcome";
import { applySpellConcentrationToStatusEntries } from "../../../../pages/CharactersPage/traits";
import type {
  PersistCharacterUpdater,
  SpellManagementMode
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock";
import {
  clampNumber,
  formatSpellGroupTitle,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import {
  areSpellIdListsEqual,
  getRoundTrackerResourceForSpell
} from "../../../../pages/CharactersPage/shared";
import { getSpellOutcomeSummaryForCharacter } from "../../../../pages/CharactersPage/spellOutcome";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SpellCastingForm.module.css";
import actionStyles from "./SpellActionDrawer.module.css";
import {
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../GameplayForm/gameplayStateUtils";

type SpellCastingFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SpellGroup = {
  level: number;
  spells: SpellEntry[];
};

type SpellPreparationLevelGroup = Record<number, SpellEntry[]>;
type SelectedSpellViewMode = CharacterSpellDrawerMode;
type WizardSpellViewFilter = "all" | "prepared";
const wizardSignatureSpellLevel = 3;
type DivinityOptionRow = {
  action: FeatureActionCard;
  option: FeatureActionOptionCard;
  entry: DivinityEntry;
};

function SelectionCounter({
  current,
  total
}: {
  current: number;
  total: number;
}) {
  return (
    <span
      className={clsx(current < total && styles.selectionCounterIncomplete)}
    >{`${current}/${total}`}</span>
  );
}

function getChannelDivinityEntryForOption(optionKey: string): DivinityEntry | null {
  if (optionKey === "divine-spark-heal" || optionKey === "divine-spark-damage") {
    return getDivinityEntryById("divinity-divine-spark");
  }

  if (optionKey === "turn-undead") {
    return getDivinityEntryById("divinity-turn-undead");
  }

  if (optionKey === "paladin-divine-sense") {
    return getDivinityEntryById("divinity-divine-sense");
  }

  return null;
}

function getDivinityDrawerValueLabel(option: FeatureActionOptionCard): string {
  return option.rollFormulaDisplay ?? "-";
}

function groupSpellsByLevel(spells: SpellEntry[]): SpellGroup[] {
  const spellsByLevel = spells.reduce((groups, spell) => {
    const spellLevel = getSpellLevel(spell);
    const currentGroup = groups.get(spellLevel) ?? [];

    groups.set(spellLevel, [...currentGroup, spell]);
    return groups;
  }, new Map<number, SpellEntry[]>());

  return [...spellsByLevel.entries()]
    .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
    .map(([level, levelSpells]) => ({
      level,
      spells: [...levelSpells].sort((left, right) => left.name.localeCompare(right.name))
    }));
}

function countTrackedSpellsByLevel(
  spellIds: string[],
  spellsById: Map<string, SpellEntry>
): Record<number, number> {
  return spellIds.reduce<Record<number, number>>((counts, spellId) => {
    const spell = spellsById.get(spellId);

    if (!spell) {
      return counts;
    }

    const spellLevel = getSpellLevel(spell);

    counts[spellLevel] = (counts[spellLevel] ?? 0) + 1;
    return counts;
  }, {});
}

function getHighestSpellSlotLevel(spellSlotTotals: number[]): number {
  for (let index = spellSlotTotals.length - 1; index >= 0; index -= 1) {
    if ((spellSlotTotals[index] ?? 0) > 0) {
      return index + 1;
    }
  }

  return 0;
}

function createSpellPreparationLevelGroups(spells: SpellEntry[]): SpellPreparationLevelGroup {
  return spellSlotLevels.reduce<SpellPreparationLevelGroup>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

    return groups;
  }, {} as SpellPreparationLevelGroup);
}

function getRoundTrackerResourceLabel(resource: RoundTrackerResource): string {
  switch (resource) {
    case "bonusAction":
      return ACTION_TYPE.BONUS_ACTION;
    case "reaction":
      return ACTION_TYPE.REACTION;
    case "action":
    default:
      return ACTION_TYPE.ACTION;
  }
}

function getRoundTrackerActionWarning(
  resource: RoundTrackerResource | null,
  roundTracker: ReturnType<typeof normalizeRoundTracker>
): string | null {
  if (!resource || isRoundTrackerResourceAvailable(roundTracker, resource)) {
    return null;
  }

  return `You already used the ${getRoundTrackerResourceLabel(resource)} for this turn`;
}

function getActionShapeStateForRoundTrackerResource(
  resource: RoundTrackerResource | null,
  roundTracker: ReturnType<typeof normalizeRoundTracker>
): {
  isSelected: boolean;
  multiCount: number;
} {
  return {
    isSelected: !resource || isRoundTrackerResourceAvailable(roundTracker, resource),
    multiCount: 0
  };
}

function SpellCastingForm({ character, className, onPersistCharacter }: SpellCastingFormProps) {
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedDivinityOptionKey, setSelectedDivinityOptionKey] = useState<string | null>(null);
  const [selectedInvocation, setSelectedInvocation] =
    useState<WarlockEldritchInvocationOption | null>(null);
  const [selectedSpellViewMode, setSelectedSpellViewMode] =
    useState<SelectedSpellViewMode>("standard");
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [spellManagementMode, setSpellManagementMode] = useState<SpellManagementMode | null>(null);
  const [cantripDraftIds, setCantripDraftIds] = useState<string[]>([]);
  const [spellbookDraftIds, setSpellbookDraftIds] = useState<string[]>([]);
  const [preparedSpellDraftIds, setPreparedSpellDraftIds] = useState<string[]>([]);
  const [invocationDraftIds, setInvocationDraftIds] = useState<string[]>([]);
  const [activePreparedSpellLevel, setActivePreparedSpellLevel] = useState(1);
  const [activeWizardSpellFilter, setActiveWizardSpellFilter] =
    useState<WizardSpellViewFilter>("prepared");

  useBodyScrollLock(
    Boolean(spellManagementMode || selectedSpell || selectedDivinityOptionKey || selectedInvocation)
  );

  const closeSelectedSpell = useCallback(() => {
    setSelectedSpell(null);
    setSelectedSpellViewMode("standard");
  }, []);
  const closeSelectedDivinity = useCallback(() => {
    setSelectedDivinityOptionKey(null);
  }, []);
  const closeSelectedInvocation = useCallback(() => {
    setSelectedInvocation(null);
  }, []);
  const prepareCharacterForResourceConsumption = useCallback(
    (currentCharacter: Character, resource: RoundTrackerResource | null) =>
      resource
        ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, resource)
        : currentCharacter,
    []
  );

  useEffect(() => {
    if (!selectedSpell && !selectedDivinityOptionKey && !selectedInvocation && !spellManagementMode) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedSpell) {
          closeSelectedSpell();
          return;
        }

        if (selectedDivinityOptionKey) {
          closeSelectedDivinity();
          return;
        }

        if (selectedInvocation) {
          closeSelectedInvocation();
          return;
        }

        setSpellManagementMode(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    closeSelectedDivinity,
    closeSelectedInvocation,
    closeSelectedSpell,
    selectedDivinityOptionKey,
    selectedInvocation,
    selectedSpell,
    spellManagementMode
  ]);

  const canCastSpells = isSpellcastingClass(character.className, character.level);
  const spellcastingState = getSpellcastingStateForCharacter(character);

  useEffect(() => {
    if (canCastSpells) {
      return;
    }

    closeSelectedSpell();
    closeSelectedDivinity();
    closeSelectedInvocation();
    setSpellManagementMode(null);
  }, [canCastSpells, closeSelectedDivinity, closeSelectedInvocation, closeSelectedSpell]);

  useEffect(() => {
    if (!spellcastingState.blocked) {
      return;
    }

    setSpellManagementMode(null);
  }, [spellcastingState.blocked]);

  const baseClassSpellEntries = useClassSpellEntries(character.className);
  const featGrantedCantripEntries = useMemo(
    () => getFeatGrantedCantripEntriesForCharacter(character),
    [character]
  );
  const basePreparedSpellPoolEntries = usePreparedSpellEntries(
    character.className,
    character.level
  );
  const classSpellEntries = useMemo(
    () => baseClassSpellEntries.map((spell) => getSpellEntryForCharacter(character, spell)),
    [baseClassSpellEntries, character]
  );
  const preparedSpellPoolEntries = useMemo(
    () => basePreparedSpellPoolEntries.map((spell) => getSpellEntryForCharacter(character, spell)),
    [basePreparedSpellPoolEntries, character]
  );
  const invocationManagerCharacter = useMemo(
    () => ({
      ...character,
      cantripIds: cantripDraftIds
    }),
    [cantripDraftIds, character]
  );
  const featureActions = useMemo(() => getFeatureActionsForCharacter(character), [character]);
  const channelDivinityAction = useMemo(
    () =>
      featureActions.find(
        (action) =>
          action.key === "cleric-channel-divinity" || action.key === paladinChannelDivinityActionKey
      ) ?? null,
    [featureActions]
  );
  const channelDivinityOptions = useMemo(
    () =>
      channelDivinityAction
        ? getFeatureActionOptionsForCharacter(character, channelDivinityAction.key)
        : [],
    [channelDivinityAction, character]
  );
  const channelDivinityRows = useMemo(
    () =>
      channelDivinityAction
        ? channelDivinityOptions
            .map((option) => {
              const entry = getChannelDivinityEntryForOption(option.key);

              if (!entry) {
                return null;
              }

              return {
                action: channelDivinityAction,
                option,
                entry
              } satisfies DivinityOptionRow;
            })
            .filter((row): row is DivinityOptionRow => row !== null)
        : [],
    [channelDivinityAction, channelDivinityOptions]
  );
  const selectedDivinityRow = useMemo(
    () =>
      selectedDivinityOptionKey
        ? (channelDivinityRows.find((row) => row.option.key === selectedDivinityOptionKey) ?? null)
        : null,
    [channelDivinityRows, selectedDivinityOptionKey]
  );
  const selectedDivinityDisplay = useMemo(
    () =>
      selectedDivinityRow
        ? selectedDivinityRow.action.key === "cleric-channel-divinity"
          ? getClericResolvedDivinityDisplay(character, selectedDivinityRow.entry)
          : {
              damage: null,
              healing: null,
              description: selectedDivinityRow.entry.description
            }
        : null,
    [character, selectedDivinityRow]
  );
  const channelDivinityUsesTotal = useMemo(
    () => getChannelDivinityUsesTotalForCharacter(character),
    [character]
  );
  const channelDivinityUsesRemaining = useMemo(
    () => getChannelDivinityUsesRemainingForCharacter(character),
    [character]
  );
  const usesPreparedSpells = usesPreparedSpellsForCharacter(character.className, character.level);
  const cantripLimit = getCantripLimitForCharacter(
    character.className,
    character.level,
    character.classFeatureState
  );
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    character.className,
    character.level
  );
  const spellSlotTotals = useMemo(
    () => getSpellSlotTotalsForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const spellSlotsExpended = useMemo(
    () => normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals),
    [character.spellSlotsExpended, spellSlotTotals]
  );
  const spellSlotsRemaining = useMemo(
    () =>
      spellSlotTotals.map((total, index) => Math.max(0, total - (spellSlotsExpended[index] ?? 0))),
    [spellSlotTotals, spellSlotsExpended]
  );
  const highestSpellSlotLevel = useMemo(
    () => getHighestSpellSlotLevel(spellSlotTotals),
    [spellSlotTotals]
  );
  const cantripOptions = useMemo(
    () => classSpellEntries.filter((spell) => getSpellLevel(spell) === 0),
    [classSpellEntries]
  );
  const allKnownCantripEntries = useMemo(() => {
    const mergedCantrips = new Map<string, SpellEntry>();

    [...cantripOptions, ...featGrantedCantripEntries].forEach((spell) => {
      mergedCantrips.set(spell.id, spell);
    });

    return [...mergedCantrips.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [cantripOptions, featGrantedCantripEntries]);
  const spellPreparationOptions = useMemo(
    () =>
      preparedSpellPoolEntries.filter((spell) => {
        const spellLevel = getSpellLevel(spell);
        return spellLevel > 0 && spellLevel <= highestSpellSlotLevel;
      }),
    [highestSpellSlotLevel, preparedSpellPoolEntries]
  );
  const usesSpellbook = usesSpellbookForCharacter(character.className);
  const hasWizardRitualAdept =
    usesSpellbook &&
    hasClassFeatureForCharacter(character.className, character.level, CLASS_FEATURE.RITUAL_ADEPT);
  const wizardSpellMasterySpellIds = useMemo(
    () => getWizardSpellMasterySpellIdsForCharacter(character),
    [character]
  );
  const wizardSpellMasterySpellIdSet = useMemo(
    () => new Set(wizardSpellMasterySpellIds),
    [wizardSpellMasterySpellIds]
  );
  const wizardSignatureSpellIds = useMemo(
    () => getWizardSignatureSpellIdsForCharacter(character),
    [character]
  );
  const wizardSignatureSpellIdSet = useMemo(
    () => new Set(wizardSignatureSpellIds),
    [wizardSignatureSpellIds]
  );
  const alwaysPreparedSpellIds = useMemo(
    () =>
      getAlwaysPreparedSpellIds(
        character.className,
        character.level,
        character.classFeatureState,
        character.spellbookSpellIds
      ),
    [character.classFeatureState, character.className, character.level, character.spellbookSpellIds]
  );
  const alwaysPreparedSpellIdSet = useMemo(
    () => new Set(alwaysPreparedSpellIds),
    [alwaysPreparedSpellIds]
  );
  const alwaysPreparedSpellEntries = useMemo(
    () =>
      alwaysPreparedSpellIds
        .map((spellId) => getSpellEntryById(spellId))
        .filter((spell): spell is SpellEntry => spell !== null)
        .map((spell) => getSpellEntryForCharacter(character, spell)),
    [alwaysPreparedSpellIds, character]
  );
  const selectedCantripIds = useMemo(
    () => normalizeTrackedSpellIds(character.cantripIds, cantripOptions, cantripLimit),
    [cantripLimit, cantripOptions, character.cantripIds]
  );
  const selectedSpellbookSpellIds = useMemo(
    () =>
      usesSpellbook
        ? normalizeSpellbookSpellIds(character.spellbookSpellIds, spellPreparationOptions)
        : [],
    [character.spellbookSpellIds, spellPreparationOptions, usesSpellbook]
  );
  const selectedSpellbookSpellIdSet = useMemo(
    () => new Set(selectedSpellbookSpellIds),
    [selectedSpellbookSpellIds]
  );
  const selectedPreparedSpellIds = useMemo(
    () =>
      normalizePreparedSpellIds(
        character.preparedSpellIds,
        spellPreparationOptions,
        preparedSpellLimit,
        alwaysPreparedSpellIds
      ).filter((spellId) => !usesSpellbook || selectedSpellbookSpellIdSet.has(spellId)),
    [
      alwaysPreparedSpellIds,
      character.preparedSpellIds,
      preparedSpellLimit,
      selectedSpellbookSpellIdSet,
      spellPreparationOptions,
      usesSpellbook
    ]
  );
  const cantripOptionsById = useMemo(
    () => new Map(allKnownCantripEntries.map((spell) => [spell.id, spell])),
    [allKnownCantripEntries]
  );
  const knownSpellEntriesById = useMemo(
    () =>
      new Map(
        [
          ...classSpellEntries,
          ...featGrantedCantripEntries,
          ...preparedSpellPoolEntries,
          ...alwaysPreparedSpellEntries
        ].map((spell) => [spell.id, spell])
      ),
    [
      alwaysPreparedSpellEntries,
      classSpellEntries,
      featGrantedCantripEntries,
      preparedSpellPoolEntries
    ]
  );
  const spellPreparationOptionsById = useMemo(
    () => new Map(spellPreparationOptions.map((spell) => [spell.id, spell])),
    [spellPreparationOptions]
  );
  const selectedCantrips = useMemo(() => {
    const selectedCantripEntries = new Map<string, SpellEntry>();

    selectedCantripIds.forEach((spellId) => {
      const spell = cantripOptionsById.get(spellId);

      if (spell) {
        selectedCantripEntries.set(spell.id, spell);
      }
    });

    featGrantedCantripEntries.forEach((spell) => {
      selectedCantripEntries.set(spell.id, spell);
    });

    return [...selectedCantripEntries.values()].sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }, [cantripOptionsById, featGrantedCantripEntries, selectedCantripIds]);
  const selectedPreparedSpells = useMemo(
    () =>
      usesPreparedSpells
        ? [...alwaysPreparedSpellIds, ...selectedPreparedSpellIds]
            .map((spellId) => knownSpellEntriesById.get(spellId))
            .filter((spell): spell is SpellEntry => spell !== undefined)
        : spellPreparationOptions,
    [
      alwaysPreparedSpellIds,
      knownSpellEntriesById,
      selectedPreparedSpellIds,
      spellPreparationOptions,
      usesPreparedSpells
    ]
  );
  const selectedSpellbookSpells = useMemo(
    () =>
      selectedSpellbookSpellIds
        .map((spellId) => knownSpellEntriesById.get(spellId))
        .filter((spell): spell is SpellEntry => spell !== undefined),
    [knownSpellEntriesById, selectedSpellbookSpellIds]
  );
  const wizardPreparedSpellIdSet = useMemo(
    () => new Set([...alwaysPreparedSpellIds, ...selectedPreparedSpellIds]),
    [alwaysPreparedSpellIds, selectedPreparedSpellIds]
  );
  const wizardSpellbookOnlyIdSet = useMemo(
    () =>
      new Set(
        selectedSpellbookSpellIds.filter((spellId) => !wizardPreparedSpellIdSet.has(spellId))
      ),
    [selectedSpellbookSpellIds, wizardPreparedSpellIdSet]
  );
  const visibleWizardLevelledSpells = useMemo(() => {
    if (!usesSpellbook) {
      return selectedPreparedSpells;
    }

    if (activeWizardSpellFilter === "prepared") {
      return selectedPreparedSpells;
    }

    const mergedSpells = new Map<string, SpellEntry>();

    [...selectedPreparedSpells, ...selectedSpellbookSpells].forEach((spell) => {
      mergedSpells.set(spell.id, spell);
    });

    return [...mergedSpells.values()].sort((left, right) => {
      if (left.spellLevel !== right.spellLevel) {
        return left.spellLevel - right.spellLevel;
      }

      return left.name.localeCompare(right.name);
    });
  }, [
    activeWizardSpellFilter,
    selectedPreparedSpells,
    selectedSpellbookSpells,
    usesSpellbook
  ]);
  const visibleSpellEntries = useMemo(
    () => [...selectedCantrips, ...visibleWizardLevelledSpells],
    [selectedCantrips, visibleWizardLevelledSpells]
  );
  const preparedSpellGroups = useMemo(
    () => groupSpellsByLevel(visibleSpellEntries),
    [visibleSpellEntries]
  );
  const cantripGroups = useMemo(() => groupSpellsByLevel(cantripOptions), [cantripOptions]);
  const spellPreparationLevelGroups = useMemo(
    () => createSpellPreparationLevelGroups(spellPreparationOptions),
    [spellPreparationOptions]
  );
  const cantripDraftSet = useMemo(() => new Set(cantripDraftIds), [cantripDraftIds]);
  const spellbookDraftSet = useMemo(() => new Set(spellbookDraftIds), [spellbookDraftIds]);
  const preparedSpellDraftSet = useMemo(
    () => new Set(preparedSpellDraftIds),
    [preparedSpellDraftIds]
  );
  const selectedInvocationIds = useMemo(
    () => getWarlockInvocationSelectionIdsForCharacter(character),
    [character]
  );
  const invocationDraftSet = useMemo(() => new Set(invocationDraftIds), [invocationDraftIds]);
  const cantripCount = cantripDraftIds.length;
  const hasCantripManagement = cantripLimit !== null && cantripLimit > 0;
  const isCantripLimitReached = cantripLimit !== null && cantripCount >= cantripLimit;
  const spellbookSpellCount = spellbookDraftIds.length;
  const preparedSpellCount = preparedSpellDraftIds.length;
  const selectedCantripCount = selectedCantripIds.length;
  const selectedPreparedSpellCount = selectedPreparedSpellIds.length;
  const eldritchInvocationLimit = getWarlockEldritchInvocationLimitForCharacter(character);
  const hasEldritchInvocationManagement = eldritchInvocationLimit > 0;
  const selectedInvocationCount = selectedInvocationIds.length;
  const invocationCount = invocationDraftIds.length;
  const isInvocationLimitReached =
    hasEldritchInvocationManagement && invocationCount >= eldritchInvocationLimit;
  const isPreparedSpellLimitReached =
    preparedSpellLimit !== null && preparedSpellCount >= preparedSpellLimit;
  const spellSelectionInputStatus = useMemo(
    () => getSpellSelectionInputStatusForCharacter(character),
    [character]
  );
  const hasSpellSelectionInputRequired = spellSelectionInputStatus.hasInputRequired;
  const learnedInvocationOptions = useMemo(
    () => getWarlockLearnedInvocationOptionsForCharacter(character),
    [character]
  );
  const invocationSelectionOptions = useMemo(
    () => getWarlockInvocationOptionsForCharacter(invocationManagerCharacter, invocationDraftIds),
    [invocationDraftIds, invocationManagerCharacter]
  );
  const activePreparedSpellOptions = useMemo(
    () => spellPreparationLevelGroups[activePreparedSpellLevel] ?? [],
    [activePreparedSpellLevel, spellPreparationLevelGroups]
  );
  const firstAvailablePreparedSpellLevel = useMemo(
    () =>
      spellSlotLevels.find((level) => (spellPreparationLevelGroups[level]?.length ?? 0) > 0) ?? 1,
    [spellPreparationLevelGroups]
  );
  const preparedSpellDraftCountsByLevel = useMemo(
    () =>
      countTrackedSpellsByLevel(
        [...alwaysPreparedSpellIds, ...preparedSpellDraftIds],
        knownSpellEntriesById
      ),
    [alwaysPreparedSpellIds, knownSpellEntriesById, preparedSpellDraftIds]
  );
  const spellOutcomeSummariesById = useMemo(
    () =>
      new Map(
        [
          ...classSpellEntries,
          ...featGrantedCantripEntries,
          ...preparedSpellPoolEntries,
          ...alwaysPreparedSpellEntries
        ].map((spell) => [spell.id, getSpellOutcomeSummaryForCharacter(character, spell)])
      ),
    [
      alwaysPreparedSpellEntries,
      character,
      classSpellEntries,
      featGrantedCantripEntries,
      preparedSpellPoolEntries
    ]
  );

  const roundTracker = useMemo(
    () => normalizeRoundTracker(character.roundTracker),
    [character.roundTracker]
  );
  const usesPactMagicLabel = character.className === "Warlock";
  const selectedSpellRoundTrackerResource = selectedSpell
    ? getRoundTrackerResourceForSpell(selectedSpell)
    : null;
  const selectedSpellActionWarning = getRoundTrackerActionWarning(
    selectedSpellRoundTrackerResource,
    roundTracker
  );
  const selectedSpellCastWarning =
    spellcastingState.blocked ? spellcastingState.reason : selectedSpellActionWarning;
  const selectedDivinityActionWarning = getRoundTrackerActionWarning(
    selectedDivinityRow
      ? getRoundTrackerResourceForEconomyType(selectedDivinityRow.option.economyType)
      : null,
    roundTracker
  );
  const selectedSpellAlwaysPrepared = selectedSpell
    ? alwaysPreparedSpellIdSet.has(selectedSpell.id)
    : false;
  const selectedSpellIsWizardSpellMastery = selectedSpell
    ? wizardSpellMasterySpellIdSet.has(selectedSpell.id)
    : false;
  const selectedSpellIsWizardSignatureSpell = selectedSpell
    ? wizardSignatureSpellIdSet.has(selectedSpell.id)
    : false;
  const selectedSpellInSpellbook = selectedSpell
    ? selectedSpellbookSpellIdSet.has(selectedSpell.id)
    : false;
  const selectedSpellPreparedNormally = selectedSpell
    ? selectedPreparedSpellIds.includes(selectedSpell.id)
    : false;
  const selectedSpellIsSpellbookOnly =
    usesSpellbook &&
    Boolean(selectedSpell) &&
    selectedSpellInSpellbook &&
    !selectedSpellAlwaysPrepared &&
    !selectedSpellPreparedNormally;
  const selectedSpellCanCastAsRitualFromSpellbook =
    selectedSpellIsSpellbookOnly && hasWizardRitualAdept && selectedSpell?.ritual === true;
  const selectedSpellHasSignatureSpellFreeCastAvailable =
    selectedSpell !== null &&
    hasWizardSignatureSpellFreeCastAvailableForCharacter(character, selectedSpell.id);
  const selectedSpellFreeCastSlotLevel =
    selectedSpell && selectedSpellIsWizardSpellMastery
      ? Math.max(1, getSpellLevel(selectedSpell))
      : selectedSpell && selectedSpellIsWizardSignatureSpell && selectedSpellHasSignatureSpellFreeCastAvailable
        ? 3
        : null;
  const selectedSpellBlockedReason =
    selectedSpellIsSpellbookOnly ? "This spell is in your spellbook but not prepared." : null;

  function getSpellRowActionShapeState(spell: SpellEntry) {
    return getActionShapeStateForRoundTrackerResource(
      getRoundTrackerResourceForSpell(spell),
      roundTracker
    );
  }

  function getDivinityRowActionShapeState(row: DivinityOptionRow) {
    return getActionShapeStateForRoundTrackerResource(
      getRoundTrackerResourceForEconomyType(row.option.economyType),
      roundTracker
    );
  }

  useEffect(() => {
    if (!selectedDivinityOptionKey) {
      return;
    }

    if (selectedDivinityRow) {
      return;
    }

    setSelectedDivinityOptionKey(null);
  }, [selectedDivinityOptionKey, selectedDivinityRow]);

  useEffect(() => {
    setCantripDraftIds((current) => {
      const normalized = normalizeTrackedSpellIds(current, cantripOptions, cantripLimit);
      return areSpellIdListsEqual(current, normalized) ? current : normalized;
    });
  }, [cantripLimit, cantripOptions]);

  useEffect(() => {
    setSpellbookDraftIds((current) => {
      const normalized = usesSpellbook
        ? normalizeSpellbookSpellIds(current, spellPreparationOptions)
        : [];

      return areSpellIdListsEqual(current, normalized) ? current : normalized;
    });
  }, [spellPreparationOptions, usesSpellbook]);

  useEffect(() => {
    setPreparedSpellDraftIds((current) => {
      const normalized = normalizePreparedSpellIds(
        usesSpellbook
          ? current.filter((spellId) => spellbookDraftSet.has(spellId))
          : current,
        spellPreparationOptions,
        preparedSpellLimit,
        alwaysPreparedSpellIds
      );
      return areSpellIdListsEqual(current, normalized) ? current : normalized;
    });
  }, [
    alwaysPreparedSpellIds,
    preparedSpellLimit,
    spellPreparationOptions,
    spellbookDraftSet,
    usesSpellbook
  ]);

  useEffect(() => {
    setInvocationDraftIds((current) => {
      const normalized = getWarlockInvocationSelectionIdsForCharacter(
        setWarlockInvocationSelectionIdsForCharacter(invocationManagerCharacter, current)
      );

      return areSpellIdListsEqual(current, normalized) ? current : normalized;
    });
  }, [invocationManagerCharacter]);

  useEffect(() => {
    if (activePreparedSpellLevel <= highestSpellSlotLevel) {
      return;
    }

    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
  }, [activePreparedSpellLevel, firstAvailablePreparedSpellLevel, highestSpellSlotLevel]);

  useEffect(() => {
    if (!selectedInvocation) {
      return;
    }

    const sourceOptions =
      spellManagementMode === "eldritch-invocations"
        ? invocationSelectionOptions
        : learnedInvocationOptions;

    if (sourceOptions.some((option) => option.selectionId === selectedInvocation.selectionId)) {
      return;
    }

    setSelectedInvocation(null);
  }, [invocationSelectionOptions, learnedInvocationOptions, selectedInvocation, spellManagementMode]);

  useEffect(() => {
    if (spellManagementMode !== "cantrips") {
      return;
    }

    const nextCantripIds = normalizeTrackedSpellIds(cantripDraftIds, cantripOptions, cantripLimit);

    if (areSpellIdListsEqual(selectedCantripIds, nextCantripIds)) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      cantripIds: nextCantripIds
    }));
  }, [
    cantripDraftIds,
    cantripLimit,
    cantripOptions,
    onPersistCharacter,
    selectedCantripIds,
    spellManagementMode
  ]);

  useEffect(() => {
    if (spellManagementMode !== "prepared-spells") {
      return;
    }

    const nextSpellbookIds = usesSpellbook
      ? normalizeSpellbookSpellIds(spellbookDraftIds, spellPreparationOptions)
      : [];
    const nextPreparedSpellIds = normalizePreparedSpellIds(
      usesSpellbook
        ? preparedSpellDraftIds.filter((spellId) => nextSpellbookIds.includes(spellId))
        : preparedSpellDraftIds,
      spellPreparationOptions,
      preparedSpellLimit,
      alwaysPreparedSpellIds
    );

    const spellbookUnchanged = areSpellIdListsEqual(selectedSpellbookSpellIds, nextSpellbookIds);
    const preparedUnchanged = areSpellIdListsEqual(selectedPreparedSpellIds, nextPreparedSpellIds);

    if (spellbookUnchanged && preparedUnchanged) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = {
        ...currentCharacter,
        spellbookSpellIds: nextSpellbookIds,
        preparedSpellIds: nextPreparedSpellIds
      };

      return currentCharacter.className === "Wizard"
        ? syncWizardSignatureSpellsToSpellbookForCharacter(
            syncWizardSpellMasterySelectionsToSpellbookForCharacter(nextCharacter)
          )
        : nextCharacter;
    });
  }, [
    alwaysPreparedSpellIds,
    onPersistCharacter,
    preparedSpellDraftIds,
    preparedSpellLimit,
    selectedPreparedSpellIds,
    selectedSpellbookSpellIds,
    spellPreparationOptions,
    spellbookDraftIds,
    spellManagementMode,
    usesSpellbook
  ]);

  useEffect(() => {
    if (spellManagementMode !== "eldritch-invocations") {
      return;
    }

    const nextInvocationIds = getWarlockInvocationSelectionIdsForCharacter(
      setWarlockInvocationSelectionIdsForCharacter(character, invocationDraftIds)
    );

    if (areSpellIdListsEqual(selectedInvocationIds, nextInvocationIds)) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      setWarlockInvocationSelectionIdsForCharacter(currentCharacter, nextInvocationIds)
    );
  }, [
    character,
    invocationDraftIds,
    onPersistCharacter,
    selectedInvocationIds,
    spellManagementMode
  ]);

  const openSpellManagementMenu = useCallback(() => {
    setCantripDraftIds(selectedCantripIds);
    setSpellbookDraftIds(selectedSpellbookSpellIds);
    setPreparedSpellDraftIds(selectedPreparedSpellIds);
    setInvocationDraftIds(selectedInvocationIds);
    setSpellManagementMode("menu");
  }, [
    selectedCantripIds,
    selectedInvocationIds,
    selectedPreparedSpellIds,
    selectedSpellbookSpellIds
  ]);

  const beginCantripManagement = useCallback(() => {
    setSpellManagementMode("cantrips");
  }, []);

  const beginPreparedSpellManagement = useCallback(() => {
    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
    setSpellManagementMode("prepared-spells");
  }, [firstAvailablePreparedSpellLevel]);

  const beginInvocationManagement = useCallback(() => {
    setSpellManagementMode("eldritch-invocations");
  }, []);

  const refreshSpellSlots = useCallback(() => {
    onPersistCharacter((currentCharacter) =>
      usesPactMagicLabel
        ? restoreWarlockPactMagicSpellSlots(currentCharacter)
        : {
            ...currentCharacter,
            spellSlotsExpended: Array.from({ length: 9 }, () => 0)
          }
    );

    setSpellManagementMode(null);
  }, [onPersistCharacter, usesPactMagicLabel]);

  const toggleCantripDraft = useCallback(
    (spellId: string) => {
      setCantripDraftIds((current) =>
        current.includes(spellId)
          ? current.filter((currentSpellId) => currentSpellId !== spellId)
          : cantripLimit !== null && current.length >= cantripLimit
            ? current
            : [...current, spellId]
      );
    },
    [cantripLimit]
  );

  const togglePreparedSpellDraft = useCallback(
    (spellId: string) => {
      setPreparedSpellDraftIds((current) => {
        const normalizedCurrent = normalizePreparedSpellIds(
          usesSpellbook ? current.filter((currentSpellId) => spellbookDraftSet.has(currentSpellId)) : current,
          spellPreparationOptions,
          preparedSpellLimit,
          alwaysPreparedSpellIds
        );

        if (normalizedCurrent.includes(spellId)) {
          return normalizedCurrent.filter((currentSpellId) => currentSpellId !== spellId);
        }

        const spell = spellPreparationOptionsById.get(spellId);

        if (!spell) {
          return normalizedCurrent;
        }

        if (preparedSpellLimit !== null && normalizedCurrent.length >= preparedSpellLimit) {
          return normalizedCurrent;
        }

        return [...normalizedCurrent, spellId];
      });
    },
    [
      alwaysPreparedSpellIds,
      preparedSpellLimit,
      spellPreparationOptions,
      spellPreparationOptionsById,
      spellbookDraftSet,
      usesSpellbook
    ]
  );

  const toggleSpellbookDraft = useCallback(
    (spellId: string) => {
      setSpellbookDraftIds((current) => {
        if (current.includes(spellId)) {
          setPreparedSpellDraftIds((preparedCurrent) =>
            preparedCurrent.filter((currentSpellId) => currentSpellId !== spellId)
          );

          return current.filter((currentSpellId) => currentSpellId !== spellId);
        }

        return [...current, spellId];
      });
    },
    []
  );

  const toggleInvocationDraft = useCallback(
    (selectionId: string) => {
      setInvocationDraftIds((current) => {
        if (current.includes(selectionId)) {
          const blockingSelections = getWarlockInvocationBlockingSelectionNamesForCharacter(
            selectionId,
            current
          );

          return blockingSelections.length > 0
            ? current
            : current.filter((currentSelectionId) => currentSelectionId !== selectionId);
        }

        if (!hasEldritchInvocationManagement || current.length >= eldritchInvocationLimit) {
          return current;
        }

        return [...current, selectionId];
      });
    },
    [eldritchInvocationLimit, hasEldritchInvocationManagement]
  );

  function renderWizardSpellManagementControls(spell: SpellEntry) {
    const isAlwaysPrepared = alwaysPreparedSpellIdSet.has(spell.id);
    const isInSpellbook = spellbookDraftSet.has(spell.id);
    const isPrepared = isAlwaysPrepared || preparedSpellDraftSet.has(spell.id);
    const canPrepare = isAlwaysPrepared || isInSpellbook;
    const isPrepareDisabled =
      isAlwaysPrepared || !canPrepare || (!isPrepared && isPreparedSpellLimitReached);

    return (
      <div className={styles.wizardSelectionControls}>
        <button
          type="button"
          className={styles.wizardSelectionToggle}
          role="checkbox"
          aria-checked={isInSpellbook}
          aria-label={`${isInSpellbook ? "Remove" : "Add"} ${spell.name} from spellbook`}
          onClick={() => toggleSpellbookDraft(spell.id)}
        >
          <span className={styles.wizardSelectionLabel}>Spellbook</span>
          <input
            type="checkbox"
            checked={isInSpellbook}
            readOnly
            tabIndex={-1}
            className={styles.selectableCheckbox}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className={clsx(
            styles.wizardSelectionToggle,
            isPrepareDisabled && styles.wizardSelectionToggleDisabled
          )}
          role="checkbox"
          aria-checked={isPrepared}
          aria-label={`${isPrepared ? "Unprepare" : "Prepare"} ${spell.name}`}
          onClick={() => togglePreparedSpellDraft(spell.id)}
          disabled={isPrepareDisabled}
        >
          <span className={styles.wizardSelectionLabel}>Prepared</span>
          <input
            type="checkbox"
            checked={isPrepared}
            readOnly
            tabIndex={-1}
            className={styles.selectableCheckbox}
            aria-hidden="true"
          />
        </button>
      </div>
    );
  }

  if (!canCastSpells) {
    return null;
  }

  function openSpellDetails(spell: SpellEntry, viewMode: SelectedSpellViewMode = "standard") {
    closeSelectedDivinity();
    closeSelectedInvocation();
    const spellLevel = getSpellLevel(spell);
    const minimumSlotLevel = Math.max(1, spellLevel);
    const isWizardSpellMasterySpell = wizardSpellMasterySpellIdSet.has(spell.id);
    const hasWizardSignatureSpellFreeCast =
      wizardSignatureSpellIdSet.has(spell.id) &&
      hasWizardSignatureSpellFreeCastAvailableForCharacter(character, spell.id);
    const preferredSlotLevel =
      spellLevel === 0
        ? 1
        : isWizardSpellMasterySpell
          ? minimumSlotLevel
          : hasWizardSignatureSpellFreeCast
            ? wizardSignatureSpellLevel
          : (spellSlotLevels.find(
              (slotLevel) =>
                slotLevel >= minimumSlotLevel && (spellSlotsRemaining[slotLevel - 1] ?? 0) > 0
            ) ??
            spellSlotLevels.find(
              (slotLevel) =>
                slotLevel >= minimumSlotLevel && (spellSlotTotals[slotLevel - 1] ?? 0) > 0
            ) ??
            minimumSlotLevel);

    setSelectedSpellViewMode(viewMode);
    setSelectedSpellSlotLevel(preferredSlotLevel);
    setSelectedSpell(spell);
  }

  function openDivinityDetails(optionKey: string) {
    closeSelectedSpell();
    closeSelectedInvocation();
    setSelectedDivinityOptionKey(optionKey);
  }

  function openInvocationDetails(option: WarlockEldritchInvocationOption) {
    closeSelectedSpell();
    closeSelectedDivinity();
    setSelectedInvocation(option);
  }

  function castSelectedSpell(options?: { castAsRitual?: boolean }) {
    if (!selectedSpell || spellcastingState.blocked) {
      return;
    }

    const spellLevel = getSpellLevel(selectedSpell);
    const roundTrackerResource = getRoundTrackerResourceForSpell(selectedSpell);
    const castAsRitual = options?.castAsRitual === true && selectedSpell.ritual === true;
    const canCastSpellbookRitual =
      selectedSpellIsSpellbookOnly && hasWizardRitualAdept && castAsRitual;

    if (selectedSpellIsSpellbookOnly && !canCastSpellbookRitual) {
      return;
    }

    if (spellLevel === 0) {
      if (roundTrackerResource) {
        onPersistCharacter((currentCharacter) => {
          const preparedCharacter = prepareCharacterForResourceConsumption(
            currentCharacter,
            roundTrackerResource
          );
          const nextCharacter = {
            ...preparedCharacter,
            statusEntries: applySpellConcentrationToStatusEntries(
              preparedCharacter.statusEntries,
              selectedSpell
            )
          };

          return consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource);
        });
      } else {
        onPersistCharacter((currentCharacter) => ({
          ...currentCharacter,
          statusEntries: applySpellConcentrationToStatusEntries(
            currentCharacter.statusEntries,
            selectedSpell
          )
        }));
      }

      closeSelectedSpell();
      return;
    }

    if (castAsRitual) {
      onPersistCharacter((currentCharacter) => {
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = {
          ...preparedCharacter,
          statusEntries: applySpellConcentrationToStatusEntries(
            preparedCharacter.statusEntries,
            selectedSpell
          )
        };

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });

      closeSelectedSpell();
      return;
    }

    const minimumSlotLevel = Math.max(1, spellLevel);
    const slotLevel = clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);
    const castsFreeViaSpellMastery =
      selectedSpellIsWizardSpellMastery && slotLevel === minimumSlotLevel;
    const castsFreeViaSignatureSpells =
      selectedSpellIsWizardSignatureSpell &&
      slotLevel === wizardSignatureSpellLevel &&
      hasWizardSignatureSpellFreeCastAvailableForCharacter(character, selectedSpell.id);
    const castsWithoutSpellSlot = castsFreeViaSpellMastery || castsFreeViaSignatureSpells;

    if (!castsWithoutSpellSlot && (spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
        preparedCharacter.className,
        preparedCharacter.level
      );
      const currentSpellSlotsExpended = normalizeSpellSlotsExpended(
        preparedCharacter.spellSlotsExpended,
        currentSpellSlotTotals
      );
      const nextSpellSlotsExpended = [...currentSpellSlotsExpended];

      if (!castsWithoutSpellSlot) {
        nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;
      }

      const nextCharacter =
        castsFreeViaSignatureSpells
          ? consumeWizardSignatureSpellFreeCastForCharacter(preparedCharacter, selectedSpell.id)
          : preparedCharacter;
      const nextCharacterWithSpellcast = {
        ...nextCharacter,
        spellSlotsExpended: castsWithoutSpellSlot
          ? nextCharacter.spellSlotsExpended
          : nextSpellSlotsExpended,
        statusEntries: applySpellConcentrationToStatusEntries(
          nextCharacter.statusEntries,
          selectedSpell
        )
      };

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacterWithSpellcast, roundTrackerResource)
        : nextCharacterWithSpellcast;
    });

    closeSelectedSpell();
  }

  function channelSelectedDivinity() {
    if (!selectedDivinityRow || channelDivinityUsesRemaining <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedDivinityRow.option.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionOptionForCharacter(
        preparedCharacter,
        selectedDivinityRow.action.key,
        selectedDivinityRow.option.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeSelectedDivinity();
  }

  const isPreparedSpellPreview = selectedSpellViewMode === "prepare-preview";

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Spellcasting</p>
          <h3 className={shared.subtitle}>
            {hasEldritchInvocationManagement
              ? "Invocations, prepared spells, and spell slots"
              : usesSpellbook
                ? "Spellbook, prepared spells, and spell slots"
              : "Prepared spells and spell slots"}
          </h3>
        </div>
        <div className={shared.headerActions}>
          {hasSpellSelectionInputRequired ? (
            <span className={styles.spellInputRequired}>
              <TriangleAlert size={16} aria-hidden="true" />
              Input required
            </span>
          ) : null}
          <button
            type="button"
            className={shared.editButton}
            onClick={openSpellManagementMenu}
            disabled={spellcastingState.blocked}
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </div>

      {spellcastingState.reason ? (
        <p className={styles.spellcastingBlockedNotice}>{spellcastingState.reason}</p>
      ) : null}

      <div className={styles.spellSlotHeader}>
        <p className={styles.spellGroupTitle}>Spell slots</p>
      </div>
      <div className={styles.spellSlotGrid}>
        {spellSlotLevels.map((slotLevel) => {
          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
          const remainingSlots = spellSlotsRemaining[slotLevel - 1] ?? 0;

          return (
            <div
              key={slotLevel}
              className={clsx(styles.spellSlotCard, totalSlots === 0 && styles.spellSlotCardEmpty)}
            >
              <span>L{slotLevel}</span>
              {totalSlots === 0 ? (
                <small className={styles.spellSlotDash}>-</small>
              ) : (
                <div className={styles.spellSlotSquares}>
                  {Array.from({ length: totalSlots }, (_, index) => (
                    <span
                      key={`${slotLevel}-${index}`}
                      className={clsx(
                        styles.spellSlotSquare,
                        index < remainingSlots && styles.spellSlotSquareFilled
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {usesSpellbook ? (
        <div className={styles.wizardFilterBar} role="tablist" aria-label="Wizard spell view">
          {([
            ["all", "All Spellbook"],
            ["prepared", "Prepared"]
          ] as const).map(([filterKey, label]) => (
            <button
              key={filterKey}
              type="button"
              role="tab"
              aria-selected={activeWizardSpellFilter === filterKey}
              className={clsx(
                styles.wizardFilterButton,
                activeWizardSpellFilter === filterKey && styles.wizardFilterButtonActive
              )}
              onClick={() => setActiveWizardSpellFilter(filterKey)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.spellListStack}>
        {learnedInvocationOptions.length > 0 ? (
          <div className={styles.spellGroup}>
            <p className={styles.spellGroupTitle}>
              {`Eldritch Invocations (${selectedInvocationCount}/${eldritchInvocationLimit})`}
            </p>
            <ul className={styles.spellList}>
              {learnedInvocationOptions.map((option) => (
                <li key={option.selectionId}>
                  <EldritchInvocationListRow
                    name={option.displayName}
                    subtitle={option.displaySubtitle}
                    metaText="Eldritch Invocation"
                    onClick={() => openInvocationDetails(option)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {channelDivinityRows.length > 0 ? (
          <div className={styles.spellGroup}>
            <p className={styles.spellGroupTitle}>
              {`Channel Divinity (uses ${channelDivinityUsesRemaining}/${channelDivinityUsesTotal})`}
            </p>
            <ul className={styles.spellList}>
              {channelDivinityRows.map((row) => (
                <li key={row.option.key}>
                  {(() => {
                    const actionShapeState = getDivinityRowActionShapeState(row);

                    return (
                      <DivinityListRow
                        divinity={{
                          ...row.entry,
                          name: row.option.name
                        }}
                        onClick={() => openDivinityDetails(row.option.key)}
                        valueSummary={formatFeatureActionOptionRangeLabel(row.option)}
                        actionShapeSelected={actionShapeState.isSelected}
                        actionShapeMultiCount={actionShapeState.multiCount}
                      />
                    );
                  })()}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {preparedSpellGroups.length === 0 &&
        channelDivinityRows.length === 0 &&
        learnedInvocationOptions.length === 0 ? (
          <p className={shared.emptyText}>
            No spells, cantrips, or eldritch invocations have been selected yet.
          </p>
        ) : (
          preparedSpellGroups.map((group) => (
            <div key={group.level} className={styles.spellGroup}>
              <p className={styles.spellGroupTitle}>{formatSpellGroupTitle(group.level)}</p>
              <ul className={styles.spellList}>
                {group.spells.map((spell) => (
                  <li key={spell.id}>
                    {(() => {
                      const actionShapeState = getSpellRowActionShapeState(spell);

                      return (
                        <SpellListRow
                          spell={spell}
                          onClick={() => openSpellDetails(spell)}
                          valueSummary={
                            wizardSpellbookOnlyIdSet.has(spell.id)
                              ? ""
                              : (spellOutcomeSummariesById.get(spell.id) ?? "")
                          }
                          detailNote={
                            wizardSpellbookOnlyIdSet.has(spell.id)
                              ? "In Spellbook but not prepared"
                              : undefined
                          }
                          detailNoteTone={
                            wizardSpellbookOnlyIdSet.has(spell.id) ? "accent" : "default"
                          }
                          alwaysPrepared={alwaysPreparedSpellIdSet.has(spell.id)}
                          highlightTone={
                            wizardSpellMasterySpellIdSet.has(spell.id) ||
                            wizardSignatureSpellIdSet.has(spell.id)
                              ? "spell-mastery"
                              : "default"
                          }
                          compactConcentrationDuration
                          actionShapeSelected={actionShapeState.isSelected}
                          actionShapeMultiCount={actionShapeState.multiCount}
                        />
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {spellManagementMode ? (
        <div
          className={sheetStyles.spellManagementBackdrop}
          role="presentation"
          onClick={() => setSpellManagementMode(null)}
        >
          <section
            className={sheetStyles.spellManagementModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spell-management-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellManagementHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Spellcasting</p>
                <h3 id="spell-management-title">
                  {spellManagementMode === "menu"
                    ? "Spell options"
                    : spellManagementMode === "cantrips"
                      ? "Manage cantrips"
                      : spellManagementMode === "eldritch-invocations"
                        ? "Manage eldritch invocations"
                        : "Prepare spells"}
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setSpellManagementMode(null)}
                aria-label="Close spell options"
              >
                <X size={18} />
              </button>
            </div>

            {spellManagementMode === "menu" ? (
              <div className={sheetStyles.spellManagementOptionGrid}>
                <button
                  type="button"
                  className={sheetStyles.spellManagementOptionButton}
                  onClick={refreshSpellSlots}
                >
                  <strong>
                    {usesPactMagicLabel
                      ? "Refresh Pact Magic spell slots"
                      : "Refresh spell slots"}
                  </strong>
                  <small>
                    {usesPactMagicLabel
                      ? "Restore all available Pact Magic spell slots."
                      : "Restore all available spell slots."}
                  </small>
                </button>
                {hasCantripManagement ? (
                  <button
                    type="button"
                    className={sheetStyles.spellManagementOptionButton}
                    onClick={beginCantripManagement}
                  >
                    <strong>
                      Manage cantrips{" "}
                      <SelectionCounter
                        current={selectedCantripCount}
                        total={cantripLimit ?? 0}
                      />
                    </strong>
                    <small>Choose from the list of cantrips for your class.</small>
                  </button>
                ) : null}
                {hasEldritchInvocationManagement ? (
                  <button
                    type="button"
                    className={sheetStyles.spellManagementOptionButton}
                    onClick={beginInvocationManagement}
                  >
                    <strong>
                      Manage Eldritch Invocations{" "}
                      <SelectionCounter
                        current={selectedInvocationCount}
                        total={eldritchInvocationLimit}
                      />
                    </strong>
                    <small>Choose from the invocations you currently qualify for.</small>
                  </button>
                ) : null}
                {usesPreparedSpells ? (
                  <button
                    type="button"
                    className={sheetStyles.spellManagementOptionButton}
                    onClick={beginPreparedSpellManagement}
                  >
                    <strong>
                      {usesSpellbook
                        ? (
                            <>
                              Manage spellbook &amp; prepare spells{" "}
                              <SelectionCounter
                                current={selectedPreparedSpellCount}
                                total={preparedSpellLimit ?? 0}
                              />
                            </>
                          )
                        : (
                            <>
                              Prepare spells{" "}
                              <SelectionCounter
                                current={selectedPreparedSpellCount}
                                total={preparedSpellLimit ?? 0}
                              />
                            </>
                          )}
                    </strong>
                    <small>
                      {usesSpellbook
                        ? "Add spells to your spellbook, then choose which of them are prepared."
                        : "Choose from the list of spells for your class based on your current level."}
                    </small>
                  </button>
                ) : null}
              </div>
            ) : spellManagementMode === "cantrips" ? (
              <>
                <div className={styles.preparedSpellStatusRow}>
                  <div>
                    <p className={styles.preparedSpellStatusLabel}>Cantrips</p>
                    {cantripLimit !== null ? (
                      <p className={styles.preparedSpellLimitText}>
                        <SelectionCounter current={cantripCount} total={cantripLimit} /> selected
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className={clsx(sheetStyles.spellManagementList, styles.preparedSpellList)}>
                  {cantripGroups.length === 0 ? (
                    <p className={shared.emptyText}>
                      No cantrips are available for this class right now.
                    </p>
                  ) : (
                    cantripGroups.map((group) => (
                      <div key={group.level} className={sheetStyles.spellManagementGroup}>
                        <p className={sheetStyles.spellGroupTitle}>
                          {formatSpellGroupTitle(group.level)}
                        </p>
                        <ul className={styles.preparedSpellSelectionList}>
                          {group.spells.map((spell) => {
                            const isChecked = cantripDraftSet.has(spell.id);
                            const isDisabled = !isChecked && isCantripLimitReached;
                            const actionShapeState = getSpellRowActionShapeState(spell);

                            return (
                              <li key={spell.id}>
                                <SpellListRow
                                  spell={spell}
                                  onClick={() => openSpellDetails(spell, "prepare-preview")}
                                  valueSummary={spellOutcomeSummariesById.get(spell.id) ?? ""}
                                  alwaysPrepared={alwaysPreparedSpellIdSet.has(spell.id)}
                                  compactConcentrationDuration
                                  selectable
                                  isSelected={isChecked}
                                  onSelect={() => toggleCantripDraft(spell.id)}
                                  disabled={isDisabled}
                                  actionShapeSelected={actionShapeState.isSelected}
                                  actionShapeMultiCount={actionShapeState.multiCount}
                                  className={
                                    isDisabled ? styles.spellManagementChoiceDisabled : undefined
                                  }
                                />
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : spellManagementMode === "eldritch-invocations" ? (
              <>
                <div className={styles.preparedSpellStatusRow}>
                  <div>
                    <p className={styles.preparedSpellStatusLabel}>Eldritch Invocations</p>
                    <p className={styles.preparedSpellLimitText}>
                      <SelectionCounter
                        current={invocationCount}
                        total={eldritchInvocationLimit}
                      />{" "}
                      learned
                    </p>
                  </div>
                </div>

                <div className={clsx(sheetStyles.spellManagementList, styles.preparedSpellList)}>
                  {invocationSelectionOptions.length === 0 ? (
                    <p className={shared.emptyText}>
                      No eldritch invocations are available for this Warlock right now.
                    </p>
                  ) : (
                    <ul className={styles.preparedSpellSelectionList}>
                      {invocationSelectionOptions.map((option) => {
                        const isChecked = invocationDraftSet.has(option.selectionId);
                        const blockingSelections = isChecked
                          ? getWarlockInvocationBlockingSelectionNamesForCharacter(
                              option.selectionId,
                              invocationDraftIds
                            )
                          : [];
                        const isDisabled =
                          option.isPlaceholder ||
                          (isChecked
                            ? blockingSelections.length > 0
                            : !option.isQualified || isInvocationLimitReached);

                        return (
                          <li key={option.selectionId}>
                            <EldritchInvocationListRow
                              name={option.displayName}
                              subtitle={option.displaySubtitle}
                              metaText={option.requirementLabel}
                              onClick={() => openInvocationDetails(option)}
                              selectable
                              isSelected={isChecked}
                              onSelect={() => toggleInvocationDraft(option.selectionId)}
                              disabled={isDisabled}
                              className={
                                option.isPlaceholder || !option.isQualified
                                  ? styles.spellManagementChoiceDisabled
                                  : undefined
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={styles.preparedSpellStatusRow}>
                  <div>
                    <p className={styles.preparedSpellStatusLabel}>
                      {usesSpellbook ? "Spellbook and prepared spells" : "Prepared spells"}
                    </p>
                    {usesSpellbook ? (
                      <>
                        <p className={styles.preparedSpellLimitText}>
                          {spellbookSpellCount} in spellbook
                        </p>
                        {preparedSpellLimit !== null ? (
                          <p className={styles.preparedSpellLimitText}>
                            <SelectionCounter
                              current={preparedSpellCount}
                              total={preparedSpellLimit}
                            />{" "}
                            prepared
                          </p>
                        ) : null}
                      </>
                    ) : preparedSpellLimit !== null ? (
                      <p className={styles.preparedSpellLimitText}>
                        <SelectionCounter
                          current={preparedSpellCount}
                          total={preparedSpellLimit}
                        />{" "}
                        prepared
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className={styles.preparedSpellTabRow}>
                  <span className={styles.preparedSpellTabLabel}>Level</span>
                  <div
                    className={styles.preparedSpellTabList}
                    role="tablist"
                    aria-label="Spell levels"
                  >
                    {spellSlotLevels.map((level) => {
                      const selectedCount = preparedSpellDraftCountsByLevel[level] ?? 0;
                      const isDisabled = level > highestSpellSlotLevel;

                      return (
                        <button
                          key={`prepared-level-${level}`}
                          type="button"
                          role="tab"
                          aria-selected={activePreparedSpellLevel === level}
                          aria-label={`Level ${level}, ${selectedCount} spell${selectedCount === 1 ? "" : "s"} selected`}
                          className={clsx(
                            styles.preparedSpellTabButton,
                            activePreparedSpellLevel === level &&
                              styles.preparedSpellTabButtonActive
                          )}
                          onClick={() => setActivePreparedSpellLevel(level)}
                          disabled={isDisabled}
                        >
                          <span className={styles.preparedSpellTabNumber}>{level}</span>
                          <span className={styles.preparedSpellTabIndicator} aria-hidden="true">
                            ({selectedCount})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={clsx(sheetStyles.spellManagementList, styles.preparedSpellList)}>
                  {activePreparedSpellOptions.length === 0 ? (
                    <p className={shared.emptyText}>
                      No {formatSpellGroupTitle(activePreparedSpellLevel).toLowerCase()} are
                      available for this class and level yet.
                    </p>
                  ) : (
                    <ul className={styles.preparedSpellSelectionList}>
                      {activePreparedSpellOptions.map((spell) => {
                        const isAlwaysPrepared = alwaysPreparedSpellIdSet.has(spell.id);
                        const isChecked = isAlwaysPrepared || preparedSpellDraftSet.has(spell.id);
                        const isDisabled =
                          !usesSpellbook &&
                          (isAlwaysPrepared || (!isChecked && isPreparedSpellLimitReached));
                        const actionShapeState = getSpellRowActionShapeState(spell);

                        return (
                          <li key={spell.id}>
                            <SpellListRow
                              spell={spell}
                              onClick={() => openSpellDetails(spell, "prepare-preview")}
                              valueSummary={spellOutcomeSummariesById.get(spell.id) ?? ""}
                              alwaysPrepared={isAlwaysPrepared}
                              compactConcentrationDuration
                              selectable
                              isSelected={
                                usesSpellbook
                                  ? spellbookDraftSet.has(spell.id) || isAlwaysPrepared
                                  : isChecked
                              }
                              onSelect={
                                usesSpellbook ? undefined : () => togglePreparedSpellDraft(spell.id)
                              }
                              selectionControls={
                                usesSpellbook
                                  ? renderWizardSpellManagementControls(spell)
                                  : undefined
                              }
                              disabled={isDisabled}
                              actionShapeSelected={actionShapeState.isSelected}
                              actionShapeMultiCount={actionShapeState.multiCount}
                              className={
                                isAlwaysPrepared ? styles.spellManagementChoiceDisabled : undefined
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}

      {selectedSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedSpell}
          alwaysPrepared={selectedSpellAlwaysPrepared}
          mode={selectedSpellViewMode}
          spellSlotTotals={spellSlotTotals}
          spellSlotsRemaining={spellSlotsRemaining}
          selectedSpellSlotLevel={selectedSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedSpellSlotLevel}
          onClose={closeSelectedSpell}
          onAction={castSelectedSpell}
          actionConsumesSpellSlot={!selectedSpellIsSpellbookOnly}
          freeCastSlotLevel={selectedSpellFreeCastSlotLevel}
          allowRitualCasting={selectedSpellCanCastAsRitualFromSpellbook}
          actionWarning={selectedSpellCastWarning}
          actionDisabled={selectedSpellCastWarning !== null}
          blockedReason={selectedSpellBlockedReason}
          backdropClassName={isPreparedSpellPreview ? styles.previewSpellDrawerBackdrop : undefined}
        />
      ) : null}

      {selectedInvocation ? (
        <EldritchInvocationDrawer
          option={selectedInvocation}
          onClose={closeSelectedInvocation}
          backdropClassName={
            spellManagementMode === "eldritch-invocations"
              ? styles.previewSpellDrawerBackdrop
              : undefined
          }
        />
      ) : null}

      {selectedDivinityRow ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={closeSelectedDivinity}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-divinity-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>{formatCodexLabel("DIVINITY")}</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="character-divinity-drawer-title">{selectedDivinityRow.option.name}</h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>
                  {formatDivinitySubtitle(selectedDivinityRow.entry)}
                </p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={closeSelectedDivinity}
                aria-label="Close divinity details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerBody}>
              <div className={sheetStyles.spellDrawerDetails}>
                <div className={sheetStyles.spellDrawerDetailCard}>
                  <span>Casting Time</span>
                  <strong>{formatSpellCastingTime(selectedDivinityRow.entry.castingTime)}</strong>
                </div>
                <div className={sheetStyles.spellDrawerDetailCard}>
                  <span>Range</span>
                  <strong>{selectedDivinityRow.entry.range}</strong>
                </div>
                <div className={sheetStyles.spellDrawerDetailCard}>
                  <span>Duration</span>
                  <strong>{selectedDivinityRow.entry.duration}</strong>
                </div>
                <div className={sheetStyles.spellDrawerDetailCard}>
                  <span>{selectedDivinityRow.option.resultLabel ?? "Damage"}</span>
                  <strong>{getDivinityDrawerValueLabel(selectedDivinityRow.option)}</strong>
                </div>
              </div>

              <SpellDescriptionContent
                description={
                  selectedDivinityDisplay?.description ?? selectedDivinityRow.entry.description
                }
                className={clsx(
                  sheetStyles.spellDrawerDescriptionList,
                  sheetStyles.spellDrawerDescriptionSection
                )}
                entryClassName={sheetStyles.spellDrawerDescriptionLine}
              />
            </div>

            <div className={sheetStyles.spellDrawerActions}>
              <div className={actionStyles.castActionMeta}>
                <div className={sheetStyles.spellDrawerCastControls}>
                  <p className={sheetStyles.spellDrawerSlotText}>
                    {`${channelDivinityUsesRemaining}/${channelDivinityUsesTotal} uses remaining`}
                  </p>
                </div>
                {selectedDivinityActionWarning ? (
                  <p className={actionStyles.castActionWarning}>
                    {selectedDivinityActionWarning}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className={sheetStyles.castButton}
                onClick={channelSelectedDivinity}
                disabled={
                  channelDivinityUsesRemaining <= 0 || selectedDivinityActionWarning !== null
                }
              >
                Channel Divinity
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}

export default SpellCastingForm;
