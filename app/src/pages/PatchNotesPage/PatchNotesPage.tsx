import DescriptionContent from "../../components/DescriptionContent/DescriptionContent";
import { patchNotes } from "./patchNotes";
import styles from "./PatchNotesPage.module.css";

const patchDateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC"
});

function PatchNotesPage() {
  return (
    <section className={styles.page} aria-labelledby="patch-notes-title">
      <div className={styles.notes}>
        {patchNotes.map((patch) => (
          <article className={styles.note} key={patch.version}>
            <div className={styles.noteHeading}>
              <div>
                <span className={styles.version}>{patch.version}</span>
                <h2>{patch.title}</h2>
              </div>
              <time dateTime={patch.date}>
                {patchDateFormatter.format(new Date(`${patch.date}T00:00:00Z`))}
              </time>
            </div>
            <DescriptionContent
              description={patch.description}
              className={styles.description}
              entryClassName={styles.descriptionEntry}
              strongClassName={styles.descriptionStrong}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

export default PatchNotesPage;
