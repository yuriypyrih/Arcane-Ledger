import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import { clericSubclassEntries } from "../../../../../codex/subclasses/cleric";
import { vestigeDomainSpellDescriptions } from "../../../../../codex/subclasses/warlockVestige";
import type { Character, CharacterWarlockFeatureState } from "../../../../../types";
import {
  createSubclassContributionSource,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getClassLevel, getClassSubclassId, hasCharacterClass } from "../../../multiclassState";
import { replaceClassFeatureState } from "../../shared/resourceState";
import {
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeCharacter
} from "../../subclassRuntime";

export const vestigeSpellDomainOptions = vestigeDomainSpellDescriptions.map(([id, feature]) => {
  const domain = clericSubclassEntries.find((entry) => entry.id === id)!;
  const description = domain.features.find((row) => row.featureOverrides?.[feature])!
    .featureOverrides![feature]!.description;
  return {
    id,
    name: domain.name,
    spellIdsByLevel: Object.fromEntries(
      description.flatMap((line) => {
        const level = line.match(/^<strong>Level (\d+)\.<\/strong>/)?.[1];
        return level
          ? [
              [
                Number(level),
                resolveSpellIdsByName(
                  [...line.matchAll(/<spell:([^>]+)>/g)].map((match) => match[1])
                )
              ]
            ]
          : [];
      })
    )
  };
});

function hasVestigeSpells(character: SubclassRuntimeCharacter): boolean {
  return (
    hasCharacterClass(character, "Warlock") &&
    getClassSubclassId(character, "Warlock") === "warlock-vestige-patron" &&
    getClassLevel(character, "Warlock") >= 3
  );
}

export function normalizeWarlockVestigeFeatureState(
  value: Partial<CharacterWarlockFeatureState>,
  character: SubclassRuntimeCharacter
): Partial<CharacterWarlockFeatureState> {
  return hasVestigeSpells(character)
    ? {
        vestigeSpellsDomainId: vestigeSpellDomainOptions.find(
          (domain) => domain.id === value.vestigeSpellsDomainId
        )?.id
      }
    : {};
}

export function getWarlockVestigeSpellDomain(character: SubclassRuntimeCharacter) {
  const domainId = normalizeWarlockVestigeFeatureState(
    character.classFeatureState?.warlock ?? {},
    character
  ).vestigeSpellsDomainId;
  return vestigeSpellDomainOptions.find((domain) => domain.id === domainId) ?? null;
}

export function setWarlockVestigeSpellDomain(character: Character, domainId: string): Character {
  if (!hasVestigeSpells(character)) return character;
  return replaceClassFeatureState(character, "warlock", {
    ...character.classFeatureState?.warlock,
    ...normalizeWarlockVestigeFeatureState({ vestigeSpellsDomainId: domainId }, character)
  });
}

export function collectWarlockVestigeSpellContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const domain = getWarlockVestigeSpellDomain(character);
  return domain
    ? [
        {
          source: createSubclassContributionSource({
            id: "warlock-vestige-spells",
            label: "Vestige Spells",
            entryId: CLASS_FEATURE.VESTIGE_SPELLS
          }),
          alwaysPreparedSpellIds: getPreparedSpellIdsByLevel(
            getClassLevel(character, "Warlock"),
            domain.spellIdsByLevel
          )
        }
      ]
    : [];
}
