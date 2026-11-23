
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

import { OverviewMockPage } from "./pages/OverviewMockPage";


function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
       
        {import.meta.env.DEV && <Route path="/" element={<OverviewMockPage />} />}
       
        <Route
          path="/components"
          element={<div className="p-8">Komponenten</div>}
        />
        
        <Route
          path="/data-sources"
          element={<div className="p-8">Datenquellen</div>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
