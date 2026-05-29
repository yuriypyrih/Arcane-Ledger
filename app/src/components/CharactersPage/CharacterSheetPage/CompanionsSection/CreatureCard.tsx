import type { CSSProperties } from "react";
import { Copy, Eye, Pencil, Shield, Trash2 } from "lucide-react";
import CollaborationIcon from "../../../../assets/svg/collaboration.svg";
import EnemyIcon from "../../../../assets/svg/enemy.svg";
import type { CharacterCompanion } from "../../../../types";
import { normalizeTemporaryHitPoints } from "../GameplayForm/gameplayStateUtils";
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
  onDuplicate: () => void;
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
  duplicateTitle,
  isVisibilityActive = false,
  predisposition,
  sourceLabel,
  statusLabel,
  onDuplicate,
  onEdit,
  onEditVisibility,
  onInspect,
  onRemove
}: CreatureCardProps) {
  const temporaryHitPoints = normalizeTemporaryHitPoints(creature.temporaryHitPoints);
  const creatureType = creature.type.trim();
  const inheritedCreatureEntry = creature.inheritedCreatureEntry;
  const armorClass = inheritedCreatureEntry?.armor_class;
  const shouldShowArmorClass = typeof armorClass === "number" && Number.isFinite(armorClass) && armorClass > 0;
  const challengeRating =
    inheritedCreatureEntry?.challenge_rating.trim() || inheritedCreatureEntry?.cr.toString() || "";
  const isModified = creature.inheritedCreatureEntryModified === true;

  return (
    <article className={styles.card}>
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
            <span className={styles.title}>{creature.name}</span>
            {creatureType ? <span className={styles.type}>· {creatureType}</span> : null}
            {challengeRating ? (
              <span className={styles.type}>· CR {challengeRating}</span>
            ) : null}
          </span>

          <span className={styles.vitalsRow}>
            {shouldShowArmorClass ? (
              <>
                <span className={styles.armorClassText}>AC {armorClass}</span>
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
                  <Shield size={14} aria-hidden="true" />
                  {temporaryHitPoints}
                </span>
              </>
            ) : null}
            <span className={styles.vitalsDivider}>·</span>
            <span className={styles.status}>{statusLabel}</span>
          </span>
        </button>

        <span className={styles.metaColumn}>
          <span className={styles.tagRow}>
            <span className={styles.sourceTag}>{sourceLabel}</span>
            {isModified ? <span className={styles.moddedTag}>Modded</span> : null}
          </span>

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
            <button
              type="button"
              className={styles.actionButton}
              disabled={duplicateDisabled}
              onClick={onDuplicate}
              aria-label={`Duplicate ${creature.name}`}
              title={duplicateTitle ?? `Duplicate ${creature.name}`}
            >
              <Copy size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={onEdit}
              aria-label={`Edit ${creature.name}`}
              title={`Edit ${creature.name}`}
            >
              <Pencil size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.removeButton}`}
              onClick={onRemove}
              aria-label={`Remove ${creature.name}`}
              title={`Remove ${creature.name}`}
            >
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </span>
        </span>
      </span>
    </article>
  );
}

export default CreatureCard;
