import { FEATS } from "../../../codex/entries";
import {
  ALL_SKILLS,
  ARMOR_PROFICIENCY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY,
  type ArmorProficiencyEntry,
  type CharacterFeatEntry,
  type CrafterChoice,
  type MusicianChoice,
  type SAVING_THROW_PROFICIENCY,
  type SavingThrowProficiencyEntry,
  type SkillName,
  type SkillProficiencyEntry,
  type SkilledChoice,
  type ToolProficiencyEntry,
  type WeaponProficiencyEntry
} from "../../../types";
import {
  addFeatGrantedArmorEntries,
  addFeatGrantedSavingThrowEntries,
  addFeatGrantedSkillEntries,
  addFeatGrantedSkillEntriesAtLevel,
  addFeatGrantedToolEntries,
  addFeatGrantedWeaponEntries,
  removeFeatGrantedArmorEntries,
  removeFeatGrantedSavingThrowEntries,
  removeFeatGrantedSkillEntries,
  removeFeatGrantedToolEntries,
  removeFeatGrantedWeaponEntries
} from "../proficiency/core";
import { getSkillLevelFromEntries } from "../proficiency/manual";
import { getSkillProficiencyForName } from "../proficiencyResolvers";

export type FeatProficiencyCollections = {
  armorProficiencies: ArmorProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  skillProficiencies: SkillProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
};

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

function splitSkilledSelections(choice?: SkilledChoice): {
  skills: SkillName[];
  tools: TOOL_PROFICIENCY[];
} {
  return (choice?.selections ?? []).reduce<{
    skills: SkillName[];
    tools: TOOL_PROFICIENCY[];
  }>(
    (result, selection) => {
      if (selection.kind === "skill") {
        result.skills.push(selection.skill);
      } else {
        result.tools.push(selection.tool);
      }

      return result;
    },
    {
      skills: [],
      tools: []
    }
  );
}

function getCrafterToolSelections(choice?: CrafterChoice): TOOL_PROFICIENCY[] {
  return choice?.toolProficiencies ? [...choice.toolProficiencies] : [];
}

function getMusicianToolSelections(choice?: MusicianChoice): TOOL_PROFICIENCY[] {
  return choice?.toolProficiencies ? [...choice.toolProficiencies] : [];
}

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

export function removeFeatGrantedProficienciesFromCollections<
  TCollections extends FeatProficiencyCollections
>(collections: TCollections, entryToRemove: CharacterFeatEntry): TCollections {
  return getFeatProficiencyGrantDescriptors(entryToRemove).reduce((currentCollections, grant) => {
    const skills = getGrantRemovalSkills(grant);

    return {
      ...currentCollections,
      armorProficiencies: grant.armor?.length
        ? removeFeatGrantedArmorEntries(
            currentCollections.armorProficiencies,
            grant.armor,
            grant.label,
            entryToRemove.id
          )
        : currentCollections.armorProficiencies,
      savingThrowProficiencies: grant.savingThrows?.length
        ? removeFeatGrantedSavingThrowEntries(
            currentCollections.savingThrowProficiencies,
            grant.savingThrows,
            grant.label,
            entryToRemove.id
          )
        : currentCollections.savingThrowProficiencies,
      skillProficiencies: skills.length
        ? removeFeatGrantedSkillEntries(
            currentCollections.skillProficiencies,
            skills,
            grant.label,
            entryToRemove.id
          )
        : currentCollections.skillProficiencies,
      toolProficiencies: grant.tools?.length
        ? removeFeatGrantedToolEntries(
            currentCollections.toolProficiencies,
            grant.tools,
            grant.label,
            entryToRemove.id
          )
        : currentCollections.toolProficiencies,
      weaponProficiencies: grant.weapons?.length
        ? removeFeatGrantedWeaponEntries(
            currentCollections.weaponProficiencies,
            grant.weapons,
            grant.label,
            entryToRemove.id
          )
        : currentCollections.weaponProficiencies
    };
  }, collections);
}

function addFeatGrantedSkillAtProficiencyOrExpertise<
  TCollections extends FeatProficiencyCollections
>(
  collections: TCollections,
  skill: SkillName,
  featLabel: string,
  featEntryId: string
): TCollections {
  const proficiency = getSkillProficiencyForName(skill);
  const currentLevel = proficiency
    ? getSkillLevelFromEntries(collections.skillProficiencies, proficiency)
    : PROF_LEVEL.NONE;

  return {
    ...collections,
    skillProficiencies: addFeatGrantedSkillEntriesAtLevel(
      collections.skillProficiencies,
      [skill],
      featLabel,
      featEntryId,
      currentLevel === PROF_LEVEL.NONE ? PROF_LEVEL.PROFICIENT : PROF_LEVEL.EXPERT
    )
  };
}

