import type { CharacterPortraitCropSettings } from "./cropAndScaleImage";

export const CHARACTER_BACKGROUND_TEXTURE_SIZE = 750;
export const CHARACTER_BACKGROUND_TEXTURE_MAX_BYTES = 60 * 1024;

const preferredTextureMimeType = "image/webp";
const fallbackTextureMimeType = "image/jpeg";
const textureQualitySteps = [0.82, 0.76, 0.7, 0.64, 0.58, 0.52, 0.46, 0.4, 0.34, 0.28, 0.22];

export type CropAndScaleBackgroundTextureOptions = {
  crop?: Partial<CharacterPortraitCropSettings>;
  maxBytes?: number;
  size?: number;
};

export type CroppedCharacterBackgroundTexture = {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
};

function assertImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Unable to read that image."));
    };
    image.src = imageUrl;
  });
}

function clampCropSetting(value: number | undefined, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Number(value)));
}

function normalizeCropSettings(
  crop: Partial<CharacterPortraitCropSettings> | undefined
): CharacterPortraitCropSettings {
  return {
    offsetX: clampCropSetting(crop?.offsetX, -1, 1, 0),
    offsetY: clampCropSetting(crop?.offsetY, -1, 1, 0),
    rotationDegrees: clampCropSetting(crop?.rotationDegrees, -45, 45, 0),
    zoom: clampCropSetting(crop?.zoom, 1, 3, 1)
  };
}

function encodeCanvas(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

async function encodeTextureUnderLimit(canvas: HTMLCanvasElement, maxBytes: number) {
  let smallestBlob: Blob | null = null;

  for (const quality of textureQualitySteps) {
    const preferredBlob = await encodeCanvas(canvas, preferredTextureMimeType, quality);
    const blob =
      preferredBlob?.type === preferredTextureMimeType
        ? preferredBlob
        : await encodeCanvas(canvas, fallbackTextureMimeType, quality);

    if (!blob) {
      continue;
    }

    if (!smallestBlob || blob.size < smallestBlob.size) {
      smallestBlob = blob;
    }

    if (blob.size <= maxBytes) {
      return blob;
    }
  }

  if (!smallestBlob) {
    throw new Error("Unable to save that image.");
  }

  throw new Error("Background texture must be 60KB or smaller after processing.");
}

export async function cropAndScaleBackgroundTextureFile(
  file: File,
  options: CropAndScaleBackgroundTextureOptions = {}
): Promise<CroppedCharacterBackgroundTexture> {
  assertImageFile(file);

  const targetSize = Math.max(1, Math.round(options.size ?? CHARACTER_BACKGROUND_TEXTURE_SIZE));
  const maxBytes = Math.max(1, Math.round(options.maxBytes ?? CHARACTER_BACKGROUND_TEXTURE_MAX_BYTES));
  const cropSettings = normalizeCropSettings(options.crop);
  const image = await loadImageFromFile(file);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!sourceWidth || !sourceHeight || !context) {
    throw new Error("Unable to process that image.");
  }

  canvas.width = targetSize;
  canvas.height = targetSize;

  const rotationRadians = (cropSettings.rotationDegrees * Math.PI) / 180;
  const rotationCos = Math.abs(Math.cos(rotationRadians));
  const rotationSin = Math.abs(Math.sin(rotationRadians));
  const rotatedBoundsWidth = sourceWidth * rotationCos + sourceHeight * rotationSin;
  const rotatedBoundsHeight = sourceWidth * rotationSin + sourceHeight * rotationCos;
  const rotationPadding = Math.abs(cropSettings.rotationDegrees) > 0 ? 1.16 : 1;
  const coverScale =
    Math.max(targetSize / rotatedBoundsWidth, targetSize / rotatedBoundsHeight) *
    cropSettings.zoom *
    rotationPadding;
  const scaledBoundsWidth = rotatedBoundsWidth * coverScale;
  const scaledBoundsHeight = rotatedBoundsHeight * coverScale;
  const maxOffsetX = Math.max(0, (scaledBoundsWidth - targetSize) / 2);
  const maxOffsetY = Math.max(0, (scaledBoundsHeight - targetSize) / 2);

  context.save();
  context.translate(
    targetSize / 2 + cropSettings.offsetX * maxOffsetX,
    targetSize / 2 + cropSettings.offsetY * maxOffsetY
  );
  context.rotate(rotationRadians);
  context.drawImage(
    image,
    (-sourceWidth * coverScale) / 2,
    (-sourceHeight * coverScale) / 2,
    sourceWidth * coverScale,
    sourceHeight * coverScale
  );
  context.restore();

  const blob = await encodeTextureUnderLimit(canvas, maxBytes);

  return {
    blob,
    mimeType: blob.type || fallbackTextureMimeType,
    width: targetSize,
    height: targetSize
  };
}
