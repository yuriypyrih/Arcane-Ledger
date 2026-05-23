import ResourceManagementModal from "../ResourceManagementModal";

type SpellSlotActionSheetProps = {
  slotLevel: number;
  totalSlots: number;
  expendedSlots: number;
  onClose: () => void;
  onResetSlot: () => void;
  onUseSlot: () => void;
  onResetAll: () => void;
  onIncreaseMaximum?: () => void;
  onDecreaseMaximum?: () => void;
  maximumSlotLimit?: number;
};

function SpellSlotActionSheet({
  slotLevel,
  totalSlots,
  expendedSlots,
  onClose,
  onResetSlot,
  onUseSlot,
  onResetAll,
  onIncreaseMaximum,
  onDecreaseMaximum,
  maximumSlotLimit
}: SpellSlotActionSheetProps) {
  const remainingSlots = Math.max(0, totalSlots - expendedSlots);
  const hasSlots = totalSlots > 0;
  const supportsMaximumManagement = onIncreaseMaximum || onDecreaseMaximum;
  const isMaximumSlotLimitReached =
    maximumSlotLimit !== undefined && totalSlots >= maximumSlotLimit;

  return (
    <ResourceManagementModal
      titleId="spell-slot-actions-title"
      title={`Level ${slotLevel} Spell Slots ${remainingSlots}/${totalSlots}`}
      closeLabel={`Close level ${slotLevel} spell slot management`}
      onClose={onClose}
      columnCount={supportsMaximumManagement ? 3 : undefined}
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
        },
        ...(onIncreaseMaximum
          ? [
              {
                label: "Max +1",
                onClick: onIncreaseMaximum,
                disabled: isMaximumSlotLimitReached,
                keepOpen: true,
                ariaLabel: `Increase maximum level ${slotLevel} spell slots by 1`
              }
            ]
          : []),
        ...(onDecreaseMaximum
          ? [
              {
                label: "Max -1",
                onClick: onDecreaseMaximum,
                disabled: totalSlots <= 0,
                keepOpen: true,
                ariaLabel: `Decrease maximum level ${slotLevel} spell slots by 1`
              }
            ]
          : [])
      ]}
    />
  );
}

export default SpellSlotActionSheet;
