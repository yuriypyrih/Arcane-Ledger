import clsx from "clsx";
import { ChevronsUp } from "lucide-react";
import type { AbilityModifierBonusEntry } from "../../../../pages/CharactersPage/abilities";
import type { FeatureIndicator } from "../../../../pages/CharactersPage/classFeatures";
import type { AbilityKey } from "../../../../types";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import {
  areResolvedRollStatesEquivalent,
  type ResolvedRollState
} from "../../../RollStatePill/rollState";
import SheetSurface from "../SheetSurface";
import styles from "./AbilitySavingThrowCards.module.css";

export type SavingThrowBonusEntry = {
  label: string;
  value: number;
  formula?: string;
  formulaMultiplier?: 1 | -1;
  abilityModifierSource?: AbilityKey;
  formulaSourceLabel?: string;
  formulaLabel?: string;
};

export type AbilitySavingThrowCard = {
  ability: AbilityKey;
  score: number;
  modifier: string;
  modifierBaseValue: number;
  modifierValue: number;
  modifierBonusEntries: AbilityModifierBonusEntry[];
  isSavingThrowProficient: boolean;
  proficiencyContribution: number;
  proficiencyLabel?: string;
  savingThrowBonusEntries: SavingThrowBonusEntry[];
  totalSavingThrowValue: number;
  totalSavingThrow: string;
  showScoreBoostIcon?: boolean;
  scoreBoostIconLabel?: string;
  showSavingThrowBoostIcon?: boolean;
  savingThrowBoostIconLabel?: string;
  modifierIndicators: FeatureIndicator[];
  modifierRollState: ResolvedRollState | null;
  savingThrowIndicators: FeatureIndicator[];
  savingThrowRollState: ResolvedRollState | null;
};

type AbilitySavingThrowCardsProps = {
  broadLayout?: boolean;
  cards: AbilitySavingThrowCard[];
  primaryAbilities?: readonly AbilityKey[];
  onOpenAbilityReference?: (ability: AbilityKey) => void;
};

function getRollStateValueClassName(rollState: ResolvedRollState | null): string | undefined {
  switch (rollState?.tone) {
    case "advantage":
      return styles.rollStateValueAdvantage;
    case "disadvantage":
      return styles.rollStateValueDisadvantage;
    case "neutralized":
      return styles.rollStateValueNeutralized;
    default:
      return undefined;
  }
}

function getRollStateAbbreviation(rollState: ResolvedRollState): string {
  switch (rollState.tone) {
    case "advantage":
      return "ADV";
    case "disadvantage":
      return "DIS";
    case "neutralized":
      return "NEU";
  }
}

function AbilitySavingThrowCards({
  broadLayout = false,
  cards,
  primaryAbilities = [],
  onOpenAbilityReference
}: AbilitySavingThrowCardsProps) {
  return (
    <div className={clsx(styles.grid, broadLayout && styles.gridBroad)}>
      {cards.map((card) => {
        const isInteractive = onOpenAbilityReference !== undefined;
        const hasBothRollStates =
          card.modifierRollState !== null && card.savingThrowRollState !== null;
        const hasMatchingRollStates =
          hasBothRollStates &&
          areResolvedRollStatesEquivalent(card.modifierRollState, card.savingThrowRollState);
        const shouldUseAbbreviatedRollStates = hasBothRollStates && !hasMatchingRollStates;
        const sharedRollState = hasMatchingRollStates
          ? card.modifierRollState
          : (card.modifierRollState ?? card.savingThrowRollState);

        const content = (
          <>
            <div className={styles.header}>
              <span className={styles.identity}>
                <span className={styles.abilityLabel}>{card.ability}</span>
                <span
                  className={clsx(
                    styles.scoreChip,
                    primaryAbilities.includes(card.ability) && styles.scoreChipPrimary
                  )}
                  aria-label={`${card.ability} score ${card.score}`}
                >
                  {card.score}
                </span>
                {card.showScoreBoostIcon ? (
                  <ChevronsUp
                    size={20}
                    className={styles.boostIcon}
                    aria-label={card.scoreBoostIconLabel ?? "Feature boost active"}
                  />
                ) : null}
              </span>
            </div>

            <div className={styles.values}>
              <span className={clsx(styles.valueWell, styles.modifierWell)}>
                <span className={styles.valueLabel}>MOD</span>
                <strong
                  className={clsx(styles.value, getRollStateValueClassName(card.modifierRollState))}
                >
                  {card.modifier}
                </strong>
              </span>
              <span className={clsx(styles.valueWell, styles.saveWell)}>
                <span className={styles.valueLabel}>SAVE</span>
                <span className={styles.saveValueRow}>
                  <strong
                    className={clsx(
                      styles.value,
                      getRollStateValueClassName(card.savingThrowRollState),
                      card.isSavingThrowProficient && styles.saveValueProficient
                    )}
                  >
                    {card.totalSavingThrow}
                  </strong>
                  {card.showSavingThrowBoostIcon ? (
                    <ChevronsUp
                      size={19}
                      className={styles.boostIcon}
                      aria-label={
                        card.savingThrowBoostIconLabel ?? "Saving throw feature boost active"
                      }
                    />
                  ) : null}
                </span>
              </span>
            </div>

            {shouldUseAbbreviatedRollStates ? (
              <div className={styles.combinedRollStateRow}>
                <span className={styles.combinedRollStateSlot}>
                  {card.modifierRollState ? (
                    <RollStatePill
                      tone={card.modifierRollState.tone}
                      label={getRollStateAbbreviation(card.modifierRollState)}
                      size="small"
                      className={styles.combinedRollStatePill}
                    />
                  ) : null}
                </span>
                <span className={styles.combinedRollStateSlot}>
                  {card.savingThrowRollState ? (
                    <RollStatePill
                      tone={card.savingThrowRollState.tone}
                      label={getRollStateAbbreviation(card.savingThrowRollState)}
                      size="small"
                      className={styles.combinedRollStatePill}
                    />
                  ) : null}
                </span>
              </div>
            ) : sharedRollState ? (
              <div className={styles.combinedRollStateSingle}>
                <RollStatePill
                  tone={sharedRollState.tone}
                  label={sharedRollState.label}
                  size="small"
                  className={styles.combinedRollStatePill}
                />
              </div>
            ) : null}
          </>
        );

        return isInteractive ? (
          <SheetSurface
            as="button"
            key={card.ability}
            type="button"
            borderSize="xl"
            hasBorder
            hoverBorder
            className={styles.card}
            onClick={() => onOpenAbilityReference(card.ability)}
          >
            {content}
          </SheetSurface>
        ) : (
          <SheetSurface
            key={card.ability}
            borderSize="xl"
            hasBorder
            className={clsx(styles.card, styles.staticCard)}
          >
            {content}
          </SheetSurface>
        );
      })}
    </div>
  );
}

export default AbilitySavingThrowCards;
