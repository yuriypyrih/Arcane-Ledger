import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

const allowedAvatarMimeTypes = new Set(["image/webp", "image/jpeg"]);

let s3Client: S3Client | null = null;
let s3ClientRegion: string | null = null;

function getS3Client(region: string) {
  if (!s3Client || s3ClientRegion !== region) {
    s3Client = new S3Client({ region });
    s3ClientRegion = region;
  }

  return s3Client;
}

function getCharacterAvatarExtension(mimeType: string) {
  if (mimeType === "image/webp") {
    return "webp";
  }

  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  throw new AppError("Unsupported character portrait image type.", 415, "UNSUPPORTED_AVATAR_TYPE", {
    allowedMimeTypes: [...allowedAvatarMimeTypes]
  });
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

function createAvatarObjectKey(characterSheetId: string, mimeType: string, timestamp: number) {
  const { characterAvatarS3KeyPrefix } = getAppConfig();
  const prefix = characterAvatarS3KeyPrefix.trim().replace(/^\/+|\/+$/g, "") || "avatars";
  const extension = getCharacterAvatarExtension(mimeType);

  return `${prefix}/${characterSheetId}-${timestamp}.${extension}`;
}

export function isAllowedCharacterAvatarMimeType(mimeType: string) {
  return allowedAvatarMimeTypes.has(mimeType);
}

export type SaveCharacterAvatarInput = {
  characterSheetId: string;
  imageBuffer: Buffer;
  mimeType: string;
};

export async function saveCharacterAvatarToS3({
  characterSheetId,
  imageBuffer,
  mimeType
}: SaveCharacterAvatarInput) {
  const { characterAvatarS3Bucket, characterAvatarS3Region } = getAppConfig();
  const bucket = characterAvatarS3Bucket.trim();
  const region = characterAvatarS3Region.trim();
  const updatedAt = new Date();
  const objectKey = createAvatarObjectKey(characterSheetId, mimeType, updatedAt.getTime());
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
    objectKey,
    imageUrl,
    mimeType,
    sizeBytes: imageBuffer.byteLength,
    updatedAt
  };
}

export async function deleteCharacterAvatarFromS3(objectKey: string) {
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
