import clsx from "clsx";
import type { CSSProperties } from "react";
import { ArrowRightFromLine, GripVertical, Shield, Undo2 } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import EnemyIcon from "../../assets/svg/enemy.svg";
import { DefaultCharacterPortraitIcon } from "../../components/CharactersPage/CharacterPortrait";
import HitPointBar from "../../components/CharactersPage/CharacterSheetPage/HitPointControls/HitPointBar";
import { getCompanionDisplayType } from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/companionUtils";
import { getMonsterArmorClass, getMonsterImageUrl } from "../../utils/monsters";
import type {
  CampaignLiveEncounterTrackerCreatureRecord,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerPartyMemberRecord
} from "../../api/campaigns";
import { getCompanionStatusLabel } from "../CharactersPage/companions";
import { getDeathSaveStatusLabel } from "../CharactersPage/deathSaves";
import type { LiveEncounterTrackerListKey } from "./liveEncounterTrackerUtils";
import styles from "./CampaignLiveEncounterTrackerParticipantCard.module.css";

type CampaignLiveEncounterTrackerParticipantCardProps = {
  activeParticipantId: string | null;
  listKey: LiveEncounterTrackerListKey;
  onInspect: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  onSelectActiveParticipant: (participantId: string) => void;
  onToggleInitiative: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  participant: CampaignLiveEncounterTrackerParticipantRecord;
};

type ParticipantCardFrameProps = CampaignLiveEncounterTrackerParticipantCardProps & {
  cardRef?: (node: HTMLElement | null) => void;
  cardStyle?: CSSProperties;
  dragHandle?: JSX.Element;
  isDragging?: boolean;
};

type ParticipantCardViewModel = {
  armorClass: number | null;
  currentHitPoints: number | null;
  magicTemporaryHitPoints: number;
  maxHitPoints: number | null;
  temporaryHitPoints: number;
  title: string;
  typeLabel: string;
  unavailableLabel?: string;
  vitalityLabel: string;
};

type CreaturePortraitStyle = CSSProperties & {
  "--live-tracker-creature-icon-image": string;
};

const creaturePortraitStyle: CreaturePortraitStyle = {
  "--live-tracker-creature-icon-image": `url("${EnemyIcon}")`
};

const emptyDeathSaveTrack = {
  successes: 0,
  failures: 0
};

function normalizeDisplayNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePositiveDisplayNumber(value: number | null | undefined): number | null {
  const normalizedValue = normalizeDisplayNumber(value);

  return normalizedValue !== null && normalizedValue > 0 ? normalizedValue : null;
}

function formatNumber(value: number | null | undefined) {
  const normalizedValue = normalizeDisplayNumber(value);

  return normalizedValue !== null ? normalizedValue.toString() : "-";
}

function getPartyMemberTypeLabel(participant: CampaignLiveEncounterTrackerPartyMemberRecord) {
  const statBlock = participant.statBlock;

  return statBlock
    ? statBlock.typeLabel ||
        [statBlock.species, statBlock.className].filter(Boolean).join(" ")
    : [participant.summary.species, participant.summary.className].filter(Boolean).join(" ");
}

function getPartyMemberViewModel(
  participant: CampaignLiveEncounterTrackerPartyMemberRecord
): ParticipantCardViewModel {
  const statBlock = participant.statBlock;

  if (!statBlock) {
    return {
      armorClass: null,
      currentHitPoints: null,
      magicTemporaryHitPoints: 0,
      maxHitPoints: null,
      temporaryHitPoints: 0,
      title: participant.summary.name,
      typeLabel: getPartyMemberTypeLabel(participant),
      unavailableLabel: "Stat block unavailable",
      vitalityLabel: "Unavailable"
    };
  }

  return {
    armorClass: normalizeDisplayNumber(statBlock.armorClass),
    currentHitPoints: normalizeDisplayNumber(statBlock.currentHitPoints),
    magicTemporaryHitPoints: Math.max(0, statBlock.magicTemporaryHitPoints),
    maxHitPoints: normalizePositiveDisplayNumber(statBlock.hitPoints),
    temporaryHitPoints: Math.max(0, statBlock.temporaryHitPoints),
    title: statBlock.name || participant.summary.name,
    typeLabel: getPartyMemberTypeLabel(participant),
    vitalityLabel: getDeathSaveStatusLabel(
      statBlock.currentHitPoints,
      Math.max(1, statBlock.hitPoints),
      emptyDeathSaveTrack
    )
  };
}

