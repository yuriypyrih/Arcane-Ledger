import type { CodexEntry } from "../../types";

export async function loadCodexEntries(): Promise<CodexEntry[]> {
  const response = await fetch("/data/codex.sample.json");

  if (!response.ok) {
    throw new Error("Failed to load codex entries.");
  }

  return (await response.json()) as CodexEntry[];
}
