import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "../../api/auth";
import { getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

function VerifyEmailPage() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying email...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setMessage("Email verification token is missing.");
      setIsError(true);
      return undefined;
    }

    void verifyEmail(token, { suppressFailureToast: true })
      .then((response) => {
        if (!cancelled) {
          setMessage(response.message);
          setIsError(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(getApiErrorMessage(error, "Unable to verify email."));
          setIsError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h2 className={styles.title}>Email Verification</h2>
        </div>

        <div className={`${styles.message} ${isError ? styles.error : styles.success}`}>
          <MailCheck size={15} aria-hidden="true" />
          <span>{message}</span>
        </div>

        <div className={styles.linkRow}>
          <Link className={styles.link} to="/login">
            Log in
          </Link>
          <Link className={styles.link} to="/">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default VerifyEmailPage;
