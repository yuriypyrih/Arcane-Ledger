import { useId, useState } from "react";
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
import {
  applyDamageToCharacterCompanion,
  applyHealingToCharacterCompanion,
  assignManualTemporaryHitPointsToCharacterCompanion,
  getCompanionStatusLabel,
  resetCharacterCompanionDeathSaves,
  updateCharacterCompanionDeathSaves
} from "../../../../pages/CharactersPage/companions";
import { normalizeDeathSaveTrack } from "../../../../pages/CharactersPage/deathSaves";
import { getStatusDurationLabel } from "../../../../pages/CharactersPage/traits";
import type { Character, CharacterCompanion } from "../../../../types";
import DeathSavesTracker from "../GameplayForm/widgets/DeathSavesTracker";
import HitPointControls from "../HitPointControls/HitPointControls";
import { getCompanionDisplayType, getCompanionSourceLabel } from "./companionUtils";
import styles from "./CompanionsSection.module.css";

type CreatureDrawerProps = {
  character?: Pick<Character, "abilities" | "level">;
  creature: CharacterCompanion;
  getErrorMessage?: (error: unknown, fallback: string) => string;
  onClose: () => void;
  onUpdateCreature: (creature: CharacterCompanion) => void | Promise<void>;
  showDuration?: boolean;
  showSource?: boolean;
};

function getDefaultErrorMessage(_error: unknown, fallback: string) {
  return fallback;
}

function CreatureDrawer({
  character,
  creature,
  getErrorMessage = getDefaultErrorMessage,
  onClose,
  onUpdateCreature,
  showDuration = true,
  showSource = showDuration
}: CreatureDrawerProps) {
  const titleId = useId();
  const [drawerNotice, setDrawerNotice] = useState<string | null>(null);
  const statBlock = getCompanionStatBlock(creature, character);
  const deathSaves = normalizeDeathSaveTrack(creature.deathSaves);
  const statusLabel = getCompanionStatusLabel(creature);
  const creatureDescription = creature.description.trim();
  const creatureType = getCompanionDisplayType(creature);
  const isStatBlockModified = creature.inheritedCreatureEntryModified === true;
  const shouldShowDeathSaves =
    creature.currentHitPoints <= 0 && deathSaves.resolution !== "instant-death";
  const shouldShowDetailsGrid = showSource || showDuration;

  async function updateCreature(
    update: (currentCreature: CharacterCompanion) => CharacterCompanion,
    fallbackMessage = "Unable to update creature."
  ) {
    setDrawerNotice(null);

    try {
      await onUpdateCreature(update(creature));
      return true;
    } catch (error) {
      setDrawerNotice(getErrorMessage(error, fallbackMessage));
      return false;
    }
  }

  return (
    <SheetDrawer titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>Creature Inspection</OverlayBadge>
          <OverlayTitle id={titleId}>{creature.name}</OverlayTitle>
          {creatureType ? <OverlaySummary>{creatureType}</OverlaySummary> : null}
        </OverlayHeaderContent>
        <OverlayCloseButton onClick={onClose} label="Close creature details" />
      </OverlayHeader>

      <OverlayBody className={styles.drawerBody}>
        {shouldShowDetailsGrid ? (
          <OverlayDetailsGrid>
            {showSource ? (
              <CellContainer label="Source" content={getCompanionSourceLabel(creature)} />
            ) : null}
            {showDuration ? (
              <CellContainer
                label="Duration"
                content={getStatusDurationLabel(creature.duration)}
              />
            ) : null}
          </OverlayDetailsGrid>
        ) : null}

        <HitPointControls
          className={styles.companionHpControls}
          currentHitPoints={creature.currentHitPoints}
          maxHitPoints={creature.maxHitPoints}
          temporaryHitPoints={creature.temporaryHitPoints}
          temporaryHitPointsSource={creature.temporaryHitPointsSource}
          statusText={statusLabel}
          extraTemporaryHitPointControl={
            shouldShowDeathSaves ? (
              <DeathSavesTracker
                deathSaves={deathSaves}
                ignoreNextRollOverrides
                modalEyebrow="Creature"
                rollDescription="Roll a plain death saving throw for this creature."
                showDiceSettings={false}
                onReset={() =>
                  void updateCreature((currentCreature) =>
                    resetCharacterCompanionDeathSaves(currentCreature)
                  )
                }
                onUpdate={(track) =>
                  void updateCreature((currentCreature) =>
                    updateCharacterCompanionDeathSaves(currentCreature, track)
                  )
                }
              />
            ) : null
          }
          temporaryHitPointsDescription="When taking damage the temporary hit points are consumed first. They do not stack."
          onDamage={(amount) =>
            void updateCreature((currentCreature) =>
              applyDamageToCharacterCompanion(currentCreature, amount)
            )
          }
          onHeal={(amount) =>
            void updateCreature((currentCreature) =>
              applyHealingToCharacterCompanion(currentCreature, amount)
            )
          }
          onSaveTemporaryHitPoints={(value) =>
            void updateCreature((currentCreature) =>
              assignManualTemporaryHitPointsToCharacterCompanion(currentCreature, value)
            )
          }
        />

        {drawerNotice ? <p className={styles.notice}>{drawerNotice}</p> : null}

        {creatureDescription ? (
          <section className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Description</h4>
            <p className={styles.drawerDescription}>{creatureDescription}</p>
          </section>
        ) : null}

        {statBlock ? (
          <section className={styles.drawerSection}>
            <div className={styles.drawerSectionHeader}>
              <div>
                <p className={styles.panelEyebrow}>Chosen stat block</p>
              </div>
            </div>
            <MonsterEntryRenderer
              monster={statBlock}
              className={styles.inheritedMonsterEntry}
              headingTag={isStatBlockModified ? "Modded" : undefined}
            />
          </section>
        ) : null}
      </OverlayBody>
    </SheetDrawer>
  );
}

export default CreatureDrawer;
