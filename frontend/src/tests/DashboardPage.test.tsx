
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DashboardPage } from "../pages/DashboardPage";
import {
  getDashboardData,
  getProductVersions,
} from "../services/dashboardService";

// API-Funktionen simulieren
vi.mock("../services/dashboardService", () => ({
  getDashboardData: vi.fn(),
  getProductVersions: vi.fn(),
}));

// Diagrammkomponente für diesen Test vereinfachen
vi.mock("../components/dashboard/DonutSummaryCard", () => ({
  DonutSummaryCard: ({
    title,
    total,
  }: {
    title: string;
    total: number;
  }) => <div>{title}: {total}</div>,
}));

// Untergeordnete Komponenten vereinfachen
vi.mock("../components/dashboard/HighestSecurityRisks", () => ({
  HighestSecurityRisks: () => <div>Sicherheitsrisiken</div>,
}));

vi.mock("../components/dashboard/UpcomingEolCard", () => ({
  UpcomingEolCard: () => <div>Bevorstehende Support-Enden</div>,
}));

// SelectField durch ein natives HTML-Select ersetzen
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

const mockDashboardData = {
  totalComponents: 42,
  lifecycle: [
    { label: "Aktiv", value: 30, color: "#00ff00" },
  ],
  vulnerabilities: [
    { label: "High", value: 5, color: "#ff0000" },
  ],
  securityRisks: [],
  upcomingEol: [],
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

    expect(
      screen.getByText("Dashboard-Daten werden geladen …"),
    ).toBeInTheDocument();

    expect(await screen.findByText("42")).toBeInTheDocument();

    expect(screen.getByText("Lifecycle-Verteilung: 30"))
      .toBeInTheDocument();

    expect(
      screen.getByText("Offene Schwachstellen nach Schweregrad: 5"),
    ).toBeInTheDocument();

    expect(getProductVersions).toHaveBeenCalledTimes(1);
    expect(getDashboardData).toHaveBeenCalledWith(
      "all",
      expect.any(AbortSignal),
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
        expect.any(AbortSignal),
      );
    });
  });
});
