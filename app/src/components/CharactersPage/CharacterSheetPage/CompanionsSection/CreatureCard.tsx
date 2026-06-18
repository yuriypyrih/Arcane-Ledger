import type { CSSProperties } from "react";
import { ChessRook, Copy, Eye, Pencil, Shield, Trash2 } from "lucide-react";
import CollaborationIcon from "../../../../assets/svg/collaboration.svg";
import EnemyIcon from "../../../../assets/svg/enemy.svg";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  type CharacterCompanion
} from "../../../../types";
import {
  getStatusDurationLabel,
  getStatusDurationShortLabel,
  getStatusDurationTickOn
} from "../../../../pages/CharactersPage/traits";
import { getMonsterArmorClass } from "../../../../utils/monsters";
import { normalizeTemporaryHitPoints } from "../GameplayForm/gameplayStateUtils";
import SheetSurface from "../SheetSurface";
import { getCompanionDisplayType } from "./companionUtils";
import styles from "./CreatureCard.module.css";

export type CreatureCardPredisposition = "friendly" | "neutral" | "hostile";

type CreatureCardStyle = CSSProperties & {
  "--creature-card-icon-image": string;
};

type CreatureCardProps = {
  creature: CharacterCompanion;
  duplicateDisabled?: boolean;
  duplicateTitle?: string;
  predisposition: CreatureCardPredisposition;
  sourceLabel: string;
  statusLabel: string;
  isVisibilityActive?: boolean;
  duplicateLabel?: string;
  editLabel?: string;
  removeLabel?: string;
  onDuplicate?: () => void;
  onEdit: () => void;
  onEditVisibility?: () => void;
  onInspect: () => void;
  onRemove: () => void;
};

const friendlyIconStyle: CreatureCardStyle = {
  "--creature-card-icon-image": `url("${CollaborationIcon}")`
};

const hostileIconStyle: CreatureCardStyle = {
  "--creature-card-icon-image": `url("${EnemyIcon}")`
};

function getCreatureIconStyle(predisposition: CreatureCardPredisposition): CreatureCardStyle {
  return predisposition === "hostile" ? hostileIconStyle : friendlyIconStyle;
}

