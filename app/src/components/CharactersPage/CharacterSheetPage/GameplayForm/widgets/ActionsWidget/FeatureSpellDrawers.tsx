import { useMemo } from "react";
import CharacterSpellDrawer, {
  type CharacterSpellDrawerActionOptions
} from "../../../SpellCastingForm/CharacterSpellDrawer";
import type { Character } from "../../../../../../types";
import type { SpellEntry } from "../../../../../../codex/entries";
import type {
  FeatureActionCard,
  FeatureActionExecuteConfig,
  FeatureActionFact
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  getAlwaysPreparedSpellIdsForCharacter,
  getAlwaysPreparedSpellSourceMapForCharacter,
  getSpellSourceLabels
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  createChargesCardUsage,
  createChargesHeaderTag,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { getSpellDamageDetailForCharacter } from "../../../../../../pages/CharactersPage/spellOutcome";
import {
  appendGoliathAttackDescriptionAddition,
  getGoliathAttackDamageDetail
} from "../../../../../../pages/CharactersPage/species";
import type { GoliathAttackOptionState } from "../../../../../../pages/CharactersPage/speciesGoliath";
import { getActionShapeForEconomyType } from "../../gameplayWidgetUtils";
import type { SpellActionPathState } from "./types";
import styles from "./ActionsWidget.module.css";

type FixedSpellExecute = Extract<FeatureActionExecuteConfig, { kind: "spell" }>;

type FrozenHauntOptionState = {
  disabled: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null;

type SpellSlotSelectOption = {
  value: number;
  label: string;
  disabled?: boolean;
};

type FeatureSpellDrawersProps = {
  character: Character;
  isFixedSpellDrawerOpen: boolean;
  fixedSpellEntry: SpellEntry | null;
  fixedSpellExecute: FixedSpellExecute | null;
  fixedSpellDamageDetailOverride: string | null;
  fixedSpellSlotTotals: number[];
  fixedSpellSlotsRemaining: number[];
  selectedFixedSpellSlotLevel: number;
  onSelectedFixedSpellSlotLevelChange: (slotLevel: number) => void;
  onCloseFixedSpellDrawer: () => void;
  onCastFixedSpellAction: (
    options?: CharacterSpellDrawerActionOptions & {
      frozenHauntFallbackSlotLevel?: number;
      useFrozenHaunt?: boolean;
    }
  ) => void;
  fixedSpellConsumesSpellSlot: boolean;
  fixedSpellMinimumActionSlotLevel: number | null;
  fixedSpellFreeCastSlotLevel: number | null;
  fixedSpellActionContextText: string | null;
  fixedSpellActionAvailabilityText: string | null;
  fixedSpellFacts: FeatureActionFact[];
  fixedSpellShowActionDiceControls: boolean;
  isDiceRollerSettingsOpen: boolean;
  onDiceRollerSettingsOpenChange: (isOpen: boolean) => void;
  fixedSpellCastWarning: string | null;
  fixedSpellSharedCastWarning: string | null;
  spellcastingBlocked: boolean;
  spellcastingBlockedReason: string | null;
  fixedSpellActionPaths: SpellActionPathState[];
  selectedActionSpellSupportsBeguilingMagic: boolean;
  selectedActionSpellFrozenHauntOptionState: FrozenHauntOptionState;
  selectedActionSpellFrozenHauntFallbackSlotOptions: SpellSlotSelectOption[];
  beguilingMagicUsesRemaining: number;
  beguilingMagicUsesTotal: number;
  bardicInspirationUsesRemaining: number;
  useBeguilingMagicOnActionSpell: boolean;
  onUseBeguilingMagicOnActionSpellChange: (checked: boolean) => void;
  selectedActionSpellGoliathAncestryState: GoliathAttackOptionState | null;
  useGoliathAncestryOnActionSpell: boolean;
  onUseGoliathAncestryOnActionSpellChange: (checked: boolean) => void;
  useFrozenHauntOnActionSpell: boolean;
  onUseFrozenHauntOnActionSpellChange: (checked: boolean) => void;
  selectedFrozenHauntFallbackSlotLevel: number;
  onSelectedFrozenHauntFallbackSlotLevelChange: (slotLevel: number) => void;
  frozenHauntFallbackSpellSlotMinimumLevel: number;
  selectedDivineInterventionSpell: SpellEntry | null;
  selectedFeatureAction: FeatureActionCard | null;
  selectedFeatureActionPrimaryDisabledReason: string | null;
  selectedDivineInterventionBlockedReason: string | null;
  onCloseDivineInterventionSpell: () => void;
  onCastDivineInterventionSpell: (options?: CharacterSpellDrawerActionOptions) => void;
  selectedMysticArcanumSpell: SpellEntry | null;
  selectedMysticArcanumSpellLevel: number | null;
  selectedMysticArcanumExpended: boolean;
  selectedMysticArcanumActionWarning: string | null;
  selectedMysticArcanumBlockedReason: string | null;
  onCloseMysticArcanumSpell: () => void;
  onCastMysticArcanumSpell: (options?: CharacterSpellDrawerActionOptions) => void;
};

const emptySpellSlots = Array.from({ length: 9 }, () => 0);

function createBeguilingMagicOption({
  checked,
  disabled,
  usesRemaining,
  usesTotal,
  onCheckedChange
}: {
  checked: boolean;
  disabled: boolean;
  usesRemaining: number;
  usesTotal: number;
  onCheckedChange: (checked: boolean) => void;
}) {
  return {
    id: "beguiling-magic",
    label: "Beguiling Magic",
    checked,
    onCheckedChange,
    disabled,
    usage: createChargesOrResourceCardUsage(
      usesRemaining,
      usesTotal,
      createFeatureActionCardCost({
        amountText: "1",
        icon: "music"
      })
    )
  };
}

function createGoliathAncestryOption({
  state,
  checked,
  onCheckedChange
}: {
  state: GoliathAttackOptionState | null;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  if (!state) {
    return null;
  }

  return {
    id: "goliath-giant-ancestry",
    label: state.featureName,
    checked,
    onCheckedChange,
    disabled: state.disabled,
    headerTags: [createChargesHeaderTag(state.usesRemaining, state.usesTotal)],
    usage: createChargesCardUsage(state.usesRemaining, state.usesTotal),
    application: {
      targetLabel: "Damage"
    }
  };
}

function getGoliathSpellDisplay(spell: SpellEntry, state: GoliathAttackOptionState | null) {
  return spell.isAttackSpell === true
    ? appendGoliathAttackDescriptionAddition(spell, state)
    : spell;
}

function getGoliathDamageDetailOverride(
  character: Character,
  spell: SpellEntry | null,
  state: GoliathAttackOptionState | null,
  checked: boolean
) {
  if (!spell || !checked || !state) {
    return null;
  }

  return getGoliathAttackDamageDetail(getSpellDamageDetailForCharacter(character, spell), state);
}

function FeatureSpellDrawers({
  character,
  isFixedSpellDrawerOpen,
  fixedSpellEntry,
  fixedSpellExecute,
  fixedSpellDamageDetailOverride,
  fixedSpellSlotTotals,
  fixedSpellSlotsRemaining,
  selectedFixedSpellSlotLevel,
  onSelectedFixedSpellSlotLevelChange,
  onCloseFixedSpellDrawer,
  onCastFixedSpellAction,
  fixedSpellConsumesSpellSlot,
  fixedSpellMinimumActionSlotLevel,
  fixedSpellFreeCastSlotLevel,
  fixedSpellActionContextText,
  fixedSpellActionAvailabilityText,
  fixedSpellFacts,
  fixedSpellShowActionDiceControls,
  isDiceRollerSettingsOpen,
  onDiceRollerSettingsOpenChange,
  fixedSpellCastWarning,
  fixedSpellSharedCastWarning,
  spellcastingBlocked,
  spellcastingBlockedReason,
  fixedSpellActionPaths,
  selectedActionSpellSupportsBeguilingMagic,
  selectedActionSpellFrozenHauntOptionState,
  selectedActionSpellFrozenHauntFallbackSlotOptions,
  beguilingMagicUsesRemaining,
  beguilingMagicUsesTotal,
  bardicInspirationUsesRemaining,
  useBeguilingMagicOnActionSpell,
  onUseBeguilingMagicOnActionSpellChange,
  selectedActionSpellGoliathAncestryState,
  useGoliathAncestryOnActionSpell,
  onUseGoliathAncestryOnActionSpellChange,
  useFrozenHauntOnActionSpell,
  onUseFrozenHauntOnActionSpellChange,
  selectedFrozenHauntFallbackSlotLevel,
  onSelectedFrozenHauntFallbackSlotLevelChange,
  frozenHauntFallbackSpellSlotMinimumLevel,
  selectedDivineInterventionSpell,
  selectedFeatureAction,
  selectedFeatureActionPrimaryDisabledReason,
  selectedDivineInterventionBlockedReason,
  onCloseDivineInterventionSpell,
  onCastDivineInterventionSpell,
  selectedMysticArcanumSpell,
  selectedMysticArcanumSpellLevel,
  selectedMysticArcanumExpended,
  selectedMysticArcanumActionWarning,
  selectedMysticArcanumBlockedReason,
  onCloseMysticArcanumSpell,
  onCastMysticArcanumSpell
}: FeatureSpellDrawersProps) {
  const alwaysPreparedSpellIds = getAlwaysPreparedSpellIdsForCharacter(character);
  const alwaysPreparedSpellIdSet = new Set(alwaysPreparedSpellIds);
  const alwaysPreparedSpellSourceMap = getAlwaysPreparedSpellSourceMapForCharacter(character);
  const fixedSpellDisplay = useMemo(
    () =>
      fixedSpellEntry
        ? getGoliathSpellDisplay(fixedSpellEntry, selectedActionSpellGoliathAncestryState)
        : null,
    [fixedSpellEntry, selectedActionSpellGoliathAncestryState]
  );
  const fixedSpellAlwaysPrepared = fixedSpellDisplay
    ? alwaysPreparedSpellIdSet.has(fixedSpellDisplay.id)
    : false;
  const fixedSpellAlwaysPreparedSources = getSpellSourceLabels(
    alwaysPreparedSpellSourceMap,
    fixedSpellDisplay?.id
  );
  const divineInterventionSpellDisplay = useMemo(
    () =>
      selectedDivineInterventionSpell
        ? getGoliathSpellDisplay(
            selectedDivineInterventionSpell,
            selectedActionSpellGoliathAncestryState
          )
        : null,
    [selectedActionSpellGoliathAncestryState, selectedDivineInterventionSpell]
  );
  const mysticArcanumSpellDisplay = useMemo(
    () =>
      selectedMysticArcanumSpell
        ? getGoliathSpellDisplay(
            selectedMysticArcanumSpell,
            selectedActionSpellGoliathAncestryState
          )
        : null,
    [selectedActionSpellGoliathAncestryState, selectedMysticArcanumSpell]
  );
  const divineInterventionDamageDetailOverride = useMemo(
    () =>
      getGoliathDamageDetailOverride(
        character,
        selectedDivineInterventionSpell,
        selectedActionSpellGoliathAncestryState,
        useGoliathAncestryOnActionSpell
      ),
    [
      character,
      selectedActionSpellGoliathAncestryState,
      selectedDivineInterventionSpell,
      useGoliathAncestryOnActionSpell
    ]
  );
  const mysticArcanumDamageDetailOverride = useMemo(
    () =>
      getGoliathDamageDetailOverride(
        character,
        selectedMysticArcanumSpell,
        selectedActionSpellGoliathAncestryState,
        useGoliathAncestryOnActionSpell
      ),
    [
      character,
      selectedActionSpellGoliathAncestryState,
      selectedMysticArcanumSpell,
      useGoliathAncestryOnActionSpell
    ]
  );
  const beguilingMagicOption = selectedActionSpellSupportsBeguilingMagic
    ? createBeguilingMagicOption({
        checked: useBeguilingMagicOnActionSpell,
        onCheckedChange: onUseBeguilingMagicOnActionSpellChange,
        disabled: beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
        usesRemaining: beguilingMagicUsesRemaining,
        usesTotal: beguilingMagicUsesTotal
      })
    : null;
  const goliathAncestryOption = createGoliathAncestryOption({
    state: selectedActionSpellGoliathAncestryState,
    checked: useGoliathAncestryOnActionSpell,
    onCheckedChange: onUseGoliathAncestryOnActionSpellChange
  });

  return (
    <>
      {isFixedSpellDrawerOpen && fixedSpellDisplay && fixedSpellExecute ? (
        <CharacterSpellDrawer
          character={character}
          spell={fixedSpellDisplay}
          damageDetailOverride={fixedSpellDamageDetailOverride}
          alwaysPrepared={fixedSpellAlwaysPrepared}
          alwaysPreparedSources={fixedSpellAlwaysPreparedSources}
          mode="standard"
          spellSlotTotals={fixedSpellSlotTotals}
          spellSlotsRemaining={fixedSpellSlotsRemaining}
          selectedSpellSlotLevel={selectedFixedSpellSlotLevel}
          onSelectedSpellSlotLevelChange={onSelectedFixedSpellSlotLevelChange}
          onClose={onCloseFixedSpellDrawer}
          spellImplementationCastSource={
            fixedSpellExecute.spellImplementationCastSource ?? "fixed-feature"
          }
          forcedSpellImplementationOptions={fixedSpellExecute.forcedSpellImplementationOptions}
          onAction={(options) =>
            onCastFixedSpellAction({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell,
              useGoliathAncestry: useGoliathAncestryOnActionSpell,
              useFrozenHaunt: useFrozenHauntOnActionSpell,
              frozenHauntFallbackSlotLevel: selectedFrozenHauntFallbackSlotLevel
            })
          }
          actionLabel={fixedSpellExecute.actionLabel}
          actionConsumesSpellSlot={fixedSpellConsumesSpellSlot}
          minimumActionSpellSlotLevel={fixedSpellMinimumActionSlotLevel ?? undefined}
          freeCastSlotLevel={fixedSpellFreeCastSlotLevel}
          actionContextText={fixedSpellActionContextText}
          actionAvailabilityText={fixedSpellActionAvailabilityText}
          facts={fixedSpellFacts}
          factsSectionTitle={null}
          showActionDiceControls={fixedSpellShowActionDiceControls}
          isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
          onDiceRollerSettingsOpenChange={onDiceRollerSettingsOpenChange}
          actionWarning={fixedSpellCastWarning}
          actionDisabled={spellcastingBlocked || fixedSpellSharedCastWarning !== null}
          blockedReason={spellcastingBlocked ? spellcastingBlockedReason : null}
          allowRitualCasting={fixedSpellExecute.allowRitualCasting}
          actionPaths={fixedSpellActionPaths
            .map((path) => {
              const actionShape = getActionShapeForEconomyType(path.economyType);

              return actionShape
                ? {
                    id: path.id,
                    actionLabel: path.actionLabel ?? fixedSpellExecute.actionLabel,
                    actionShape,
                    actionShapeAvailable: path.shapeState.isAvailable,
                    actionShapeMultiCount: path.shapeState.multiCount,
                    disabledReason: path.disabledReason ?? path.shapeState.disabledReason,
                    roundTrackerResourceOverride: path.roundTrackerResource,
                    usage: path.usage,
                    spellImplementationCastSource:
                      path.spellImplementationCastSource ??
                      fixedSpellExecute.spellImplementationCastSource,
                    forcedSpellImplementationOptions: {
                      ...(fixedSpellExecute.forcedSpellImplementationOptions ?? {}),
                      ...(path.forcedSpellImplementationOptions ?? {})
                    },
                    spellCastEffectIds: path.spellCastEffectIds
                  }
                : null;
            })
            .filter((path): path is NonNullable<typeof path> => path !== null)}
          actionOptions={
            beguilingMagicOption ||
            goliathAncestryOption ||
            selectedActionSpellFrozenHauntOptionState !== null
              ? [
                  ...(beguilingMagicOption ? [beguilingMagicOption] : []),
                  ...(goliathAncestryOption ? [goliathAncestryOption] : []),
                  ...(selectedActionSpellFrozenHauntOptionState
                    ? [
                        {
                          id: "frozen-haunt",
                          label: "Frozen Haunt",
                          checked: useFrozenHauntOnActionSpell,
                          onCheckedChange: onUseFrozenHauntOnActionSpellChange,
                          disabled: selectedActionSpellFrozenHauntOptionState.disabled,
                          usage: createChargesOrResourceCardUsage(
                            selectedActionSpellFrozenHauntOptionState.usesRemaining,
                            selectedActionSpellFrozenHauntOptionState.usesTotal,
                            createFeatureActionCardCost({
                              amountText: `${frozenHauntFallbackSpellSlotMinimumLevel}+`,
                              resourceLabel: "Spell Slot"
                            })
                          ),
                          select:
                            useFrozenHauntOnActionSpell &&
                            selectedActionSpellFrozenHauntOptionState.usesRemaining <= 0 &&
                            selectedActionSpellFrozenHauntFallbackSlotOptions.length > 0
                              ? {
                                  label: "Frozen Haunt Slot",
                                  value: selectedFrozenHauntFallbackSlotLevel,
                                  onValueChange: onSelectedFrozenHauntFallbackSlotLevelChange,
                                  options: selectedActionSpellFrozenHauntFallbackSlotOptions
                                }
                              : undefined
                        }
                      ]
                    : [])
                ]
              : undefined
          }
          backdropClassName={styles.featureSpellDrawerBackdrop}
        />
      ) : null}

      {divineInterventionSpellDisplay && selectedFeatureAction ? (
        <CharacterSpellDrawer
          character={character}
          spell={divineInterventionSpellDisplay}
          damageDetailOverride={divineInterventionDamageDetailOverride}
          mode="divine-intervention"
          spellSlotTotals={emptySpellSlots}
          spellSlotsRemaining={emptySpellSlots}
          selectedSpellSlotLevel={1}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={onCloseDivineInterventionSpell}
          spellImplementationCastSource="divine-intervention"
          onAction={(options) =>
            onCastDivineInterventionSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell,
              useGoliathAncestry: useGoliathAncestryOnActionSpell
            })
          }
          actionLabel="Divine Intervention"
          actionWarning={selectedFeatureActionPrimaryDisabledReason}
          actionDisabled={selectedFeatureActionPrimaryDisabledReason !== null}
          blockedReason={selectedDivineInterventionBlockedReason}
          actionContextText="Using Divine Intervention"
          actionOptions={
            beguilingMagicOption || goliathAncestryOption
              ? [
                  ...(beguilingMagicOption ? [beguilingMagicOption] : []),
                  ...(goliathAncestryOption ? [goliathAncestryOption] : [])
                ]
              : undefined
          }
          backdropClassName={styles.featureSpellDrawerBackdrop}
        />
      ) : null}

      {mysticArcanumSpellDisplay ? (
        <CharacterSpellDrawer
          character={character}
          spell={mysticArcanumSpellDisplay}
          damageDetailOverride={mysticArcanumDamageDetailOverride}
          mode="standard"
          spellSlotTotals={emptySpellSlots}
          spellSlotsRemaining={emptySpellSlots}
          selectedSpellSlotLevel={
            selectedMysticArcanumSpellLevel ?? mysticArcanumSpellDisplay.spellLevel
          }
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={onCloseMysticArcanumSpell}
          spellImplementationCastSource="mystic-arcanum"
          onAction={(options) =>
            onCastMysticArcanumSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell,
              useGoliathAncestry: useGoliathAncestryOnActionSpell
            })
          }
          actionConsumesSpellSlot={false}
          actionContextText="Using Mystic Arcanum"
          actionAvailabilityText="Cast without expending a spell slot. Mystic Arcanum spells can't be upcast."
          actionWarning={
            selectedFeatureActionPrimaryDisabledReason ??
            (selectedMysticArcanumExpended
              ? "This arcanum recharges on a Long Rest."
              : selectedMysticArcanumActionWarning)
          }
          actionDisabled={
            selectedFeatureActionPrimaryDisabledReason !== null ||
            selectedMysticArcanumExpended ||
            selectedMysticArcanumActionWarning !== null
          }
          blockedReason={selectedMysticArcanumBlockedReason}
          actionOptions={
            beguilingMagicOption || goliathAncestryOption
              ? [
                  ...(beguilingMagicOption ? [beguilingMagicOption] : []),
                  ...(goliathAncestryOption ? [goliathAncestryOption] : [])
                ]
              : undefined
          }
          backdropClassName={styles.featureSpellDrawerBackdrop}
        />
      ) : null}
    </>
  );
}

export default FeatureSpellDrawers;
