import { useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CodexStatus, MonsterListItem, PaginatedApiResponse } from "../../../../types";
export const MONSTERS_PER_PAGE = 20;
export function useMonsterPickerPage(
  currentPage: number,
  setCurrentPage: Dispatch<SetStateAction<number>>,
  customMode: boolean,
  customItems: MonsterListItem[],
  customStatus: CodexStatus,
  payload: PaginatedApiResponse<MonsterListItem> | null,
  status: CodexStatus
) {
  const customPage = useMemo(
    () => customItems.slice((currentPage - 1) * MONSTERS_PER_PAGE, currentPage * MONSTERS_PER_PAGE),
    [currentPage, customItems]
  );
  const browserTotalEntries = customMode ? customItems.length : (payload?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(browserTotalEntries / MONSTERS_PER_PAGE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages, setCurrentPage]);
  return {
    browserMonsters: customMode ? customPage : (payload?.results ?? []),
    browserTotalEntries,
    browserStatus: customMode ? customStatus : status,
    totalPages
  };
}
