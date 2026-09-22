import { useEffect, useId, useRef, useState } from "react";
import {
  getCharacterInspection,
  type CharacterInspectionTarget
} from "../../../api/characterInspection";
import { applyCloudDocumentToPortableCharacterSheet } from "../../../characterSync/characterSyncRecords";
import { normalizeCharacter } from "../../../pages/CharactersPage/storage";
import type { Character, CharacterInventoryItem } from "../../../types";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlaySummary,
  SheetModal
} from "../../Overlay";
import { getClassSignatureStyle, getClassPageTextureUrl } from "../classSignature";
import CharacterInspectionSheet from "./CharacterInspectionSheet";
import ReadOnlyInventoryItem from "./ReadOnlyInventoryItem";
import { useInspectionFocus } from "./useInspectionFocus";
import styles from "./CharacterInspection.module.css";
import sheetStyles from "../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";

type Props = { target: CharacterInspectionTarget; onClose: () => void };

function InspectionSession({ target, onClose }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [snapshot, setSnapshot] = useState<{
    character: Character;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [items, setItems] = useState<CharacterInventoryItem[]>([]);
  const targetRef = useRef(target);
  useInspectionFocus(panelRef, items.length === 0);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setLoading(true);
    setError(null);
    setItems([]);
    void getCharacterInspection(targetRef.current, {
      signal: controller.signal,
      suppressFailureToast: true
    })
      .then(({ character: document }) => {
        if (!current) return;
        const character = normalizeCharacter(applyCloudDocumentToPortableCharacterSheet(document));
        if (!character) throw new Error("This character sheet could not be displayed.");
        setSnapshot({ character });
      })
      .catch((reason: unknown) => {
        if (!current) return;
        setSnapshot(null);
        setError(reason instanceof Error ? reason.message : "Unable to load this character.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [attempt]);

  const closeItem = () => setItems((current) => current.slice(0, -1));
  const selectedItem = items.at(-1);
  const texture = snapshot?.character.storageMetadata?.backgroundTexture;
  const signature = getClassSignatureStyle(snapshot?.character.className ?? "", {
    pageTextureDisabled: texture?.source === "none",
    pageTextureOverrideUrl: texture?.source === "predefined"
      ? getClassPageTextureUrl(texture.textureId)
      : texture?.source === "uploaded" ? texture.imageUrl : undefined
  });
  return (
    <>
      <SheetModal
        titleId={titleId}
        onClose={onClose}
        panelRef={panelRef}
        onEscape={() => {
          if (document.querySelector('[data-read-only-reference="true"]')) return;
          (selectedItem ? closeItem : onClose)();
        }}
        size="large"
      >
        <div className={styles.textureClip} aria-hidden="true">
          <div
            className={sheetStyles.pageTextureBackdrop}
            style={{ ...signature, position: "absolute" }}
          />
        </div>
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayTitle id={titleId}>
              Character Inspection
            </OverlayTitle>
            <OverlaySummary>
              <strong>Read-only</strong>
            </OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close character inspection" onClick={onClose} />
        </OverlayHeader>
        <OverlayBody className={styles.body}>
          {loading ? (
            <p role="status">Loading character…</p>
          ) : null}
          {error ? (
            <div role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                disabled={loading}
              >
                Retry
              </button>
            </div>
          ) : null}
          {snapshot ? (
            <CharacterInspectionSheet
              key={attempt}
              character={snapshot.character}
              onInspectItem={(item) => setItems([item])}
            />
          ) : null}
        </OverlayBody>
      </SheetModal>
      {selectedItem && snapshot ? (
        <ReadOnlyInventoryItem
          key={selectedItem.id}
          stack={selectedItem}
          character={snapshot.character}
          canGoBack={items.length > 1}
          onClose={closeItem}
          onInspect={(item) => setItems((current) => [...current, item])}
        />
      ) : null}
    </>
  );
}

export default function CharacterInspectionModal(props: Props) {
  const { target } = props;
  const key = `${target.kind}:${target.kind === "party" ? target.partyGroupId : target.userId}:${target.characterId}`;
  return <InspectionSession key={key} {...props} />;
}
