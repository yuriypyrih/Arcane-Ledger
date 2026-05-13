export const CHARACTER_PORTRAIT_MAX_SIZE = 512;
export const CHARACTER_PORTRAIT_QUALITY = 0.85;

const characterPortraitAspectRatio = 3 / 4;
const preferredPortraitMimeType = "image/webp";
const fallbackPortraitMimeType = "image/jpeg";

export type CharacterPortraitCropSettings = {
  offsetX: number;
  offsetY: number;
  rotationDegrees: number;
  zoom: number;
};

export type CropAndScaleImageOptions = {
  crop?: Partial<CharacterPortraitCropSettings>;
  maxSize?: number;
  quality?: number;
};

export type CroppedCharacterPortrait = {
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

function getCenteredPortraitCrop(image: HTMLImageElement) {
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("Unable to read that image.");
  }

  const sourceAspectRatio = sourceWidth / sourceHeight;

  if (sourceAspectRatio > characterPortraitAspectRatio) {
    const cropHeight = sourceHeight;
    const cropWidth = cropHeight * characterPortraitAspectRatio;

    return {
      sourceX: (sourceWidth - cropWidth) / 2,
      sourceY: 0,
      sourceWidth: cropWidth,
      sourceHeight: cropHeight
    };
  }

  const cropWidth = sourceWidth;
  const cropHeight = cropWidth / characterPortraitAspectRatio;

  return {
    sourceX: 0,
    sourceY: (sourceHeight - cropHeight) / 2,
    sourceWidth: cropWidth,
    sourceHeight: cropHeight
  };
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

export async function cropAndScaleImageFile(
  file: File,
  options: CropAndScaleImageOptions = {}
): Promise<CroppedCharacterPortrait> {
  assertImageFile(file);

  const maxSize = options.maxSize ?? CHARACTER_PORTRAIT_MAX_SIZE;
  const quality = options.quality ?? CHARACTER_PORTRAIT_QUALITY;
  const cropSettings = normalizeCropSettings(options.crop);
  const targetHeight = Math.max(1, Math.round(maxSize));
  const targetWidth = Math.max(1, Math.round(targetHeight * characterPortraitAspectRatio));
  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to process that image.");
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  if (
    cropSettings.offsetX === 0 &&
    cropSettings.offsetY === 0 &&
    cropSettings.rotationDegrees === 0 &&
    cropSettings.zoom === 1
  ) {
    const crop = getCenteredPortraitCrop(image);

    context.drawImage(
      image,
      crop.sourceX,
      crop.sourceY,
      crop.sourceWidth,
      crop.sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );
  } else {
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    const rotationRadians = (cropSettings.rotationDegrees * Math.PI) / 180;
    const rotationCos = Math.abs(Math.cos(rotationRadians));
    const rotationSin = Math.abs(Math.sin(rotationRadians));
    const rotatedBoundsWidth = sourceWidth * rotationCos + sourceHeight * rotationSin;
    const rotatedBoundsHeight = sourceWidth * rotationSin + sourceHeight * rotationCos;
    const rotationPadding = Math.abs(cropSettings.rotationDegrees) > 0 ? 1.16 : 1;
    const coverScale =
      Math.max(targetWidth / rotatedBoundsWidth, targetHeight / rotatedBoundsHeight) *
      cropSettings.zoom *
      rotationPadding;
    const scaledBoundsWidth = rotatedBoundsWidth * coverScale;
    const scaledBoundsHeight = rotatedBoundsHeight * coverScale;
    const maxOffsetX = Math.max(0, (scaledBoundsWidth - targetWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledBoundsHeight - targetHeight) / 2);

    context.save();
    context.translate(
      targetWidth / 2 + cropSettings.offsetX * maxOffsetX,
      targetHeight / 2 + cropSettings.offsetY * maxOffsetY
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
  }

  const preferredBlob = await encodeCanvas(canvas, preferredPortraitMimeType, quality);
  const blob =
    preferredBlob?.type === preferredPortraitMimeType
      ? preferredBlob
      : await encodeCanvas(canvas, fallbackPortraitMimeType, quality);

  if (!blob) {
    throw new Error("Unable to save that image.");
  }

  return {
    blob,
    mimeType: blob.type || fallbackPortraitMimeType,
    width: targetWidth,
    height: targetHeight
  };
}
