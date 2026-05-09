import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getMagicTemporaryHitPointsFeatureForCharacter } from "../../../../../pages/CharactersPage/classFeatures/magicTemporaryHitPoints";
import { clampNumber } from "../../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { getEffectiveHitPointMaximumForCharacter } from "../../../../../pages/CharactersPage/traits";
import HitPointControls from "../../HitPointControls/HitPointControls";
import MagicTemporaryHitPoints from "../../MagicTemporaryHitPoints";
import TemporaryHitPoints from "../../TemporaryHitPoints";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import {
  normalizeDeathSaves,
  normalizeMagicTemporaryHitPoints,
  normalizeMaxHitPointsMode,
  normalizeTemporaryHitPoints
} from "../gameplayStateUtils";
import {
  applyDamageToCharacter,
  applyHealingToCharacter,
  assignManualTemporaryHitPointsForCharacter,
  syncAutomaticHitPointsForCharacter
} from "../hitPointState";
import HitPointsEditModal from "./HitPointsEditModal";
import styles from "./HitPointsWidget.module.css";

type HitPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function HitPointsWidget({ character, onPersistCharacter }: HitPointsWidgetProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const effectiveHitPoints = getEffectiveHitPointMaximumForCharacter(character);

  useEffect(() => {
    if (normalizeMaxHitPointsMode(character.maxHitPointsMode) !== "automatic") {
      return;
    }

    const nextCharacter = syncAutomaticHitPointsForCharacter(character);

    if (nextCharacter === character) {
      return;
    }

    onPersistCharacter((currentCharacter) => syncAutomaticHitPointsForCharacter(currentCharacter));
  }, [
    character,
    character.abilities.CON,
    character.className,
    character.currentHitPoints,
    character.hitPoints,
    character.level,
    character.maxHitPointsMode,
    onPersistCharacter
  ]);

  const normalizedCurrentHitPoints = clampNumber(
    character.currentHitPoints,
    0,
    effectiveHitPoints,
    character.currentHitPoints
  );
  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const magicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(
    character.magicTemporaryHitPoints
  );
  const magicTemporaryHitPointsFeature = getMagicTemporaryHitPointsFeatureForCharacter(character);
  const deathSaves = normalizeDeathSaves(character.deathSaves);
  const statusLabel =
    deathSaves.failures >= 3
      ? "Dead"
      : deathSaves.successes >= 3
        ? "Stable"
        : normalizedCurrentHitPoints === 0
          ? "Unconscious"
          : normalizedCurrentHitPoints <= Math.ceil(effectiveHitPoints * 0.35)
            ? "Critical"
            : "Stable";
  const temporaryHitPointsDescription =
    "When taking damage the temporary hit points are consumed first. They do not stack and they vanish after resting at a camp.";

  return (
    <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
      <header className={clsx(widgetShellStyles.widgetHeader, styles.header)}>
        <div className={styles.headerSummary}>
          <p className={widgetShellStyles.widgetTitle}>Hit Points</p>
          <div className={styles.headerValueRow}>
            <strong className={styles.headerHitPoints}>
              {normalizedCurrentHitPoints}/{effectiveHitPoints} HP
            </strong>
            <TemporaryHitPoints
              temporaryHitPoints={temporaryHitPoints}
              temporaryHitPointsSource={character.temporaryHitPointsSource}
              description={temporaryHitPointsDescription}
              onSaveTemporaryHitPoints={(value) =>
                onPersistCharacter((currentCharacter) =>
                  assignManualTemporaryHitPointsForCharacter(currentCharacter, value)
                )
              }
            />
            {magicTemporaryHitPointsFeature ? (
              <MagicTemporaryHitPoints
                feature={magicTemporaryHitPointsFeature}
                magicTemporaryHitPoints={magicTemporaryHitPoints}
                magicTemporaryHitPointsSource={character.magicTemporaryHitPointsSource}
                onPersistCharacter={onPersistCharacter}
              />
            ) : null}
          </div>
          <span className={styles.statusLabel}>{statusLabel}</span>
        </div>
        <button
          type="button"
          className={clsx(shared.editButton, styles.editButton)}
          onClick={() => setIsEditModalOpen(true)}
        >
          <Pencil size={16} />
          Edit
        </button>
      </header>

      <HitPointControls
        currentHitPoints={character.currentHitPoints}
        maxHitPoints={effectiveHitPoints}
        temporaryHitPoints={temporaryHitPoints}
        temporaryHitPointsSource={character.temporaryHitPointsSource}
        magicTemporaryHitPoints={magicTemporaryHitPoints}
        statusText={statusLabel}
        showSummary={false}
        temporaryHitPointsDescription={temporaryHitPointsDescription}
        onDamage={(amount) =>
          onPersistCharacter((currentCharacter) => applyDamageToCharacter(currentCharacter, amount))
        }
        onHeal={(amount) =>
          onPersistCharacter((currentCharacter) =>
            applyHealingToCharacter(currentCharacter, amount)
          )
        }
        onSaveTemporaryHitPoints={(value) =>
          onPersistCharacter((currentCharacter) =>
            assignManualTemporaryHitPointsForCharacter(currentCharacter, value)
          )
        }
      />
      {isEditModalOpen ? (
        <HitPointsEditModal
          character={character}
          onClose={() => setIsEditModalOpen(false)}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}
    </section>
  );
}

export default HitPointsWidget;
