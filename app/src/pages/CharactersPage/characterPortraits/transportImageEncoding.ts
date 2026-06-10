export const CHARACTER_IMAGE_TRANSPORT_MAX_BYTES = 1024 * 1024;
export const CHARACTER_IMAGE_TRANSPORT_INITIAL_QUALITY = 0.92;

const preferredTransportMimeType = "image/webp";
const fallbackTransportMimeType = "image/jpeg";
const transportQualityBuckets = [
  { minBytes: 12 * 1024 * 1024, quality: 0.1 },
  { minBytes: 8 * 1024 * 1024, quality: 0.18 },
  { minBytes: 5 * 1024 * 1024, quality: 0.26 },
  { minBytes: 3 * 1024 * 1024, quality: 0.34 },
  { minBytes: 2 * 1024 * 1024, quality: 0.42 },
  { minBytes: 1.5 * 1024 * 1024, quality: 0.5 },
  { minBytes: 1 * 1024 * 1024, quality: 0.6 }
] as const;

type EncodeCanvasForTransportOptions = {
  maxBytes?: number;
};

function encodeCanvas(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

async function encodeCanvasWithFallback(canvas: HTMLCanvasElement, quality: number) {
  const preferredBlob = await encodeCanvas(canvas, preferredTransportMimeType, quality);

  return preferredBlob?.type === preferredTransportMimeType
    ? preferredBlob
    : encodeCanvas(canvas, fallbackTransportMimeType, quality);
}

function getTransportQualityBucketIndex(sizeBytes: number) {
  const bucketIndex = transportQualityBuckets.findIndex((bucket) => sizeBytes > bucket.minBytes);

  return bucketIndex >= 0 ? bucketIndex : transportQualityBuckets.length - 1;
}

export async function encodeCanvasForImageTransport(
  canvas: HTMLCanvasElement,
  options: EncodeCanvasForTransportOptions = {}
) {
  const maxBytes = Math.max(1, Math.round(options.maxBytes ?? CHARACTER_IMAGE_TRANSPORT_MAX_BYTES));
  const initialBlob = await encodeCanvasWithFallback(
    canvas,
    CHARACTER_IMAGE_TRANSPORT_INITIAL_QUALITY
  );

  if (!initialBlob) {
    throw new Error("Unable to save that image.");
  }

  if (initialBlob.size <= maxBytes) {
    return initialBlob;
  }

  const selectedBucketIndex = getTransportQualityBucketIndex(initialBlob.size);
  const selectedBlob = await encodeCanvasWithFallback(
    canvas,
    transportQualityBuckets[selectedBucketIndex].quality
  );

  if (!selectedBlob) {
    throw new Error("Unable to save that image.");
  }

  if (selectedBlob.size <= maxBytes) {
    return selectedBlob;
  }

  const retryBucketIndex = Math.max(0, selectedBucketIndex - 2);

  if (retryBucketIndex !== selectedBucketIndex) {
    const retryBlob = await encodeCanvasWithFallback(
      canvas,
      transportQualityBuckets[retryBucketIndex].quality
    );

    if (retryBlob?.size && retryBlob.size <= maxBytes) {
      return retryBlob;
    }
  }

  throw new Error("Image must be 1MB or smaller after processing.");
}
