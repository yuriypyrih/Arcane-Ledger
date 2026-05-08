import type { Character } from "../../../types";
import type { RootState } from "../../../store";
import type { CharacterSheetDomain, CharacterSheetDomainRevisions } from "./domains";

type CharacterField = keyof Character;

function createCharacterFieldsSelector(fields: CharacterField[], domains: CharacterSheetDomain[]) {
  let previousSource: Character | null = null;
  let previousSelected: Character | null = null;
  let previousRevisions: CharacterSheetDomainRevisions | null = null;

  return (state: RootState): Character | null => {
    const character = state.activeCharacterSheet.activeCharacter;

    if (!character) {
      previousSource = null;
      previousSelected = null;
      previousRevisions = null;
      return null;
    }

    const domainRevisionsMatch =
      previousRevisions !== null &&
      domains.every(
        (domain) => previousRevisions?.[domain] === state.activeCharacterSheet.revisions[domain]
      );

    if (
      previousSource &&
      previousSelected &&
      previousSource.id === character.id &&
      domainRevisionsMatch &&
      fields.every((field) => Object.is(previousSource?.[field], character[field]))
    ) {
      return previousSelected;
    }

    previousSource = character;
    previousSelected = character;
    previousRevisions = { ...state.activeCharacterSheet.revisions };
    return character;
  };
}

export const selectProfileCharacter = createCharacterFieldsSelector(
  [
    "id",
    "name",
    "species",
    "speciesChoices",
    "speciesFeatureState",
    "className",
    "subclassId",
    "level",
    "xp",
    "alignment",
    "background",
    "backgroundChoices",
    "backgroundNotes",
    "abilities",
    "attributeMode",
    "hitPoints",
    "currentHitPoints",
    "maxHitPointsMode",
    "hover",
    "coreStats",
    "armorClassFormulaSelection",
    "equipment",
    "inventoryItems",
    "customEquipment",
    "classFeatureState",
    "statusEntries",
    "savingThrowProficiencies",
    "skillProficiencies",
    "feats",
    "hitDiceRemaining"
  ],
  ["profile", "resources", "equipment", "inventory", "features", "statuses", "proficiencies"]
);

export const selectGameplayCharacter = createCharacterFieldsSelector(
  [
    "id",
    "species",
    "speciesChoices",
    "speciesFeatureState",
    "className",
    "subclassId",
    "background",
    "backgroundChoices",
    "level",
    "abilities",
    "currentHitPoints",
    "hitPoints",
    "temporaryHitPoints",
    "temporaryHitPointsSource",
    "magicTemporaryHitPoints",
    "magicTemporaryHitPointsSource",
    "hitDiceRemaining",
    "heroicInspiration",
    "roundTracker",
    "statusEntries",
    "deathSaves",
    "equipment",
    "inventoryItems",
    "customEquipment",
    "classFeatureState",
    "spellSlotsExpended",
    "preparedSpellIds",
    "spellbookSpellIds",
    "cantripIds",
    "skillProficiencies",
    "savingThrowProficiencies",
    "weaponProficiencies",
    "armorProficiencies",
    "toolProficiencies",
    "languageProficiencies",
    "feats",
    "companions"
  ],
  [
    "resources",
    "equipment",
    "inventory",
    "spells",
    "features",
    "statuses",
    "proficiencies",
    "companions"
  ]
);

export const selectStatsCharacter = createCharacterFieldsSelector(
  [
    "id",
    "species",
    "speciesChoices",
    "speciesFeatureState",
    "className",
    "subclassId",
    "background",
    "backgroundChoices",
    "level",
    "abilities",
    "attributeMode",
    "hitPoints",
    "currentHitPoints",
    "maxHitPointsMode",
    "hover",
    "coreStats",
    "armorClassFormulaSelection",
    "equipment",
    "inventoryItems",
    "customEquipment",
    "classFeatureState",
    "statusEntries",
    "savingThrowProficiencies",
    "skillProficiencies",
    "feats",
    "hitDiceRemaining"
  ],
  ["profile", "resources", "equipment", "inventory", "features", "statuses", "proficiencies"]
);

export const selectSkillsCharacter = createCharacterFieldsSelector(
  [
    "id",
    "species",
    "speciesChoices",
    "speciesFeatureState",
    "className",
    "subclassId",
    "background",
    "backgroundChoices",
    "level",
    "abilities",
    "classFeatureState",
    "statusEntries",
    "skillProficiencies",
    "savingThrowProficiencies",
    "weaponProficiencies",
    "armorProficiencies",
    "toolProficiencies",
    "languageProficiencies",
    "feats"
  ],
  ["profile", "features", "statuses", "proficiencies"]
);

export const selectFeaturesCharacter = createCharacterFieldsSelector(
  [
    "id",
    "species",
    "speciesChoices",
    "speciesFeatureState",
    "className",
    "subclassId",
    "background",
    "backgroundChoices",
    "level",
    "abilities",
    "classFeatureState",
    "statusEntries",
    "skillProficiencies",
    "toolProficiencies",
    "weaponProficiencies",
    "armorProficiencies",
    "languageProficiencies",
    "cantripIds",
    "spellbookSpellIds",
    "preparedSpellIds",
    "feats"
  ],
  ["profile", "features", "spells", "statuses", "proficiencies"]
);

export const selectCompanionsCharacter = createCharacterFieldsSelector(
  ["id", "companions"],
  ["companions"]
);

export const selectEquipmentCharacter = createCharacterFieldsSelector(
  [
    "id",
    "species",
    "speciesChoices",
    "speciesFeatureState",
    "className",
    "subclassId",
    "background",
    "backgroundChoices",
    "level",
    "abilities",
    "currencies",
    "equipment",
    "inventoryItems",
    "customEquipment",
    "classFeatureState",
    "weaponProficiencies"
  ],
  ["profile", "equipment", "inventory", "features", "proficiencies"]
);

export const selectSpellcastingCharacter = createCharacterFieldsSelector(
  [
    "id",
    "species",
    "speciesChoices",
    "speciesFeatureState",
    "className",
    "subclassId",
    "background",
    "backgroundChoices",
    "level",
    "abilities",
    "classFeatureState",
    "statusEntries",
    "roundTracker",
    "cantripIds",
    "spellbookSpellIds",
    "preparedSpellIds",
    "spellSlotsExpended",
    "feats"
  ],
  ["profile", "resources", "spells", "features", "statuses"]
);
