import { useMemo, useState } from "react";
import { speciesOptions } from "../../../../pages/CharactersPage/constants";
import {
  formatBodySize,
  formatDragonbornDraconicAncestryOptionLabel,
  formatElfLineageOptionLabel,
  formatGenasiLineageOptionLabel,
  formatGoliathGiantAncestryOptionLabel,
  formatGnomeLineageOptionLabel,
  formatHumanOriginFeatOptionLabel,
  formatTieflingFiendishLegacyOptionLabel,
  getChangelingSkillProficiencyOptionsForSpecies,
  getDragonbornDraconicAncestryOptionsForSpecies,
  getElfLineageOptionsForSpecies,
  getElfSkillProficiencyOptionsForSpecies,
  getElfSpellcastingAbilityOptionsForSpecies,
  getGenasiLineageOptionsForSpecies,
  getGenasiSpellcastingAbilityOptionsForSpecies,
  getGoliathGiantAncestryOptionsForSpecies,
  getGnomeLineageOptionsForSpecies,
  getGnomeSpellcastingAbilityOptionsForSpecies,
  getHexbloodSpellcastingAbilityOptionsForSpecies,
  getHumanOriginFeatOptionsForSpecies,
  getHumanSkillOptionsForSpecies,
  getKalashtarSkillProficiencyOptionsForSpecies,
  createKhoravarSkillProficiencyChoiceValue,
  createKhoravarToolProficiencyChoiceValue,
  getKhoravarCantripForCharacter,
  getKhoravarCantripOptionsForSpecies,
  getKhoravarProficiencyChoiceValueForCharacter,
  getKhoravarSkillProficiencyOptionsForSpecies,
  getKhoravarSpellcastingAbilityOptionsForSpecies,
  getKhoravarToolProficiencyOptionsForSpecies,
  getLupinSkillProficiencyOptionsForSpecies,
  parseKhoravarProficiencyChoiceValue,
  getRebornResistanceOptionsForSpecies,
  getRebornSkillProficiencyOptionsForSpecies,
  getShifterSkillProficiencyOptionsForSpecies,
  getSpeciesBodySizeOptions,
  getWarforgedSkillProficiencyOptionsForSpecies,
  getWarforgedToolProficiencyOptionsForSpecies,
  getTieflingFiendishLegacyOptionsForSpecies,
  getTieflingSpellcastingAbilityOptionsForSpecies,
  normalizeCharacterSpeciesChoices
} from "../../../../pages/CharactersPage/species";
import type {
  Character,
  CharacterChangelingSkillProficiency,
  CharacterCustomSpeciesConfig,
  CharacterSpeciesChoices
} from "../../../../types";
import {
  CUSTOM_SPECIES_NAME,
  CUSTOM_SPECIES_NAME_MAX_LENGTH,
  CUSTOM_SPECIES_SPEED_MAXIMUM,
  CUSTOM_SPECIES_SPEED_MINIMUM,
  createDefaultCustomSpeciesConfig,
  customSpeciesSizeOptions,
  isCustomSpeciesName,
  normalizeCustomSpeciesConfig,
  normalizeCustomSpeciesSpeed
} from "../../../../pages/CharactersPage/customOrigins";
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
import NumberInput from "../../FormInputs/NumberInput";
import SelectInput from "../../FormInputs/SelectInput";
import TextInput from "../../FormInputs/TextInput";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./FeatEditorModal.module.css";
import {
  buildSkillSelectOptions,
  buildToolSelectOptions,
  getSourceChoiceSkillOptions,
  getSourceChoiceToolOptions,
  updateSelectionAtIndex
} from "./helpers";

type SpeciesEditorModalProps = {
  character: Character;
  onCancel: () => void;
  onSave: (
    species: string,
    speciesChoices?: CharacterSpeciesChoices,
    customSpecies?: CharacterCustomSpeciesConfig
  ) => void;
};

function formatDamageTypeChoiceLabel(damageType: string): string {
  return damageType
    .toLowerCase()
    .replace(/(^|\s|-)\S/g, (match) => match.toUpperCase());
}

