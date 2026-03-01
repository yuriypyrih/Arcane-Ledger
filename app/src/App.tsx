import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
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
        <Route path="/codex" element={<CodexPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
