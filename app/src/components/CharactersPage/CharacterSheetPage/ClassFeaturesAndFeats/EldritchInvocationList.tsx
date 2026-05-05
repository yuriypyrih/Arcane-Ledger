import clsx from "clsx";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import cardStyles from "./FeatCards.module.css";
import { triggerActionOnEnterOrSpace } from "./featEditorUtils";
import type { TrackingButtonRenderer } from "./types";

type EldritchInvocationListProps = {
  invocations: WarlockEldritchInvocationOption[];
  emptyText?: string;
  onOpenInvocationReference: (option: WarlockEldritchInvocationOption) => void;
  renderTrackingButton: TrackingButtonRenderer;
};

type InvocationGroup = {
  key: string;
  options: WarlockEldritchInvocationOption[];
};

function groupInvocations(invocations: WarlockEldritchInvocationOption[]): InvocationGroup[] {
  const groupsByInvocation = invocations.reduce<Map<string, WarlockEldritchInvocationOption[]>>(
    (groups, option) => {
      const current = groups.get(option.invocation.id) ?? [];
      groups.set(option.invocation.id, [...current, option]);
      return groups;
    },
    new Map()
  );

  return [...groupsByInvocation.entries()].map(([key, options]) => ({
    key,
    options
  }));
}

function EldritchInvocationList({
  invocations,
  emptyText = "No eldritch invocations selected yet.",
  onOpenInvocationReference,
  renderTrackingButton
}: EldritchInvocationListProps) {
  if (invocations.length === 0) {
    return <p className={shared.emptyText}>{emptyText}</p>;
  }

  return (
    <ul className={cardStyles.list}>
      {groupInvocations(invocations).map(({ key, options }) => {
        const firstOption = options[0];

        if (!firstOption) {
          return null;
        }

        const isRepeatable = Boolean(firstOption.invocation.repeatable);

        return (
          <li
            key={key}
            className={clsx(cardStyles.card, cardStyles.interactiveCard)}
            role="button"
            tabIndex={0}
            onClick={() => onOpenInvocationReference(firstOption)}
            onKeyDown={(event) =>
              triggerActionOnEnterOrSpace(event, () => onOpenInvocationReference(firstOption))
            }
          >
            <div className={cardStyles.headerRow}>
              <div className={cardStyles.titleBlock}>
                <span className={cardStyles.title}>{firstOption.invocation.name}</span>
                {isRepeatable ? (
                  <>
                    {" "}
                    <span className={cardStyles.repeatable}>(repeatable)</span>
                  </>
                ) : null}
              </div>
              <div className={cardStyles.headerActions}>
                {renderTrackingButton(firstOption.invocation.trackingState)}
              </div>
            </div>
            <p className={cardStyles.meta}>Eldritch Invocation</p>
            {isRepeatable ? (
              <ul className={cardStyles.selectedList}>
                {options.map((option) => (
                  <li key={option.selectionId} className={cardStyles.selectedItem}>
                    <span className={cardStyles.selectedText}>
                      {option.displaySubtitle ?? option.displayName}
                    </span>
                  </li>
                ))}
              </ul>
            ) : firstOption.displaySubtitle ? (
              <p className={cardStyles.summary}>{firstOption.displaySubtitle}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default EldritchInvocationList;
