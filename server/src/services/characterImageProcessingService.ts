import sharp from "sharp";
import { AppError } from "../errors/AppError.js";
import { captureServerError, captureServerMessage } from "../sentry.js";

export const CHARACTER_IMAGE_UPLOAD_MAX_BYTES = 1024 * 1024;
export const CHARACTER_IMAGE_TARGET_BYTES = 150 * 1024;
export const CHARACTER_IMAGE_HARD_MAX_BYTES = 300 * 1024;
export const CHARACTER_IMAGE_OUTPUT_MIME_TYPE = "image/webp";

export const CHARACTER_PORTRAIT_OUTPUT_WIDTH = 384;
export const CHARACTER_PORTRAIT_OUTPUT_HEIGHT = 512;
export const CHARACTER_BACKGROUND_TEXTURE_OUTPUT_SIZE = 750;

type CharacterImageKind = "portrait" | "background_texture";

type ProcessCharacterImageUploadInput = {
  imageBuffer: Buffer;
  kind: CharacterImageKind;
  outputHeight: number;
  outputWidth: number;
};

type ProcessedCharacterImage = {
  imageBuffer: Buffer;
  mimeType: typeof CHARACTER_IMAGE_OUTPUT_MIME_TYPE;
  quality: number;
  sizeBytes: number;
};

const initialWebpQuality = 92;
const qualityBuckets = [
  { ratio: 13.5, quality: 26 },
  { ratio: 10.5, quality: 32 },
  { ratio: 8, quality: 38 },
  { ratio: 6, quality: 44 },
  { ratio: 4.5, quality: 50 },
  { ratio: 3.4, quality: 56 },
  { ratio: 2.6, quality: 62 },
  { ratio: 2, quality: 68 },
  { ratio: 1.6, quality: 74 },
  { ratio: 1.25, quality: 80 },
  { ratio: 1, quality: 86 }
] as const;

function getImageKindLabel(kind: CharacterImageKind) {
  return kind === "portrait" ? "Character portrait" : "Character background texture";
}

function getTooLargeCode(kind: CharacterImageKind) {
  return kind === "portrait" ? "PROCESSED_AVATAR_TOO_LARGE" : "PROCESSED_BACKGROUND_TEXTURE_TOO_LARGE";
}

function getQualityBucketIndex(sizeBytes: number) {
  const sizeRatio = sizeBytes / CHARACTER_IMAGE_TARGET_BYTES;
  const bucketIndex = qualityBuckets.findIndex((bucket) => sizeRatio > bucket.ratio);

  return bucketIndex >= 0 ? bucketIndex : qualityBuckets.length - 1;
}

function getQualityBucket(index: number) {
  return (qualityBuckets[index] ?? qualityBuckets[qualityBuckets.length - 1])!;
}

async function encodeWebp(input: ProcessCharacterImageUploadInput, quality: number) {
  try {
    return await sharp(input.imageBuffer, {
      failOn: "error",
      limitInputPixels: 50_000_000
    })
      .rotate()
      .resize(input.outputWidth, input.outputHeight, {
        fit: "cover",
        position: "center"
      })
      .webp({
        effort: 5,
        quality,
        smartSubsample: true
      })
      .toBuffer();
  } catch (error) {
    throw new AppError(
      `${getImageKindLabel(input.kind)} could not be processed.`,
      400,
      "INVALID_CHARACTER_IMAGE",
      {
        originalError: error instanceof Error ? error.message : String(error)
      }
    );
  }
}

function createProcessingTelemetry(input: {
  finalBytes: number;
  inputBytes: number;
  kind: CharacterImageKind;
  quality: number;
  retried: boolean;
}) {
  return {
    finalBytes: input.finalBytes,
    hardCapBytes: CHARACTER_IMAGE_HARD_MAX_BYTES,
    imageKind: input.kind,
    inputBytes: input.inputBytes,
    retryStatus: input.retried ? "retried" : "not_retried",
    selectedQuality: input.quality,
    targetBytes: CHARACTER_IMAGE_TARGET_BYTES
  };
}

function captureOverTargetWarning(input: ReturnType<typeof createProcessingTelemetry>) {
  captureServerMessage("Processed character image exceeded the target size.", {
    area: "character_image",
    action: "processed_image_over_target",
    level: "warning",
    tags: {
      imageKind: input.imageKind
    },
    extra: input
  });
}

function captureHardCapError(input: ReturnType<typeof createProcessingTelemetry>) {
  captureServerError(new Error("Processed character image exceeded the hard cap."), {
    area: "character_image",
    action: "processed_image_hard_cap",
    tags: {
      imageKind: input.imageKind
    },
    extra: input
  });
}

export async function processCharacterImageUpload(
  input: ProcessCharacterImageUploadInput
): Promise<ProcessedCharacterImage> {
  const initialOutput = await encodeWebp(input, initialWebpQuality);

  if (initialOutput.byteLength <= CHARACTER_IMAGE_TARGET_BYTES) {
    return {
      imageBuffer: initialOutput,
      mimeType: CHARACTER_IMAGE_OUTPUT_MIME_TYPE,
      quality: initialWebpQuality,
      sizeBytes: initialOutput.byteLength
    };
  }

  const selectedBucketIndex = getQualityBucketIndex(initialOutput.byteLength);
  let outputQuality = getQualityBucket(selectedBucketIndex).quality;
  let output = await encodeWebp(input, outputQuality);
  let retried = false;

  if (output.byteLength > CHARACTER_IMAGE_TARGET_BYTES) {
    const retryBucketIndex = Math.max(0, selectedBucketIndex - 2);

    if (retryBucketIndex !== selectedBucketIndex) {
      outputQuality = getQualityBucket(retryBucketIndex).quality;
      output = await encodeWebp(input, outputQuality);
      retried = true;
    }
  }

  const telemetry = createProcessingTelemetry({
    finalBytes: output.byteLength,
    inputBytes: input.imageBuffer.byteLength,
    kind: input.kind,
    quality: outputQuality,
    retried
  });

  if (output.byteLength > CHARACTER_IMAGE_HARD_MAX_BYTES) {
    captureHardCapError(telemetry);
    throw new AppError(
      `${getImageKindLabel(input.kind)} could not be compressed below 300KB.`,
      413,
      getTooLargeCode(input.kind),
      {
        hardCapBytes: CHARACTER_IMAGE_HARD_MAX_BYTES,
        targetBytes: CHARACTER_IMAGE_TARGET_BYTES
      }
    );
  }

  if (output.byteLength > CHARACTER_IMAGE_TARGET_BYTES) {
    captureOverTargetWarning(telemetry);
  }

  return {
    imageBuffer: output,
    mimeType: CHARACTER_IMAGE_OUTPUT_MIME_TYPE,
    quality: outputQuality,
    sizeBytes: output.byteLength
  };
}
