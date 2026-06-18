import type { SpellEntry } from "../../codex/entries";
import {
  STATUS_DURATION_KIND,
  type Character,
  type CharacterCompanion,
  type CharacterStatusDuration
} from "../../types";
import { CHARACTER_COMPANION_LIMIT, createCharacterCompanionId } from "./companions";

export type SpellSummonDefinitionConfig = {
  spellId: string;
  defaultType?: string;
  defaultSeparateInitiative?: boolean;
  defaultDuration?: CharacterStatusDuration;
};

const oneHourDuration: CharacterStatusDuration = {
  kind: STATUS_DURATION_KIND.HOURS,
  amount: 1
};

const oneMinuteDuration: CharacterStatusDuration = {
  kind: STATUS_DURATION_KIND.MINUTES,
  amount: 1
};

const tenMinuteDuration: CharacterStatusDuration = {
  kind: STATUS_DURATION_KIND.MINUTES,
  amount: 10
};

const eightHourDuration: CharacterStatusDuration = {
  kind: STATUS_DURATION_KIND.HOURS,
  amount: 8
};

const twentyFourHourDuration: CharacterStatusDuration = {
  kind: STATUS_DURATION_KIND.HOURS,
  amount: 24
};

const spellSummonDefinitionConfigs: Record<string, SpellSummonDefinitionConfig> = {
  "spell-find-familiar": {
    spellId: "spell-find-familiar",
    defaultType: "Celestial",
    defaultSeparateInitiative: true
  },
  "spell-animate-dead": {
    spellId: "spell-animate-dead",
    defaultType: "Undead",
    defaultSeparateInitiative: false,
    defaultDuration: twentyFourHourDuration
  },
  "spell-flock-of-familiars": {
    spellId: "spell-flock-of-familiars",
    defaultSeparateInitiative: true,
    defaultDuration: oneHourDuration
  },
  "spell-danse-macabre": {
    spellId: "spell-danse-macabre",
    defaultType: "Undead",
    defaultDuration: oneHourDuration
  },
  "spell-create-undead": {
    spellId: "spell-create-undead",
    defaultType: "Undead",
    defaultDuration: twentyFourHourDuration
  },
  "spell-phantom-steed": {
    spellId: "spell-phantom-steed",
    defaultDuration: oneHourDuration
  },
  "spell-create-homunculus": {
    spellId: "spell-create-homunculus",
    defaultType: "Construct"
  },
  "spell-find-steed": {
    spellId: "spell-find-steed"
  },
  "spell-giant-insect": {
    spellId: "spell-giant-insect",
    defaultType: "Beast",
    defaultDuration: tenMinuteDuration
  },
  "spell-summon-aberration": {
    spellId: "spell-summon-aberration",
    defaultType: "Aberration",
    defaultDuration: oneHourDuration
  },
  "spell-summon-construct": {
    spellId: "spell-summon-construct",
    defaultType: "Construct",
    defaultDuration: oneHourDuration
  },
  "spell-summon-elemental": {
    spellId: "spell-summon-elemental",
    defaultType: "Elemental",
    defaultDuration: oneHourDuration
  },
  "spell-animate-objects": {
    spellId: "spell-animate-objects",
    defaultType: "Construct",
    defaultDuration: oneMinuteDuration
  },
  "spell-summon-celestial": {
    spellId: "spell-summon-celestial",
    defaultType: "Celestial",
    defaultDuration: oneHourDuration
  },
  "spell-homunculus-servant": {
    spellId: "spell-homunculus-servant",
    defaultType: "Construct"
  },
  "spell-summon-beast": {
    spellId: "spell-summon-beast",
    defaultType: "Beast",
    defaultDuration: oneHourDuration
  },
  "spell-summon-fey": {
    spellId: "spell-summon-fey",
    defaultType: "Fey",
    defaultDuration: oneHourDuration
  },
  "spell-summon-shadowspawn": {
    spellId: "spell-summon-shadowspawn",
    defaultType: "Monstrosity",
    defaultDuration: oneHourDuration
  },
  "spell-summon-undead": {
    spellId: "spell-summon-undead",
    defaultType: "Undead",
    defaultDuration: oneHourDuration
  },
  "spell-summon-warrior-spirit": {
    spellId: "spell-summon-warrior-spirit",
    defaultType: "Undead",
    defaultDuration: oneHourDuration
  },
  "spell-spirit-of-death": {
    spellId: "spell-spirit-of-death",
    defaultType: "Undead",
    defaultDuration: oneHourDuration
  },
  "spell-summon-draconic-spirit": {
    spellId: "spell-summon-draconic-spirit",
    defaultType: "Dragon",
    defaultDuration: oneHourDuration
  },
  "spell-summon-fiend": {
    spellId: "spell-summon-fiend",
    defaultType: "Fiend",
    defaultDuration: oneHourDuration
  },
  "spell-tiny-servant": {
    spellId: "spell-tiny-servant",
    defaultType: "Construct",
    defaultDuration: eightHourDuration
  },
  "spell-create-magen": {
    spellId: "spell-create-magen",
    defaultType: "Construct"
  },
  "spell-conjure-animals": {
    spellId: "spell-conjure-animals",
    defaultDuration: tenMinuteDuration
  },
  "spell-conjure-lesser-demon": {
    spellId: "spell-conjure-lesser-demon",
    defaultType: "Fiend",
    defaultSeparateInitiative: true,
    defaultDuration: oneHourDuration
  },
  "spell-summon-lesser-demons": {
    spellId: "spell-summon-lesser-demons",
    defaultType: "Fiend",
    defaultSeparateInitiative: true,
    defaultDuration: oneHourDuration
  },
  "spell-conjure-barlgura": {
    spellId: "spell-conjure-barlgura",
    defaultType: "Fiend",
    defaultSeparateInitiative: true,
    defaultDuration: tenMinuteDuration
  },
  "spell-conjure-minor-elementals": {
    spellId: "spell-conjure-minor-elementals",
    defaultType: "Elemental",
    defaultDuration: tenMinuteDuration
  },
  "spell-conjure-shadow-demon": {
    spellId: "spell-conjure-shadow-demon",
    defaultType: "Fiend",
    defaultSeparateInitiative: true,
    defaultDuration: oneHourDuration
  },
  "spell-conjure-woodland-beings": {
    spellId: "spell-conjure-woodland-beings",
    defaultDuration: tenMinuteDuration
  },
  "spell-faithful-hound": {
    spellId: "spell-faithful-hound",
    defaultDuration: eightHourDuration
  },
  "spell-find-greater-steed": {
    spellId: "spell-find-greater-steed"
  },
  "spell-galders-speedy-courier": {
    spellId: "spell-galders-speedy-courier",
    defaultType: "Elemental",
    defaultDuration: tenMinuteDuration
  },
  "spell-summon-greater-demon": {
    spellId: "spell-summon-greater-demon",
    defaultType: "Fiend",
    defaultSeparateInitiative: true,
    defaultDuration: oneHourDuration
  },
  "spell-awaken": {
    spellId: "spell-awaken"
  },
  "spell-conjure-elemental": {
    spellId: "spell-conjure-elemental",
    defaultType: "Elemental",
    defaultDuration: tenMinuteDuration
  },
  "spell-conjure-vrock": {
    spellId: "spell-conjure-vrock",
    defaultType: "Fiend",
    defaultSeparateInitiative: true,
    defaultDuration: oneHourDuration
  },
  "spell-infernal-calling": {
    spellId: "spell-infernal-calling",
    defaultType: "Fiend",
    defaultSeparateInitiative: true,
    defaultDuration: oneHourDuration
  },
  "spell-negative-energy-flood": {
    spellId: "spell-negative-energy-flood",
    defaultType: "Undead"
  },
  "spell-summon-dragon": {
    spellId: "spell-summon-dragon",
    defaultType: "Dragon",
    defaultDuration: oneHourDuration
  },
  "spell-conjure-fey": {
    spellId: "spell-conjure-fey",
    defaultType: "Fey",
    defaultDuration: tenMinuteDuration
  },
  "spell-druid-grove": {
    spellId: "spell-druid-grove",
    defaultType: "Plant",
    defaultDuration: twentyFourHourDuration
  },
  "spell-planar-ally": {
    spellId: "spell-planar-ally"
  },
  "spell-conjure-celestial": {
    spellId: "spell-conjure-celestial",
    defaultType: "Celestial",
    defaultDuration: tenMinuteDuration
  },
  "spell-conjure-hezrou": {
    spellId: "spell-conjure-hezrou",
    defaultType: "Fiend",
    defaultSeparateInitiative: true,
    defaultDuration: oneHourDuration
  },
  "spell-finger-of-death": {
    spellId: "spell-finger-of-death",
    defaultType: "Undead"
  },
  "spell-simulacrum": {
    spellId: "spell-simulacrum",
    defaultType: "Construct"
  },
  "spell-unseen-servant": {
    spellId: "spell-unseen-servant",
    defaultDuration: oneHourDuration
  }
};

