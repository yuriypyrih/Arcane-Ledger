import RadioOption from "./RadioOption";
import styles from "./ActionsWidget.module.css";
import type { DruidStarryFormConstellation } from "../../../../../pages/CharactersPage/classFeatures/druid/druid";

const constellationOptions: Array<{
  value: DruidStarryFormConstellation;
  header: string;
  description: string;
}> = [
  {
    value: "archer",
    header: "Archer",
    description:
      "Unlock Luminous Arrow for 10 minutes. It is a ranged spell attack that deals 1d8 Radiant + WIS."
  },
  {
    value: "chalice",
    header: "Chalice",
    description:
      "When you heal with a spell slot, you or another creature within 30 feet regains 1d8 + WIS."
  },
  {
    value: "dragon",
    header: "Dragon",
    description:
      "Intelligence and Wisdom checks, plus Constitution saves to maintain Concentration, treat d20 rolls of 9 or lower as 10."
  }
];

type DruidStarryFormActionBodyProps = {
  selectedConstellation: DruidStarryFormConstellation | null;
  onSelectConstellation: (constellation: DruidStarryFormConstellation) => void;
};

function DruidStarryFormActionBody({
  selectedConstellation,
  onSelectConstellation
}: DruidStarryFormActionBodyProps) {
  return (
    <div className={styles.wildCompanionBody}>
      {constellationOptions.map((option) => (
        <RadioOption
          key={option.value}
          name="druid-starry-form"
          header={option.header}
          description={option.description}
          isSelected={selectedConstellation === option.value}
          onSelect={() => onSelectConstellation(option.value)}
        />
      ))}
    </div>
  );
}

export default DruidStarryFormActionBody;
