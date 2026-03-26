import clsx from "clsx";
import { Pencil, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import DivinityListRow from "../../../DivinityListRow/DivinityListRow";
import SpellListRow from "../../../SpellListRow";
import SpellDescriptionContent from "../../../SpellDescriptionContent";
import CharacterSpellDrawer, { type CharacterSpellDrawerMode } from "./CharacterSpellDrawer";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useClassSpellEntries, usePreparedSpellEntries } from "../../../../codex/classes";
import {
  ACTION_TYPE,
  getDivinityEntryById,
  type DivinityEntry,
  type SpellEntry
} from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { formatDivinitySubtitle, formatSpellCastingTime, formatCodexLabel } from "../../../../utils/codex";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker,
  type RoundTrackerResource
} from "../../../../pages/CharactersPage/combat";
import { getRoundTrackerResourceForEconomyType } from "../../../../pages/CharactersPage/actionEconomy";
import {
  activateFeatureActionOptionForCharacter,
  getFeatureActionsForCharacter,
  getFeatureActionOptionsForCharacter,
  getSpellcastingStateForCharacter,
  type FeatureActionCard,
  type FeatureActionOptionCard
} from "../../../../pages/CharactersPage/classFeatures";
import {
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal,
  getClericResolvedDivinityDisplay
} from "../../../../pages/CharactersPage/classFeatures/cleric";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getPreparedSpellLimitForCharacter,
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  isSpellcastingClass,
  normalizeTrackedSpellIds,
  normalizePreparedSpellIds,
  normalizeSpellSlotsExpended,
  usesPreparedSpellsForCharacter
} from "../../../../pages/CharactersPage/spellcasting";
import { formatFeatureActionOptionRangeLabel } from "../../../../pages/CharactersPage/actionOutcome";
import type {
  PersistCharacterUpdater,
  SpellManagementMode
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  clampNumber,
  formatSpellGroupTitle,
  spellSlotLevels
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { getSpellOutcomeSummaryForCharacter } from "../../../../pages/CharactersPage/spellOutcome";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SpellCastingForm.module.css";

type SpellCastingFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type SpellGroup = {
  level: number;
  spells: SpellEntry[];
};

type SpellPreparationLevelGroup = Record<number, SpellEntry[]>;
type SelectedSpellViewMode = CharacterSpellDrawerMode;
type DivinityOptionRow = {
  action: FeatureActionCard;
  option: FeatureActionOptionCard;
  entry: DivinityEntry;
};

function getChannelDivinityEntryForOption(optionKey: string): DivinityEntry | null {
  if (optionKey === "divine-spark-heal" || optionKey === "divine-spark-damage") {
    return getDivinityEntryById("divinity-divine-spark");
  }

  if (optionKey === "turn-undead") {
    return getDivinityEntryById("divinity-turn-undead");
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

function areSpellIdListsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((spellId, index) => spellId === right[index]);
}

function getRoundTrackerResourceForSpell(spell: SpellEntry): RoundTrackerResource | null {
  if (spell.castingTime.includes(ACTION_TYPE.REACTION)) {
    return "reaction";
  }

  if (spell.castingTime.includes(ACTION_TYPE.BONUS_ACTION)) {
    return "bonusAction";
  }

  if (spell.castingTime.includes(ACTION_TYPE.ACTION)) {
    return "action";
  }

  return null;
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

function SpellCastingForm({ className, onPersistCharacter }: SpellCastingFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);
  const [selectedDivinityOptionKey, setSelectedDivinityOptionKey] = useState<string | null>(null);
  const [selectedSpellViewMode, setSelectedSpellViewMode] =
    useState<SelectedSpellViewMode>("standard");
  const [selectedSpellSlotLevel, setSelectedSpellSlotLevel] = useState(1);
  const [spellManagementMode, setSpellManagementMode] = useState<SpellManagementMode | null>(null);
  const [cantripDraftIds, setCantripDraftIds] = useState<string[]>([]);
  const [preparedSpellDraftIds, setPreparedSpellDraftIds] = useState<string[]>([]);
  const [activePreparedSpellLevel, setActivePreparedSpellLevel] = useState(1);

  useBodyScrollLock(
    Boolean(spellManagementMode || selectedSpell || selectedDivinityOptionKey)
  );

  const closeSelectedSpell = useCallback(() => {
    setSelectedSpell(null);
    setSelectedSpellViewMode("standard");
  }, []);
  const closeSelectedDivinity = useCallback(() => {
    setSelectedDivinityOptionKey(null);
  }, []);

  useEffect(() => {
    if (!selectedSpell && !selectedDivinityOptionKey && !spellManagementMode) {
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

        setSpellManagementMode(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    closeSelectedDivinity,
    closeSelectedSpell,
    selectedDivinityOptionKey,
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
    setSpellManagementMode(null);
  }, [canCastSpells, closeSelectedDivinity, closeSelectedSpell]);

  useEffect(() => {
    if (!spellcastingState.blocked) {
      return;
    }

    setSpellManagementMode(null);
  }, [spellcastingState.blocked]);

  const classSpellEntries = useClassSpellEntries(character.className);
  const preparedSpellPoolEntries = usePreparedSpellEntries(character.className, character.level);
  const featureActions = useMemo(() => getFeatureActionsForCharacter(character), [character]);
  const channelDivinityAction = useMemo(
    () => featureActions.find((action) => action.key === "cleric-channel-divinity") ?? null,
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
        ? channelDivinityRows.find((row) => row.option.key === selectedDivinityOptionKey) ?? null
        : null,
    [channelDivinityRows, selectedDivinityOptionKey]
  );
  const selectedDivinityDisplay = useMemo(
    () =>
      selectedDivinityRow
        ? getClericResolvedDivinityDisplay(character, selectedDivinityRow.entry)
        : null,
    [character, selectedDivinityRow]
  );
  const channelDivinityUsesTotal = useMemo(
    () => getClericChannelDivinityUsesTotal(character),
    [character]
  );
  const channelDivinityUsesRemaining = useMemo(
    () => getClericChannelDivinityUsesRemaining(character),
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
  const spellPreparationOptions = useMemo(
    () =>
      preparedSpellPoolEntries.filter((spell) => {
        const spellLevel = getSpellLevel(spell);
        return spellLevel > 0 && spellLevel <= highestSpellSlotLevel;
      }),
    [highestSpellSlotLevel, preparedSpellPoolEntries]
  );
  const alwaysPreparedSpellIds = useMemo(
    () =>
      getAlwaysPreparedSpellIds(
        character.className,
        character.level,
        character.classFeatureState
      ),
    [character.classFeatureState, character.className, character.level]
  );
  const alwaysPreparedSpellIdSet = useMemo(
    () => new Set(alwaysPreparedSpellIds),
    [alwaysPreparedSpellIds]
  );
  const selectedCantripIds = useMemo(
    () => normalizeTrackedSpellIds(character.cantripIds, cantripOptions, cantripLimit),
    [cantripLimit, cantripOptions, character.cantripIds]
  );
  const selectedPreparedSpellIds = useMemo(
    () =>
      normalizePreparedSpellIds(
        character.preparedSpellIds,
        spellPreparationOptions,
        preparedSpellLimit,
        alwaysPreparedSpellIds
      ),
    [alwaysPreparedSpellIds, character.preparedSpellIds, preparedSpellLimit, spellPreparationOptions]
  );
  const cantripOptionsById = useMemo(
    () => new Map(cantripOptions.map((spell) => [spell.id, spell])),
    [cantripOptions]
  );
  const classSpellEntriesById = useMemo(
    () => new Map([...classSpellEntries, ...preparedSpellPoolEntries].map((spell) => [spell.id, spell])),
    [classSpellEntries, preparedSpellPoolEntries]
  );
  const spellPreparationOptionsById = useMemo(
    () => new Map(spellPreparationOptions.map((spell) => [spell.id, spell])),
    [spellPreparationOptions]
  );
  const selectedCantrips = useMemo(
    () =>
      selectedCantripIds
        .map((spellId) => cantripOptionsById.get(spellId))
        .filter((spell): spell is SpellEntry => spell !== undefined),
    [cantripOptionsById, selectedCantripIds]
  );
  const selectedPreparedSpells = useMemo(
    () =>
      usesPreparedSpells
        ? [...alwaysPreparedSpellIds, ...selectedPreparedSpellIds]
            .map((spellId) => classSpellEntriesById.get(spellId))
            .filter((spell): spell is SpellEntry => spell !== undefined)
        : spellPreparationOptions,
    [
      alwaysPreparedSpellIds,
      classSpellEntriesById,
      selectedPreparedSpellIds,
      spellPreparationOptions,
      usesPreparedSpells
    ]
  );
  const visibleSpellEntries = useMemo(
    () => [...selectedCantrips, ...selectedPreparedSpells],
    [selectedCantrips, selectedPreparedSpells]
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
  const preparedSpellDraftSet = useMemo(
    () => new Set(preparedSpellDraftIds),
    [preparedSpellDraftIds]
  );
  const cantripCount = cantripDraftIds.length;
  const hasCantripManagement = cantripLimit !== null && cantripLimit > 0;
  const isCantripLimitReached = cantripLimit !== null && cantripCount >= cantripLimit;
  const preparedSpellCount = preparedSpellDraftIds.length;
  const selectedCantripCount = selectedCantripIds.length;
  const selectedPreparedSpellCount = selectedPreparedSpellIds.length;
  const isPreparedSpellLimitReached =
    preparedSpellLimit !== null && preparedSpellCount >= preparedSpellLimit;
  const isCantripInputRequired =
    hasCantripManagement &&
    cantripLimit !== null &&
    selectedCantripCount < cantripLimit &&
    cantripOptions.length > selectedCantripCount;
  const isPreparedSpellInputRequired =
    usesPreparedSpells &&
    preparedSpellLimit !== null &&
    selectedPreparedSpellCount < preparedSpellLimit &&
    spellPreparationOptions.length > selectedPreparedSpellCount;
  const hasSpellSelectionInputRequired = isCantripInputRequired || isPreparedSpellInputRequired;
  const activePreparedSpellOptions = useMemo(
    () => spellPreparationLevelGroups[activePreparedSpellLevel] ?? [],
    [activePreparedSpellLevel, spellPreparationLevelGroups]
  );
  const firstAvailablePreparedSpellLevel = useMemo(
    () =>
      spellSlotLevels.find(
        (level) => (spellPreparationLevelGroups[level]?.length ?? 0) > 0
      ) ?? 1,
    [spellPreparationLevelGroups]
  );
  const preparedSpellDraftCountsByLevel = useMemo(
    () =>
      countTrackedSpellsByLevel(
        [...alwaysPreparedSpellIds, ...preparedSpellDraftIds],
        classSpellEntriesById
      ),
    [alwaysPreparedSpellIds, classSpellEntriesById, preparedSpellDraftIds]
  );
  const spellOutcomeSummariesById = useMemo(
    () =>
      new Map(
        [...classSpellEntries, ...preparedSpellPoolEntries].map((spell) => [
          spell.id,
          getSpellOutcomeSummaryForCharacter(character, spell)
        ])
      ),
    [character, classSpellEntries, preparedSpellPoolEntries]
  );

  const roundTracker = useMemo(
    () => normalizeRoundTracker(character.roundTracker),
    [character.roundTracker]
  );
  const selectedSpellRoundTrackerResource = selectedSpell
    ? getRoundTrackerResourceForSpell(selectedSpell)
    : null;
  const selectedSpellActionWarning = getRoundTrackerActionWarning(
    selectedSpellRoundTrackerResource,
    roundTracker
  );
  const selectedDivinityActionWarning = getRoundTrackerActionWarning(
    selectedDivinityRow
      ? getRoundTrackerResourceForEconomyType(selectedDivinityRow.option.economyType)
      : null,
    roundTracker
  );
  const selectedSpellAlwaysPrepared = selectedSpell
    ? alwaysPreparedSpellIdSet.has(selectedSpell.id)
    : false;

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
    setPreparedSpellDraftIds((current) => {
      const normalized = normalizePreparedSpellIds(
        current,
        spellPreparationOptions,
        preparedSpellLimit,
        alwaysPreparedSpellIds
      );
      return areSpellIdListsEqual(current, normalized) ? current : normalized;
    });
  }, [alwaysPreparedSpellIds, preparedSpellLimit, spellPreparationOptions]);

  useEffect(() => {
    if (activePreparedSpellLevel <= highestSpellSlotLevel) {
      return;
    }

    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
  }, [activePreparedSpellLevel, firstAvailablePreparedSpellLevel, highestSpellSlotLevel]);

  const openSpellManagementMenu = useCallback(() => {
    setCantripDraftIds(selectedCantripIds);
    setPreparedSpellDraftIds(selectedPreparedSpellIds);
    setSpellManagementMode("menu");
  }, [selectedCantripIds, selectedPreparedSpellIds]);

  const beginCantripManagement = useCallback(() => {
    setSpellManagementMode("cantrips");
  }, []);

  const beginPreparedSpellManagement = useCallback(() => {
    setActivePreparedSpellLevel(firstAvailablePreparedSpellLevel);
    setSpellManagementMode("prepared-spells");
  }, [firstAvailablePreparedSpellLevel]);

  const refreshSpellSlots = useCallback(() => {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0)
    }));

    setSpellManagementMode(null);
  }, [onPersistCharacter]);

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
          current,
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
    [alwaysPreparedSpellIds, preparedSpellLimit, spellPreparationOptions, spellPreparationOptionsById]
  );

  const saveCantrips = useCallback(() => {
    const nextCantripIds = normalizeTrackedSpellIds(cantripDraftIds, cantripOptions, cantripLimit);

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      cantripIds: nextCantripIds
    }));

    setSpellManagementMode(null);
  }, [cantripDraftIds, cantripLimit, cantripOptions, onPersistCharacter]);

  const savePreparedSpells = useCallback(() => {
    const nextPreparedSpellIds = normalizePreparedSpellIds(
      preparedSpellDraftIds,
      spellPreparationOptions,
      preparedSpellLimit,
      alwaysPreparedSpellIds
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      preparedSpellIds: nextPreparedSpellIds
    }));

    setSpellManagementMode(null);
  }, [
    onPersistCharacter,
    preparedSpellDraftIds,
    alwaysPreparedSpellIds,
    preparedSpellLimit,
    spellPreparationOptions
  ]);

  if (!canCastSpells) {
    return null;
  }

  function openSpellDetails(
    spell: SpellEntry,
    viewMode: SelectedSpellViewMode = "standard"
  ) {
    closeSelectedDivinity();
    const spellLevel = getSpellLevel(spell);
    const minimumSlotLevel = Math.max(1, spellLevel);
    const preferredSlotLevel =
      spellLevel === 0
        ? 1
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
    setSelectedDivinityOptionKey(optionKey);
  }

  function castSelectedSpell() {
    if (!selectedSpell || spellcastingState.blocked) {
      return;
    }

    const spellLevel = getSpellLevel(selectedSpell);
    const roundTrackerResource = getRoundTrackerResourceForSpell(selectedSpell);

    if (spellLevel === 0) {
      if (roundTrackerResource) {
        onPersistCharacter((currentCharacter) => ({
          ...currentCharacter,
          roundTracker: consumeRoundTrackerResource(
            currentCharacter.roundTracker,
            roundTrackerResource
          )
        }));
      }

      closeSelectedSpell();
      return;
    }

    const minimumSlotLevel = Math.max(1, spellLevel);
    const slotLevel = clampNumber(selectedSpellSlotLevel, minimumSlotLevel, 9, minimumSlotLevel);

    if ((spellSlotsRemaining[slotLevel - 1] ?? 0) <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const currentSpellSlotTotals = getSpellSlotTotalsForCharacter(
        currentCharacter.className,
        currentCharacter.level
      );
      const currentSpellSlotsExpended = normalizeSpellSlotsExpended(
        currentCharacter.spellSlotsExpended,
        currentSpellSlotTotals
      );
      const nextSpellSlotsExpended = [...currentSpellSlotsExpended];

      nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;

      return {
        ...currentCharacter,
        spellSlotsExpended: nextSpellSlotsExpended,
        roundTracker: roundTrackerResource
          ? consumeRoundTrackerResource(currentCharacter.roundTracker, roundTrackerResource)
          : currentCharacter.roundTracker
      };
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
      const nextCharacter = activateFeatureActionOptionForCharacter(
        currentCharacter,
        selectedDivinityRow.action.key,
        selectedDivinityRow.option.key
      );

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? {
            ...nextCharacter,
            roundTracker: consumeRoundTrackerResource(
              nextCharacter.roundTracker,
              roundTrackerResource
            )
          }
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
          <h3 className={shared.subtitle}>Prepared spells and spell slots</h3>
        </div>
        <div className={shared.headerActions}>
          {hasSpellSelectionInputRequired ? (
            <span className={styles.spellInputRequired}>
              <TriangleAlert size={16} aria-hidden="true" />
              Pick more spells
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

      <div className={styles.spellListStack}>
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

        {preparedSpellGroups.length === 0 && channelDivinityRows.length === 0 ? (
          <p className={shared.emptyText}>No spells or cantrips have been selected yet.</p>
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
                          valueSummary={spellOutcomeSummariesById.get(spell.id) ?? ""}
                          alwaysPrepared={alwaysPreparedSpellIdSet.has(spell.id)}
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
                  <strong>Refresh spell slots</strong>
                  <small>Restore all available spell slots.</small>
                </button>
                {hasCantripManagement ? (
                  <button
                    type="button"
                    className={sheetStyles.spellManagementOptionButton}
                    onClick={beginCantripManagement}
                  >
                    <strong>{`Manage cantrips ${selectedCantripCount}/${cantripLimit ?? 0}`}</strong>
                    <small>Choose from the list of cantrips for your class.</small>
                  </button>
                ) : null}
                {usesPreparedSpells ? (
                  <button
                    type="button"
                    className={sheetStyles.spellManagementOptionButton}
                    onClick={beginPreparedSpellManagement}
                  >
                    <strong>{`Prepare spells ${selectedPreparedSpellCount}/${preparedSpellLimit ?? 0}`}</strong>
                    <small>
                      Choose from the list of spells for your class based on your current level.
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
                        {cantripCount}/{cantripLimit} selected
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
                <div className={sheetStyles.spellManagementActions}>
                  <button
                    type="button"
                    className={sheetStyles.cancelButton}
                    onClick={() => setSpellManagementMode("menu")}
                  >
                    Back
                  </button>
                  <button type="button" className={sheetStyles.saveButton} onClick={saveCantrips}>
                    Save cantrips
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.preparedSpellStatusRow}>
                  <div>
                    <p className={styles.preparedSpellStatusLabel}>Prepared spells</p>
                    {preparedSpellLimit !== null ? (
                      <p className={styles.preparedSpellLimitText}>
                        {preparedSpellCount}/{preparedSpellLimit} prepared
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
                            activePreparedSpellLevel === level && styles.preparedSpellTabButtonActive
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
                          isAlwaysPrepared || (!isChecked && isPreparedSpellLimitReached);
                        const actionShapeState = getSpellRowActionShapeState(spell);

                        return (
                          <li key={spell.id}>
                            <SpellListRow
                              spell={spell}
                              onClick={() => openSpellDetails(spell, "prepare-preview")}
                              valueSummary={spellOutcomeSummariesById.get(spell.id) ?? ""}
                              alwaysPrepared={isAlwaysPrepared}
                              selectable
                              isSelected={isChecked}
                              onSelect={() => togglePreparedSpellDraft(spell.id)}
                              disabled={isDisabled}
                              actionShapeSelected={actionShapeState.isSelected}
                              actionShapeMultiCount={actionShapeState.multiCount}
                              className={
                                isAlwaysPrepared
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
                <div className={sheetStyles.spellManagementActions}>
                  <button
                    type="button"
                    className={sheetStyles.cancelButton}
                    onClick={() => setSpellManagementMode("menu")}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={sheetStyles.saveButton}
                    onClick={savePreparedSpells}
                  >
                    Save spells
                  </button>
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
          actionWarning={selectedSpellActionWarning}
          actionDisabled={selectedSpellActionWarning !== null}
          blockedReason={spellcastingState.blocked ? spellcastingState.reason : null}
          backdropClassName={isPreparedSpellPreview ? styles.previewSpellDrawerBackdrop : undefined}
        />
      ) : null}

      {selectedDivinityRow ? (
        <div className={sheetStyles.spellDrawerBackdrop} role="presentation" onClick={closeSelectedDivinity}>
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
                description={selectedDivinityDisplay?.description ?? selectedDivinityRow.entry.description}
                className={clsx(
                  sheetStyles.spellDrawerDescriptionList,
                  sheetStyles.spellDrawerDescriptionSection
                )}
                entryClassName={sheetStyles.spellDrawerDescriptionLine}
              />
            </div>

            <div className={sheetStyles.spellDrawerActions}>
              <div className={styles.castActionMeta}>
                <div className={sheetStyles.spellDrawerCastControls}>
                  <p className={sheetStyles.spellDrawerSlotText}>
                    {`${channelDivinityUsesRemaining}/${channelDivinityUsesTotal} uses remaining`}
                  </p>
                </div>
                {selectedDivinityActionWarning ? (
                  <p className={styles.castActionWarning}>{selectedDivinityActionWarning}</p>
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
