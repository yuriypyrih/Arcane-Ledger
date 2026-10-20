import { CLASS_FEATURE } from "../entries/enums";
import { clericSubclassEntries } from "./cleric";

// Reuse the existing domain lists as reference text, without preparing their spells.
export const vestigeDomainSpellDescriptions = [
  ["cleric-life-domain", CLASS_FEATURE.LIFE_DOMAIN_SPELLS],
  ["cleric-light-domain", CLASS_FEATURE.LIGHT_DOMAIN_SPELLS],
  ["cleric-trickery-domain", CLASS_FEATURE.TRICKERY_DOMAIN_SPELLS],
  ["cleric-war-domain", CLASS_FEATURE.WAR_DOMAIN_SPELLS]
] as const;

export function getVestigeDomainSpellDescriptions(): string[] {
  return vestigeDomainSpellDescriptions.flatMap(([id, feature]) => {
    const domain = clericSubclassEntries.find((entry) => entry.id === id)!;
    const details = domain.features.find((row) => row.featureOverrides?.[feature])!
      .featureOverrides![feature]!;
    return [
      `<strong>${domain.name}.</strong>`,
      ...details.description.filter((line) => line.startsWith("<strong>Level "))
    ];
  });
}
