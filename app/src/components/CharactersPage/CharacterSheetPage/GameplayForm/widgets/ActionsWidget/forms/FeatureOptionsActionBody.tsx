import clsx from "clsx";
import type { Character } from "../../../../../../../types";
import type {
  FeatureActionOptionCard
} from "../../../../../../../pages/CharactersPage/classFeatures";
import type { GameplayActionDefinition } from "../../../../../../../pages/CharactersPage/combatActions";
import { formatFeatureActionOptionValueLabel } from "../../../../../../../pages/CharactersPage/actionOutcome";
import SpellDescriptionContent from "../../../../../../SpellDescriptionContent";
import RadioContainerOption from "../../../../RadioContainerOption";
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
  const hasDetailedOptions = options.some(
    (option) => option.description && option.description.length > 0
  );

  return (
    <div
      className={clsx(
        hasDetailedOptions
          ? sharedModalStyles.metamagicOptionList
          : sharedModalStyles.featureActionOptionGrid
      )}
    >
      {options.map((option) => {
        const isSelected = selectedOptionKeys.includes(option.key);
        const isDisabled =
          selection === "multi-confirm" &&
          !isSelected &&
          (option.disabled === true || selectedOptionKeys.length >= selectionLimit);
        const resolvedOption = isDisabled ? { ...option, disabled: true } : option;
        const selectionIndicatorType = selection === "multi-confirm" ? "checkbox" : "radio";
        const selectionName = selection === "multi-confirm" ? undefined : action.action.key;
        const optionBreakdown =
          resolvedOption.description && resolvedOption.description.length > 0 ? (
            <SpellDescriptionContent
              description={resolvedOption.description}
              className={sharedModalStyles.metamagicOptionDescription}
              entryClassName={sharedModalStyles.metamagicOptionDescriptionLine}
              strongClassName={sharedModalStyles.metamagicOptionDescriptionStrong}
            />
          ) : undefined;

        if (resolvedOption.presentation === "plain") {
          return (
            <RadioContainerOption
              key={option.key}
              header={option.name}
              breakdown={optionBreakdown}
              selected={isSelected}
              onSelect={() => onToggleOption(option)}
              name={selectionName}
              disabled={resolvedOption.disabled === true}
              indicatorType={selectionIndicatorType}
            />
          );
        }

        return (
          <FeatureActionOptionButton
            key={option.key}
            option={resolvedOption}
            character={character}
            roundTracker={roundTracker}
            selected={isSelected}
            selectionIndicatorType={selectionIndicatorType}
            selectionName={selectionName}
            onClick={() => onToggleOption(option)}
            formatValueLabel={formatFeatureActionOptionValueLabel}
            breakdown={optionBreakdown}
          />
        );
      })}
    </div>
  );
}

export default FeatureOptionsActionBody;
