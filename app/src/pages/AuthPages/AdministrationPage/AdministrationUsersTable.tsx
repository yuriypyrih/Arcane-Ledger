import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import TablePagination from "../../../components/CodexPage/TablePagination";
import SearchField from "../../../components/SearchField";
import {
  ADMINISTRATION_USER_SEARCH_MAX_LENGTH,
  ADMINISTRATION_USER_SEARCH_MIN_LENGTH
} from "../../../types";
import type { AdministrationUser, AdministrationUserOrdering } from "../../../types";
import { formatAdministrationDate, formatAdministrationRole } from "./administrationFormatters";
import type { AdministrationUsersStatus } from "./useAdministrationUsers";
import styles from "./AdministrationPage.module.css";

type AdministrationSortField = "nickname" | "email" | "role" | "createdAt" | "lastActive";

const ADMINISTRATION_SEARCH_DEBOUNCE_MS = 600;

type AdministrationUsersTableProps = {
  currentPage: number;
  onOrderingChange: (ordering: AdministrationUserOrdering) => void;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onSelectUser: (user: AdministrationUser) => void;
  ordering: AdministrationUserOrdering;
  search: string;
  status: AdministrationUsersStatus;
  totalEntries: number;
  totalPages: number;
  users: AdministrationUser[];
};

const sortLabels: Record<AdministrationSortField, string> = {
  nickname: "Nickname",
  email: "Email",
  role: "Role",
  createdAt: "Created",
  lastActive: "Last Active"
};

function getOrderingState(ordering: AdministrationUserOrdering) {
  return {
    field: ordering.replace(/^-/, "") as AdministrationSortField,
    direction: ordering.startsWith("-") ? ("desc" as const) : ("asc" as const)
  };
}

function getNextOrdering(
  field: AdministrationSortField,
  ordering: AdministrationUserOrdering
): AdministrationUserOrdering {
  const orderingState = getOrderingState(ordering);
  const descending = orderingState.field === field && orderingState.direction === "asc";

  return `${descending ? "-" : ""}${field}` as AdministrationUserOrdering;
}

function getAriaSortValue(
  active: boolean,
  direction: "asc" | "desc"
): "ascending" | "descending" | "none" {
  if (!active) {
    return "none";
  }

  return direction === "asc" ? "ascending" : "descending";
}

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) {
    return <ArrowUpDown className={styles.sortIcon} aria-hidden="true" />;
  }

  return direction === "asc" ? (
    <ArrowUp className={styles.sortIcon} aria-hidden="true" />
  ) : (
    <ArrowDown className={styles.sortIcon} aria-hidden="true" />
  );
}

function SortableHeader({
  field,
  ordering,
  onOrderingChange
}: {
  field: AdministrationSortField;
  ordering: AdministrationUserOrdering;
  onOrderingChange: (ordering: AdministrationUserOrdering) => void;
}) {
  const orderingState = getOrderingState(ordering);
  const active = orderingState.field === field;
  const direction = active ? orderingState.direction : "asc";

  return (
    <th data-active={active} aria-sort={getAriaSortValue(active, direction)}>
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => onOrderingChange(getNextOrdering(field, ordering))}
      >
        <span>{sortLabels[field]}</span>
        <SortIcon active={active} direction={direction} />
      </button>
    </th>
  );
}

function AdministrationUsersTable({
  currentPage,
  onOrderingChange,
  onPageChange,
  onSearchChange,
  onSelectUser,
  ordering,
  search,
  status,
  totalEntries,
  totalPages,
  users
}: AdministrationUsersTableProps) {
  function renderRows() {
    if (status === "loading") {
      return (
        <tr>
          <td colSpan={5} className={styles.statusCell}>
            <strong>Loading users...</strong>
            <span>Fetching account records.</span>
          </td>
        </tr>
      );
    }

    if (status === "server-unavailable") {
      return (
        <tr>
          <td colSpan={5} className={styles.statusCell}>
            <strong>Server unavailable</strong>
            <span>User administration requires a connection to the backend.</span>
          </td>
        </tr>
      );
    }

    if (status === "error") {
      return (
        <tr>
          <td colSpan={5} className={styles.statusCell}>
            <strong>Unable to load users</strong>
            <span>Retry the request or adjust the current search.</span>
          </td>
        </tr>
      );
    }

    if (users.length === 0) {
      return (
        <tr>
          <td colSpan={5} className={styles.statusCell}>
            <strong>No users found</strong>
            <span>Try a different nickname or email search.</span>
          </td>
        </tr>
      );
    }

    return users.map((user) => (
      <tr
        key={user.id}
        className={styles.userRow}
        tabIndex={0}
        aria-label={`Open ${user.nickname}'s user details`}
        onClick={() => onSelectUser(user)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelectUser(user);
          }
        }}
      >
        <td className={styles.nicknameCell}>
          <strong className={styles.truncatedCell} title={user.nickname}>
            {user.nickname}
          </strong>
        </td>
        <td className={styles.emailCell}>
          <span className={styles.truncatedCell} title={user.email}>
            {user.email}
          </span>
        </td>
        <td>
          <span className={styles.roleBadge} data-role={user.role}>
            {formatAdministrationRole(user.role)}
          </span>
        </td>
        <td className={styles.dateCell}>{formatAdministrationDate(user.createdAt)}</td>
        <td className={styles.dateCell}>{formatAdministrationDate(user.lastActive)}</td>
      </tr>
    ));
  }

  return (
    <section className={styles.tableSection} aria-labelledby="administration-users-title">
      <div className={styles.tableHeader}>
        <div className={styles.tableTitle}>
          <h2 id="administration-users-title">Users</h2>
        </div>
      </div>
      <div className={styles.tableSearchRow}>
        <label className={styles.searchLabel}>
          <span>
            <Search size={15} aria-hidden="true" />
            Search users
          </span>
          <SearchField
            className={styles.tableSearchInput}
            value={search}
            onValueChange={onSearchChange}
            debounceMs={ADMINISTRATION_SEARCH_DEBOUNCE_MS}
            minLength={ADMINISTRATION_USER_SEARCH_MIN_LENGTH}
            maxLength={ADMINISTRATION_USER_SEARCH_MAX_LENGTH}
            placeholder="By nickname or email"
            name="administration-user-search"
            autoComplete="off"
            autoCapitalize="none"
            enterKeyHint="search"
            aria-label="Search users by nickname or email"
          />
        </label>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          alwaysVisible
          totalLabel={`${totalEntries} ${totalEntries === 1 ? "account" : "accounts"}`}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {(["nickname", "email", "role", "createdAt", "lastActive"] as const).map((field) => (
                <SortableHeader
                  key={field}
                  field={field}
                  ordering={ordering}
                  onOrderingChange={onOrderingChange}
                />
              ))}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </section>
  );
}

export default AdministrationUsersTable;
