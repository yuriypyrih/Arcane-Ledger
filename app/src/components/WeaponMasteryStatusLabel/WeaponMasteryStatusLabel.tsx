import styles from "./WeaponMasteryStatusLabel.module.css";

type WeaponMasteryStatusLabelProps = {
  label?: string;
  status?: string;
};

function WeaponMasteryStatusLabel({
  label = "Mastery",
  status = "MASTERED"
}: WeaponMasteryStatusLabelProps) {
  return (
    <>
      {label}{" "}
      <span className={styles.parenthetical}>
        (<span className={styles.status}>{status}</span>)
      </span>
    </>
  );
}

export default WeaponMasteryStatusLabel;
