import { useMemo } from "react";
import { getSpellEntryById } from "../../../../codex/spells";
import type { SpellEntry } from "../../../../codex/entries";
import SpellListRow from "../../../SpellListRow";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import type { SelectedInventoryStoredSpellState } from "./EquipmentStoredSpellDrawer";
import styles from "./EquipmentForm.module.css";

type EquipmentStoredSpellsLocation = Omit<SelectedInventoryStoredSpellState, "spellId">;

type EquipmentStoredSpellsModalProps = EquipmentStoredSpellsLocation & {
  itemName: string;
  spellIds: string[];
  isSpellDrawerOpen?: boolean;
  onClose: () => void;
  onOpenSpell: (state: SelectedInventoryStoredSpellState) => void;
  backdropClassName?: string;
};

function getStoredSpellEntries(spellIds: string[]): SpellEntry[] {
  return spellIds
    .map((spellId) => getSpellEntryById(spellId) ?? null)
    .filter((spell): spell is SpellEntry => spell !== null);
}

function EquipmentStoredSpellsModal({
  itemName,
  spellIds,
  isSpellDrawerOpen = false,
  source,
  stackId,
  containerStackId,
  contentIndex,
  onClose,
  onOpenSpell,
  backdropClassName
}: EquipmentStoredSpellsModalProps) {
  const spells = useMemo(() => getStoredSpellEntries(spellIds), [spellIds]);

  function openSpell(spellId: string) {
    onOpenSpell({
      spellId,
      source,
      stackId,
      containerStackId,
      contentIndex
    });
  }

  return (
    <SheetModal
      titleId="equipment-stored-spells-modal-title"
      onClose={onClose}
      onEscape={isSpellDrawerOpen ? () => undefined : onClose}
      size="medium"
      backdropClassName={backdropClassName}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>{itemName}</OverlayEyebrow>
          <OverlayTitle id="equipment-stored-spells-modal-title">Stored spells</OverlayTitle>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close stored spells modal" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.equipmentStoredSpellsModalBody}>
        <div className={styles.equipmentStoredSpellsList}>
          {spells.map((spell) => (
            <SpellListRow
              key={spell.id}
              spell={spell}
              onClick={() => openSpell(spell.id)}
              compactConcentrationDuration
            />
          ))}
        </div>
      </OverlayBody>
    </SheetModal>
  );
}

export default EquipmentStoredSpellsModal;
