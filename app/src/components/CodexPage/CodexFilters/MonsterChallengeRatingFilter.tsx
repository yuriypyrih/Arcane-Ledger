import {
  isMonsterChallengeRatingBucket,
  MONSTER_CHALLENGE_RATING_BUCKET_OPTIONS,
  type MonsterChallengeRatingBucket
} from "../../../constants/monsters";
import styles from "./CodexFilters.module.css";

type MonsterChallengeRatingFilterProps = {
  value: MonsterChallengeRatingBucket | null;
  onChange: (value: MonsterChallengeRatingBucket | null) => void;
};

function MonsterChallengeRatingFilter({ value, onChange }: MonsterChallengeRatingFilterProps) {
  return (
    <label className={styles.field}>
      <span>Challenge Rating</span>
      <select
        className={styles.input}
        value={value ?? "ALL"}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(isMonsterChallengeRatingBucket(nextValue) ? nextValue : null);
        }}
      >
        <option value="ALL">All</option>
        {MONSTER_CHALLENGE_RATING_BUCKET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default MonsterChallengeRatingFilter;
