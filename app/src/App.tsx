import { Suspense, lazy } from "react";
import { Compass } from "lucide-react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthSessionBootstrap from "./auth/AuthSessionBootstrap";
import PreferencesSyncBootstrap from "./auth/PreferencesSyncBootstrap";
import SentryUserBridge from "./auth/SentryUserBridge";
import CharacterSyncBootstrap from "./characterSync/CharacterSyncBootstrap";
import AppShell from "./components/AppShell";
import AnalyticsBootstrap from "./lib/AnalyticsBootstrap";
import PageLoadingFallback from "./components/PageLoadingFallback";
import styles from "./App.module.css";

const LEGACY_NETLIFY_HOSTNAME = "arcane-ledger.netlify.app";
const ARCANE_LEDGER_HOME_URL = "https://arcane-ledger.com";

const AccountPage = lazy(() => import("./pages/AuthPages/AccountPage"));
const AnalyticsPage = lazy(() => import("./pages/AuthPages/AnalyticsPage"));
const CharacterBuilderPage = lazy(() => import("./pages/CharactersPage/CharacterBuilderPage"));
const CharacterSheetPage = lazy(() => import("./pages/CharactersPage/CharacterSheetPage"));
const CharactersPage = lazy(() => import("./pages/CharactersPage"));
const CodexEntryPage = lazy(() => import("./pages/CodexEntryPage"));
const CodexPage = lazy(() => import("./pages/CodexPage"));
const DmToolsPage = lazy(() => import("./pages/DmToolsPage"));
const ForgotPasswordPage = lazy(() => import("./pages/AuthPages/ForgotPasswordPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ItemCodexEntryPage = lazy(() => import("./pages/ItemCodexEntryPage"));
const LoginPage = lazy(() => import("./pages/AuthPages/LoginPage"));
const MonsterCodexEntryPage = lazy(() => import("./pages/MonsterCodexEntryPage"));
const PartyGroupDetailPage = lazy(() => import("./pages/DmToolsPage/PartyGroupDetailPage"));
const RegisterPage = lazy(() => import("./pages/AuthPages/RegisterPage"));
const ResetPasswordPage = lazy(() => import("./pages/AuthPages/ResetPasswordPage"));
const SupportPage = lazy(() => import("./pages/AuthPages/SupportPage"));
const VerifyEmailPage = lazy(() => import("./pages/AuthPages/VerifyEmailPage"));

function isLegacyNetlifyHost() {
  return typeof window !== "undefined" && window.location.hostname === LEGACY_NETLIFY_HOSTNAME;
}

function LegacyDomainNotice() {
  return (
    <main className={styles.legacyPage}>
      <section className={styles.legacyNotice} aria-labelledby="legacy-domain-title">
        <div className={styles.legacyIcon} aria-hidden="true">
          <Compass size={30} strokeWidth={1.8} />
        </div>
        <h1 id="legacy-domain-title">Arcane Ledger Has Moved</h1>
        <p>
          Thank you for helping alpha test Arcane Ledger. We have moved to a new home:
          {" "}
          <a href={ARCANE_LEDGER_HOME_URL}>{ARCANE_LEDGER_HOME_URL}</a>. Come join us there.
        </p>
      </section>
    </main>
  );
}

function LegacyCompendiumRedirect({ from }: { from: "/codex" | "/library" }) {
  const location = useLocation();
  const pathname = location.pathname.replace(from, "/compendium");

  return (
    <Navigate
      replace
      to={{
        pathname,
        search: location.search,
        hash: location.hash
      }}
    />
  );
}

function App() {
  if (isLegacyNetlifyHost()) {
    return <LegacyDomainNotice />;
  }

  return (
    <>
      <AuthSessionBootstrap />
      <PreferencesSyncBootstrap />
      <SentryUserBridge />
      <CharacterSyncBootstrap />
      <AnalyticsBootstrap />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/characters/new" element={<CharacterBuilderPage />} />
            <Route path="/characters/:characterId/edit" element={<CharacterBuilderPage />} />
            <Route path="/characters/:characterId" element={<CharacterSheetPage />} />
            <Route path="/compendium" element={<CodexPage />} />
            <Route path="/dm-tools" element={<DmToolsPage />} />
            <Route path="/dm-tools/party-manager/:partyGroupId" element={<PartyGroupDetailPage />} />
            <Route path="/compendium/items/:key" element={<ItemCodexEntryPage />} />
            <Route path="/compendium/monsters/:slug" element={<MonsterCodexEntryPage />} />
            <Route path="/compendium/:entryId" element={<CodexEntryPage />} />
            <Route path="/library/*" element={<LegacyCompendiumRedirect from="/library" />} />
            <Route path="/codex/*" element={<LegacyCompendiumRedirect from="/codex" />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
