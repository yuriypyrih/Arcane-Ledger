import type { CharacterAvatarMetadata } from "../types";
import type { CharacterSheetCloudDocument, CharacterSheetSyncPayload } from "./characters";
import { apiDelete, apiDeleteJson, apiPut, apiPutBlob, type ApiRequestOptions } from "./client";

export type CharacterPortraitMutationResponse = {
  avatar: CharacterAvatarMetadata | null;
  character: CharacterSheetCloudDocument;
};

type CharacterPortraitSyncOptions = ApiRequestOptions & {
  syncPayload?: CharacterSheetSyncPayload | null;
};

function readBlobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Unable to read portrait image."));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Unable to read portrait image."));
    };
    reader.readAsDataURL(blob);
  });
}

async function createPortraitJsonPayload(
  portraitBlob: Blob,
  syncPayload?: CharacterSheetSyncPayload | null
) {
  const dataUrl = await readBlobDataUrl(portraitBlob);
  const dataBase64 = dataUrl.split(",")[1] ?? "";

  return {
    portrait: {
      dataBase64,
      mimeType: portraitBlob.type
    },
    ...(syncPayload ? { character: syncPayload } : {})
  };
}

export async function uploadCharacterPortrait(
  characterSheetId: string,
  portraitBlob: Blob,
  options?: CharacterPortraitSyncOptions
) {
  const { syncPayload, ...requestOptions } = options ?? {};

  if (syncPayload) {
    return apiPut<CharacterPortraitMutationResponse>(
      `/characters/${characterSheetId}/portrait`,
      await createPortraitJsonPayload(portraitBlob, syncPayload),
      requestOptions
    );
  }

  return apiPutBlob<CharacterPortraitMutationResponse>(
    `/characters/${characterSheetId}/portrait`,
    portraitBlob,
    requestOptions
  );
}

export function deleteCharacterPortrait(
  characterSheetId: string,
  options?: CharacterPortraitSyncOptions
) {
  const { syncPayload, ...requestOptions } = options ?? {};

  if (syncPayload) {
    return apiDeleteJson<CharacterPortraitMutationResponse>(
      `/characters/${characterSheetId}/portrait`,
      { character: syncPayload },
      requestOptions
    );
  }

  return apiDelete<CharacterPortraitMutationResponse>(
    `/characters/${characterSheetId}/portrait`,
    requestOptions
  );
}
