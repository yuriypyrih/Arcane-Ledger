import { FEATS } from "../../../codex/entries";
import type { CharacterFeatEntry, MagicInitiateChoice, TOOL_PROFICIENCY } from "../../../types";
import SelectInput from "../FormInputs/SelectInput";
import {
  getFeatLabel,
  getMagicInitiateCantripOptions,
  getMagicInitiateLevelOneSpellOptions,
  getMagicInitiateSpellListLabel,
  magicInitiateSpellcastingAbilityOptions,
  magicInitiateSpellListOptions
} from "../../../pages/CharactersPage/feats";
import { crafterFastCraftingToolProficiencies } from "../../../pages/CharactersPage/feats/crafter";
import {
  getToolProficiencyLabel,
  groupedToolProficiencyOptions,
  musicalInstrumentToolProficiencies,
  skillsOptions
} from "../../../pages/CharactersPage/proficiencyOptions";
import styles from "./CharacterForm.module.css";

type OriginFeatSetupControlsProps = {
  feat: FEATS | null;
  featEntry: CharacterFeatEntry | null;
  sourceLabel: string;
  emptyText: string;
  lockedMagicInitiateSpellList?: MagicInitiateChoice["spellList"];
  onMagicInitiateChange: (partialChoice: Partial<MagicInitiateChoice>) => void;
  onToolFeatSelection: (
    feat: FEATS.CRAFTER | FEATS.MUSICIAN,
    index: number,
    tool: TOOL_PROFICIENCY
  ) => void;
  onSkilledSelection: (index: number, value: string) => void;
};

function getDefaultMagicInitiateSpellSelection(
  spellList: MagicInitiateChoice["spellList"]
): Pick<MagicInitiateChoice, "cantripIds" | "levelOneSpellId"> {
  const cantripOptions = getMagicInitiateCantripOptions(spellList);
  const levelOneSpellOptions = getMagicInitiateLevelOneSpellOptions(spellList);
  const firstCantripId = cantripOptions[0]?.id ?? "";
  const secondCantripId =
    cantripOptions.find((spell) => spell.id !== firstCantripId)?.id ?? firstCantripId;

  return {
    cantripIds: [firstCantripId, secondCantripId],
    levelOneSpellId: levelOneSpellOptions[0]?.id ?? ""
  };
}

