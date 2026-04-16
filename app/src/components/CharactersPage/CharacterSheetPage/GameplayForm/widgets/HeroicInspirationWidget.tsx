import clsx from "clsx";
import { Star } from "lucide-react";
import { useState } from "react";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../Overlay";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  HEROIC_INSPIRATION_DESCRIPTION,
  HEROIC_INSPIRATION_TITLE,
  toggleHeroicInspirationForCharacter
} from "../../../../../pages/CharactersPage/heroicInspiration";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./HeroicInspirationWidget.module.css";

type HeroicInspirationWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

type HeroicInspirationStarProps = {
  isActive: boolean;
  className?: string;
};

function HeroicInspirationStar({ isActive, className }: HeroicInspirationStarProps) {
  return (
    <Star
      size={16}
      className={clsx(
        className,
        styles.starIcon,
        isActive ? styles.starIconActive : styles.starIconInactive
      )}
      fill={isActive ? "currentColor" : "none"}
      aria-hidden="true"
    />
  );
}

function HeroicInspirationWidget({ character, onPersistCharacter }: HeroicInspirationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasHeroicInspiration = character.heroicInspiration;

  return (
    <>
      <button
        type="button"
        className={clsx(
          shared.editButton,
          styles.button,
          hasHeroicInspiration && styles.buttonActive
        )}
        onClick={() => setIsOpen(true)}
        aria-label={HEROIC_INSPIRATION_TITLE}
        title={HEROIC_INSPIRATION_TITLE}
      >
        <HeroicInspirationStar isActive={hasHeroicInspiration} />
      </button>

      {isOpen ? (
        <SheetModal titleId="heroic-inspiration-modal-title" onClose={() => setIsOpen(false)}>
          <OverlayHeader>
            <OverlayHeaderContent>
              <OverlayEyebrow>Core Rule</OverlayEyebrow>
              <OverlayTitleRow>
                <OverlayTitle id="heroic-inspiration-modal-title">
                  {HEROIC_INSPIRATION_TITLE}
                </OverlayTitle>
              </OverlayTitleRow>
              <OverlaySummary className={shared.helperText}>
                Track whether this character currently has Heroic Inspiration ready to spend.
              </OverlaySummary>
            </OverlayHeaderContent>
            <OverlayCloseButton label="Close Heroic Inspiration" onClick={() => setIsOpen(false)} />
          </OverlayHeader>

          <OverlayBody className={styles.body}>
            {HEROIC_INSPIRATION_DESCRIPTION.map((paragraph) => (
              <p key={paragraph} className={styles.description}>
                {paragraph}
              </p>
            ))}
          </OverlayBody>

          <OverlayFooter className={styles.footer}>
            <button
              type="button"
              role="switch"
              aria-checked={hasHeroicInspiration}
              className={clsx(
                styles.toggleButton,
                hasHeroicInspiration && styles.toggleButtonActive
              )}
              onClick={() =>
                onPersistCharacter((currentCharacter) =>
                  toggleHeroicInspirationForCharacter(currentCharacter)
                )
              }
            >
              <span className={styles.toggleBody}>
                <span className={styles.toggleLabel}>Inspiration</span>
                <span className={styles.toggleMeta}>
                  {hasHeroicInspiration
                    ? "Available for your next d20 reroll."
                    : "Currently spent."}
                </span>
              </span>
              <span
                className={clsx(
                  styles.toggleState,
                  hasHeroicInspiration && styles.toggleStateActive
                )}
              >
                <HeroicInspirationStar
                  isActive={hasHeroicInspiration}
                  className={styles.toggleStateIcon}
                />
                <span>{hasHeroicInspiration ? "Ready" : "Empty"}</span>
              </span>
            </button>
          </OverlayFooter>
        </SheetModal>
      ) : null}
    </>
  );
}

export default HeroicInspirationWidget;