function getCreatureViewModel(
  participant: CampaignLiveEncounterTrackerCreatureRecord
): ParticipantCardViewModel {
  const creature = participant.creature;

  return {
    armorClass: normalizeDisplayNumber(
      creature.inheritedCreatureEntry ? getMonsterArmorClass(creature.inheritedCreatureEntry) : null
    ),
    currentHitPoints: normalizeDisplayNumber(creature.currentHitPoints),
    magicTemporaryHitPoints: 0,
    maxHitPoints: normalizePositiveDisplayNumber(creature.maxHitPoints),
    temporaryHitPoints: Math.max(0, creature.temporaryHitPoints),
    title: creature.name,
    typeLabel: getCompanionDisplayType(creature) || "Creature",
    vitalityLabel: getCompanionStatusLabel(creature)
  };
}

function getParticipantViewModel(
  participant: CampaignLiveEncounterTrackerParticipantRecord
): ParticipantCardViewModel {
  return participant.kind === "party-member"
    ? getPartyMemberViewModel(participant)
    : getCreatureViewModel(participant);
}

function renderParticipantPortrait(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  if (participant.kind === "party-member") {
    return participant.avatar?.imageUrl ? (
      <img src={participant.avatar.imageUrl} alt="" className={styles.portraitImage} />
    ) : (
      <DefaultCharacterPortraitIcon className={styles.portraitDefaultIcon} />
    );
  }

  const monsterImage = participant.creature.inheritedCreatureEntry
    ? getMonsterImageUrl(participant.creature.inheritedCreatureEntry)
    : null;

  return monsterImage ? (
    <img src={monsterImage} alt="" className={styles.portraitImage} />
  ) : (
    <span className={styles.creaturePortraitIcon} style={creaturePortraitStyle} />
  );
}

function ParticipantVitalsRow({ viewModel }: { viewModel: ParticipantCardViewModel }) {
  if (viewModel.unavailableLabel) {
    return (
      <div className={styles.vitalsRow}>
        <span className={styles.status}>{viewModel.unavailableLabel}</span>
      </div>
    );
  }

  return (
    <div className={styles.vitalsRow}>
      {viewModel.armorClass !== null ? (
        <>
          <span className={styles.armorClassText}>AC {formatNumber(viewModel.armorClass)}</span>
          <span className={styles.vitalsDivider}>·</span>
        </>
      ) : null}
      {viewModel.currentHitPoints !== null && viewModel.maxHitPoints !== null ? (
        <>
          <span className={styles.hitPointText}>
            {formatNumber(viewModel.currentHitPoints)}/{formatNumber(viewModel.maxHitPoints)} HP
          </span>
          <span className={styles.vitalsDivider}>·</span>
        </>
      ) : null}
      {viewModel.temporaryHitPoints > 0 ? (
        <>
          <span className={styles.tempHitPointText}>
            <Shield size={14} aria-hidden="true" />
            {viewModel.temporaryHitPoints}
          </span>
          <span className={styles.vitalsDivider}>·</span>
        </>
      ) : null}
      {viewModel.magicTemporaryHitPoints > 0 ? (
        <>
          <span className={styles.magicTempHitPointText}>
            Magic Temp {viewModel.magicTemporaryHitPoints}
          </span>
          <span className={styles.vitalsDivider}>·</span>
        </>
      ) : null}
      <span className={styles.status}>{viewModel.vitalityLabel}</span>
    </div>
  );
}

function ParticipantHitPointBar({ viewModel }: { viewModel: ParticipantCardViewModel }) {
  if (viewModel.currentHitPoints === null || viewModel.maxHitPoints === null) {
    return null;
  }

  return (
    <div className={styles.hitPointBarRow} aria-hidden="true">
      <HitPointBar
        className={styles.hitPointBar}
        currentHitPoints={viewModel.currentHitPoints}
        maxHitPoints={viewModel.maxHitPoints}
        temporaryHitPoints={viewModel.temporaryHitPoints}
        magicTemporaryHitPoints={viewModel.magicTemporaryHitPoints}
      />
    </div>
  );
}

