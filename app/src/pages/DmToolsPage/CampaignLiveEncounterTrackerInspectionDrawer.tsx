import { useId, useState } from "react";
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
  CampaignLiveEncounterTrackerPartyMemberRecord
} from "../../api/campaigns";
import type { EncounterTemplateCreatureRecord } from "../../api/encounterTemplates";
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
  normalizeDeathSaveTrack
} from "../CharactersPage/deathSaves";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";
import { toEncounterCreatureRecord } from "./encounterCreatureUtils";
import { createEncounterStatBlockRendererModel } from "./liveEncounterTrackerStatBlockAdapter";

type LiveEncounterCreatureUpdate = (
  creatureId: string,
  update: (creature: EncounterTemplateCreatureRecord) => EncounterTemplateCreatureRecord
) => void | Promise<void>;

type CampaignLiveEncounterTrackerInspectionDrawerProps = {
  participant: CampaignLiveEncounterTrackerParticipantRecord;
  readOnly?: boolean;
  onClose: () => void;
  onUpdateCreature?: LiveEncounterCreatureUpdate;
};

function getParticipantName(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  return participant.kind === "party-member"
    ? (participant.statBlock?.name ?? participant.summary.name)
    : participant.creature.name;
}

function getParticipantSummary(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  if (participant.kind === "creature") {
    return getCompanionDisplayType(participant.creature);
  }

  const statBlock = participant.statBlock;

  return statBlock
    ? statBlock.typeLabel ||
        [statBlock.species, statBlock.className].filter(Boolean).join(" ")
    : [participant.summary.species, participant.summary.className].filter(Boolean).join(" ");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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
    { successes: 0, failures: 0 }
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
        vitalRows={rendererModel.vitalRows}
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
  const description = (creature.description ?? "").trim();

  return (
    <>
      {description ? (
        <section className={styles.liveTrackerDrawerSection}>
          <h4>Description</h4>
          <p className={styles.liveTrackerDrawerDescription}>{description}</p>
        </section>
      ) : null}
      {monster && hasVisibleCreatureStatBlockContent(participant) ? (
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
    </>
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasObjectEntries(value: unknown) {
  return isObjectRecord(value) && Object.keys(value).length > 0;
}

function hasArrayEntries(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function hasVisibleMonsterRendererContent(
  monster: CampaignLiveEncounterTrackerCreatureRecord["creature"]["inheritedCreatureEntry"]
) {
  if (!monster) {
    return false;
  }

  return Boolean(
    monster.desc ||
      monster.alignment ||
      monster.armor_class !== undefined ||
      monster.armor_detail ||
      monster.challenge_rating !== undefined ||
      monster.experience_points !== undefined ||
      monster.hit_points !== undefined ||
      monster.hit_dice ||
      monster.languages ||
      monster.passive_perception !== undefined ||
      monster.proficiency_bonus !== undefined ||
      monster.senses_display ||
      monster.size ||
      monster.speed ||
      monster.speed_all ||
      monster.subcategory ||
      monster.type ||
      hasObjectEntries(monster.ability_scores) ||
      hasObjectEntries(monster.modifiers) ||
      hasObjectEntries(monster.resistances_and_immunities) ||
      hasObjectEntries(monster.saving_throws) ||
      hasObjectEntries(monster.saving_throws_all) ||
      hasObjectEntries(monster.skill_bonuses) ||
      hasObjectEntries(monster.skill_bonuses_all) ||
      hasArrayEntries(monster.actions) ||
      hasArrayEntries(monster.traits)
  );
}

function hasVisibleCreatureStatBlockContent(
  participant: CampaignLiveEncounterTrackerCreatureRecord
) {
  const monster = participant.creature.inheritedCreatureEntry;

  return Boolean(
    monster &&
      (hasVisibleMonsterRendererContent(monster) || !participant.creature.statBlockNameHidden)
  );
}

function getCreatureVitalityLabel(participant: CampaignLiveEncounterTrackerCreatureRecord) {
  const creature = participant.creature;

  if (creature.vitalityStatusLabel) {
    return creature.vitalityStatusLabel;
  }

  return typeof creature.currentHitPoints === "number" &&
    typeof creature.maxHitPoints === "number"
    ? getDeathSaveStatusLabel(
        creature.currentHitPoints,
        Math.max(1, creature.maxHitPoints),
        normalizeDeathSaveTrack(creature.deathSaves)
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
        readOnly
      />
    );
  }

  const creature = participant.creature;

  if (!isFiniteNumber(creature.currentHitPoints) || !isFiniteNumber(creature.maxHitPoints)) {
    return null;
  }

  const canEdit = !readOnly && Boolean(onUpdateCreature);
  const creatureId = participant.creatureId ?? creature.id;
  const deathSaves = normalizeDeathSaveTrack(creature.deathSaves);
  const shouldShowDeathSaves =
    creature.currentHitPoints <= 0 && deathSaves.resolution !== "instant-death";

  function updateCreature(
    update: (creature: EncounterTemplateCreatureRecord) => EncounterTemplateCreatureRecord
  ) {
    return onUpdateCreature?.(creatureId, update);
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
              void updateCreature((currentCreature) =>
                toEncounterCreatureRecord(resetCharacterCompanionDeathSaves(currentCreature))
              )
            }
            onUpdate={(track) =>
              void updateCreature((currentCreature) =>
                toEncounterCreatureRecord(
                  updateCharacterCompanionDeathSaves(currentCreature, track)
                )
              )
            }
          />
        ) : null
      }
      temporaryHitPointsDescription="When taking damage the temporary hit points are consumed first. They do not stack."
      readOnly={!canEdit}
      onDamage={(amount) =>
        void updateCreature((currentCreature) =>
          toEncounterCreatureRecord(applyDamageToCharacterCompanion(currentCreature, amount))
        )
      }
      onHeal={(amount) =>
        void updateCreature((currentCreature) =>
          toEncounterCreatureRecord(applyHealingToCharacterCompanion(currentCreature, amount))
        )
      }
      onSaveTemporaryHitPoints={(value) =>
        void updateCreature((currentCreature) =>
          toEncounterCreatureRecord(
            assignManualTemporaryHitPointsToCharacterCompanion(currentCreature, value)
          )
        )
      }
    />
  );
}

function CampaignLiveEncounterTrackerInspectionDrawer({
  participant,
  readOnly = true,
  onClose,
  onUpdateCreature
}: CampaignLiveEncounterTrackerInspectionDrawerProps) {
  const titleId = useId();
  const [drawerNotice, setDrawerNotice] = useState<string | null>(null);
  const participantName = getParticipantName(participant);
  const participantSummary = getParticipantSummary(participant);

  async function handleUpdateCreature(
    creatureId: string,
    update: (creature: EncounterTemplateCreatureRecord) => EncounterTemplateCreatureRecord
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
            {participant.kind === "party-member" ? "Party Member" : "Creature Inspection"}
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
