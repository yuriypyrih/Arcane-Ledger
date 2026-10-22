import clsx from "clsx";
import type { SpellDescriptionEntry } from "../../codex/entries";
import {
  renderCodexRichText,
  type RenderCodexRichTextOptions
} from "../../utils/codex/renderCodexRichText";
import styles from "./SpellDescriptionContent.module.css";
import { parseDescriptionTable } from "./parseDescriptionTable";

type SpellDescriptionContentProps = RenderCodexRichTextOptions & {
  description: SpellDescriptionEntry[];
  className?: string;
  entryClassName?: string;
  strongClassName?: string;
};

function SpellDescriptionContent({
  description,
  className,
  entryClassName,
  linkClassName,
  strongClassName,
  onOpenKeyword,
  onOpenSpell,
  onOpenDivinity,
  onOpenFeat
}: SpellDescriptionContentProps) {
  const renderText = (text: string) =>
    renderCodexRichText(text, {
      linkClassName,
      strongClassName,
      onOpenKeyword,
      onOpenSpell,
      onOpenDivinity,
      onOpenFeat
    });

  return (
    <div className={className}>
      {description.map((entry, index) => {
        if (typeof entry === "string") {
          const table = parseDescriptionTable(entry);
          if (table) {
            return (
              <div
                key={`description-${index}`}
                className={clsx(styles.tableWrapper, entryClassName)}
              >
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {table.headers.map((header, columnIndex) => (
                        <th key={columnIndex} scope="col">
                          {renderText(header)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, columnIndex) => (
                          <td key={columnIndex}>{renderText(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          return (
            <p key={`description-${index}`} className={clsx(styles.text, entryClassName)}>
              {renderText(entry)}
            </p>
          );
        }

        const ListTag = entry.style === "number" ? "ol" : "ul";

        return (
          <ListTag key={`description-list-${index}`} className={clsx(styles.list, entryClassName)}>
            {entry.items.map((item, itemIndex) => (
              <li
                key={`description-list-${index}-item-${itemIndex}`}
                className={clsx(styles.text, styles.listItem, entryClassName)}
              >
                {renderText(item)}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}

export default SpellDescriptionContent;
