import { namedResources } from "../../managedClassResources";
import type { ResourceManagementTarget } from "../../resourceManagement";
import { classCounterResource } from "../../resourceManagement";
import { getInnateSorceryUsesRemaining, getInnateSorceryUsesTotal } from "./sorcerer";
import { sorcererSubclassResources } from "./subclasses/resourceManagement";

export const sorcererManagedResources = {
  ...sorcererSubclassResources,
  innateSorceryUsesExpended: classCounterResource(
    "sorcerer",
    "innateSorceryUsesExpended",
    "Innate Sorcery",
    getInnateSorceryUsesTotal,
    getInnateSorceryUsesRemaining
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const sorcererActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "sorcerer-innate-sorcery": [
    sorcererManagedResources.innateSorceryUsesExpended,
    namedResources["sorcery"]
  ],
  "sorcerer-aberrant-sorcery-revelation-in-flesh": [namedResources["sorcery"]],
  "sorcerer-aberrant-sorcery-warping-implosion": [
    sorcererManagedResources.warpingImplosionUsesExpended,
    namedResources["sorcery"]
  ],
  "sorcerer-clockwork-sorcery-bastion-of-law": [namedResources["sorcery"]],
  "sorcerer-clockwork-sorcery-trance-of-order": [
    sorcererManagedResources.tranceOfOrderUsesExpended,
    namedResources["sorcery"]
  ],
  "sorcerer-clockwork-sorcery-clockwork-cavalcade": [
    sorcererManagedResources.clockworkCavalcadeUsesExpended,
    namedResources["sorcery"]
  ],
  "sorcerer-draconic-sorcery-dragon-wings": [
    sorcererManagedResources.dragonWingsUsesExpended,
    namedResources["sorcery"]
  ],
  "sorcerer-beasts-of-ill-omen": [namedResources["sorcery"]],
  "sorcerer-tides-of-chaos": [sorcererManagedResources.tidesOfChaosUsesExpended]
};
