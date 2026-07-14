import { LogIn, MailCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/ActionButton";
import styles from "./AuthPages.module.css";

type RegisterConfirmationViewProps = {
  message: string;
  resendCooldownSeconds: number;
  resendDisabled: boolean;
  resendUsed: boolean;
  resending: boolean;
  onResendVerification: () => void;
};

function RegisterConfirmationView({
  message,
  resendCooldownSeconds,
  resendDisabled,
  resendUsed,
  resending,
  onResendVerification
}: RegisterConfirmationViewProps) {
  const navigate = useNavigate();

  return (
    <section className={styles.page}>
      <div className={`${styles.panel} ${styles.confirmationPanel}`}>
        <div className={`${styles.message} ${styles.success} ${styles.confirmationMessage}`}>
          <MailCheck size={18} aria-hidden="true" />
          <span>{message}</span>
        </div>

        <div className={styles.actions}>
          <ActionButton
            icon={<LogIn size={16} aria-hidden="true" />}
            type="button"
            onClick={() => navigate("/login")}
          >
            Log In
          </ActionButton>
          <ActionButton
            icon={<MailCheck size={16} aria-hidden="true" />}
            loading={resending}
            variant="OUTLINE"
            type="button"
            disabled={resendDisabled}
            onClick={onResendVerification}
          >
            {resendUsed ? "Verification Email Sent" : "Resend Email"}
          </ActionButton>
        </div>

        {resendCooldownSeconds > 0 && !resendUsed ? (
          <p className={styles.resendTimer} role="timer">
            You can resend the verification email in {resendCooldownSeconds}s.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default RegisterConfirmationView;
