import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Character } from "../types";
import {
  createCharacterSheetDomainRevisions,
  normalizeCharacterSheetDomains,
  type CharacterSheetDomain,
  type CharacterSheetDomainRevisions
} from "../pages/CharactersPage/CharacterSheetPage/domains";

export type ActiveCharacterSheetState = {
  activeCharacter: Character | null;
  characterId: number | null;
  dirty: boolean;
  revisions: CharacterSheetDomainRevisions;
};

const initialState: ActiveCharacterSheetState = {
  activeCharacter: null,
  characterId: null,
  dirty: false,
  revisions: createCharacterSheetDomainRevisions()
};

function bumpRevisions(
  revisions: CharacterSheetDomainRevisions,
  domains: readonly CharacterSheetDomain[] | undefined
) {
  normalizeCharacterSheetDomains(domains).forEach((domain) => {
    revisions[domain] += 1;
  });
}

const activeCharacterSheetSlice = createSlice({
  name: "activeCharacterSheet",
  initialState,
  reducers: {
    setActiveCharacterSheet(
      state,
      action: PayloadAction<{ character: Character | null; characterId: number | null }>
    ) {
      state.activeCharacter = action.payload.character;
      state.characterId = action.payload.characterId;
      state.dirty = false;
      state.revisions = createCharacterSheetDomainRevisions();
    },
    commitActiveCharacterSheet(
      state,
      action: PayloadAction<{
        character: Character;
        domains?: CharacterSheetDomain[];
        dirty?: boolean;
      }>
    ) {
      state.activeCharacter = action.payload.character;
      state.characterId = action.payload.character.id;
      state.dirty = action.payload.dirty ?? true;
      bumpRevisions(state.revisions, action.payload.domains);
    },
    markActiveCharacterSheetPersisted(state, action: PayloadAction<{ characterId: number }>) {
      if (state.characterId === action.payload.characterId) {
        state.dirty = false;
      }
    }
  }
});

export const {
  commitActiveCharacterSheet,
  markActiveCharacterSheetPersisted,
  setActiveCharacterSheet
} = activeCharacterSheetSlice.actions;

export const activeCharacterSheetReducer = activeCharacterSheetSlice.reducer;
