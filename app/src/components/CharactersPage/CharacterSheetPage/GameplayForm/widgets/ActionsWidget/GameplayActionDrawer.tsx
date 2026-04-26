import { useState, type ReactNode } from "react";
import type {
  DivinityEntry,
  FEATS,
  SpellDescriptionEntry,
  SpellEntry
} from "../../../../../../codex/entries";
import DescriptionContent from "../../../../../DescriptionContent/DescriptionContent";
import CellContainer from "../../../../../CellContainer/CellContainer";
import KeywordReferenceDrawer from "../../../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import CodexDivinityDrawer from "../../../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexFeatDrawer from "../../../../../CodexPage/CodexFeatDrawer/CodexFeatDrawer";
import CodexSpellDrawer from "../../../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer,
  overlayClassNames
} from "../../../../../Overlay";
import type {
  FeatureActionFact,
  FeatureActionHeaderTag
} from "../../../../../../pages/CharactersPage/classFeatures";
import type { ResolvedKeywordReference } from "../../../../../../utils/codex/renderCodexRichText";
import FeatureActionHeaderTags from "./FeatureActionHeaderTags";
import styles from "./GameplayActionDrawer.module.css";

type GameplayActionDrawerProps = {
  title: string;
  eyebrow?: string;
  badges?: string[];
  headerAside?: ReactNode;
  description: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  facts?: FeatureActionFact[];
  factsSectionTitle?: string | null;
  headerTags?: FeatureActionHeaderTag[];
  helperText?: string;
  warning?: string | null;
  blockedReason?: string | null;
  footer?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  backdropClassName?: string;
  drawerClassName?: string;
};

function getToneClassName(tone: FeatureActionFact["tone"], classes: Record<string, string>) {
  if (tone === "danger") {
    return classes.danger;
  }

  if (tone === "accent") {
    return classes.accent;
  }

  return "";
}

function GameplayActionDrawer({
  title,
  eyebrow,
  badges = [],
  headerAside,
  description,
  descriptionAdditions = [],
  facts = [],
  factsSectionTitle = "Details",
  headerTags = [],
  helperText,
  warning = null,
  blockedReason = null,
  footer,
  children,
  onClose,
  backdropClassName,
  drawerClassName
}: GameplayActionDrawerProps) {
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const [selectedFeatReference, setSelectedFeatReference] = useState<{
    feat: FEATS;
    label: string;
  } | null>(null);
  const hasBaseDescription = description.length > 0;
  const descriptionSections = descriptionAdditions.filter((section) => section.length > 0);

  return (
    <>
      <SheetDrawer
        titleId="gameplay-action-drawer-title"
        onClose={onClose}
        onEscape={() => {
          if (selectedFeatReference) {
            setSelectedFeatReference(null);
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
        }}
        backdropClassName={backdropClassName}
        drawerClassName={[styles.drawerPanel, drawerClassName ?? ""].join(" ").trim()}
      >
        <div className={styles.shell}>
          <OverlayHeader className={styles.header}>
            <OverlayHeaderContent className={styles.headerContent}>
              {eyebrow ? <OverlayEyebrow>{eyebrow}</OverlayEyebrow> : null}
              <OverlayTitleRow>
                <OverlayTitle id="gameplay-action-drawer-title">{title}</OverlayTitle>
              </OverlayTitleRow>
              {helperText ? <OverlaySummary>{helperText}</OverlaySummary> : null}
            </OverlayHeaderContent>
            <div className={styles.headerAside}>
              {headerTags.length > 0 ? (
                <div className={styles.resourceBadgeRow}>
                  <FeatureActionHeaderTags tags={headerTags} tagKeyPrefix={title} />
                </div>
              ) : null}
              {headerAside}
              {badges.length > 0 ? (
                <div className={styles.badgeRow}>
                  {badges.map((badge) => (
                    <span key={`${title}-${badge}`} className={styles.badgePill}>
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
              <OverlayCloseButton label={`Close ${title}`} onClick={onClose} />
            </div>
          </OverlayHeader>

          <OverlayBody className={styles.body}>
            {hasBaseDescription || descriptionSections.length > 0 ? (
              <div className={styles.descriptionStack}>
                {hasBaseDescription ? (
                  <DescriptionContent
                    description={description}
                    className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                    entryClassName={overlayClassNames.descriptionLine}
                    strongClassName={overlayClassNames.descriptionStrong}
                    linkClassName={styles.inlineLinkButton}
                    onOpenKeyword={setSelectedKeyword}
                    onOpenSpell={setSelectedSpellReference}
                    onOpenDivinity={setSelectedDivinityReference}
                    onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                  />
                ) : null}
                {descriptionSections.map((section, index) => (
                  <div
                    key={`${title}-description-section-${index}`}
                    className={styles.descriptionSection}
                  >
                    {hasBaseDescription || index > 0 ? (
                      <hr className={styles.descriptionDivider} aria-hidden="true" />
                    ) : null}
                    <DescriptionContent
                      description={section}
                      className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                      entryClassName={overlayClassNames.descriptionLine}
                      strongClassName={overlayClassNames.descriptionStrong}
                      linkClassName={styles.inlineLinkButton}
                      onOpenKeyword={setSelectedKeyword}
                      onOpenSpell={setSelectedSpellReference}
                      onOpenDivinity={setSelectedDivinityReference}
                      onOpenFeat={(feat, label) => setSelectedFeatReference({ feat, label })}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {facts.length > 0 ? (
              <section className={styles.section}>
                {factsSectionTitle ? <h4 className={styles.sectionTitle}>{factsSectionTitle}</h4> : null}
                <div className={styles.factGrid}>
                  {facts.map((fact, index) => (
                    <CellContainer
                      key={`${title}-fact-${index}`}
                      label={fact.label}
                      content={fact.value}
                      breakdown={fact.breakdown}
                      className={fact.fullWidth ? styles.factFullWidth : undefined}
                      contentClassName={getToneClassName(fact.tone, {
                        danger: styles.factValueDanger,
                        accent: styles.factValueAccent
                      })}
                      breakdownClassName={styles.factBreakdown}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {children}
          </OverlayBody>

          {warning || blockedReason || footer ? (
            <div className={styles.footer}>
              {warning || blockedReason ? (
                <div className={styles.warningBlock}>
                  {blockedReason ? <p className={styles.warningCard}>{blockedReason}</p> : null}
                  {warning ? <p className={styles.warningCard}>{warning}</p> : null}
                </div>
              ) : null}
              {footer}
            </div>
          ) : null}
        </div>
      </SheetDrawer>

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
        <KeywordReferenceDrawer
          title={selectedKeyword.title}
          entries={[
            {
              title: selectedKeyword.title,
              description: selectedKeyword.description
            }
          ]}
          badgeLabel="Keyword"
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
      {selectedFeatReference ? (
        <CodexFeatDrawer
          feat={selectedFeatReference.feat}
          label={selectedFeatReference.label}
          onClose={() => setSelectedFeatReference(null)}
        />
      ) : null}
    </>
  );
}

export default GameplayActionDrawer;
