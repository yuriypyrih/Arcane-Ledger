import { CLASS_FEATURE, REACTION, type ReactionEntry } from "../../../../../codex/entries";
import {
  coronaOfLightDescription,
  improvedWardingFlareDescription,
  radianceOfTheDawnDescription,
  wardingFlareDescription
} from "../../../../../codex/subclasses/cleric";
import type {
  Character,
  CharacterClericFeatureState,
  CharacterStatusEntry
} from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getPreparedSpellIdsByLevel } from "../../subclassRuntime";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import {
  expendClericChannelDivinityUse,
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal
} from "../clericChannelDivinity";
import {
  coronaOfLightActionKey,
  coronaOfLightDurationRounds,
  coronaOfLightName,
  coronaOfLightStatusSourceId
} from "./clericLightDomainShared";

export const lightDomainSubclassId = "cleric-light-domain";
export const radianceOfTheDawnActionKey = "cleric-radiance-of-the-dawn";
export const wardingFlareReactionEntryId = "reaction-cleric-warding-flare";
const improvedWardingFlareSource = "Improved Warding Flare";

export { coronaOfLightActionKey, coronaOfLightName, coronaOfLightStatusSourceId };

const lightDomainSpellIdsByLevel = {
  3: ["spell-burning-hands", "spell-faerie-fire", "spell-scorching-ray", "spell-see-invisibility"],
  5: ["spell-daylight", "spell-fireball"],
  7: ["spell-arcane-eye", "spell-wall-of-fire"],
  9: ["spell-flame-strike", "spell-scrying"]
} as const;

function getClericLightDomainAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function createClericLightDomainStatusEntryId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `status-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getClericLightDomainStatusEntries(
  statusEntries: Character["statusEntries"]
): CharacterStatusEntry[] {
  return Array.isArray(statusEntries) ? [...statusEntries] : [];
}

function createClericCoronaOfLightStatusEntry(): CharacterStatusEntry {
  return {
    id: createClericLightDomainStatusEntryId(),
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: coronaOfLightName,
    source: coronaOfLightName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration: {
      kind: STATUS_DURATION_KIND.ROUNDS,
      amount: coronaOfLightDurationRounds,
      tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
    },
    sourceId: coronaOfLightStatusSourceId,
    rangeFeet: null
  };
}

function clearClericCoronaOfLightStatuses(
  statusEntries: Character["statusEntries"]
): CharacterStatusEntry[] {
  return getClericLightDomainStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== coronaOfLightStatusSourceId
  );
}

export function hasClericLightDomainFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Cleric" &&
    character.subclassId === lightDomainSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

export function hasActiveClericLightDomainCoronaOfLight(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  if (!hasClericLightDomainFeature(character, 17)) {
    return false;
  }

  return getClericLightDomainStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS && entry.sourceId === coronaOfLightStatusSourceId
  );
}

export function getClericLightDomainCoronaOfLightUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasClericLightDomainFeature(character, 17)) {
    return 0;
  }

  return Math.max(1, getClericLightDomainAbilityModifier(character.abilities?.WIS ?? 10));
}

export function getClericLightDomainCoronaOfLightUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  const totalUses = getClericLightDomainCoronaOfLightUsesTotal(character);
  const usesExpended = character.classFeatureState?.cleric?.coronaOfLightUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getClericLightDomainFeatureActions(
  character: Pick<Character, "className"> &
    Partial<
      Pick<Character, "abilities" | "level" | "classFeatureState" | "statusEntries" | "subclassId">
    >
): FeatureActionCard[] {
  if (!hasClericLightDomainFeature(character, 3)) {
    return [];
  }

  const totalChannelDivinityUses = getClericChannelDivinityUsesTotal({
    className: character.className,
    level: character.level ?? 0
  });
  const channelDivinityUsesRemaining = getClericChannelDivinityUsesRemaining({
    className: character.className,
    level: character.level ?? 0,
    classFeatureState: character.classFeatureState
  });
  const actions: FeatureActionCard[] = [
    {
      key: radianceOfTheDawnActionKey,
      name: "Radiance of the Dawn",
      sourceFeature: CLASS_FEATURE.RADIANCE_OF_THE_DAWN,
      summary: "Blast foes with radiant light.",
      detail: "Dispel magical darkness and scorch chosen creatures in a 30-foot Emanation.",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "pyromancy",
      usesRemaining: channelDivinityUsesRemaining,
      usesTotal: totalChannelDivinityUses,
      description: [...radianceOfTheDawnDescription],
      resources: [
        {
          kind: "tracker",
          label: "Uses",
          current: channelDivinityUsesRemaining,
          total: totalChannelDivinityUses,
          icon: "pyromancy",
          cost: 1
        }
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "Light Domain",
        description: [...radianceOfTheDawnDescription]
      },
      execute: {
        kind: "activate"
      },
      disabled: channelDivinityUsesRemaining <= 0,
      disabledReason:
        channelDivinityUsesRemaining <= 0 ? "No Channel Divinity uses remaining." : undefined
    }
  ];

  if (hasClericLightDomainFeature(character, 17)) {
    const usesRemaining = getClericLightDomainCoronaOfLightUsesRemaining(character);
    const usesTotal = getClericLightDomainCoronaOfLightUsesTotal(character);
    const isActive = hasActiveClericLightDomainCoronaOfLight(character);
    const description = [...coronaOfLightDescription];

    actions.push({
      key: coronaOfLightActionKey,
      name: coronaOfLightName,
      sourceFeature: CLASS_FEATURE.CORONA_OF_LIGHT,
      summary: "Emit a radiant corona for 10 turns.",
      detail: "Create a 10-turn Corona of Light trait in Traits & Conditions.",
      breakdown: "10-turn sunlight aura",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      isActive,
      description,
      drawer: {
        kind: "confirm",
        eyebrow: "Light Domain",
        description
      },
      execute: {
        kind: "activate"
      },
      disabled: isActive || usesRemaining <= 0,
      disabledReason: isActive
        ? "Corona of Light is already active."
        : usesRemaining <= 0
          ? "No Corona of Light uses remaining."
          : undefined
    });
  }

  return actions;
}

export function activateClericRadianceOfTheDawn(character: Character): Character {
  return hasClericLightDomainFeature(character, 3)
    ? expendClericChannelDivinityUse(character)
    : character;
}

export function activateClericCoronaOfLight(character: Character): Character {
  if (
    !hasClericLightDomainFeature(character, 17) ||
    hasActiveClericLightDomainCoronaOfLight(character) ||
    getClericLightDomainCoronaOfLightUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const clericState = character.classFeatureState?.cleric ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        coronaOfLightUsesExpended: (clericState.coronaOfLightUsesExpended ?? 0) + 1
      }
    },
    statusEntries: [
      ...clearClericCoronaOfLightStatuses(character.statusEntries),
      createClericCoronaOfLightStatusEntry()
    ]
  };
}

function getClericLightDomainWardingFlareReactionEntry(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry {
  const baseDescription = [...wardingFlareDescription];
  const improvedDescription = hasClericLightDomainFeature(character, 6)
    ? [...improvedWardingFlareDescription]
    : [];
  const reactionEntry: ReactionEntry = {
    id: wardingFlareReactionEntryId,
    reaction: REACTION.WARDING_FLARE,
    name: "Warding Flare",
    sourceType: "feature",
    sourceFeature: CLASS_FEATURE.WARDING_FLARE,
    sourceLabel: "Light Domain",
    description: baseDescription
  };

  if (!hasClericLightDomainFeature(character, 6)) {
    return reactionEntry;
  }

  return appendSourcedDescriptionAddition(
    reactionEntry,
    improvedWardingFlareSource,
    improvedDescription
  );
}

export function getClericLightDomainWardingFlareUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasClericLightDomainFeature(character, 3)) {
    return 0;
  }

  return Math.max(1, getClericLightDomainAbilityModifier(character.abilities?.WIS ?? 10));
}

export function getClericLightDomainWardingFlareUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  const totalUses = getClericLightDomainWardingFlareUsesTotal(character);
  const usesExpended = character.classFeatureState?.cleric?.wardingFlareUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function normalizeClericLightDomainFeatureState(
  value: Partial<CharacterClericFeatureState>,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): Pick<CharacterClericFeatureState, "coronaOfLightUsesExpended" | "wardingFlareUsesExpended"> {
  const wardingFlareUsesTotal = getClericLightDomainWardingFlareUsesTotal(character);
  const coronaOfLightUsesTotal = getClericLightDomainCoronaOfLightUsesTotal(character);

  return {
    wardingFlareUsesExpended: hasClericLightDomainFeature(character, 3)
      ? Math.max(
          0,
          Math.min(
            wardingFlareUsesTotal,
            Number.isFinite(Number(value.wardingFlareUsesExpended))
              ? Math.floor(Number(value.wardingFlareUsesExpended))
              : 0
          )
        )
      : undefined,
    coronaOfLightUsesExpended: hasClericLightDomainFeature(character, 17)
      ? Math.max(
          0,
          Math.min(
            coronaOfLightUsesTotal,
            Number.isFinite(Number(value.coronaOfLightUsesExpended))
              ? Math.floor(Number(value.coronaOfLightUsesExpended))
              : 0
          )
        )
      : undefined
  };
}

export function getClericLightDomainReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  return hasClericLightDomainFeature(character, 3)
    ? [getClericLightDomainWardingFlareReactionEntry(character)]
    : [];
}

export function consumeClericWardingFlareUse(character: Character): Character {
  if (
    !hasClericLightDomainFeature(character, 3) ||
    getClericLightDomainWardingFlareUsesRemaining(character) <= 0
  ) {
    return character;
  }

  const clericState = character.classFeatureState?.cleric ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        wardingFlareUsesExpended: (clericState.wardingFlareUsesExpended ?? 0) + 1
      }
    }
  };
}

function restoreClericWardingFlareUses(character: Character, minimumLevel: number): Character {
  if (!hasClericLightDomainFeature(character, minimumLevel)) {
    return character;
  }

  const clericState = character.classFeatureState?.cleric ?? {};

  if ((clericState.wardingFlareUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        wardingFlareUsesExpended: 0
      }
    }
  };
}

export function restoreClericWardingFlareOnShortRest(character: Character): Character {
  return restoreClericWardingFlareUses(character, 6);
}

export function restoreClericWardingFlareOnLongRest(character: Character): Character {
  return restoreClericWardingFlareUses(character, 3);
}

export function restoreClericCoronaOfLightOnLongRest(character: Character): Character {
  if (!hasClericLightDomainFeature(character, 17)) {
    return character;
  }

  const clericState = character.classFeatureState?.cleric ?? {};

  if ((clericState.coronaOfLightUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        coronaOfLightUsesExpended: 0
      }
    }
  };
}

export const getClericLightDomainDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  hasClericLightDomainFeature(character, 3)
    ? {
        featureActions: getClericLightDomainFeatureActions(character),
        reactionEntries: getClericLightDomainReactionEntries(character),
        alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
          character.level ?? 0,
          lightDomainSpellIdsByLevel
        )
      }
    : {};
