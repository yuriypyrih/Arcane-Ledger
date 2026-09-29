import { useCustomBestiaryRecords, useMonsterPickerRecords } from "./useMonsterPickerRecords";
import { MONSTERS_PER_PAGE, useMonsterPickerPage } from "./useMonsterPickerPage";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { isApiOfflineError } from "../../../../api";
import { type CustomBestiaryListScope } from "../../../../api/customBestiary";
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
import { getDruidWildShapeRulesForCharacter } from "../../../../pages/CharactersPage/classFeatures";
import { useMonsterEntries } from "../../../../pages/CodexPage/useMonsterEntries";
import { useAppSelector } from "../../../../store";
import {
  customBestiaryRecordToListItem,
  filterCustomBestiaryRecords,
  sortCustomBestiaryRecords
} from "../CompanionsSection/customBestiaryBrowser";
import {
  getMonsterChallengeRatingNumber,
  getMonsterKey,
  getMonsterListItemKey
} from "../../../../utils/monsters";
import type { Character, MonsterListItem, MonsterOrdering, MonsterRecord } from "../../../../types";
import SheetActionButton from "../SheetActionButton";
import styles from "./DruidWildShapeMonsterModal.module.css";

type DruidWildShapeMonsterModalProps = {
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>;
  selectedMonsters: MonsterRecord[];
  onSelectedMonstersChange: (monsters: MonsterRecord[]) => void;
  onClose: () => void;
};
const DEFAULT_VALID_MONSTER_TYPE = "Beast";
const DEFAULT_VALID_MONSTER_SOURCE = "srd-2024";

function isQualifiedWildShapeMonster(
  monster: Pick<MonsterListItem, "typeKey" | "typeName" | "challengeRating">,
  maxCr: number | null
) {
  if (maxCr === null) {
    return false;
  }

  const typeLabel = monster.typeKey ?? monster.typeName ?? "";
  const challengeRating = getMonsterChallengeRatingNumber(monster);

  return (
    typeLabel.trim().toLowerCase() === "beast" &&
    challengeRating !== null &&
    challengeRating <= maxCr
  );
}

