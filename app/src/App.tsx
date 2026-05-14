import { Suspense, lazy } from "react";
import { LoaderCircle } from "lucide-react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell";
import styles from "./App.module.css";

const CharacterBuilderPage = lazy(() => import("./pages/CharactersPage/CharacterBuilderPage"));
const CharacterSheetPage = lazy(() => import("./pages/CharactersPage/CharacterSheetPage"));
const CharactersPage = lazy(() => import("./pages/CharactersPage"));
const CodexEntryPage = lazy(() => import("./pages/CodexEntryPage"));
const CodexPage = lazy(() => import("./pages/CodexPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ItemCodexEntryPage = lazy(() => import("./pages/ItemCodexEntryPage"));
const MonsterCodexEntryPage = lazy(() => import("./pages/MonsterCodexEntryPage"));

function RouteFallback() {
  return (
    <section className={styles.routeFallback} aria-live="polite" aria-busy="true">
      <h2 className={styles.loadingTitle}>
        <span>Loading</span>
        <LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
      </h2>
      <p className={styles.loadingText}>Next page is loading.</p>
    </section>
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
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/new" element={<CharacterBuilderPage />} />
          <Route path="/characters/:characterId/edit" element={<CharacterBuilderPage />} />
          <Route path="/characters/:characterId" element={<CharacterSheetPage />} />
          <Route path="/compendium" element={<CodexPage />} />
          <Route path="/compendium/items/:key" element={<ItemCodexEntryPage />} />
          <Route path="/compendium/monsters/:slug" element={<MonsterCodexEntryPage />} />
          <Route path="/compendium/:entryId" element={<CodexEntryPage />} />
          <Route path="/library/*" element={<LegacyCompendiumRedirect from="/library" />} />
          <Route path="/codex/*" element={<LegacyCompendiumRedirect from="/codex" />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
