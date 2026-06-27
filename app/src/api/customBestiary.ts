import type { MonsterRecord } from "../types";
import { apiDelete, apiGet, apiPost, apiPut, type ApiRequestOptions } from "./client";

export type CustomBestiaryRecord = {
  id: string;
  ownerId: string;
  ownerNickname: string | null;
  public: boolean;
  monster: MonsterRecord;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CustomBestiaryInput = {
  monster: MonsterRecord;
  public?: boolean;
};

export type CustomBestiaryListEnvelope = {
  customBestiary: CustomBestiaryRecord[];
};

export type CustomBestiaryEnvelope = {
  customCreature: CustomBestiaryRecord;
};

export type CustomBestiaryDeleteEnvelope = {
  customBestiaryId: string;
};

export type CustomBestiaryListScope = "mine" | "public";

export type CustomBestiaryListOptions = ApiRequestOptions & {
  scope?: CustomBestiaryListScope;
};

export function listCustomBestiary(options?: CustomBestiaryListOptions) {
  const { scope = "mine", ...requestOptions } = options ?? {};
  const path = scope === "public" ? "/custom-bestiary?scope=public" : "/custom-bestiary";

  return apiGet<CustomBestiaryListEnvelope>(path, requestOptions);
}

export function createCustomBestiary(input: CustomBestiaryInput, options?: ApiRequestOptions) {
  return apiPost<CustomBestiaryEnvelope>("/custom-bestiary", input, options);
}

export function updateCustomBestiary(
  customBestiaryId: string,
  input: CustomBestiaryInput,
  options?: ApiRequestOptions
) {
  return apiPut<CustomBestiaryEnvelope>(`/custom-bestiary/${customBestiaryId}`, input, options);
}

export function deleteCustomBestiary(customBestiaryId: string, options?: ApiRequestOptions) {
  return apiDelete<CustomBestiaryDeleteEnvelope>(
    `/custom-bestiary/${customBestiaryId}`,
    options
  );
}
