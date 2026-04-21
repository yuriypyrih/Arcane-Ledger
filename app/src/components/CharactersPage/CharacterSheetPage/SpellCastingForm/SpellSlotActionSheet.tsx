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
      actions={[
        {
          label: "Use 1",
          onClick: onUseSlot,
          disabled: !hasSlots || remainingSlots <= 0,
          ariaLabel: `Use 1 level ${slotLevel} spell slot`
        },
        {
          label: "Reset 1",
          onClick: onResetSlot,
          disabled: expendedSlots <= 0,
          ariaLabel: `Reset 1 level ${slotLevel} spell slot`
        },
        {
          label: "Reset All",
          onClick: onResetAll,
          disabled: expendedSlots <= 0,
          ariaLabel: `Reset all level ${slotLevel} spell slots`
        }
      ]}
    />
  );
}

export default SpellSlotActionSheet;
