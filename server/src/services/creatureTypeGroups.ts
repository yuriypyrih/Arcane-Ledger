import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";

/**
 * Creature types: creatures of one encounter that share a `typeGroupId` follow the same definition.
 * Editing any member's definition updates the others; per-creature state (name, current hit points,
 * temporary hit points, death saves) stays separate. There is no privileged "main" creature.
 */

/** What a creature inherits from its type. Hit points left, name and death saves are per creature. */
export const TEMPLATE_INHERITED_KEYS = [
  "inheritedCreatureEntry",
  "inheritedCreatureEntryModified",
  "maxHitPoints",
  "type",
  "description",
  "primalBeastKind",
  "imageUrl",
  "duration"
] as const;

/** Prepared encounters also share what players are allowed to see. */
export const CAMPAIGN_INHERITED_KEYS = [...TEMPLATE_INHERITED_KEYS, "visibilitySettings"] as const;

export type CreatureLinkIntent = {
  /** On a new creature: make it a linked copy of this creature (which joins the same type). */
  copyOfCreatureId?: string;
  /** Detach this creature from its type, keeping its current values. */
  unlinkFromType?: boolean;
};

type LinkableCreature = {
  currentHitPoints: number;
  id: string;
  maxHitPoints: number;
  typeGroupId?: string | null;
};

type Mutable = Record<string, unknown>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sameValue(left: unknown, right: unknown) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

function createGroupId() {
  return new Types.ObjectId().toString();
}

/** Link intents come from the raw request body and are never stored on the creature. */
export function readCreatureLinkIntent(raw: unknown): CreatureLinkIntent {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {};
  }

  const body = raw as Record<string, unknown>;
  const copyOf = typeof body.copyOfCreatureId === "string" ? body.copyOfCreatureId.trim() : "";

  return {
    ...(copyOf && copyOf.length <= 128 ? { copyOfCreatureId: copyOf } : {}),
    ...(body.unlinkFromType === true ? { unlinkFromType: true } : {})
  };
}

function copyDefinition(from: Mutable, to: Mutable, keys: readonly string[]) {
  keys.forEach((key) => {
    if (from[key] === undefined) {
      delete to[key];
    } else {
      to[key] = clone(from[key]);
    }
  });
}

function clampHitPoints(creature: LinkableCreature) {
  creature.currentHitPoints = Math.min(creature.currentHitPoints, creature.maxHitPoints);
}

/** A type needs at least two creatures; a group left with one dissolves. */
export function dissolveLoneGroups<T extends LinkableCreature>(creatures: T[]): T[] {
  const sizes = new Map<string, number>();

  creatures.forEach((creature) => {
    if (creature.typeGroupId) {
      sizes.set(creature.typeGroupId, (sizes.get(creature.typeGroupId) ?? 0) + 1);
    }
  });

  return creatures.map((creature) =>
    creature.typeGroupId && (sizes.get(creature.typeGroupId) ?? 0) < 2
      ? { ...creature, typeGroupId: null }
      : creature
  );
}

/**
 * Applies one creature write to the encounter's creature list and returns the next list.
 * - A copy joins its source's type and inherits its whole definition (and starts at full health).
 * - Editing a linked creature copies only the definition fields that actually changed to its
 *   siblings, so an HP-only edit from a stale client can never overwrite their definitions.
 * - The client cannot change group membership directly; only the intents above can.
 */
export function applyCreatureTypeRules<T extends LinkableCreature>(options: {
  creature: T;
  creatures: T[];
  inheritedKeys: readonly string[];
  intent: CreatureLinkIntent;
}): T[] {
  const creatures = options.creatures.map((creature) => clone(creature)) as (T & Mutable)[];
  const incoming = clone(options.creature) as T & Mutable;
  const existingIndex = creatures.findIndex((creature) => creature.id === incoming.id);
  const existing = existingIndex >= 0 ? creatures[existingIndex] : undefined;

  incoming.typeGroupId = existing?.typeGroupId ?? null;

  if (options.intent.unlinkFromType) {
    incoming.typeGroupId = null;
  } else if (!existing && options.intent.copyOfCreatureId) {
    const source = creatures.find((creature) => creature.id === options.intent.copyOfCreatureId);

    if (!source) {
      throw new AppError(
        "The creature to copy was not found.",
        404,
        "ENCOUNTER_CREATURE_NOT_FOUND"
      );
    }

    const groupId = source.typeGroupId ?? createGroupId();

    source.typeGroupId = groupId;
    incoming.typeGroupId = groupId;
    copyDefinition(source, incoming, options.inheritedKeys);
    incoming.currentHitPoints = incoming.maxHitPoints;
  }

  if (existing && incoming.typeGroupId && existing.typeGroupId === incoming.typeGroupId) {
    const changedKeys = options.inheritedKeys.filter(
      (key) => !sameValue(existing[key], incoming[key])
    );

    if (changedKeys.length > 0) {
      creatures.forEach((sibling) => {
        if (sibling.id !== incoming.id && sibling.typeGroupId === incoming.typeGroupId) {
          copyDefinition(incoming, sibling, changedKeys);
          clampHitPoints(sibling);
        }
      });
    }
  }

  if (existingIndex >= 0) {
    creatures[existingIndex] = incoming;
  } else {
    creatures.push(incoming);
  }

  return dissolveLoneGroups(creatures);
}

/**
 * "Link same monsters": creatures built from the same monster (same stat block key) become one type.
 * The first creature's definition wins. Creatures without a stat block are left alone.
 */
export function linkCreaturesByMonster<T extends LinkableCreature>(options: {
  creatures: T[];
  inheritedKeys: readonly string[];
}): { creatures: T[]; linkedCount: number } {
  const creatures = options.creatures.map((creature) => clone(creature)) as (T & Mutable)[];
  const byMonsterKey = new Map<string, (T & Mutable)[]>();

  creatures.forEach((creature) => {
    const entry = creature.inheritedCreatureEntry as { key?: unknown } | undefined;

    if (entry && typeof entry.key === "string" && entry.key) {
      byMonsterKey.set(entry.key, [...(byMonsterKey.get(entry.key) ?? []), creature]);
    }
  });

  let linkedCount = 0;

  byMonsterKey.forEach((members) => {
    const first = members[0];

    if (!first || members.length < 2) {
      return;
    }

    const groupId = first.typeGroupId ?? createGroupId();

    members.forEach((member) => {
      if (member !== first) {
        copyDefinition(first, member, options.inheritedKeys);
        clampHitPoints(member);
      }

      member.typeGroupId = groupId;
      linkedCount += 1;
    });
  });

  return { creatures: dissolveLoneGroups(creatures), linkedCount };
}
