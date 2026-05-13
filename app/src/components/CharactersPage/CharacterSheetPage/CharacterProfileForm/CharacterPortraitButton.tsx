import { DefaultCharacterPortraitIcon } from "../../CharacterPortrait";
import styles from "./CharacterProfileForm.module.css";

type CharacterPortraitButtonProps = {
  characterName: string;
  isLoading: boolean;
  onClick: () => void;
  portraitUrl: string | null;
};

function CharacterPortraitButton({
  characterName,
  isLoading,
  onClick,
  portraitUrl
}: CharacterPortraitButtonProps) {
  const resolvedName = characterName.trim() || "character";

  return (
    <button
      type="button"
      className={styles.portraitFrame}
      aria-busy={isLoading || undefined}
      aria-label={`Open portrait for ${resolvedName}`}
      onClick={onClick}
    >
      {portraitUrl ? (
        <img src={portraitUrl} alt={`${resolvedName} portrait`} className={styles.portraitImage} />
      ) : (
        <DefaultCharacterPortraitIcon className={styles.portraitDefaultIcon} />
      )}
    </button>
  );
}

export default CharacterPortraitButton;
