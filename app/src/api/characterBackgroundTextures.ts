import type { CharacterBackgroundTextureMetadata } from "../types";
import type { CharacterSheetCloudDocument, CharacterSheetSyncPayload } from "./characters";
import { apiPut, apiPutBlob, type ApiRequestOptions } from "./client";

export type CharacterBackgroundTextureSelection =
  | {
      source: "default";
    }
  | {
      source: "none";
    }
  | {
      source: "predefined";
      textureId: string;
    };

export type CharacterBackgroundTextureMutationResponse = {
  backgroundTexture: CharacterBackgroundTextureMetadata | null;
  character: CharacterSheetCloudDocument;
};

type CharacterBackgroundTextureSyncOptions = ApiRequestOptions & {
  syncPayload?: CharacterSheetSyncPayload | null;
};

function readBlobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read background texture image."));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Unable to read background texture image."));
    };
    reader.readAsDataURL(blob);
  });
}

async function createUploadedBackgroundTexturePayload(
  textureBlob: Blob,
  syncPayload?: CharacterSheetSyncPayload | null
) {
  const dataUrl = await readBlobDataUrl(textureBlob);
  const dataBase64 = dataUrl.split(",")[1] ?? "";

  return {
    backgroundTexture: {
      source: "uploaded",
      dataBase64,
      mimeType: textureBlob.type
    },
    ...(syncPayload ? { character: syncPayload } : {})
  };
}

export function updateCharacterBackgroundTextureSelection(
  characterSheetId: string,
  backgroundTexture: CharacterBackgroundTextureSelection,
  options?: CharacterBackgroundTextureSyncOptions
) {
  const { syncPayload, ...requestOptions } = options ?? {};

  return apiPut<CharacterBackgroundTextureMutationResponse>(
    `/characters/${characterSheetId}/background-texture`,
    {
      backgroundTexture,
      ...(syncPayload ? { character: syncPayload } : {})
    },
    requestOptions
  );
}

export async function uploadCharacterBackgroundTexture(
  characterSheetId: string,
  textureBlob: Blob,
  options?: CharacterBackgroundTextureSyncOptions
) {
  const { syncPayload, ...requestOptions } = options ?? {};

  if (syncPayload) {
    return apiPut<CharacterBackgroundTextureMutationResponse>(
      `/characters/${characterSheetId}/background-texture`,
      await createUploadedBackgroundTexturePayload(textureBlob, syncPayload),
      requestOptions
    );
  }

  return apiPutBlob<CharacterBackgroundTextureMutationResponse>(
    `/characters/${characterSheetId}/background-texture`,
    textureBlob,
    requestOptions
  );
}
