import { ChevronsDown, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import styles from "./ThumbDiceButton.module.css";

const revealOffsetPx = 128;

function SpellcastingThumbButton({ sectionRef }: { sectionRef: RefObject<HTMLDivElement> }) {
  const [isVisible, setIsVisible] = useState(false);
  const dismissedUntilVisible = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Reveal only well outside the viewport; hide as soon as the section returns.
    // Separate boundaries keep small scroll adjustments from toggling the button.
    const viewportObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        dismissedUntilVisible.current = false;
        setIsVisible(false);
      }
    });
    const revealObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !dismissedUntilVisible.current) {
          setIsVisible(true);
        }
      },
      { rootMargin: `${revealOffsetPx}px 0px` }
    );
    viewportObserver.observe(section);
    revealObserver.observe(section);

    return () => {
      viewportObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [sectionRef]);

  function navigateToSpellcasting() {
    const section = sectionRef.current;
    if (!section) return;

    dismissedUntilVisible.current = true;
    setIsVisible(false);
    section.focus({ preventScroll: true });
    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start"
    });
  }

  if (!isVisible) return null;

  return (
    <button
      type="button"
      className={`${styles.thumbButton} ${styles.spellcastingButton}`}
      aria-label="Scroll to spellcasting"
      title="Scroll to spellcasting"
      onClick={navigateToSpellcasting}
    >
      <span className={styles.spellcastingIcons} aria-hidden="true">
        <Sparkles size={24} />
        <ChevronsDown size={20} />
      </span>
    </button>
  );
}

export default SpellcastingThumbButton;
