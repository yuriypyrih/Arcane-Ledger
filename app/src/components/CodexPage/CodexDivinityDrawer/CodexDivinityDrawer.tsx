import SpellDescriptionContent from "../../SpellDescriptionContent";
import type { DivinityEntry } from "../../../codex/entries";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayDetailCard,
  OverlayDetailLabel,
  OverlayDetailsGrid,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../Overlay";
import { getClericResolvedDivinityDisplay } from "../../../pages/CharactersPage/classFeatures/cleric";
import type { Character } from "../../../types";
import {
  formatCodexLabel,
  formatDivinitySubtitle,
  formatDivinityValue,
  formatSpellCastingTime
} from "../../../utils/codex";

type CodexDivinityDrawerProps = {
  divinity: DivinityEntry;
  character?: Pick<Character, "className" | "level" | "abilities" | "feats">;
  onClose: () => void;
};

function CodexDivinityDrawer({ divinity, character, onClose }: CodexDivinityDrawerProps) {
  const resolvedDisplay = character
    ? getClericResolvedDivinityDisplay(character, divinity)
    : {
        damage: divinity.damage ?? null,
        healing: divinity.healing ?? null,
        description: divinity.description
      };
  const primaryValue = resolvedDisplay.damage ?? resolvedDisplay.healing;

  return (
    <SheetDrawer titleId="codex-divinity-drawer-title" onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>{formatCodexLabel("DIVINITY")}</OverlayBadge>
          <OverlayTitleRow>
            <h3 id="codex-divinity-drawer-title">{divinity.name}</h3>
          </OverlayTitleRow>
          <OverlaySummary>{formatDivinitySubtitle(divinity)}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close divinity details" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody>
        <OverlayDetailsGrid>
          <OverlayDetailCard>
            <OverlayDetailLabel>Casting Time</OverlayDetailLabel>
            <strong>{formatSpellCastingTime(divinity.castingTime)}</strong>
          </OverlayDetailCard>
          <OverlayDetailCard>
            <OverlayDetailLabel>Range</OverlayDetailLabel>
            <strong>{divinity.range}</strong>
          </OverlayDetailCard>
          <OverlayDetailCard>
            <OverlayDetailLabel>Duration</OverlayDetailLabel>
            <strong>{divinity.duration}</strong>
          </OverlayDetailCard>
          <OverlayDetailCard>
            <OverlayDetailLabel>Damage</OverlayDetailLabel>
            <strong>{primaryValue ? formatDivinityValue(primaryValue) : "-"}</strong>
          </OverlayDetailCard>
        </OverlayDetailsGrid>

        <SpellDescriptionContent
          description={resolvedDisplay.description}
          className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
          entryClassName={overlayClassNames.descriptionLine}
        />
      </OverlayBody>
    </SheetDrawer>
  );
}

export default CodexDivinityDrawer;
