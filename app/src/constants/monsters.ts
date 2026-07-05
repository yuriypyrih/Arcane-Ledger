export const MONSTER_TYPE_OPTIONS = [
  "Aberration",
  "Beast",
  "Celestial",
  "Construct",
  "Dragon",
  "Elemental",
  "Fey",
  "Fiend",
  "Giant",
  "Humanoid",
  "Monstrosity",
  "Ooze",
  "Plant",
  "Undead"
] as const;

export const MONSTER_SOURCE_OPTIONS = [
  "srd-2024",
  "bfrd",
  "ccdx",
  "a5e-mm",
  "tdcs",
  "tob",
  "tob-2023",
  "tob2",
  "tob3"
] as const;

export type MonsterChallengeRatingBucket = "0" | "<1" | "30+" | `${number}`;

export const MONSTER_CHALLENGE_RATING_BUCKET_OPTIONS: Array<{
  value: MonsterChallengeRatingBucket;
  label: string;
}> = [
  { value: "0", label: "0" },
  { value: "<1", label: "1" },
  ...Array.from({ length: 28 }, (_, index) => {
    const challengeRating = index + 2;

    return {
      value: String(challengeRating) as MonsterChallengeRatingBucket,
      label: String(challengeRating)
    };
  }),
  { value: "30+", label: "30+" }
];

const MONSTER_CHALLENGE_RATING_BUCKET_VALUES = new Set(
  MONSTER_CHALLENGE_RATING_BUCKET_OPTIONS.map((option) => option.value)
);

export function isMonsterChallengeRatingBucket(
  value: string | null
): value is MonsterChallengeRatingBucket {
  return (
    value !== null &&
    MONSTER_CHALLENGE_RATING_BUCKET_VALUES.has(value as MonsterChallengeRatingBucket)
  );
}

export function matchesMonsterChallengeRatingBucket(
  challengeRating: number | null,
  bucket: MonsterChallengeRatingBucket | null
) {
  if (bucket === null) {
    return true;
  }

  if (bucket === "0") {
    return challengeRating === null || challengeRating === 0;
  }

  if (challengeRating === null) {
    return false;
  }

  if (bucket === "<1") {
    return challengeRating > 0 && challengeRating <= 1;
  }

  if (bucket === "30+") {
    return challengeRating >= 30;
  }

  const bucketCeiling = Number(bucket);

  return challengeRating > bucketCeiling - 1 && challengeRating <= bucketCeiling;
}
