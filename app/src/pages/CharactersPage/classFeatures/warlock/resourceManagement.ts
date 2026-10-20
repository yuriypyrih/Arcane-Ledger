import type { ResourceManagementTarget } from "../../resourceManagement";
import { classCounterResource, spellSlotResource } from "../../resourceManagement";
import { warlockSubclassResources } from "./subclasses/resourceManagement";
import {
  getContactPatronUsesRemaining,
  getContactPatronUsesTotal,
  getWarlockGiftOfTheDepthsUsesRemaining,
  getWarlockGiftOfTheDepthsUsesTotal,
  getWarlockMagicalCunningUsesRemaining,
  getWarlockMagicalCunningUsesTotal
} from "./warlock";

export const warlockManagedResources = {
  ...warlockSubclassResources,
  magicalCunningUsesExpended: classCounterResource(
    "warlock",
    "magicalCunningUsesExpended",
    "Magical Cunning",
    getWarlockMagicalCunningUsesTotal,
    getWarlockMagicalCunningUsesRemaining
  ),
  contactPatronUsesExpended: classCounterResource(
    "warlock",
    "contactPatronUsesExpended",
    "Contact Patron",
    getContactPatronUsesTotal,
    getContactPatronUsesRemaining
  ),
  giftOfTheDepthsUsesExpended: classCounterResource(
    "warlock",
    "giftOfTheDepthsUsesExpended",
    "Gift of the Depths",
    getWarlockGiftOfTheDepthsUsesTotal,
    getWarlockGiftOfTheDepthsUsesRemaining
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const warlockActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "warlock-fiend-patron-dark-ones-own-luck": [warlockManagedResources.darkOnesOwnLuckUsesExpended],
  "warlock-contact-patron": [warlockManagedResources.contactPatronUsesExpended],
  "warlock-magical-cunning": [warlockManagedResources.magicalCunningUsesExpended],
  "warlock-celestial-patron-healing-light": [warlockManagedResources.healingLightDiceExpended],
  "warlock-fiend-patron-hurl-through-hell": [
    warlockManagedResources.hurlThroughHellUsesExpended,
    spellSlotResource(1, undefined, "pact")
  ],
  "warlock-semblance-of-life": [warlockManagedResources.semblanceOfLifeUsesExpended],
  "warlock-undead-form-of-dread": [warlockManagedResources.formOfDreadUsesExpended],
  "warlock-vestige-recovery": [
    warlockManagedResources.vestigeRecoveryUsesExpended,
    spellSlotResource(1, undefined, "pact")
  ],
  "warlock-gift-of-the-depths": [warlockManagedResources.giftOfTheDepthsUsesExpended]
};
