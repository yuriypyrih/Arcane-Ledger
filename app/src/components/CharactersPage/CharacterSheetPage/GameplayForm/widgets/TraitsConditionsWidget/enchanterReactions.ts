import { createChargesHeaderTag } from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { wizardManagedResources } from "../../../../../../pages/CharactersPage/classFeatures/wizard/resourceManagement";
import {
  activateInstinctiveCharm,
  getInstinctiveCharmFacts,
  getInstinctiveCharmUsesRemaining,
  instinctiveCharmReactionId
} from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardEnchanterInstinctiveCharm";
import type { ReactionDescriptor } from "./reactionDescriptors";

export const instinctiveCharmReaction: ReactionDescriptor = {
  id: instinctiveCharmReactionId,
  getResourceWarning: ({ character }) =>
    getInstinctiveCharmUsesRemaining(character) <= 0
      ? "No Instinctive Charm charge remaining."
      : null,
  getHeaderTags: ({ character }) => [
    createChargesHeaderTag(
      getInstinctiveCharmUsesRemaining(character),
      1,
      undefined,
      wizardManagedResources.instinctiveCharmUsesExpended
    )
  ],
  getFacts: ({ character }) => getInstinctiveCharmFacts(character),
  apply: activateInstinctiveCharm,
  skipReactionWhenUnchanged: true
};
