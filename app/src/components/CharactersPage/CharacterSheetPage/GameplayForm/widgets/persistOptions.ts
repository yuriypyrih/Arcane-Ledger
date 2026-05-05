import type { PersistCharacterOptions } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";

export const classResourcePersistOptions: PersistCharacterOptions = {
  domains: ["resources", "features"],
  normalize: "targeted"
};

export const resourcePersistOptions: PersistCharacterOptions = {
  domains: ["resources"],
  normalize: "targeted"
};
