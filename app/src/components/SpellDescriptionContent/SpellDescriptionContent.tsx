import clsx from "clsx";
import type { SpellDescriptionEntry } from "../../codex/entries";
import { renderCodexInlineText } from "../../utils/codex";
import styles from "./SpellDescriptionContent.module.css";

type SpellDescriptionContentProps = {
  description: SpellDescriptionEntry[];
  className?: string;
  entryClassName?: string;
};

function SpellDescriptionContent({
  description,
  className,
  entryClassName
}: SpellDescriptionContentProps) {
  return (
    <div className={className}>
      {description.map((entry, index) => {
        if (typeof entry === "string") {
          return (
            <p key={`description-${index}`} className={entryClassName}>
              {renderCodexInlineText(entry)}
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
                {renderCodexInlineText(item)}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}

export default SpellDescriptionContent;
