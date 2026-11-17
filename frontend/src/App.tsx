
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/OverviewMockPage";
import { ProductOverviewPage } from "./pages/ProductOverviewPage";
import { OverviewMockPage } from "./pages/OverviewMockPage";
import{ ProductVersionMatrixPage } from "./pages/ProductVersionMatrixPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<ProductOverviewPage />} />
        {import.meta.env.DEV && <Route path="/overview-mock" element={<OverviewMockPage />} />}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/components"
          element={<div className="p-8">Komponenten</div>}
        />
        <Route
          path="/product-version-matrix"
          element={<ProductVersionMatrixPage />}    
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