function OriginFeatSetupControls({
  feat,
  featEntry,
  sourceLabel,
  emptyText,
  lockedMagicInitiateSpellList,
  onMagicInitiateChange,
  onToolFeatSelection,
  onSkilledSelection
}: OriginFeatSetupControlsProps) {
  if (!feat || !featEntry) {
    return <p className={styles.helperText}>{emptyText}</p>;
  }

  if (feat === FEATS.MAGIC_INITIATE && featEntry.magicInitiate) {
    const choice = featEntry.magicInitiate;
    const cantripOptions = getMagicInitiateCantripOptions(choice.spellList);
    const levelOneSpellOptions = getMagicInitiateLevelOneSpellOptions(choice.spellList);
    const isSpellListLocked = Boolean(lockedMagicInitiateSpellList);

    return (
      <div className={styles.classSetupGrid}>
        <label className={styles.field}>
          <span>Spell list</span>
          <SelectInput
            className={styles.fieldInput}
            value={choice.spellList}
            disabled={isSpellListLocked}
            onChange={(event) => {
              const spellList = event.target.value as MagicInitiateChoice["spellList"];

              onMagicInitiateChange({
                spellList,
                ...getDefaultMagicInitiateSpellSelection(spellList)
              });
            }}
          >
            {(isSpellListLocked ? [choice.spellList] : magicInitiateSpellListOptions).map(
              (spellList) => (
                <option key={spellList} value={spellList}>
                  {getMagicInitiateSpellListLabel(spellList)}
                </option>
              )
            )}
          </SelectInput>
        </label>

        <label className={styles.field}>
          <span>Spellcasting ability</span>
          <SelectInput
            className={styles.fieldInput}
            value={choice.spellcastingAbility}
            onChange={(event) =>
              onMagicInitiateChange({
                spellcastingAbility: event.target
                  .value as MagicInitiateChoice["spellcastingAbility"]
              })
            }
          >
            {magicInitiateSpellcastingAbilityOptions.map((ability) => (
              <option key={ability} value={ability}>
                {ability}
              </option>
            ))}
          </SelectInput>
        </label>

        {choice.cantripIds.map((cantripId, index) => (
          <label key={`magic-initiate-cantrip-${index}`} className={styles.field}>
            <span>Cantrip {index + 1}</span>
            <SelectInput
              className={styles.fieldInput}
              value={cantripId}
              onChange={(event) => {
                const cantripIds = [...choice.cantripIds] as MagicInitiateChoice["cantripIds"];
                cantripIds[index] = event.target.value;
                onMagicInitiateChange({ cantripIds });
              }}
            >
              {cantripOptions.map((spell) => (
                <option
                  key={spell.id}
                  value={spell.id}
                  disabled={choice.cantripIds.includes(spell.id) && spell.id !== cantripId}
                >
                  {spell.name}
                </option>
              ))}
            </SelectInput>
          </label>
        ))}

        <label className={styles.field}>
          <span>Level 1 spell</span>
          <SelectInput
            className={styles.fieldInput}
            value={choice.levelOneSpellId}
            onChange={(event) =>
              onMagicInitiateChange({
                levelOneSpellId: event.target.value
              })
            }
          >
            {levelOneSpellOptions.map((spell) => (
              <option key={spell.id} value={spell.id}>
                {spell.name}
              </option>
            ))}
          </SelectInput>
        </label>
      </div>
    );
  }

  if (feat === FEATS.CRAFTER && featEntry.crafter) {
    const selectedTools = featEntry.crafter.toolProficiencies;

    return (
      <div className={styles.classSetupGrid}>
        {selectedTools.map((selectedTool, index) => (
          <label key={`crafter-tool-${index}`} className={styles.field}>
            <span>Crafter tool {index + 1}</span>
            <SelectInput
              className={styles.fieldInput}
              value={selectedTool}
              onChange={(event) =>
                onToolFeatSelection(FEATS.CRAFTER, index, event.target.value as TOOL_PROFICIENCY)
              }
            >
              {crafterFastCraftingToolProficiencies.map((tool) => (
                <option
                  key={tool}
                  value={tool}
                  disabled={selectedTools.includes(tool) && tool !== selectedTool}
                >
                  {getToolProficiencyLabel(tool)}
                </option>
              ))}
            </SelectInput>
          </label>
        ))}
      </div>
    );
  }

  if (feat === FEATS.MUSICIAN && featEntry.musician) {
    const selectedTools = featEntry.musician.toolProficiencies;

    return (
      <div className={styles.classSetupGrid}>
        {selectedTools.map((selectedTool, index) => (
          <label key={`musician-tool-${index}`} className={styles.field}>
            <span>Instrument {index + 1}</span>
            <SelectInput
              className={styles.fieldInput}
              value={selectedTool}
              onChange={(event) =>
                onToolFeatSelection(FEATS.MUSICIAN, index, event.target.value as TOOL_PROFICIENCY)
              }
            >
              {musicalInstrumentToolProficiencies.map((tool) => (
                <option
                  key={tool}
                  value={tool}
                  disabled={selectedTools.includes(tool) && tool !== selectedTool}
                >
                  {getToolProficiencyLabel(tool)}
                </option>
              ))}
            </SelectInput>
          </label>
        ))}
      </div>
    );
  }

  if (feat === FEATS.SKILLED && featEntry.skilled) {
    const selectedValues = featEntry.skilled.selections.map((selection) =>
      selection.kind === "skill" ? `skill:${selection.skill}` : `tool:${selection.tool}`
    );

    return (
      <div className={styles.classSetupGrid}>
        {selectedValues.map((selectedValue, index) => (
          <label key={`skilled-selection-${index}`} className={styles.field}>
            <span>Skilled choice {index + 1}</span>
            <SelectInput
              className={styles.fieldInput}
              value={selectedValue}
              onChange={(event) => onSkilledSelection(index, event.target.value)}
            >
              <optgroup label="Skills">
                {skillsOptions.map((skill) => {
                  const value = `skill:${skill}`;

                  return (
                    <option
                      key={value}
                      value={value}
                      disabled={selectedValues.includes(value) && value !== selectedValue}
                    >
                      {skill}
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Tools">
                {groupedToolProficiencyOptions.map((tool) => {
                  const value = `tool:${tool}`;

                  return (
                    <option
                      key={value}
                      value={value}
                      disabled={selectedValues.includes(value) && value !== selectedValue}
                    >
                      {getToolProficiencyLabel(tool)}
                    </option>
                  );
                })}
              </optgroup>
            </SelectInput>
          </label>
        ))}
      </div>
    );
  }

  return (
    <p className={styles.helperText}>
      {getFeatLabel(feat)} is granted by this {sourceLabel} and has no setup choices.
    </p>
  );
}

export default OriginFeatSetupControls;