function CreatureCard({
  creature,
  duplicateDisabled = false,
  duplicateLabel,
  duplicateTitle,
  editLabel,
  isVisibilityActive = false,
  predisposition,
  removeLabel,
  sourceLabel,
  statusLabel,
  onDuplicate,
  onEdit,
  onEditVisibility,
  onInspect,
  onRemove
}: CreatureCardProps) {
  const temporaryHitPoints = normalizeTemporaryHitPoints(creature.temporaryHitPoints);
  const creatureType = getCompanionDisplayType(creature);
  const inheritedCreatureEntry = creature.inheritedCreatureEntry;
  const armorClass = inheritedCreatureEntry ? getMonsterArmorClass(inheritedCreatureEntry) : null;
  const shouldShowArmorClass =
    typeof armorClass === "number" && Number.isFinite(armorClass) && armorClass > 0;
  const isModified = creature.inheritedCreatureEntryModified === true;
  const shortDurationLabel = getStatusDurationShortLabel(creature.duration);
  const durationTitle = getStatusDurationLabel(creature.duration);
  const roundTickOn = getStatusDurationTickOn(creature.duration);
  const roundPrefix = roundTickOn === STATUS_DURATION_ROUND_TICK.ROUND_START ? "<" : "";
  const roundSuffix = roundTickOn === STATUS_DURATION_ROUND_TICK.ROUND_END ? ">" : "";
  const shouldShowDuration =
    creature.duration.kind !== STATUS_DURATION_KIND.INFINITE && shortDurationLabel !== null;

  return (
    <SheetSurface as="article" borderSize="lg" hasBorder hoverBorder className={styles.card}>
      <button
        type="button"
        className={styles.portraitButton}
        onClick={onInspect}
        aria-label={`Inspect ${creature.name}`}
      >
        <span className={styles.portrait} aria-hidden="true">
          <span
            className={styles.portraitIcon}
            style={getCreatureIconStyle(predisposition)}
          />
        </span>
      </button>

      <span className={styles.main}>
        <button
          type="button"
          className={styles.inspectButton}
          onClick={onInspect}
          aria-label={`Inspect ${creature.name}`}
        >
          <span className={styles.titleRow}>
            <span className={styles.titleText}>
              <span className={styles.title}>{creature.name}</span>
              {creatureType ? <span className={styles.type}>· {creatureType}</span> : null}
            </span>
            <span className={styles.tagRow}>
              {creature.separateInitiative ? (
                <span className={styles.separateInitiativeTag}>Separate Initiative</span>
              ) : null}
              {shouldShowDuration ? (
                <span className={styles.durationTag} title={durationTitle}>
                  {roundPrefix ? <span>{roundPrefix}</span> : null}
                  <span>(</span>
                  <span className={styles.durationText}>{shortDurationLabel}</span>
                  <span>)</span>
                  {roundSuffix ? <span>{roundSuffix}</span> : null}
                </span>
              ) : null}
              <span className={styles.sourceTag}>{sourceLabel}</span>
              {isModified ? <span className={styles.moddedTag}>Modded</span> : null}
            </span>
          </span>
        </button>

        <span className={styles.vitalsActionsRow}>
          <button
            type="button"
            className={styles.vitalsInspectButton}
            onClick={onInspect}
            aria-label={`Inspect ${creature.name}`}
          >
            <span className={styles.vitalsRow}>
              {shouldShowArmorClass ? (
                <>
                  <span
                    className={styles.armorClassText}
                    aria-label={`Armor Class ${armorClass}`}
                    title={`Armor Class ${armorClass}`}
                  >
                    <Shield size={14} aria-hidden="true" />
                    {armorClass}
                  </span>
                  <span className={styles.vitalsDivider}>·</span>
                </>
              ) : null}
              <span className={styles.hitPointText}>
                {creature.currentHitPoints}/{creature.maxHitPoints} HP
              </span>
              {temporaryHitPoints > 0 ? (
                <>
                  <span className={styles.vitalsDivider}>·</span>
                  <span className={styles.tempHitPointText}>
                    <ChessRook size={14} aria-hidden="true" />
                    {temporaryHitPoints}
                  </span>
                </>
              ) : null}
              <span className={styles.vitalsDivider}>·</span>
              <span className={styles.status}>{statusLabel}</span>
            </span>
          </button>

          <span className={styles.actions}>
            {onEditVisibility ? (
              <button
                type="button"
                className={styles.actionButton}
                onClick={onEditVisibility}
                aria-label={`Edit ${creature.name} player visibility settings`}
                title={`Edit ${creature.name} player visibility settings`}
              >
                <Eye
                  className={isVisibilityActive ? styles.visibilityActiveIcon : undefined}
                  size={17}
                  aria-hidden="true"
                />
              </button>
            ) : null}
            {onDuplicate ? (
              <button
                type="button"
                className={styles.actionButton}
                disabled={duplicateDisabled}
                onClick={onDuplicate}
                aria-label={duplicateLabel ?? `Duplicate ${creature.name}`}
                title={duplicateTitle ?? duplicateLabel ?? `Duplicate ${creature.name}`}
              >
                <Copy size={17} aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              className={styles.actionButton}
              onClick={onEdit}
              aria-label={editLabel ?? `Edit ${creature.name}`}
              title={editLabel ?? `Edit ${creature.name}`}
            >
              <Pencil size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.removeButton}`}
              onClick={onRemove}
              aria-label={removeLabel ?? `Remove ${creature.name}`}
              title={removeLabel ?? `Remove ${creature.name}`}
            >
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </span>
        </span>
      </span>
    </SheetSurface>
  );
}

export default CreatureCard;
