import clsx from "clsx";
import SelectInput from "../../FormInputs/SelectInput";
import {
  artisanToolProficiencies,
  getToolProficiencyLabel,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiency";
import { TOOL_PROFICIENCY } from "../../../../types";
import styles from "./ClassFeaturesAndFeats.module.css";

type ArtificerToolsOfTheTradeSelectionProps = {
  choiceCount: number;
  choiceSelections: ToolProficiency[];
  getAvailableTools: (slotIndex: number) => ToolProficiency[];
  isUnlocked: boolean;
  lockedSelections: TOOL_PROFICIENCY[];
  onChange: (slotIndex: number, tool: string) => void;
};

function ArtificerToolsOfTheTradeSelection({
  choiceCount,
  choiceSelections,
  getAvailableTools,
  isUnlocked,
  lockedSelections,
  onChange
}: ArtificerToolsOfTheTradeSelectionProps) {
  if (choiceCount <= 0 && lockedSelections.length === 0) {
    return null;
  }

  return (
    <div className={styles.featureSelectionGrid}>
      {lockedSelections.map((tool, slotIndex) => (
        <label
          key={`artificer-tools-of-the-trade-locked-${tool}`}
          className={clsx(
            styles.featureSelectionField,
            !isUnlocked && styles.featureOptionRowDisabled
          )}
        >
          <span className={styles.featureSelectionLabel}>{`Tool ${slotIndex + 1}`}</span>
          <SelectInput value={tool} disabled>
            <option value={tool}>{getToolProficiencyLabel(tool)}</option>
          </SelectInput>
        </label>
      ))}
      {Array.from({ length: choiceCount }, (_, slotIndex) => {
        const currentValue = choiceSelections[slotIndex] ?? "";
        const labelIndex = lockedSelections.length + slotIndex + 1;
        const availableToolSet = new Set(getAvailableTools(slotIndex));

        return (
          <label
            key={`artificer-tools-of-the-trade-choice-${slotIndex}`}
            className={clsx(
              styles.featureSelectionField,
              !isUnlocked && styles.featureOptionRowDisabled
            )}
          >
            <span className={styles.featureSelectionLabel}>{`Artisan's Tool ${labelIndex}`}</span>
            <SelectInput
              value={currentValue}
              disabled={!isUnlocked}
              invalid={isUnlocked && !currentValue}
              onChange={(event) => onChange(slotIndex, event.target.value)}
            >
              <option value="">-</option>
              {artisanToolProficiencies.map((tool) => (
                <option
                  key={`${slotIndex}-${tool}`}
                  value={tool}
                  disabled={currentValue !== tool && !availableToolSet.has(tool)}
                >
                  {getToolProficiencyLabel(tool)}
                </option>
              ))}
            </SelectInput>
          </label>
        );
      })}
    </div>
  );
}

export default ArtificerToolsOfTheTradeSelection;
