import styles from "./WeaponMasteryStatusLabel.module.css";

type WeaponMasteryStatusLabelProps = {
  label?: string;
};

function WeaponMasteryStatusLabel({ label = "Mastery" }: WeaponMasteryStatusLabelProps) {
  return (
    <>
      {label}{" "}
      <span className={styles.parenthetical}>
        (<span className={styles.active}>ACTIVE</span>)
      </span>
    </>
  );
}

export default WeaponMasteryStatusLabel;
