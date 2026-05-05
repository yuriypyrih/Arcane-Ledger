import { FEATS } from "../../../../codex/entries";
import {
  ARMOR_PROFICIENCY,
  PROF_LEVEL,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY,
  ALL_SKILLS,
  type SAVING_THROW_PROFICIENCY,
  type Character,
  type CharacterFeatEntry,
  type CharacterFeatSource,
  type ArmorProficiencyEntry,
  type SavingThrowProficiencyEntry,
  type SkillName,
  type SkillProficiencyEntry,
  type ToolProficiencyEntry,
  type WeaponProficiencyEntry
} from "../../../../types";
import {
  addFeatGrantedArmorEntries,
  addFeatGrantedSavingThrowEntries,
  addFeatGrantedSkillEntries,
  addFeatGrantedSkillEntriesAtLevel,
  addFeatGrantedToolEntries,
  addFeatGrantedWeaponEntries,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  removeFeatGrantedArmorEntries,
  removeFeatGrantedSavingThrowEntries,
  removeFeatGrantedSkillEntries,
  removeFeatGrantedToolEntries,
  removeFeatGrantedWeaponEntries
} from "../../../../pages/CharactersPage/proficiency";
import { isFeatEntryRemovable } from "../../../../pages/CharactersPage/feats";
import { isFeatFromClassFeatureSource } from "./helpers";
import {
  getCrafterToolSelections,
  getMusicianToolSelections,
  splitSkilledSelections
} from "./featEditorUtils";

export type FeatEditorDraft = {
  feats: CharacterFeatEntry[];
  armorProficiencies: ArmorProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  skillProficiencies: SkillProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
};

type ClassFeatureFeatSource = CharacterFeatSource & {
  type: "class-feature";
};

function areDraftListsEqual<T>(left: T[], right: T[]): boolean {
  return left === right || JSON.stringify(left) === JSON.stringify(right);
}

type FeatProficiencyGrantDescriptor = {
  label: string;
  armor?: ARMOR_PROFICIENCY[];
  savingThrows?: SAVING_THROW_PROFICIENCY[];
  skills?: SkillName[];
  skillLevels?: Array<{
    skill: SkillName;
    level: PROF_LEVEL;
  }>;
  adaptiveSkills?: SkillName[];
  tools?: TOOL_PROFICIENCY[];
  weapons?: WEAPON_PROFICIENCY[];
};

function getFeatProficiencyGrantDescriptors(
  featEntry: CharacterFeatEntry
): FeatProficiencyGrantDescriptor[] {
  if (featEntry.feat === FEATS.SKILLED && featEntry.skilled) {
    const { skills, tools } = splitSkilledSelections(featEntry.skilled);

    return [
      {
        label: "Skilled",
        skills,
        tools
      }
    ];
  }

  if (featEntry.feat === FEATS.CRAFTER && featEntry.crafter) {
    return [
      {
        label: "Crafter",
        tools: getCrafterToolSelections(featEntry.crafter)
      }
    ];
  }

  if (featEntry.feat === FEATS.MUSICIAN && featEntry.musician) {
    return [
      {
        label: "Musician",
        tools: getMusicianToolSelections(featEntry.musician)
      }
    ];
  }

  if (featEntry.feat === FEATS.CHEF) {
    return [
      {
        label: "Chef",
        tools: [TOOL_PROFICIENCY.COOKS_UTENSILS]
      }
    ];
  }

  if (featEntry.feat === FEATS.HEAVILY_ARMORED) {
    return [
      {
        label: "Heavily Armored",
        armor: [ARMOR_PROFICIENCY.HEAVY]
      }
    ];
  }

  if (featEntry.feat === FEATS.KEEN_MIND && featEntry.keenMind) {
    return [
      {
        label: "Keen Mind",
        adaptiveSkills: [featEntry.keenMind.skill]
      }
    ];
  }

  if (featEntry.feat === FEATS.LIGHTLY_ARMORED) {
    return [
      {
        label: "Lightly Armored",
        armor: [ARMOR_PROFICIENCY.LIGHT, ARMOR_PROFICIENCY.SHIELD]
      }
    ];
  }

  if (featEntry.feat === FEATS.MARTIAL_WEAPON_TRAINING) {
    return [
      {
        label: "Martial Weapon Training",
        weapons: [WEAPON_PROFICIENCY.MARTIAL]
      }
    ];
  }

  if (featEntry.feat === FEATS.MODERATELY_ARMORED) {
    return [
      {
        label: "Moderately Armored",
        armor: [ARMOR_PROFICIENCY.MEDIUM]
      }
    ];
  }

  if (featEntry.feat === FEATS.OBSERVANT && featEntry.observant) {
    return [
      {
        label: "Observant",
        adaptiveSkills: [featEntry.observant.skill]
      }
    ];
  }

  if (featEntry.feat === FEATS.SKILL_EXPERT && featEntry.skillExpert) {
    return [
      {
        label: "Skill Expert",
        skillLevels: [
          {
            skill: featEntry.skillExpert.skillProficiency,
            level: PROF_LEVEL.PROFICIENT
          },
          {
            skill: featEntry.skillExpert.skillExpertise,
            level: PROF_LEVEL.EXPERT
          }
        ]
      }
    ];
  }

  if (featEntry.feat === FEATS.BOON_OF_SKILL && featEntry.boonOfSkill) {
    return [
      {
        label: "Boon of Skill",
        skillLevels: [
          ...ALL_SKILLS.map((skill) => ({
            skill,
            level: PROF_LEVEL.PROFICIENT
          })),
          {
            skill: featEntry.boonOfSkill.skillExpertise,
            level: PROF_LEVEL.EXPERT
          }
        ]
      }
    ];
  }

  if (featEntry.feat === FEATS.POISONER) {
    return [
      {
        label: "Poisoner",
        tools: [TOOL_PROFICIENCY.POISONERS_KIT]
      }
    ];
  }

  if (featEntry.feat === FEATS.RESILIENT && featEntry.resilient) {
    return [
      {
        label: "Resilient",
        savingThrows: [featEntry.resilient.ability as SAVING_THROW_PROFICIENCY]
      }
    ];
  }

  if (featEntry.feat === FEATS.WEAPON_MASTER && featEntry.weaponMaster) {
    return [
      {
        label: "Weapon Master",
        weapons: [featEntry.weaponMaster.weaponMastery]
      }
    ];
  }

  return [];
}

