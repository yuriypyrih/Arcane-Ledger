import { Suspense } from "react";
import {
  LazyCodexSpellDrawer,
  LazyCodexDivinityDrawer,
  LazyCodexFeatDrawer,
  LazyKeywordReferenceDrawer
} from "./LazyCodexReferenceDrawers";
import type { NestedReferenceState } from "./useNestedReferences";
export function NestedReferenceDrawers({
  references,
  backdropClassName,
  stacked = false
}: {
  references: NestedReferenceState;
  backdropClassName?: string;
  stacked?: boolean;
}) {
  const {
    selectedSpellReference,
    setSelectedSpellReference,
    selectedDivinityReference,
    setSelectedDivinityReference,
    selectedKeyword,
    setSelectedKeyword,
    selectedFeatReference,
    setSelectedFeatReference
  } = references;
  return (
    <Suspense fallback={null}>
      {selectedSpellReference ? (
        <LazyCodexSpellDrawer
          spell={selectedSpellReference}
          backdropClassName={backdropClassName}
          stacked={stacked}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <LazyCodexDivinityDrawer
          divinity={selectedDivinityReference}
          backdropClassName={backdropClassName}
          stacked={stacked}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedKeyword ? (
        <LazyKeywordReferenceDrawer
          title={selectedKeyword.title}
          entries={[
            {
              title: selectedKeyword.title,
              description: selectedKeyword.description,
              trackingMessage: selectedKeyword.trackingMessage
            }
          ]}
          badgeLabel="Keyword"
          backdropClassName={backdropClassName}
          stacked={stacked}
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
      {selectedFeatReference ? (
        <LazyCodexFeatDrawer
          feat={selectedFeatReference.feat}
          label={selectedFeatReference.label}
          backdropClassName={backdropClassName}
          stacked={stacked}
          onClose={() => setSelectedFeatReference(null)}
        />
      ) : null}
    </Suspense>
  );
}
