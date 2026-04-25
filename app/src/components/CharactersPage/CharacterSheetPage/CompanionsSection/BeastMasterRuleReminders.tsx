import type { BeastMasterRuleReminder } from "./beastMasterRuleReminderUtils";
import styles from "./CompanionsSection.module.css";

type BeastMasterRuleRemindersProps = {
  reminders: BeastMasterRuleReminder[];
};

export function BeastMasterRuleReminders({ reminders }: BeastMasterRuleRemindersProps) {
  if (reminders.length === 0) {
    return null;
  }

  return (
    <section className={styles.drawerSection}>
      <div className={styles.drawerSectionHeader}>
        <div>
          <p className={styles.panelEyebrow}>Beast Master</p>
          <h4 className={styles.drawerSectionTitle}>Rules reminders</h4>
        </div>
      </div>
      <div className={styles.ruleReminderList}>
        {reminders.map((reminder) => (
          <article key={reminder.title} className={styles.ruleReminderCard}>
            <strong>{reminder.title}</strong>
            <p>{reminder.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
