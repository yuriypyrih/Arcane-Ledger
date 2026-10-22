import clsx from "clsx";
import { CLASS_FEATURE } from "../../../../codex/entries/enums";
import { setWizardSavantSpellIdsForCharacter } from "../../../../pages/CharactersPage/classFeatures";
import {
  getWizardSavantConfigForFeature,
  getWizardSavantSelectionCount,
  getWizardSavantSpellOptions,
  normalizeWizardSavantSpellIds
} from "../../../../pages/CharactersPage/classFeatures/wizard/savant";
import { getClassLevel } from "../../../../pages/CharactersPage/multiclassState";
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

  const selectionCount = getWizardSavantSelectionCount(getClassLevel(character, "Wizard"));
  const currentSelections = normalizeWizardSavantSpellIds(
    character.classFeatureState?.wizard?.savantSpellIds,
    character
  );
  const availableSpells = getWizardSavantSpellOptions(character);

  if (selectionCount <= 0) {
    return null;
  }

  function updateSelection(slotIndex: number, nextValue: string) {
    onPersistCharacter((currentCharacter) =>
      setWizardSavantSpellIdsForCharacter(
        currentCharacter,
        updateSelectionAtIndex(
          normalizeWizardSavantSpellIds(
            currentCharacter.classFeatureState?.wizard?.savantSpellIds,
            currentCharacter
          ),
          selectionCount,
          slotIndex,
          nextValue
        )
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
        const slotOptions = getWizardSavantSpellOptions(character, slotIndex);
        const blockedSelections = new Set(
          currentSelections.filter((_, index) => index !== slotIndex)
        );

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
                <option
                  key={`${featureKey}-savant-${slotIndex}-${spell.id}`}
                  value={spell.id}
                  disabled={blockedSelections.has(spell.id)}
                >
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
