import { Pencil } from "lucide-react";
import ActionButton from "../../../../../ActionButton";
import CellContainer from "../../../../../CellContainer/CellContainer";
import type { DAMAGE_TYPE, ReactionEntry, SpellEntry } from "../../../../../../codex/entries";
import { consumeRoundTrackerResourceForCharacter } from "../../gameplayStateUtils";
import { getRoundTrackerActionWarning } from "../../gameplayWidgetUtils";
import type { DiceRollerRequest } from "../../../../../DicePage/DiceRollerPopup";
import { MonsterEntryDrawer } from "../../../../../MonsterEntryRenderer";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SelectInput from "../../../../FormInputs/SelectInput";
import { formatCodexLabel } from "../../../../../../utils/codex";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeRoundTracker } from "../../../../../../pages/CharactersPage/combat";
import {
  getDruidActiveStarryFormConstellationForCharacter,
  getDruidWildShapeActiveFormForCharacter,
  getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter,
  hasDruidTwinklingConstellationsFeatureForCharacter,
  setDruidActiveStarryFormConstellationForCharacter,
  setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import { getAbilityModifierBreakdownForCharacter } from "../../../../../../pages/CharactersPage/abilities";
import { isCustomFeatureTraitStatusEntry } from "../../../../../../pages/CharactersPage/customTraitEffects";
import { actorStatusSourceId } from "../../../../../../pages/CharactersPage/feats/runtime";
import { getProficiencyBonus } from "../../../../../../pages/CharactersPage/gameplay";
import {
  formatFormulaCell,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../../../../pages/CharactersPage/shared/formulas";
import { getAasimarCelestialRevelationStatusOption } from "../../../../../../pages/CharactersPage/species";
import {
  getMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection,
  hasMonkWarriorOfTheElementsElementalEpitome,
  isMonkWarriorOfTheElementsElementalAttunementStatusSourceId,
  setMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";
import {
  activateMonkWarriorOfTheOpenHandQuiveringPalm,
  monkWarriorOfTheOpenHandQuiveringPalmDamageFormula,
  monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import { druidStarryFormStatusSourceId } from "../../../../../../pages/CharactersPage/classFeatures/druid/subclasses/druidCircleOfTheStars";
import {
  paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions,
  paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
import {
  getPaladinOathOfDevotionHolyNimbusRadiantDamageFormula,
  paladinOathOfDevotionHolyNimbusStatusSourceId
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfDevotion";
import type { Character, CharacterStatusEntry } from "../../../../../../types";
import { type ExhaustionLevel } from "../../../../../../pages/CharactersPage/traits";
import CustomTraitEffectList from "./CustomTraitEffectList";
import DruidStarryFormActionBody from "./DruidStarryFormActionBody";
import ElementalAttunementResistanceSelector from "./ElementalAttunementResistanceSelector";
import {
  QuiveringPalmStatusDrawerActionRow,
  QuiveringPalmStatusDrawerFormula
} from "./QuiveringPalmStatusDrawerExtras";
import StatusEntryDrawer from "./StatusEntryDrawer";
import styles from "./TraitsConditionsWidget.module.css";
import type { ManualStatusDurationType } from "./manualStatusDuration";

type EditableCustomTraitEntry = CharacterStatusEntry & {
  customEffects: NonNullable<CharacterStatusEntry["customEffects"]>;
};

type SelectedStatusEntryDrawerProps = {
  applyStatusEntryDuration: () => void;
  cancelStatusDurationEdit: () => void;
  character: Character;
  isEditingStatusDuration: boolean;
  onPersistCharacter: PersistCharacterUpdater;
  onEditCustomTrait: (entry: EditableCustomTraitEntry) => void;
  openDiceRoller: (request: DiceRollerRequest) => void;
  removeStatusEntry: (entry: CharacterStatusEntry) => void;
  roundTracker: ReturnType<typeof normalizeRoundTracker>;
  selectedExhaustionLevel: number | null;
  selectedReactionEntry: ReactionEntry | null;
  selectedReactionSpell: SpellEntry | null;
  selectedStatusEntry: CharacterStatusEntry | null;
  setIsEditingStatusDuration: (value: boolean) => void;
  setSelectedStatusEntryId: (entryId: string | null) => void;
  setStatusDrawerDurationType: (value: ManualStatusDurationType) => void;
  setStatusDrawerDurationValue: (value: number) => void;
  statusDrawerDurationType: ManualStatusDurationType;
  statusDrawerDurationValue: number;
  updateExhaustionLevel: (nextLevel: ExhaustionLevel | null) => void;
};

function getActorInsightDcFormula(character: Character): string {
  const charismaModifier = getAbilityModifierBreakdownForCharacter(character, "CHA").total;
  const proficiencyBonus = getProficiencyBonus(character.level);
  const insightDc = 8 + charismaModifier + proficiencyBonus;

  return `Insight DC ${insightDc} = ${formatFormulaTerms([
    "DC 8 (Base)",
    formatSignedFormulaTerm(charismaModifier, "CHA"),
    formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus")
  ])}`;
}

function getAasimarCelestialRevelationStatusFormula(
  character: Character,
  entry: CharacterStatusEntry
): { label: string; content: string } | null {
  const option = getAasimarCelestialRevelationStatusOption(entry);

  if (!option) {
    return null;
  }

  const proficiencyBonus = getProficiencyBonus(character.level);

  if (option.key === "inner-radiance") {
    return {
      label: "INNER RADIANCE DAMAGE",
      content: `${proficiencyBonus} Radiant Damage = ${proficiencyBonus} Prof. Bonus`
    };
  }

  if (option.key === "necrotic-shroud") {
    const charismaModifier = getAbilityModifierBreakdownForCharacter(character, "CHA").total;
    const saveDc = 8 + charismaModifier + proficiencyBonus;
    const formulaCell = formatFormulaCell({
      formula: String(saveDc),
      displayTerms: [
        "DC 8 (Base)",
        formatSignedFormulaTerm(charismaModifier, "CHA"),
        formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus")
      ]
    });

    return {
      label: "CHARISMA SAVE DC",
      content: `DC ${saveDc} = ${formulaCell.value}`
    };
  }

  return null;
}

function SelectedStatusEntryDrawer({
  applyStatusEntryDuration,
  cancelStatusDurationEdit,
  character,
  isEditingStatusDuration,
  onPersistCharacter,
  onEditCustomTrait,
  openDiceRoller,
  removeStatusEntry,
  roundTracker,
  selectedExhaustionLevel,
  selectedReactionEntry,
  selectedReactionSpell,
  selectedStatusEntry,
  setIsEditingStatusDuration,
  setSelectedStatusEntryId,
  setStatusDrawerDurationType,
  setStatusDrawerDurationValue,
  statusDrawerDurationType,
  statusDrawerDurationValue,
  updateExhaustionLevel
}: SelectedStatusEntryDrawerProps) {
  if (!selectedStatusEntry || selectedReactionSpell || selectedReactionEntry) {
    return null;
  }

  const selectedWildShapeMonster = selectedStatusEntry.sourceId?.startsWith(
    "feature-druid-wild-shape:"
  )
    ? getDruidWildShapeActiveFormForCharacter(character)
    : null;
  const selectedStarryFormConstellation =
    selectedStatusEntry.sourceId === druidStarryFormStatusSourceId
      ? getDruidActiveStarryFormConstellationForCharacter(character)
      : null;
  const hasDruidTwinklingConstellations =
    hasDruidTwinklingConstellationsFeatureForCharacter(character);
  const selectedNobleGeniesAuraOfElementalShieldingDamageType =
    selectedStatusEntry.sourceId ===
    paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId
      ? getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter(
          character
        )
      : null;
  const selectedMonkElementalAttunementResistanceDamageType =
    selectedStatusEntry.sourceId &&
    isMonkWarriorOfTheElementsElementalAttunementStatusSourceId(selectedStatusEntry.sourceId) &&
    hasMonkWarriorOfTheElementsElementalEpitome(character)
      ? getMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection(character)
      : null;
  const selectedQuiveringPalmActionWarning =
    selectedStatusEntry.sourceId === monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId
      ? getRoundTrackerActionWarning("action", roundTracker)
      : null;
  const selectedAasimarCelestialRevelationFormula =
    getAasimarCelestialRevelationStatusFormula(character, selectedStatusEntry);
  const isSelectedCustomFeatureTrait = isCustomFeatureTraitStatusEntry(selectedStatusEntry);

  function endSelectedWildShape() {
    removeStatusEntry(selectedStatusEntry!);
  }

  function detonateSelectedQuiveringPalm() {
    if (
      selectedStatusEntry?.sourceId !== monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId ||
      selectedQuiveringPalmActionWarning
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateMonkWarriorOfTheOpenHandQuiveringPalm(currentCharacter);

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      return consumeRoundTrackerResourceForCharacter(nextCharacter, "action");
    });

    openDiceRoller({
      title: "Quivering Palm damage",
      formula: monkWarriorOfTheOpenHandQuiveringPalmDamageFormula,
      formulaDisplay: `${monkWarriorOfTheOpenHandQuiveringPalmDamageFormula} Force`,
      description: "Quivering Palm damage roll"
    });
  }

  function updatePaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageType(nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter(
        currentCharacter,
        nextValue as (typeof paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions)[number]
      )
    );
  }

  function updateMonkElementalAttunementResistanceDamageType(nextDamageType: DAMAGE_TYPE) {
    onPersistCharacter((currentCharacter) =>
      setMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection(
        currentCharacter,
        nextDamageType
      )
    );
  }

  function updateDruidActiveStarryFormConstellation(
    nextConstellation: Parameters<typeof setDruidActiveStarryFormConstellationForCharacter>[1]
  ) {
    onPersistCharacter((currentCharacter) =>
      setDruidActiveStarryFormConstellationForCharacter(currentCharacter, nextConstellation)
    );
  }

  if (selectedWildShapeMonster) {
    return (
      <MonsterEntryDrawer
        monster={selectedWildShapeMonster}
        status="ready"
        badgeLabel="Wild Shape"
        onClose={() => setSelectedStatusEntryId(null)}
        contentSurface="plain"
        showHeaderDivider
        footer={
          <ActionButton actionType="ERROR" variant="OUTLINE" onClick={endSelectedWildShape}>
            End Wild Shape
          </ActionButton>
        }
      />
    );
  }

  return (
    <StatusEntryDrawer
      character={character}
      entry={selectedStatusEntry}
      customContent={
        isCustomFeatureTraitStatusEntry(selectedStatusEntry) ? (
          <CustomTraitEffectList effects={selectedStatusEntry.customEffects} />
        ) : selectedStatusEntry.sourceId === druidStarryFormStatusSourceId ? (
          <DruidStarryFormActionBody
            selectedConstellation={selectedStarryFormConstellation}
            hasTwinklingConstellations={hasDruidTwinklingConstellations}
            disabled={!hasDruidTwinklingConstellations}
            onSelectConstellation={updateDruidActiveStarryFormConstellation}
          />
        ) : selectedStatusEntry.sourceId &&
          isMonkWarriorOfTheElementsElementalAttunementStatusSourceId(
            selectedStatusEntry.sourceId
          ) &&
          hasMonkWarriorOfTheElementsElementalEpitome(character) ? (
          <ElementalAttunementResistanceSelector
            selectedDamageType={selectedMonkElementalAttunementResistanceDamageType}
            onSelectDamageType={updateMonkElementalAttunementResistanceDamageType}
            name="monk-elemental-attunement-active-resistance"
            helperText="Change the Elemental Epitome resistance granted by the active Elemental Attunement."
          />
        ) : selectedStatusEntry.sourceId ===
          paladinOathOfTheNobleGeniesAuraOfElementalShieldingStatusSourceId ? (
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Shielded Element</span>
            <SelectInput
              value={
                selectedNobleGeniesAuraOfElementalShieldingDamageType ??
                paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions[0]
              }
              onChange={(event) =>
                updatePaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageType(
                  event.target.value
                )
              }
            >
              {paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions.map(
                (damageType) => (
                  <option key={damageType} value={damageType}>
                    {formatCodexLabel(damageType)}
                  </option>
                )
              )}
            </SelectInput>
          </label>
        ) : null
      }
      afterDetailsContent={
        selectedAasimarCelestialRevelationFormula ? (
          <div className={styles.statusFormulaGrid}>
            <CellContainer
              label={selectedAasimarCelestialRevelationFormula.label}
              content={selectedAasimarCelestialRevelationFormula.content}
            />
          </div>
        ) : selectedStatusEntry.sourceId === monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId ? (
          <QuiveringPalmStatusDrawerFormula />
        ) : selectedStatusEntry.sourceId === actorStatusSourceId ? (
          <div className={styles.statusFormulaGrid}>
            <CellContainer
              label="Insight DC Formula"
              content={getActorInsightDcFormula(character)}
            />
          </div>
        ) : selectedStatusEntry.sourceId === paladinOathOfDevotionHolyNimbusStatusSourceId ? (
          <div className={styles.statusFormulaGrid}>
            <CellContainer
              label="Radiant Damage Formula"
              content={getPaladinOathOfDevotionHolyNimbusRadiantDamageFormula(character)}
            />
          </div>
        ) : null
      }
      customFooterContent={
        !isEditingStatusDuration &&
        selectedStatusEntry.sourceId === monkWarriorOfTheOpenHandQuiveringPalmStatusSourceId ? (
          <QuiveringPalmStatusDrawerActionRow
            disabled={selectedQuiveringPalmActionWarning !== null}
            disabledReason={selectedQuiveringPalmActionWarning}
            onDetonate={detonateSelectedQuiveringPalm}
          />
        ) : null
      }
      isEditingDuration={isEditingStatusDuration}
      durationType={statusDrawerDurationType}
      durationValue={statusDrawerDurationValue}
      onDurationTypeChange={setStatusDrawerDurationType}
      onDurationValueChange={setStatusDrawerDurationValue}
      onStartEditDuration={() => {
        if (isCustomFeatureTraitStatusEntry(selectedStatusEntry)) {
          onEditCustomTrait(selectedStatusEntry);
          return;
        }

        setIsEditingStatusDuration(true);
      }}
      editActionIcon={isSelectedCustomFeatureTrait ? Pencil : undefined}
      editActionLabel={isSelectedCustomFeatureTrait ? "Edit Trait" : undefined}
      onCancelEditDuration={cancelStatusDurationEdit}
      onApplyDuration={applyStatusEntryDuration}
      onRemove={() => removeStatusEntry(selectedStatusEntry)}
      onIncreaseExhaustion={() =>
        updateExhaustionLevel(
          selectedExhaustionLevel === null
            ? 1
            : (Math.min(6, selectedExhaustionLevel + 1) as ExhaustionLevel)
        )
      }
      onDecreaseExhaustion={() =>
        updateExhaustionLevel(
          selectedExhaustionLevel === null || selectedExhaustionLevel <= 1
            ? null
            : ((selectedExhaustionLevel - 1) as ExhaustionLevel)
        )
      }
      onClose={() => setSelectedStatusEntryId(null)}
    />
  );
}

export default SelectedStatusEntryDrawer;
