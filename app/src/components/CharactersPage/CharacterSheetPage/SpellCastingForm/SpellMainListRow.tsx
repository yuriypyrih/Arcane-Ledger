import { memo, useCallback } from "react";
import SpellListRow from "../../../SpellListRow";
import type { SpellEntry } from "../../../../codex/entries";
import type { SpellRowModel } from "./spellcastingListModel";

type SpellMainListRowProps = {
  row: SpellRowModel;
  onOpenSpellDetails: (spell: SpellEntry) => void;
};

function SpellMainListRow({ row, onOpenSpellDetails }: SpellMainListRowProps) {
  const openSpellDetails = useCallback(() => {
    onOpenSpellDetails(row.spell);
  }, [onOpenSpellDetails, row.spell]);

  return (
    <SpellListRow
      spell={row.spell}
      onClick={openSpellDetails}
      valueSummary={row.valueSummary}
      detailNote={row.detailNote}
      detailNoteTone={row.detailNoteTone}
      alwaysPrepared={row.alwaysPrepared}
      alwaysSpellbook={row.alwaysSpellbook}
      highlightTone={row.highlightTone}
      compactConcentrationDuration
      actionShapes={row.actionShapes}
    />
  );
}

export default memo(SpellMainListRow);
