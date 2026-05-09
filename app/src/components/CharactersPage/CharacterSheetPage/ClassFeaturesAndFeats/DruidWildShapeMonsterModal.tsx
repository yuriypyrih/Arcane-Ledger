import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchMonsterBySlug } from "../../../../api";
import MonsterCodexTable from "../../../CodexPage/MonsterCodexTable";
import { MONSTER_SOURCE_OPTIONS, MONSTER_TYPE_OPTIONS } from "../../../../constants/monsters";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../Overlay";
import { MonsterEntryDrawer } from "../../../MonsterEntryRenderer";
import SearchField from "../../../SearchField";
import { getDruidWildShapeRulesForCharacter } from "../../../../pages/CharactersPage/classFeatures";
import { useMonsterEntries } from "../../../../pages/CodexPage/useMonsterEntries";
import { getCachedMonsterEntry, primeMonsterEntryCache } from "../../../../utils/monsters";
import type {
  Character,
  CodexStatus,
  MonsterListItem,
  MonsterOrdering,
  MonsterRecord
} from "../../../../types";
import styles from "./DruidWildShapeMonsterModal.module.css";

type DruidWildShapeMonsterModalProps = {
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>;
  selectedMonsters: MonsterRecord[];
  onSelectedMonstersChange: (monsters: MonsterRecord[]) => void;
  onClose: () => void;
};

const MONSTERS_PER_PAGE = 20;
const DEFAULT_VALID_MONSTER_TYPE = "Beast";
const DEFAULT_VALID_MONSTER_SOURCE = "wotc-srd";

function isQualifiedWildShapeMonster(
  monster: Pick<MonsterListItem, "type" | "cr">,
  maxCr: number | null
) {
  if (maxCr === null) {
    return false;
  }

  return monster.type.trim().toLowerCase() === "beast" && monster.cr <= maxCr;
}

