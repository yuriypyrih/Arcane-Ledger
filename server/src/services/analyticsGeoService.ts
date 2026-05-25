import { existsSync } from "node:fs";
import { isIP } from "node:net";
import { resolve } from "node:path";
import { Reader, type ReaderModel } from "@maxmind/geoip2-node";
import type { Request } from "express";
import { getAppConfig, type AppConfig } from "../config/env.js";
import type { AnalyticsGeoRecord } from "../models/Analytics.js";
import { captureServerError } from "../sentry.js";

type AnalyticsGeoSource = "headers" | "maxmind" | "maxmind_with_headers";

const ANALYTICS_GEO_SOURCE: AnalyticsGeoSource = "maxmind_with_headers";
const GEOLITE2_COUNTRY_DB_PATH = resolve(process.cwd(), "src/data/GeoLite2-Country.mmdb");
const MAX_HEADER_LENGTH = 160;
const UNKNOWN_GEO_VALUE = "unknown";
const UNKNOWN_GEO: AnalyticsGeoRecord = {
  country: UNKNOWN_GEO_VALUE,
  region: UNKNOWN_GEO_VALUE,
  city: UNKNOWN_GEO_VALUE
};
const UNSPECIFIC_COUNTRY_CODES = new Set(["A1", "A2", "EU", "O1", "T1", "XX"]);

let geoIpReaderPath: string | null = null;
let geoIpReaderPromise: Promise<ReaderModel | null> | null = null;
let geoIpReaderLoadErrorReported = false;

function normalizeHeaderValue(value: string | string[] | undefined): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = rawValue?.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    return decodeURIComponent(trimmedValue).slice(0, MAX_HEADER_LENGTH);
  } catch {
    return trimmedValue.slice(0, MAX_HEADER_LENGTH);
  }
}

function normalizeCountryCode(value: string | null | undefined) {
  const countryCode = value?.trim().toUpperCase();

  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode) || UNSPECIFIC_COUNTRY_CODES.has(countryCode)) {
    return UNKNOWN_GEO_VALUE;
  }

  return countryCode;
}

function createCountryGeo(country: string): AnalyticsGeoRecord {
  return {
    ...UNKNOWN_GEO,
    country
  };
}

function hasAnyHeader(request: Request, headerNames: string[]) {
  return headerNames.some((headerName) => request.headers[headerName] !== undefined);
}

function requestHasProxyGeoHeaders(request: Request) {
  return hasAnyHeader(request, [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "x-country-code",
    "cloudfront-viewer-country"
  ]);
}

function requestLooksProxied(request: Request) {
  return request.headers["x-forwarded-for"] !== undefined || requestHasProxyGeoHeaders(request);
}

function getTrustedHeaderGeo(request: Request, config: AppConfig): AnalyticsGeoRecord | null {
  if (config.trustProxyHops <= 0) {
    return null;
  }

  const country = normalizeCountryCode(
    normalizeHeaderValue(request.headers["cf-ipcountry"]) ??
      normalizeHeaderValue(request.headers["x-vercel-ip-country"]) ??
      normalizeHeaderValue(request.headers["x-country-code"]) ??
      normalizeHeaderValue(request.headers["cloudfront-viewer-country"])
  );

  return country === UNKNOWN_GEO_VALUE ? null : createCountryGeo(country);
}

function normalizeIpAddress(value: string | undefined) {
  const trimmedValue = value?.trim().replace(/^\[|\]$/g, "");

  if (!trimmedValue) {
    return null;
  }

  const zoneIndex = trimmedValue.indexOf("%");
  const addressWithoutZone = zoneIndex >= 0 ? trimmedValue.slice(0, zoneIndex) : trimmedValue;
  const ipv4MappedPrefix = "::ffff:";

  return addressWithoutZone.toLowerCase().startsWith(ipv4MappedPrefix)
    ? addressWithoutZone.slice(ipv4MappedPrefix.length)
    : addressWithoutZone;
}

function isPrivateOrLocalIpv4(address: string) {
  const octets = address.split(".").map((octet) => Number(octet));

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  const [first = 0, second = 0] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateOrLocalIpv6(address: string) {
  const normalizedAddress = address.toLowerCase();

  return (
    normalizedAddress === "::" ||
    normalizedAddress === "::1" ||
    normalizedAddress.startsWith("fc") ||
    normalizedAddress.startsWith("fd") ||
    normalizedAddress.startsWith("fe80:") ||
    normalizedAddress.startsWith("2001:db8:")
  );
}

function isPublicIpAddress(value: string | null): value is string {
  if (!value) {
    return false;
  }

  const ipVersion = isIP(value);

  if (ipVersion === 4) {
    return !isPrivateOrLocalIpv4(value);
  }

  if (ipVersion === 6) {
    return !isPrivateOrLocalIpv6(value);
  }

  return false;
}

function canResolveRequestIp(request: Request, config: AppConfig) {
  return config.trustProxyHops > 0 || !requestLooksProxied(request);
}

async function getGeoIpReader() {
  if (geoIpReaderPromise && geoIpReaderPath === GEOLITE2_COUNTRY_DB_PATH) {
    return geoIpReaderPromise;
  }

  if (!existsSync(GEOLITE2_COUNTRY_DB_PATH)) {
    return null;
  }

  geoIpReaderPath = GEOLITE2_COUNTRY_DB_PATH;
  geoIpReaderLoadErrorReported = false;
  geoIpReaderPromise = Reader.open(GEOLITE2_COUNTRY_DB_PATH).catch((error: unknown) => {
    if (!geoIpReaderLoadErrorReported) {
      geoIpReaderLoadErrorReported = true;
      captureServerError(error, {
        area: "analytics",
        action: "load-geolite2-country-database",
        extra: {
          databasePath: GEOLITE2_COUNTRY_DB_PATH
        }
      });
    }

    return null;
  });

  return geoIpReaderPromise;
}

async function getMaxMindGeo(request: Request, config: AppConfig): Promise<AnalyticsGeoRecord | null> {
  if (!canResolveRequestIp(request, config)) {
    return null;
  }

  const ipAddress = normalizeIpAddress(request.ip);

  if (!isPublicIpAddress(ipAddress)) {
    return null;
  }

  const reader = await getGeoIpReader();

  if (!reader) {
    return null;
  }

  try {
    const country = reader.country(ipAddress);
    const countryCode = normalizeCountryCode(
      country.country?.isoCode ?? country.registeredCountry?.isoCode
    );

    return countryCode === UNKNOWN_GEO_VALUE ? null : createCountryGeo(countryCode);
  } catch {
    return null;
  }
}

export async function getAnalyticsGeo(request: Request): Promise<AnalyticsGeoRecord> {
  const config = getAppConfig();

  if (ANALYTICS_GEO_SOURCE !== "maxmind") {
    const headerGeo = getTrustedHeaderGeo(request, config);

    if (headerGeo) {
      return headerGeo;
    }
  }

  if (ANALYTICS_GEO_SOURCE !== "headers") {
    return (await getMaxMindGeo(request, config)) ?? UNKNOWN_GEO;
  }

  return UNKNOWN_GEO;
}
