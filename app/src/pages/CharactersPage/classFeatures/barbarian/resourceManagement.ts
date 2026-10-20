import { namedResources } from "../../managedClassResources";
import type { ResourceManagementTarget } from "../../resourceManagement";
import { barbarianSubclassResources } from "./subclasses/resourceManagement";

export const barbarianManagedResources = {
  ...barbarianSubclassResources
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const barbarianActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "barbarian-rage": [namedResources["rage"]],
  "barbarian-intimidating-presence": [
    barbarianManagedResources.intimidatingPresenceUsesExpended,
    namedResources["rage"]
  ],
  "barbarian-warrior-of-the-gods": [barbarianManagedResources.warriorOfTheGodsUsesExpended],
  "barbarian-zealous-presence": [
    barbarianManagedResources.zealousPresenceUsesExpended,
    namedResources["rage"]
  ]
};
