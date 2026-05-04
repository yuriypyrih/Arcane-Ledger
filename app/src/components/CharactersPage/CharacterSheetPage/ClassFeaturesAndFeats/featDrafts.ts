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

function removeSkilledProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.SKILLED || !entryToRemove.skilled) {
    return draft;
  }

  const { skills, tools } = splitSkilledSelections(entryToRemove.skilled);

  return {
    ...draft,
    skillProficiencies: removeFeatGrantedSkillEntries(
      draft.skillProficiencies,
      skills,
      "Skilled",
      entryToRemove.id
    ),
    toolProficiencies: removeFeatGrantedToolEntries(
      draft.toolProficiencies,
      tools,
      "Skilled",
      entryToRemove.id
    )
  };
}

function removeCrafterProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.CRAFTER || !entryToRemove.crafter) {
    return draft;
  }

  return {
    ...draft,
    toolProficiencies: removeFeatGrantedToolEntries(
      draft.toolProficiencies,
      getCrafterToolSelections(entryToRemove.crafter),
      "Crafter",
      entryToRemove.id
    )
  };
}

function removeMusicianProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.MUSICIAN || !entryToRemove.musician) {
    return draft;
  }

  return {
    ...draft,
    toolProficiencies: removeFeatGrantedToolEntries(
      draft.toolProficiencies,
      getMusicianToolSelections(entryToRemove.musician),
      "Musician",
      entryToRemove.id
    )
  };
}

function removeChefProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.CHEF) {
    return draft;
  }

  return {
    ...draft,
    toolProficiencies: removeFeatGrantedToolEntries(
      draft.toolProficiencies,
      [TOOL_PROFICIENCY.COOKS_UTENSILS],
      "Chef",
      entryToRemove.id
    )
  };
}

function removeHeavilyArmoredProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.HEAVILY_ARMORED) {
    return draft;
  }

  return {
    ...draft,
    armorProficiencies: removeFeatGrantedArmorEntries(
      draft.armorProficiencies,
      [ARMOR_PROFICIENCY.HEAVY],
      "Heavily Armored",
      entryToRemove.id
    )
  };
}

function removeKeenMindProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.KEEN_MIND || !entryToRemove.keenMind) {
    return draft;
  }

  return {
    ...draft,
    skillProficiencies: removeFeatGrantedSkillEntries(
      draft.skillProficiencies,
      [entryToRemove.keenMind.skill],
      "Keen Mind",
      entryToRemove.id
    )
  };
}

function removeLightlyArmoredProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.LIGHTLY_ARMORED) {
    return draft;
  }

  return {
    ...draft,
    armorProficiencies: removeFeatGrantedArmorEntries(
      draft.armorProficiencies,
      [ARMOR_PROFICIENCY.LIGHT, ARMOR_PROFICIENCY.SHIELD],
      "Lightly Armored",
      entryToRemove.id
    )
  };
}

function removeMartialWeaponTrainingProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.MARTIAL_WEAPON_TRAINING) {
    return draft;
  }

  return {
    ...draft,
    weaponProficiencies: removeFeatGrantedWeaponEntries(
      draft.weaponProficiencies,
      [WEAPON_PROFICIENCY.MARTIAL],
      "Martial Weapon Training",
      entryToRemove.id
    )
  };
}

function removeModeratelyArmoredProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.MODERATELY_ARMORED) {
    return draft;
  }

  return {
    ...draft,
    armorProficiencies: removeFeatGrantedArmorEntries(
      draft.armorProficiencies,
      [ARMOR_PROFICIENCY.MEDIUM],
      "Moderately Armored",
      entryToRemove.id
    )
  };
}

function removeObservantProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.OBSERVANT || !entryToRemove.observant) {
    return draft;
  }

  return {
    ...draft,
    skillProficiencies: removeFeatGrantedSkillEntries(
      draft.skillProficiencies,
      [entryToRemove.observant.skill],
      "Observant",
      entryToRemove.id
    )
  };
}

function removeSkillExpertProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.SKILL_EXPERT || !entryToRemove.skillExpert) {
    return draft;
  }

  return {
    ...draft,
    skillProficiencies: removeFeatGrantedSkillEntries(
      draft.skillProficiencies,
      [entryToRemove.skillExpert.skillProficiency, entryToRemove.skillExpert.skillExpertise],
      "Skill Expert",
      entryToRemove.id
    )
  };
}

function removeBoonOfSkillProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.BOON_OF_SKILL || !entryToRemove.boonOfSkill) {
    return draft;
  }

  return {
    ...draft,
    skillProficiencies: removeFeatGrantedSkillEntries(
      draft.skillProficiencies,
      [...ALL_SKILLS],
      "Boon of Skill",
      entryToRemove.id
    )
  };
}

function removePoisonerProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.POISONER) {
    return draft;
  }

  return {
    ...draft,
    toolProficiencies: removeFeatGrantedToolEntries(
      draft.toolProficiencies,
      [TOOL_PROFICIENCY.POISONERS_KIT],
      "Poisoner",
      entryToRemove.id
    )
  };
}

function removeResilientProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.RESILIENT || !entryToRemove.resilient) {
    return draft;
  }

  return {
    ...draft,
    savingThrowProficiencies: removeFeatGrantedSavingThrowEntries(
      draft.savingThrowProficiencies,
      [entryToRemove.resilient.ability as SAVING_THROW_PROFICIENCY],
      "Resilient",
      entryToRemove.id
    )
  };
}

function removeWeaponMasterProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  if (entryToRemove.feat !== FEATS.WEAPON_MASTER || !entryToRemove.weaponMaster) {
    return draft;
  }

  return {
    ...draft,
    weaponProficiencies: removeFeatGrantedWeaponEntries(
      draft.weaponProficiencies,
      [entryToRemove.weaponMaster.weaponMastery],
      "Weapon Master",
      entryToRemove.id
    )
  };
}

function removeFeatGrantedProficienciesFromDraft(
  draft: FeatEditorDraft,
  entryToRemove: CharacterFeatEntry
): FeatEditorDraft {
  const removers = [
    removeSkilledProficienciesFromDraft,
    removeCrafterProficienciesFromDraft,
    removeMusicianProficienciesFromDraft,
    removeChefProficienciesFromDraft,
    removeHeavilyArmoredProficienciesFromDraft,
    removeKeenMindProficienciesFromDraft,
    removeLightlyArmoredProficienciesFromDraft,
    removeMartialWeaponTrainingProficienciesFromDraft,
    removeModeratelyArmoredProficienciesFromDraft,
    removeObservantProficienciesFromDraft,
    removeSkillExpertProficienciesFromDraft,
    removeBoonOfSkillProficienciesFromDraft,
    removePoisonerProficienciesFromDraft,
    removeResilientProficienciesFromDraft,
    removeWeaponMasterProficienciesFromDraft
  ];

  return removers.reduce(
    (currentDraft, removeProficiencies) => removeProficiencies(currentDraft, entryToRemove),
    draft
  );
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

function addFeatGrantedProficienciesToDraft(
  draft: FeatEditorDraft,
  featEntry: CharacterFeatEntry
): FeatEditorDraft {
  const skilledSelections =
    featEntry.feat === FEATS.SKILLED ? splitSkilledSelections(featEntry.skilled) : null;
  const crafterToolSelections =
    featEntry.feat === FEATS.CRAFTER && featEntry.crafter
      ? getCrafterToolSelections(featEntry.crafter)
      : null;
  const chefToolSelections =
    featEntry.feat === FEATS.CHEF ? [TOOL_PROFICIENCY.COOKS_UTENSILS] : [];
  const heavilyArmoredArmorSelections =
    featEntry.feat === FEATS.HEAVILY_ARMORED ? [ARMOR_PROFICIENCY.HEAVY] : [];
  const keenMindSkillSelection =
    featEntry.feat === FEATS.KEEN_MIND && featEntry.keenMind ? featEntry.keenMind.skill : null;
  const lightlyArmoredArmorSelections =
    featEntry.feat === FEATS.LIGHTLY_ARMORED
      ? [ARMOR_PROFICIENCY.LIGHT, ARMOR_PROFICIENCY.SHIELD]
      : [];
  const martialWeaponTrainingWeaponSelections =
    featEntry.feat === FEATS.MARTIAL_WEAPON_TRAINING ? [WEAPON_PROFICIENCY.MARTIAL] : [];
  const moderatelyArmoredArmorSelections =
    featEntry.feat === FEATS.MODERATELY_ARMORED ? [ARMOR_PROFICIENCY.MEDIUM] : [];
  const observantSkillSelection =
    featEntry.feat === FEATS.OBSERVANT && featEntry.observant ? featEntry.observant.skill : null;
  const skillExpertSelection =
    featEntry.feat === FEATS.SKILL_EXPERT && featEntry.skillExpert
      ? featEntry.skillExpert
      : null;
  const boonOfSkillSelection =
    featEntry.feat === FEATS.BOON_OF_SKILL && featEntry.boonOfSkill
      ? featEntry.boonOfSkill
      : null;
  const poisonerToolSelections =
    featEntry.feat === FEATS.POISONER ? [TOOL_PROFICIENCY.POISONERS_KIT] : [];
  const resilientSavingThrowSelections =
    featEntry.feat === FEATS.RESILIENT && featEntry.resilient
      ? [featEntry.resilient.ability as SAVING_THROW_PROFICIENCY]
      : [];
  const weaponMasterWeaponSelections =
    featEntry.feat === FEATS.WEAPON_MASTER && featEntry.weaponMaster
      ? [featEntry.weaponMaster.weaponMastery]
      : [];
  const musicianToolSelections =
    featEntry.feat === FEATS.MUSICIAN && featEntry.musician
      ? getMusicianToolSelections(featEntry.musician)
      : null;
  let nextDraft = draft;

  nextDraft = skilledSelections
    ? {
        ...nextDraft,
        skillProficiencies: addFeatGrantedSkillEntries(
          nextDraft.skillProficiencies,
          skilledSelections.skills,
          "Skilled",
          featEntry.id
        ),
        toolProficiencies: addFeatGrantedToolEntries(
          nextDraft.toolProficiencies,
          skilledSelections.tools,
          "Skilled",
          featEntry.id
        )
      }
    : nextDraft;

  nextDraft = crafterToolSelections
    ? {
        ...nextDraft,
        toolProficiencies: addFeatGrantedToolEntries(
          nextDraft.toolProficiencies,
          crafterToolSelections,
          "Crafter",
          featEntry.id
        )
      }
    : nextDraft;

  nextDraft =
    chefToolSelections.length > 0
      ? {
          ...nextDraft,
          toolProficiencies: addFeatGrantedToolEntries(
            nextDraft.toolProficiencies,
            chefToolSelections,
            "Chef",
            featEntry.id
          )
      }
    : nextDraft;

  nextDraft =
    heavilyArmoredArmorSelections.length > 0
      ? {
          ...nextDraft,
          armorProficiencies: addFeatGrantedArmorEntries(
            nextDraft.armorProficiencies,
            heavilyArmoredArmorSelections,
            "Heavily Armored",
            featEntry.id
          )
      }
    : nextDraft;

  if (keenMindSkillSelection) {
    nextDraft = addFeatGrantedSkillAtProficiencyOrExpertise(
      nextDraft,
      keenMindSkillSelection as SkillName,
      "Keen Mind",
      featEntry.id
    );
  }

  nextDraft =
    lightlyArmoredArmorSelections.length > 0
      ? {
          ...nextDraft,
          armorProficiencies: addFeatGrantedArmorEntries(
            nextDraft.armorProficiencies,
            lightlyArmoredArmorSelections,
            "Lightly Armored",
            featEntry.id
          )
      }
      : nextDraft;

  nextDraft =
    martialWeaponTrainingWeaponSelections.length > 0
      ? {
          ...nextDraft,
          weaponProficiencies: addFeatGrantedWeaponEntries(
            nextDraft.weaponProficiencies,
            martialWeaponTrainingWeaponSelections,
            "Martial Weapon Training",
            featEntry.id
          )
        }
      : nextDraft;

  nextDraft =
    moderatelyArmoredArmorSelections.length > 0
      ? {
          ...nextDraft,
          armorProficiencies: addFeatGrantedArmorEntries(
            nextDraft.armorProficiencies,
            moderatelyArmoredArmorSelections,
            "Moderately Armored",
            featEntry.id
          )
        }
      : nextDraft;

  if (observantSkillSelection) {
    nextDraft = addFeatGrantedSkillAtProficiencyOrExpertise(
      nextDraft,
      observantSkillSelection as SkillName,
      "Observant",
      featEntry.id
    );
  }

  nextDraft = skillExpertSelection
    ? {
        ...nextDraft,
        skillProficiencies: addFeatGrantedSkillEntriesAtLevel(
          addFeatGrantedSkillEntriesAtLevel(
            nextDraft.skillProficiencies,
            [skillExpertSelection.skillProficiency],
            "Skill Expert",
            featEntry.id,
            PROF_LEVEL.PROFICIENT
          ),
          [skillExpertSelection.skillExpertise],
          "Skill Expert",
          featEntry.id,
          PROF_LEVEL.EXPERT
        )
      }
    : nextDraft;

  nextDraft = boonOfSkillSelection
    ? {
        ...nextDraft,
        skillProficiencies: addFeatGrantedSkillEntriesAtLevel(
          addFeatGrantedSkillEntriesAtLevel(
            nextDraft.skillProficiencies,
            [...ALL_SKILLS],
            "Boon of Skill",
            featEntry.id,
            PROF_LEVEL.PROFICIENT
          ),
          [boonOfSkillSelection.skillExpertise],
          "Boon of Skill",
          featEntry.id,
          PROF_LEVEL.EXPERT
        )
      }
    : nextDraft;

  nextDraft =
    poisonerToolSelections.length > 0
      ? {
          ...nextDraft,
          toolProficiencies: addFeatGrantedToolEntries(
            nextDraft.toolProficiencies,
            poisonerToolSelections,
            "Poisoner",
            featEntry.id
          )
        }
      : nextDraft;

  nextDraft =
    resilientSavingThrowSelections.length > 0
      ? {
          ...nextDraft,
          savingThrowProficiencies: addFeatGrantedSavingThrowEntries(
            nextDraft.savingThrowProficiencies,
            resilientSavingThrowSelections,
            "Resilient",
            featEntry.id
          )
        }
      : nextDraft;

  nextDraft =
    weaponMasterWeaponSelections.length > 0
      ? {
          ...nextDraft,
          weaponProficiencies: addFeatGrantedWeaponEntries(
            nextDraft.weaponProficiencies,
            weaponMasterWeaponSelections,
            "Weapon Master",
            featEntry.id
          )
        }
      : nextDraft;

  return musicianToolSelections
    ? {
        ...nextDraft,
        toolProficiencies: addFeatGrantedToolEntries(
          nextDraft.toolProficiencies,
          musicianToolSelections,
          "Musician",
          featEntry.id
        )
      }
    : nextDraft;
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
