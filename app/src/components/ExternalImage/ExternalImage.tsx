import { useState, type ReactNode } from "react";

type ExternalImageProps = {
  alt?: string;
  className?: string;
  /** Shown while there is no link, and when the link fails to load. */
  fallback: ReactNode;
  src: string | null | undefined;
};

/**
 * A picture the user linked from another site. The browser fetches it directly, so it is loaded
 * without a referrer and lazily, and a broken link falls back instead of showing a broken image.
 */
function ExternalImage({ alt = "", className, fallback, src }: ExternalImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
    />
  );
}

export default ExternalImage;
