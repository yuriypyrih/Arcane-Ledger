import clsx from "clsx";
import { Fragment, type CSSProperties } from "react";
import { ArrowRightFromLine, ChessRook, GripVertical, Shield, Undo2 } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import EnemyIcon from "../../assets/svg/enemy.svg";
import { DefaultCharacterPortraitIcon } from "../../components/CharactersPage/CharacterPortrait";
import HitPointBar from "../../components/CharactersPage/CharacterSheetPage/HitPointControls/HitPointBar";
import SheetSurface from "../../components/CharactersPage/CharacterSheetPage/SheetSurface";
import { getCompanionDisplayType } from "../../components/CharactersPage/CharacterSheetPage/CompanionsSection/companionUtils";
import type {
  CampaignLiveEncounterTrackerCreatureRecord,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerPartyMemberRecord
} from "../../api/campaigns";
import {
  getDeathSaveStatusLabel,
  normalizeDeathSaveTrack
} from "../CharactersPage/deathSaves";
import type { LiveEncounterTrackerListKey } from "./liveEncounterTrackerUtils";
import styles from "./CampaignLiveEncounterTrackerParticipantCard.module.css";

type CampaignLiveEncounterTrackerParticipantCardProps = {
  activeParticipantId: string | null;
  initiativeOrderNumber?: number;
  listKey: LiveEncounterTrackerListKey;
  onInspect: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  onSelectActiveParticipant?: (participantId: string) => void;
  onToggleInitiative?: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  participant: CampaignLiveEncounterTrackerParticipantRecord;
  readOnly?: boolean;
};

type CampaignLiveEncounterTrackerReadOnlyParticipantCardProps = {
  activeParticipantId: string | null;
  initiativeOrderNumber?: number;
  onInspect: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
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
  vitalityLabel: string | null;
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
    armorClass: normalizeDisplayNumber(creature.inheritedCreatureEntry?.armor_class),
    currentHitPoints: normalizeDisplayNumber(creature.currentHitPoints),
    magicTemporaryHitPoints: 0,
    maxHitPoints: normalizePositiveDisplayNumber(creature.maxHitPoints),
    temporaryHitPoints: Math.max(0, normalizeDisplayNumber(creature.temporaryHitPoints) ?? 0),
    title: creature.name,
    typeLabel: getCompanionDisplayType(creature),
    vitalityLabel: getCreatureVitalityLabel(creature)
  };
}

function getCreatureVitalityLabel(
  creature: CampaignLiveEncounterTrackerCreatureRecord["creature"]
) {
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
    : null;
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
    ? getLiveEncounterMonsterImageUrl(participant.creature.inheritedCreatureEntry)
    : null;

  return monsterImage ? (
    <img src={monsterImage} alt="" className={styles.portraitImage} />
  ) : (
    <span className={styles.creaturePortraitIcon} style={creaturePortraitStyle} />
  );
}

function getLiveEncounterMonsterImageUrl(
  monster: CampaignLiveEncounterTrackerCreatureRecord["creature"]["inheritedCreatureEntry"]
) {
  const imageUrl = monster?.illustration?.file_url;

  return typeof imageUrl === "string" && imageUrl.trim().length > 0 ? imageUrl.trim() : null;
}

