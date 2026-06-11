import type { SpellEntry } from "../../../../../../codex/entries";
import { getSpellLevel } from "../../../../../../pages/CharactersPage/spellcasting";
import {
  paladinOathOfTheNobleGeniesElementalSmiteOptions,
  type PaladinOathOfTheNobleGeniesElementalSmiteOptionKey
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
import SelectInput from "../../../../FormInputs/SelectInput";
import type { ChannelDivinityGuidedFlow } from "../../../channelDivinityUtils";
import styles from "./ChannelDivinityGuidedControls.module.css";

type ChannelDivinityGuidedControlsProps = {
  flow: ChannelDivinityGuidedFlow;
  spellOptions: SpellEntry[];
  selectedSpellId: string | null;
  selectedElementalSmiteOption: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null;
  onSelectedSpellIdChange: (spellId: string | null) => void;
  onSelectedElementalSmiteOptionChange: (
    option: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null
  ) => void;
};

function formatSpellOptionLabel(spell: SpellEntry): string {
  const spellLevel = getSpellLevel(spell);

  return spellLevel > 0 ? `${spell.name} | Level ${spellLevel}` : spell.name;
}

function ChannelDivinityGuidedControls({
  flow,
  spellOptions,
  selectedSpellId,
  selectedElementalSmiteOption,
  onSelectedSpellIdChange,
  onSelectedElementalSmiteOptionChange
}: ChannelDivinityGuidedControlsProps) {
  if (flow === "spell") {
    return (
      <div className={styles.controlPanel}>
        <label className={styles.fieldLabel}>
          <span>Spell</span>
          <SelectInput
            value={selectedSpellId ?? ""}
            onChange={(event) => onSelectedSpellIdChange(event.target.value || null)}
            disabled={spellOptions.length === 0}
          >
            <option value="">-</option>
            {spellOptions.map((spell) => (
              <option key={spell.id} value={spell.id}>
                {formatSpellOptionLabel(spell)}
              </option>
            ))}
          </SelectInput>
        </label>
      </div>
    );
  }

  if (flow === "elemental-smite") {
    return (
      <div className={styles.controlPanel}>
        <label className={styles.fieldLabel}>
          <span>Effect</span>
          <SelectInput
            value={selectedElementalSmiteOption ?? ""}
            onChange={(event) =>
              onSelectedElementalSmiteOptionChange(
                (event.target.value ||
                  null) as PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null
              )
            }
          >
            <option value="">-</option>
            {paladinOathOfTheNobleGeniesElementalSmiteOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
      </div>
    );
  }

  return null;
}

export default ChannelDivinityGuidedControls;
