import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { SentryErrorBoundary } from "./lib/SentryErrorBoundary";
import { initFrontendSentry } from "./lib/sentry";
import { store } from "./store";
import "./styles/global.css";

initFrontendSentry();
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <SentryErrorBoundary>
    <Provider store={store}>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </BrowserRouter>
    </Provider>
  </SentryErrorBoundary>
);
