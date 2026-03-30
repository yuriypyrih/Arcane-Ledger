import clsx from "clsx";
import type { SpellDescriptionEntry } from "../../codex/entries";
import {
  renderCodexRichText,
  type RenderCodexRichTextOptions
} from "../../utils/codex/renderCodexRichText";
import styles from "./SpellDescriptionContent.module.css";

type SpellDescriptionContentProps = RenderCodexRichTextOptions & {
  description: SpellDescriptionEntry[];
  className?: string;
  entryClassName?: string;
};

function SpellDescriptionContent({
  description,
  className,
  entryClassName,
  linkClassName,
  onOpenKeyword,
  onOpenSpell,
  onOpenDivinity,
  onOpenFeat
}: SpellDescriptionContentProps) {
  return (
    <div className={className}>
      {description.map((entry, index) => {
        if (typeof entry === "string") {
          return (
            <p key={`description-${index}`} className={entryClassName}>
              {renderCodexRichText(entry, {
                linkClassName,
                onOpenKeyword,
                onOpenSpell,
                onOpenDivinity,
                onOpenFeat
              })}
            </p>
          );
        }

        const ListTag = entry.style === "number" ? "ol" : "ul";

        return (
          <ListTag key={`description-list-${index}`} className={clsx(styles.list, entryClassName)}>
            {entry.items.map((item, itemIndex) => (
              <li
                key={`description-list-${index}-item-${itemIndex}`}
                className={clsx(styles.listItem, entryClassName)}
              >
                {renderCodexRichText(item, {
                  linkClassName,
                  onOpenKeyword,
                  onOpenSpell,
                  onOpenDivinity,
                  onOpenFeat
                })}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}

export default SpellDescriptionContent;
