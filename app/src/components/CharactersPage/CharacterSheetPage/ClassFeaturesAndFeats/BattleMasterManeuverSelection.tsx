import clsx from "clsx";
import type { DivinityEntry, SpellEntry } from "../../../../codex/entries";
import {
  fighterBattleMasterManeuverDefinitions,
  type BattleMasterManeuverId
} from "../../../../codex/subclasses/fighterBattleMaster";
import {
  getFighterBattleMasterManeuverSelectionCountForCharacter,
  getFighterBattleMasterManeuverSelectionsForCharacter,
  setFighterBattleMasterManeuverSelectionsForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { Character, CharacterFeatEntry } from "../../../../types";
import { featureDisclosureStyles } from "../../../FeatureDisclosure";
import { renderDescriptionLine } from "./helpers";
import styles from "./ClassFeaturesAndFeats.module.css";

type BattleMasterManeuverSelectionProps = {
  character: Character;
  featureKey: string;
  isUnlocked: boolean;
  onPersistCharacter: PersistCharacterUpdater;
  onOpenKeyword: (keywordKey: string, title?: string) => void;
  onOpenFeatReference: (feat: CharacterFeatEntry["feat"], entry?: CharacterFeatEntry) => void;
  onOpenSpellReference: (spell: SpellEntry) => void;
  onOpenDivinityReference: (divinity: DivinityEntry) => void;
};

function BattleMasterManeuverSelection({
  character,
  featureKey,
  isUnlocked,
  onPersistCharacter,
  onOpenKeyword,
  onOpenFeatReference,
  onOpenSpellReference,
  onOpenDivinityReference
}: BattleMasterManeuverSelectionProps) {
  const selectionCount = getFighterBattleMasterManeuverSelectionCountForCharacter(character);
  const selectedManeuverIds = getFighterBattleMasterManeuverSelectionsForCharacter(character);
  const selectedManeuverIdSet = new Set(selectedManeuverIds);
  const displaySelectionCount = isUnlocked ? selectionCount : 3;
  const isSelectionLimitReached = selectedManeuverIds.length >= selectionCount;

  function toggleManeuverSelection(maneuverId: BattleMasterManeuverId) {
    onPersistCharacter((currentCharacter) => {
      const currentSelections = getFighterBattleMasterManeuverSelectionsForCharacter(currentCharacter);
      const isSelected = currentSelections.includes(maneuverId);
      const nextSelections = isSelected
        ? currentSelections.filter((selection) => selection !== maneuverId)
        : [...currentSelections, maneuverId];

      return setFighterBattleMasterManeuverSelectionsForCharacter(currentCharacter, nextSelections);
    });
  }

  return (
    <div className={styles.featureSelectionGrid}>
      <p className={styles.emptyFeatureText}>
        {`${selectedManeuverIds.length} / ${displaySelectionCount} maneuvers selected`}
      </p>
      {fighterBattleMasterManeuverDefinitions.map((maneuver) => {
        const isSelected = selectedManeuverIdSet.has(maneuver.id);
        const isDisabled = !isUnlocked || (!isSelected && isSelectionLimitReached);

        return (
          <label
            key={`${featureKey}-battle-master-maneuver-${maneuver.id}`}
            className={clsx(
              styles.featureOptionRow,
              isSelected && styles.featureOptionRowActive,
              isDisabled && styles.featureOptionRowDisabled
            )}
          >
            <input
              type="checkbox"
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => toggleManeuverSelection(maneuver.id)}
              className={styles.featureOptionRadio}
            />
            <div className={styles.featureOptionText}>
              <span className={styles.featureOptionTitle}>{maneuver.name}</span>
              <div className={styles.featureOptionDescriptionList}>
                {maneuver.description.map((entry, index) => (
                  <p
                    key={`${featureKey}-${maneuver.id}-description-${index}`}
                    className={featureDisclosureStyles.descriptionLine}
                  >
                    {renderDescriptionLine(
                      entry,
                      onOpenKeyword,
                      (feat) => onOpenFeatReference(feat),
                      onOpenSpellReference,
                      onOpenDivinityReference
                    )}
                  </p>
                ))}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default BattleMasterManeuverSelection;
