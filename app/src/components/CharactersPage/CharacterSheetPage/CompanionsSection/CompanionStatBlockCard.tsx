import { Pencil, RotateCcw } from "lucide-react";
import type { CompanionStatBlock } from "../../../../types";
import { getMonsterTypeName, isDeprecatedMonsterRecord } from "../../../../utils/monsters";
import { getMonsterSourceLabel } from "./companionUtils";
import styles from "./CompanionsSection.module.css";

type Props = {
  block: CompanionStatBlock;
  disabled: boolean;
  dynamic: boolean;
  resetting: boolean;
  onPreview: () => void;
  onModify: () => void;
  onReset: () => void;
  onRemove: () => void;
};

export default function CompanionStatBlockCard({
  block,
  disabled,
  dynamic,
  resetting,
  onPreview,
  onModify,
  onReset,
  onRemove
}: Props) {
  const canModify = !dynamic && !isDeprecatedMonsterRecord(block.monster);
  return (
    <div className={styles.selectedMonsterCard}>
      <div>
        <h5 className={styles.selectedMonsterTitle}>{block.monster.name}</h5>
        <p className={styles.selectedMonsterMeta}>
          {getMonsterTypeName(block.monster) || "Unknown type"} ·{" "}
          {getMonsterSourceLabel(block.monster)}
          {block.modified ? " - Modified" : ""}
        </p>
      </div>
      <div className={styles.selectedMonsterActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={disabled}
          onClick={onPreview}
        >
          Preview
        </button>
        {canModify || dynamic ? (
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={disabled || dynamic}
            title={
              dynamic
                ? "Primal Beast stat blocks are dynamic and cannot be modified yet."
                : undefined
            }
            onClick={onModify}
          >
            <Pencil size={16} aria-hidden="true" />
            Modify
          </button>
        ) : null}
        {block.modified && canModify ? (
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={disabled}
            onClick={onReset}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {resetting ? "Resetting..." : "Reset"}
          </button>
        ) : null}
        <button
          type="button"
          className={styles.removeButtonText}
          disabled={disabled}
          onClick={onRemove}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
