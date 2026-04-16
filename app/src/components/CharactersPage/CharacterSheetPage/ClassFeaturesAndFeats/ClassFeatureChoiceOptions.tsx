import type { ReactNode } from "react";
import RadioContainerOption from "../RadioContainerOption";
import { renderDescriptionLine } from "./helpers";
import styles from "./ClassFeaturesAndFeats.module.css";
import type { DivinityEntry, SpellEntry } from "../../../../codex/entries";
import type { CharacterFeatEntry } from "../../../../types";

export type FeatureChoiceOption<TChoice extends string> = {
  key: string;
  value: TChoice;
  content?: string;
  header?: ReactNode;
  headerFollowup?: ReactNode;
  subheader?: ReactNode;
  breakdown?: ReactNode;
};

type FeatureChoiceOptionsProps<TChoice extends string> = {
  featureKey: string;
  groupName: string;
  isUnlocked: boolean;
  selectedValue: TChoice | null;
  options: readonly FeatureChoiceOption<TChoice>[];
  onChange: (choice: TChoice) => void;
  onOpenKeyword: (keywordKey: string, title?: string) => void;
  onOpenFeatReference: (feat: CharacterFeatEntry["feat"], entry?: CharacterFeatEntry) => void;
  onOpenSpellReference: (spell: SpellEntry) => void;
  onOpenDivinityReference: (divinity: DivinityEntry) => void;
};

type ChoiceContentRenderers = Pick<
  FeatureChoiceOptionsProps<string>,
  "onOpenKeyword" | "onOpenFeatReference" | "onOpenSpellReference" | "onOpenDivinityReference"
>;

function renderChoiceContentLine(line: string, renderers: ChoiceContentRenderers): ReactNode {
  return renderDescriptionLine(
    line,
    renderers.onOpenKeyword,
    (feat) => renderers.onOpenFeatReference(feat),
    renderers.onOpenSpellReference,
    renderers.onOpenDivinityReference
  );
}

function resolveChoiceContent(
  option: FeatureChoiceOption<string>,
  renderers: ChoiceContentRenderers
): Pick<FeatureChoiceOption<string>, "header" | "headerFollowup" | "subheader" | "breakdown"> {
  if (
    option.header !== undefined ||
    option.headerFollowup !== undefined ||
    option.subheader !== undefined ||
    option.breakdown !== undefined
  ) {
    return {
      header: option.header,
      headerFollowup: option.headerFollowup,
      subheader: option.subheader,
      breakdown: option.breakdown
    };
  }

  if (!option.content) {
    return {
      header: ""
    };
  }

  const leadingStrongMatch = option.content.match(/^\s*<strong>([\s\S]*?)<\/strong>\s*([\s\S]*)$/i);

  if (leadingStrongMatch) {
    const [, headerContent, followupContent] = leadingStrongMatch;
    const trimmedFollowup = followupContent.trim();

    return {
      header: renderChoiceContentLine(headerContent.trim(), renderers),
      headerFollowup:
        trimmedFollowup.length > 0 ? renderChoiceContentLine(trimmedFollowup, renderers) : undefined
    };
  }

  return {
    header: renderChoiceContentLine(option.content, renderers)
  };
}

function FeatureChoiceOptions<TChoice extends string>({
  featureKey,
  groupName,
  isUnlocked,
  selectedValue,
  options,
  onChange,
  onOpenKeyword,
  onOpenFeatReference,
  onOpenSpellReference,
  onOpenDivinityReference
}: FeatureChoiceOptionsProps<TChoice>) {
  return (
    <div className={styles.featureSelectionGrid}>
      {options.map((option) => {
        const content = resolveChoiceContent(option, {
          onOpenKeyword,
          onOpenFeatReference,
          onOpenSpellReference,
          onOpenDivinityReference
        });

        return (
          <RadioContainerOption
            key={`${featureKey}-choice-${option.key}`}
            name={groupName}
            selected={selectedValue === option.value}
            disabled={!isUnlocked}
            onSelect={() => onChange(option.value)}
            header={content.header ?? ""}
            headerFollowup={content.headerFollowup}
            subheader={content.subheader}
            breakdown={content.breakdown}
          />
        );
      })}
    </div>
  );
}

export default FeatureChoiceOptions;
