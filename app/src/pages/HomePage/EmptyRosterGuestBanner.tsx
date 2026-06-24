import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/ActionButton";
import emptyRosterBannerImageUrl from "../../assets/img/empty-roster-banner.webp";
import styles from "./HomePage.module.css";

function EmptyRosterGuestBanner() {
  const navigate = useNavigate();

  return (
    <section className={styles.emptyRosterBanner} aria-labelledby="home-empty-roster-banner-title">
      <div className={styles.emptyRosterBannerImageFrame} aria-hidden="true">
        <img
          className={styles.emptyRosterBannerImage}
          src={emptyRosterBannerImageUrl}
          alt=""
          width="1400"
          height="600"
        />
      </div>

      <div className={styles.emptyRosterBannerCopy}>
        <h3 id="home-empty-roster-banner-title" className={styles.emptyRosterBannerTitle}>
          Forge your first hero
        </h3>
        <p className={styles.emptyRosterBannerText}>
          Start with a fresh sheet and bring your first legend into the ledger.
        </p>
        <ActionButton
          className={styles.emptyRosterBannerAction}
          fullWidth={false}
          icon={<UserPlus size={16} aria-hidden="true" />}
          onClick={() => navigate("/characters/new")}
        >
          Create character
        </ActionButton>
      </div>
    </section>
  );
}

export default EmptyRosterGuestBanner;
