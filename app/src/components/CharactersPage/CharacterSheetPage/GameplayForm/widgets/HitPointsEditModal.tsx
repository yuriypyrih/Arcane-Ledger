import { useId, useState, type ChangeEvent } from "react";
import ActionButton from "../../../../ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../Overlay";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { getAutomaticMaxHitPointsForCharacter } from "../../../../../pages/CharactersPage/gameplay";
import { getEffectiveHitPointMaximumForCharacter } from "../../../../../pages/CharactersPage/traits";
import {
  createHpDraft,
  normalizeMaxHitPointsMode,
  type MaxHitPointsMode
} from "../gameplayStateUtils";
import { applyHitPointEditToCharacter } from "../hitPointState";
import HitPointsEditorContent, {
  HIT_POINTS_MODAL_SUMMARY,
  MAX_HIT_POINTS
} from "./HitPointsEditorContent";
import styles from "./HitPointsEditModal.module.css";

type HitPointsEditModalProps = {
  character: Character;
  onClose: () => void;
  onPersistCharacter: PersistCharacterUpdater;
};

function createInitialHpDraft(character: Character) {
  const mode = normalizeMaxHitPointsMode(character.maxHitPointsMode);

  return {
    ...createHpDraft(character),
    hitPoints:
      mode === "automatic" ? getAutomaticMaxHitPointsForCharacter(character) : character.hitPoints
  };
}

function HitPointsEditModal({ character, onClose, onPersistCharacter }: HitPointsEditModalProps) {
  const titleId = useId().replace(/:/g, "");
  const [hpDraft, setHpDraft] = useState(() => createInitialHpDraft(character));
  const [hpModeDraft, setHpModeDraft] = useState<MaxHitPointsMode>(() =>
    normalizeMaxHitPointsMode(character.maxHitPointsMode)
  );
  function setHitPointMode(nextMode: MaxHitPointsMode) {
    setHpModeDraft(nextMode);

    if (nextMode !== "automatic") {
      return;
    }

    const automaticHitPoints = getAutomaticMaxHitPointsForCharacter(character);
    const automaticEffectiveHitPoints = getEffectiveHitPointMaximumForCharacter({
      ...character,
      hitPoints: automaticHitPoints
    });

    setHpDraft((currentDraft) => ({
      hitPoints: automaticHitPoints,
      currentHitPoints: clampNumber(
        currentDraft.currentHitPoints,
        0,
        automaticEffectiveHitPoints,
        currentDraft.currentHitPoints
      )
    }));
  }

  function updateHitPointDraftValue(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setHpDraft((current) => {
      const nextBaseHitPoints = clampNumber(value, 1, MAX_HIT_POINTS, current.hitPoints);
      const nextActualMaxHitPoints = getEffectiveHitPointMaximumForCharacter({
        ...character,
        hitPoints: nextBaseHitPoints
      });

      return {
        hitPoints: nextBaseHitPoints,
        currentHitPoints: clampNumber(
          current.currentHitPoints,
          0,
          nextActualMaxHitPoints,
          current.currentHitPoints
        )
      };
    });
  }

  function updateCurrentHitPointDraftValue(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setHpDraft((current) => {
      const currentEffectiveHitPoints = getEffectiveHitPointMaximumForCharacter({
        ...character,
        hitPoints: current.hitPoints
      });

      return {
        ...current,
        currentHitPoints: clampNumber(value, 0, currentEffectiveHitPoints, current.currentHitPoints)
      };
    });
  }

  function saveHitPoints() {
    const nextBaseHitPoints =
      hpModeDraft === "automatic"
        ? getAutomaticMaxHitPointsForCharacter(character)
        : clampNumber(hpDraft.hitPoints, 1, MAX_HIT_POINTS, character.hitPoints);
    const nextEffectiveHitPoints = getEffectiveHitPointMaximumForCharacter({
      ...character,
      hitPoints: nextBaseHitPoints
    });
    const nextCurrentHitPoints = clampNumber(
      hpDraft.currentHitPoints,
      0,
      nextEffectiveHitPoints,
      character.currentHitPoints
    );

    onPersistCharacter((currentCharacter) =>
      applyHitPointEditToCharacter(currentCharacter, {
        hitPoints: nextBaseHitPoints,
        currentHitPoints: nextCurrentHitPoints,
        maxHitPointsMode: hpModeDraft
      })
    );

    onClose();
  }

  return (
    <SheetModal titleId={titleId} onClose={onClose} size="small">
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>Hit Points</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary>{HIT_POINTS_MODAL_SUMMARY}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close hit points editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <HitPointsEditorContent
          character={character}
          mode={hpModeDraft}
          hitPoints={hpDraft.hitPoints}
          currentHitPoints={hpDraft.currentHitPoints}
          onSetMode={setHitPointMode}
          onHitPointsChange={updateHitPointDraftValue}
          onCurrentHitPointsChange={updateCurrentHitPointDraftValue}
        />
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton variant="OUTLINE" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton onClick={saveHitPoints}>Save</ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default HitPointsEditModal;
