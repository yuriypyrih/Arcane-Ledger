import { Check, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { UserRole } from "../../types/auth";
import {
  accountPrivilegeRoles,
  accountPrivilegeRows,
  type AccountPrivilegeCellValue,
  type AccountPrivilegeRole
} from "./accountPrivileges";
import styles from "./AuthPages.module.css";

type AccountPrivilegesSectionProps = {
  role: UserRole;
};

const roleLabels: Record<AccountPrivilegeRole, string> = {
  guest: "Guest",
  user: "User",
  keeper: "Keeper",
  admin: "Admin"
};

function AccountPrivilegeCell({ value }: { value: AccountPrivilegeCellValue }) {
  if (value.kind === "text") {
    return <span>{value.value}</span>;
  }

  if (!value.included) {
    return <span className={styles.privilegeUnavailable}>-</span>;
  }

  return (
    <span className={styles.privilegeIncluded} aria-label="Included" title="Included">
      <Check size={17} aria-hidden="true" />
      <span className={styles.visuallyHidden}>Included</span>
    </span>
  );
}

function AccountPrivilegesSection({ role }: AccountPrivilegesSectionProps) {
  const isAdmin = role === "admin";
  const visibleRoles = accountPrivilegeRoles.filter((privilegeRole) =>
    privilegeRole === "admin" ? isAdmin : true
  );
  const visibleRows = accountPrivilegeRows.filter((row) => !row.adminOnly || isAdmin);

  return (
    <section className={styles.accountSection} aria-labelledby="account-privileges-title">
      <div className={styles.accountSectionHeader}>
        <span className={styles.accountSectionIcon}>
          <ShieldCheck size={20} aria-hidden="true" />
        </span>
        <div>
          <p className={styles.eyebrow}>Features</p>
          <h2 id="account-privileges-title" className={styles.accountSectionTitle}>
            Account Privileges
          </h2>
        </div>
      </div>

      <div className={styles.accountPrivilegesTableWrap}>
        <table className={styles.accountPrivilegesTable}>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {visibleRoles.map((privilegeRole) => (
                <th key={privilegeRole} scope="col">
                  {roleLabels[privilegeRole]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.feature}</th>
                {visibleRoles.map((privilegeRole) => (
                  <td key={`${row.feature}-${privilegeRole}`}>
                    <AccountPrivilegeCell value={row.values[privilegeRole]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.accountPrivilegesUpgradeText}>
        Want to upgrade to Keeper? Request it directly through the{" "}
        <Link to="/support">Support page</Link>.
      </p>
    </section>
  );
}

export default AccountPrivilegesSection;
