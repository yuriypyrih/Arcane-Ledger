import { Edit3, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_TEXTAREA_MAX_LENGTH } from "../../../../../constants/inputLimits";
import {
  getWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter,
  setWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { Character } from "../../../../../types";
import ActionButton from "../../../../ActionButton";
import { classResourcePersistOptions } from "./persistOptions";
import styles from "./LifeAndDeathGiftOfProtectorsEditor.module.css";

type LifeAndDeathGiftOfProtectorsEditorProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function LifeAndDeathGiftOfProtectorsEditor({
  character,
  onPersistCharacter
}: LifeAndDeathGiftOfProtectorsEditorProps) {
  const savedText = getWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter(character);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(savedText);

  useEffect(() => {
    if (!isEditing) {
      setDraftText(savedText);
    }
  }, [isEditing, savedText]);

  return (
    <section className={styles.section} aria-label="Gift of the Protectors Book of Shadows">
      <label className={styles.field}>
        <span className={styles.label}>Book of Shadows</span>
        <textarea
          className={styles.textarea}
          value={draftText}
          disabled={!isEditing}
          maxLength={DEFAULT_TEXTAREA_MAX_LENGTH}
          placeholder="Names which Death cannot claim"
          onChange={(event) => setDraftText(event.target.value)}
        />
      </label>

      <div className={styles.actions}>
        {isEditing ? (
          <>
            <ActionButton
              icon={<Save size={16} />}
              fullWidth={false}
              onClick={() => {
                onPersistCharacter(
                  (currentCharacter) =>
                    setWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter(
                      currentCharacter,
                      draftText
                    ),
                  classResourcePersistOptions
                );
                setIsEditing(false);
              }}
            >
              Save
            </ActionButton>
            <ActionButton
              icon={<X size={16} />}
              fullWidth={false}
              onClick={() => {
                setDraftText(savedText);
                setIsEditing(false);
              }}
            >
              Cancel
            </ActionButton>
          </>
        ) : (
          <ActionButton
            icon={<Edit3 size={16} />}
            fullWidth={false}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </ActionButton>
        )}
      </div>
    </section>
  );
}

export default LifeAndDeathGiftOfProtectorsEditor;
