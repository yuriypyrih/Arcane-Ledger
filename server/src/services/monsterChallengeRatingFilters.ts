import type { FilterQuery } from "mongoose";
import type { MonsterChallengeRatingBucket, MonsterRecord } from "../types/monster.js";

function createChallengeRatingNumberExpression() {
  const rawChallengeRatingExpression = { $ifNull: ["$challenge_rating", "$cr"] };
  const challengeRatingTextExpression = {
    $trim: {
      input: {
        $convert: {
          input: rawChallengeRatingExpression,
          to: "string",
          onError: "",
          onNull: ""
        }
      }
    }
  };

  return {
    $let: {
      vars: {
        challengeRatingText: challengeRatingTextExpression
      },
      in: {
        $cond: [
          {
            $regexMatch: {
              input: "$$challengeRatingText",
              regex: /^\d+\/\d+$/
            }
          },
          {
            $let: {
              vars: {
                fractionParts: { $split: ["$$challengeRatingText", "/"] }
              },
              in: {
                $let: {
                  vars: {
                    numerator: {
                      $convert: {
                        input: { $arrayElemAt: ["$$fractionParts", 0] },
                        to: "double",
                        onError: null,
                        onNull: null
                      }
                    },
                    denominator: {
                      $convert: {
                        input: { $arrayElemAt: ["$$fractionParts", 1] },
                        to: "double",
                        onError: null,
                        onNull: null
                      }
                    }
                  },
                  in: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ["$$numerator", null] },
                          { $eq: ["$$denominator", null] },
                          { $eq: ["$$denominator", 0] }
                        ]
                      },
                      null,
                      { $divide: ["$$numerator", "$$denominator"] }
                    ]
                  }
                }
              }
            }
          },
          {
            $convert: {
              input: "$$challengeRatingText",
              to: "double",
              onError: null,
              onNull: null
            }
          }
        ]
      }
    }
  };
}

function createChallengeRatingBucketCondition(bucket: MonsterChallengeRatingBucket) {
  if (bucket === "0") {
    return {
      $or: [
        { $eq: ["$$challengeRatingValue", null] },
        { $eq: ["$$challengeRatingValue", 0] }
      ]
    };
  }

  if (bucket === "<1") {
    return {
      $and: [
        { $gt: ["$$challengeRatingValue", 0] },
        { $lte: ["$$challengeRatingValue", 1] }
      ]
    };
  }

  if (bucket === "30+") {
    return {
      $gte: ["$$challengeRatingValue", 30]
    };
  }

  const bucketCeiling = Number(bucket);

  return {
    $and: [
      { $gt: ["$$challengeRatingValue", bucketCeiling - 1] },
      { $lte: ["$$challengeRatingValue", bucketCeiling] }
    ]
  };
}

export function createChallengeRatingBucketFilter(
  bucket: MonsterChallengeRatingBucket
): FilterQuery<MonsterRecord> {
  return {
    $expr: {
      $let: {
        vars: {
          challengeRatingValue: createChallengeRatingNumberExpression()
        },
        in: createChallengeRatingBucketCondition(bucket)
      }
    }
  };
}
