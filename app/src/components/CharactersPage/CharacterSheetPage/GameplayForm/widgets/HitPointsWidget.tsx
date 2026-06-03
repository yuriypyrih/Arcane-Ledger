import clsx from "clsx";
import { BookHeart, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getCharacterRuntime } from "../../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import HitPointControls from "../../HitPointControls/HitPointControls";
import MagicTemporaryHitPoints from "../../MagicTemporaryHitPoints";
import TemporaryHitPoints from "../../TemporaryHitPoints";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import {
  normalizeMaxHitPointsMode
} from "../gameplayStateUtils";
import {
  applyDamageToCharacter,
  applyHealingToCharacter,
  assignManualTemporaryHitPointsForCharacter,
  syncAutomaticHitPointsForCharacter
} from "../hitPointState";
import DeathSavesWidget from "./DeathSavesWidget";
import HitPointsEditModal from "./HitPointsEditModal";
import LifeAndDeathLedgerModal from "./LifeAndDeathLedgerModal";
import styles from "./HitPointsWidget.module.css";

type HitPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function HitPointsWidget({ character, onPersistCharacter }: HitPointsWidgetProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const combatSummary = useMemo(() => getCharacterRuntime(character).combatSummary, [character]);
  const hitPoints = combatSummary.hitPoints;

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

  return (
    <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
      <header className={clsx(widgetShellStyles.widgetHeader, styles.header)}>
        <div className={styles.headerSummary}>
          <p className={widgetShellStyles.widgetTitle}>Hit Points</p>
          <div className={styles.headerValueRow}>
            <strong className={styles.headerHitPoints}>
              {hitPoints.normalizedCurrentHitPoints}/{hitPoints.effectiveMaxHitPoints} HP
            </strong>
            <TemporaryHitPoints
              temporaryHitPoints={hitPoints.temporaryHitPoints}
              temporaryHitPointsSource={character.temporaryHitPointsSource}
              description={hitPoints.temporaryHitPointsDescription}
              onSaveTemporaryHitPoints={(value) =>
                onPersistCharacter((currentCharacter) =>
                  assignManualTemporaryHitPointsForCharacter(currentCharacter, value)
                )
              }
            />
            {hitPoints.magicTemporaryHitPointsFeature ? (
              <MagicTemporaryHitPoints
                feature={hitPoints.magicTemporaryHitPointsFeature}
                magicTemporaryHitPoints={hitPoints.magicTemporaryHitPoints}
                magicTemporaryHitPointsSource={character.magicTemporaryHitPointsSource}
                onPersistCharacter={onPersistCharacter}
              />
            ) : null}
            <DeathSavesWidget character={character} onPersistCharacter={onPersistCharacter} />
          </div>
          <span className={styles.statusLabel}>{hitPoints.statusLabel}</span>
        </div>
        <div className={shared.headerActions}>
          {hitPoints.hasLedgerContent ? (
            <button
              type="button"
              className={clsx(
                shared.editButton,
                styles.editButton,
                styles.ledgerButton,
                hitPoints.isLedgerActive && styles.ledgerButtonActive
              )}
              onClick={() => setIsLedgerModalOpen(true)}
              aria-label="Open life and death ledger"
            >
              <BookHeart size={16} />
              Life & Death
            </button>
          ) : null}
          <button
            type="button"
            className={clsx(shared.editButton, styles.editButton)}
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </header>

      <HitPointControls
        currentHitPoints={character.currentHitPoints}
        maxHitPoints={hitPoints.effectiveMaxHitPoints}
        temporaryHitPoints={hitPoints.temporaryHitPoints}
        temporaryHitPointsSource={character.temporaryHitPointsSource}
        magicTemporaryHitPoints={hitPoints.magicTemporaryHitPoints}
        statusText={hitPoints.statusLabel}
        showSummary={false}
        temporaryHitPointsDescription={hitPoints.temporaryHitPointsDescription}
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
      {isLedgerModalOpen && hitPoints.hasLedgerContent ? (
        <LifeAndDeathLedgerModal
          character={character}
          onClose={() => setIsLedgerModalOpen(false)}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}
    </section>
  );
}

export default HitPointsWidget;
