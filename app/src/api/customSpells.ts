import type { SpellEntry } from "../codex/entries/types";
import type { CharacterCustomTraitEffect } from "../types";
import { apiDelete, apiGet, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type CustomSpellRecord = {
  id: string;
  ownerId: string;
  ownerNickname: string | null;
  public: boolean;
  spell: SpellEntry;
  customEffects: CharacterCustomTraitEffect[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type CustomSpellInput = {
  castingTime: string[];
  components: string[];
  customEffects?: CharacterCustomTraitEffect[];
  description: string[];
  duration: string[];
  magicSchool: string;
  materialSpecified?: string;
  name: string;
  public?: boolean;
  range: string;
  ritual?: boolean;
  spellLevel: number;
  spellLists: string[];
};

export type CustomSpellListEnvelope = {
  customSpells: CustomSpellRecord[];
};

export type CustomSpellEnvelope = {
  customSpell: CustomSpellRecord;
};

export type CustomSpellDeleteEnvelope = {
  customSpellId: string;
};

export type CustomSpellListScope = "mine" | "public";

export type CustomSpellListOptions = ApiRequestOptions & {
  scope?: CustomSpellListScope;
};

export function listCustomSpells(options?: CustomSpellListOptions) {
  const { scope = "mine", ...requestOptions } = options ?? {};
  const path = scope === "public" ? "/custom-spells?scope=public" : "/custom-spells";

  return apiGet<CustomSpellListEnvelope>(path, requestOptions);
}

export function createCustomSpell(input: CustomSpellInput, options?: ApiRequestOptions) {
  return apiPost<CustomSpellEnvelope>("/custom-spells", input, options);
}

export function updateCustomSpell(
  customSpellId: string,
  input: CustomSpellInput,
  options?: ApiRequestOptions
) {
  return apiPut<CustomSpellEnvelope>(`/custom-spells/${customSpellId}`, input, options);
}

export function deleteCustomSpell(customSpellId: string, options?: ApiRequestOptions) {
  return apiDelete<CustomSpellDeleteEnvelope>(`/custom-spells/${customSpellId}`, options);
}
