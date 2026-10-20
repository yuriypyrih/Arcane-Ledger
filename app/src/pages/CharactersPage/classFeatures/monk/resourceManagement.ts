import { namedResources } from "../../managedClassResources";
import type { ResourceManagementTarget } from "../../resourceManagement";
import { monkSubclassResources } from "./subclasses/resourceManagement";

export const monkManagedResources = {
  ...monkSubclassResources
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const monkActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "monk-flurry-of-blows": [namedResources["focus"]],
  "monk-patient-defense": [namedResources["focus"]],
  "monk-step-of-the-wind": [namedResources["focus"]],
  "monk-superior-defense": [namedResources["focus"]],
  "monk-warrior-of-mercy-hand-of-healing": [namedResources["focus"]],
  "monk-warrior-of-mercy-hand-of-ultimate-justice": [
    monkManagedResources.warriorOfMercyHandOfUltimateMercyUsesExpended,
    namedResources["focus"]
  ],
  "monk-warrior-of-shadow-shadow-arts-darkness": [namedResources["focus"]],
  "monk-warrior-of-shadow-cloak-of-shadow": [namedResources["focus"]],
  "monk-warrior-of-the-elements-elemental-attunement": [namedResources["focus"]],
  "monk-warrior-of-the-elements-elemental-burst": [namedResources["focus"]],
  "monk-warrior-of-the-open-hand-wholeness-of-body": [
    monkManagedResources.warriorOfTheOpenHandWholenessOfBodyUsesExpended
  ]
};
