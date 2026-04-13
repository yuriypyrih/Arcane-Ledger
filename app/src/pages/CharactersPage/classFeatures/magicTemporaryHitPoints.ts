import type { Character } from "../../../types";
import { collectActiveClassFeatureState } from "./modules";
import { getSubclassDerivedFeatureState } from "./subclasses";

export function getMagicTemporaryHitPointsFeatureForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "subclassId">>
) {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return (
    subclassDerivedState.magicTemporaryHitPointsFeature ??
    baseFeatureState.magicTemporaryHitPointsFeature ??
    null
  );
}