function DruidWildShapeMonsterModal({
  character,
  selectedMonsters,
  onSelectedMonstersChange,
  onClose
}: DruidWildShapeMonsterModalProps) {
  const rules = getDruidWildShapeRulesForCharacter(character);
  const isOnline = useOnlineStatus();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const canUseCustomBestiary = authStatus === "authenticated";
  const [query, setQuery] = useState("");
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const [monsterTypeFilter, setMonsterTypeFilter] = useState<string | null>(
    DEFAULT_VALID_MONSTER_TYPE
  );
  const [monsterSourceFilter, setMonsterSourceFilter] = useState<string | null>(
    DEFAULT_VALID_MONSTER_SOURCE
  );
  const [monsterOrdering, setMonsterOrdering] = useState<MonsterOrdering>("cr");
  const [monsterSourceMode, setMonsterSourceMode] = useState<"standard" | "custom">("standard");
  const [customBestiaryScope, setCustomBestiaryScope] = useState<CustomBestiaryListScope>("mine");
  const [onlyValidBeasts, setOnlyValidBeasts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingAddKey, setPendingAddKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isCustomBestiaryMode = canUseCustomBestiary && monsterSourceMode === "custom";
  const { customBestiaryRecords, customBestiaryStatus } = useCustomBestiaryRecords(
    authUserId,
    customBestiaryScope,
    isCustomBestiaryMode
  );

  const { previewKey, setPreviewKey, previewMonster, previewStatus, resolveMonster } =
    useMonsterPickerRecords(
      selectedMonsters,
      customBestiaryRecords,
      isOnline,
      `${authUserId}:${customBestiaryScope}:${monsterSourceMode}`
    );

  const { payload, status } = useMonsterEntries({
    enabled: !isCustomBestiaryMode,
    page: currentPage,
    limit: MONSTERS_PER_PAGE,
    search: query,
    type: onlyValidBeasts ? DEFAULT_VALID_MONSTER_TYPE : monsterTypeFilter,
    maxCr: onlyValidBeasts ? (rules?.maxCr ?? null) : null,
    source: onlyValidBeasts ? DEFAULT_VALID_MONSTER_SOURCE : monsterSourceFilter,
    ordering: monsterOrdering
  });
  const customBestiaryItems = useMemo(() => {
    const filteredRecords = filterCustomBestiaryRecords(customBestiaryRecords, {
      query,
      type: onlyValidBeasts ? DEFAULT_VALID_MONSTER_TYPE : (monsterTypeFilter ?? "all")
    }).filter((record) => {
      if (!onlyValidBeasts) {
        return true;
      }

      return isQualifiedWildShapeMonster(
        customBestiaryRecordToListItem(record),
        rules?.maxCr ?? null
      );
    });

    return sortCustomBestiaryRecords(filteredRecords, monsterOrdering).map(
      customBestiaryRecordToListItem
    );
  }, [
    customBestiaryRecords,
    monsterOrdering,
    monsterTypeFilter,
    onlyValidBeasts,
    query,
    rules?.maxCr
  ]);
  const { browserMonsters, browserTotalEntries, browserStatus, totalPages } = useMonsterPickerPage(
    currentPage,
    setCurrentPage,
    isCustomBestiaryMode,
    customBestiaryItems,
    customBestiaryStatus,
    payload,
    status
  );

  const selectedMonsterKeySet = useMemo(
    () => new Set(selectedMonsters.map((monster) => getMonsterKey(monster))),
    [selectedMonsters]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    customBestiaryScope,
    monsterOrdering,
    monsterSourceFilter,
    monsterSourceMode,
    monsterTypeFilter,
    onlyValidBeasts,
    query
  ]);

  useEffect(() => {
    if (canUseCustomBestiary || monsterSourceMode !== "custom") {
      return;
    }

    setMonsterSourceMode("standard");
  }, [canUseCustomBestiary, monsterSourceMode]);

  useEffect(() => {
    if (!onlyValidBeasts) {
      return;
    }

    setMonsterTypeFilter(DEFAULT_VALID_MONSTER_TYPE);
    setMonsterSourceFilter(DEFAULT_VALID_MONSTER_SOURCE);
  }, [onlyValidBeasts]);

  function removeMonster(key: string) {
    setNotice(null);
    onSelectedMonstersChange(selectedMonsters.filter((monster) => getMonsterKey(monster) !== key));
  }

  function getAddDisabledReason(monster: MonsterListItem) {
    if (selectedMonsterKeySet.has(getMonsterListItemKey(monster))) {
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

    const monsterKey = getMonsterListItemKey(monster);
    setPendingAddKey(monsterKey);
    setNotice(null);

    try {
      const fullMonster = await resolveMonster(monsterKey);
      if (!fullMonster) return;
      onSelectedMonstersChange([...selectedMonsters, fullMonster]);
      setNotice(null);
    } catch (error) {
      setNotice(
        isApiOfflineError(error)
          ? "Server Unavailable"
          : "The full monster entry could not be loaded."
      );
    } finally {
      setPendingAddKey(null);
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
                  <li key={getMonsterKey(monster)}>
                    <button
                      type="button"
                      className={styles.selectionPill}
                      onClick={() => removeMonster(getMonsterKey(monster))}
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
                disabled={onlyValidBeasts}
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
                disabled={onlyValidBeasts || isCustomBestiaryMode}
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
                  checked={onlyValidBeasts}
                  onCheckedChange={setOnlyValidBeasts}
                />
                <span>Only valid beasts</span>
              </span>
            </label>

            {canUseCustomBestiary ? (
              <div className={styles.sourceToggles}>
                {isCustomBestiaryMode ? (
                  <SegmentedToggle
                    ariaLabel="Custom wild shape creature scope"
                    value={customBestiaryScope}
                    options={[
                      { label: "Mine", value: "mine" },
                      { label: "Public", value: "public" }
                    ]}
                    onValueChange={(nextScope) => {
                      setCustomBestiaryScope(nextScope);
                    }}
                  />
                ) : null}
                <SegmentedToggle
                  ariaLabel="Wild shape creature stat block source"
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
              isQualifiedWildShapeMonster(monster, rules?.maxCr ?? null) ? "valid" : "invalid"
            }
            renderNamePrefix={(monster) => {
              const disabledReason = getAddDisabledReason(monster);
              const monsterKey = getMonsterListItemKey(monster);

              return (
                <SheetActionButton
                  className={styles.tableAddButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    void addMonster(monster);
                  }}
                  disabled={pendingAddKey === monsterKey || disabledReason !== null}
                  title={getAddButtonTitle(monster)}
                  aria-label={`Add ${monster.name}`}
                >
                  <Plus size={14} aria-hidden="true" />
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
