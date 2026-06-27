import type { CustomBestiaryRecord } from "../../../../api/customBestiary";
import type { MonsterListItem, MonsterOrdering, MonsterRecord } from "../../../../types";
import {
  getMonsterChallengeRatingNumber,
  getMonsterImageUrl,
  getMonsterSourceKey,
  getMonsterSourceTitle,
  getMonsterTypeName
} from "../../../../utils/monsters";

export function customBestiaryRecordToListItem(record: CustomBestiaryRecord): MonsterListItem {
  const monster = record.monster;

  return {
    id: record.id,
    key: monster.key,
    name: monster.name,
    typeKey: monster.type?.key ?? null,
    typeName: getMonsterTypeName(monster),
    challengeRating: monster.challenge_rating ?? null,
    sourceKey: getMonsterSourceKey(monster) ?? "custom-bestiary",
    sourceTitle: getMonsterSourceTitle(monster) ?? "Custom Bestiary",
    imageUrl: getMonsterImageUrl(monster)
  };
}

export function filterCustomBestiaryRecords(
  records: CustomBestiaryRecord[],
  options: {
    query: string;
    type: string;
  }
) {
  const normalizedQuery = options.query.trim().toLowerCase();
  const normalizedType = options.type.trim().toLowerCase();

  return records.filter((record) => {
    const monster = record.monster;
    const nameMatches =
      !normalizedQuery || monster.name.toLowerCase().includes(normalizedQuery);
    const typeMatches =
      !normalizedType ||
      normalizedType === "all" ||
      monster.type?.key?.toLowerCase() === normalizedType ||
      getMonsterTypeName(monster)?.toLowerCase() === normalizedType;

    return nameMatches && typeMatches;
  });
}

export function sortCustomBestiaryRecords(
  records: CustomBestiaryRecord[],
  ordering: MonsterOrdering
) {
  return records.slice().sort((leftRecord, rightRecord) => {
    const left = leftRecord.monster;
    const right = rightRecord.monster;

    switch (ordering) {
      case "-name":
        return right.name.localeCompare(left.name);
      case "challenge_rating":
      case "cr":
        return (
          (getMonsterChallengeRatingNumber(left) ?? 0) -
            (getMonsterChallengeRatingNumber(right) ?? 0) ||
          left.name.localeCompare(right.name)
        );
      case "-challenge_rating":
      case "-cr":
        return (
          (getMonsterChallengeRatingNumber(right) ?? 0) -
            (getMonsterChallengeRatingNumber(left) ?? 0) ||
          left.name.localeCompare(right.name)
        );
      case "type":
        return (
          (getMonsterTypeName(left) ?? "").localeCompare(getMonsterTypeName(right) ?? "") ||
          left.name.localeCompare(right.name)
        );
      case "-type":
        return (
          (getMonsterTypeName(right) ?? "").localeCompare(getMonsterTypeName(left) ?? "") ||
          left.name.localeCompare(right.name)
        );
      case "name":
      default:
        return left.name.localeCompare(right.name);
    }
  });
}

export function getCustomBestiaryMonsterByKey(
  records: CustomBestiaryRecord[],
  key: string
): MonsterRecord | null {
  return records.find((record) => record.monster.key === key)?.monster ?? null;
}
