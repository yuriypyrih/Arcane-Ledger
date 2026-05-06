import { Edit3, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter,
  setWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import type { Character } from "../../../../../../types";
import ActionButton from "../../../../../ActionButton";
import styles from "./BookOfShadowsActionBody.module.css";

type BookOfShadowsActionBodyProps = {
  character: Character;
  onPersistCharacter: (updater: (currentCharacter: Character) => Character) => void;
};

function BookOfShadowsActionBody({
  character,
  onPersistCharacter
}: BookOfShadowsActionBodyProps) {
  const savedText = getWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter(character);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(savedText);

  useEffect(() => {
    if (!isEditing) {
      setDraftText(savedText);
    }
  }, [isEditing, savedText]);

  return (
    <div className={styles.body}>
      <label className={styles.field}>
        <span className={styles.label}>Book of Shadows</span>
        <textarea
          className={styles.textarea}
          value={draftText}
          disabled={!isEditing}
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
                onPersistCharacter((currentCharacter) =>
                  setWarlockGiftOfTheProtectorsBookOfShadowsTextForCharacter(
                    currentCharacter,
                    draftText
                  )
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
    </div>
  );
}

export default BookOfShadowsActionBody;