function SpeciesEditorModal({ character, onCancel, onSave }: SpeciesEditorModalProps) {
  const [draftSpecies, setDraftSpecies] = useState(character.species);
  const [draftChoices, setDraftChoices] = useState<CharacterSpeciesChoices | undefined>(() =>
    normalizeCharacterSpeciesChoices(character.species, character.speciesChoices)
  );
  const [draftCustomSpecies, setDraftCustomSpecies] = useState<CharacterCustomSpeciesConfig>(() =>
    isCustomSpeciesName(character.species)
      ? (normalizeCustomSpeciesConfig(character.customSpecies) ??
        createDefaultCustomSpeciesConfig())
      : createDefaultCustomSpeciesConfig()
  );
  const isDraftCustomSpecies = isCustomSpeciesName(draftSpecies);
  const normalizedCustomSpecies = normalizeCustomSpeciesConfig(draftCustomSpecies);
  const normalizedChoices = useMemo(
    () => normalizeCharacterSpeciesChoices(draftSpecies, draftChoices),
    [draftChoices, draftSpecies]
  );
  const bodySizeOptions = getSpeciesBodySizeOptions(draftSpecies);
  const changelingSkillProficiencyOptions =
    getChangelingSkillProficiencyOptionsForSpecies(draftSpecies);
  const draconicAncestryOptions = getDragonbornDraconicAncestryOptionsForSpecies(draftSpecies);
  const elfLineageOptions = getElfLineageOptionsForSpecies(draftSpecies);
  const elfSkillProficiencyOptions = getElfSkillProficiencyOptionsForSpecies(draftSpecies);
  const elfSpellcastingAbilityOptions = getElfSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const genasiLineageOptions = getGenasiLineageOptionsForSpecies(draftSpecies);
  const genasiSpellcastingAbilityOptions =
    getGenasiSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const gnomeLineageOptions = getGnomeLineageOptionsForSpecies(draftSpecies);
  const gnomeSpellcastingAbilityOptions =
    getGnomeSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const giantAncestryOptions = getGoliathGiantAncestryOptionsForSpecies(draftSpecies);
  const hexbloodSpellcastingAbilityOptions =
    getHexbloodSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const humanSkillProficiencyOptions = getHumanSkillOptionsForSpecies(draftSpecies);
  const humanOriginFeatOptions = getHumanOriginFeatOptionsForSpecies(draftSpecies);
  const kalashtarSkillProficiencyOptions =
    getKalashtarSkillProficiencyOptionsForSpecies(draftSpecies);
  const khoravarCantripOptions = getKhoravarCantripOptionsForSpecies(draftSpecies);
  const khoravarSkillProficiencyOptions =
    getKhoravarSkillProficiencyOptionsForSpecies(draftSpecies);
  const khoravarSpellcastingAbilityOptions =
    getKhoravarSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const khoravarToolProficiencyOptions =
    getKhoravarToolProficiencyOptionsForSpecies(draftSpecies);
  const lupinSkillProficiencyOptions = getLupinSkillProficiencyOptionsForSpecies(draftSpecies);
  const rebornResistanceOptions = getRebornResistanceOptionsForSpecies(draftSpecies);
  const rebornSkillProficiencyOptions = getRebornSkillProficiencyOptionsForSpecies(draftSpecies);
  const shifterSkillProficiencyOptions = getShifterSkillProficiencyOptionsForSpecies(draftSpecies);
  const warforgedSkillProficiencyOptions =
    getWarforgedSkillProficiencyOptionsForSpecies(draftSpecies);
  const warforgedToolProficiencyOptions =
    getWarforgedToolProficiencyOptionsForSpecies(draftSpecies);
  const tieflingLegacyOptions = getTieflingFiendishLegacyOptionsForSpecies(draftSpecies);
  const tieflingSpellcastingAbilityOptions =
    getTieflingSpellcastingAbilityOptionsForSpecies(draftSpecies);
  const selectedElfSkillProficiency = normalizedChoices?.elvenSkillProficiency ?? null;
  const availableElfSkillProficiencyOptions = getSourceChoiceSkillOptions(
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
  const availableHumanSkillProficiencyOptions = getSourceChoiceSkillOptions(
    character,
    humanSkillProficiencyOptions,
    selectedHumanSkillProficiency
  );
  const humanSkillSelectOptions = buildSkillSelectOptions(
    humanSkillProficiencyOptions,
    availableHumanSkillProficiencyOptions,
    selectedHumanSkillProficiency
  );
  const selectedKalashtarSkillProficiency = normalizedChoices?.kalashtarSkillProficiency ?? null;
  const selectedKhoravarCantrip = getKhoravarCantripForCharacter({
    species: draftSpecies,
    speciesChoices: normalizedChoices
  });
  const selectedKhoravarProficiencyChoiceValue =
    getKhoravarProficiencyChoiceValueForCharacter({
      species: draftSpecies,
      speciesChoices: normalizedChoices
    });
  const selectedKhoravarSkillProficiency =
    normalizedChoices?.khoravarSkillProficiency ?? null;
  const selectedKhoravarToolProficiency =
    normalizedChoices?.khoravarToolProficiency ?? null;
  const availableKhoravarSkillProficiencyOptions = getSourceChoiceSkillOptions(
    character,
    khoravarSkillProficiencyOptions,
    selectedKhoravarSkillProficiency
  );
  const khoravarSkillSelectOptions = buildSkillSelectOptions(
    khoravarSkillProficiencyOptions,
    availableKhoravarSkillProficiencyOptions,
    selectedKhoravarSkillProficiency
  );
  const availableKhoravarToolProficiencyOptions = getSourceChoiceToolOptions(
    character,
    khoravarToolProficiencyOptions,
    selectedKhoravarToolProficiency
  );
  const khoravarToolSelectOptions = buildToolSelectOptions(
    khoravarToolProficiencyOptions,
    availableKhoravarToolProficiencyOptions,
    selectedKhoravarToolProficiency
  );
  const selectedLupinSkillProficiency = normalizedChoices?.lupinSkillProficiency ?? null;
  const selectedRebornResistance = normalizedChoices?.rebornResistance ?? null;
  const selectedRebornSkillProficiency = normalizedChoices?.rebornSkillProficiency ?? null;
  const selectedShifterSkillProficiency = normalizedChoices?.shifterSkillProficiency ?? null;
  const selectedWarforgedSkillProficiency =
    normalizedChoices?.warforgedSkillProficiency ?? null;
  const selectedWarforgedToolProficiency =
    normalizedChoices?.warforgedToolProficiency ?? null;
  const availableRebornSkillProficiencyOptions = getSourceChoiceSkillOptions(
    character,
    rebornSkillProficiencyOptions,
    selectedRebornSkillProficiency
  );
  const rebornSkillSelectOptions = buildSkillSelectOptions(
    rebornSkillProficiencyOptions,
    availableRebornSkillProficiencyOptions,
    selectedRebornSkillProficiency
  );
  const availableWarforgedSkillProficiencyOptions = getSourceChoiceSkillOptions(
    character,
    warforgedSkillProficiencyOptions,
    selectedWarforgedSkillProficiency
  );
  const warforgedSkillSelectOptions = buildSkillSelectOptions(
    warforgedSkillProficiencyOptions,
    availableWarforgedSkillProficiencyOptions,
    selectedWarforgedSkillProficiency
  );
  const availableWarforgedToolProficiencyOptions = getSourceChoiceToolOptions(
    character,
    warforgedToolProficiencyOptions,
    selectedWarforgedToolProficiency
  );
  const warforgedToolSelectOptions = buildToolSelectOptions(
    warforgedToolProficiencyOptions,
    availableWarforgedToolProficiencyOptions,
    selectedWarforgedToolProficiency
  );
  const selectedChangelingSkillProficiencies =
    normalizedChoices?.changelingSkillProficiencies ?? [];
  const changelingSkillSelectOptions = [0, 1].map((slotIndex) => {
    const selectedSkill = selectedChangelingSkillProficiencies[slotIndex] ?? null;

    return buildSkillSelectOptions(
      changelingSkillProficiencyOptions,
      changelingSkillProficiencyOptions,
      selectedSkill
    );
  });
  const requiresBodySize = bodySizeOptions.length > 1;
  const requiresChangelingSkillProficiencies = changelingSkillProficiencyOptions.length > 0;
  const isReady = isDraftCustomSpecies
    ? Boolean(normalizedCustomSpecies?.name.trim())
    : draftSpecies.trim().length > 0 &&
      (!requiresBodySize || Boolean(normalizedChoices?.bodySize)) &&
      (!requiresChangelingSkillProficiencies ||
        selectedChangelingSkillProficiencies.length === 2) &&
      (draconicAncestryOptions.length === 0 || Boolean(normalizedChoices?.draconicAncestry)) &&
      (elfLineageOptions.length === 0 || Boolean(normalizedChoices?.elvenLineage)) &&
      (elfSkillProficiencyOptions.length === 0 ||
        Boolean(normalizedChoices?.elvenSkillProficiency)) &&
      (elfSpellcastingAbilityOptions.length === 0 ||
        Boolean(normalizedChoices?.elvenSpellcastingAbility)) &&
      (genasiLineageOptions.length === 0 || Boolean(normalizedChoices?.genasiLineage)) &&
      (genasiSpellcastingAbilityOptions.length === 0 ||
        Boolean(normalizedChoices?.genasiSpellcastingAbility)) &&
      (gnomeLineageOptions.length === 0 || Boolean(normalizedChoices?.gnomeLineage)) &&
      (gnomeSpellcastingAbilityOptions.length === 0 ||
        Boolean(normalizedChoices?.gnomeSpellcastingAbility)) &&
      (giantAncestryOptions.length === 0 || Boolean(normalizedChoices?.giantAncestry)) &&
      (hexbloodSpellcastingAbilityOptions.length === 0 ||
        Boolean(normalizedChoices?.hexbloodSpellcastingAbility)) &&
      (humanSkillProficiencyOptions.length === 0 ||
        Boolean(normalizedChoices?.humanSkillProficiency)) &&
      (humanOriginFeatOptions.length === 0 || Boolean(normalizedChoices?.humanOriginFeat)) &&
      (kalashtarSkillProficiencyOptions.length === 0 ||
        Boolean(normalizedChoices?.kalashtarSkillProficiency)) &&
      ((khoravarSkillProficiencyOptions.length === 0 &&
        khoravarToolProficiencyOptions.length === 0) ||
        Boolean(selectedKhoravarProficiencyChoiceValue)) &&
      (khoravarCantripOptions.length === 0 || Boolean(selectedKhoravarCantrip)) &&
      (khoravarSpellcastingAbilityOptions.length === 0 ||
        Boolean(normalizedChoices?.khoravarSpellcastingAbility)) &&
      (lupinSkillProficiencyOptions.length === 0 ||
        Boolean(normalizedChoices?.lupinSkillProficiency)) &&
      (rebornResistanceOptions.length === 0 || Boolean(normalizedChoices?.rebornResistance)) &&
      (rebornSkillProficiencyOptions.length === 0 ||
        Boolean(normalizedChoices?.rebornSkillProficiency)) &&
      (shifterSkillProficiencyOptions.length === 0 ||
        Boolean(normalizedChoices?.shifterSkillProficiency)) &&
      (warforgedSkillProficiencyOptions.length === 0 ||
        Boolean(normalizedChoices?.warforgedSkillProficiency)) &&
      (warforgedToolProficiencyOptions.length === 0 ||
        Boolean(normalizedChoices?.warforgedToolProficiency)) &&
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

    onSave(
      draftSpecies.trim(),
      normalizeCharacterSpeciesChoices(draftSpecies, draftChoices),
      isDraftCustomSpecies ? normalizedCustomSpecies : undefined
    );
  }

  return (
    <SheetModal
      titleId="character-species-editor-title"
      onClose={onCancel}
      size="small"
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
              compact
              value={draftSpecies}
              onChange={(event) => {
                setDraftSpecies(event.target.value);
                setDraftChoices(undefined);
                if (isCustomSpeciesName(event.target.value)) {
                  setDraftCustomSpecies(
                    normalizeCustomSpeciesConfig(draftCustomSpecies) ??
                      createDefaultCustomSpeciesConfig()
                  );
                }
              }}
            >
              <option value="">Select a species</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
              <option disabled value="__custom-species-divider">
                ──────────
              </option>
              <option value={CUSTOM_SPECIES_NAME}>{CUSTOM_SPECIES_NAME}</option>
            </SelectInput>
          </label>

          {isDraftCustomSpecies ? (
            <>
              <label className={styles.field}>
                Custom species name
                <TextInput
                  value={draftCustomSpecies.name}
                  maxLength={CUSTOM_SPECIES_NAME_MAX_LENGTH}
                  onChange={(event) =>
                    setDraftCustomSpecies((current) => ({
                      ...current,
                      name: event.target.value.slice(0, CUSTOM_SPECIES_NAME_MAX_LENGTH)
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                Speed
                <NumberInput
                  value={draftCustomSpecies.speed}
                  min={CUSTOM_SPECIES_SPEED_MINIMUM}
                  max={CUSTOM_SPECIES_SPEED_MAXIMUM}
                  onChange={(event) =>
                    setDraftCustomSpecies((current) => ({
                      ...current,
                      speed: normalizeCustomSpeciesSpeed(event.target.value)
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                Size
                <SelectInput
                  compact
                  value={draftCustomSpecies.size}
                  onChange={(event) =>
                    setDraftCustomSpecies((current) => ({
                      ...current,
                      size: event.target.value as CharacterCustomSpeciesConfig["size"]
                    }))
                  }
                >
                  {customSpeciesSizeOptions.map((bodySize) => (
                    <option key={bodySize} value={bodySize}>
                      {formatBodySize(bodySize)}
                    </option>
                  ))}
                </SelectInput>
              </label>
            </>
          ) : null}

          {bodySizeOptions.length > 0 ? (
            <label className={styles.field}>
              Size
              <SelectInput
                compact
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

          {changelingSkillProficiencyOptions.length > 0
            ? [0, 1].map((slotIndex) => (
                <label key={slotIndex} className={styles.field}>
                  {`Changeling Instincts Skill ${slotIndex + 1}`}
                  <SelectInput
                    compact
                    value={selectedChangelingSkillProficiencies[slotIndex] ?? ""}
                    onChange={(event) => {
                      const nextSkills = updateSelectionAtIndex(
                        selectedChangelingSkillProficiencies,
                        2,
                        slotIndex,
                        event.target.value
                      ).filter((skill): skill is CharacterChangelingSkillProficiency =>
                        changelingSkillProficiencyOptions.includes(
                          skill as CharacterChangelingSkillProficiency
                        )
                      );

                      updateChoices({
                        ...(draftChoices ?? {}),
                        changelingSkillProficiencies: nextSkills
                      });
                    }}
                  >
                    <option value="">-</option>
                    {changelingSkillSelectOptions[slotIndex]?.map((option) => (
                      <option key={option.skill} value={option.skill} disabled={option.disabled}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </label>
              ))
            : null}

          {draconicAncestryOptions.length > 0 ? (
            <label className={styles.field}>
              Draconic Ancestry
              <SelectInput
                compact
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
                compact
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
                compact
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
                compact
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

          {genasiLineageOptions.length > 0 ? (
            <label className={styles.field}>
              Genasi Lineage
              <SelectInput
                compact
                value={normalizedChoices?.genasiLineage ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    genasiLineage:
                      (event.target.value as CharacterSpeciesChoices["genasiLineage"]) || undefined
                  })
                }
              >
                <option value="">-</option>
                {genasiLineageOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {formatGenasiLineageOptionLabel(option)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {genasiSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              Genasi Spellcasting Ability
              <SelectInput
                compact
                value={normalizedChoices?.genasiSpellcastingAbility ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    genasiSpellcastingAbility:
                      (event.target
                        .value as CharacterSpeciesChoices["genasiSpellcastingAbility"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {genasiSpellcastingAbilityOptions.map((ability) => (
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
                compact
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
                compact
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

          {hexbloodSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              Hex Magic Spellcasting Ability
              <SelectInput
                compact
                value={normalizedChoices?.hexbloodSpellcastingAbility ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    hexbloodSpellcastingAbility:
                      (event.target
                        .value as CharacterSpeciesChoices["hexbloodSpellcastingAbility"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {hexbloodSpellcastingAbilityOptions.map((ability) => (
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
                compact
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
                compact
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

          {kalashtarSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Severed from Dreams Proficiency
              <SelectInput
                compact
                value={selectedKalashtarSkillProficiency ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    kalashtarSkillProficiency:
                      (event.target
                        .value as CharacterSpeciesChoices["kalashtarSkillProficiency"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {kalashtarSkillProficiencyOptions.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {khoravarSkillProficiencyOptions.length > 0 ||
          khoravarToolProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Skill Versatility Proficiency
              <SelectInput
                compact
                value={selectedKhoravarProficiencyChoiceValue}
                onChange={(event) => {
                  const nextProficiencyChoice = parseKhoravarProficiencyChoiceValue(
                    event.target.value
                  );

                  updateChoices({
                    ...(draftChoices ?? {}),
                    khoravarSkillProficiency:
                      nextProficiencyChoice.khoravarSkillProficiency,
                    khoravarToolProficiency: nextProficiencyChoice.khoravarToolProficiency
                  });
                }}
              >
                <option value="">-</option>
                {khoravarSkillSelectOptions.length > 0 ? (
                  <optgroup label="Skills">
                    {khoravarSkillSelectOptions.map((option) => (
                      <option
                        key={option.skill}
                        value={createKhoravarSkillProficiencyChoiceValue(option.skill)}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {khoravarToolSelectOptions.length > 0 ? (
                  <optgroup label="Tools">
                    {khoravarToolSelectOptions.map((option) => (
                      <option
                        key={option.tool}
                        value={createKhoravarToolProficiencyChoiceValue(option.tool)}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </SelectInput>
            </label>
          ) : null}

          {khoravarCantripOptions.length > 0 ? (
            <label className={styles.field}>
              Fey Gift Cantrip
              <SelectInput
                compact
                value={selectedKhoravarCantrip?.id ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    khoravarCantripId: event.target.value || undefined
                  })
                }
              >
                <option value="">-</option>
                {khoravarCantripOptions.map((spell) => (
                  <option key={spell.id} value={spell.id}>
                    {spell.name}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {khoravarSpellcastingAbilityOptions.length > 0 ? (
            <label className={styles.field}>
              Fey Gift Spellcasting Ability
              <SelectInput
                compact
                value={normalizedChoices?.khoravarSpellcastingAbility ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    khoravarSpellcastingAbility:
                      (event.target
                        .value as CharacterSpeciesChoices["khoravarSpellcastingAbility"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {khoravarSpellcastingAbilityOptions.map((ability) => (
                  <option key={ability} value={ability}>
                    {ability}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {lupinSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Werewolf Instincts Proficiency
              <SelectInput
                compact
                value={selectedLupinSkillProficiency ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    lupinSkillProficiency:
                      (event.target.value as CharacterSpeciesChoices["lupinSkillProficiency"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {lupinSkillProficiencyOptions.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {rebornSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Knowledge from a Past Life Proficiency
              <SelectInput
                compact
                value={selectedRebornSkillProficiency ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    rebornSkillProficiency:
                      (event.target.value as CharacterSpeciesChoices["rebornSkillProficiency"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {rebornSkillSelectOptions.map((option) => (
                  <option key={option.skill} value={option.skill} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {rebornResistanceOptions.length > 0 ? (
            <label className={styles.field}>
              Strange Endurance Resistance
              <SelectInput
                compact
                value={selectedRebornResistance ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    rebornResistance:
                      (event.target.value as CharacterSpeciesChoices["rebornResistance"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {rebornResistanceOptions.map((damageType) => (
                  <option key={damageType} value={damageType}>
                    {formatDamageTypeChoiceLabel(damageType)}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {shifterSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Bestial Instincts Proficiency
              <SelectInput
                compact
                value={selectedShifterSkillProficiency ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    shifterSkillProficiency:
                      (event.target.value as CharacterSpeciesChoices["shifterSkillProficiency"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {shifterSkillProficiencyOptions.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {warforgedSkillProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Specialized Design Skill
              <SelectInput
                compact
                value={selectedWarforgedSkillProficiency ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    warforgedSkillProficiency:
                      (event.target
                        .value as CharacterSpeciesChoices["warforgedSkillProficiency"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {warforgedSkillSelectOptions.map((option) => (
                  <option key={option.skill} value={option.skill} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}

          {warforgedToolProficiencyOptions.length > 0 ? (
            <label className={styles.field}>
              Specialized Design Tool
              <SelectInput
                compact
                value={selectedWarforgedToolProficiency ?? ""}
                onChange={(event) =>
                  updateChoices({
                    ...(draftChoices ?? {}),
                    warforgedToolProficiency:
                      (event.target
                        .value as CharacterSpeciesChoices["warforgedToolProficiency"]) ||
                      undefined
                  })
                }
              >
                <option value="">-</option>
                {warforgedToolSelectOptions.map((option) => (
                  <option key={option.tool} value={option.tool} disabled={option.disabled}>
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
                compact
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
                compact
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
                compact
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

      <OverlayFooter className={styles.modalFooter}>
        <ActionButton variant="OUTLINE" onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton onClick={saveSpecies} disabled={!isReady}>
          Save
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default SpeciesEditorModal;
