import clsx from "clsx";
import { useId, useState, type ChangeEvent } from "react";
import { CLASS_FEATURE, FEATS, type SpellDescriptionEntry } from "../../../../../codex/entries";
import ActionButton from "../../../../ActionButton";
import CellContainer from "../../../../CellContainer/CellContainer";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import NumberInput from "../../../FormInputs/NumberInput";
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
import { getAbilityModifierForCharacter } from "../../../../../pages/CharactersPage/abilities";
import {
  createFeatureSourcedDescriptionEntries,
  createSourcedDescriptionEntries
} from "../../../../../pages/CharactersPage/actionModalDescriptions";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { getFeatureDescriptionForCharacter } from "../../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import { getFeatDefinition, getFeatLabel } from "../../../../../pages/CharactersPage/feats";
import { getAutomaticMaxHitPointsForCharacter } from "../../../../../pages/CharactersPage/gameplay";
import {
  getHitDieLabelForCharacter,
  getHitDieFormulaForClass,
  getHitDieMaximumForClass
} from "../../../../../pages/CharactersPage/hitDice";
import {
  formatFormulaBreakdown,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../../../pages/CharactersPage/shared/formulas";
import {
  getDwarvenToughnessDescriptionAddition,
  getDwarvenToughnessHitPointMaximumBonus
} from "../../../../../pages/CharactersPage/speciesDwarf";
import { getEffectiveHitPointMaximumForCharacter } from "../../../../../pages/CharactersPage/traits";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  createHpDraft,
  normalizeMaxHitPointsMode,
  type MaxHitPointsMode
} from "../gameplayStateUtils";
import { applyHitPointEditToCharacter } from "../hitPointState";
import styles from "./HitPointsEditModal.module.css";

type HitPointsEditModalProps = {
  character: Character;
  onClose: () => void;
  onPersistCharacter: PersistCharacterUpdater;
};

const MAX_HIT_POINTS = 9999;
const HIT_POINTS_MODAL_SUMMARY =
  "Level 1 uses your Hit Die maximum plus CON. Auto uses the rounded-up average plus CON after level 1. While in Manual mode you have to do the rolls yourself and simply edit the maximum HP to the value.";

function createInitialHpDraft(character: Character) {
  const mode = normalizeMaxHitPointsMode(character.maxHitPointsMode);

  return {
    ...createHpDraft(character),
    hitPoints:
      mode === "automatic" ? getAutomaticMaxHitPointsForCharacter(character) : character.hitPoints
  };
}

function formatHitPointFormulaContent({
  character,
  mode
}: {
  character: Character;
  mode: MaxHitPointsMode;
}): { content: string; breakdown: string } {
  const hitDieLabel = getHitDieLabelForCharacter(character);
  const hitDieFormula = getHitDieFormulaForClass(character.className);
  const hitDieMaximum = getHitDieMaximumForClass(character.className);
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
  const level = Math.max(1, Math.floor(character.level));
  const laterLevelCount = Math.max(0, level - 1);
  const constitutionTerm = formatSignedFormulaTerm(constitutionModifier, "CON");
  const minimumBaseHitPoints = Math.max(
    1,
    hitDieMaximum + constitutionModifier + laterLevelCount * (1 + constitutionModifier)
  );
  const maximumBaseHitPoints = Math.max(
    1,
    hitDieMaximum + constitutionModifier + laterLevelCount * (hitDieMaximum + constitutionModifier)
  );
  const formula = formatFormulaTerms([
    `${hitDieMaximum} (${hitDieLabel})`,
    constitutionTerm,
    `+ ${laterLevelCount} × (${hitDieFormula} ${constitutionTerm})`
  ]);
  const breakdown =
    mode === "automatic"
      ? (formatFormulaBreakdown([`${getAutomaticMaxHitPointsForCharacter(character)} Base HP`]) ??
        "")
      : "Roll yourself";

  return {
    content: `${minimumBaseHitPoints}~${maximumBaseHitPoints} MAX HP = ${formula}`,
    breakdown
  };
}

function characterHasFeat(character: Character, feat: FEATS): boolean {
  return Boolean(character.feats?.some((entry) => entry.feat === feat));
}