function ParticipantVitalsRow({ viewModel }: { viewModel: ParticipantCardViewModel }) {
  if (viewModel.unavailableLabel) {
    return (
      <div className={styles.vitalsRow}>
        <span className={styles.status}>{viewModel.unavailableLabel}</span>
      </div>
    );
  }

  const vitals: JSX.Element[] = [];

  if (viewModel.armorClass !== null) {
    vitals.push(
      <span
        key="armor-class"
        className={styles.armorClassText}
        aria-label={`Armor Class ${formatNumber(viewModel.armorClass)}`}
        title={`Armor Class ${formatNumber(viewModel.armorClass)}`}
      >
        <Shield size={14} aria-hidden="true" />
        {formatNumber(viewModel.armorClass)}
      </span>
    );
  }

  if (viewModel.currentHitPoints !== null && viewModel.maxHitPoints !== null) {
    vitals.push(
      <span key="hit-points" className={styles.hitPointText}>
        {formatNumber(viewModel.currentHitPoints)}/{formatNumber(viewModel.maxHitPoints)} HP
      </span>
    );
  }

  if (viewModel.temporaryHitPoints > 0) {
    vitals.push(
      <span key="temporary-hit-points" className={styles.tempHitPointText}>
        <ChessRook size={14} aria-hidden="true" />
        {viewModel.temporaryHitPoints}
      </span>
    );
  }

  if (viewModel.magicTemporaryHitPoints > 0) {
    vitals.push(
      <span key="magic-temporary-hit-points" className={styles.magicTempHitPointText}>
        <ChessRook size={14} aria-hidden="true" />
        Magic Temp {viewModel.magicTemporaryHitPoints}
      </span>
    );
  }

  if (viewModel.vitalityLabel) {
    vitals.push(
      <span key="vitality" className={styles.status}>
        {viewModel.vitalityLabel}
      </span>
    );
  }

  if (vitals.length === 0) {
    return null;
  }

  return (
    <div className={styles.vitalsRow}>
      {vitals.map((vital, index) => (
        <Fragment key={`${vital.key ?? index}`}>
          {index > 0 ? <span className={styles.vitalsDivider}>·</span> : null}
          {vital}
        </Fragment>
      ))}
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
  isReadOnly,
  onSelect,
  participant,
  title
}: {
  isActiveParticipant: boolean;
  isInInitiative: boolean;
  isReadOnly: boolean;
  onSelect: () => void;
  participant: CampaignLiveEncounterTrackerParticipantRecord;
  title: string;
}) {
  const portrait = (
    <span className={styles.portrait} aria-hidden="true">
      {renderParticipantPortrait(participant)}
    </span>
  );

  if (!isInInitiative || isReadOnly) {
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
  initiativeOrderNumber,
  listKey,
  onInspect,
  onSelectActiveParticipant,
  onToggleInitiative,
  participant,
  readOnly = false
}: ParticipantCardFrameProps) {
  const isInInitiative = listKey === "initiativeOrder";
  const isActiveParticipant =
    isInInitiative && activeParticipantId === participant.participantId;
  const viewModel = getParticipantViewModel(participant);
  const hasInitiativeOrderNumber = typeof initiativeOrderNumber === "number";

  const card = (
    <SheetSurface
      as="article"
      borderSize="xm"
      hasBorder
      hoverBorder
      className={clsx(
        styles.card,
        isInInitiative && !readOnly && styles.cardInInitiative,
        isInInitiative && readOnly && styles.cardReadOnlyInitiative,
        isActiveParticipant && styles.cardActive,
        isDragging && styles.cardDragging
      )}
    >
      {dragHandle}
      <ParticipantPortraitControl
        isActiveParticipant={isActiveParticipant}
        isInInitiative={isInInitiative}
        isReadOnly={readOnly}
        participant={participant}
        title={viewModel.title}
        onSelect={() => onSelectActiveParticipant?.(participant.participantId)}
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
      {!readOnly ? (
        <button
          type="button"
          className={styles.moveButton}
          aria-label={
            isInInitiative
              ? `Return ${viewModel.title} to its source list`
              : `Add ${viewModel.title} to initiative`
          }
          title={isInInitiative ? "Return to source list" : "Add to initiative"}
          onClick={() => onToggleInitiative?.(participant)}
        >
          {isInInitiative ? (
            <Undo2 size={16} aria-hidden="true" />
          ) : (
            <ArrowRightFromLine size={16} aria-hidden="true" />
          )}
        </button>
      ) : null}
    </SheetSurface>
  );

  if (!hasInitiativeOrderNumber) {
    return (
      <div ref={cardRef} style={cardStyle} className={styles.cardDragFrame}>
        {card}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      style={cardStyle}
      className={clsx(
        styles.cardNumberedRow,
        isActiveParticipant && styles.cardNumberedRowActive
      )}
    >
      <span
        className={styles.cardOrderNumber}
        aria-label={`Initiative order ${initiativeOrderNumber}`}
      >
        {initiativeOrderNumber}
      </span>
      {card}
    </div>
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

function CampaignLiveEncounterTrackerReadOnlyParticipantCard({
  activeParticipantId,
  initiativeOrderNumber,
  onInspect,
  participant
}: CampaignLiveEncounterTrackerReadOnlyParticipantCardProps) {
  return (
    <ParticipantCardFrame
      activeParticipantId={activeParticipantId}
      initiativeOrderNumber={initiativeOrderNumber}
      listKey="initiativeOrder"
      onInspect={onInspect}
      participant={participant}
      readOnly
    />
  );
}

export {
  CampaignLiveEncounterTrackerParticipantCard,
  CampaignLiveEncounterTrackerReadOnlyParticipantCard,
  CampaignLiveEncounterTrackerSortableParticipantCard
};
