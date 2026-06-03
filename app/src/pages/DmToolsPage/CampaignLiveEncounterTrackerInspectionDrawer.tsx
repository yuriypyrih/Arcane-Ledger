import { useId } from "react";
import HitPointBar from "../../components/CharactersPage/CharacterSheetPage/HitPointControls/HitPointBar";
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
  CampaignLiveEncounterTrackerPartyMemberRecord
} from "../../api/campaigns";
import styles from "./DmToolsPage.module.css";
import { createEncounterStatBlockRendererModel } from "./liveEncounterTrackerStatBlockAdapter";

type CampaignLiveEncounterTrackerInspectionDrawerProps = {
  participant: CampaignLiveEncounterTrackerParticipantRecord;
  onClose: () => void;
};

function formatNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value.toString() : "-";
}

function getParticipantName(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  return participant.kind === "party-member"
    ? (participant.statBlock?.name ?? participant.summary.name)
    : participant.creature.name;
}

function getParticipantSummary(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  if (participant.kind === "creature") {
    return participant.creature.type || "Creature";
  }

  const statBlock = participant.statBlock;

  return statBlock
    ? statBlock.typeLabel ||
        [statBlock.species, statBlock.className].filter(Boolean).join(" ")
    : [participant.summary.species, participant.summary.className].filter(Boolean).join(" ");
}

function ReadOnlyHitPointsPanel({
  armorClass,
  currentHitPoints,
  maxHitPoints,
  magicTemporaryHitPoints = 0,
  statusLabel,
  temporaryHitPoints = 0
}: {
  armorClass?: number | null;
  currentHitPoints?: number | null;
  maxHitPoints?: number | null;
  magicTemporaryHitPoints?: number;
  statusLabel?: string;
  temporaryHitPoints?: number;
}) {
  const resolvedCurrentHitPoints =
    typeof currentHitPoints === "number" && Number.isFinite(currentHitPoints)
      ? currentHitPoints
      : 0;
  const resolvedMaxHitPoints =
    typeof maxHitPoints === "number" && Number.isFinite(maxHitPoints) && maxHitPoints > 0
      ? maxHitPoints
      : 1;

  return (
    <section className={styles.liveTrackerReadOnlyHpPanel}>
      <div className={styles.liveTrackerReadOnlyHpHeader}>
        <div>
          <p className={styles.panelEyebrow}>Hit Points</p>
          <strong>
            {formatNumber(currentHitPoints)}/{formatNumber(maxHitPoints)} HP
          </strong>
          {statusLabel ? <span>{statusLabel}</span> : null}
        </div>
        <div className={styles.liveTrackerReadOnlyHpBadges}>
          {typeof armorClass === "number" && Number.isFinite(armorClass) ? (
            <span>AC {armorClass}</span>
          ) : null}
          {temporaryHitPoints > 0 ? <span>Temp {temporaryHitPoints}</span> : null}
          {magicTemporaryHitPoints > 0 ? <span>Magic Temp {magicTemporaryHitPoints}</span> : null}
        </div>
      </div>
      <HitPointBar
        currentHitPoints={resolvedCurrentHitPoints}
        maxHitPoints={resolvedMaxHitPoints}
        temporaryHitPoints={temporaryHitPoints}
        magicTemporaryHitPoints={magicTemporaryHitPoints}
      />
    </section>
  );
}

function ReadOnlyDeathSaves({
  deathSaves
}: {
  deathSaves: CampaignLiveEncounterTrackerCreatureRecord["creature"]["deathSaves"];
}) {
  if (!deathSaves) {
    return null;
  }

  return (
    <div className={styles.liveTrackerReadOnlyDeathSaves}>
      <span>Death Saves</span>
      <span>Successes {deathSaves.successes ?? 0}/3</span>
      <span>Failures {deathSaves.failures ?? 0}/3</span>
      {deathSaves.resolution ? <span>{deathSaves.resolution}</span> : null}
    </div>
  );
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
      />
    </section>
  );
}

function CreatureStatBlock({
  participant
}: {
  participant: CampaignLiveEncounterTrackerCreatureRecord;
}) {
  const creature = participant.creature;
  const monster = creature.inheritedCreatureEntry;
  const description = creature.description.trim();

  return (
    <>
      <ReadOnlyDeathSaves deathSaves={creature.deathSaves} />
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
          />
        </section>
      ) : null}
    </>
  );
}

function CampaignLiveEncounterTrackerInspectionDrawer({
  participant,
  onClose
}: CampaignLiveEncounterTrackerInspectionDrawerProps) {
  const titleId = useId();
  const participantName = getParticipantName(participant);
  const participantSummary = getParticipantSummary(participant);
  const statBlock = participant.kind === "party-member" ? participant.statBlock : null;
  const armorClass =
    participant.kind === "party-member"
      ? statBlock?.armorClass
      : participant.creature.inheritedCreatureEntry?.armor_class;
  const currentHitPoints =
    participant.kind === "party-member"
      ? statBlock?.currentHitPoints
      : participant.creature.currentHitPoints;
  const maxHitPoints =
    participant.kind === "party-member" ? statBlock?.hitPoints : participant.creature.maxHitPoints;
  const temporaryHitPoints =
    participant.kind === "party-member"
      ? statBlock?.temporaryHitPoints
      : participant.creature.temporaryHitPoints;
  const magicTemporaryHitPoints =
    participant.kind === "party-member" ? statBlock?.magicTemporaryHitPoints : 0;

  return (
    <SheetDrawer titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>
            {participant.kind === "party-member" ? "Party Member" : "Creature Inspection"}
          </OverlayBadge>
          <OverlayTitle id={titleId}>{participantName}</OverlayTitle>
          {participantSummary ? <OverlaySummary>{participantSummary}</OverlaySummary> : null}
        </OverlayHeaderContent>
        <OverlayCloseButton label={`Close ${participantName} inspection`} onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.liveTrackerDrawerBody}>
        <ReadOnlyHitPointsPanel
          armorClass={armorClass}
          currentHitPoints={currentHitPoints}
          maxHitPoints={maxHitPoints}
          temporaryHitPoints={temporaryHitPoints}
          magicTemporaryHitPoints={magicTemporaryHitPoints}
          statusLabel={
            participant.kind === "party-member" && !participant.statBlock
              ? "Stat block unavailable"
              : undefined
          }
        />

        {participant.kind === "party-member" ? (
          <MemberStatBlock participant={participant} />
        ) : (
          <CreatureStatBlock participant={participant} />
        )}
      </OverlayBody>
    </SheetDrawer>
  );
}

export default CampaignLiveEncounterTrackerInspectionDrawer;