function addSkillLevelGrantsToCollections<TCollections extends FeatProficiencyCollections>(
  collections: TCollections,
  grant: FeatProficiencyGrantDescriptor,
  featEntryId: string
): TCollections {
  const skillLevels = grant.skillLevels ?? [];

  if (skillLevels.length === 0) {
    return collections;
  }

  return {
    ...collections,
    skillProficiencies: skillLevels.reduce(
      (entries, { skill, level }) =>
        addFeatGrantedSkillEntriesAtLevel(entries, [skill], grant.label, featEntryId, level),
      collections.skillProficiencies
    )
  };
}

function addFeatProficiencyGrantToCollections<TCollections extends FeatProficiencyCollections>(
  collections: TCollections,
  grant: FeatProficiencyGrantDescriptor,
  featEntryId: string
): TCollections {
  let nextCollections = collections;

  if (grant.skills?.length) {
    nextCollections = {
      ...nextCollections,
      skillProficiencies: addFeatGrantedSkillEntries(
        nextCollections.skillProficiencies,
        grant.skills,
        grant.label,
        featEntryId
      )
    };
  }

  grant.adaptiveSkills?.forEach((skill) => {
    nextCollections = addFeatGrantedSkillAtProficiencyOrExpertise(
      nextCollections,
      skill,
      grant.label,
      featEntryId
    );
  });

  nextCollections = addSkillLevelGrantsToCollections(nextCollections, grant, featEntryId);

  if (grant.tools?.length) {
    nextCollections = {
      ...nextCollections,
      toolProficiencies: addFeatGrantedToolEntries(
        nextCollections.toolProficiencies,
        grant.tools,
        grant.label,
        featEntryId
      )
    };
  }

  if (grant.armor?.length) {
    nextCollections = {
      ...nextCollections,
      armorProficiencies: addFeatGrantedArmorEntries(
        nextCollections.armorProficiencies,
        grant.armor,
        grant.label,
        featEntryId
      )
    };
  }

  if (grant.weapons?.length) {
    nextCollections = {
      ...nextCollections,
      weaponProficiencies: addFeatGrantedWeaponEntries(
        nextCollections.weaponProficiencies,
        grant.weapons,
        grant.label,
        featEntryId
      )
    };
  }

  if (grant.savingThrows?.length) {
    nextCollections = {
      ...nextCollections,
      savingThrowProficiencies: addFeatGrantedSavingThrowEntries(
        nextCollections.savingThrowProficiencies,
        grant.savingThrows,
        grant.label,
        featEntryId
      )
    };
  }

  return nextCollections;
}

export function addFeatGrantedProficienciesToCollections<
  TCollections extends FeatProficiencyCollections
>(collections: TCollections, featEntry: CharacterFeatEntry): TCollections {
  return getFeatProficiencyGrantDescriptors(featEntry).reduce(
    (currentCollections, grant) =>
      addFeatProficiencyGrantToCollections(currentCollections, grant, featEntry.id),
    collections
  );
}

export function stripFeatGrantedProficienciesFromCollections<
  TCollections extends FeatProficiencyCollections
>(collections: TCollections): TCollections {
  return {
    ...collections,
    armorProficiencies: collections.armorProficiencies.filter(
      (entry) => entry.source !== PROFICIENCY_SOURCE.FEAT
    ),
    savingThrowProficiencies: collections.savingThrowProficiencies.filter(
      (entry) => entry.source !== PROFICIENCY_SOURCE.FEAT
    ),
    skillProficiencies: collections.skillProficiencies.filter(
      (entry) => entry.source !== PROFICIENCY_SOURCE.FEAT
    ),
    toolProficiencies: collections.toolProficiencies.filter(
      (entry) => entry.source !== PROFICIENCY_SOURCE.FEAT
    ),
    weaponProficiencies: collections.weaponProficiencies.filter(
      (entry) => entry.source !== PROFICIENCY_SOURCE.FEAT
    )
  };
}

export function recomputeFeatGrantedProficiencies<TCollections extends FeatProficiencyCollections>(
  collections: TCollections,
  feats: CharacterFeatEntry[]
): TCollections {
  return feats.reduce(
    (currentCollections, featEntry) =>
      addFeatGrantedProficienciesToCollections(currentCollections, featEntry),
    stripFeatGrantedProficienciesFromCollections(collections)
  );
}