function getGrantRemovalSkills(grant: FeatProficiencyGrantDescriptor): SkillName[] {
  return [
    ...(grant.skills ?? []),
    ...(grant.adaptiveSkills ?? []),
    ...(grant.skillLevels?.map((entry) => entry.skill) ?? [])
  ];
}

function removeFeatGrantedProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  return getFeatProficiencyGrantDescriptors(entryToRemove).reduce((currentDraft, grant) => {
    const skills = getGrantRemovalSkills(grant);

    return {
      ...currentDraft,
      armorProficiencies: grant.armor?.length
        ? removeFeatGrantedArmorEntries(
            currentDraft.armorProficiencies,
            grant.armor,
            grant.label,
            entryToRemove.id
          )
        : currentDraft.armorProficiencies,
      savingThrowProficiencies: grant.savingThrows?.length
        ? removeFeatGrantedSavingThrowEntries(
            currentDraft.savingThrowProficiencies,
            grant.savingThrows,
            grant.label,
            entryToRemove.id
          )
        : currentDraft.savingThrowProficiencies,
      skillProficiencies: skills.length
        ? removeFeatGrantedSkillEntries(
            currentDraft.skillProficiencies,
            skills,
            grant.label,
            entryToRemove.id
          )
        : currentDraft.skillProficiencies,
      toolProficiencies: grant.tools?.length
        ? removeFeatGrantedToolEntries(
            currentDraft.toolProficiencies,
            grant.tools,
            grant.label,
            entryToRemove.id
          )
        : currentDraft.toolProficiencies,
      weaponProficiencies: grant.weapons?.length
        ? removeFeatGrantedWeaponEntries(
            currentDraft.weaponProficiencies,
            grant.weapons,
            grant.label,
            entryToRemove.id
          )
        : currentDraft.weaponProficiencies
    };
  }, draft);
}

function addFeatGrantedSkillAtProficiencyOrExpertise(
  draft: FeatEditorDraft,
  skill: SkillName,
  featLabel: string,
  featEntryId: string
): FeatEditorDraft {
  const proficiency = getSkillProficiencyForName(skill);
  const currentLevel = proficiency
    ? getSkillLevelFromEntries(draft.skillProficiencies, proficiency)
    : PROF_LEVEL.NONE;

  return {
    ...draft,
    skillProficiencies: addFeatGrantedSkillEntriesAtLevel(
      draft.skillProficiencies,
      [skill],
      featLabel,
      featEntryId,
      currentLevel === PROF_LEVEL.NONE ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.EXPERT
    )
  };
}

function addSkillLevelGrantsToDraft(
  draft: FeatEditorDraft,
  grant: FeatProficiencyGrantDescriptor,
  featEntryId: string
): FeatEditorDraft {
  const skillLevels = grant.skillLevels ?? [];

  if (skillLevels.length === 0) {
    return draft;
  }

  return {
    ...draft,
    skillProficiencies: skillLevels.reduce(
      (entries, { skill, level }) =>
        addFeatGrantedSkillEntriesAtLevel(entries, [skill], grant.label, featEntryId, level),
      draft.skillProficiencies
    )
  };
}

