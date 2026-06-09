import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

const allowedBackgroundTextureMimeTypes = new Set(["image/webp", "image/jpeg"]);

let s3Client: S3Client | null = null;
let s3ClientRegion: string | null = null;

function getS3Client(region: string) {
  if (!s3Client || s3ClientRegion !== region) {
    s3Client = new S3Client({ region });
    s3ClientRegion = region;
  }

  return s3Client;
}

function getCharacterBackgroundTextureExtension(mimeType: string) {
  if (mimeType === "image/webp") {
    return "webp";
  }

  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  throw new AppError(
    "Unsupported character background texture image type.",
    415,
    "UNSUPPORTED_BACKGROUND_TEXTURE_TYPE",
    {
      allowedMimeTypes: [...allowedBackgroundTextureMimeTypes]
    }
  );
}

function createPublicImageUrl(objectKey: string) {
  const { characterAvatarS3PublicBaseUrl } = getAppConfig();
  const trimmedBaseUrl = characterAvatarS3PublicBaseUrl.trim();

  if (!trimmedBaseUrl) {
    return null;
  }

  return new URL(objectKey, trimmedBaseUrl.endsWith("/") ? trimmedBaseUrl : `${trimmedBaseUrl}/`)
    .toString();
}

function createBackgroundTextureObjectKey(
  characterSheetId: string,
  mimeType: string,
  timestamp: number
) {
  const { characterBackgroundTextureS3KeyPrefix } = getAppConfig();
  const prefix =
    characterBackgroundTextureS3KeyPrefix.trim().replace(/^\/+|\/+$/g, "") ||
    "background-textures";
  const extension = getCharacterBackgroundTextureExtension(mimeType);

  return `${prefix}/${characterSheetId}-${timestamp}.${extension}`;
}

export function isAllowedCharacterBackgroundTextureMimeType(mimeType: string) {
  return allowedBackgroundTextureMimeTypes.has(mimeType);
}

export type SaveCharacterBackgroundTextureInput = {
  characterSheetId: string;
  imageBuffer: Buffer;
  mimeType: string;
};

export async function saveCharacterBackgroundTextureToS3({
  characterSheetId,
  imageBuffer,
  mimeType
}: SaveCharacterBackgroundTextureInput) {
  const { characterAvatarS3Bucket, characterAvatarS3Region } = getAppConfig();
  const bucket = characterAvatarS3Bucket.trim();
  const region = characterAvatarS3Region.trim();
  const updatedAt = new Date();
  const objectKey = createBackgroundTextureObjectKey(characterSheetId, mimeType, updatedAt.getTime());
  const imageUrl = createPublicImageUrl(objectKey);

  if (!bucket) {
    throw new AppError(
      "Missing CHARACTER_AVATAR_S3_BUCKET environment variable.",
      500,
      "MISSING_CHARACTER_AVATAR_S3_BUCKET"
    );
  }

  if (!region) {
    throw new AppError(
      "Missing CHARACTER_AVATAR_S3_REGION environment variable.",
      500,
      "MISSING_CHARACTER_AVATAR_S3_REGION"
    );
  }

  if (!imageUrl) {
    throw new AppError(
      "Missing CHARACTER_AVATAR_S3_PUBLIC_BASE_URL environment variable.",
      500,
      "MISSING_CHARACTER_AVATAR_S3_PUBLIC_BASE_URL"
    );
  }

  await getS3Client(region).send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: imageBuffer,
      ContentLength: imageBuffer.byteLength,
      ContentType: mimeType
    })
  );

  return {
    source: "uploaded" as const,
    objectKey,
    imageUrl,
    mimeType,
    sizeBytes: imageBuffer.byteLength,
    updatedAt
  };
}

export async function deleteCharacterBackgroundTextureFromS3(objectKey: string) {
  const { characterAvatarS3Bucket, characterAvatarS3Region } = getAppConfig();
  const bucket = characterAvatarS3Bucket.trim();
  const region = characterAvatarS3Region.trim();

  if (!objectKey.trim()) {
    return;
  }

  if (!bucket || !region) {
    return;
  }

  await getS3Client(region).send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey
    })
  );
}
