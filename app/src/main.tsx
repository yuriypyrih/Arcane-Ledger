import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initializeAppUpdateLifecycle } from "./lib/appUpdate";
import { SentryErrorBoundary } from "./lib/SentryErrorBoundary";
import { initFrontendSentry } from "./lib/sentry";
import { store } from "./store";
import "./styles/global.css";

initFrontendSentry();
initializeAppUpdateLifecycle();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <SentryErrorBoundary>
    <Provider store={store}>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </BrowserRouter>
    </Provider>
  </SentryErrorBoundary>
);
