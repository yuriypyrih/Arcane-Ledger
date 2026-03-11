import clsx from "clsx";
import { HeartPlus, Pencil, Save, Sword, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import NumberInput from "../../../../components/CharactersPage/FormInputs/NumberInput";
import type { Character } from "../../../../types";
import { formatAbilityModifier, type WeaponAction } from "../../gameplay";
import type { HpDraft } from "../types";
import { clampNumber } from "../utils";
import shared from "./CharacterSheetSectionShared.module.css";
import styles from "./GameplayForm.module.css";

type GameplayFormProps = {
  className?: string;
  character: Character;
  hpDraft: HpDraft;
  hitPointPercent: number;
  hitPointStep: number;
  isEditing: boolean;
  weaponActions: WeaponAction[];
  onAdjustHitPoints: (direction: -1 | 1) => void;
  onBeginEdit: () => void;
  onCancel: () => void;
  onOpenCamp: () => void;
  onRollWeaponAction: (action: WeaponAction) => void;
  onSave: () => void;
  setHitPointStep: Dispatch<SetStateAction<number>>;
  setHpDraft: Dispatch<SetStateAction<HpDraft>>;
};

function GameplayForm({
  className,
  character,
  hpDraft,
  hitPointPercent,
  hitPointStep,
  isEditing,
  weaponActions,
  onAdjustHitPoints,
  onBeginEdit,
  onCancel,
  onOpenCamp,
  onRollWeaponAction,
  onSave,
  setHitPointStep,
  setHpDraft
}: GameplayFormProps) {
  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Gameplay</p>
        </div>
        {isEditing ? null : (
          <button type="button" className={shared.editButton} onClick={onBeginEdit}>
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={shared.formGrid}>
          <label className={shared.field}>
            <span>Max HP</span>
            <NumberInput
              min={1}
              value={hpDraft.hitPoints}
              onChange={(event) =>
                setHpDraft((current) => ({
                  ...current,
                  hitPoints: clampNumber(event.target.value, 1, 999, current.hitPoints)
                }))
              }
            />
          </label>
          <label className={shared.field}>
            <span>Current HP</span>
            <NumberInput
              min={0}
              max={hpDraft.hitPoints}
              value={hpDraft.currentHitPoints}
              onChange={(event) =>
                setHpDraft((current) => ({
                  ...current,
                  currentHitPoints: clampNumber(
                    event.target.value,
                    0,
                    current.hitPoints,
                    current.currentHitPoints
                  )
                }))
              }
            />
          </label>
          <div className={shared.formActions}>
            <button type="button" className={shared.saveButton} onClick={onSave}>
              <Save size={16} />
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={onCancel}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.gameplayHpRow}>
            <div className={styles.hpMeter}>
              <div className={styles.hpSummary}>
                <strong>
                  {character.currentHitPoints}/{character.hitPoints} HP
                </strong>
                <span>
                  {character.currentHitPoints === 0
                    ? "Unconscious"
                    : character.currentHitPoints <= Math.ceil(character.hitPoints * 0.35)
                      ? "Critical"
                      : "Stable"}
                </span>
              </div>
              <div className={styles.hpBarTrack}>
                <div className={styles.hpBarFill} style={{ width: `${Math.max(0, hitPointPercent)}%` }} />
              </div>
            </div>
            <div className={styles.hpStepControl}>
              <NumberInput
                min={1}
                className={styles.hpStepInput}
                value={hitPointStep}
                onChange={(event) =>
                  setHitPointStep((current) => clampNumber(event.target.value, 1, 999, current))
                }
              />
              <button
                type="button"
                className={clsx(styles.hpActionButton, styles.hpDamage)}
                onClick={() => onAdjustHitPoints(-1)}
                title={`Deal ${hitPointStep} hit points`}
              >
                <Sword size={16} />
              </button>
              <button
                type="button"
                className={clsx(styles.hpActionButton, styles.hpHeal)}
                onClick={() => onAdjustHitPoints(1)}
                title={`Heal ${hitPointStep} hit points`}
              >
                <HeartPlus size={16} />
              </button>
            </div>
          </div>

          {weaponActions.length === 0 ? (
            <p className={shared.emptyText}>No weapon actions available. Equip a weapon to roll attacks.</p>
          ) : (
            <div className={styles.weaponActionGrid}>
              {weaponActions.map((action) => (
                <button
                  key={action.name}
                  type="button"
                  className={styles.weaponActionButton}
                  onClick={() => onRollWeaponAction(action)}
                >
                  <strong>
                    {action.name} ({action.damageFormula})
                  </strong>
                  <span>
                    {action.ability} {formatAbilityModifier(action.abilityModifier)} | Proficiency (
                    {action.proficiencyLabel}) {formatAbilityModifier(action.proficiencyBonus)}
                  </span>
                  <small>Roll: {action.rollDisplay}</small>
                </button>
              ))}
            </div>
          )}

          <div className={styles.gameplayCampButtonRow}>
            <button type="button" className={styles.campButton} onClick={onOpenCamp}>
              <span>Camp</span>
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default GameplayForm;
