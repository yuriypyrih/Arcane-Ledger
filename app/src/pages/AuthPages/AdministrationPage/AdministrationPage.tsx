import { RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { updateAdministrationUserRole } from "../../../api";
import ActionButton from "../../../components/ActionButton";
import { showToast, useAppDispatch, useAppSelector } from "../../../store";
import type {
  AdministrationAssignableRole,
  AdministrationUser,
  AdministrationUserOrdering
} from "../../../types";
import { getApiErrorMessage } from "../authPageUtils";
import styles from "./AdministrationPage.module.css";
import AdministrationUserModal from "./AdministrationUserModal";
import AdministrationUsersTable from "./AdministrationUsersTable";
import { useAdministrationUsers } from "./useAdministrationUsers";

const USERS_PER_PAGE = 20;

function AdministrationPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status: authStatus, user } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<AdministrationUserOrdering>("-createdAt");
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdministrationUser | null>(null);
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const isAdmin = user?.role === "admin";
  const { payload, status } = useAdministrationUsers({
    enabled: isAdmin,
    ordering,
    page,
    refreshSignal,
    search
  });
  const totalEntries = payload?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalEntries / USERS_PER_PAGE));

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  function handleOrderingChange(nextOrdering: AdministrationUserOrdering) {
    setOrdering(nextOrdering);
    setPage(1);
  }

  function openUser(userToOpen: AdministrationUser) {
    setRoleChangeError(null);
    setSelectedUser(userToOpen);
  }

  function closeUser() {
    if (isChangingRole) {
      return;
    }

    setRoleChangeError(null);
    setSelectedUser(null);
  }

  async function saveUserRole(role: AdministrationAssignableRole) {
    if (!selectedUser || isChangingRole) {
      return;
    }

    setIsChangingRole(true);
    setRoleChangeError(null);

    try {
      await updateAdministrationUserRole(selectedUser.id, { role }, { suppressFailureToast: true });
      dispatch(
        showToast({
          text: `${selectedUser.nickname} is now a ${role}.`,
          type: "success"
        })
      );
      setSelectedUser(null);
      setRefreshSignal((signal) => signal + 1);
    } catch (error) {
      setRoleChangeError(getApiErrorMessage(error, "Unable to change this user's role."));
    } finally {
      setIsChangingRole(false);
    }
  }

  if (authStatus === "unknown") {
    return (
      <section className={styles.accessPage}>
        <div className={styles.accessPanel}>
          <p className={styles.eyebrow}>Administration</p>
          <h1>Loading</h1>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (!isAdmin) {
    return (
      <section className={styles.accessPage}>
        <div className={styles.accessPanel}>
          <p className={styles.eyebrow}>Administration</p>
          <h1>Unavailable</h1>
          <p>This page is available to admins only.</p>
          <ActionButton fullWidth={false} onClick={() => navigate("/account")}>
            Account
          </ActionButton>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Administration</p>
          <h1>User Management</h1>
        </div>
        <ActionButton
          icon={<RefreshCw size={16} aria-hidden="true" />}
          fullWidth={false}
          loading={status === "loading"}
          onClick={() => setRefreshSignal((signal) => signal + 1)}
        >
          Refresh
        </ActionButton>
      </header>

      <AdministrationUsersTable
        users={payload?.results ?? []}
        totalEntries={totalEntries}
        status={status}
        currentPage={page}
        totalPages={totalPages}
        ordering={ordering}
        onPageChange={setPage}
        onOrderingChange={handleOrderingChange}
        onSearchChange={handleSearchChange}
        onSelectUser={openUser}
        search={search}
      />

      {selectedUser ? (
        <AdministrationUserModal
          user={selectedUser}
          error={roleChangeError}
          isBusy={isChangingRole}
          onClose={closeUser}
          onSave={(role) => void saveUserRole(role)}
        />
      ) : null}
    </section>
  );
}

export default AdministrationPage;