function addFeatProficiencyGrantToDraft(
  draft: FeatEditorDraft,
  grant: FeatProficiencyGrantDescriptor,
  featEntryId: string
): FeatEditorDraft {
  let nextDraft = draft;

  if (grant.skills?.length) {
    nextDraft = {
      ...nextDraft,
      skillProficiencies: addFeatGrantedSkillEntries(
        nextDraft.skillProficiencies,
        grant.skills,
        grant.label,
        featEntryId
      )
    };
  }

  grant.adaptiveSkills?.forEach((skill) => {
    nextDraft = addFeatGrantedSkillAtProficiencyOrExpertise(
      nextDraft,
      skill,
      grant.label,
      featEntryId
    );
  });

  nextDraft = addSkillLevelGrantsToDraft(nextDraft, grant, featEntryId);

  if (grant.tools?.length) {
    nextDraft = {
      ...nextDraft,
      toolProficiencies: addFeatGrantedToolEntries(
        nextDraft.toolProficiencies,
        grant.tools,
        grant.label,
        featEntryId
      )
    };
  }

  if (grant.armor?.length) {
    nextDraft = {
      ...nextDraft,
      armorProficiencies: addFeatGrantedArmorEntries(
        nextDraft.armorProficiencies,
        grant.armor,
        grant.label,
        featEntryId
      )
    };
  }

  if (grant.weapons?.length) {
    nextDraft = {
      ...nextDraft,
      weaponProficiencies: addFeatGrantedWeaponEntries(
        nextDraft.weaponProficiencies,
        grant.weapons,
        grant.label,
        featEntryId
      )
    };
  }

  if (grant.savingThrows?.length) {
    nextDraft = {
      ...nextDraft,
      savingThrowProficiencies: addFeatGrantedSavingThrowEntries(
        nextDraft.savingThrowProficiencies,
        grant.savingThrows,
        grant.label,
        featEntryId
      )
    };
  }

  return nextDraft;
}

function addFeatGrantedProficienciesToDraft(
  draft: FeatEditorDraft,
  featEntry: CharacterFeatEntry
): FeatEditorDraft {
  return getFeatProficiencyGrantDescriptors(featEntry).reduce(
    (currentDraft, grant) => addFeatProficiencyGrantToDraft(currentDraft, grant, featEntry.id),
    draft
  );
}

export function createFeatEditorDraft(character: Character): FeatEditorDraft {
  return {
    feats: character.feats ?? [],
    armorProficiencies: character.armorProficiencies,
    savingThrowProficiencies: character.savingThrowProficiencies,
    skillProficiencies: character.skillProficiencies,
    toolProficiencies: character.toolProficiencies,
    weaponProficiencies: character.weaponProficiencies
  };
}

export function applyFeatEditorDraftToCharacter(
  currentCharacter: Character,
  draft: FeatEditorDraft
): Character {
  if (
    areDraftListsEqual(currentCharacter.feats ?? [], draft.feats) &&
    areDraftListsEqual(currentCharacter.armorProficiencies, draft.armorProficiencies) &&
    areDraftListsEqual(
      currentCharacter.savingThrowProficiencies,
      draft.savingThrowProficiencies
    ) &&
    areDraftListsEqual(currentCharacter.skillProficiencies, draft.skillProficiencies) &&
    areDraftListsEqual(currentCharacter.toolProficiencies, draft.toolProficiencies) &&
    areDraftListsEqual(currentCharacter.weaponProficiencies, draft.weaponProficiencies)
  ) {
    return currentCharacter;
  }

  return {
    ...currentCharacter,
    feats: draft.feats,
    armorProficiencies: draft.armorProficiencies,
    savingThrowProficiencies: draft.savingThrowProficiencies,
    skillProficiencies: draft.skillProficiencies,
    toolProficiencies: draft.toolProficiencies,
    weaponProficiencies: draft.weaponProficiencies
  };
}

export function removeFeatFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (!isFeatEntryRemovable(entryToRemove)) {
    return draft;
  }

  const nextDraft = removeFeatGrantedProficienciesFromDraft(draft, entryToRemove);

  return {
    ...nextDraft,
    feats: nextDraft.feats.filter((entry) => entry.id !== entryToRemove.id)
  };
}

export function updateFeatInDraft(
  draft: FeatEditorDraft,
  previousEntry: CharacterFeatEntry,
  nextEntry: CharacterFeatEntry
): FeatEditorDraft {
  const nextDraft = removeFeatGrantedProficienciesFromDraft(draft, previousEntry);

  return addFeatGrantedProficienciesToDraft(
    {
      ...nextDraft,
      feats: nextDraft.feats.map((entry) => (entry.id === previousEntry.id ? nextEntry : entry))
    },
    nextEntry
  );
}

export function upsertFeatInDraft(
  draft: FeatEditorDraft,
  featEntry: CharacterFeatEntry,
  sourceContext: ClassFeatureFeatSource | null
): FeatEditorDraft {
  const existingEntries = sourceContext
    ? draft.feats.filter((entry) =>
        isFeatFromClassFeatureSource(entry, sourceContext.level, sourceContext.feature)
      )
    : [];
  let nextDraft = draft;

  existingEntries.forEach((entry) => {
    nextDraft = removeFeatGrantedProficienciesFromDraft(nextDraft, entry);
  });

  const nextFeats = sourceContext
    ? [
        ...nextDraft.feats.filter(
          (entry) => !isFeatFromClassFeatureSource(entry, sourceContext.level, sourceContext.feature)
        ),
        featEntry
      ]
    : [...nextDraft.feats, featEntry];

  nextDraft = {
    ...nextDraft,
    feats: nextFeats
  };

  return addFeatGrantedProficienciesToDraft(nextDraft, featEntry);
}
