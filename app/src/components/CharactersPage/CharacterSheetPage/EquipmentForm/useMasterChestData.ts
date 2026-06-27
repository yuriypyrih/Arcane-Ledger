import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiRequestFailedError,
  getPartyGroupInventories,
  getPartyGroupMasterChest,
  isApiAbortError,
  type PartyGroupInventoryMemberRecord
} from "../../../../api";
import { createDefaultCurrencies } from "../../../../pages/CharactersPage/constants";
import { normalizeCharacterInventoryItems } from "../../../../pages/CharactersPage/inventoryItems";
import { normalizeCharacterCurrencies } from "../../../../pages/CharactersPage/storage";
import type { Character, CharacterCurrencies, CharacterInventoryItem } from "../../../../types";

export type MasterChestDraft = {
  characterCurrencies: CharacterCurrencies;
  characterInventoryItems: CharacterInventoryItem[];
  chestCurrencies: CharacterCurrencies;
  chestInventoryItems: CharacterInventoryItem[];
};

export type MasterChestLoadStatus = "loading" | "ready" | "error";

export function normalizeMasterChestCurrencies(value: unknown): CharacterCurrencies {
  return normalizeCharacterCurrencies(value, createDefaultCurrencies());
}

export function createInitialMasterChestDraft(character: Character | undefined): MasterChestDraft {
  return {
    characterCurrencies: normalizeMasterChestCurrencies(character?.currencies),
    characterInventoryItems: normalizeCharacterInventoryItems(character?.inventoryItems),
    chestCurrencies: createDefaultCurrencies(),
    chestInventoryItems: []
  };
}

export function getMasterChestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestFailedError) {
    if (error.code === "MASTER_CHEST_REVISION_CONFLICT") {
      return "Master chest changed. Close and reopen it to get the latest contents.";
    }

    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function normalizePartyInventoryMembers(
  members: PartyGroupInventoryMemberRecord[] | undefined
): PartyGroupInventoryMemberRecord[] {
  return (Array.isArray(members) ? members : []).map((member) => ({
    ...member,
    currencies: normalizeMasterChestCurrencies(member.currencies),
    inventoryItems: normalizeCharacterInventoryItems(member.inventoryItems)
  }));
}

export function useMasterChestData({
  character,
  partyGroupId
}: {
  character?: Character;
  partyGroupId: string;
}) {
  const characterRef = useRef(character);
  const [draft, setDraft] = useState<MasterChestDraft>(() =>
    createInitialMasterChestDraft(character)
  );
  const [history, setHistory] = useState<string[]>([]);
  const [loadStatus, setLoadStatus] = useState<MasterChestLoadStatus>("loading");
  const [partyInventoryMembers, setPartyInventoryMembers] = useState<
    PartyGroupInventoryMemberRecord[]
  >([]);
  const [revision, setRevision] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  const loadMasterChestData = useCallback(
    async (signal?: AbortSignal) => {
      setLoadStatus("loading");
      setError(null);
      setHistory([]);

      try {
        const [{ masterChest }, { partyInventories }] = await Promise.all([
          getPartyGroupMasterChest(partyGroupId, {
            signal,
            suppressFailureToast: true
          }),
          getPartyGroupInventories(partyGroupId, {
            signal,
            suppressFailureToast: true
          })
        ]);

        setDraft({
          ...createInitialMasterChestDraft(characterRef.current),
          chestCurrencies: normalizeMasterChestCurrencies(masterChest.currencies),
          chestInventoryItems: normalizeCharacterInventoryItems(masterChest.inventoryItems)
        });
        setHistory(Array.isArray(masterChest.history) ? masterChest.history : []);
        setPartyInventoryMembers(normalizePartyInventoryMembers(partyInventories.members));
        setRevision(masterChest.revision);
        setLoadStatus("ready");
        return true;
      } catch (loadError) {
        if (isApiAbortError(loadError)) {
          return false;
        }

        setError(getMasterChestErrorMessage(loadError, "Unable to load master chest."));
        setLoadStatus("error");
        return false;
      }
    },
    [partyGroupId]
  );

  useEffect(() => {
    const abortController = new AbortController();

    void loadMasterChestData(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [loadMasterChestData]);

  return {
    draft,
    error,
    history,
    loadMasterChestData,
    loadStatus,
    partyInventoryMembers,
    revision,
    setDraft,
    setError
  };
}
