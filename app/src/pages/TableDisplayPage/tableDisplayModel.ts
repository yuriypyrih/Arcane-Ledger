import { getInitiativeSlotInfo } from "../DmToolsPage/liveEncounterInitiative";
import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";

export type TableDisplayCard = {
  ac: number | null;
  conditionImmunities: string[];
  currentHitPoints: number | null;
  id: string;
  imageUrl: string | null;
  immunities: string[];
  initiative: number | null;
  isActive: boolean;
  isAlly: boolean;
  packPosition: "single" | "first" | "middle" | "last";
  maxHitPoints: number | null;
  name: string;
  order: number;
  passivePerception: number | null;
  resistances: string[];
  subtitle: string;
  temporaryHitPoints: number;
  vitalityLabel: string | null;
  vulnerabilities: string[];
};

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function splitDamageList(display: unknown, references: unknown): string[] {
  if (typeof display === "string" && display.trim()) {
    return display
      .split(/[;,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return Array.isArray(references)
    ? references
        .map((entry) =>
          entry && typeof entry === "object" ? (entry as { name?: unknown }).name : null
        )
        .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
    : [];
}

function cleanList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];
}

/** Reduces a tracker participant to what the big-screen card shows. Works on the player-visible record. */
export function toTableDisplayCard(
  participant: CampaignLiveEncounterTrackerParticipantRecord,
  options: {
    isActive: boolean;
    order: number;
    packPosition?: "single" | "first" | "middle" | "last";
  }
): TableDisplayCard {
  const base = {
    id: participant.participantId,
    initiative: participant.initiative ?? null,
    isActive: options.isActive,
    order: options.order,
    packPosition: options.packPosition ?? "single"
  };

  if (participant.kind === "party-member") {
    const statBlock = participant.statBlock;

    return {
      ...base,
      ac: toNumber(statBlock?.armorClass),
      conditionImmunities: cleanList(statBlock?.conditionImmunities),
      currentHitPoints: toNumber(statBlock?.currentHitPoints),
      imageUrl: participant.avatar?.imageUrl ?? null,
      immunities: cleanList(statBlock?.immunities),
      isAlly: true,
      maxHitPoints: toNumber(statBlock?.hitPoints),
      name: statBlock?.name || participant.summary.name,
      passivePerception: toNumber(statBlock?.passivePerception),
      resistances: cleanList(statBlock?.resistances),
      subtitle: [participant.summary.species, participant.summary.className]
        .filter(Boolean)
        .join(" "),
      temporaryHitPoints: Math.max(
        0,
        (toNumber(statBlock?.temporaryHitPoints) ?? 0) +
          (toNumber(statBlock?.magicTemporaryHitPoints) ?? 0)
      ),
      vitalityLabel: null,
      vulnerabilities: cleanList(statBlock?.vulnerabilities)
    };
  }

  if (participant.kind === "party-companion") {
    return {
      ...base,
      ac: null,
      conditionImmunities: [],
      currentHitPoints: toNumber(participant.companion.currentHitPoints),
      imageUrl: null,
      immunities: [],
      isAlly: true,
      maxHitPoints: toNumber(participant.companion.maxHitPoints),
      name: participant.companion.name,
      passivePerception: null,
      resistances: [],
      subtitle: `${participant.summary.name}'s companion`,
      temporaryHitPoints: Math.max(0, toNumber(participant.companion.temporaryHitPoints) ?? 0),
      vitalityLabel: null,
      vulnerabilities: []
    };
  }

  const { creature } = participant;
  const entry = creature.inheritedCreatureEntry;
  // Resistances live under resistances_and_immunities and reach players only when the GM allows it.
  const defenses = entry?.resistances_and_immunities;
  const imageUrl = entry?.illustration?.file_url;

  return {
    ...base,
    ac: toNumber(entry?.armor_class),
    conditionImmunities: splitDamageList(
      defenses?.condition_immunities_display,
      defenses?.condition_immunities
    ),
    currentHitPoints: toNumber(creature.currentHitPoints),
    imageUrl:
      creature.imageUrl ||
      (typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null),
    immunities: splitDamageList(defenses?.damage_immunities_display, defenses?.damage_immunities),
    isAlly: false,
    maxHitPoints: toNumber(creature.maxHitPoints),
    name: creature.name,
    passivePerception: toNumber(entry?.passive_perception),
    resistances: splitDamageList(
      defenses?.damage_resistances_display,
      defenses?.damage_resistances
    ),
    subtitle: typeof creature.type === "string" ? creature.type : "",
    temporaryHitPoints: Math.max(0, toNumber(creature.temporaryHitPoints) ?? 0),
    vitalityLabel: creature.vitalityStatusLabel ?? null,
    vulnerabilities: splitDamageList(
      defenses?.damage_vulnerabilities_display,
      defenses?.damage_vulnerabilities
    )
  };
}

export function toTableDisplayCards(
  tracker: CampaignLiveEncounterTrackerRecord
): TableDisplayCard[] {
  const slots = getInitiativeSlotInfo(tracker.initiativeOrder, tracker.activeParticipantId);

  return tracker.initiativeOrder.map((participant, index) => {
    const slot = slots.get(participant.participantId);

    return toTableDisplayCard(participant, {
      isActive: slot?.isActive ?? false,
      order: slot?.slotNumber ?? index + 1,
      packPosition: slot?.groupPosition
    });
  });
}

/** Green when healthy, amber when hurt, red when near death. */
export function getHitPointTone(current: number, max: number) {
  const ratio = max > 0 ? current / max : 0;

  return ratio > 0.5 ? "healthy" : ratio > 0.25 ? "hurt" : "critical";
}
