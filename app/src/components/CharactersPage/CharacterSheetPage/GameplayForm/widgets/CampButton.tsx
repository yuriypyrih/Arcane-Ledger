import clsx from "clsx";
import { FlameKindling } from "lucide-react";
import { useId, useMemo, useState } from "react";
import ActionButton from "../../../../ActionButton";
import d20Icon from "../../../../../assets/svg/d20.svg";
import type { SpellDescriptionEntry } from "../../../../../codex/entries";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import CellContainer from "../../../../CellContainer/CellContainer";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import {
  getHitDiceRemainingForCharacter,
  getHitDieFormulaForClass
} from "../../../../../pages/CharactersPage/gameplay";
import { getAbilityModifierForCharacter } from "../../../../../pages/CharactersPage/abilities";
import { getEffectiveHitPointMaximumForCharacter } from "../../../../../pages/CharactersPage/traits";
import type { RestDescriptionInjectionSection } from "../../../../../pages/CharactersPage/classFeatures/restDescriptionInjections";
import {
  formatFormulaCell,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../../../pages/CharactersPage/shared/formulas";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../Overlay";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import RadioContainerOption from "../../RadioContainerOption";
import NumberInput from "../../../FormInputs/NumberInput";
import type { RestOption, RestType } from "./restOptions";
import { createLongRestOptions, createShortRestOptions } from "./restOptions";
import CampRestOption from "./CampRestOption";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import { applyRolledHealingToCharacter } from "../gameplayStateUtils";
import styles from "./CampButton.module.css";

type CampButtonProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
  additionalDescription?: SpellDescriptionEntry[];
  shortRestAdditionalDescription?: RestDescriptionInjectionSection[];
  longRestAdditionalDescription?: RestDescriptionInjectionSection[];
};

const primaryRestOptionIds = new Set([
  "reduce-exhaustion",
  "restore-half-hit-dice",
  "restore-hit-points",
  "reset-round-tracker",
  "update-statuses"
]);

function getGroupedRestOptions(options: RestOption[]) {
  const primaryOptions = options.filter((option) => primaryRestOptionIds.has(option.id));
  const secondaryOptions = options.filter(
    (option) => !primaryRestOptionIds.has(option.id) && option.emphasis !== "feature"
  );
  const featureOptions = options.filter((option) => option.emphasis === "feature");

  return {
    primaryOptions,
    secondaryOptions,
    featureOptions
  };
}

function isRestOptionDisabled(option: RestOption) {
  return option.emphasis === "feature" && option.disabled === true;
}

function getHitDiceBaseFormulaForCount(character: Character, count: number): string {
  const hitDieFormula = getHitDieFormulaForClass(character.className);
  const die = hitDieFormula.replace(/^1/i, "");

  return `${count}${die}`;
}

function appendFormulaModifier(formula: string, modifier: number): string {
  if (modifier === 0) {
    return formula;
  }

  return `${formula}${modifier > 0 ? "+" : "-"}${Math.abs(modifier)}`;
}

function getHitDiceFormulaForCount(character: Character, count: number): string {
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
  const modifierTotal = count * constitutionModifier;

  return appendFormulaModifier(getHitDiceBaseFormulaForCount(character, count), modifierTotal);
}

function getHitDiceFormulaDisplayForCount(character: Character, count: number): string {
  return formatFormulaTerms(getHitDiceFormulaDisplayTermsForCount(character, count));
}

function getHitDiceFormulaDisplayTermsForCount(character: Character, count: number): string[] {
  const baseFormula = getHitDiceBaseFormulaForCount(character, count);
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
  const modifierTotal = count * constitutionModifier;

  return [
    baseFormula,
    modifierTotal !== 0 ? formatSignedFormulaTerm(modifierTotal, "CON") : null
  ].filter((term): term is string => Boolean(term));
}

function getHitDieLabel(character: Character): string {
  return getHitDieFormulaForClass(character.className).replace(/^1/i, "").toUpperCase();
}

