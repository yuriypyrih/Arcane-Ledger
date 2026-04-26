import RadioContainerOption from "../../../RadioContainerOption";
import styles from "../ActionsWidget/ActionsWidget.module.css";
import type { DruidStarryFormConstellation } from "../../../../../../pages/CharactersPage/classFeatures/druid/druid";

function getConstellationOptions(hasTwinklingConstellations: boolean): Array<{
  value: DruidStarryFormConstellation;
  header: string;
  description: string;
}> {
  const archerDamage = hasTwinklingConstellations ? "2d8" : "1d8";
  const chaliceHealing = hasTwinklingConstellations ? "2d8" : "1d8";

  return [
    {
      value: "archer",
      header: "Archer",
      description: `Unlock Luminous Arrow for 10 minutes. It is a ranged spell attack that deals ${archerDamage} Radiant + WIS.`
    },
    {
      value: "chalice",
      header: "Chalice",
      description: `When you heal with a spell slot, you or another creature within 30 feet regains ${chaliceHealing} + WIS.`
    },
    {
      value: "dragon",
      header: "Dragon",
      description: hasTwinklingConstellations
        ? "Intelligence and Wisdom checks, plus Constitution saves to maintain Concentration, treat d20 rolls of 9 or lower as 10. You also gain a Fly Speed of 20 feet and can hover."
        : "Intelligence and Wisdom checks, plus Constitution saves to maintain Concentration, treat d20 rolls of 9 or lower as 10."
    }
  ];
}

type DruidStarryFormActionBodyProps = {
  selectedConstellation: DruidStarryFormConstellation | null;
  hasTwinklingConstellations: boolean;
  disabled?: boolean;
  onSelectConstellation: (constellation: DruidStarryFormConstellation) => void;
};

function DruidStarryFormActionBody({
  selectedConstellation,
  hasTwinklingConstellations,
  disabled = false,
  onSelectConstellation
}: DruidStarryFormActionBodyProps) {
  const constellationOptions = getConstellationOptions(hasTwinklingConstellations);

  return (
    <div className={styles.wildCompanionBody}>
      {constellationOptions.map((option) => (
        <RadioContainerOption
          key={option.value}
          name="druid-starry-form"
          header={option.header}
          breakdown={option.description}
          selected={selectedConstellation === option.value}
          disabled={disabled}
          onSelect={() => onSelectConstellation(option.value)}
        />
      ))}
    </div>
  );
}

export default DruidStarryFormActionBody;
