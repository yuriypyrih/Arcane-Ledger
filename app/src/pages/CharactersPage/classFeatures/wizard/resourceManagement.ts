import type { ResourceManagementTarget } from "../../resourceManagement";
import { classCounterResource } from "../../resourceManagement";
import { wizardSubclassResources } from "./subclasses/resourceManagement";
import { getArcaneRecoveryUsesRemaining, getArcaneRecoveryUsesTotal } from "./wizard";

export const wizardManagedResources = {
  ...wizardSubclassResources,
  arcaneRecoveryUsesExpended: classCounterResource(
    "wizard",
    "arcaneRecoveryUsesExpended",
    "Arcane Recovery",
    getArcaneRecoveryUsesTotal,
    getArcaneRecoveryUsesRemaining
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const wizardActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "wizard-diviner-portent": [wizardManagedResources.portent],
  "wizard-arcane-recovery": [wizardManagedResources.arcaneRecoveryUsesExpended],
  "wizard-bladesinger-bladesong": [wizardManagedResources.bladesongUsesExpended]
};
