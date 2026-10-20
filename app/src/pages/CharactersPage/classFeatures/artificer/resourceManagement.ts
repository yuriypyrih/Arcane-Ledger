import type { ResourceManagementTarget } from "../../resourceManagement";
import { classCounterResource, spellSlotResource } from "../../resourceManagement";
import {
  getArtificerMagicItemTinkerDrainUsesRemaining,
  getArtificerMagicItemTinkerDrainUsesTotal,
  getArtificerMagicItemTinkerTransmuteUsesRemaining,
  getArtificerMagicItemTinkerTransmuteUsesTotal
} from "./magicItemTinker";
import { artificerSubclassResources } from "./subclasses/resourceManagement";
import {
  getArtificerTinkersMagicUsesRemaining,
  getArtificerTinkersMagicUsesTotal
} from "./tinkersMagic";

export const artificerManagedResources = {
  ...artificerSubclassResources,
  magicItemTinkerDrainUsesExpended: classCounterResource(
    "artificer",
    "magicItemTinkerDrainUsesExpended",
    "Magic Item Tinker Drain",
    getArtificerMagicItemTinkerDrainUsesTotal,
    getArtificerMagicItemTinkerDrainUsesRemaining
  ),
  magicItemTinkerTransmuteUsesExpended: classCounterResource(
    "artificer",
    "magicItemTinkerTransmuteUsesExpended",
    "Magic Item Tinker Transmute",
    getArtificerMagicItemTinkerTransmuteUsesTotal,
    getArtificerMagicItemTinkerTransmuteUsesRemaining
  ),
  tinkersMagicUsesExpended: classCounterResource(
    "artificer",
    "tinkersMagicUsesExpended",
    "Tinkers Magic",
    getArtificerTinkersMagicUsesTotal,
    getArtificerTinkersMagicUsesRemaining
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const artificerActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "artificer-drain-magic-item": [artificerManagedResources.magicItemTinkerDrainUsesExpended],
  "artificer-transmute-magic-item": [
    artificerManagedResources.magicItemTinkerTransmuteUsesExpended
  ],
  "artificer-conjured-cauldron": [artificerManagedResources.conjuredCauldronUsesExpended],
  "artificer-restorative-reagents": [artificerManagedResources.restorativeReagentsUsesExpended],
  "artificer-armorer-giant-stature": [artificerManagedResources.armorerGiantStatureUsesExpended],
  "artificer-armorer-infiltrators-flight": [
    artificerManagedResources.armorerInfiltratorsFlightUsesExpended
  ],
  "artificer-artillerist-eldritch-cannon": [
    artificerManagedResources.artilleristEldritchCannonUsesExpended,
    spellSlotResource(1)
  ],
  "artificer-battle-smith-arcane-jolt": [
    artificerManagedResources.battleSmithArcaneJoltUsesExpended
  ],
  "artificer-illuminated-cartography": [
    artificerManagedResources.illuminatedCartographyUsesExpended
  ],
  "artificer-unerring-path": [artificerManagedResources.unerringPathUsesExpended],
  "artificer-reanimator-reanimated-companion": [
    artificerManagedResources.reanimatorCompanionUsesExpended,
    spellSlotResource(1)
  ],
  "artificer-reanimator-facilitated-revival": [
    artificerManagedResources.facilitatedRevivalUsesExpended
  ],
  "artificer-tinkers-magic": [artificerManagedResources.tinkersMagicUsesExpended]
};
