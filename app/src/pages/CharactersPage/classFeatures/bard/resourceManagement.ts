import { namedResources } from "../../managedClassResources";
import type { ResourceManagementTarget } from "../../resourceManagement";
import { spellSlotResource } from "../../resourceManagement";
import { bardSubclassResources } from "./subclasses/resourceManagement";

export const bardManagedResources = {
  ...bardSubclassResources
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const bardActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "bard-bardic-inspiration": [namedResources["bardic-inspiration"], spellSlotResource(1)],
  "bard-college-of-the-moon-lunar-vitality": [namedResources["bardic-inspiration"]],
  "bard-mantle-of-inspiration": [namedResources["bardic-inspiration"]],
  "bard-mantle-of-majesty": [
    bardManagedResources.mantleOfMajestyUsesExpended,
    spellSlotResource(3)
  ],
  "bard-unbreakable-majesty": [bardManagedResources.unbreakableMajestyUsesExpended]
};
