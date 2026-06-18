import { druidFeatures } from "../../../../codex/classes";
import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character, CharacterDruidFeatureState, MonsterRecord } from "../../../../types";
import { normalizeMonsterRecord } from "../../../../utils/monsters";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import { druidWildShapeStatusSourceIdPrefix } from "./actionKeys";

export function getDruidFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = druidFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedDruidFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return druidFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

export function hasDruidFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Druid") {
    return false;
  }

  return getUnlockedDruidFeatures(character.level).has(feature);
}

function getRawDruidFeatureState(
  character: Pick<Character, "classFeatureState">
): Partial<CharacterDruidFeatureState> {
  return character.classFeatureState?.druid ?? {};
}

export function getDruidWildShapeUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasDruidFeature(character, CLASS_FEATURE.WILD_SHAPE)) {
    return 0;
  }

  return Math.max(0, Math.floor(getDruidFeatureRow(character.level)?.wildShape ?? 0));
}

export function getDruidWildShapeUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getDruidWildShapeUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const rawUsesExpended = Number(getRawDruidFeatureState(character).wildShapeUsesExpended ?? 0);
  const usesExpended = Number.isFinite(rawUsesExpended)
    ? Math.max(0, Math.min(totalUses, Math.floor(rawUsesExpended)))
    : 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getDruidWildShapeActiveForm(
  character: Pick<Character, "classFeatureState">
): MonsterRecord | null {
  return normalizeMonsterRecord(getRawDruidFeatureState(character).wildShapeActiveForm) ?? null;
}

export function expendOneDruidWildShapeUse(character: Character): Character {
  const totalUses = getDruidWildShapeUsesTotal(character);
  const druidState = getRawDruidFeatureState(character);
  const rawUsesExpended = Number(druidState.wildShapeUsesExpended ?? 0);
  const usesExpended = Number.isFinite(rawUsesExpended)
    ? Math.max(0, Math.min(totalUses, Math.floor(rawUsesExpended)))
    : 0;

  if (totalUses <= 0 || usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        wildShapeUsesExpended: usesExpended + 1
      }
    }
  };
}

export function isDruidWildShapeStatusSourceId(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(druidWildShapeStatusSourceIdPrefix);
}

function pruneDruidWildShapeStatusOverrides(statusEntries: Character["statusEntries"]) {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => !isDruidWildShapeStatusSourceId(entry.sourceId)
  );
}

export function deactivateDruidWildShape(character: Character): Character {
  const druidState = getRawDruidFeatureState(character);
  const nextStatusEntries = pruneDruidWildShapeStatusOverrides(character.statusEntries);
  const removedOverrideEntries =
    nextStatusEntries.length !== normalizeCharacterStatusEntries(character.statusEntries).length;

  if (!druidState.wildShapeActiveForm && !removedOverrideEntries) {
    return character;
  }

  return {
    ...character,
    statusEntries: nextStatusEntries,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        wildShapeActiveForm: undefined
      }
    }
  };
}
