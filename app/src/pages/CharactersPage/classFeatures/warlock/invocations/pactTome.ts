import {
  ELDRITCH_INVOCATION,
  getSpellEntryById,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSpellEntries } from "../../../../../codex/selectors";
import {
  createWarlockInvocationSelectionId,
  parseWarlockInvocationSelectionId
} from "./selectionIds";

export type WarlockPactTomeSpellSelection = {
  cantripIds: string[];
  ritualSpellIds: string[];
};

const pactTomeCantripSelectionCount = 3;
const pactTomeRitualSelectionCount = 2;
const pactTomeChoiceSectionSeparator = ";";
const pactTomeChoiceValueSeparator = ",";
const pactTomeCantripChoicePrefix = "cantrips=";
const pactTomeRitualChoicePrefix = "rituals=";

function normalizePactTomeSpellIds(spellIds: string[]): string[] {
  return [...new Set(spellIds.map((spellId) => spellId.trim()).filter(Boolean))];
}

function isPactTomeCantripSpell(spell: SpellEntry | null): spell is SpellEntry {
  return spell !== null && spell.spellLevel === 0 && spell.spellLists.length > 0;
}

function isPactTomeRitualSpell(spell: SpellEntry | null): spell is SpellEntry {
  return (
    spell !== null && spell.spellLevel === 1 && spell.ritual === true && spell.spellLists.length > 0
  );
}

const pactTomeCantripOptions = getSpellEntries()
  .filter(isPactTomeCantripSpell)
  .sort((left, right) => left.name.localeCompare(right.name));

const pactTomeRitualSpellOptions = getSpellEntries()
  .filter(isPactTomeRitualSpell)
  .sort((left, right) => left.name.localeCompare(right.name));

const pactTomeCantripOptionsById = new Map(
  pactTomeCantripOptions.map((spell) => [spell.id, spell] as const)
);

const pactTomeRitualSpellOptionsById = new Map(
  pactTomeRitualSpellOptions.map((spell) => [spell.id, spell] as const)
);

function isValidWarlockPactTomeSelection(selection: WarlockPactTomeSpellSelection): boolean {
  const cantripIds = normalizePactTomeSpellIds(selection.cantripIds);
  const ritualSpellIds = normalizePactTomeSpellIds(selection.ritualSpellIds);

  return (
    cantripIds.length === pactTomeCantripSelectionCount &&
    ritualSpellIds.length === pactTomeRitualSelectionCount &&
    cantripIds.every((spellId) => pactTomeCantripOptionsById.has(spellId)) &&
    ritualSpellIds.every((spellId) => pactTomeRitualSpellOptionsById.has(spellId))
  );
}

export function getWarlockPactTomeCantripOptions(): SpellEntry[] {
  return pactTomeCantripOptions.slice();
}

export function getWarlockPactTomeRitualSpellOptions(): SpellEntry[] {
  return pactTomeRitualSpellOptions.slice();
}

export function createWarlockPactTomeChoiceValue(
  cantripIds: string[],
  ritualSpellIds: string[]
): string {
  return [
    `${pactTomeCantripChoicePrefix}${normalizePactTomeSpellIds(cantripIds).join(
      pactTomeChoiceValueSeparator
    )}`,
    `${pactTomeRitualChoicePrefix}${normalizePactTomeSpellIds(ritualSpellIds).join(
      pactTomeChoiceValueSeparator
    )}`
  ].join(pactTomeChoiceSectionSeparator);
}

export function parseWarlockPactTomeChoiceValue(
  choiceValue: string | null
): WarlockPactTomeSpellSelection | null {
  if (!choiceValue) {
    return null;
  }

  const sections = choiceValue.split(pactTomeChoiceSectionSeparator);
  const cantripSection = sections.find((section) =>
    section.startsWith(pactTomeCantripChoicePrefix)
  );
  const ritualSection = sections.find((section) => section.startsWith(pactTomeRitualChoicePrefix));

  if (!cantripSection || !ritualSection) {
    return null;
  }

  const selection = {
    cantripIds: normalizePactTomeSpellIds(
      cantripSection.slice(pactTomeCantripChoicePrefix.length).split(pactTomeChoiceValueSeparator)
    ),
    ritualSpellIds: normalizePactTomeSpellIds(
      ritualSection.slice(pactTomeRitualChoicePrefix.length).split(pactTomeChoiceValueSeparator)
    )
  };

  return isValidWarlockPactTomeSelection(selection) ? selection : null;
}

export function createWarlockPactTomeSelectionId(
  cantripIds: string[],
  ritualSpellIds: string[]
): string {
  return createWarlockInvocationSelectionId(
    ELDRITCH_INVOCATION.PACT_OF_THE_TOME,
    createWarlockPactTomeChoiceValue(cantripIds, ritualSpellIds)
  );
}

export function getWarlockPactTomeSelectionFromSelectionId(
  selectionId: string
): WarlockPactTomeSpellSelection | null {
  const { invocationId, choiceValue } = parseWarlockInvocationSelectionId(selectionId);

  if (invocationId !== ELDRITCH_INVOCATION.PACT_OF_THE_TOME) {
    return null;
  }

  return parseWarlockPactTomeChoiceValue(choiceValue);
}

export function getChoiceLabelForPactTomeSelection(
  selection: WarlockPactTomeSpellSelection
): string {
  const spellNames = [...selection.cantripIds, ...selection.ritualSpellIds]
    .map((spellId) => getSpellEntryById(spellId)?.name)
    .filter((name): name is string => Boolean(name));

  return spellNames.length > 0 ? spellNames.join(", ") : "Book of Shadows spells";
}

export function getWarlockPactTomeSpellIdsFromChoiceValues(choiceValues: string[]): string[] {
  const selection = choiceValues
    .map(parseWarlockPactTomeChoiceValue)
    .find((currentSelection): currentSelection is WarlockPactTomeSpellSelection =>
      Boolean(currentSelection)
    );

  return selection ? [...selection.cantripIds, ...selection.ritualSpellIds] : [];
}
