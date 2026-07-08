import { useEffect, useId, useMemo, useState } from "react";
import type { Character } from "../../../../../types";
import d20Icon from "../../../../../assets/svg/d20.svg";
import type {
  PersistCharacterOptions,
  PersistCharacterUpdater
} from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getAbilityModifierForCharacter } from "../../../../../pages/CharactersPage/abilities";
import { formatD20Formula } from "../../../../../pages/CharactersPage/shared";
import {
  applySoulOfArtificeCheatDeathForCharacter,
  getSoulOfArtificeCheatDeathItemOptions,
  isArtificerSoulOfArtificeCheatDeathAvailable
} from "../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import {
  applyLifeAndDeathBoonOfRecoveryLastStandForCharacter,
  applyLifeAndDeathGiftOfTheProtectorsForCharacter,
  applyLifeAndDeathRelentlessRageRollResultForCharacter,
  applyLifeAndDeathSafeHavenForCharacter,
  applyLifeAndDeathSearingVengeanceForCharacter,
  applyLifeAndDeathUndyingSentinelForCharacter,
  getLifeAndDeathLedgerDescriptionAdditions,
  getLifeAndDeathLedgerHeaderItems,
  getLifeAndDeathRelentlessRageDc,
  hasLifeAndDeathGiftOfTheProtectorsFeature,
  hasLifeAndDeathSearingVengeanceFeature,
  isLifeAndDeathBoonOfRecoveryLastStandAvailable,
  isLifeAndDeathGiftOfTheProtectorsAvailable,
  isLifeAndDeathRelentlessRageAvailable,
  isLifeAndDeathRelentlessRageRelevant,
  isLifeAndDeathSafeHavenAvailable,
  isLifeAndDeathSafeHavenRelevant,
  isLifeAndDeathSearingVengeanceAvailable,
  isLifeAndDeathUndyingSentinelAvailable,
  spendLifeAndDeathRelentlessRageForCharacter,
  type LifeAndDeathLedgerHeaderItem
} from "../../../../../pages/CharactersPage/classFeatures/lifeAndDeathLedger";
import { orderDescriptionAdditionSections } from "../../../../../pages/CharactersPage/actionModalDescriptions";
import ActionButton from "../../../../ActionButton";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal,
  overlayClassNames
} from "../../../../Overlay";
import RadioContainerOption from "../../RadioContainerOption";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import LifeAndDeathGiftOfProtectorsEditor from "./LifeAndDeathGiftOfProtectorsEditor";
import { classResourcePersistOptions } from "./persistOptions";
import styles from "./LifeAndDeathLedgerModal.module.css";

type LifeAndDeathLedgerModalProps = {
  character: Character;
  onClose: () => void;
  onPersistCharacter: PersistCharacterUpdater;
};

const cheatDeathPersistOptions: PersistCharacterOptions = {
  domains: ["resources", "inventory"],
  normalize: "targeted"
};

function renderHeaderItem(item: LifeAndDeathLedgerHeaderItem) {
  if (item.kind === "text") {
    return (
      <span key={item.key} className={styles.headerMetaChip}>
        {item.label}
      </span>
    );
  }

  return (
    <span key={item.key} className={styles.headerMetaChip}>
      <span>{item.label}</span>
      <span
        className={sheetStyles.shortRestDots}
        aria-label={`${item.current} of ${item.total} ${item.label} uses remaining`}
      >
        {Array.from({ length: item.total }, (_, index) => (
          <span
            key={`${item.key}-dot-${index}`}
            className={`${sheetStyles.shortRestDot} ${
              index < item.current ? sheetStyles.shortRestDotActive : ""
            }`.trim()}
            aria-hidden="true"
          />
        ))}
      </span>
    </span>
  );
}

