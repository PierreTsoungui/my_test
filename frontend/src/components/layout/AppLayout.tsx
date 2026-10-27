
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main id="main-content" className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
