import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import cardStyles from "./FeatCards.module.css";
import BuildSummaryCard from "./BuildSummaryCard";
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
          <BuildSummaryCard
            key={key}
            title={firstOption.invocation.name}
            meta="Eldritch Invocation"
            summary={isRepeatable ? null : firstOption.displaySubtitle}
            selectedItems={
              isRepeatable
                ? options.map((option) => option.displaySubtitle ?? option.displayName)
                : undefined
            }
            isRepeatable={isRepeatable}
            onClick={() => onOpenInvocationReference(firstOption)}
            headerActions={renderTrackingButton(
              firstOption.invocation.trackingState,
              firstOption.invocation.trackingMessage
            )}
          />
        );
      })}
    </ul>
  );
}

export default EldritchInvocationList;
