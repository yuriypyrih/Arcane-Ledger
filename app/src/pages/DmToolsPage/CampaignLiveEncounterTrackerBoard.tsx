import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Skull, Swords, Users } from "lucide-react";
import type {
  CampaignLiveEncounterTrackerCreatureRecord,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerPartyMemberRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import {
  CampaignLiveEncounterTrackerParticipantCard,
  CampaignLiveEncounterTrackerSortableParticipantCard
} from "./CampaignLiveEncounterTrackerParticipantCard";
import DmToolsEditButton from "./DmToolsEditButton";
import type { LiveEncounterTrackerListKey } from "./liveEncounterTrackerUtils";
import styles from "./DmToolsPage.module.css";

type CampaignLiveEncounterTrackerBoardProps = {
  onChange: (tracker: CampaignLiveEncounterTrackerRecord) => void;
  onEditEncounterCreatures?: () => void;
  onInspectParticipant: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  readOnly?: boolean;
  tracker: CampaignLiveEncounterTrackerRecord;
};

type TrackerListProps = {
  activeParticipantId: string | null;
  icon: JSX.Element;
  headerAction?: JSX.Element;
  listKey: LiveEncounterTrackerListKey;
  onInspectParticipant: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  onSelectActiveParticipant: (participantId: string) => void;
  onToggleInitiative: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  participants: CampaignLiveEncounterTrackerParticipantRecord[];
  readOnly?: boolean;
  title: string;
};

function getSourceListKey(
  participant: CampaignLiveEncounterTrackerParticipantRecord
): Exclude<LiveEncounterTrackerListKey, "initiativeOrder"> {
  return participant.kind === "party-member" ? "partyMembers" : "creatures";
}

function moveParticipantIntoInitiative(
  tracker: CampaignLiveEncounterTrackerRecord,
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerRecord {
  if (
    tracker.initiativeOrder.some(
      (entry) => entry.participantId === participant.participantId
    )
  ) {
    return tracker;
  }

  if (participant.kind === "party-member") {
    return {
      ...tracker,
      partyMembers: tracker.partyMembers.filter(
        (entry) => entry.participantId !== participant.participantId
      ),
      initiativeOrder: [...tracker.initiativeOrder, participant]
    };
  }

  return {
    ...tracker,
    creatures: tracker.creatures.filter(
      (entry) => entry.participantId !== participant.participantId
    ),
    initiativeOrder: [...tracker.initiativeOrder, participant]
  };
}

function returnParticipantToSourceList(
  tracker: CampaignLiveEncounterTrackerRecord,
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerRecord {
  const sourceListKey = getSourceListKey(participant);
  const nextInitiativeOrder = tracker.initiativeOrder.filter(
    (entry) => entry.participantId !== participant.participantId
  );
  const activeParticipantId =
    tracker.activeParticipantId === participant.participantId
      ? null
      : tracker.activeParticipantId;

  if (sourceListKey === "partyMembers") {
    return {
      ...tracker,
      activeParticipantId,
      initiativeOrder: nextInitiativeOrder,
      partyMembers: [
        ...tracker.partyMembers,
        participant as CampaignLiveEncounterTrackerPartyMemberRecord
      ]
    };
  }

  return {
    ...tracker,
    activeParticipantId,
    creatures: [
      ...tracker.creatures,
      participant as CampaignLiveEncounterTrackerCreatureRecord
    ],
    initiativeOrder: nextInitiativeOrder
  };
}

function toggleParticipantInitiativePlacement(
  tracker: CampaignLiveEncounterTrackerRecord,
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerRecord {
  const isInInitiative = tracker.initiativeOrder.some(
    (entry) => entry.participantId === participant.participantId
  );

  return isInInitiative
    ? returnParticipantToSourceList(tracker, participant)
    : moveParticipantIntoInitiative(tracker, participant);
}

function TrackerList({
  activeParticipantId,
  headerAction,
  icon,
  listKey,
  onInspectParticipant,
  onSelectActiveParticipant,
  onToggleInitiative,
  participants,
  readOnly = false,
  title
}: TrackerListProps) {
  const isInitiativeList = listKey === "initiativeOrder";
  const shouldUseSortableCards = isInitiativeList && !readOnly;

  return (
    <section
      className={styles.liveTrackerDropList}
      aria-labelledby={`live-tracker-${listKey}-title`}
    >
      <div className={styles.liveTrackerListHeader}>
        <h3 id={`live-tracker-${listKey}-title`}>
          {icon}
          <span>{title}</span>
        </h3>
        {headerAction}
      </div>

      <div className={styles.liveTrackerParticipantList}>
        {participants.length > 0 ? (
          shouldUseSortableCards ? (
            <SortableContext
              items={participants.map((participant) => participant.participantId)}
              strategy={verticalListSortingStrategy}
            >
              {participants.map((participant, participantIndex) => (
                <CampaignLiveEncounterTrackerSortableParticipantCard
                  key={participant.participantId}
                  activeParticipantId={activeParticipantId}
                  initiativeOrderNumber={participantIndex + 1}
                  listKey={listKey}
                  onInspect={onInspectParticipant}
                  onSelectActiveParticipant={onSelectActiveParticipant}
                  onToggleInitiative={onToggleInitiative}
                  participant={participant}
                />
              ))}
            </SortableContext>
          ) : isInitiativeList && readOnly ? (
            participants.map((participant, participantIndex) => (
              <CampaignLiveEncounterTrackerParticipantCard
                key={participant.participantId}
                activeParticipantId={activeParticipantId}
                initiativeOrderNumber={participantIndex + 1}
                listKey={listKey}
                onInspect={onInspectParticipant}
                participant={participant}
                readOnly
              />
            ))
          ) : (
            participants.map((participant) => (
              <CampaignLiveEncounterTrackerParticipantCard
                key={participant.participantId}
                activeParticipantId={activeParticipantId}
                listKey={listKey}
                onInspect={onInspectParticipant}
                onSelectActiveParticipant={onSelectActiveParticipant}
                onToggleInitiative={onToggleInitiative}
                participant={participant}
                readOnly={readOnly}
              />
            ))
          )
        ) : (
          <p className={styles.liveTrackerEmptyListState}>Empty</p>
        )}
      </div>
    </section>
  );
}

function CampaignLiveEncounterTrackerBoard({
  onChange,
  onEditEncounterCreatures,
  onInspectParticipant,
  readOnly = false,
  tracker
}: CampaignLiveEncounterTrackerBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    if (readOnly) {
      return;
    }

    const activeParticipantId = String(event.active.id);
    const overParticipantId = event.over ? String(event.over.id) : null;

    if (!overParticipantId || activeParticipantId === overParticipantId) {
      return;
    }

    const activeIndex = tracker.initiativeOrder.findIndex(
      (participant) => participant.participantId === activeParticipantId
    );
    const overIndex = tracker.initiativeOrder.findIndex(
      (participant) => participant.participantId === overParticipantId
    );

    if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
      return;
    }

    onChange({
      ...tracker,
      initiativeOrder: arrayMove(tracker.initiativeOrder, activeIndex, overIndex)
    });
  }

  function handleSelectActiveParticipant(participantId: string) {
    if (readOnly) {
      return;
    }

    onChange({
      ...tracker,
      activeParticipantId: participantId
    });
  }

  function handleToggleInitiative(
    participant: CampaignLiveEncounterTrackerParticipantRecord
  ) {
    if (readOnly) {
      return;
    }

    const nextTracker = toggleParticipantInitiativePlacement(tracker, participant);

    if (nextTracker !== tracker) {
      onChange(nextTracker);
    }
  }

  return (
    <div className={styles.liveTrackerLayout}>
      <div className={styles.liveTrackerSourceColumn}>
        <TrackerList
          activeParticipantId={tracker.activeParticipantId}
          icon={<Users size={16} aria-hidden="true" />}
          listKey="partyMembers"
          onInspectParticipant={onInspectParticipant}
          onSelectActiveParticipant={handleSelectActiveParticipant}
          onToggleInitiative={handleToggleInitiative}
          participants={tracker.partyMembers}
          readOnly={readOnly}
          title="Party Members"
        />
        <TrackerList
          activeParticipantId={tracker.activeParticipantId}
          headerAction={
            onEditEncounterCreatures ? (
              <DmToolsEditButton onClick={onEditEncounterCreatures}>Edit</DmToolsEditButton>
            ) : undefined
          }
          icon={<Skull size={16} aria-hidden="true" />}
          listKey="creatures"
          onInspectParticipant={onInspectParticipant}
          onSelectActiveParticipant={handleSelectActiveParticipant}
          onToggleInitiative={handleToggleInitiative}
          participants={tracker.creatures}
          readOnly={readOnly}
          title="Encounter Creatures"
        />
      </div>
      {readOnly ? (
        <TrackerList
          activeParticipantId={tracker.activeParticipantId}
          icon={<Swords size={16} aria-hidden="true" />}
          listKey="initiativeOrder"
          onInspectParticipant={onInspectParticipant}
          onSelectActiveParticipant={handleSelectActiveParticipant}
          onToggleInitiative={handleToggleInitiative}
          participants={tracker.initiativeOrder}
          readOnly
          title="Initiative Order"
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <TrackerList
            activeParticipantId={tracker.activeParticipantId}
            icon={<Swords size={16} aria-hidden="true" />}
            listKey="initiativeOrder"
            onInspectParticipant={onInspectParticipant}
            onSelectActiveParticipant={handleSelectActiveParticipant}
            onToggleInitiative={handleToggleInitiative}
            participants={tracker.initiativeOrder}
            title="Initiative Order"
          />
        </DndContext>
      )}
    </div>
  );
}

export default CampaignLiveEncounterTrackerBoard;
