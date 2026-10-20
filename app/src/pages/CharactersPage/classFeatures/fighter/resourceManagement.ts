import { namedResources } from "../../managedClassResources";
import type { ResourceManagementTarget } from "../../resourceManagement";
import { classCounterResource } from "../../resourceManagement";
import {
  getFighterActionSurgeUsesRemaining,
  getFighterActionSurgeUsesTotal,
  getFighterIndomitableUsesRemaining,
  getFighterIndomitableUsesTotal
} from "./fighter";
import { fighterSubclassResources } from "./subclasses/resourceManagement";

export const fighterManagedResources = {
  ...fighterSubclassResources,
  actionSurgeUsesExpended: classCounterResource(
    "fighter",
    "actionSurgeUsesExpended",
    "Action Surge",
    getFighterActionSurgeUsesTotal,
    getFighterActionSurgeUsesRemaining
  ),
  indomitableUsesExpended: classCounterResource(
    "fighter",
    "indomitableUsesExpended",
    "Indomitable",
    getFighterIndomitableUsesTotal,
    getFighterIndomitableUsesRemaining
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const fighterActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "fighter-arcane-archer-magical-ammunition": [
    fighterManagedResources.magicalAmmunitionUsesExpended,
    namedResources["second-wind"]
  ],
  "fighter-action-surge": [fighterManagedResources.actionSurgeUsesExpended],
  "fighter-second-wind": [namedResources["second-wind"]],
  "fighter-tactical-mind": [namedResources["second-wind"]],
  "fighter-indomitable": [fighterManagedResources.indomitableUsesExpended],
  "fighter-battle-master-combat-superiority": [namedResources["superiority-dice"]],
  "fighter-battle-master-know-your-enemy": [
    fighterManagedResources.battleMasterKnowYourEnemyUsesExpended,
    namedResources["superiority-dice"]
  ],
  "fighter-psi-warrior-telekinetic-movement": [
    fighterManagedResources.psiWarriorTelekineticMovementUsesExpended,
    namedResources["psi-energy"]
  ],
  "fighter-psi-warrior-psi-powered-leap": [
    fighterManagedResources.psiWarriorPsiPoweredLeapUsesExpended,
    namedResources["psi-energy"]
  ],
  "fighter-psi-warrior-bulwark-of-force": [
    fighterManagedResources.psiWarriorBulwarkOfForceUsesExpended,
    namedResources["psi-energy"]
  ]
};
