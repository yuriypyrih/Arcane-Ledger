import {
  activateExtinguishUndead,
  activateHarvestUndead,
  extinguishUndeadReactionId,
  getExtinguishUndeadSlotOptions,
  getHarvestUndeadBlockedReason,
  harvestUndeadReactionId
} from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardNecromancerDeathMaster";
import { getClassLevel } from "../../../../../../pages/CharactersPage/multiclassState";
import SelectInput from "../../../../FormInputs/SelectInput";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import type { ReactionDescriptor } from "./reactionDescriptors";

export const harvestUndeadReaction: ReactionDescriptor = {
  id: harvestUndeadReactionId,
  getSelectionWarning: ({ character }) => getHarvestUndeadBlockedReason(character),
  getFacts: ({ character }) => [
    { label: "Healing", value: `${getClassLevel(character, "Wizard")} HP` }
  ],
  apply: activateHarvestUndead,
  skipReactionWhenUnchanged: true
};

export const extinguishUndeadReaction: ReactionDescriptor = {
  id: extinguishUndeadReactionId,
  getResourceWarning: ({ character, selectedExtinguishUndeadSlotId }) => {
    const slots = getExtinguishUndeadSlotOptions(character);
    return slots.length === 0
      ? "No level 5 or higher spell slots remaining."
      : !slots.some((slot) => slot.id === selectedExtinguishUndeadSlotId)
        ? "Select a level 5 or higher spell slot."
        : null;
  },
  renderCustomContent: ({
    character,
    selectedExtinguishUndeadSlotId,
    setSelectedExtinguishUndeadSlotId
  }) => {
    const slots = getExtinguishUndeadSlotOptions(character);
    return (
      <label className={shared.field}>
        <span className={shared.fieldLabel}>Spell Slot</span>
        <SelectInput
          value={
            slots.some((slot) => slot.id === selectedExtinguishUndeadSlotId)
              ? selectedExtinguishUndeadSlotId
              : ""
          }
          onChange={(event) => setSelectedExtinguishUndeadSlotId(event.target.value)}
        >
          <option value="">Select a spell slot</option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {`Level ${slot.level} (${slot.remaining} remaining)${slot.poolId === "standard" ? "" : ` — ${slot.label}`}`}
            </option>
          ))}
        </SelectInput>
      </label>
    );
  },
  apply: (character, context) =>
    activateExtinguishUndead(character, context.selectedExtinguishUndeadSlotId),
  skipReactionWhenUnchanged: true
};
