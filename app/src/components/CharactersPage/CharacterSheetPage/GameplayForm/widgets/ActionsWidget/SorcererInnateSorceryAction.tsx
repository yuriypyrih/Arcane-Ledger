import { useState } from "react";
import type { Character } from "../../../../../../types";
import {
  getUmbralFormActivationDisabledReason,
  getUmbralFormUsesRemaining,
  hasUmbralForm,
  umbralFormOptions,
  umbralFormSorceryPointCost,
  type UmbralFormOption
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererShadowForm";
import ActionButton from "../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../ActionShape";
import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import {
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { runWithActionConfirmationToast } from "../../../actionConfirmationToast";
import styles from "./SorcererInnateSorceryAction.module.css";

type SorcererInnateSorceryActionFooterProps = {
  character: Character;
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  crownOfSpellfireUnlocked: boolean;
  crownOfSpellfireUsesRemaining: number;
  crownOfSpellfireUsesTotal: number;
  crownOfSpellfireFallbackSorceryPointCost: number;
  crownOfSpellfireDisabledReason?: string | null;
  isCrownOfSpellfireSelected: boolean;
  onConfirm: (umbralForm?: UmbralFormOption) => void;
  onCrownOfSpellfireSelectedChange: (checked: boolean) => void;
};

export function SorcererInnateSorceryActionFooter({
  character,
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  crownOfSpellfireUnlocked,
  crownOfSpellfireUsesRemaining,
  crownOfSpellfireUsesTotal,
  crownOfSpellfireFallbackSorceryPointCost,
  crownOfSpellfireDisabledReason = null,
  isCrownOfSpellfireSelected,
  onConfirm,
  onCrownOfSpellfireSelectedChange
}: SorcererInnateSorceryActionFooterProps) {
  const [umbralForm, setUmbralForm] = useState<UmbralFormOption>();
  const umbralFormUnlocked = hasUmbralForm(character);
  const umbralFormDisabledReason = umbralFormUnlocked
    ? getUmbralFormActivationDisabledReason(character)
    : null;
  return (
    <div className={styles.footerStack}>
      {crownOfSpellfireUnlocked ? (
        <FeatureOptInToggle
          label="Crown of Spellfire"
          checked={isCrownOfSpellfireSelected}
          onCheckedChange={onCrownOfSpellfireSelectedChange}
          title={crownOfSpellfireDisabledReason ?? undefined}
          usage={createChargesOrResourceCardUsage(
            crownOfSpellfireUsesRemaining,
            crownOfSpellfireUsesTotal,
            createFeatureActionCardCost({
              amountText: String(crownOfSpellfireFallbackSorceryPointCost),
              icon: "sparkles"
            })
          )}
          usageKey="crown-of-spellfire"
        />
      ) : null}
      {umbralFormUnlocked
        ? umbralFormOptions.map((option) => (
            <FeatureOptInToggle
              key={option.key}
              label={option.label}
              checked={umbralForm === option.key}
              onCheckedChange={(checked) => setUmbralForm(checked ? option.key : undefined)}
              title={umbralFormDisabledReason ?? undefined}
              usage={createChargesOrResourceCardUsage(
                getUmbralFormUsesRemaining(character),
                1,
                createFeatureActionCardCost({
                  amountText: String(umbralFormSorceryPointCost),
                  icon: "sparkles"
                })
              )}
              usageKey={`umbral-form-${option.key}`}
            />
          ))
        : null}
      <ActionButton
        className={styles.confirmButton}
        onClick={() => runWithActionConfirmationToast(actionShape, () => onConfirm(umbralForm))}
        disabled={disabled || Boolean(umbralForm && umbralFormDisabledReason)}
        title={umbralForm ? (umbralFormDisabledReason ?? undefined) : undefined}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={actionShapeAvailable}
              multiCount={actionShapeMultiCount}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {confirmLabel}
      </ActionButton>
    </div>
  );
}
