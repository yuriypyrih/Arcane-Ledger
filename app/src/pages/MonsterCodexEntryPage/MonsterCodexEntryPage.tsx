import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import MonsterEntryRenderer from "../../components/MonsterEntryRenderer";
import styles from "./MonsterCodexEntryPage.module.css";
import { useMonsterEntry } from "./useMonsterEntry";

function MonsterCodexEntryPage() {
  const navigate = useNavigate();
  const { key } = useParams();
  const [searchParams] = useSearchParams();
  const { monster, status } = useMonsterEntry(key);
  const backToCodexPath =
    searchParams.toString().length > 0 ? `/compendium?${searchParams}` : "/compendium";

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate(backToCodexPath)}>
        Back to compendium
      </button>

      {status === "loading" ? (
        <article className={styles.card}>
          <h2>Loading monster...</h2>
          <p>Fetching monster details from the configured backend.</p>
        </article>
      ) : null}

      {status === "error" ? (
        <article className={styles.card}>
          <h2>Monster unavailable</h2>
          <p>The selected monster could not be loaded.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to compendium
          </Link>
        </article>
      ) : null}

      {status === "server-unavailable" ? (
        <article className={styles.card}>
          <h2>Server Unavailable</h2>
          <p>Monster details are unavailable because the backend is not configured or cannot be reached.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to compendium
          </Link>
        </article>
      ) : null}

      {status === "ready" && !monster ? (
        <article className={styles.card}>
          <h2>Monster not found</h2>
          <p>The selected monster could not be found.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to compendium
          </Link>
        </article>
      ) : null}

      {status === "ready" && monster ? <MonsterEntryRenderer monster={monster} /> : null}
    </section>
  );
}

export default MonsterCodexEntryPage;
