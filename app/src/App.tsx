import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import CharacterBuilderPage from "./pages/CharactersPage/CharacterBuilderPage";
import CharacterSheetPage from "./pages/CharactersPage/CharacterSheetPage";
import CharactersPage from "./pages/CharactersPage";
import CodexPage from "./pages/CodexPage";
import DicePage from "./pages/DicePage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/dice" element={<DicePage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/characters/new" element={<CharacterBuilderPage />} />
        <Route path="/characters/:characterId/edit" element={<CharacterBuilderPage />} />
        <Route path="/characters/:characterId" element={<CharacterSheetPage />} />
        <Route path="/codex" element={<CodexPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
