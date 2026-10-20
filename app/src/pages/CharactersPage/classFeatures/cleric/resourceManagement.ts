import { CLASS_FEATURE } from "../../../../codex/entries/enums";
import type { ResourceManagementTarget } from "../../resourceManagement";
import { counterResource, spellSlotResource } from "../../resourceManagement";
import { clericChannelDivinityResource } from "../channelDivinityResource";
import { replaceClassFeatureState } from "../shared/resourceState";
import { getClericDivineInterventionUsesRemaining } from "./cleric";
import { hasClericFeature } from "./clericFeatureState";
import { clericSubclassResources } from "./subclasses/resourceManagement";

export const clericManagedResources = {
  ...clericSubclassResources,
  channelDivinityUsesExpended: clericChannelDivinityResource,
  divineIntervention: counterResource(
    "cleric:divineInterventionUsed",
    "Divine Intervention",
    (character) => Number(hasClericFeature(character, CLASS_FEATURE.DIVINE_INTERVENTION)),
    getClericDivineInterventionUsesRemaining,
    (character, expended) =>
      replaceClassFeatureState(character, "cleric", {
        ...character.classFeatureState?.cleric,
        divineInterventionUsed: expended > 0
      })
  )
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const clericActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "cleric-divine-intervention": [clericManagedResources.divineIntervention],
  "cleric-channel-divinity": [clericManagedResources.channelDivinityUsesExpended],
  "cleric-divine-foreknowledge": [
    clericManagedResources.divineForeknowledgeUsesExpended,
    spellSlotResource(6)
  ],
  "cleric-preserve-life": [clericManagedResources.channelDivinityUsesExpended],
  "cleric-radiance-of-the-dawn": [clericManagedResources.channelDivinityUsesExpended],
  "cleric-corona-of-light": [clericManagedResources.coronaOfLightUsesExpended],
  "cleric-war-priest": [clericManagedResources.warPriestUsesExpended],
  "cleric-invoke-duplicity": [clericManagedResources.channelDivinityUsesExpended],
  "cleric-path-to-the-grave": [clericManagedResources.channelDivinityUsesExpended],
  "cleric-keeper-of-souls": [clericManagedResources.keeperOfSoulsUsesExpended, spellSlotResource(4)]
};