function LifeAndDeathLedgerModal({
  character,
  onClose,
  onPersistCharacter
}: LifeAndDeathLedgerModalProps) {
  const titleId = useId().replace(/:/g, "");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isRelentlessRageDiceSettingsOpen, setIsRelentlessRageDiceSettingsOpen] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();
  const cheatDeathAvailable = isArtificerSoulOfArtificeCheatDeathAvailable(character);
  const relentlessRageRelevant = isLifeAndDeathRelentlessRageRelevant(character);
  const relentlessRageAvailable = isLifeAndDeathRelentlessRageAvailable(character);
  const undyingSentinelAvailable = isLifeAndDeathUndyingSentinelAvailable(character);
  const hasSearingVengeance = hasLifeAndDeathSearingVengeanceFeature(character);
  const searingVengeanceAvailable = isLifeAndDeathSearingVengeanceAvailable(character);
  const hasGiftOfTheProtectors = hasLifeAndDeathGiftOfTheProtectorsFeature(character);
  const giftOfTheProtectorsAvailable = isLifeAndDeathGiftOfTheProtectorsAvailable(character);
  const boonOfRecoveryLastStandAvailable =
    isLifeAndDeathBoonOfRecoveryLastStandAvailable(character);
  const safeHavenRelevant = isLifeAndDeathSafeHavenRelevant(character);
  const safeHavenAvailable = isLifeAndDeathSafeHavenAvailable(character);
  const descriptionSections = useMemo(
    () => orderDescriptionAdditionSections(getLifeAndDeathLedgerDescriptionAdditions(character)),
    [character]
  );
  const headerItems = useMemo(() => getLifeAndDeathLedgerHeaderItems(character), [character]);
  const eligibleItems = useMemo(
    () => (cheatDeathAvailable ? getSoulOfArtificeCheatDeathItemOptions(character) : []),
    [character, cheatDeathAvailable]
  );
  const eligibleItemIds = useMemo(
    () => new Set(eligibleItems.map((option) => option.id)),
    [eligibleItems]
  );
  const selectedEligibleItemIds = selectedItemIds.filter((id) => eligibleItemIds.has(id));
  const selectedItemIdSet = new Set(selectedEligibleItemIds);
  const restoredHitPoints = selectedEligibleItemIds.length * 20;
  const relentlessRageDc = getLifeAndDeathRelentlessRageDc(character);
  const relentlessRageConModifier = getAbilityModifierForCharacter(character, "CON");
  const relentlessRageFormula = formatD20Formula(relentlessRageConModifier);
  const relentlessRageHitPoints = Math.max(0, 2 * (character.level ?? 0));

  useEffect(() => {
    setSelectedItemIds((currentIds) => {
      const nextIds = currentIds.filter((id) => eligibleItemIds.has(id));

      return nextIds.length === currentIds.length ? currentIds : nextIds;
    });
  }, [eligibleItemIds]);

  function toggleItemSelection(itemId: string) {
    setSelectedItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((currentId) => currentId !== itemId)
        : [...currentIds, itemId]
    );
  }

  function useCheatDeath() {
    if (selectedEligibleItemIds.length <= 0) {
      return;
    }

    onPersistCharacter(
      (currentCharacter) =>
        applySoulOfArtificeCheatDeathForCharacter(currentCharacter, selectedEligibleItemIds),
      cheatDeathPersistOptions
    );
    onClose();
  }

  function useRelentlessRage() {
    if (!relentlessRageAvailable) {
      return;
    }

    const dc = relentlessRageDc;

    onPersistCharacter(
      (currentCharacter) => spendLifeAndDeathRelentlessRageForCharacter(currentCharacter),
      classResourcePersistOptions
    );

    openDiceRoller({
      title: "Relentless Rage",
      formula: relentlessRageFormula,
      formulaDisplay: relentlessRageFormula,
      description: `Roll against DC ${dc}. On success, your Hit Points become ${relentlessRageHitPoints}. The DC has already increased by 5.`,
      getFullManualToastText: ({ result }) =>
        result.total >= dc
          ? `Relentless Rage ${result.total} meets DC ${dc}. Set Hit Points to ${relentlessRageHitPoints}.`
          : `Relentless Rage ${result.total} misses DC ${dc}.`,
      onResolvedResult: ({ result }) => {
        onPersistCharacter(
          (currentCharacter) =>
            applyLifeAndDeathRelentlessRageRollResultForCharacter(
              currentCharacter,
              result.total,
              dc
            ),
          classResourcePersistOptions
        );
      }
    });
  }

  function useUndyingSentinel() {
    onPersistCharacter(
      (currentCharacter) => applyLifeAndDeathUndyingSentinelForCharacter(currentCharacter),
      classResourcePersistOptions
    );
    onClose();
  }

  function useSearingVengeance() {
    onPersistCharacter(
      (currentCharacter) => applyLifeAndDeathSearingVengeanceForCharacter(currentCharacter),
      classResourcePersistOptions
    );
    onClose();
  }

  function useGiftOfTheProtectors() {
    onPersistCharacter(
      (currentCharacter) => applyLifeAndDeathGiftOfTheProtectorsForCharacter(currentCharacter),
      classResourcePersistOptions
    );
    onClose();
  }

  function useBoonOfRecoveryLastStand() {
    onPersistCharacter(
      (currentCharacter) =>
        applyLifeAndDeathBoonOfRecoveryLastStandForCharacter(currentCharacter),
      classResourcePersistOptions
    );
    onClose();
  }

  function useSafeHaven() {
    onPersistCharacter(
      (currentCharacter) => applyLifeAndDeathSafeHavenForCharacter(currentCharacter),
      cheatDeathPersistOptions
    );
    onClose();
  }

  const footerActions = [
    ...(undyingSentinelAvailable
      ? [
          {
            key: "undying-sentinel",
            label: "Use Undying Sentinel",
            onClick: useUndyingSentinel
          }
        ]
      : []),
    ...(hasSearingVengeance
      ? [
          {
            key: "searing-vengeance",
            label: "Use Searing Vengeance",
            onClick: useSearingVengeance,
            disabled: !searingVengeanceAvailable
          }
        ]
      : []),
    ...(hasGiftOfTheProtectors
      ? [
          {
            key: "gift-of-the-protectors",
            label: "Use Gift of the Protectors",
            onClick: useGiftOfTheProtectors,
            disabled: !giftOfTheProtectorsAvailable
          }
        ]
      : []),
    ...(boonOfRecoveryLastStandAvailable
      ? [
          {
            key: "boon-of-recovery-last-stand",
            label: "Use Last Stand",
            onClick: useBoonOfRecoveryLastStand
          }
        ]
      : []),
    ...(safeHavenRelevant
      ? [
          {
            key: "safe-haven",
            label: "Use Safe Haven",
            onClick: useSafeHaven,
            disabled: !safeHavenAvailable
          }
        ]
      : []),
    ...(cheatDeathAvailable
      ? [
          {
            key: "cheat-death",
            label: "Use Cheat Death",
            onClick: useCheatDeath,
            disabled: selectedEligibleItemIds.length <= 0
          }
        ]
      : [])
  ];

  return (
    <>
      <SheetModal titleId={titleId} onClose={onClose} size="small">
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayTitleRow>
              <OverlayTitle id={titleId}>The Book of Life and Death</OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary>
              A ledger of the fragile bargains that define your character in life and death. Notes
              may surface here from time to time; when you need them, you will know.
            </OverlaySummary>
            {headerItems.length > 0 ? (
              <div className={styles.headerMeta}>{headerItems.map(renderHeaderItem)}</div>
            ) : null}
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close life and death ledger" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody className={styles.body}>
          {descriptionSections.length > 0 ? (
            <div className={styles.descriptionStack}>
              {descriptionSections.map((section, index) => (
                <div key={`life-death-description-${index}`} className={styles.descriptionSection}>
                  {index > 0 ? (
                    <hr className={styles.descriptionDivider} aria-hidden="true" />
                  ) : null}
                  <DescriptionContent
                    description={section}
                    className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                    entryClassName={overlayClassNames.descriptionLine}
                    strongClassName={overlayClassNames.descriptionStrong}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No arcane text is present yet.</p>
          )}

          {hasGiftOfTheProtectors ? (
            <LifeAndDeathGiftOfProtectorsEditor
              character={character}
              onPersistCharacter={onPersistCharacter}
            />
          ) : null}

          {cheatDeathAvailable ? (
            <section className={styles.cheatDeathSection} aria-label="Cheat Death magic items">
              <div className={styles.cheatDeathHeader}>
                <h4>Cheat Death</h4>
                {selectedEligibleItemIds.length > 0 ? (
                  <span>{restoredHitPoints} HP</span>
                ) : null}
              </div>
              <div className={styles.itemGrid}>
                {eligibleItems.map((option) => (
                  <RadioContainerOption
                    key={option.id}
                    indicatorType="checkbox"
                    selected={selectedItemIdSet.has(option.id)}
                    onSelect={() => toggleItemSelection(option.id)}
                    header={option.label}
                    subheader={`${option.rarityLabel} | Replicate Magic Item`}
                    breakdown={
                      option.kind === "container" ? `Inside ${option.containerName}` : "In inventory"
                    }
                    actionBadge="20 HP"
                    className={styles.itemOption}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </OverlayBody>

        {footerActions.length > 0 || relentlessRageRelevant ? (
          <OverlayFooter className={styles.footer}>
            <div className={styles.footerActions}>
              {relentlessRageRelevant ? (
                <div className={styles.footerRollAction}>
                  <ActionButton
                    className={styles.footerRollButton}
                    onClick={useRelentlessRage}
                    disabled={!relentlessRageAvailable}
                    title={
                      relentlessRageAvailable
                        ? undefined
                        : "Relentless Rage requires active Rage at 0 HP."
                    }
                    icon={<img src={d20Icon} alt="" className={styles.rollButtonIcon} />}
                  >
                    Use Relentless Rage
                  </ActionButton>
                  <DiceRollerSettingsButton
                    actionName="Relentless Rage"
                    className={styles.footerRollSettingsButton}
                    isOpen={isRelentlessRageDiceSettingsOpen}
                    ariaLabel="Open Relentless Rage dice roller settings"
                    onOpenChange={setIsRelentlessRageDiceSettingsOpen}
                  />
                </div>
              ) : null}
              {footerActions.map((action) => (
                <ActionButton key={action.key} onClick={action.onClick} disabled={action.disabled}>
                  {action.label}
                </ActionButton>
              ))}
            </div>
          </OverlayFooter>
        ) : null}
      </SheetModal>
      {diceRollerPopup}
    </>
  );
}

export default LifeAndDeathLedgerModal;