export function getSpellSummonDefinitionConfig(
  spell: Pick<SpellEntry, "id"> | string | null | undefined
): SpellSummonDefinitionConfig | null {
  const spellId = typeof spell === "string" ? spell : spell?.id;

  return spellId ? (spellSummonDefinitionConfigs[spellId] ?? null) : null;
}

export function canAddSpellSummonCompanionsForCast(
  character: Character,
  companions: readonly CharacterCompanion[] | null | undefined
): boolean {
  const companionCount = companions?.length ?? 0;

  return (character.companions ?? []).length + companionCount <= CHARACTER_COMPANION_LIMIT;
}

function createCompanionForSpellCast(companion: CharacterCompanion): CharacterCompanion {
  const { deathSaves, temporaryHitPointsSource, ...freshCompanion } = companion;

  void deathSaves;
  void temporaryHitPointsSource;

  return {
    ...freshCompanion,
    id: createCharacterCompanionId(),
    currentHitPoints: companion.maxHitPoints,
    temporaryHitPoints: 0
  };
}

export function appendSpellSummonCompanionsForCast(
  character: Character,
  companions: readonly CharacterCompanion[] | null | undefined
): Character {
  const companionsToAdd = companions ?? [];

  if (
    companionsToAdd.length === 0 ||
    !canAddSpellSummonCompanionsForCast(character, companionsToAdd)
  ) {
    return character;
  }

  return {
    ...character,
    companions: [
      ...(character.companions ?? []),
      ...companionsToAdd.map(createCompanionForSpellCast)
    ]
  };
}