function getHitDiceHealingFormulaCell(character: Character, count: number) {
  if (count <= 0) {
    return {
      value: "0 Healing"
    };
  }

  return formatFormulaCell({
    formula: getHitDiceFormulaForCount(character, count),
    displayTerms: getHitDiceFormulaDisplayTermsForCount(character, count),
    resultLabel: "Healing"
  });
}

function CampButton({
  character,
  onPersistCharacter,
  additionalDescription,
  shortRestAdditionalDescription = [],
  longRestAdditionalDescription = []
}: CampButtonProps) {
  const titleId = useId().replace(/:/g, "");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRestType, setSelectedRestType] = useState<RestType | null>(null);
  const [selectedRestOptionIds, setSelectedRestOptionIds] = useState<string[]>([]);
  const [shortRestHitDiceCount, setShortRestHitDiceCount] = useState(0);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();
  const shortRestsUsedToday = clampNumber(character.shortRestsUsedToday, 0, 2, 0);
  const shortRestsRemaining = Math.max(0, 2 - shortRestsUsedToday);
  const totalHitDice = Math.max(1, Math.floor(character.level));
  const availableHitDice = getHitDiceRemainingForCharacter(character);
  const hitDieLabel = getHitDieLabel(character);
  const effectiveHitPointMaximum = getEffectiveHitPointMaximumForCharacter(character);
  const shortRestOptions = useMemo(() => createShortRestOptions(character), [character]);
  const longRestOptions = useMemo(() => createLongRestOptions(character), [character]);
  const normalizedShortRestHitDiceCount = Math.min(
    availableHitDice,
    Math.max(0, Math.floor(shortRestHitDiceCount))
  );
  const hitDiceHealingFormulaCell = getHitDiceHealingFormulaCell(
    character,
    normalizedShortRestHitDiceCount
  );
  const selectedRestAdditionalDescription =
    selectedRestType === "short"
      ? shortRestAdditionalDescription.length > 0
        ? shortRestAdditionalDescription
        : additionalDescription
          ? [additionalDescription]
          : []
      : selectedRestType === "long"
        ? longRestAdditionalDescription.length > 0
          ? longRestAdditionalDescription
          : additionalDescription
            ? [additionalDescription]
            : []
        : [];
  const selectedRestOptions = useMemo(
    () =>
      selectedRestType === "short"
        ? shortRestOptions
        : selectedRestType === "long"
          ? longRestOptions
          : [],
    [longRestOptions, selectedRestType, shortRestOptions]
  );
  const groupedRestOptions = useMemo(
    () => getGroupedRestOptions(selectedRestOptions),
    [selectedRestOptions]
  );

  useBodyScrollLock(isOpen);

  function openPopup() {
    setSelectedRestType(null);
    setSelectedRestOptionIds([]);
    setShortRestHitDiceCount(0);
    setIsOpen(true);
  }

  function closePopup() {
    setIsOpen(false);
    setSelectedRestType(null);
    setSelectedRestOptionIds([]);
    setShortRestHitDiceCount(0);
  }

  function selectRestType(restType: RestType) {
    if (restType === "short" && shortRestsRemaining <= 0) {
      return;
    }

    const nextOptions = restType === "short" ? shortRestOptions : longRestOptions;
    setSelectedRestType(restType);
    setShortRestHitDiceCount(0);
    setSelectedRestOptionIds(
      nextOptions
        .filter((option) => option.defaultSelected !== false && !isRestOptionDisabled(option))
        .map((option) => option.id)
    );
  }

  function toggleRestOption(optionId: string) {
    const selectedOption = selectedRestOptions.find((option) => option.id === optionId);

    if (selectedOption && isRestOptionDisabled(selectedOption)) {
      return;
    }

    setSelectedRestOptionIds((currentOptionIds) =>
      currentOptionIds.includes(optionId)
        ? currentOptionIds.filter((id) => id !== optionId)
        : [...currentOptionIds, optionId]
    );
  }

  function toggleAllRestOptions() {
    const selectableOptionIds = selectedRestOptions
      .filter((option) => option.defaultSelected !== false && !isRestOptionDisabled(option))
      .map((option) => option.id);

    setSelectedRestOptionIds((currentOptionIds) =>
      currentOptionIds.length > 0 ? [] : selectableOptionIds
    );
  }

  function confirmRest() {
    const restType = selectedRestType;

    if (!restType) {
      return;
    }

    if (restType === "short" && shortRestsRemaining <= 0) {
      return;
    }

    const hitDiceToSpend =
      restType === "short"
        ? Math.min(availableHitDice, Math.max(0, Math.floor(shortRestHitDiceCount)))
        : 0;

    onPersistCharacter((currentCharacter) => {
      const availableOptions =
        restType === "short"
          ? createShortRestOptions(currentCharacter)
          : createLongRestOptions(currentCharacter);
      const selectedOptionIdSet = new Set(selectedRestOptionIds);
      const restedCharacter = availableOptions.reduce((nextCharacter, option) => {
        if (!selectedOptionIdSet.has(option.id) || isRestOptionDisabled(option)) {
          return nextCharacter;
        }

        return option.apply(nextCharacter);
      }, currentCharacter);
      const currentHitDiceRemaining = getHitDiceRemainingForCharacter(restedCharacter);

      return {
        ...restedCharacter,
        hitDiceRemaining:
          restType === "short"
            ? Math.max(0, currentHitDiceRemaining - hitDiceToSpend)
            : restedCharacter.hitDiceRemaining,
        shortRestsUsedToday:
          restType === "short"
            ? clampNumber((restedCharacter.shortRestsUsedToday ?? 0) + 1, 0, 2, 0)
            : 0
      };
    });

    closePopup();

    if (restType === "short" && hitDiceToSpend > 0) {
      const formula = getHitDiceFormulaForCount(character, hitDiceToSpend);
      const formulaDisplay = getHitDiceFormulaDisplayForCount(character, hitDiceToSpend);

      openDiceRoller({
        title: "Short Rest Hit Dice",
        description: `Roll ${hitDiceToSpend} ${hitDieLabel} Hit Dice.`,
        formula,
        formulaDisplay,
        getFullManualToastText: ({ result }) => `Rolled ${result.total} Hit Dice healing.`,
        onResolvedResult: ({ result }) => {
          onPersistCharacter((currentCharacter) =>
            applyRolledHealingToCharacter(currentCharacter, result.total)
          );
        }
      });
    }
  }

  return (
    <>
      <button type="button" className={clsx(shared.editButton, styles.button)} onClick={openPopup}>
        <FlameKindling size={16} />
        Camp
      </button>

      {isOpen ? (
        <SheetModal titleId={titleId} onClose={closePopup} onEscape={closePopup} size="medium">
          <OverlayHeader>
            <OverlayHeaderContent>
              <OverlayEyebrow>Camp</OverlayEyebrow>
              <OverlayTitleRow>
                <OverlayTitle id={titleId}>Choose your rest</OverlayTitle>
              </OverlayTitleRow>
            </OverlayHeaderContent>
            <div className={styles.headerAside}>
              <span className={styles.resourceBadge}>
                <span className={styles.resourceBadgeLabel}>HP</span>
                <span className={styles.resourceBadgeValue}>
                  {character.currentHitPoints}/{effectiveHitPointMaximum}
                </span>
              </span>
              <span className={styles.resourceBadge}>
                <span className={styles.resourceBadgeLabel}>Hit Dice</span>
                <span className={styles.resourceBadgeValue}>
                  {hitDieLabel} {availableHitDice}/{totalHitDice}
                </span>
              </span>
              <OverlayCloseButton label="Close rest options" onClick={closePopup} />
            </div>
          </OverlayHeader>

          <OverlayBody className={styles.body}>
            <div className={styles.restOptionGrid} role="radiogroup" aria-label="Rest type">
              <RadioContainerOption
                name="camp-rest-type"
                header="Short Rest"
                selected={selectedRestType === "short"}
                onSelect={() => selectRestType("short")}
                disabled={shortRestsRemaining <= 0}
                breakdown="Spend Hit Dice and refresh Short Rest resources."
                aside={
                  <div
                    className={sheetStyles.shortRestDots}
                    aria-label={`${shortRestsRemaining} short rests remaining today`}
                  >
                    {Array.from({ length: 2 }, (_, index) => (
                      <span
                        key={index}
                        className={clsx(
                          sheetStyles.shortRestDot,
                          index < shortRestsRemaining && sheetStyles.shortRestDotActive
                        )}
                      />
                    ))}
                  </div>
                }
                className={styles.restTypeOption}
              />

              <RadioContainerOption
                name="camp-rest-type"
                header="Long Rest"
                selected={selectedRestType === "long"}
                onSelect={() => selectRestType("long")}
                breakdown="Restore full HP, half of Hit Dice, reset Short Rest charges, and refresh Long Rest resources."
                className={styles.restTypeOption}
              />
            </div>

            {selectedRestType ? (
              <>
                {selectedRestAdditionalDescription.length > 0 ? (
                  <div className={styles.additionalDescription}>
                    {selectedRestAdditionalDescription.map((description, index) => (
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

                <div className={styles.restChecklistSection}>
                  <div className={styles.restChecklistHeader}>
                    <p className={sheetStyles.restChecklistHeading}>
                      {selectedRestType === "short" ? "Short Rest Effects" : "Long Rest Effects"}
                    </p>
                    <button
                      type="button"
                      className={styles.restChecklistLink}
                      onClick={toggleAllRestOptions}
                    >
                      {selectedRestOptionIds.length > 0 ? "Unselect All" : "Select All"}
                    </button>
                  </div>
                  <div className={sheetStyles.restChecklist}>
                    {groupedRestOptions.primaryOptions.map((option) => (
                      <CampRestOption
                        key={option.id}
                        option={option}
                        selected={selectedRestOptionIds.includes(option.id)}
                        onToggle={toggleRestOption}
                      />
                    ))}
                    {groupedRestOptions.secondaryOptions.length > 0 ||
                    groupedRestOptions.featureOptions.length > 0 ? (
                      <div className={sheetStyles.restChecklistDivider} aria-hidden="true" />
                    ) : null}
                    {groupedRestOptions.secondaryOptions.map((option) => (
                      <CampRestOption
                        key={option.id}
                        option={option}
                        selected={selectedRestOptionIds.includes(option.id)}
                        onToggle={toggleRestOption}
                      />
                    ))}
                    {groupedRestOptions.featureOptions.map((option) => (
                      <CampRestOption
                        key={option.id}
                        option={option}
                        selected={selectedRestOptionIds.includes(option.id)}
                        onToggle={toggleRestOption}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {selectedRestType === "short" ? (
              <div className={styles.hitDiceControlRow}>
                <label className={styles.hitDiceInputLabel}>
                  <span>Hit Dice</span>
                  <NumberInput
                    className={styles.hitDiceInput}
                    value={normalizedShortRestHitDiceCount}
                    min={0}
                    max={availableHitDice}
                    step={1}
                    onChange={(event) =>
                      setShortRestHitDiceCount(
                        clampNumber(event.currentTarget.valueAsNumber, 0, availableHitDice, 0)
                      )
                    }
                    aria-label="Hit Dice to spend"
                  />
                </label>
                <CellContainer
                  label="Healing Formula"
                  content={hitDiceHealingFormulaCell.value}
                  breakdown={hitDiceHealingFormulaCell.breakdown}
                  className={styles.hitDiceFormulaCell}
                />
              </div>
            ) : null}
          </OverlayBody>

          {selectedRestType ? (
            <OverlayFooter className={styles.footer}>
              <div className={styles.footerActions}>
                <ActionButton
                  className={styles.restButton}
                  onClick={confirmRest}
                  disabled={!selectedRestType}
                  icon={
                    selectedRestType === "short" ? (
                      <img src={d20Icon} alt="" className={styles.restButtonIcon} />
                    ) : undefined
                  }
                  fullWidth
                >
                  Rest
                </ActionButton>
                {selectedRestType === "short" ? (
                  <DiceRollerSettingsButton
                    actionName="Short Rest Hit Dice"
                    ariaLabel="Open short rest dice settings"
                  />
                ) : null}
              </div>
            </OverlayFooter>
          ) : null}
        </SheetModal>
      ) : null}
      {diceRollerPopup}
    </>
  );
}

export default CampButton;
