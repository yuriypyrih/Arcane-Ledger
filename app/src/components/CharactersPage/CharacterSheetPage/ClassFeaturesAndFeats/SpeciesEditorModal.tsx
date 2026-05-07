import { useMemo, useState } from "react";
import { speciesOptions } from "../../../../pages/CharactersPage/constants";
import {
  formatBodySize,
  formatDragonbornDraconicAncestryOptionLabel,
  formatElfLineageOptionLabel,
  formatGoliathGiantAncestryOptionLabel,
  formatGnomeLineageOptionLabel,
  formatHumanOriginFeatOptionLabel,
  formatTieflingFiendishLegacyOptionLabel,
  getDragonbornDraconicAncestryOptionsForSpecies,
  getElfLineageOptionsForSpecies,
  getElfSkillProficiencyOptionsForSpecies,
  getElfSpellcastingAbilityOptionsForSpecies,
  getGoliathGiantAncestryOptionsForSpecies,
  getGnomeLineageOptionsForSpecies,
  getGnomeSpellcastingAbilityOptionsForSpecies,
  getHumanOriginFeatOptionsForSpecies,
  getHumanSkillOptionsForSpecies,
  getSpeciesBodySizeOptions,
  getTieflingFiendishLegacyOptionsForSpecies,
  getTieflingSpellcastingAbilityOptionsForSpecies,
  normalizeCharacterSpeciesChoices
} from "../../../../pages/CharactersPage/species";
import type { Character, CharacterSpeciesChoices } from "../../../../types";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  SheetModal
} from "../../../Overlay";
import ActionButton from "../../../ActionButton";
import SelectInput from "../../FormInputs/SelectInput";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./FeatEditorModal.module.css";
import { buildSkillSelectOptions, getSelectableUnproficientSkillOptions } from "./helpers";

type SpeciesEditorModalProps = {
  character: Character;
  onCancel: () => void;
  onSave: (species: string, speciesChoices?: CharacterSpeciesChoices) => void;
};

