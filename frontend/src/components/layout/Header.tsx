
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Database,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Komponenten",
    to: "/components",
    icon: Package,
    end: false,
  },
  {
    label: "Datenquellen",
    to: "/data-sources",
    icon: Database,
    end: false,
  },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="relative flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <NavLink
          to="/"
          onClick={() => setIsMenuOpen(false)}
          aria-label="EOL & OSV Dashboard – Startseite"
          className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck size={23} aria-hidden="true" />
          </span>

          <span>
            <span className="block text-sm font-bold leading-5 text-slate-900">
              EOL &amp; OSV
            </span>
            <span className="block text-xs text-slate-500">
              Dashboard
            </span>
          </span>
        </NavLink>

        {/* Navigation: same links on mobile and desktop */}
        <nav
          id="main-navigation"
          aria-label="Hauptnavigation"
          className={`
            ${
              isMenuOpen
                ? "absolute inset-x-0 top-full border-b border-slate-200 bg-white p-3 shadow-lg"
                : "hidden"
            }
            md:static md:block md:border-0 md:bg-transparent
            md:p-0 md:shadow-none
          `}
        >
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:min-h-10 md:gap-2 md:px-4 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={
            isMenuOpen ? "Navigation schließen" : "Navigation öffnen"
          }
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
        >
          {isMenuOpen ? (
            <X size={21} aria-hidden="true" />
          ) : (
            <Menu size={21} aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}
