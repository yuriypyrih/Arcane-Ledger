import clsx from "clsx";
import {
  Brain,
  ChevronsUp,
  Dumbbell,
  Eye,
  HeartPulse,
  Sparkles,
  Zap,
  type LucideIcon
} from "lucide-react";
import type { CSSProperties } from "react";
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
  onOpenAbilityReference: (ability: AbilityKey) => void;
};

type AbilityTheme = {
  Icon: LucideIcon;
  accent: string;
  accentSoft: string;
  wash: string;
  glow: string;
};

const abilityThemes: Record<AbilityKey, AbilityTheme> = {
  STR: {
    Icon: Dumbbell,
    accent: "#a8432e",
    accentSoft: "rgba(168, 67, 46, 0.18)",
    wash: "rgba(168, 67, 46, 0.1)",
    glow: "rgba(168, 67, 46, 0.22)"
  },
  DEX: {
    Icon: Zap,
    accent: "#b87916",
    accentSoft: "rgba(184, 121, 22, 0.2)",
    wash: "rgba(184, 121, 22, 0.11)",
    glow: "rgba(184, 121, 22, 0.24)"
  },
  CON: {
    Icon: HeartPulse,
    accent: "#427a3a",
    accentSoft: "rgba(66, 122, 58, 0.18)",
    wash: "rgba(66, 122, 58, 0.1)",
    glow: "rgba(66, 122, 58, 0.2)"
  },
  INT: {
    Icon: Brain,
    accent: "#2e69a7",
    accentSoft: "rgba(46, 105, 167, 0.18)",
    wash: "rgba(46, 105, 167, 0.1)",
    glow: "rgba(46, 105, 167, 0.22)"
  },
  WIS: {
    Icon: Eye,
    accent: "#247b75",
    accentSoft: "rgba(36, 123, 117, 0.18)",
    wash: "rgba(36, 123, 117, 0.1)",
    glow: "rgba(36, 123, 117, 0.2)"
  },
  CHA: {
    Icon: Sparkles,
    accent: "#9b3f84",
    accentSoft: "rgba(155, 63, 132, 0.18)",
    wash: "rgba(155, 63, 132, 0.1)",
    glow: "rgba(155, 63, 132, 0.22)"
  }
};

function getAbilityThemeStyle(theme: AbilityTheme): CSSProperties {
  return {
    "--ability-accent": theme.accent,
    "--ability-accent-soft": theme.accentSoft,
    "--ability-wash": theme.wash,
    "--ability-glow": theme.glow
  } as CSSProperties;
}

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

function getCombinedRollStatePillClassName(rollState: ResolvedRollState): string {
  return clsx(
    styles.combinedRollStatePill,
    rollState.tone === "advantage"
      ? styles.combinedRollStatePillAdvantage
      : rollState.tone === "disadvantage"
        ? styles.combinedRollStatePillDisadvantage
        : styles.combinedRollStatePillNeutralized
  );
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
        const theme = abilityThemes[card.ability];
        const { Icon } = theme;
        const hasBothRollStates =
          card.modifierRollState !== null && card.savingThrowRollState !== null;
        const hasMatchingRollStates =
          hasBothRollStates &&
          areResolvedRollStatesEquivalent(card.modifierRollState, card.savingThrowRollState);
        const shouldUseAbbreviatedRollStates = hasBothRollStates && !hasMatchingRollStates;
        const sharedRollState = hasMatchingRollStates
          ? card.modifierRollState
          : (card.modifierRollState ?? card.savingThrowRollState);

        return (
          <SheetSurface
            as="button"
            key={card.ability}
            type="button"
            borderSize="xl"
            hasBorder
            hoverBorder
            className={styles.card}
            style={getAbilityThemeStyle(theme)}
            onClick={() => onOpenAbilityReference(card.ability)}
          >
            <Icon className={styles.textureIcon} strokeWidth={1.25} aria-hidden />
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
                    size={18}
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
                  className={clsx(
                    styles.value,
                    getRollStateValueClassName(card.modifierRollState)
                  )}
                >
                  {card.modifier}
                </strong>
              </span>
              <span
                className={clsx(
                  styles.valueWell,
                  styles.saveWell,
                  card.isSavingThrowProficient && styles.saveWellProficient
                )}
              >
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
                      size={17}
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
                      className={getCombinedRollStatePillClassName(card.modifierRollState)}
                    />
                  ) : null}
                </span>
                <span className={styles.combinedRollStateSlot}>
                  {card.savingThrowRollState ? (
                    <RollStatePill
                      tone={card.savingThrowRollState.tone}
                      label={getRollStateAbbreviation(card.savingThrowRollState)}
                      size="small"
                      className={getCombinedRollStatePillClassName(card.savingThrowRollState)}
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
                  className={getCombinedRollStatePillClassName(sharedRollState)}
                />
              </div>
            ) : null}
          </SheetSurface>
        );
      })}
    </div>
  );
}

export default AbilitySavingThrowCards;
