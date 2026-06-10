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
import type { LiveEncounterTrackerListKey } from "./liveEncounterTrackerUtils";
import styles from "./DmToolsPage.module.css";

type CampaignLiveEncounterTrackerBoardProps = {
  onChange: (tracker: CampaignLiveEncounterTrackerRecord) => void;
  onInspectParticipant: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  tracker: CampaignLiveEncounterTrackerRecord;
};

type TrackerListProps = {
  activeParticipantId: string | null;
  icon: JSX.Element;
  listKey: LiveEncounterTrackerListKey;
  onInspectParticipant: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  onSelectActiveParticipant: (participantId: string) => void;
  onToggleInitiative: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  participants: CampaignLiveEncounterTrackerParticipantRecord[];
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
  icon,
  listKey,
  onInspectParticipant,
  onSelectActiveParticipant,
  onToggleInitiative,
  participants,
  title
}: TrackerListProps) {
  const isInitiativeList = listKey === "initiativeOrder";

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
      </div>

      <div className={styles.liveTrackerParticipantList}>
        {participants.length > 0 ? (
          isInitiativeList ? (
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
  onInspectParticipant,
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
    onChange({
      ...tracker,
      activeParticipantId: participantId
    });
  }

  function handleToggleInitiative(
    participant: CampaignLiveEncounterTrackerParticipantRecord
  ) {
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
          title="Party Members"
        />
        <TrackerList
          activeParticipantId={tracker.activeParticipantId}
          icon={<Skull size={16} aria-hidden="true" />}
          listKey="creatures"
          onInspectParticipant={onInspectParticipant}
          onSelectActiveParticipant={handleSelectActiveParticipant}
          onToggleInitiative={handleToggleInitiative}
          participants={tracker.creatures}
          title="Encounter Creatures"
        />
      </div>
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
    </div>
  );
}

export default CampaignLiveEncounterTrackerBoard;
