import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";

const CharacterBuilderPage = lazy(() => import("./pages/CharactersPage/CharacterBuilderPage"));
const CharacterSheetPage = lazy(() => import("./pages/CharactersPage/CharacterSheetPage"));
const CharactersPage = lazy(() => import("./pages/CharactersPage"));
const CodexEntryPage = lazy(() => import("./pages/CodexEntryPage"));
const CodexPage = lazy(() => import("./pages/CodexPage"));
const DicePage = lazy(() => import("./pages/DicePage"));
const HomePage = lazy(() => import("./pages/HomePage"));

function RouteFallback() {
  return (
    <section
      style={{
        display: "grid",
        gap: "0.5rem",
        padding: "2rem",
        color: "var(--color-ink-soft)"
      }}
    >
          <h2 style={{ margin: 0, color: "var(--color-ink)" }}>Loading...</h2>
      <p style={{ margin: 0 }}>Preparing the next page.</p>
    </section>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/dice" element={<DicePage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/new" element={<CharacterBuilderPage />} />
          <Route path="/characters/:characterId/edit" element={<CharacterBuilderPage />} />
          <Route path="/characters/:characterId" element={<CharacterSheetPage />} />
          <Route path="/codex" element={<CodexPage />} />
          <Route path="/codex/:entryId" element={<CodexEntryPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
