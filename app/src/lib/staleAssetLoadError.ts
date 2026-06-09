const staleAssetLoadErrorMessages = [
  "failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "unable to preload css",
  "module script",
  "mime type"
];

function hasStaleAssetLoadMessage(value: string) {
  const normalizedValue = value.toLowerCase();

  return staleAssetLoadErrorMessages.some((message) => normalizedValue.includes(message));
}

export function isStaleAssetLoadError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return hasStaleAssetLoadMessage(error.message);
}

export function isStaleAssetLoadSentryEvent(event: {
  exception?: {
    values?: Array<{
      type?: string;
      value?: string;
    }>;
  };
  message?: string;
  tags?: Record<string, unknown>;
}) {
  if (event.tags?.update_reason === "asset-load-failure") {
    return true;
  }

  if (typeof event.message === "string" && hasStaleAssetLoadMessage(event.message)) {
    return true;
  }

  return (
    event.exception?.values?.some((exceptionValue) =>
      [exceptionValue.type, exceptionValue.value].some(
        (value) => typeof value === "string" && hasStaleAssetLoadMessage(value)
      )
    ) ?? false
  );
}
