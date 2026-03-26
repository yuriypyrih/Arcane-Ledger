import clsx from "clsx";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  ENTRY_CATEGORIES,
  KeywordTooltip,
  getDivinityEntryByName,
  hardcodedCodexEntries,
  type DivinityEntry,
  type KeywordTooltipEntry,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import CodexDivinityDrawer from "../../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { getKeywordDescription } from "../../../../../pages/CharactersPage/keywordDescriptions";
import styles from "./TraitsConditionsWidget.module.css";

type ReactionEntryDrawerProps = {
  reaction: ReactionEntry;
  actionWarning: string | null;
  onCast: () => void;
  onClose: () => void;
};

const spellEntriesByName = new Map<string, SpellEntry>(
  hardcodedCodexEntries
    .filter((entry): entry is SpellEntry => entry.category === ENTRY_CATEGORIES.SPELLS)
    .map((entry) => [entry.name.toLowerCase(), entry])
);

const inlineMarkupPattern =
  /<strong>(.*?)<\/strong>|<link:([^>]+)>(.*?)<\/link>|<spell:([^>]+)>(.*?)<\/spell>|<divinity:([^>]+)>(.*?)<\/divinity>/g;

function resolveKeywordReference(
  keywordKey: string,
  fallbackTitle?: string
): { key: string; title: string; description: string[] } | null {
  const tooltip = KeywordTooltip[keywordKey] as KeywordTooltipEntry | undefined;

  if (tooltip) {
    return {
      key: keywordKey,
      title: tooltip.title,
      description: tooltip.description
    };
  }

  const description = getKeywordDescription(keywordKey);

  if (!description) {
    return null;
  }

  return {
    key: keywordKey,
    title: fallbackTitle ?? keywordKey,
    description: [description]
  };
}

function ReactionEntryDrawer({
  reaction,
  actionWarning,
  onCast,
  onClose
}: ReactionEntryDrawerProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<{
    key: string;
    title: string;
    description: string[];
  } | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedKeyword) {
        setSelectedKeyword(null);
        return;
      }

      if (selectedDivinityReference) {
        setSelectedDivinityReference(null);
        return;
      }

      if (selectedSpellReference) {
        setSelectedSpellReference(null);
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedDivinityReference, selectedKeyword, selectedSpellReference]);

  const renderedDescription = useMemo(() => {
    function renderDescriptionLine(line: string, key: string): ReactNode {
      const nodes: ReactNode[] = [];
      let cursor = 0;

      for (const match of line.matchAll(inlineMarkupPattern)) {
        const index = match.index ?? 0;

        if (index > cursor) {
          nodes.push(line.slice(cursor, index));
        }

        if (match[1]) {
          nodes.push(<strong key={`${key}-strong-${index}`}>{match[1]}</strong>);
        }

        if (match[2]) {
          const keywordKey = match[2];
          const label = match[3] ?? keywordKey;
          const resolvedKeyword = resolveKeywordReference(keywordKey, label);

          nodes.push(
            resolvedKeyword ? (
              <button
                key={`${key}-keyword-${index}`}
                type="button"
                className={styles.inlineLinkButton}
                onClick={() => setSelectedKeyword(resolvedKeyword)}
              >
                {label}
              </button>
            ) : (
              label
            )
          );
        }

        if (match[4]) {
          const spell = spellEntriesByName.get(match[4].trim().toLowerCase());
          const label = match[5] ?? match[4];

          nodes.push(
            spell ? (
              <button
                key={`${key}-spell-${index}`}
                type="button"
                className={styles.inlineLinkButton}
                onClick={() => setSelectedSpellReference(spell)}
              >
                {label}
              </button>
            ) : (
              label
            )
          );
        }

        if (match[6]) {
          const divinity = getDivinityEntryByName(match[6]);
          const label = match[7] ?? match[6];

          nodes.push(
            divinity ? (
              <button
                key={`${key}-divinity-${index}`}
                type="button"
                className={styles.inlineLinkButton}
                onClick={() => setSelectedDivinityReference(divinity)}
              >
                {label}
              </button>
            ) : (
              label
            )
          );
        }

        cursor = index + match[0].length;
      }

      if (cursor < line.length) {
        nodes.push(line.slice(cursor));
      }

      return nodes.length > 0 ? nodes : line;
    }

    return reaction.description.map((entry, index) => {
      if (typeof entry === "string") {
        return (
          <p key={`reaction-description-${index}`} className={sheetStyles.spellDrawerDescriptionLine}>
            {renderDescriptionLine(entry, `reaction-description-${index}`)}
          </p>
        );
      }

      const ListTag = entry.style === "number" ? "ol" : "ul";

      return (
        <ListTag
          key={`reaction-description-list-${index}`}
          className={clsx(sheetStyles.spellDrawerDescriptionList, sheetStyles.spellDrawerDescriptionLine)}
        >
          {entry.items.map((item, itemIndex) => (
            <li
              key={`reaction-description-list-${index}-${itemIndex}`}
              className={sheetStyles.spellDrawerDescriptionLine}
            >
              {renderDescriptionLine(item, `reaction-description-list-${index}-${itemIndex}`)}
            </li>
          ))}
        </ListTag>
      );
    });
  }, [reaction.description]);

  return (
    <>
      <div className={sheetStyles.spellDrawerBackdrop} role="presentation" onClick={onClose}>
        <section
          className={sheetStyles.spellDrawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reaction-drawer-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
          <div className={sheetStyles.spellDrawerHeader}>
            <div className={sheetStyles.spellDrawerHeaderContent}>
              <p className={sheetStyles.spellDrawerBadge}>Reaction</p>
              <div className={sheetStyles.spellDrawerTitleRow}>
                <h3 id="reaction-drawer-title">{reaction.name}</h3>
              </div>
            </div>
            <button
              type="button"
              className={sheetStyles.spellDrawerCloseButton}
              onClick={onClose}
              aria-label="Close reaction details"
            >
              <X size={18} />
            </button>
          </div>

          <div className={sheetStyles.spellDrawerBody}>
            <div
              className={clsx(
                sheetStyles.spellDrawerDescriptionList,
                sheetStyles.spellDrawerDescriptionSection
              )}
            >
              {renderedDescription}
            </div>
          </div>

          <div className={sheetStyles.spellDrawerActions}>
            <div className={styles.castActionMeta}>
              {actionWarning ? <p className={styles.castActionWarning}>{actionWarning}</p> : null}
            </div>
            <button
              type="button"
              className={sheetStyles.castButton}
              onClick={onCast}
              disabled={actionWarning !== null}
            >
              Take Reaction
            </button>
          </div>
        </section>
      </div>

      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedKeyword ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedKeyword(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reaction-keyword-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Reference</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="reaction-keyword-drawer-title">{selectedKeyword.title}</h3>
                </div>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedKeyword(null)}
                aria-label={`Close ${selectedKeyword.title} reference`}
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.spellDrawerBody}>
              <div
                className={clsx(
                  sheetStyles.spellDrawerDescriptionList,
                  sheetStyles.spellDrawerDescriptionSection
                )}
              >
                {selectedKeyword.description.map((line, index) => (
                  <p
                    key={`${selectedKeyword.key}-${index}`}
                    className={sheetStyles.spellDrawerDescriptionLine}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default ReactionEntryDrawer;
