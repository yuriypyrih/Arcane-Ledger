import type { Character } from "../../../../types";
import { getSpeciesChoiceSummaryItemsForCharacter } from "../../../../pages/CharactersPage/species";
import {
  getCharacterSpeciesDisplayName,
  isCustomSpeciesName
} from "../../../../pages/CharactersPage/customOrigins";
import cardStyles from "./FeatCards.module.css";
import BuildSummaryCard from "./BuildSummaryCard";

type SpeciesBuildCardProps = {
  character: Character;
  onOpenReference?: () => void;
};

function SpeciesBuildCard({ character, onOpenReference }: SpeciesBuildCardProps) {
  const summaryItems = getSpeciesChoiceSummaryItemsForCharacter(character);
  const speciesLabel = getCharacterSpeciesDisplayName(character);
  const canOpenReference = character.species && !isCustomSpeciesName(character.species);

  return (
    <ul className={cardStyles.list}>
      <BuildSummaryCard
        title={speciesLabel || "No species selected"}
        meta="Species"
        onClick={canOpenReference ? onOpenReference : undefined}
        summary={summaryItems.length > 0 ? null : "No species choices configured."}
        selectedItems={summaryItems.map((item) => `${item.label}: ${item.value}`)}
      />
    </ul>
  );
}

export default SpeciesBuildCard;