function SpeciesEditorModal({ character, onCancel, onSave }: SpeciesEditorModalProps) {
  const [draftSpecies, setDraftSpecies] = useState(character.species);
  const [draftChoices, setDraftChoices] = useState<CharacterSpeciesChoices | undefined>(() =>
    normalizeCharacterSpeciesChoices(character.species, character.speciesChoices)
  );
  const normalizedChoices = useMemo(
    () => normalizeCharacterSpeciesChoices(draftSpecies, draftChoices),
    [draftChoices, draftSpecies]
  );
  const bodySizeOptions = getSpeciesBodySizeOptions(draftSpecies);
  const draconicAncestryOptions = getDragonbornDraconicAncestryOptionsForSpecies(draftSpecies);
  const elfLineageOptions = getElfLineageOptionsForSpecies(draftSpecies);
  const elfSkillProficiencyOptions = getElfSkillProficiencyOptionsForSpecies(draftSpecies);
  const elfSpellcastingAbilityOptions = getElfSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const gnomeLineageOptions = getGnomeLineageOptionsForSpecies(draftSpecies);
  const gnomeSpellcastingAbilityOptions =
    getGnomeSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const giantAncestryOptions = getGoliathGiantAncestryOptionsForSpecies(draftSpecies);
  const humanSkillProficiencyOptions = getHumanSkillOptionsForSpecies(draftSpecies);
  const humanOriginFeatOptions = getHumanOriginFeatOptionsForSpecies(draftSpecies);
  const tieflingLegacyOptions = getTieflingFiendishLegacyOptionsForSpecies(draftSpecies);
  const tieflingSpellcastingAbilityOptions =
    getTieflingSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const selectedElfSkillProficiency = normalizedChoices?.elvenSkillProficiency ?? null;
  const availableElfSkillProficiencyOptions = getSelectableUnproficientSkillOptions(
    character,
    elfSkillProficiencyOptions,
    selectedElfSkillProficiency
  );
  const elfSkillSelectOptions = buildSkillSelectOptions(
    elfSkillProficiencyOptions,
    availableElfSkillProficiencyOptions,
    selectedElfSkillProficiency
  );
  const selectedHumanSkillProficiency = normalizedChoices?.humanSkillProficiency ?? null;
  const availableHumanSkillProficiencyOptions = getSelectableUnproficientSkillOptions(
    character,
    humanSkillProficiencyOptions,
    selectedHumanSkillProficiency
  );
  const humanSkillSelectOptions = buildSkillSelectOptions(
    humanSkillProficiencyOptions,
    availableHumanSkillProficiencyOptions,
    selectedHumanSkillProficiency
  );
  const requiresBodySize = bodySizeOptions.length > 1;
  const isReady =
    draftSpecies.trim().length > 0 &&
    (!requiresBodySize || Boolean(normalizedChoices?.bodySize)) &&
    (draconicAncestryOptions.length === 0 || Boolean(normalizedChoices?.draconicAncestry)) &&
    (elfLineageOptions.length === 0 || Boolean(normalizedChoices?.elvenLineage)) &&
    (elfSkillProficiencyOptions.length === 0 ||
      Boolean(normalizedChoices?.elvenSkillProficiency)) &&
    (elfSpellcastingAbilityOptions.length === 0 ||
      Boolean(normalizedChoices?.elvenSpellcastingAbility)) &&
    (gnomeLineageOptions.length === 0 || Boolean(normalizedChoices?.gnomeLineage)) &&
    (gnomeSpellcastingAbilityOptions.length === 0 ||
      Boolean(normalizedChoices?.gnomeSpellcastingAbility)) &&
    (giantAncestryOptions.length === 0 || Boolean(normalizedChoices?.giantAncestry)) &&
    (humanSkillProficiencyOptions.length === 0 ||
      Boolean(normalizedChoices?.humanSkillProficiency)) &&
    (humanOriginFeatOptions.length === 0 || Boolean(normalizedChoices?.humanOriginFeat)) &&
    (tieflingLegacyOptions.length === 0 || Boolean(normalizedChoices?.tieflingLegacy)) &&
    (tieflingSpellcastingAbilityOptions.length === 0 ||
      Boolean(normalizedChoices?.tieflingSpellcastingAbility));

  function updateChoices(nextChoices: CharacterSpeciesChoices) {
    setDraftChoices(normalizeCharacterSpeciesChoices(draftSpecies, nextChoices));
  }

  function saveSpecies() {
    if (!isReady) {
      return;
    }

    onSave(draftSpecies.trim(), normalizeCharacterSpeciesChoices(draftSpecies, draftChoices));
  }

  return (
    <SheetModal
      titleId="character-species-editor-title"
      onClose={onCancel}
      panelClassName={styles.modalPanel}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Build</OverlayEyebrow>
          <div className={styles.heading}>
            <h3 id="character-species-editor-title" className={styles.headingTitle}>
              Edit Species
            </h3>
            <OverlaySummary className={shared.helperText}>
              Choose the character species and complete any species-specific selections.
            </OverlaySummary>
          </div>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close species editor" onClick={onCancel} />
      </OverlayHeader>

      <OverlayBody className={styles.scrollArea}>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            Species
            <SelectInput
              className={styles.select}
              value={draftSpecies}
              onChange={(event) => {
                setDraftSpecies(event.target.value);
                setDraftChoices(undefined);
              }}
            >
              <option value="">Select a species</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </SelectInput>
          </label>

          {bodySizeOptions.length > 0 ? (
            <label className={styles.field}>
              Size
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.bodySize ?? ""}
                disabled={bodySizeOptions.length === 1}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    bodySize: event.target.value as CharacterSpeciesChoices["bodySize"]
                  })
                }
              >
                {bodySizeOptions.length > 1 ? <option value="">-</option> : null}
                {bodySizeOptions.map((bodySize) => (
                  <option key={bodySize} value={bodySize}>
                    {formatBodySize(bodySize)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {draconicAncestryOptions.length > 0 ? (
            <label className={styles.field}>
              Draconic Ancestry
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.draconicAncestry ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    draconicAncestry:
                      (event.target.value as CharacterSpeciesChoices["draconicAncestry"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {draconicAncestryOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatDragonbornDraconicAncestryOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {elfLineageOptions.length > 0 ? (
            <label className={styles.field}>
              Elven Lineage
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.elvenLineage ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    elvenLineage:
                      (event.target.value as CharacterSpeciesChoices["elvenLineage"]) || undefined
                  })
                }
              >
                <option value="">-</option>
                {elfLineageOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatElfLineageOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {elfSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Keen Senses Proficiency
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.elvenSkillProficiency ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    elvenSkillProficiency:
                      (event.target.value as CharacterSpeciesChoices["elvenSkillProficiency"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {elfSkillSelectOptions.map((option) => (
                  <option key={option.skill} value={option.skill} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {elfSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              Elven Spellcasting Ability
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.elvenSpellcastingAbility ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    elvenSpellcastingAbility:
                      (event.target.value as CharacterSpeciesChoices["elvenSpellcastingAbility"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {elfSpellcastingAbilityOptions.map((ability) => (
                  <option key={ability} value={ability}>
                    {ability}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {gnomeLineageOptions.length > 0 ? (
            <label className={styles.field}>
              Gnomish Lineage
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.gnomeLineage ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    gnomeLineage:
                      (event.target.value as CharacterSpeciesChoices["gnomeLineage"]) || undefined
                  })
                }
              >
                <option value="">-</option>
                {gnomeLineageOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatGnomeLineageOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {gnomeSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              Gnome Spellcasting Ability
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.gnomeSpellcastingAbility ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    gnomeSpellcastingAbility:
                      (event.target.value as CharacterSpeciesChoices["gnomeSpellcastingAbility"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {gnomeSpellcastingAbilityOptions.map((ability) => (
                  <option key={ability} value={ability}>
                    {ability}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {giantAncestryOptions.length > 0 ? (
            <label className={styles.field}>
              Giant Ancestry
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.giantAncestry ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    giantAncestry:
                      (event.target.value as CharacterSpeciesChoices["giantAncestry"]) || undefined
                  })
                }
              >
                <option value="">-</option>
                {giantAncestryOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatGoliathGiantAncestryOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {humanSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Skillful Proficiency
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.humanSkillProficiency ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    humanSkillProficiency:
                      (event.target.value as CharacterSpeciesChoices["humanSkillProficiency"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {humanSkillSelectOptions.map((option) => (
                  <option key={option.skill} value={option.skill} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {humanOriginFeatOptions.length > 0 ? (
            <label className={styles.field}>
              Origin Feat
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.humanOriginFeat ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    humanOriginFeat:
                      (event.target.value as CharacterSpeciesChoices["humanOriginFeat"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {humanOriginFeatOptions.map((option) => (
                  <option key={option.feat} value={option.feat}>
                    {formatHumanOriginFeatOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {tieflingLegacyOptions.length > 0 ? (
            <label className={styles.field}>
              Fiendish Legacy
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.tieflingLegacy ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    tieflingLegacy:
                      (event.target.value as CharacterSpeciesChoices["tieflingLegacy"]) || undefined
                  })
                }
              >
                <option value="">-</option>
                {tieflingLegacyOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatTieflingFiendishLegacyOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {tieflingSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              Tiefling Spellcasting Ability
              <SelectInput
                className={styles.select}
                value={normalizedChoices?.tieflingSpellcastingAbility ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    tieflingSpellcastingAbility:
                      (event.target
                        .value as CharacterSpeciesChoices["tieflingSpellcastingAbility"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {tieflingSpellcastingAbilityOptions.map((ability) => (
                  <option key={ability} value={ability}>
                    {ability}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}
        </div>

        {!isReady ? (
          <p className={styles.validation}>Complete the required species choices before saving.</p>
        ) : null}
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton variant="GHOST" fullWidth={false} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton fullWidth={false} onClick={saveSpecies} disabled={!isReady}>
          Save
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default SpeciesEditorModal;
