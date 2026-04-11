import { CLASS_FEATURE } from "./enums";
import { getSubclassEntryById } from "../subclasses";

export const psychicBladeWeaponName = "Psychic Blade";

const soulknifeSubclassId = "rogue-soulknife";

function stripFeatureDescriptionMarkup(value: string): string {
  return value
    .replace(/<link:[^>]+>(.*?)<\/link>/g, "$1")
    .replace(/<\/?strong>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getSoulknifeFeatureSummary(feature: CLASS_FEATURE): string {
  return (
    getSubclassEntryById(soulknifeSubclassId)?.features.find((row) =>
      row.classFeatures.includes(feature)
    )?.featureOverrides?.[feature]?.description ?? []
  )
    .filter((entry): entry is string => typeof entry === "string")
    .map(stripFeatureDescriptionMarkup)
    .join(" ");
}

export const psychicBladeWeaponSummary = getSoulknifeFeatureSummary(CLASS_FEATURE.PSYCHIC_BLADES);

export const psychicBladeSoulBladesSummary = getSoulknifeFeatureSummary(CLASS_FEATURE.SOUL_BLADES);
