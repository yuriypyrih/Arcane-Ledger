import type { Character } from "../../../../types";
import { getSpeciesChoiceSummaryItemsForCharacter } from "../../../../pages/CharactersPage/species";
import cardStyles from "./FeatCards.module.css";
import BuildSummaryCard from "./BuildSummaryCard";

type SpeciesBuildCardProps = {
  character: Character;
};

function SpeciesBuildCard({ character }: SpeciesBuildCardProps) {
  const summaryItems = getSpeciesChoiceSummaryItemsForCharacter(character);

  return (
    <ul className={cardStyles.list}>
      <BuildSummaryCard
        title={character.species || "No species selected"}
        meta="Species"
        summary={summaryItems.length > 0 ? null : "No species choices configured."}
        selectedItems={summaryItems.map((item) => `${item.label}: ${item.value}`)}
      />
    </ul>
  );
}

export default SpeciesBuildCard;
