import ResourceManagementModal from "../ResourceManagementModal";

type SpellSlotActionSheetProps = {
  slotLevel: number;
  totalSlots: number;
  expendedSlots: number;
  onClose: () => void;
  onResetSlot: () => void;
  onUseSlot: () => void;
  onResetAll: () => void;
};

function SpellSlotActionSheet({
  slotLevel,
  totalSlots,
  expendedSlots,
  onClose,
  onResetSlot,
  onUseSlot,
  onResetAll
}: SpellSlotActionSheetProps) {
  const remainingSlots = Math.max(0, totalSlots - expendedSlots);
  const hasSlots = totalSlots > 0;

  return (
    <ResourceManagementModal
      titleId="spell-slot-actions-title"
      title={`Level ${slotLevel} Spell Slots ${remainingSlots}/${totalSlots}`}
      closeLabel={`Close level ${slotLevel} spell slot management`}
      onClose={onClose}
      onUseOne={onUseSlot}
      onResetOne={onResetSlot}
      onResetAll={onResetAll}
      useOneDisabled={!hasSlots || remainingSlots <= 0}
      resetOneDisabled={expendedSlots <= 0}
      resetAllDisabled={expendedSlots <= 0}
    />
  );
}

export default SpellSlotActionSheet;
