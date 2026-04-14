import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { AppError } from "../errors/AppError.js";
import type { Open5eListEnvelope } from "../types/open5e.js";
import { formatFetchDate, getSnapshotDirectoryName, parseFetchDate } from "../utils/dates.js";
import { pathExists } from "../utils/filesystem.js";

const DEFAULT_REQUEST_TIMEOUT_MS = 10000;
const DEFAULT_MAX_RETRIES = 3;

type Logger = Pick<Console, "info" | "warn">;

export type FetchOpen5eListSnapshotOptions = {
  rootDir: string;
  listUrl: string;
  requestDelayMs: number;
  resourceName: string;
  overwrite?: boolean;
  fetchDate?: string;
  fetchImpl?: typeof fetch;
  logger?: Logger;
};

async function sleep(durationMs: number) {
  if (durationMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, durationMs));
}

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const bodyText = await response.text();
    throw new AppError("Expected a JSON response from Open5e.", 502, "OPEN5E_INVALID_RESPONSE", {
      status: response.status,
      body: bodyText
    });
  }

  return response.json();
}

async function fetchWithRetry(
  url: string,
  fetchImpl: typeof fetch,
  logger: Logger,
  attempt = 1
): Promise<Open5eListEnvelope<Record<string, unknown>>> {
  try {
    const response = await fetchImpl(url, {
      signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
      const shouldRetry = response.status === 429 || response.status >= 500;

      if (shouldRetry && attempt < DEFAULT_MAX_RETRIES) {
        const backoffDelay = 250 * 2 ** (attempt - 1);
        logger.warn(`Open5e request for ${url} failed with ${response.status}. Retrying in ${backoffDelay}ms.`);
        await sleep(backoffDelay);
        return fetchWithRetry(url, fetchImpl, logger, attempt + 1);
      }

      const bodyText = await response.text();
      throw new AppError("Open5e request failed.", 502, "OPEN5E_REQUEST_FAILED", {
        url,
        status: response.status,
        body: bodyText
      });
    }

    const payload = (await parseJsonResponse(response)) as Open5eListEnvelope<Record<string, unknown>>;

    if (!Array.isArray(payload.results) || !("next" in payload) || !("count" in payload)) {
      throw new AppError("Open5e response shape was not recognized.", 502, "OPEN5E_INVALID_RESPONSE", {
        url
      });
    }

    return payload;
  } catch (error: unknown) {
    const isRetryableNetworkError = error instanceof Error && error.name !== "AppError";

    if (isRetryableNetworkError && attempt < DEFAULT_MAX_RETRIES) {
      const backoffDelay = 250 * 2 ** (attempt - 1);
      logger.warn(`Open5e request for ${url} failed. Retrying in ${backoffDelay}ms.`);
      await sleep(backoffDelay);
      return fetchWithRetry(url, fetchImpl, logger, attempt + 1);
    }

    throw error;
  }
}

function resolveFetchDate(fetchDate: string | undefined): string {
  if (fetchDate) {
    parseFetchDate(fetchDate);
    return fetchDate;
  }

  return formatFetchDate(new Date());
}

export async function fetchOpen5eListSnapshot({
  rootDir,
  listUrl,
  requestDelayMs,
  resourceName,
  overwrite = false,
  fetchDate,
  fetchImpl = fetch,
  logger = console
}: FetchOpen5eListSnapshotOptions) {
  const resolvedFetchDate = resolveFetchDate(fetchDate);
  const snapshotDir = join(rootDir, getSnapshotDirectoryName(resolvedFetchDate));

  await mkdir(rootDir, { recursive: true });

  if (await pathExists(snapshotDir)) {
    if (!overwrite) {
      throw new AppError(
        `Snapshot directory "${basename(snapshotDir)}" already exists. Use --overwrite to replace it.`,
        409,
        "SNAPSHOT_EXISTS"
      );
    }

    await rm(snapshotDir, { recursive: true, force: true });
  }

  await mkdir(snapshotDir, { recursive: true });

  let nextUrl: string | null = listUrl;
  let pageNumber = 0;
  let totalCount = 0;

  try {
    while (nextUrl) {
      pageNumber += 1;
      logger.info(`Fetching Open5e ${resourceName} page ${pageNumber}.`);

      const payload = await fetchWithRetry(nextUrl, fetchImpl, logger);

      totalCount = payload.count;

      await writeFile(join(snapshotDir, `page-${pageNumber}.json`), `${JSON.stringify(payload, null, 2)}\n`, "utf8");

      nextUrl = payload.next;

      if (nextUrl) {
        await sleep(requestDelayMs);
      }
    }
  } catch (error: unknown) {
    await rm(snapshotDir, { recursive: true, force: true });
    throw error;
  }

  return {
    fetchDate: resolvedFetchDate,
    snapshotDir,
    pageCount: pageNumber,
    totalCount
  };
}

export async function readSnapshotPage(path: string) {
  const fileContents = await readFile(path, "utf8");
  return JSON.parse(fileContents) as Open5eListEnvelope<Record<string, unknown>>;
}
