import clsx from "clsx";
import { User } from "lucide-react";
import { useState } from "react";
import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getSelectedSubclassForCharacter } from "../../../../pages/CharactersPage/subclasses";
import {
  getBodySizeLabelForCharacter,
  getSpeciesChoiceSummaryItemsForCharacter
} from "../../../../pages/CharactersPage/species";
import { getClassSignatureStyle } from "../../classSignature";
import CharacterProgressModal from "./CharacterProgressModal";
import styles from "./CharacterProfileForm.module.css";
import InlineToggleButton from "../InlineToggleButton";
import {
  createBroadProfileCoreStatRows,
  createProfileCoreStatRows
} from "../StatsForm/coreStatModel";
import { useCoreStatReferenceDrawer } from "../StatsForm/useCoreStatReferenceDrawer";
import CoreStatCards from "../StatsForm/CoreStatCards";

type CharacterProfileFormProps = {
  broadLayout?: boolean;
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function CharacterProfileForm({
  broadLayout = false,
  character,
  className,
  onPersistCharacter
}: CharacterProfileFormProps) {
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const selectedSubclass = getSelectedSubclassForCharacter(character);
  const profileCoreStatRows = broadLayout
    ? createBroadProfileCoreStatRows(character)
    : createProfileCoreStatRows(character);
  const { coreStatReferenceDrawer, openCoreStatReference } = useCoreStatReferenceDrawer(
    character,
    onPersistCharacter
  );
  const speciesChoiceSummaryItems = getSpeciesChoiceSummaryItemsForCharacter(character);
  const lineageSummaryItem =
    speciesChoiceSummaryItems.find(
      (item) =>
        item.value !== "Not selected" &&
        (item.label === "Elven Lineage" ||
          item.label === "Gnomish Lineage" ||
          item.label === "Draconic Ancestry" ||
          item.label === "Giant Ancestry" ||
          item.label === "Fiendish Legacy")
    ) ?? null;
  const speciesWithLineage = lineageSummaryItem?.value
    ? `${character.species} (${lineageSummaryItem.value})`
    : character.species;
  const speciesLine = [speciesWithLineage, getBodySizeLabelForCharacter(character)]
    .filter(Boolean)
    .join(" · ");
  const classLine = selectedSubclass?.name
    ? `${character.className} (${selectedSubclass.name})`
    : character.className;
  const originLine = [character.background, character.alignment].filter(Boolean).join(" · ");

  function openProgressModal() {
    setIsProgressModalOpen(true);
  }

  function closeProgressModal() {
    setIsProgressModalOpen(false);
  }

  return (
    <>
      <article
        className={clsx(styles.profileCard, broadLayout && styles.profileCardBroad, className)}
        style={getClassSignatureStyle(character.className)}
      >
        <div className={clsx(styles.profileShell, broadLayout && styles.profileShellBroad)}>
          <div className={styles.portraitFrame} aria-label="Character portrait placeholder">
            <User size={42} strokeWidth={1.8} aria-hidden="true" />
          </div>

          <div className={styles.identityBlock}>
            <div className={styles.nameStack}>
              <h2 className={styles.characterName}>{character.name}</h2>
              <button type="button" className={styles.levelButton} onClick={openProgressModal}>
                Level {character.level}
              </button>
            </div>
            <div className={styles.identityRows}>
              <p>{speciesLine}</p>
              <p>{classLine}</p>
              <p>{originLine}</p>
            </div>
            <InlineToggleButton
              className={styles.notesToggle}
              label={isNotesVisible ? "Hide Character Notes" : "Show Character Notes"}
              expanded={isNotesVisible}
              onClick={() => setIsNotesVisible((current) => !current)}
            />
          </div>

          <aside
            className={clsx(styles.profileSummary, broadLayout && styles.profileSummaryBroad)}
            aria-label="Character quick stats"
          >
            <CoreStatCards rows={profileCoreStatRows} onOpenCard={openCoreStatReference} />
          </aside>
        </div>

        {isNotesVisible ? (
          <div className={styles.notesPanel}>
            <p className={styles.notesRow}>
              <span>Character Notes</span>
              <strong>{character.backgroundNotes || "-"}</strong>
            </p>
          </div>
        ) : null}
      </article>
      {isProgressModalOpen ? (
        <CharacterProgressModal
          character={character}
          onClose={closeProgressModal}
          onPersistCharacter={onPersistCharacter}
        />
      ) : null}
      {coreStatReferenceDrawer}
    </>
  );
}

export default CharacterProfileForm;
