import type { CSSProperties } from "react";
import { GripVertical, HeartPulse, ListPlus, RotateCcw, Shield, Timer } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import EnemyIcon from "../../assets/svg/enemy.svg";
import { DefaultCharacterPortraitIcon } from "../../components/CharactersPage/CharacterPortrait";
import { STATUS_DURATION_KIND, type CharacterStatusDuration } from "../../types";
import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerPartyMemberRecord,
  CampaignLiveEncounterTrackerCreatureRecord
} from "../../api/campaigns";
import type { LiveEncounterTrackerListKey } from "./liveEncounterTrackerUtils";
import styles from "./DmToolsPage.module.css";

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

type CreaturePortraitStyle = CSSProperties & {
  "--live-tracker-creature-icon-image": string;
};

const creaturePortraitStyle: CreaturePortraitStyle = {
  "--live-tracker-creature-icon-image": `url("${EnemyIcon}")`
};

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toString() : "-";
}

function formatSignedValue(value: string | number) {
  if (typeof value === "string") {
    return value;
  }

  return value >= 0 ? `+${value}` : value.toString();
}

function formatListPreview(values: string[]) {
  if (values.length === 0) {
    return null;
  }

  if (values.length <= 2) {
    return values.join(", ");
  }

  return `${values.slice(0, 2).join(", ")} +${values.length - 2}`;
}

function formatDuration(duration: CharacterStatusDuration) {
  switch (duration.kind) {
    case STATUS_DURATION_KIND.INFINITE:
      return "Infinite";
    case STATUS_DURATION_KIND.CONCENTRATION:
      return "Concentration";
    case STATUS_DURATION_KIND.LINKED:
      return "Linked";
    case STATUS_DURATION_KIND.SHORT_REST:
      return "Short rest";
    case STATUS_DURATION_KIND.LONG_REST:
      return "Long rest";
    case STATUS_DURATION_KIND.MINUTES:
      return `${duration.amount} min`;
    case STATUS_DURATION_KIND.HOURS:
      return `${duration.amount} hr`;
    case STATUS_DURATION_KIND.DAYS:
      return `${duration.amount} day`;
    case STATUS_DURATION_KIND.ROUNDS:
      return `${duration.amount} round`;
    default:
      return "Duration";
  }
}

function getPartyMemberMeta(participant: CampaignLiveEncounterTrackerPartyMemberRecord) {
  const statBlock = participant.statBlock;

  return statBlock
    ? statBlock.typeLabel ||
        [statBlock.species, statBlock.className].filter(Boolean).join(" ")
    : [participant.summary.species, participant.summary.className].filter(Boolean).join(" ");
}

function getCreatureMeta(participant: CampaignLiveEncounterTrackerCreatureRecord) {
  return participant.creature.type || "Creature";
}

function getParticipantTitle(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  return participant.kind === "party-member"
    ? (participant.statBlock?.name ?? participant.summary.name)
    : participant.creature.name;
}

function getParticipantMeta(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  return participant.kind === "party-member" ? getPartyMemberMeta(participant) : getCreatureMeta(participant);
}

function renderPartyMemberFacts(participant: CampaignLiveEncounterTrackerPartyMemberRecord) {
  const statBlock = participant.statBlock;

  if (!statBlock) {
    return <span>Stat block unavailable</span>;
  }

  const defenses = [
    formatListPreview(statBlock.resistances),
    formatListPreview(statBlock.immunities),
    formatListPreview(statBlock.vulnerabilities)
  ].filter(Boolean);

  return (
    <>
      <span>
        <Shield size={13} aria-hidden="true" />
        AC {formatNumber(statBlock.armorClass)}
      </span>
      <span>
        <HeartPulse size={13} aria-hidden="true" />
        HP {formatNumber(statBlock.currentHitPoints)}/{formatNumber(statBlock.hitPoints)}
      </span>
      <span>
        <Timer size={13} aria-hidden="true" />
        Init {formatSignedValue(statBlock.initiative)}
      </span>
      <span>PP {formatNumber(statBlock.passivePerception)}</span>
      {defenses.length > 0 ? <span>{defenses.join(" | ")}</span> : null}
    </>
  );
}

function renderCreatureFacts(participant: CampaignLiveEncounterTrackerCreatureRecord) {
  const creature = participant.creature;

  return (
    <>
      <span>
        <HeartPulse size={13} aria-hidden="true" />
        HP {formatNumber(creature.currentHitPoints)}/{formatNumber(creature.maxHitPoints)}
      </span>
      {creature.temporaryHitPoints > 0 ? <span>Temp {creature.temporaryHitPoints}</span> : null}
      <span>{formatDuration(creature.duration)}</span>
    </>
  );
}

function renderParticipantFacts(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  return participant.kind === "party-member"
    ? renderPartyMemberFacts(participant)
    : renderCreatureFacts(participant);
}

function renderParticipantPortrait(participant: CampaignLiveEncounterTrackerParticipantRecord) {
  if (participant.kind === "party-member") {
    return participant.avatar?.imageUrl ? (
      <img src={participant.avatar.imageUrl} alt="" className={styles.liveTrackerPortraitImage} />
    ) : (
      <DefaultCharacterPortraitIcon className={styles.liveTrackerPortraitDefaultIcon} />
    );
  }

  const monsterImage = participant.creature.inheritedCreatureEntry?.img_main;

  return monsterImage ? (
    <img src={monsterImage} alt="" className={styles.liveTrackerPortraitImage} />
  ) : (
    <span
      className={styles.liveTrackerCreaturePortraitIcon}
      style={creaturePortraitStyle}
    />
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
  const cardClassName = [
    styles.liveTrackerParticipantCard,
    !isInInitiative ? styles.liveTrackerParticipantCardSource : "",
    isDragging ? styles.liveTrackerParticipantCardDragging : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      ref={cardRef}
      style={cardStyle}
      className={cardClassName}
    >
      {dragHandle}
      {isInInitiative ? (
        <input
          type="radio"
          className={styles.liveTrackerTurnRadio}
          name="active-live-encounter-participant"
          aria-label={`Set ${getParticipantTitle(participant)} as current turn`}
          checked={activeParticipantId === participant.participantId}
          onChange={() => onSelectActiveParticipant(participant.participantId)}
        />
      ) : null}
      <span className={styles.liveTrackerPortrait} aria-hidden="true">
        {renderParticipantPortrait(participant)}
      </span>
      <button
        type="button"
        className={styles.liveTrackerParticipantBody}
        onClick={() => onInspect(participant)}
        aria-label={`Inspect ${getParticipantTitle(participant)}`}
      >
        <div className={styles.liveTrackerParticipantHeader}>
          <strong>{getParticipantTitle(participant)}</strong>
          <small>{getParticipantMeta(participant)}</small>
        </div>
        <div className={styles.liveTrackerFactRow}>{renderParticipantFacts(participant)}</div>
      </button>
      <button
        type="button"
        className={styles.liveTrackerParticipantMoveButton}
        aria-label={
          isInInitiative
            ? `Return ${getParticipantTitle(participant)} to its source list`
            : `Add ${getParticipantTitle(participant)} to initiative`
        }
        title={isInInitiative ? "Return to source list" : "Add to initiative"}
        onClick={() => onToggleInitiative(participant)}
      >
        {isInInitiative ? (
          <RotateCcw size={16} aria-hidden="true" />
        ) : (
          <ListPlus size={16} aria-hidden="true" />
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
  const participantTitle = getParticipantTitle(props.participant);

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
          className={styles.liveTrackerDragHandle}
          aria-label={`Drag ${participantTitle}`}
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
