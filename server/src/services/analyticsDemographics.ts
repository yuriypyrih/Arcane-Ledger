export type AnalyticsDemographicsRecord = {
  count: number;
  country: string;
  uniqueVisitorKeys: string[];
};

export type AnalyticsCountryBucket = {
  count: number;
  country: string;
  label: string;
};

type CountryAccumulator = {
  count: number;
  keys: Set<string>;
};

const DEMOGRAPHICS_BUCKET_LIMIT = 15;
const OTHER_UNKNOWN_LABEL = "Other / Unknown";
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

function createCountryDisplayNames() {
  try {
    return typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["en"], { type: "region" })
      : null;
  } catch {
    return null;
  }
}

const countryDisplayNames = createCountryDisplayNames();

function addUniqueKeys(keys: Set<string>, nextKeys: string[]) {
  nextKeys.forEach((key) => {
    keys.add(key);
  });
}

function createAccumulator(): CountryAccumulator {
  return {
    count: 0,
    keys: new Set<string>()
  };
}

function addRecordToAccumulator(
  accumulator: CountryAccumulator,
  record: AnalyticsDemographicsRecord
) {
  accumulator.count += record.count;
  addUniqueKeys(accumulator.keys, record.uniqueVisitorKeys);
}

function getAccumulatorCount(accumulator: CountryAccumulator) {
  return accumulator.keys.size || accumulator.count;
}

function normalizeCountryKey(country: string) {
  const trimmedCountry = country.trim();

  if (!trimmedCountry || trimmedCountry.toLowerCase() === "unknown") {
    return null;
  }

  const countryCode = trimmedCountry.toUpperCase();

  return COUNTRY_CODE_PATTERN.test(countryCode) ? countryCode : trimmedCountry;
}

function getCountryLabel(country: string) {
  if (country === OTHER_UNKNOWN_LABEL) {
    return OTHER_UNKNOWN_LABEL;
  }

  if (!COUNTRY_CODE_PATTERN.test(country)) {
    return country;
  }

  try {
    return countryDisplayNames?.of(country) ?? country;
  } catch {
    return country;
  }
}

function createCountryBucket(
  country: string,
  accumulator: CountryAccumulator
): AnalyticsCountryBucket {
  return {
    country,
    label: getCountryLabel(country),
    count: getAccumulatorCount(accumulator)
  };
}

function compareCountryBuckets(left: AnalyticsCountryBucket, right: AnalyticsCountryBucket) {
  return (
    right.count - left.count ||
    left.label.localeCompare(right.label) ||
    left.country.localeCompare(right.country)
  );
}

export function getDemographics(records: AnalyticsDemographicsRecord[]): AnalyticsCountryBucket[] {
  const groupedCountries = new Map<string, CountryAccumulator>();
  const unknownAccumulator = createAccumulator();

  records.forEach((record) => {
    const country = normalizeCountryKey(record.country);

    if (!country) {
      addRecordToAccumulator(unknownAccumulator, record);
      return;
    }

    const accumulator = groupedCountries.get(country) ?? createAccumulator();

    addRecordToAccumulator(accumulator, record);
    groupedCountries.set(country, accumulator);
  });

  const namedBuckets = [...groupedCountries.entries()]
    .map(([country, accumulator]) => createCountryBucket(country, accumulator))
    .sort(compareCountryBuckets);
  const unknownCount = getAccumulatorCount(unknownAccumulator);
  const hasOtherBucket = unknownCount > 0 || namedBuckets.length > DEMOGRAPHICS_BUCKET_LIMIT;

  if (!hasOtherBucket) {
    return namedBuckets.slice(0, DEMOGRAPHICS_BUCKET_LIMIT);
  }

  const namedBucketLimit = DEMOGRAPHICS_BUCKET_LIMIT - 1;
  const topNamedBuckets = namedBuckets.slice(0, namedBucketLimit);
  const overflowCount = namedBuckets
    .slice(namedBucketLimit)
    .reduce((total, bucket) => total + bucket.count, 0);
  const otherCount = unknownCount + overflowCount;
  const buckets =
    otherCount > 0
      ? [
          ...topNamedBuckets,
          {
            country: OTHER_UNKNOWN_LABEL,
            label: OTHER_UNKNOWN_LABEL,
            count: otherCount
          }
        ]
      : topNamedBuckets;

  return buckets.sort(compareCountryBuckets);
}
