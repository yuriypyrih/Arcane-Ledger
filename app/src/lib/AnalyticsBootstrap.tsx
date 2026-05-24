import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { bootstrapAnalytics, trackAnalyticsEvent } from "./analytics";

function getReferrerOrigin() {
  if (!document.referrer) {
    return "";
  }

  try {
    return new URL(document.referrer).origin;
  } catch {
    return "";
  }
}

function AnalyticsBootstrap() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    bootstrapAnalytics();
  }, []);

  useEffect(() => {
    if (lastTrackedPath.current === location.pathname) {
      return;
    }

    lastTrackedPath.current = location.pathname;
    trackAnalyticsEvent("page_view", {
      route: location.pathname,
      props: {
        referrerOrigin: getReferrerOrigin()
      }
    });
  }, [location.pathname]);

  return null;
}

export default AnalyticsBootstrap;
