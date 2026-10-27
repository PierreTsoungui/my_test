
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import{ ProductVersionMatrixPage } from "./pages/ProductVersionMatrixPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
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
