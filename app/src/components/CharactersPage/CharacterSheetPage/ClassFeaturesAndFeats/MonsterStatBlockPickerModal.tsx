import { Check, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchMonsterByKey, isApiOfflineError } from "../../../../api";
import {
  listCustomBestiary,
  type CustomBestiaryListScope,
  type CustomBestiaryRecord
} from "../../../../api/customBestiary";
import MonsterCodexTable from "../../../CodexPage/MonsterCodexTable";
import { MONSTER_SOURCE_OPTIONS, MONSTER_TYPE_OPTIONS } from "../../../../constants/monsters";
import { useOnlineStatus } from "../../../../lib/useOnlineStatus";
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
import SegmentedToggle from "../../../SegmentedToggle";
import Checkbox from "../../FormInputs/Checkbox";
import SelectInput from "../../FormInputs/SelectInput";
import { useMonsterEntries } from "../../../../pages/CodexPage/useMonsterEntries";
import { useAppSelector } from "../../../../store";
import {
  customBestiaryRecordToListItem,
  filterCustomBestiaryRecords,
  getCustomBestiaryMonsterByKey,
  sortCustomBestiaryRecords
} from "../CompanionsSection/customBestiaryBrowser";
import {
  getCachedMonsterEntry,
  getMonsterChallengeRatingNumber,
  getMonsterKey,
  getMonsterListItemKey,
  getMonsterTypeName,
  primeMonsterEntryCache
} from "../../../../utils/monsters";
import type {
  CodexStatus,
  MonsterListItem,
  MonsterOrdering,
  MonsterRecord
} from "../../../../types";
import SheetActionButton from "../SheetActionButton";
import styles from "./DruidWildShapeMonsterModal.module.css";

type MonsterStatBlockPickerModalProps = {
  titleId: string;
  eyebrow: string;
  title: string;
  summary: string;
  selectedMonster: MonsterRecord | null;
  eligibleOnlyLabel: string;
  eligibleTypes: string[];
  eligibleMaxCr: number;
  onSelectMonster: (monster: MonsterRecord) => void;
  onClose: () => void;
};

const MONSTERS_PER_PAGE = 20;

function isEligibleMonsterType(typeLabel: string | null | undefined, eligibleTypes: string[]) {
  const normalizedTypeLabel = typeLabel?.trim().toLowerCase();

  return (
    normalizedTypeLabel !== undefined &&
    eligibleTypes.some((type) => type.toLowerCase() === normalizedTypeLabel)
  );
}

function isEligibleStatBlock(
  monster: Pick<MonsterListItem, "typeKey" | "typeName" | "challengeRating">,
  eligibleTypes: string[],
  eligibleMaxCr: number
) {
  const challengeRating = getMonsterChallengeRatingNumber(monster);

  return (
    (isEligibleMonsterType(monster.typeKey, eligibleTypes) ||
      isEligibleMonsterType(monster.typeName, eligibleTypes)) &&
    challengeRating !== null &&
    challengeRating <= eligibleMaxCr
  );
}

function isEligibleMonsterRecord(
  monster: MonsterRecord,
  eligibleTypes: string[],
  eligibleMaxCr: number
) {
  return (
    isEligibleMonsterType(monster.type?.key, eligibleTypes) ||
    isEligibleMonsterType(getMonsterTypeName(monster), eligibleTypes)
  ) && (getMonsterChallengeRatingNumber(monster) ?? Infinity) <= eligibleMaxCr;
}