function ParticipantPortraitControl({
  isActiveParticipant,
  isInInitiative,
  onSelect,
  participant,
  title
}: {
  isActiveParticipant: boolean;
  isInInitiative: boolean;
  onSelect: () => void;
  participant: CampaignLiveEncounterTrackerParticipantRecord;
  title: string;
}) {
  const portrait = (
    <span className={styles.portrait} aria-hidden="true">
      {renderParticipantPortrait(participant)}
    </span>
  );

  if (!isInInitiative) {
    return <span className={styles.portraitControl}>{portrait}</span>;
  }

  return (
    <label className={styles.portraitControl}>
      {portrait}
      <input
        type="radio"
        className={styles.turnRadio}
        name="active-live-encounter-participant"
        aria-label={`Set ${title} as current turn`}
        checked={isActiveParticipant}
        onChange={onSelect}
      />
    </label>
  );
}

function ParticipantCardFrame({
  activeParticipantId,
  cardRef,
  cardStyle,
  dragHandle,
  isDragging = false,
  listKey,
  onInspect,
  onSelectActiveParticipant,
  onToggleInitiative,
  participant
}: ParticipantCardFrameProps) {
  const isInInitiative = listKey === "initiativeOrder";
  const isActiveParticipant =
    isInInitiative && activeParticipantId === participant.participantId;
  const viewModel = getParticipantViewModel(participant);

  return (
    <article
      ref={cardRef}
      style={cardStyle}
      className={clsx(
        styles.card,
        isInInitiative && styles.cardInInitiative,
        isActiveParticipant && styles.cardActive,
        isDragging && styles.cardDragging
      )}
    >
      {dragHandle}
      <ParticipantPortraitControl
        isActiveParticipant={isActiveParticipant}
        isInInitiative={isInInitiative}
        participant={participant}
        title={viewModel.title}
        onSelect={() => onSelectActiveParticipant(participant.participantId)}
      />
      <button
        type="button"
        className={styles.contentButton}
        onClick={() => onInspect(participant)}
        aria-label={`Inspect ${viewModel.title}`}
      >
        <span className={styles.titleRow}>
          <span className={styles.title}>{viewModel.title}</span>
          {viewModel.typeLabel ? (
            <span className={styles.type}>· {viewModel.typeLabel}</span>
          ) : null}
        </span>

        <ParticipantVitalsRow viewModel={viewModel} />

        {isInInitiative ? <ParticipantHitPointBar viewModel={viewModel} /> : null}
      </button>
      <button
        type="button"
        className={styles.moveButton}
        aria-label={
          isInInitiative
            ? `Return ${viewModel.title} to its source list`
            : `Add ${viewModel.title} to initiative`
        }
        title={isInInitiative ? "Return to source list" : "Add to initiative"}
        onClick={() => onToggleInitiative(participant)}
      >
        {isInInitiative ? (
          <Undo2 size={16} aria-hidden="true" />
        ) : (
          <ArrowRightFromLine size={16} aria-hidden="true" />
        )}
      </button>
    </article>
  );
}

function CampaignLiveEncounterTrackerParticipantCard(
  props: CampaignLiveEncounterTrackerParticipantCardProps
) {
  return <ParticipantCardFrame {...props} />;
}

function CampaignLiveEncounterTrackerSortableParticipantCard(
  props: CampaignLiveEncounterTrackerParticipantCardProps
) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: props.participant.participantId
  });
  const cardStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const viewModel = getParticipantViewModel(props.participant);

  return (
    <ParticipantCardFrame
      {...props}
      cardRef={setNodeRef}
      cardStyle={cardStyle}
      isDragging={isDragging}
      dragHandle={
        <button
          ref={setActivatorNodeRef}
          type="button"
          className={styles.dragHandle}
          aria-label={`Drag ${viewModel.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
      }
    />
  );
}

export {
  CampaignLiveEncounterTrackerParticipantCard,
  CampaignLiveEncounterTrackerSortableParticipantCard
};