function DruidWildShapeMonsterModal({
  character,
  selectedMonsters,
  onSelectedMonstersChange,
  onClose
}: DruidWildShapeMonsterModalProps) {
  const rules = getDruidWildShapeRulesForCharacter(character);
  const [query, setQuery] = useState("");
  const [monsterTypeFilter, setMonsterTypeFilter] = useState<string | null>(
    DEFAULT_VALID_MONSTER_TYPE
  );
  const [monsterSourceFilter, setMonsterSourceFilter] = useState<string | null>(
    DEFAULT_VALID_MONSTER_SOURCE
  );
  const [monsterOrdering, setMonsterOrdering] = useState<MonsterOrdering>("cr");
  const [onlyValidBeasts, setOnlyValidBeasts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewMonster, setPreviewMonster] = useState<MonsterRecord | null>(null);
  const [previewStatus, setPreviewStatus] = useState<CodexStatus>("ready");
  const [pendingAddSlug, setPendingAddSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [monsterCache, setMonsterCache] = useState<Record<string, MonsterRecord>>(() =>
    selectedMonsters.reduce<Record<string, MonsterRecord>>((cache, monster) => {
      cache[monster.slug] = monster;
      return cache;
    }, {})
  );
  const { payload, status } = useMonsterEntries({
    enabled: true,
    page: currentPage,
    limit: MONSTERS_PER_PAGE,
    search: query,
    type: onlyValidBeasts ? DEFAULT_VALID_MONSTER_TYPE : monsterTypeFilter,
    maxCr: onlyValidBeasts ? (rules?.maxCr ?? null) : null,
    source: onlyValidBeasts ? DEFAULT_VALID_MONSTER_SOURCE : monsterSourceFilter,
    ordering: monsterOrdering
  });
  const totalPages = Math.max(1, Math.ceil((payload?.count ?? 0) / MONSTERS_PER_PAGE));
  const selectedMonsterSlugSet = useMemo(
    () => new Set(selectedMonsters.map((monster) => monster.slug)),
    [selectedMonsters]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [monsterOrdering, monsterSourceFilter, monsterTypeFilter, onlyValidBeasts, query]);

  useEffect(() => {
    if (currentPage <= totalPages) {
      return;
    }

    setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (selectedMonsters.length === 0) {
      return;
    }

    setMonsterCache((currentCache) => {
      const nextCache = { ...currentCache };

      selectedMonsters.forEach((monster) => {
        nextCache[monster.slug] = monster;
      });

      return nextCache;
    });
  }, [selectedMonsters]);

  useEffect(() => {
    if (!onlyValidBeasts) {
      return;
    }

    setMonsterTypeFilter(DEFAULT_VALID_MONSTER_TYPE);
    setMonsterSourceFilter(DEFAULT_VALID_MONSTER_SOURCE);
  }, [onlyValidBeasts]);

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function loadPreview() {
      if (!previewSlug) {
        setPreviewMonster(null);
        setPreviewStatus("ready");
        return;
      }

      const cachedMonster = monsterCache[previewSlug] ?? getCachedMonsterEntry(previewSlug);

      if (cachedMonster) {
        primeMonsterEntryCache(cachedMonster);
        setPreviewMonster(cachedMonster);
        setPreviewStatus("ready");
        return;
      }

      setPreviewStatus("loading");

      try {
        const payload = await fetchMonsterBySlug(previewSlug, {
          signal: abortController.signal
        });

        if (!active) {
          return;
        }

        primeMonsterEntryCache(payload);
        setMonsterCache((currentCache) => ({
          ...currentCache,
          [payload.slug]: payload
        }));
        setPreviewMonster(payload);
        setPreviewStatus("ready");
      } catch {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setPreviewMonster(null);
        setPreviewStatus("error");
      }
    }

    void loadPreview();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [monsterCache, previewSlug]);

  function removeMonster(slug: string) {
    setNotice(null);
    onSelectedMonstersChange(selectedMonsters.filter((monster) => monster.slug !== slug));
  }

  function getAddDisabledReason(monster: MonsterListItem) {
    if (selectedMonsterSlugSet.has(monster.slug)) {
      return "Already selected.";
    }

    if (rules && selectedMonsters.length >= rules.knownForms) {
      return `You can only learn ${rules.knownForms} forms right now.`;
    }

    return null;
  }

  function getAddButtonTitle(monster: MonsterListItem) {
    const disabledReason = getAddDisabledReason(monster);

    if (disabledReason) {
      return disabledReason;
    }

    if (isQualifiedWildShapeMonster(monster, rules?.maxCr ?? null)) {
      return "Add valid Wild Shape form";
    }

    return "Add monster (outside current Wild Shape limits)";
  }

  async function addMonster(monster: MonsterListItem) {
    const disabledReason = getAddDisabledReason(monster);

    if (disabledReason) {
      setNotice(disabledReason);
      return;
    }

    setPendingAddSlug(monster.slug);
    setNotice(null);

    try {
      const fullMonster = monsterCache[monster.slug] ?? (await fetchMonsterBySlug(monster.slug));

      setMonsterCache((currentCache) => ({
        ...currentCache,
        [fullMonster.slug]: fullMonster
      }));
      onSelectedMonstersChange([...selectedMonsters, fullMonster]);
      setNotice(null);
    } catch {
      setNotice("The full monster entry could not be loaded.");
    } finally {
      setPendingAddSlug(null);
    }
  }

  return (
    <>
      <SheetModal
        titleId="druid-wild-shape-monster-modal-title"
        onClose={onClose}
        size="large"
        panelClassName={styles.modalPanel}
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayEyebrow>Wild Shape</OverlayEyebrow>
            <OverlayTitleRow>
              <OverlayTitle as="h2" id="druid-wild-shape-monster-modal-title">
                Choose beast shapes
              </OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary>
              {rules
                ? `Learn up to ${rules.knownForms} forms. Valid beasts must be CR ${rules.maxCrLabel} or lower.`
                : "Choose the beast entries you want ready for Wild Shape."}
            </OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close wild shape monster picker" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody className={styles.body}>
          <section className={styles.selectionSection}>
            <div className={styles.selectionHeader}>
              <p className={styles.selectionLabel}>Chosen forms</p>
              {rules ? (
                <div className={styles.selectionMeta}>
                  <p className={styles.selectionLimit}>Max CR {rules.maxCrLabel}</p>
                  <p
                    className={styles.selectionCount}
                    aria-label={`${selectedMonsters.length} of ${rules.knownForms} forms selected`}
                  >
                    <span className={styles.selectionCountValue}>
                      {selectedMonsters.length}
                      <span className={styles.selectionCountDivider}>/</span>
                      {rules.knownForms}
                    </span>
                    <span className={styles.selectionCountLabel}>forms</span>
                  </p>
                </div>
              ) : null}
            </div>

            {selectedMonsters.length > 0 ? (
              <ul className={styles.selectionPills}>
                {selectedMonsters.map((monster) => (
                  <li key={monster.slug}>
                    <button
                      type="button"
                      className={styles.selectionPill}
                      onClick={() => removeMonster(monster.slug)}
                      aria-label={`Remove ${monster.name}`}
                    >
                      <Minus size={12} aria-hidden="true" />
                      <span>{monster.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptySelectionText}>No beast shapes selected yet.</p>
            )}

            {notice ? <p className={styles.noticeText}>{notice}</p> : null}
          </section>

          <div className={styles.filters}>
            <label className={styles.field}>
              <span>Search</span>
              <SearchField
                className={styles.input}
                value={query}
                onValueChange={setQuery}
                placeholder="Search monsters..."
              />
            </label>

            <label className={styles.field}>
              <span>Type</span>
              <select
                className={styles.select}
                value={monsterTypeFilter ?? "ALL"}
                disabled={onlyValidBeasts}
                onChange={(event) =>
                  setMonsterTypeFilter(event.target.value === "ALL" ? null : event.target.value)
                }
              >
                <option value="ALL">All</option>
                {MONSTER_TYPE_OPTIONS.map((monsterType) => (
                  <option key={monsterType} value={monsterType}>
                    {monsterType}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Source</span>
              <select
                className={styles.select}
                value={monsterSourceFilter ?? "ALL"}
                disabled={onlyValidBeasts}
                onChange={(event) =>
                  setMonsterSourceFilter(event.target.value === "ALL" ? null : event.target.value)
                }
              >
                <option value="ALL">All</option>
                {MONSTER_SOURCE_OPTIONS.map((monsterSource) => (
                  <option key={monsterSource} value={monsterSource}>
                    {monsterSource}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${styles.field} ${styles.checkboxField}`}>
              <span>Filter</span>
              <span className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={onlyValidBeasts}
                  onChange={(event) => setOnlyValidBeasts(event.target.checked)}
                />
                <span>Only valid beasts</span>
              </span>
            </label>
          </div>

          <MonsterCodexTable
            monsters={payload?.results ?? []}
            totalEntries={payload?.count ?? 0}
            status={status}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            ordering={monsterOrdering}
            onOrderingChange={setMonsterOrdering}
            onMonsterClick={(monster) => setPreviewSlug(monster.slug)}
            className={styles.tableSection}
            tableWrapperClassName={styles.tableScrollArea}
            paginationClassName={styles.tablePagination}
            getRowTone={(monster) =>
              isQualifiedWildShapeMonster(monster, rules?.maxCr ?? null) ? "valid" : "invalid"
            }
            renderNamePrefix={(monster) => {
              const disabledReason = getAddDisabledReason(monster);

              return (
                <button
                  type="button"
                  className={styles.tableAddButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    void addMonster(monster);
                  }}
                  disabled={pendingAddSlug === monster.slug || disabledReason !== null}
                  title={getAddButtonTitle(monster)}
                  aria-label={`Add ${monster.name}`}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              );
            }}
          />
        </OverlayBody>
      </SheetModal>

      {previewSlug ? (
        <MonsterEntryDrawer
          monster={previewMonster}
          status={previewStatus}
          onClose={() => setPreviewSlug(null)}
          badgeLabel="Wild Shape Preview"
          backdropClassName={styles.previewDrawerBackdrop}
          contentSurface="plain"
          showHeaderDivider
        />
      ) : null}
    </>
  );
}

export default DruidWildShapeMonsterModal;