function MonsterStatBlockPickerModal({
  titleId,
  eyebrow,
  title,
  summary,
  selectedMonster,
  eligibleOnlyLabel,
  eligibleTypes,
  eligibleMaxCr,
  onSelectMonster,
  onClose
}: MonsterStatBlockPickerModalProps) {
  const isOnline = useOnlineStatus();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const canUseCustomBestiary = authStatus === "authenticated";
  const [query, setQuery] = useState("");
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const [monsterTypeFilter, setMonsterTypeFilter] = useState<string | null>(null);
  const [monsterSourceFilter, setMonsterSourceFilter] = useState<string | null>(null);
  const [monsterOrdering, setMonsterOrdering] = useState<MonsterOrdering>("cr");
  const [monsterSourceMode, setMonsterSourceMode] = useState<"standard" | "custom">("standard");
  const [customBestiaryScope, setCustomBestiaryScope] = useState<CustomBestiaryListScope>("mine");
  const [customBestiaryRecords, setCustomBestiaryRecords] = useState<CustomBestiaryRecord[]>([]);
  const [customBestiaryStatus, setCustomBestiaryStatus] = useState<CodexStatus>("ready");
  const [eligibleOnly, setEligibleOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewMonster, setPreviewMonster] = useState<MonsterRecord | null>(null);
  const [previewStatus, setPreviewStatus] = useState<CodexStatus>("ready");
  const [pendingSelectKey, setPendingSelectKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [monsterCache, setMonsterCache] = useState<Record<string, MonsterRecord>>(() =>
    selectedMonster ? { [getMonsterKey(selectedMonster)]: selectedMonster } : {}
  );
  const loadedCustomBestiaryForAuthRef = useRef<string | null>(null);
  const isCustomBestiaryMode = canUseCustomBestiary && monsterSourceMode === "custom";
  const selectedMonsterKey = selectedMonster ? getMonsterKey(selectedMonster) : null;
  const { payload, status } = useMonsterEntries({
    enabled: !isCustomBestiaryMode,
    page: currentPage,
    limit: MONSTERS_PER_PAGE,
    search: query,
    type: eligibleOnly ? null : monsterTypeFilter,
    types: eligibleOnly ? eligibleTypes : null,
    maxCr: eligibleOnly ? eligibleMaxCr : null,
    source: monsterSourceFilter,
    ordering: monsterOrdering
  });
  const customBestiaryItems = useMemo(() => {
    const filteredRecords = filterCustomBestiaryRecords(customBestiaryRecords, {
      query,
      type: eligibleOnly ? "all" : (monsterTypeFilter ?? "all")
    }).filter((record) => {
      if (!eligibleOnly) {
        return true;
      }

      return isEligibleMonsterRecord(record.monster, eligibleTypes, eligibleMaxCr);
    });

    return sortCustomBestiaryRecords(filteredRecords, monsterOrdering).map(
      customBestiaryRecordToListItem
    );
  }, [
    customBestiaryRecords,
    eligibleMaxCr,
    eligibleOnly,
    eligibleTypes,
    monsterOrdering,
    monsterTypeFilter,
    query
  ]);
  const customBestiaryPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * MONSTERS_PER_PAGE;

    return customBestiaryItems.slice(startIndex, startIndex + MONSTERS_PER_PAGE);
  }, [currentPage, customBestiaryItems]);
  const browserMonsters = isCustomBestiaryMode ? customBestiaryPageItems : (payload?.results ?? []);
  const browserTotalEntries = isCustomBestiaryMode
    ? customBestiaryItems.length
    : (payload?.count ?? 0);
  const browserStatus = isCustomBestiaryMode ? customBestiaryStatus : status;
  const totalPages = Math.max(1, Math.ceil(browserTotalEntries / MONSTERS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [
    customBestiaryScope,
    eligibleOnly,
    monsterOrdering,
    monsterSourceFilter,
    monsterSourceMode,
    monsterTypeFilter,
    query
  ]);

  useEffect(() => {
    if (canUseCustomBestiary || monsterSourceMode !== "custom") {
      return;
    }

    setMonsterSourceMode("standard");
  }, [canUseCustomBestiary, monsterSourceMode]);

  useEffect(() => {
    if (currentPage <= totalPages) {
      return;
    }

    setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!selectedMonster) {
      return;
    }

    setMonsterCache((currentCache) => ({
      ...currentCache,
      [getMonsterKey(selectedMonster)]: selectedMonster
    }));
  }, [selectedMonster]);

  useEffect(() => {
    let active = true;
    const loadKey =
      isCustomBestiaryMode && authUserId ? `${authUserId}:${customBestiaryScope}` : null;

    if (!loadKey) {
      return () => {
        active = false;
      };
    }

    if (loadedCustomBestiaryForAuthRef.current === loadKey) {
      return () => {
        active = false;
      };
    }

    loadedCustomBestiaryForAuthRef.current = loadKey;
    setCustomBestiaryStatus("loading");

    void listCustomBestiary({
      scope: customBestiaryScope,
      suppressFailureToast: true
    })
      .then(({ customBestiary }) => {
        if (!active) {
          return;
        }

        setCustomBestiaryRecords(customBestiary);
        setCustomBestiaryStatus("ready");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setCustomBestiaryStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
        loadedCustomBestiaryForAuthRef.current = null;
      });

    return () => {
      active = false;
    };
  }, [authUserId, customBestiaryScope, isCustomBestiaryMode]);

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function loadPreview() {
      if (!previewKey) {
        setPreviewMonster(null);
        setPreviewStatus("ready");
        return;
      }

      const customBestiaryMonster = getCustomBestiaryMonsterByKey(
        customBestiaryRecords,
        previewKey
      );
      const cachedMonster =
        customBestiaryMonster ?? monsterCache[previewKey] ?? getCachedMonsterEntry(previewKey);

      if (cachedMonster) {
        primeMonsterEntryCache(cachedMonster);
        setPreviewMonster(cachedMonster);
        setPreviewStatus("ready");
        return;
      }

      if (!isOnline) {
        setPreviewMonster(null);
        setPreviewStatus("server-unavailable");
        return;
      }

      setPreviewStatus("loading");

      try {
        const payload = await fetchMonsterByKey(previewKey, {
          signal: abortController.signal
        });

        if (!active) {
          return;
        }

        primeMonsterEntryCache(payload);
        setMonsterCache((currentCache) => ({
          ...currentCache,
          [getMonsterKey(payload)]: payload
        }));
        setPreviewMonster(payload);
        setPreviewStatus("ready");
      } catch (error) {
        if (!active || abortController.signal.aborted) {
          return;
        }

        setPreviewMonster(null);
        setPreviewStatus(isApiOfflineError(error) ? "server-unavailable" : "error");
      }
    }

    void loadPreview();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [customBestiaryRecords, isOnline, monsterCache, previewKey]);

  async function selectMonster(monster: MonsterListItem) {
    const monsterKey = getMonsterListItemKey(monster);

    if (monsterKey === selectedMonsterKey) {
      return;
    }

    setPendingSelectKey(monsterKey);
    setNotice(null);

    try {
      const fullMonster =
        getCustomBestiaryMonsterByKey(customBestiaryRecords, monsterKey) ??
        monsterCache[monsterKey] ??
        (await fetchMonsterByKey(monsterKey));

      setMonsterCache((currentCache) => ({
        ...currentCache,
        [getMonsterKey(fullMonster)]: fullMonster
      }));
      onSelectMonster(fullMonster);
      onClose();
    } catch (error) {
      setNotice(
        isApiOfflineError(error)
          ? "Server Unavailable"
          : "The full monster entry could not be loaded."
      );
    } finally {
      setPendingSelectKey(null);
    }
  }

  return (
    <>
      <SheetModal
        titleId={titleId}
        onClose={onClose}
        size="large"
        panelClassName={styles.modalPanel}
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayEyebrow>{eyebrow}</OverlayEyebrow>
            <OverlayTitleRow>
              <OverlayTitle as="h2" id={titleId}>
                {title}
              </OverlayTitle>
            </OverlayTitleRow>
            <OverlaySummary>{summary}</OverlaySummary>
          </OverlayHeaderContent>
          <OverlayCloseButton label="Close stat block picker" onClick={onClose} />
        </OverlayHeader>

        <OverlayBody className={styles.body}>
          <section className={styles.selectionSection}>
            <div className={styles.selectionHeader}>
              <p className={styles.selectionLabel}>Selected stat block</p>
              <div className={styles.selectionMeta}>
                <p className={styles.selectionLimit}>Max CR {eligibleMaxCr}</p>
              </div>
            </div>

            {selectedMonster ? (
              <ul className={styles.selectionPills}>
                <li>
                  <button
                    type="button"
                    className={styles.selectionPill}
                    onClick={() => setPreviewKey(getMonsterKey(selectedMonster))}
                    aria-label={`Preview ${selectedMonster.name}`}
                  >
                    <Check size={12} aria-hidden="true" />
                    <span>{selectedMonster.name}</span>
                  </button>
                </li>
              </ul>
            ) : (
              <p className={styles.emptySelectionText}>No stat block selected yet.</p>
            )}

            {notice ? <p className={styles.noticeText}>{notice}</p> : null}
          </section>

          <div className={styles.filters}>
            <label className={styles.field}>
              <span>Search</span>
              <SearchField
                className={styles.input}
                value={query}
                resetSignal={searchResetSignal}
                onValueChange={setQuery}
                placeholder="Search monsters..."
              />
            </label>

            <label className={styles.field}>
              <span>Type</span>
              <SelectInput
                className={styles.select}
                value={monsterTypeFilter ?? "ALL"}
                disabled={eligibleOnly}
                onChange={(event) => {
                  setQuery("");
                  setSearchResetSignal((currentSignal) => currentSignal + 1);
                  setMonsterTypeFilter(event.target.value === "ALL" ? null : event.target.value);
                }}
              >
                <option value="ALL">All</option>
                {MONSTER_TYPE_OPTIONS.map((monsterType) => (
                  <option key={monsterType} value={monsterType}>
                    {monsterType}
                  </option>
                ))}
              </SelectInput>
            </label>

            <label className={styles.field}>
              <span>Source</span>
              <SelectInput
                className={styles.select}
                value={monsterSourceFilter ?? "ALL"}
                disabled={isCustomBestiaryMode}
                onChange={(event) => {
                  setQuery("");
                  setSearchResetSignal((currentSignal) => currentSignal + 1);
                  setMonsterSourceFilter(event.target.value === "ALL" ? null : event.target.value);
                }}
              >
                <option value="ALL">All</option>
                {MONSTER_SOURCE_OPTIONS.map((monsterSource) => (
                  <option key={monsterSource} value={monsterSource}>
                    {monsterSource}
                  </option>
                ))}
              </SelectInput>
            </label>

            <label className={`${styles.field} ${styles.checkboxField}`}>
              <span>Filter</span>
              <span className={styles.checkboxLabel}>
                <Checkbox
                  rootAs="span"
                  markerClassName={styles.checkbox}
                  checked={eligibleOnly}
                  onCheckedChange={setEligibleOnly}
                />
                <span>{eligibleOnlyLabel}</span>
              </span>
            </label>

            {canUseCustomBestiary ? (
              <div className={styles.sourceToggles}>
                {isCustomBestiaryMode ? (
                  <SegmentedToggle
                    ariaLabel="Custom stat block scope"
                    value={customBestiaryScope}
                    options={[
                      { label: "Mine", value: "mine" },
                      { label: "Public", value: "public" }
                    ]}
                    onValueChange={(nextScope) => {
                      loadedCustomBestiaryForAuthRef.current = null;
                      setCustomBestiaryScope(nextScope);
                    }}
                  />
                ) : null}
                <SegmentedToggle
                  ariaLabel="Stat block source"
                  value={monsterSourceMode}
                  options={[
                    { label: "Standard", value: "standard" },
                    { label: "Custom", value: "custom" }
                  ]}
                  onValueChange={setMonsterSourceMode}
                />
              </div>
            ) : null}
          </div>

          <MonsterCodexTable
            monsters={browserMonsters}
            totalEntries={browserTotalEntries}
            status={browserStatus}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            ordering={monsterOrdering}
            onOrderingChange={setMonsterOrdering}
            onMonsterClick={(monster) => setPreviewKey(getMonsterListItemKey(monster))}
            className={styles.tableSection}
            tableWrapperClassName={styles.tableScrollArea}
            paginationClassName={styles.tablePagination}
            getRowTone={(monster) =>
              eligibleOnly
                ? isEligibleStatBlock(monster, eligibleTypes, eligibleMaxCr)
                  ? "valid"
                  : "invalid"
                : null
            }
            renderNamePrefix={(monster) => {
              const monsterKey = getMonsterListItemKey(monster);
              const isSelected = monsterKey === selectedMonsterKey;

              return (
                <SheetActionButton
                  className={styles.tableAddButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    void selectMonster(monster);
                  }}
                  disabled={pendingSelectKey === monsterKey || isSelected}
                  title={isSelected ? "Selected stat block" : "Select stat block"}
                  aria-label={`${isSelected ? "Selected" : "Select"} ${monster.name}`}
                >
                  {isSelected ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <Plus size={14} aria-hidden="true" />
                  )}
                </SheetActionButton>
              );
            }}
          />
        </OverlayBody>
      </SheetModal>

      {previewKey ? (
        <MonsterEntryDrawer
          monster={previewMonster}
          status={previewStatus}
          onClose={() => setPreviewKey(null)}
          badgeLabel="Stat Block Preview"
          backdropClassName={styles.previewDrawerBackdrop}
          contentSurface="plain"
          showHeaderDivider
        />
      ) : null}
    </>
  );
}

export default MonsterStatBlockPickerModal;
