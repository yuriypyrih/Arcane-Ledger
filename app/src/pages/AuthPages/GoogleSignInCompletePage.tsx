import { LoaderCircle, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";
import { markAuthSessionActive } from "../../auth/authSessionLifecycle";
import { setAuthenticatedSession, useAppDispatch } from "../../store";
import styles from "./AuthPages.module.css";

function GoogleSignInCompletePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getCurrentUser({ suppressFailureToast: true })
      .then(({ user }) => {
        if (cancelled) {
          return;
        }

        markAuthSessionActive();
        dispatch(setAuthenticatedSession(user));
        navigate("/", { replace: true });
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h2 className={styles.title}>Google Sign-In</h2>
        </div>

        {failed ? (
          <>
            <div className={`${styles.message} ${styles.error}`}>
              <ShieldAlert size={15} aria-hidden="true" />
              <span>We could not finish signing you in. Please try again.</span>
            </div>
            <div className={styles.linkRow}>
              <Link className={styles.link} to="/login">
                Back to log in
              </Link>
            </div>
          </>
        ) : (
          <div className={`${styles.message} ${styles.info}`}>
            <LoaderCircle size={15} aria-hidden="true" />
            <span>Signing you in...</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default GoogleSignInCompletePage;
