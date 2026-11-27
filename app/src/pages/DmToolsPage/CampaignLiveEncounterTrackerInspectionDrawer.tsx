import { getCompanionStatBlocks } from "../CharactersPage/companionStatBlocks";
import { useId, useState } from "react";
import CreatureDefensesEditor from "./CreatureDefensesEditor";
import CreatureTypeLinkNotice from "./CreatureTypeLinkNotice";
import CreatureImageUrlField from "./CreatureImageUrlField";
import CreatureResistanceVisibilityToggle from "./CreatureResistanceVisibilityToggle";
import DeathSavesTracker from "../../components/CharactersPage/CharacterSheetPage/GameplayForm/widgets/DeathSavesTracker";
import HitPointControls from "../../components/CharactersPage/CharacterSheetPage/HitPointControls/HitPointControls";
import MonsterEntryRenderer from "../../components/MonsterEntryRenderer/MonsterEntryRenderer";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetDrawer
} from "../../components/Overlay";
import type {
  CampaignLiveEncounterTrackerCreatureRecord,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerPartyCompanionRecord,
  CampaignLiveEncounterTrackerPartyMemberRecord
} from "../../api/campaigns";
import type {
  EncounterCreatureWriteRecord,
  EncounterTemplateCreatureRecord
} from "../../api/encounterTemplates";
import type { CharacterCompanion } from "../../types";
import companionStyles from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/CompanionsSection.module.css";
import { getCompanionDisplayType } from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/companionUtils";
import {
  applyDamageToCharacterCompanion,
  applyHealingToCharacterCompanion,
  assignManualTemporaryHitPointsToCharacterCompanion,
  resetCharacterCompanionDeathSaves,
  updateCharacterCompanionDeathSaves
} from "../CharactersPage/companions";
import {
  getDeathSaveStatusLabel,
  isDeathSaveTrackResolved,
  normalizeDeathSaveTrack
} from "../CharactersPage/deathSaves";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";
import { preserveEncounterExtras, toEncounterCreatureRecord } from "./encounterCreatureUtils";
import { createEncounterStatBlockRendererModel } from "./liveEncounterTrackerStatBlockAdapter";

type LiveEncounterCreatureUpdate = (
  creatureId: string,
  update: (creature: EncounterTemplateCreatureRecord) => EncounterCreatureWriteRecord
) => void | Promise<void>;

type CampaignLiveEncounterTrackerInspectionDrawerProps = {
  participant: CampaignLiveEncounterTrackerParticipantRecord;
  readOnly?: boolean;
  /** How many creatures share this creature's type (itself included); 0 or 1 means it is on its own. */
  linkedCreatureCount?: number;
  onClose: () => void;
  onSetResistanceVisibility?: (creatureId: string, show: boolean) => void | Promise<void>;
  onUpdateCreature?: LiveEncounterCreatureUpdate;
};

function getParticipantName(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  if (participant.kind === "party-member") {
    return participant.statBlock?.name ?? participant.summary.name;
  }

  if (participant.kind === "party-companion") {
    return participant.companion.name;
  }

  return participant.creature.name;
}

function getPartyMemberTypeSummary(participant: CampaignLiveEncounterTrackerPartyMemberRecord) {
  const statBlock = participant.statBlock;

  if (statBlock) {
    const computedSummary = [statBlock.species, statBlock.className].filter(Boolean).join(" ");

    return computedSummary || statBlock.typeLabel || "";
  }

  return [participant.summary.species, participant.summary.className].filter(Boolean).join(" ");
}

function getPartyMemberSpeedSummary(participant: CampaignLiveEncounterTrackerPartyMemberRecord) {
  const speed = participant.statBlock?.speed;

  return typeof speed === "string" && speed.trim().length > 0 ? `Speed: ${speed.trim()}` : "";
}

