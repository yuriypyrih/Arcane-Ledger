import { hardcodedCodexEntries, type CodexEntry } from "../../codex/entries";

export async function loadCodexEntries(): Promise<CodexEntry[]> {
  return hardcodedCodexEntries;
}
