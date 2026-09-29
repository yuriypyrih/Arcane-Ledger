import { useState } from "react";
import type { DivinityEntry, SpellEntry } from "../../codex/entries";
import type { FEATS } from "../../codex/entries/enums";
import type { ResolvedKeywordReference } from "../../utils/codex/renderCodexRichText";

export function useNestedReferences() {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<{
    feat: FEATS;
    label: string;
  } | null>(null);
  function closeTopReference() {
    if (selectedFeatReference) setSelectedFeatReference(null);
    else if (selectedKeyword) setSelectedKeyword(null);
    else if (selectedDivinityReference) setSelectedDivinityReference(null);
    else if (selectedSpellReference) setSelectedSpellReference(null);
    else return false;
    return true;
  }
  return {
    selectedSpellReference,
    setSelectedSpellReference,
    selectedDivinityReference,
    setSelectedDivinityReference,
    selectedKeyword,
    setSelectedKeyword,
    selectedFeatReference,
    setSelectedFeatReference,
    closeTopReference
  };
}
export type NestedReferenceState = ReturnType<typeof useNestedReferences>;