function getParticipantSummary(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  if (participant.kind === "creature") {
    return getCompanionDisplayType(participant.creature);
  }

  if (participant.kind === "party-companion") {
    return [
      getCompanionDisplayType(participant.companion),
      participant.summary.name ? `Companion of ${participant.summary.name}` : ""
    ]
      .filter((value) => value.length > 0)
      .join(" - ");
  }

  return [getPartyMemberTypeSummary(participant), getPartyMemberSpeedSummary(participant)]
    .filter((value) => value.length > 0)
    .join(" - ");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toEncounterCreatureCompanion(
  creature: EncounterTemplateCreatureRecord
): CharacterCompanion {
  return {
    ...creature,
    source: "Manual",
    separateInitiative: false
  };
}

function getPartyMemberVitalityLabel(participant: CampaignLiveEncounterTrackerPartyMemberRecord) {
  const statBlock = participant.statBlock;

  if (
    !statBlock ||
    !isFiniteNumber(statBlock.currentHitPoints) ||
    !isFiniteNumber(statBlock.hitPoints)
  ) {
    return undefined;
  }

  return getDeathSaveStatusLabel(
    statBlock.currentHitPoints,
    Math.max(1, statBlock.hitPoints),
    normalizeDeathSaveTrack(statBlock.deathSaves)
  );
}

function isMakingDeathSaves(
  currentHitPoints: number,
  deathSaves: ReturnType<typeof normalizeDeathSaveTrack>
) {
  return currentHitPoints <= 0 && !isDeathSaveTrackResolved(deathSaves);
}

function MemberStatBlock({
  participant
}: {
  participant: CampaignLiveEncounterTrackerPartyMemberRecord;
}) {
  const statBlock = participant.statBlock;

  if (!statBlock) {
    return (
      <section className={styles.liveTrackerDrawerSection}>
        <h4>Stat Block</h4>
        <p className={styles.liveTrackerDrawerMutedText}>
          No encounter stat block summary is available for this party member yet.
        </p>
      </section>
    );
  }

  const rendererModel = createEncounterStatBlockRendererModel(statBlock);

  return (
    <section className={styles.liveTrackerDrawerSection}>
      <h4>Stat Block</h4>
      <MonsterEntryRenderer
        actionGroups={rendererModel.actionGroups}
        className={styles.liveTrackerMonsterEntry}
        detailRows={rendererModel.detailRows}
        monster={rendererModel.monster}
        vitalRows={rendererModel.vitalRows}
      />
    </section>
  );
}

function CompanionStatBlock({
  participant
}: {
  participant: CampaignLiveEncounterTrackerPartyCompanionRecord;
}) {
  const companion = participant.companion;
  const blocks = getCompanionStatBlocks(companion);
  const description = (companion.description ?? "").trim();
  const hasHitPointSummary =
    isFiniteNumber(companion.currentHitPoints) && isFiniteNumber(companion.maxHitPoints);

  return (
    <>
      {description ? (
        <section className={styles.liveTrackerDrawerSection}>
          <h4>Description</h4>
          <p className={styles.liveTrackerDrawerDescription}>{description}</p>
        </section>
      ) : null}
      {blocks.map((block) => (
        <section key={block.id} className={styles.liveTrackerDrawerSection}>
          <h4>Stat Block</h4>
          <MonsterEntryRenderer
            monster={block.monster}
            className={styles.liveTrackerMonsterEntry}
            headingTag={block.modified ? "Modded" : undefined}
          />
        </section>
      ))}
      {!hasHitPointSummary && !description && blocks.length === 0 ? (
        <p className={styles.liveTrackerDrawerMutedText}>
          No information available for the companion.
        </p>
      ) : null}
    </>
  );
}

function CreatureStatBlock({
  participant
}: {
  participant: CampaignLiveEncounterTrackerCreatureRecord;
}) {
  const creature = participant.creature;
  const monster = creature.inheritedCreatureEntry;
  const description = (creature.description ?? "").trim();
  const hasHitPointSummary =
    isFiniteNumber(creature.currentHitPoints) && isFiniteNumber(creature.maxHitPoints);

  return (
    <>
      {description ? (
        <section className={styles.liveTrackerDrawerSection}>
          <h4>Description</h4>
          <p className={styles.liveTrackerDrawerDescription}>{description}</p>
        </section>
      ) : null}
      {monster ? (
        <section className={styles.liveTrackerDrawerSection}>
          <h4>Stat Block</h4>
          <MonsterEntryRenderer
            monster={monster}
            className={styles.liveTrackerMonsterEntry}
            headingTag={creature.inheritedCreatureEntryModified ? "Modded" : undefined}
            showHeading={!creature.statBlockNameHidden}
          />
        </section>
      ) : null}
      {!hasHitPointSummary && !description && !monster ? (
        <p className={styles.liveTrackerDrawerMutedText}>
          No information available for the creature.
        </p>
      ) : null}
    </>
  );
}

function getCreatureVitalityLabel(participant: CampaignLiveEncounterTrackerCreatureRecord) {
  const creature = participant.creature;

  if (creature.vitalityStatusLabel) {
    return creature.vitalityStatusLabel;
  }

  return typeof creature.currentHitPoints === "number" && typeof creature.maxHitPoints === "number"
    ? getDeathSaveStatusLabel(
        creature.currentHitPoints,
        Math.max(1, creature.maxHitPoints),
        normalizeDeathSaveTrack(creature.deathSaves)
      )
    : undefined;
}

function getCompanionVitalityLabel(participant: CampaignLiveEncounterTrackerPartyCompanionRecord) {
  const companion = participant.companion;

  return typeof companion.currentHitPoints === "number" &&
    typeof companion.maxHitPoints === "number"
    ? getDeathSaveStatusLabel(
        companion.currentHitPoints,
        Math.max(1, companion.maxHitPoints),
        normalizeDeathSaveTrack(companion.deathSaves)
      )
    : undefined;
}

function LiveEncounterHitPointsPanel({
  participant,
  readOnly,
  onUpdateCreature
}: {
  participant: CampaignLiveEncounterTrackerParticipantRecord;
  readOnly: boolean;
  onUpdateCreature?: LiveEncounterCreatureUpdate;
}) {
  if (participant.kind === "party-member") {
    const statBlock = participant.statBlock;

    if (
      !statBlock ||
      !isFiniteNumber(statBlock.currentHitPoints) ||
      !isFiniteNumber(statBlock.hitPoints)
    ) {
      return null;
    }

    const deathSaves = normalizeDeathSaveTrack(statBlock.deathSaves);
    const shouldShowDeathSaves = isMakingDeathSaves(statBlock.currentHitPoints, deathSaves);

    return (
      <HitPointControls
        className={companionStyles.companionHpControls}
        currentHitPoints={statBlock.currentHitPoints}
        maxHitPoints={statBlock.hitPoints}
        temporaryHitPoints={
          isFiniteNumber(statBlock.temporaryHitPoints) ? statBlock.temporaryHitPoints : 0
        }
        magicTemporaryHitPoints={
          isFiniteNumber(statBlock.magicTemporaryHitPoints) ? statBlock.magicTemporaryHitPoints : 0
        }
        statusText={getPartyMemberVitalityLabel(participant)}
        extraTemporaryHitPointControl={
          shouldShowDeathSaves ? <DeathSavesTracker deathSaves={deathSaves} readOnly /> : null
        }
        readOnly
      />
    );
  }

  if (participant.kind === "party-companion") {
    const companion = participant.companion;

    if (!isFiniteNumber(companion.currentHitPoints) || !isFiniteNumber(companion.maxHitPoints)) {
      return null;
    }

    const deathSaves = normalizeDeathSaveTrack(companion.deathSaves);
    const shouldShowDeathSaves = isMakingDeathSaves(companion.currentHitPoints, deathSaves);

    return (
      <HitPointControls
        className={companionStyles.companionHpControls}
        currentHitPoints={companion.currentHitPoints}
        maxHitPoints={companion.maxHitPoints}
        temporaryHitPoints={
          isFiniteNumber(companion.temporaryHitPoints) ? companion.temporaryHitPoints : 0
        }
        temporaryHitPointsSource={companion.temporaryHitPointsSource}
        statusText={getCompanionVitalityLabel(participant)}
        extraTemporaryHitPointControl={
          shouldShowDeathSaves ? <DeathSavesTracker deathSaves={deathSaves} readOnly /> : null
        }
        readOnly
      />
    );
  }

  const creature = participant.creature;

  const deathSaves = normalizeDeathSaveTrack(creature.deathSaves);
  const shouldShowDeathSaves =
    creature.isMakingDeathSaves === true ||
    (!readOnly &&
      isFiniteNumber(creature.currentHitPoints) &&
      isMakingDeathSaves(creature.currentHitPoints, deathSaves));

  if (!isFiniteNumber(creature.currentHitPoints) || !isFiniteNumber(creature.maxHitPoints)) {
    return shouldShowDeathSaves ? (
      <div className={companionStyles.companionHpControls}>
        <DeathSavesTracker deathSaves={deathSaves} readOnly />
      </div>
    ) : null;
  }

  const canEdit = !readOnly && Boolean(onUpdateCreature);
  const creatureId = participant.creatureId ?? creature.id;

  function updateCreature(
    update: (creature: EncounterTemplateCreatureRecord) => EncounterTemplateCreatureRecord
  ) {
    return onUpdateCreature?.(creatureId, update);
  }

  function updateCreatureWithCompanionHelper(
    update: (creature: CharacterCompanion) => CharacterCompanion
  ) {
    return updateCreature((currentCreature) =>
      // The companion shape has no picture or creature type; keep them through HP edits.
      preserveEncounterExtras(
        currentCreature,
        toEncounterCreatureRecord(update(toEncounterCreatureCompanion(currentCreature)))
      )
    );
  }

  return (
    <HitPointControls
      className={companionStyles.companionHpControls}
      currentHitPoints={creature.currentHitPoints}
      maxHitPoints={creature.maxHitPoints}
      temporaryHitPoints={
        isFiniteNumber(creature.temporaryHitPoints) ? creature.temporaryHitPoints : 0
      }
      temporaryHitPointsSource={creature.temporaryHitPointsSource}
      statusText={getCreatureVitalityLabel(participant)}
      extraTemporaryHitPointControl={
        shouldShowDeathSaves ? (
          <DeathSavesTracker
            deathSaves={deathSaves}
            ignoreNextRollOverrides
            modalEyebrow="Creature"
            rollDescription="Roll a plain death saving throw for this creature."
            showDiceSettings={false}
            readOnly={!canEdit}
            onReset={() =>
              void updateCreatureWithCompanionHelper((currentCreature) =>
                resetCharacterCompanionDeathSaves(currentCreature)
              )
            }
            onUpdate={(track) =>
              void updateCreatureWithCompanionHelper((currentCreature) =>
                updateCharacterCompanionDeathSaves(currentCreature, track)
              )
            }
          />
        ) : null
      }
      temporaryHitPointsDescription="When taking damage the temporary hit points are consumed first. They do not stack."
      readOnly={!canEdit}
      onDamage={(amount) =>
        void updateCreatureWithCompanionHelper((currentCreature) =>
          applyDamageToCharacterCompanion(currentCreature, amount)
        )
      }
      onHeal={(amount) =>
        void updateCreatureWithCompanionHelper((currentCreature) =>
          applyHealingToCharacterCompanion(currentCreature, amount)
        )
      }
      onSaveTemporaryHitPoints={(value) =>
        void updateCreatureWithCompanionHelper((currentCreature) =>
          assignManualTemporaryHitPointsToCharacterCompanion(currentCreature, value)
        )
      }
    />
  );
}

function CampaignLiveEncounterTrackerInspectionDrawer({
  participant,
  readOnly = true,
  linkedCreatureCount = 0,
  onClose,
  onSetResistanceVisibility,
  onUpdateCreature
}: CampaignLiveEncounterTrackerInspectionDrawerProps) {
  const titleId = useId();
  const [drawerNotice, setDrawerNotice] = useState<string | null>(null);
  const participantName = getParticipantName(participant);
  const participantSummary = getParticipantSummary(participant);

  async function handleUpdateCreature(
    creatureId: string,
    update: (creature: EncounterTemplateCreatureRecord) => EncounterCreatureWriteRecord
  ) {
    if (!onUpdateCreature) {
      return;
    }

    setDrawerNotice(null);

    try {
      await onUpdateCreature(creatureId, update);
    } catch (updateError) {
      setDrawerNotice(
        getDmToolsApiErrorMessage(updateError, "Unable to update creature hit points.")
      );
    }
  }

  return (
    <SheetDrawer titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>
            {participant.kind === "party-member"
              ? "Party Member"
              : participant.kind === "party-companion"
                ? "Companion"
                : "Creature Inspection"}
          </OverlayBadge>
          <OverlayTitle id={titleId}>{participantName}</OverlayTitle>
          {participantSummary ? <OverlaySummary>{participantSummary}</OverlaySummary> : null}
        </OverlayHeaderContent>
        <OverlayCloseButton label={`Close ${participantName} inspection`} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.liveTrackerDrawerBody}>
        <LiveEncounterHitPointsPanel
          participant={participant}
          readOnly={readOnly}
          onUpdateCreature={handleUpdateCreature}
        />
        {drawerNotice ? <p className={styles.modalError}>{drawerNotice}</p> : null}
        {participant.kind === "creature" && !readOnly && onSetResistanceVisibility ? (
          <CreatureResistanceVisibilityToggle
            isVisible={
              participant.creature.effectivePlayerVisibilitySettings.showResistancesAndImmunities
            }
            onChange={async (show) => {
              setDrawerNotice(null);

              try {
                await onSetResistanceVisibility(
                  participant.creatureId ?? participant.creature.id,
                  show
                );
              } catch (visibilityError) {
                setDrawerNotice(
                  getDmToolsApiErrorMessage(visibilityError, "Unable to change what players see.")
                );
              }
            }}
          />
        ) : null}
        {participant.kind === "creature" &&
        !readOnly &&
        onUpdateCreature &&
        linkedCreatureCount > 1 ? (
          <CreatureTypeLinkNotice
            linkedCount={linkedCreatureCount}
            onMakeIndependent={() =>
              handleUpdateCreature(
                participant.creatureId ?? participant.creature.id,
                (creature) => ({
                  ...creature,
                  unlinkFromType: true
                })
              )
            }
          />
        ) : null}
        {participant.kind === "creature" && !readOnly && onUpdateCreature ? (
          <CreatureDefensesEditor
            key={JSON.stringify(
              participant.creature.inheritedCreatureEntry?.resistances_and_immunities ?? null
            )}
            creature={participant.creature as EncounterTemplateCreatureRecord}
            onUpdate={(update) =>
              handleUpdateCreature(participant.creatureId ?? participant.creature.id, update)
            }
          />
        ) : null}
        {participant.kind === "creature" && !readOnly && onUpdateCreature ? (
          <CreatureImageUrlField
            key={participant.creature.imageUrl ?? ""}
            creature={participant.creature as EncounterTemplateCreatureRecord}
            onUpdate={(update) =>
              handleUpdateCreature(participant.creatureId ?? participant.creature.id, update)
            }
          />
        ) : null}

        {participant.kind === "party-member" ? (
          <MemberStatBlock participant={participant} />
        ) : participant.kind === "party-companion" ? (
          <CompanionStatBlock participant={participant} />
        ) : (
          <CreatureStatBlock participant={participant} />
        )}
      </OverlayBody>
    </SheetDrawer>
  );
}

export default CampaignLiveEncounterTrackerInspectionDrawer;
