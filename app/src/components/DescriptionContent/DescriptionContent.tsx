import SpellDescriptionContent from "../SpellDescriptionContent";
import type { SpellDescriptionEntry } from "../../codex/entries";
import type { RenderCodexRichTextOptions } from "../../utils/codex/renderCodexRichText";

type DescriptionContentProps = RenderCodexRichTextOptions & {
  description: SpellDescriptionEntry[];
  className?: string;
  entryClassName?: string;
};

function DescriptionContent({
  description,
  className,
  entryClassName,
  linkClassName,
  onOpenKeyword,
  onOpenSpell,
  onOpenDivinity,
  onOpenFeat
}: DescriptionContentProps) {
  return (
    <SpellDescriptionContent
      description={description}
      className={className}
      entryClassName={entryClassName}
      linkClassName={linkClassName}
      onOpenKeyword={onOpenKeyword}
      onOpenSpell={onOpenSpell}
      onOpenDivinity={onOpenDivinity}
      onOpenFeat={onOpenFeat}
    />
  );
}

export default DescriptionContent;