function getFeatHitPointDescriptionAddition(feat: FEATS): SpellDescriptionEntry[] {
  const description = getFeatDefinition(feat)?.description ?? [];
  const hitPointDescription = description.filter(
    (entry): entry is string => typeof entry === "string" && entry.includes("Hit Point maximum")
  );

  return createSourcedDescriptionEntries(
    getFeatLabel(feat),
    hitPointDescription.length > 0 ? hitPointDescription : description
  );
}

function getHitPointAdditionalDescription(character: Character): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];
  const draconicResilienceDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.DRACONIC_RESILIENCE
  );

  if (draconicResilienceDescription.length > 0) {
    descriptionAdditions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.DRACONIC_RESILIENCE,
        draconicResilienceDescription,
        "Draconic Resilience"
      )
    );
  }

  if (getDwarvenToughnessHitPointMaximumBonus(character) > 0) {
    descriptionAdditions.push(getDwarvenToughnessDescriptionAddition());
  }

  if (characterHasFeat(character, FEATS.TOUGH)) {
    descriptionAdditions.push(getFeatHitPointDescriptionAddition(FEATS.TOUGH));
  }

  if (characterHasFeat(character, FEATS.BOON_OF_FORTITUDE)) {
    descriptionAdditions.push(getFeatHitPointDescriptionAddition(FEATS.BOON_OF_FORTITUDE));
  }

  return descriptionAdditions.filter((description) => description.length > 0);
}

function HitPointsEditModal({ character, onClose, onPersistCharacter }: HitPointsEditModalProps) {
  const titleId = useId().replace(/:/g, "");
  const [hpDraft, setHpDraft] = useState(() => createInitialHpDraft(character));
  const [hpModeDraft, setHpModeDraft] = useState<MaxHitPointsMode>(() =>
    normalizeMaxHitPointsMode(character.maxHitPointsMode)
  );
  const actualMaxHitPoints = getEffectiveHitPointMaximumForCharacter({
    ...character,
    hitPoints: hpDraft.hitPoints
  });
  const formulaCell = formatHitPointFormulaContent({
    character,
    mode: hpModeDraft
  });
  const additionalDescription = getHitPointAdditionalDescription(character);

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
        <div className={styles.modeSwitch} role="group" aria-label="Max HP mode">
          <button
            type="button"
            className={clsx(
              styles.modeSwitchButton,
              hpModeDraft === "automatic" && styles.modeSwitchButtonActive
            )}
            onClick={() => setHitPointMode("automatic")}
            aria-pressed={hpModeDraft === "automatic"}
          >
            Auto
          </button>
          <button
            type="button"
            className={clsx(
              styles.modeSwitchButton,
              hpModeDraft === "custom" && styles.modeSwitchButtonActive
            )}
            onClick={() => setHitPointMode("custom")}
            aria-pressed={hpModeDraft === "custom"}
          >
            Manual
          </button>
        </div>

        <CellContainer
          label="Max HP Formula"
          content={formulaCell.content}
          breakdown={formulaCell.breakdown}
          contentClassName={styles.formulaContent}
          breakdownClassName={styles.formulaBreakdown}
        />

        {additionalDescription.length > 0 ? (
          <div className={styles.additionalDescription}>
            {additionalDescription.map((description, index) => (
              <DescriptionContent
                key={index}
                description={description}
                className={styles.additionalDescriptionSection}
                entryClassName={sheetStyles.spellDrawerDescriptionLine}
                strongClassName={sheetStyles.spellDrawerDescriptionStrong}
              />
            ))}
          </div>
        ) : null}

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Max Base HP</span>
            <NumberInput
              min={1}
              max={MAX_HIT_POINTS}
              disabled={hpModeDraft === "automatic"}
              value={hpDraft.hitPoints}
              onChange={updateHitPointDraftValue}
            />
          </label>
          <label className={styles.field}>
            <span>Actual Max HP</span>
            <NumberInput
              min={1}
              max={Math.max(MAX_HIT_POINTS, actualMaxHitPoints)}
              disabled
              value={actualMaxHitPoints}
            />
          </label>
          <label className={styles.field}>
            <span>Current HP</span>
            <NumberInput
              min={0}
              max={actualMaxHitPoints}
              value={hpDraft.currentHitPoints}
              onChange={updateCurrentHitPointDraftValue}
            />
          </label>
        </div>
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton variant="GHOST" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton onClick={saveHitPoints}>Save</ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default HitPointsEditModal;
