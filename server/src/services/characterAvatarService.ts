import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

export function isAllowedCharacterAvatarMimeType(mimeType: string) {
  return allowedAvatarMimeTypes.has(mimeType);
}

export type SaveCharacterAvatarInput = {
  characterId: number;
  imageBuffer: Buffer;
  mimeType: string;
  userId: string;
};

export async function saveCharacterAvatarToS3({
  characterId,
  imageBuffer,
  mimeType,
  userId
}: SaveCharacterAvatarInput) {
  const { characterAvatarS3Bucket, characterAvatarS3Region } = getAppConfig();
  const bucket = characterAvatarS3Bucket.trim();
  const region = characterAvatarS3Region.trim();

  if (!bucket) {
    throw new AppError(
      "Missing CHARACTER_AVATAR_S3_BUCKET environment variable.",
      500,
      "MISSING_CHARACTER_AVATAR_S3_BUCKET"
    );
  }

  if (!region) {
    throw new AppError(
      "Missing CHARACTER_AVATAR_S3_REGION or AWS_REGION environment variable.",
      500,
      "MISSING_CHARACTER_AVATAR_S3_REGION"
    );
  }

  const extension = getCharacterAvatarExtension(mimeType);
  const objectKey = `users/${userId}/characters/${characterId}/portrait.${extension}`;
  const updatedAt = new Date();

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
    imageUrl: createPublicImageUrl(objectKey),
    mimeType,
    sizeBytes: imageBuffer.byteLength,
    updatedAt: updatedAt.toISOString()
  };
}
