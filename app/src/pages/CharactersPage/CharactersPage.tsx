import { useState } from "react";
import CharacterList from "../../components/CharactersPage/CharacterList";
import { deleteCharacter, loadCharacters } from "./storage";
import styles from "./CharactersPage.module.css";

function CharactersPage() {
  const [characters, setCharacters] = useState(() => loadCharacters());

  function handleDeleteCharacter(characterId: number) {
    setCharacters(deleteCharacter(characterId));
  }

  return (
    <section className={styles.page}>
      <CharacterList characters={characters} onDeleteCharacter={handleDeleteCharacter} />
    </section>
  );
}

export default CharactersPage;
