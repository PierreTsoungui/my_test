
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DashboardPage } from "../pages/DashboardPage";

import {
  getDashboardData,
  getProductVersions,
} from "../services/dashboardService";

import type { DashboardData } from "../types/dashboard";

// API-Funktionen simulieren
vi.mock("../services/dashboardService", () => ({
  getDashboardData: vi.fn(),
  getProductVersions: vi.fn(),
}));

// Diagrammkomponente vereinfachen
vi.mock("../components/dashboard/DonutSummaryCard", () => ({
  DonutSummaryCard: ({
    title,
    total,
  }: {
    title: string;
    total: number;
  }) => (
    <div>
      {title}: {total}
    </div>
  ),
}));

// Handlungsbedarf-Komponente vereinfachen.
// Damit testen wir, ob DashboardPage die richtigen Gruppen übergibt.
vi.mock("../components/dashboard/ActionRequiredComponents", () => ({
  ActionRequiredComponents: ({
    groups,
    totalItems,
  }: {
    groups: {
      id: string;
      productName: string;
      release: string;
    }[];
    totalItems: number;
  }) => (
    <section aria-label="Handlungsbedarf">
      <h2>Handlungsbedarf</h2>

      <p>{totalItems} Einträge</p>

      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            {group.productName} – Release {group.release}
          </li>
        ))}
      </ul>
    </section>
  ),
}));

// SelectField durch natives HTML-Select ersetzen
vi.mock("../components/ui/SelectField", () => ({
  SelectField: ({
    label,
    value,
    onChange,
    options,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    disabled: boolean;
  }) => (
    <label>
      {label}

      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));

// Beispieldaten für das Dashboard
const mockDashboardData: DashboardData = {
  totalComponents: 42,

  lifecycle: [
    { label: "Aktiv", value: 30, color: "#22C55E" },
    { label: "Bald EOL", value: 8, color: "#F59E0B" },
    { label: "EOL", value: 4, color: "#EF4444" },
  ],

  vulnerabilities: [
    { label: "High", value: 5, color: "#DC2626" },
  ],

  actionRequiredGroups: [
    {
      id: "ubuntu-22.04",
      productName: "Ubuntu",
      release: "22.04",
      componentCount: 5,

      lifecycle: {
        releaseDate: "2022-04-21",
        status: "NEAR_EOL",
        eoasDate: null,
        eolDate: "2027-06-30",
      },

      vulnerabilities: {
        totalCount: 3,
        affectedComponentCount: 2,

        severityCounts: {
          CRITICAL: 1,
          HIGH: 2,
          MEDIUM: 0,
          LOW: 0,
          UNKNOWN: 0,
        },

        checkedComponentCount: 5,
        notQueryableComponentCount: 0,
        failedComponentCount: 0,
      },
    },
  ],
};

const mockVersions = [
  { id: 1, label: "Version 1.0" },
  { id: 2, label: "Version 2.0" },
];

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    vi.mocked(getProductVersions).mockResolvedValue(mockVersions);
    vi.mocked(getDashboardData).mockResolvedValue(mockDashboardData);
  });

  it("lädt und zeigt die Dashboard-Daten an", async () => {
    render(<DashboardPage />);

    // Ladezustand anzeigen
    expect(
      screen.getByText("Dashboard-Daten werden geladen …")
    ).toBeInTheDocument();

    // Dashboard-Daten abwarten
    expect(await screen.findByText("42")).toBeInTheDocument();

    // Komponentenkennzahl
    const versionSelect = screen.getByRole("combobox", {
  name: "Produktversion",
});

expect(versionSelect).toHaveValue("all");;

    // Lifecycle-Donut
    expect(
      screen.getByText("Lifecycle-Verteilung: 42")
    ).toBeInTheDocument();

    // Schwachstellen-Donut
    expect(
      screen.getByText("Schwachstellen nach Schweregrad: 5")
    ).toBeInTheDocument();

    // Handlungsbedarf
    const actionRequiredSection = screen.getByRole("region", {
      name: "Handlungsbedarf",
    });

    expect(actionRequiredSection).toBeInTheDocument();

    expect(
      screen.getByText("Ubuntu – Release 22.04")
    ).toBeInTheDocument();

    expect(screen.getByText("1 Einträge")).toBeInTheDocument();

    // API-Aufrufe überprüfen
    expect(getProductVersions).toHaveBeenCalledTimes(1);

    expect(getDashboardData).toHaveBeenCalledWith(
      "all",
      expect.any(AbortSignal)
    );
  });

  it("lädt die Dashboard-Daten erneut, wenn die Produktversion gewechselt wird", async () => {
    const user = userEvent.setup();

    render(<DashboardPage />);

    await screen.findByText("42");

    const versionSelect = screen.getByRole("combobox", {
      name: "Produktversion",
    });

    await user.selectOptions(versionSelect, "2");

    await waitFor(() => {
      expect(getDashboardData).toHaveBeenLastCalledWith(
        "2",
        expect.any(AbortSignal)
      );
    });

    // Auswahl wird in der Session gespeichert
    expect(sessionStorage.getItem("selectedVersion")).toBe("2");
  });
});
