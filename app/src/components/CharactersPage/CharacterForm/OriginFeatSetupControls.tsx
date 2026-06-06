import { useEffect } from "react";
import { FEATS } from "../../../codex/entries";
import {
  LANGUAGE_PROFICIENCY,
  type CharacterFeatEntry,
  type EmeraldEnclaveFledglingChoice,
  type LanguageProficiencyEntry,
  type MagicInitiateChoice,
  type PurpleDragonRookChoice,
  type SkillProficiencyEntry,
  type SpellfireSparkChoice,
  type TOOL_PROFICIENCY
} from "../../../types";
import SelectInput from "../FormInputs/SelectInput";
import {
  getFeatLabel,
  getMagicInitiateCantripOptions,
  emeraldEnclaveFledglingSpellcastingAbilityOptions,
  getMagicInitiateLevelOneSpellOptions,
  getMagicInitiateSpellListLabel,
  magicInitiateSpellcastingAbilityOptions,
  magicInitiateSpellListOptions,
  spellfireSparkSpellcastingAbilityOptions
} from "../../../pages/CharactersPage/feats";
import { purpleDragonRookSkillOptions } from "../../../pages/CharactersPage/feats/purpleDragonRook";
import { getSourceChoiceSkillOptions } from "../../../pages/CharactersPage/proficiency";
import {
  cultOfDragonInitiateDefaultLanguage,
  cultOfDragonInitiateLanguageOptions,
  getCultOfDragonInitiateLanguageLabel,
  getDefaultCultOfDragonInitiateLanguage,
  hasDraconicLanguageFromOtherSource
} from "../../../pages/CharactersPage/feats/cultOfDragonInitiate";
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
  skillProficiencies: SkillProficiencyEntry[];
  languageProficiencies: LanguageProficiencyEntry[];
  lockedMagicInitiateSpellList?: MagicInitiateChoice["spellList"];
  onMagicInitiateChange: (partialChoice: Partial<MagicInitiateChoice>) => void;
  onCultOfDragonInitiateLanguageChange: (language: LANGUAGE_PROFICIENCY) => void;
  onEmeraldEnclaveFledglingChange: (
    partialChoice: Partial<EmeraldEnclaveFledglingChoice>
  ) => void;
  onSpellfireSparkChange: (partialChoice: Partial<SpellfireSparkChoice>) => void;
  onPurpleDragonRookSkillChange: (skill: PurpleDragonRookChoice["skill"]) => void;
  onToolFeatSelection: (
    feat: FEATS.CRAFTER | FEATS.HARPER_AGENT | FEATS.MUSICIAN,
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
  skillProficiencies,
  languageProficiencies,
  lockedMagicInitiateSpellList,
  onMagicInitiateChange,
  onCultOfDragonInitiateLanguageChange,
  onEmeraldEnclaveFledglingChange,
  onSpellfireSparkChange,
  onPurpleDragonRookSkillChange,
  onToolFeatSelection,
  onSkilledSelection
}: OriginFeatSetupControlsProps) {
  useEffect(() => {
    if (feat !== FEATS.CULT_OF_THE_DRAGON_INITIATE || !featEntry?.cultOfDragonInitiate) {
      return;
    }

    const knowsDraconicFromOtherSource = hasDraconicLanguageFromOtherSource(
      languageProficiencies,
      featEntry.id
    );
    const expectedLanguage = getDefaultCultOfDragonInitiateLanguage(knowsDraconicFromOtherSource);

    if (
      (!knowsDraconicFromOtherSource &&
        featEntry.cultOfDragonInitiate.language !== expectedLanguage) ||
      (knowsDraconicFromOtherSource &&
        featEntry.cultOfDragonInitiate.language === cultOfDragonInitiateDefaultLanguage)
    ) {
      onCultOfDragonInitiateLanguageChange(expectedLanguage);
    }
  }, [
    feat,
    featEntry,
    languageProficiencies,
    onCultOfDragonInitiateLanguageChange
  ]);

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

  if (feat === FEATS.CULT_OF_THE_DRAGON_INITIATE && featEntry.cultOfDragonInitiate) {
    const choice = featEntry.cultOfDragonInitiate;
    const knowsDraconicFromOtherSource = hasDraconicLanguageFromOtherSource(
      languageProficiencies,
      featEntry.id
    );
    const isLanguageLocked = !knowsDraconicFromOtherSource;
    const languageOptions = isLanguageLocked
      ? [cultOfDragonInitiateDefaultLanguage]
      : cultOfDragonInitiateLanguageOptions;

    return (
      <div className={styles.classSetupGrid}>
        <label className={styles.field}>
          <span>Language</span>
          <SelectInput
            className={styles.fieldInput}
            value={isLanguageLocked ? cultOfDragonInitiateDefaultLanguage : choice.language}
            disabled={isLanguageLocked}
            onChange={(event) =>
              onCultOfDragonInitiateLanguageChange(event.target.value as LANGUAGE_PROFICIENCY)
            }
          >
            {languageOptions.map((language) => (
              <option
                key={language}
                value={language}
                disabled={
                  knowsDraconicFromOtherSource &&
                  language === cultOfDragonInitiateDefaultLanguage
                }
              >
                {getCultOfDragonInitiateLanguageLabel(language)}
              </option>
            ))}
          </SelectInput>
        </label>
      </div>
    );
  }

  if (feat === FEATS.EMERALD_ENCLAVE_FLEDGLING && featEntry.emeraldEnclaveFledgling) {
    const choice = featEntry.emeraldEnclaveFledgling;

    return (
      <div className={styles.classSetupGrid}>
        <label className={styles.field}>
          <span>Spellcasting ability</span>
          <SelectInput
            className={styles.fieldInput}
            value={choice.spellcastingAbility}
            onChange={(event) =>
              onEmeraldEnclaveFledglingChange({
                spellcastingAbility:
                  event.target.value as EmeraldEnclaveFledglingChoice["spellcastingAbility"]
              })
            }
          >
            {emeraldEnclaveFledglingSpellcastingAbilityOptions.map((ability) => (
              <option key={ability} value={ability}>
                {ability}
              </option>
            ))}
          </SelectInput>
        </label>
      </div>
    );
  }

  if (feat === FEATS.SPELLFIRE_SPARK && featEntry.spellfireSpark) {
    const choice = featEntry.spellfireSpark;

    return (
      <div className={styles.classSetupGrid}>
        <label className={styles.field}>
          <span>Spellcasting ability</span>
          <SelectInput
            className={styles.fieldInput}
            value={choice.spellcastingAbility}
            onChange={(event) =>
              onSpellfireSparkChange({
                spellcastingAbility:
                  event.target.value as SpellfireSparkChoice["spellcastingAbility"]
              })
            }
          >
            {spellfireSparkSpellcastingAbilityOptions.map((ability) => (
              <option key={ability} value={ability}>
                {ability}
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

  if (feat === FEATS.HARPER_AGENT && featEntry.harperAgent) {
    const selectedTool = featEntry.harperAgent.toolProficiency;

    return (
      <div className={styles.classSetupGrid}>
        <label className={styles.field}>
          <span>Instrument</span>
          <SelectInput
            className={styles.fieldInput}
            value={selectedTool}
            onChange={(event) =>
              onToolFeatSelection(
                FEATS.HARPER_AGENT,
                0,
                event.target.value as TOOL_PROFICIENCY
              )
            }
          >
            {musicalInstrumentToolProficiencies.map((tool) => (
              <option key={tool} value={tool}>
                {getToolProficiencyLabel(tool)}
              </option>
            ))}
          </SelectInput>
        </label>
      </div>
    );
  }

  if (feat === FEATS.PURPLE_DRAGON_ROOK && featEntry.purpleDragonRook) {
    const selectedSkill = featEntry.purpleDragonRook.skill;
    const availableSkills = getSourceChoiceSkillOptions(
      { skillProficiencies },
      purpleDragonRookSkillOptions,
      selectedSkill,
      []
    );
    const availableSkillSet = new Set(availableSkills);

    return (
      <div className={styles.classSetupGrid}>
        <label className={styles.field}>
          <span>Skill</span>
          <SelectInput
            className={styles.fieldInput}
            value={selectedSkill}
            onChange={(event) =>
              onPurpleDragonRookSkillChange(
                event.target.value as PurpleDragonRookChoice["skill"]
              )
            }
          >
            {purpleDragonRookSkillOptions.map((skill) => (
              <option
                key={skill}
                value={skill}
                disabled={skill !== selectedSkill && !availableSkillSet.has(skill)}
              >
                {skill}
              </option>
            ))}
          </SelectInput>
        </label>
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
