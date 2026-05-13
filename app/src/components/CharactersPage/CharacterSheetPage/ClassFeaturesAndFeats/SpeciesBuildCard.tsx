import type { Character } from "../../../../types";
import { getSpeciesChoiceSummaryItemsForCharacter } from "../../../../pages/CharactersPage/species";
import cardStyles from "./FeatCards.module.css";
import BuildSummaryCard from "./BuildSummaryCard";

type SpeciesBuildCardProps = {
  character: Character;
  onOpenReference?: () => void;
};

function SpeciesBuildCard({ character, onOpenReference }: SpeciesBuildCardProps) {
  const summaryItems = getSpeciesChoiceSummaryItemsForCharacter(character);

  return (
    <ul className={cardStyles.list}>
      <BuildSummaryCard
        title={character.species || "No species selected"}
        meta="Species"
        onClick={character.species ? onOpenReference : undefined}
        summary={summaryItems.length > 0 ? null : "No species choices configured."}
        selectedItems={summaryItems.map((item) => `${item.label}: ${item.value}`)}
      />
    </ul>
  );
}

export default SpeciesBuildCard;
