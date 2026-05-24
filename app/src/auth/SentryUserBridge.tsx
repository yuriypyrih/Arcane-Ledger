import { useEffect } from "react";
import { clearSentryUser, setSentryUser } from "../lib/sentry";
import { useAppSelector } from "../store";

function SentryUserBridge() {
  const { status, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "authenticated" && user) {
      setSentryUser({ id: user.id });
      return;
    }

    clearSentryUser();
  }, [status, user]);

  return null;
}

export default SentryUserBridge;
