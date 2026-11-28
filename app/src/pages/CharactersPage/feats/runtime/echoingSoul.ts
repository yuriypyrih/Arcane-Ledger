import { FEATS } from "../../../../codex/entries/enums";
import type {
  Character,
  CharacterFeatEntry,
  EchoingSoulChoice,
  SkillName
} from "../../../../types";
import { getEchoingSoulBaseSkills, getEchoingSoulExpertiseOptions } from "../echoingSoul";
import {
  addFeatGrantedProficienciesToCollections,
  removeFeatGrantedProficienciesFromCollections
} from "../proficiencyGrants";
import { collectFeatDerivedState } from "./state";

export function getEchoingSoulFeatEntry(character: Character) {
  return collectFeatDerivedState(character)
    .featsByFeat.get(FEATS.ECHOING_SOUL)
    ?.find((entry): entry is CharacterFeatEntry & { echoingSoul: EchoingSoulChoice } =>
      Boolean(entry.echoingSoul)
    );
}

export function changeEchoingSoulExpertise(character: Character, skill: SkillName): Character {
  const entry = getEchoingSoulFeatEntry(character);
  if (!entry || skill === entry.echoingSoul.skillExpertise) return character;

  const baseSkills = getEchoingSoulBaseSkills(character.skillProficiencies, entry.id);
  if (!getEchoingSoulExpertiseOptions(baseSkills, entry.echoingSoul).includes(skill))
    return character;

  const nextEntry = { ...entry, echoingSoul: { ...entry.echoingSoul, skillExpertise: skill } };
  const withoutPreviousGrant = removeFeatGrantedProficienciesFromCollections(character, entry);
  return {
    ...addFeatGrantedProficienciesToCollections(withoutPreviousGrant, nextEntry),
    feats: (character.feats ?? []).map((current) => (current.id === entry.id ? nextEntry : current))
  };
}
