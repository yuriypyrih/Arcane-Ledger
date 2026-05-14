import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ItemInspectionContent from "../../components/ItemInspection";
import styles from "./ItemCodexEntryPage.module.css";
import { useItemEntry } from "./useItemEntry";

function ItemCodexEntryPage() {
  const navigate = useNavigate();
  const { key } = useParams();
  const [searchParams] = useSearchParams();
  const { item, status } = useItemEntry(key);
  const backToCodexPath =
    searchParams.toString().length > 0 ? `/compendium?${searchParams}` : "/compendium";

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate(backToCodexPath)}>
        Back to compendium
      </button>

      {status === "loading" ? (
        <article className={styles.card}>
          <h2>Loading item...</h2>
          <p>Fetching item details from the configured backend.</p>
        </article>
      ) : null}

      {status === "error" ? (
        <article className={styles.card}>
          <h2>Item unavailable</h2>
          <p>The selected item could not be loaded.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to compendium
          </Link>
        </article>
      ) : null}

      {status === "server-unavailable" ? (
        <article className={styles.card}>
          <h2>Server Unavailable</h2>
          <p>Item details are unavailable because the backend is not configured or cannot be reached.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to compendium
          </Link>
        </article>
      ) : null}

      {status === "ready" && !item ? (
        <article className={styles.card}>
          <h2>Item not found</h2>
          <p>The selected item could not be found.</p>
          <Link to={backToCodexPath} className={styles.linkButton}>
            Back to compendium
          </Link>
        </article>
      ) : null}

      {status === "ready" && item ? (
        <article className={styles.card}>
          <ItemInspectionContent item={item} />
        </article>
      ) : null}
    </section>
  );
}

export default ItemCodexEntryPage;
