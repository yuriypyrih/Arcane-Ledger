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
import { Dices, Skull, Swords, Users } from "lucide-react";
import ActionButton from "../../components/ActionButton";
import type {
  CampaignLiveEncounterTrackerCreatureRecord,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerPartyParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import {
  CampaignLiveEncounterTrackerParticipantCard,
  CampaignLiveEncounterTrackerSortableParticipantCard
} from "./CampaignLiveEncounterTrackerParticipantCard";
import DmToolsEditButton from "./DmToolsEditButton";
import {
  canGroupWithPrevious,
  getInitiativeSlotInfo,
  groupWithPrevious,
  leaveGroup,
  normalizeInitiativeGroups,
  rollCreatureInitiatives,
  setParticipantInitiative,
  type InitiativeSlotInfo
} from "./liveEncounterInitiative";
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
  canGroupParticipant?: (participantId: string) => boolean;
  onChangeInitiative?: (participantId: string, initiative: number | null) => void;
  onToggleGroup?: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  slotInfo?: Map<string, InitiativeSlotInfo>;
  onToggleInitiative: (participant: CampaignLiveEncounterTrackerParticipantRecord) => void;
  participants: CampaignLiveEncounterTrackerParticipantRecord[];
  readOnly?: boolean;
  title: string;
};

function getSourceListKey(
  participant: CampaignLiveEncounterTrackerParticipantRecord
): Exclude<LiveEncounterTrackerListKey, "initiativeOrder"> {
  return participant.kind === "creature" ? "creatures" : "partyMembers";
}

function moveParticipantIntoInitiative(
  tracker: CampaignLiveEncounterTrackerRecord,
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerRecord {
  if (tracker.initiativeOrder.some((entry) => entry.participantId === participant.participantId)) {
    return tracker;
  }

  if (participant.kind !== "creature") {
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
  // Leaving initiative also leaves its pack; a pack down to one creature dissolves.
  const nextInitiativeOrder = normalizeInitiativeGroups(
    tracker.initiativeOrder.filter((entry) => entry.participantId !== participant.participantId)
  );
  const returnedParticipant = { ...participant, groupId: null };
  const activeParticipantId =
    tracker.activeParticipantId === participant.participantId ? null : tracker.activeParticipantId;

  if (sourceListKey === "partyMembers") {
    return {
      ...tracker,
      activeParticipantId,
      initiativeOrder: nextInitiativeOrder,
      partyMembers: [
        ...tracker.partyMembers,
        returnedParticipant as CampaignLiveEncounterTrackerPartyParticipantRecord
      ]
    };
  }

  return {
    ...tracker,
    activeParticipantId,
    creatures: [
      ...tracker.creatures,
      returnedParticipant as CampaignLiveEncounterTrackerCreatureRecord
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
  canGroupParticipant,
  onChangeInitiative,
  onSelectActiveParticipant,
  onToggleGroup,
  onToggleInitiative,
  participants,
  readOnly = false,
  slotInfo,
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

      <div
        className={[
          styles.liveTrackerParticipantList,
          isInitiativeList ? styles.liveTrackerInitiativeParticipantList : null
        ]
          .filter(Boolean)
          .join(" ")}
      >
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
                  canGroup={canGroupParticipant?.(participant.participantId)}
                  groupPosition={slotInfo?.get(participant.participantId)?.groupPosition}
                  initiativeOrderNumber={
                    slotInfo?.get(participant.participantId)?.slotNumber ?? participantIndex + 1
                  }
                  isActiveSlot={slotInfo?.get(participant.participantId)?.isActive}
                  listKey={listKey}
                  onChangeInitiative={onChangeInitiative}
                  onToggleGroup={onToggleGroup}
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
                groupPosition={slotInfo?.get(participant.participantId)?.groupPosition}
                initiativeOrderNumber={
                  slotInfo?.get(participant.participantId)?.slotNumber ?? participantIndex + 1
                }
                isActiveSlot={slotInfo?.get(participant.participantId)?.isActive}
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
      initiativeOrder: normalizeInitiativeGroups(
        arrayMove(tracker.initiativeOrder, activeIndex, overIndex)
      )
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

  function handleToggleInitiative(participant: CampaignLiveEncounterTrackerParticipantRecord) {
    if (readOnly) {
      return;
    }

    const nextTracker = toggleParticipantInitiativePlacement(tracker, participant);

    if (nextTracker !== tracker) {
      onChange(nextTracker);
    }
  }

  function handleToggleGroup(participant: CampaignLiveEncounterTrackerParticipantRecord) {
    onChange(
      participant.groupId
        ? leaveGroup(tracker, participant.participantId)
        : groupWithPrevious(tracker, participant.participantId)
    );
  }

  function handleChangeInitiative(participantId: string, initiative: number | null) {
    onChange(setParticipantInitiative(tracker, participantId, initiative));
  }

  const slotInfo = getInitiativeSlotInfo(tracker.initiativeOrder, tracker.activeParticipantId);
  const hasUnrolledCreatures =
    tracker.creatures.length > 0 ||
    tracker.initiativeOrder.some(
      (participant) => participant.kind === "creature" && participant.initiative == null
    );

  function handleRollCreatures() {
    onChange(rollCreatureInitiatives(tracker));
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
          slotInfo={slotInfo}
          readOnly
          title="Initiative Order"
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <TrackerList
            activeParticipantId={tracker.activeParticipantId}
            headerAction={
              <ActionButton
                icon={<Dices size={16} aria-hidden="true" />}
                fullWidth={false}
                size="sm"
                disabled={!hasUnrolledCreatures}
                onClick={handleRollCreatures}
              >
                Roll creatures
              </ActionButton>
            }
            icon={<Swords size={16} aria-hidden="true" />}
            canGroupParticipant={(participantId) => canGroupWithPrevious(tracker, participantId)}
            listKey="initiativeOrder"
            onChangeInitiative={handleChangeInitiative}
            onToggleGroup={handleToggleGroup}
            slotInfo={slotInfo}
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
