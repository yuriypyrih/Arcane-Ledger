import clsx from "clsx";
import { CLASS_FEATURE } from "../../../../codex/entries";
import {
  getWizardSavantSpellIdsForCharacter,
  setWizardSavantSpellIdsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  getWizardSavantConfigForFeature,
  getWizardSavantSelectionCount,
  getWizardSavantSpellOptions
} from "../../../../pages/CharactersPage/classFeatures/wizard/savant";
import { getSpellLevel } from "../../../../pages/CharactersPage/spellcasting";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { Character } from "../../../../types";
import SelectInput from "../../FormInputs/SelectInput";
import styles from "./ClassFeaturesAndFeats.module.css";
import { updateSelectionAtIndex } from "./helpers";

type WizardSavantFeatureFieldsProps = {
  character: Character;
  feature: CLASS_FEATURE;
  featureKey: string;
  isUnlocked: boolean;
  onPersistCharacter: PersistCharacterUpdater;
};

function formatWizardSavantSpellLabel(spell: { name: string; spellLevel: number }): string {
  return `L${getSpellLevel(spell)} ${spell.name}`;
}

function WizardSavantFeatureFields({
  character,
  feature,
  featureKey,
  isUnlocked,
  onPersistCharacter
}: WizardSavantFeatureFieldsProps) {
  const savantConfig = getWizardSavantConfigForFeature(feature);

  if (!savantConfig) {
    return null;
  }

  const selectionCount = getWizardSavantSelectionCount(character.level);
  const currentSelections = getWizardSavantSpellIdsForCharacter(character);
  const availableSpells = getWizardSavantSpellOptions(character);

  if (selectionCount <= 0) {
    return null;
  }

  function getAvailableSpellsForSlot(slotIndex: number) {
    const currentValue = currentSelections[slotIndex] ?? "";
    const blockedSelections = new Set(
      currentSelections.filter((selection, index) => index !== slotIndex)
    );

    return availableSpells.filter((spell) => {
      if (spell.id === currentValue) {
        return true;
      }

      return !blockedSelections.has(spell.id);
    });
  }

  function updateSelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setWizardSavantSpellIdsForCharacter(
        currentCharacter,
        updateSelectionAtIndex(
          getWizardSavantSpellIdsForCharacter(currentCharacter),
          selectionCount,
          slotIndex,
          nextValue
        ).filter((selection): selection is string => selection.trim().length > 0)
      )
    );
  }

  if (availableSpells.length === 0) {
    return (
      <p className={styles.emptyFeatureText}>
        No eligible {savantConfig.schoolLabel} spells are available yet.
      </p>
    );
  }

  return (
    <div className={styles.featureSelectionGrid}>
      {Array.from({ length: selectionCount }, (_, slotIndex) => {
        const currentValue = currentSelections[slotIndex] ?? "";
        const slotOptions = getAvailableSpellsForSlot(slotIndex);

        return (
          <label
            key={`${featureKey}-savant-slot-${slotIndex}`}
            className={clsx(
              styles.featureSelectionField,
              !isUnlocked && styles.featureOptionRowDisabled
            )}
          >
            <span className={styles.featureSelectionLabel}>
              {`${savantConfig.schoolLabel} Spell ${slotIndex + 1}`}
            </span>
            <SelectInput
              value={currentValue}
              disabled={!isUnlocked}
              onChange={(event) => updateSelection(slotIndex, event.target.value)}
            >
              <option value="">{`Select a ${savantConfig.schoolLabel} spell`}</option>
              {slotOptions.map((spell) => (
                <option key={`${featureKey}-savant-${slotIndex}-${spell.id}`} value={spell.id}>
                  {formatWizardSavantSpellLabel(spell)}
                </option>
              ))}
            </SelectInput>
          </label>
        );
      })}
      <p className={styles.emptyFeatureText}>
        Selected savant spells are always in your spellbook and do not count toward the normal
        spellbook total.
      </p>
    </div>
  );
}

export default WizardSavantFeatureFields;
