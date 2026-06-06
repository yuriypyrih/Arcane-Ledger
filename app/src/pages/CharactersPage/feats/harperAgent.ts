import { TOOL_PROFICIENCY, type HarperAgentChoice } from "../../../types";
import {
  getToolProficiencyLabel,
  musicalInstrumentToolProficiencies
} from "../proficiencyOptions";

const harperAgentInstrumentSet = new Set<TOOL_PROFICIENCY>(musicalInstrumentToolProficiencies);

export function getDefaultHarperAgentInstrument(): TOOL_PROFICIENCY {
  return harperAgentInstrumentSet.has(TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE)
    ? TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE
    : (musicalInstrumentToolProficiencies[0] ?? TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE);
}

export function isHarperAgentInstrument(value: unknown): value is TOOL_PROFICIENCY {
  return typeof value === "string" && harperAgentInstrumentSet.has(value as TOOL_PROFICIENCY);
}

export function normalizeHarperAgentChoice(value: unknown): HarperAgentChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<HarperAgentChoice>;

  return isHarperAgentInstrument(record.toolProficiency)
    ? {
        toolProficiency: record.toolProficiency
      }
    : undefined;
}

export function getHarperAgentChoiceSummary(choice?: HarperAgentChoice): string | null {
  return choice ? getToolProficiencyLabel(choice.toolProficiency) : null;
}
