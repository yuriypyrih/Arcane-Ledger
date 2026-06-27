export const DM_TOOLS_CUSTOM_PAGE_SIZE = 20;

export function getDmToolsPageCount(totalItems: number, pageSize = DM_TOOLS_CUSTOM_PAGE_SIZE) {
  return Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize));
}

export function clampDmToolsPage(
  page: number,
  totalItems: number,
  pageSize = DM_TOOLS_CUSTOM_PAGE_SIZE
) {
  const pageCount = getDmToolsPageCount(totalItems, pageSize);
  const normalizedPage = Number.isFinite(page) ? Math.floor(page) : 1;

  return Math.min(Math.max(1, normalizedPage), pageCount);
}

export function getDmToolsPageItems<T>(
  items: T[],
  page: number,
  pageSize = DM_TOOLS_CUSTOM_PAGE_SIZE
) {
  const currentPage = clampDmToolsPage(page, items.length, pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  return items.slice(startIndex, startIndex + pageSize);
}
