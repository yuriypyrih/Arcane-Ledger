import { useState } from "react";
import CharacterList from "../../components/CharactersPage/CharacterList";
import { useAppSelector } from "../../store";
import { getCharacterLimitForAuth } from "./characterLimits";
import { deleteCharacter, loadCharacters } from "./storage";
import styles from "./CharactersPage.module.css";

function CharactersPage() {
  const [characters, setCharacters] = useState(() => loadCharacters());
  const { status, user } = useAppSelector((state) => state.auth);
  const characterLimit = getCharacterLimitForAuth(status, user?.role);

  function handleDeleteCharacter(characterId: number) {
    setCharacters(deleteCharacter(characterId));
  }

  return (
    <section className={styles.page}>
      <CharacterList
        characters={characters}
        characterLimit={characterLimit}
        onDeleteCharacter={handleDeleteCharacter}
      />
    </section>
  );
}

export default CharactersPage;
