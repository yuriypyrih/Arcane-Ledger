import type { BackgroundEntry } from "../../../codex/entries";
import type { FEATS } from "../../../codex/entries/enums";
import type { CharacterFeatEntry } from "../../../types";
import {
  createSelectedBackgroundOriginFeatEntry,
  getBackgroundOriginFeatOptions
} from "../../../pages/CharactersPage/backgrounds";
import { getFeatLabel, isFeatRepeatable } from "../../../pages/CharactersPage/feats/catalog";
import SelectInput from "../FormInputs/SelectInput";
import styles from "./CharacterForm.module.css";

type BackgroundOriginFeatSelectProps = {
  background: BackgroundEntry;
  selectedFeat: CharacterFeatEntry | null;
  feats: CharacterFeatEntry[];
  onChange: (feat: CharacterFeatEntry) => void;
};

export default function BackgroundOriginFeatSelect({
  background,
  selectedFeat,
  feats,
  onChange
}: BackgroundOriginFeatSelectProps) {
  if (!background.originFeatOptions?.length) {
    return null;
  }

  return (
    <label className={styles.field}>
      <span>Background feat</span>
      <SelectInput
        className={styles.fieldInput}
        value={selectedFeat?.feat ?? background.originFeat}
        onChange={(event) => {
          const entry = createSelectedBackgroundOriginFeatEntry(
            background.name,
            event.target.value as FEATS
          );
          if (entry) onChange(entry);
        }}
      >
        {getBackgroundOriginFeatOptions(background.name).map((feat) => (
          <option
            key={feat}
            value={feat}
            disabled={
              !isFeatRepeatable(feat) &&
              feats.some((entry) => entry.source?.type !== "background" && entry.feat === feat)
            }
          >
            {getFeatLabel(feat)}
          </option>
        ))}
      </SelectInput>
    </label>
  );
}
