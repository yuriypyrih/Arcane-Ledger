import clsx from "clsx";
import { Moon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ActionButton from "../../../../ActionButton";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { clampNumber } from "../../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import { getEffectiveHitPointMaximumForCharacter } from "../../../../../pages/CharactersPage/traits";
import { hasWarlockFeature } from "../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { CLASS_FEATURE } from "../../../../../codex/entries";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import type { RestOption, RestType } from "./restOptions";
import { createLongRestOptions, createShortRestOptions } from "./restOptions";
import CampRestOption from "./CampRestOption";
import styles from "./CampButton.module.css";

type CampButtonProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

const primaryRestOptionIds = new Set([
  "reduce-exhaustion",
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

function CampButton({ character, onPersistCharacter }: CampButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRestType, setSelectedRestType] = useState<RestType | null>(null);
  const [selectedRestOptionIds, setSelectedRestOptionIds] = useState<string[]>([]);
  const shortRestsUsedToday = clampNumber(character.shortRestsUsedToday, 0, 2, 0);
  const shortRestsRemaining = Math.max(0, 2 - shortRestsUsedToday);
  const shortRestHealAmount = Math.ceil(getEffectiveHitPointMaximumForCharacter(character) / 2);
  const shortRestOptions = useMemo(() => createShortRestOptions(character), [character]);
  const longRestOptions = useMemo(() => createLongRestOptions(character), [character]);
  const hasWarlockPactMagic = hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC);
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePopup();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function openPopup() {
    setSelectedRestType(null);
    setSelectedRestOptionIds([]);
    setIsOpen(true);
  }

  function closePopup() {
    setIsOpen(false);
    setSelectedRestType(null);
    setSelectedRestOptionIds([]);
  }

  function selectRestType(restType: RestType) {
    if (restType === "short" && shortRestsRemaining <= 0) {
      return;
    }

    const nextOptions = restType === "short" ? shortRestOptions : longRestOptions;
    setSelectedRestType(restType);
    setSelectedRestOptionIds(
      nextOptions
        .filter((option) => option.defaultSelected !== false && option.disabled !== true)
        .map((option) => option.id)
    );
  }

  function toggleRestOption(optionId: string) {
    const selectedOption = selectedRestOptions.find((option) => option.id === optionId);

    if (selectedOption?.disabled === true) {
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
      .filter((option) => option.defaultSelected !== false && option.disabled !== true)
      .map((option) => option.id);

    setSelectedRestOptionIds((currentOptionIds) =>
      currentOptionIds.length > 0 ? [] : selectableOptionIds
    );
  }

  function confirmRest() {
    if (!selectedRestType) {
      return;
    }

    if (selectedRestType === "short" && shortRestsRemaining <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const availableOptions =
        selectedRestType === "short"
          ? createShortRestOptions(currentCharacter)
          : createLongRestOptions(currentCharacter);
      const selectedOptionIdSet = new Set(selectedRestOptionIds);
      const restedCharacter = availableOptions.reduce((nextCharacter, option) => {
        if (!selectedOptionIdSet.has(option.id) || option.disabled === true) {
          return nextCharacter;
        }

        return option.apply(nextCharacter);
      }, currentCharacter);

      return {
        ...restedCharacter,
        shortRestsUsedToday:
          selectedRestType === "short"
            ? clampNumber((restedCharacter.shortRestsUsedToday ?? 0) + 1, 0, 2, 0)
            : 0
      };
    });

    closePopup();
  }

  return (
    <>
      <button type="button" className={clsx(shared.editButton, styles.button)} onClick={openPopup}>
        <Moon size={16} />
        Camp
      </button>

      {isOpen ? (
        <div className={sheetStyles.restPopupBackdrop} role="presentation" onClick={closePopup}>
          <section
            className={sheetStyles.restPopupCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rest-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Camp</p>
                <h3 id="rest-popup-title" className={sheetStyles.sheetPanelTitle}>
                  Choose your rest
                </h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={closePopup}
                aria-label="Close rest options"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.restOptionGrid}>
              <button
                type="button"
                className={clsx(
                  sheetStyles.restOptionButton,
                  selectedRestType === "short" && sheetStyles.restOptionButtonActive
                )}
                onClick={() => selectRestType("short")}
                disabled={shortRestsRemaining <= 0}
              >
                <strong>Short rest</strong>
                <small>Heal {shortRestHealAmount} HP (half your max HP).</small>
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
              </button>

              <button
                type="button"
                className={clsx(
                  sheetStyles.restOptionButton,
                  selectedRestType === "long" && sheetStyles.restOptionButtonActive
                )}
                onClick={() => selectRestType("long")}
              >
                <strong>Long rest</strong>
                <small>
                  {hasWarlockPactMagic
                    ? "Restore full HP and refresh Pact Magic spell slots."
                    : "Restore full HP and refresh all spell slots."}
                </small>
                <span className={sheetStyles.longRestNote}>Also resets short rests.</span>
              </button>
            </div>

            {selectedRestType ? (
              <div className={sheetStyles.restChecklistSection}>
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
                <div className={sheetStyles.restPopupActions}>
                  <ActionButton variant="GHOST" onClick={closePopup}>
                    Cancel
                  </ActionButton>
                  <ActionButton onClick={confirmRest}>
                    Rest
                  </ActionButton>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

export default CampButton;
