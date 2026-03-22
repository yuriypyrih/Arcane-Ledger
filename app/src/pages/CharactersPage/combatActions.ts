import type { Character } from "../../types";
import { getFeatureActionsForCharacter, type FeatureActionCard } from "./classFeatures";
import { getWeaponActionsForCharacter, type WeaponAction } from "./gameplay";

export type CombatActionCard =
  | {
      kind: "feature";
      action: FeatureActionCard;
    }
  | {
      kind: "weapon";
      action: WeaponAction;
    };

export function getCombatActionsForCharacter(character: Character): CombatActionCard[] {
  const featureActions = getFeatureActionsForCharacter(character).map(
    (action) =>
      ({
        kind: "feature",
        action
      }) satisfies CombatActionCard
  );
  const weaponActions = getWeaponActionsForCharacter(character).map(
    (action) =>
      ({
        kind: "weapon",
        action
      }) satisfies CombatActionCard
  );

  return [...featureActions, ...weaponActions];
}
