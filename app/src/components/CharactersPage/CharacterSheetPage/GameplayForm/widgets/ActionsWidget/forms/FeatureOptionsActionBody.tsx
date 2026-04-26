import clsx from "clsx";
import type { Character } from "../../../../../../../types";
import type {
  FeatureActionOptionCard
} from "../../../../../../../pages/CharactersPage/classFeatures";
import type { GameplayActionDefinition } from "../../../../../../../pages/CharactersPage/combatActions";
import { formatFeatureActionOptionValueLabel } from "../../../../../../../pages/CharactersPage/actionOutcome";
import { FeatureActionOptionButton } from "../ActionCards";
import type { RoundTrackerAvailability } from "../types";
import sharedModalStyles from "../FeatureActionModal.module.css";

type FeatureOptionsActionBodyProps = {
  action: Extract<GameplayActionDefinition, { kind: "feature" }>;
  character: Character;
  roundTracker: RoundTrackerAvailability;
  selectedOptionKeys: string[];
  onToggleOption: (option: FeatureActionOptionCard) => void;
};

function FeatureOptionsActionBody({
  action,
  character,
  roundTracker,
  selectedOptionKeys,
  onToggleOption
}: FeatureOptionsActionBodyProps) {
  const drawer = action.drawer.kind === "options" ? action.drawer : null;
  const selection = drawer?.selection ?? "single-immediate";
  const options = drawer?.options ?? [];
  const selectionLimit = drawer?.selectionLimit ?? options.length;

  return (
    <div className={clsx(sharedModalStyles.featureActionOptionGrid)}>
      {options.map((option) => {
        const isSelected = selectedOptionKeys.includes(option.key);
        const isDisabled =
          selection === "multi-confirm" &&
          !isSelected &&
          (option.disabled === true || selectedOptionKeys.length >= selectionLimit);
        const resolvedOption = isDisabled ? { ...option, disabled: true } : option;

        return (
          <FeatureActionOptionButton
            key={option.key}
            option={resolvedOption}
            character={character}
            roundTracker={roundTracker}
            selected={isSelected}
            selectionIndicatorType={selection === "multi-confirm" ? "checkbox" : "radio"}
            selectionName={selection === "multi-confirm" ? undefined : action.action.key}
            onClick={() => onToggleOption(option)}
            formatValueLabel={formatFeatureActionOptionValueLabel}
          />
        );
      })}
    </div>
  );
}

export default FeatureOptionsActionBody;
