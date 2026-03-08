import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock recharts — les composants passent simplement les données sans le DOM SVG
vi.mock("recharts", () => {
  const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  );
  const BarChart = ({ data, children }: { data: unknown[]; children: React.ReactNode }) => (
    <div data-testid="bar-chart" data-count={data.length}>{children}</div>
  );
  const PieChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  );
  const Pie = ({ data }: { data: unknown[] }) => (
    <div data-testid="pie" data-count={data.length} />
  );
  const Bar = ({ name }: { name: string }) => <div data-testid={`bar-${name}`} />;
  const Cell = () => <div />;
  const XAxis = () => <div />;
  const YAxis = () => <div />;
  const CartesianGrid = () => <div />;
  const Tooltip = () => <div />;
  const Legend = () => <div />;

  return { ResponsiveContainer, BarChart, PieChart, Pie, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend };
});

describe("IncomeExpenseBarChart", () => {
  it("renders bar chart with income and expenses bars", async () => {
    const { IncomeExpenseBarChart } = await import("@/components/charts/income-expense-bar-chart");
    const data = [
      { month: "jan. 26", income: 3000, expenses: 2000 },
      { month: "fév. 26", income: 3200, expenses: 2500 },
    ];
    render(<IncomeExpenseBarChart data={data} />);

    expect(screen.getByTestId("bar-chart")).toBeDefined();
    expect(screen.getByTestId("bar-chart").getAttribute("data-count")).toBe("2");
    expect(screen.getByTestId("bar-Revenus")).toBeDefined();
    expect(screen.getByTestId("bar-Dépenses")).toBeDefined();
  });

  it("returns null for empty data", async () => {
    const { IncomeExpenseBarChart } = await import("@/components/charts/income-expense-bar-chart");
    const { container } = render(<IncomeExpenseBarChart data={[]} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("CategoryPieChart", () => {
  it("renders pie chart with categories", async () => {
    const { CategoryPieChart } = await import("@/components/charts/category-pie-chart");
    const data = [
      { category: "Logement", total: 800 },
      { category: "Alimentation", total: 400 },
      { category: "Transport", total: 200 },
    ];
    render(<CategoryPieChart data={data} />);

    expect(screen.getByTestId("pie-chart")).toBeDefined();
    expect(screen.getByTestId("pie")).toBeDefined();
  });

  it("groups categories under 5% into Autres", async () => {
    const { CategoryPieChart } = await import("@/components/charts/category-pie-chart");
    const data = [
      { category: "Logement", total: 1000 },
      { category: "Petit", total: 10 },   // < 5% of 1020
      { category: "Minime", total: 10 },   // < 5% of 1020
    ];
    render(<CategoryPieChart data={data} />);

    const pie = screen.getByTestId("pie");
    // 1000 (Logement) + 20 (Autres) = 2 entries
    expect(pie.getAttribute("data-count")).toBe("2");
  });

  it("returns null for empty data", async () => {
    const { CategoryPieChart } = await import("@/components/charts/category-pie-chart");
    const { container } = render(<CategoryPieChart data={[]} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("RecurringTimelineChart", () => {
  it("renders timeline with income and expense bars", async () => {
    const { RecurringTimelineChart } = await import("@/components/charts/recurring-timeline-chart");
    const payments = [
      {
        id: 1, account_id: 1, name: "Loyer", type: "expense" as const,
        amount: 800, frequency: "monthly", next_date: "2026-04-01",
        category: "Logement", created_at: "2026-01-01",
        end_date: null, subcategory: null,
      },
      {
        id: 2, account_id: 1, name: "Salaire", type: "income" as const,
        amount: 3000, frequency: "monthly", next_date: "2026-04-01",
        category: "Salaire", created_at: "2026-01-01",
        end_date: null, subcategory: null,
      },
    ];
    render(<RecurringTimelineChart payments={payments} months={3} />);

    expect(screen.getByTestId("bar-chart")).toBeDefined();
    expect(screen.getByTestId("bar-chart").getAttribute("data-count")).toBe("3");
    expect(screen.getByTestId("bar-Revenus récurrents")).toBeDefined();
    expect(screen.getByTestId("bar-Charges récurrentes")).toBeDefined();
  });

  it("returns null for empty payments", async () => {
    const { RecurringTimelineChart } = await import("@/components/charts/recurring-timeline-chart");
    const { container } = render(<RecurringTimelineChart payments={[]} />);
    expect(container.innerHTML).toBe("");
  });
});
