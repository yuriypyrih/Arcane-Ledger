import { useId } from "react";
import CellContainer from "../../../CellContainer/CellContainer";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayDetailsGrid,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetDrawer
} from "../../../Overlay";
import MonsterEntryRenderer from "../../../MonsterEntryRenderer/MonsterEntryRenderer";
import { getCompanionStatBlock } from "../../../../pages/CharactersPage/beastMasterCompanions";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  applyDamageToCharacterCompanion,
  applyHealingToCharacterCompanion,
  assignManualTemporaryHitPointsToCharacterCompanion,
  getCompanionStatusLabel,
  resetCharacterCompanionDeathSaves,
  updateCharacterCompanionDeathSaves
} from "../../../../pages/CharactersPage/companions";
import { normalizeDeathSaveTrack } from "../../../../pages/CharactersPage/deathSaves";
import type { Character, CharacterCompanion } from "../../../../types";
import { getStatusDurationLabel } from "../../../../pages/CharactersPage/traits";
import DeathSavesTracker from "../GameplayForm/widgets/DeathSavesTracker";
import HitPointControls from "../HitPointControls/HitPointControls";
import { getCompanionSourceLabel } from "./companionUtils";
import styles from "./CompanionsSection.module.css";

type CompanionDrawerProps = {
  character: Character;
  companion: CharacterCompanion;
  onPersistCharacter: PersistCharacterUpdater;
  onClose: () => void;
};

function CompanionDrawer({
  character,
  companion,
  onPersistCharacter,
  onClose
}: CompanionDrawerProps) {
  const titleId = useId();
  const statBlock = getCompanionStatBlock(companion, character);
  const deathSaves = normalizeDeathSaveTrack(companion.deathSaves);
  const statusLabel = getCompanionStatusLabel(companion);
  const shouldShowDeathSaves =
    companion.currentHitPoints <= 0 && deathSaves.resolution !== "instant-death";

  function updateCompanion(update: (companion: CharacterCompanion) => CharacterCompanion) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      companions: (currentCharacter.companions ?? []).map((currentCompanion) =>
        currentCompanion.id === companion.id ? update(currentCompanion) : currentCompanion
      )
    }));
  }

  return (
    <SheetDrawer titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>Companion</OverlayBadge>
          <OverlayTitle id={titleId}>{companion.name}</OverlayTitle>
          <OverlaySummary>{companion.type}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton onClick={onClose} label="Close companion details" />
      </OverlayHeader>

      <OverlayBody className={styles.drawerBody}>
        <OverlayDetailsGrid>
          <CellContainer label="Source" content={getCompanionSourceLabel(companion)} />
          <CellContainer label="Duration" content={getStatusDurationLabel(companion.duration)} />
        </OverlayDetailsGrid>

        <HitPointControls
          className={styles.companionHpControls}
          currentHitPoints={companion.currentHitPoints}
          maxHitPoints={companion.maxHitPoints}
          temporaryHitPoints={companion.temporaryHitPoints}
          temporaryHitPointsSource={companion.temporaryHitPointsSource}
          statusText={statusLabel}
          extraTemporaryHitPointControl={
            shouldShowDeathSaves ? (
              <DeathSavesTracker
                deathSaves={deathSaves}
                ignoreNextRollOverrides
                modalEyebrow="Companion"
                rollDescription="Roll a plain death saving throw for this companion."
                showDiceSettings={false}
                onReset={() =>
                  updateCompanion((currentCompanion) =>
                    resetCharacterCompanionDeathSaves(currentCompanion)
                  )
                }
                onUpdate={(track) =>
                  updateCompanion((currentCompanion) =>
                    updateCharacterCompanionDeathSaves(currentCompanion, track)
                  )
                }
              />
            ) : null
          }
          temporaryHitPointsDescription="When taking damage the temporary hit points are consumed first. They do not stack."
          onDamage={(amount) =>
            updateCompanion((currentCompanion) =>
              applyDamageToCharacterCompanion(currentCompanion, amount)
            )
          }
          onHeal={(amount) =>
            updateCompanion((currentCompanion) =>
              applyHealingToCharacterCompanion(currentCompanion, amount)
            )
          }
          onSaveTemporaryHitPoints={(value) =>
            updateCompanion((currentCompanion) =>
              assignManualTemporaryHitPointsToCharacterCompanion(currentCompanion, value)
            )
          }
        />

        <section className={styles.drawerSection}>
          <h4 className={styles.drawerSectionTitle}>Description</h4>
          <p className={styles.drawerDescription}>
            {companion.description.trim() || "No description added for this companion."}
          </p>
        </section>

        {statBlock ? (
          <section className={styles.drawerSection}>
            <div className={styles.drawerSectionHeader}>
              <div>
                <p className={styles.panelEyebrow}>Source reference</p>
                <h4 className={styles.drawerSectionTitle}>Stat block</h4>
              </div>
            </div>
            <MonsterEntryRenderer monster={statBlock} className={styles.inheritedMonsterEntry} />
          </section>
        ) : null}
      </OverlayBody>
    </SheetDrawer>
  );
}

export default CompanionDrawer;
