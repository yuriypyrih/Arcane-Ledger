import { apiPutBlob, type ApiRequestOptions } from "./client";

export type CharacterPortraitUploadResponse = {
  objectKey: string;
  imageUrl: string | null;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
};

export function uploadCharacterPortrait(
  characterId: number,
  portraitBlob: Blob,
  options?: ApiRequestOptions
) {
  return apiPutBlob<CharacterPortraitUploadResponse>(
    `/characters/${characterId}/portrait`,
    portraitBlob,
    options
  );
}
