import RadioContainerOption from "../../../RadioContainerOption";
import type { Character, DruidCosmicOmenSelection } from "../../../../../../types";
import { getDruidCircleOfTheStarsCosmicOmenOptionDescriptionEntries } from "../../../../../../pages/CharactersPage/classFeatures/druid/subclasses/druidCircleOfTheStarsDescriptions";
import { renderCodexRichText } from "../../../../../../utils/codex/renderCodexRichText";
import styles from "./DruidCosmicOmenReactionBody.module.css";

const cosmicOmenOptions: Array<{
  value: DruidCosmicOmenSelection;
  label: string;
}> = [
  {
    value: "weal",
    label: "Weal (even)"
  },
  {
    value: "woe",
    label: "Woe (odd)"
  }
];

function joinTextDescription(
  entries: ReturnType<typeof getDruidCircleOfTheStarsCosmicOmenOptionDescriptionEntries>
) {
  return entries
    .filter((entry): entry is string => typeof entry === "string")
    .join(" ")
    .trim();
}

type DruidCosmicOmenReactionBodyProps = {
  character: Character;
  selectedSelection: DruidCosmicOmenSelection;
  onSelectSelection: (selection: DruidCosmicOmenSelection) => void;
};

function DruidCosmicOmenReactionBody({
  character,
  selectedSelection,
  onSelectSelection
}: DruidCosmicOmenReactionBodyProps) {
  return (
    <div className={styles.body}>
      <div className={styles.optionList}>
        {cosmicOmenOptions.map((option) => {
          const descriptionText = joinTextDescription(
            getDruidCircleOfTheStarsCosmicOmenOptionDescriptionEntries(character, option.value)
          );

          return (
            <RadioContainerOption
              key={option.value}
              name="druid-cosmic-omen"
              header={option.label}
              breakdown={
                descriptionText.length > 0 ? (
                  <span className={styles.optionDescription}>
                    {renderCodexRichText(descriptionText)}
                  </span>
                ) : null
              }
              selected={selectedSelection === option.value}
              onSelect={() => onSelectSelection(option.value)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default DruidCosmicOmenReactionBody;
