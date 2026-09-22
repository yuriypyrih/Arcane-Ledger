import type { Character, CharacterInventoryItem } from "../../../types";
import { getCharacterClasses } from "../../../pages/CharactersPage/multiclass";
import { hasSpellcastingForCharacter } from "../../../pages/CharactersPage/spellcastingAvailability";
import {
  CharacterProfileForm,
  GameplayForm,
  CompanionsSection,
  SkillsAndProficienciesForm,
  ClassFeaturesAndFeats,
  CharacterStatsForm,
  SpellCastingForm
} from "../CharacterSheetPage";
import { ignoreCharacterMutation } from "../CharacterSheetPage/readOnlySheetContext";
import { getClassSignatureStyle } from "../classSignature";
import ReadOnlyEquipment from "./ReadOnlyEquipment";
import styles from "./CharacterInspection.module.css";

type Props = { character: Character; onInspectItem: (item: CharacterInventoryItem) => void };

export default function CharacterInspectionSheet({ character, onInspectItem }: Props) {
  const props = { character, readOnly: true, onPersistCharacter: ignoreCharacterMutation };
  const classes = getCharacterClasses(character);
  return (
    <div className={styles.sheet} style={getClassSignatureStyle(character.className)}>
      <CharacterProfileForm {...props} />
      <GameplayForm {...props} onQueueHitPointCharacter={ignoreCharacterMutation} />
      <CharacterStatsForm {...props} />
      {character.companions?.length ? <CompanionsSection {...props} /> : null}
      <SkillsAndProficienciesForm {...props} />
      <ReadOnlyEquipment character={character} onInspect={onInspectItem} />
      {classes.map((entry, index) => (
        <ClassFeaturesAndFeats
          {...props}
          key={entry.id}
          inspectionClassId={entry.id}
          inspectionClassOnly={index > 0}
        />
      ))}
      {hasSpellcastingForCharacter(character) ? <SpellCastingForm {...props} /> : null}
    </div>
  );
}
