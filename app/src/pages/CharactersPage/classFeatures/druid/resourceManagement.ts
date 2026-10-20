import { namedResources } from "../../managedClassResources";
import type { ResourceManagementTarget } from "../../resourceManagement";
import { spellSlotResource } from "../../resourceManagement";
import { druidSubclassResources } from "./subclasses/resourceManagement";

export const druidManagedResources = {
  ...druidSubclassResources
};

/** Resource identities are explicit; presentation labels are never used for routing. */
export const druidActionResources: Record<string, readonly ResourceManagementTarget[]> = {
  "druid-wild-shape": [namedResources["wild-shape"]],
  "druid-wild-companion": [namedResources["wild-shape"], spellSlotResource(1)],
  "druid-wild-resurgence": [namedResources["wild-shape"], spellSlotResource(1, 1)],
  "druid-nature-magician": [namedResources["wild-shape"]],
  "druid-lands-aid": [namedResources["wild-shape"]],
  "druid-natures-sanctuary": [namedResources["wild-shape"]],
  "druid-wrath-of-the-sea": [namedResources["wild-shape"]],
  "druid-starry-form": [namedResources["wild-shape"]],
  "druid-moonlight-step": [druidManagedResources.moonlightStepUsesExpended, spellSlotResource(2)]
};
