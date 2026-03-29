import { codexRepository } from "../../codex/repository";
import type { CodexEntry } from "../../codex/entries";

export async function loadCodexEntries(): Promise<CodexEntry[]> {
  return codexRepository.getAllEntries();
}
