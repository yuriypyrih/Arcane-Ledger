import {
  getSpeciesEntryByName,
  type SpeciesEntry,
  type SpellDescriptionEntry
} from "../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../types";

type HalflingRuntimeCharacter = Pick<Character, "species">;

const halflingSpeciesId = "species-halfling-2024";

function getHalflingEntry(species = "Halfling"): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === halflingSpeciesId ? entry : null;
}

function getHalflingDescriptionSection(
  entry: SpeciesEntry,
  heading: string
): SpellDescriptionEntry[] {
  const description = entry.description.filter(
    (descriptionEntry): descriptionEntry is string => typeof descriptionEntry === "string"
  );
  const startIndex = description.findIndex((descriptionEntry) =>
    descriptionEntry.includes(`<strong>${heading}.`)
  );

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const descriptionEntry = description[index]!;

    if (index > startIndex && descriptionEntry.startsWith("<strong>")) {
      break;
    }

    section.push(descriptionEntry);
  }

  return section;
}

function getHalflingDescriptionText(
  entry: SpeciesEntry,
  heading: string,
  fallback: string
): string {
  const section = getHalflingDescriptionSection(entry, heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function createHalflingStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> & {
    sourceId: string;
  }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: "Halfling",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: null,
    description: options.description
  };
}

export function isHalflingSpecies(species: string): boolean {
  return getHalflingEntry(species) !== null;
}

export function getHalflingDerivedStatusEntriesForCharacter(
  character: HalflingRuntimeCharacter
): CharacterStatusEntry[] {
  const entry = getHalflingEntry(character.species);

  if (!entry) {
    return [];
  }

  const braveDescription = getHalflingDescriptionText(
    entry,
    "Brave",
    "You have Advantage on saving throws you make to avoid or end the Frightened condition."
  );
  const nimblenessDescription = getHalflingDescriptionText(
    entry,
    "Halfling Nimbleness",
    "You can move through the space of any creature that is a size larger than you, but you can't stop in the same space."
  );
  const luckDescription = getHalflingDescriptionText(
    entry,
    "Luck",
    "When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll."
  );
  const naturallyStealthyDescription = getHalflingDescriptionText(
    entry,
    "Naturally Stealthy",
    "You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you."
  );

  return [
    createHalflingStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Halfling Traits",
      sourceId: "species-halfling-traits",
      description: [
        braveDescription,
        nimblenessDescription,
        luckDescription,
        naturallyStealthyDescription
      ].join("\n")
    })
  ];
}
