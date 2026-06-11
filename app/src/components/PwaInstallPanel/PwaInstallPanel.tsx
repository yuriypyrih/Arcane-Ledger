import { Download, EllipsisVertical, Share, SquarePlus } from "lucide-react";
import styles from "./PwaInstallPanel.module.css";

const installSteps = [
  {
    icon: EllipsisVertical,
    label: "Options",
    text: "Open your mobile browser menu."
  },
  {
    icon: Share,
    label: "Share",
    text: "On iOS you have to tap the share button. You can usually skip that on Android."
  },
  {
    icon: SquarePlus,
    label: "Add to Home Screen",
    text: 'Choose Add to Home Screen to install the app. Enable "Open as Web App" if that option exists. Done!'
  }
];

function PwaInstallPanel() {
  return (
    <section className={styles.installPanel} aria-labelledby="pwa-install-title">
      <div className={styles.installHeader}>
        <p className={styles.installEyebrow}>
          <Download size={15} aria-hidden="true" />
          <span>Consider Downloading</span>
        </p>
        <h3 id="pwa-install-title" className={styles.installTitle}>
          Native App Experience
        </h3>
      </div>

      <p className={styles.installIntro}>
        Save Arcane Ledger to your home screen to open it like an app. The process may differ from
        device to device, but the general mobile steps are:
      </p>

      <ol className={styles.installStepList}>
        {installSteps.map(({ icon: StepIcon, label, text }) => (
          <li key={label}>
            <span className={styles.installStepIcon} aria-hidden="true">
              <StepIcon size={17} strokeWidth={2.2} />
            </span>
            <span className={styles.installStepText}>
              <strong>{label}</strong>
              <span>{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default PwaInstallPanel;
