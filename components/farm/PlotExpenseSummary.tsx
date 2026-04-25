"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { Plot, SprayRecord, CuttingRecord, LabourWork, OtherExpense } from "@/types";

interface PlotExpenseSummaryProps {
  plot: Plot;
  allPlots: Plot[];
  sprayRecords: SprayRecord[];
  cuttingRecords: CuttingRecord[];
  labourWork: LabourWork[];
  expenses: OtherExpense[];
}

const COLORS = ["#2D6A4F", "#F9C74F", "#4E9AF1", "#F8961E"];

export function PlotExpenseSummary({
  plot, allPlots, sprayRecords, cuttingRecords, labourWork, expenses,
}: PlotExpenseSummaryProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  const summary = useMemo(() => {
    const yearStr = String(year);

    const sprayCost = sprayRecords
      .filter((r) => r.plotId === plot.id && r.sprayDate.startsWith(yearStr))
      .reduce((s, r) => s + r.totalSprayCost, 0);

    const cuttingCost = cuttingRecords
      .filter((r) => r.plotId === plot.id && r.cuttingDate.startsWith(yearStr))
      .reduce((s, r) => s + r.totalLabourCost, 0);

    const labourCost = labourWork
      .filter((w) => w.workDate.startsWith(yearStr))
      .reduce((s, w) => s + w.amount, 0);

    const totalFarmAcres = allPlots.filter((p) => p.isActive).reduce((s, p) => s + p.areaAcres, 0);
    const totalGeneralExpenses = expenses
      .filter((e) => e.expenseDate.startsWith(yearStr))
      .reduce((s, e) => s + e.amount, 0);
    const generalProrated = totalFarmAcres > 0 ? (plot.areaAcres / totalFarmAcres) * totalGeneralExpenses : 0;

    const total = sprayCost + cuttingCost + labourCost + generalProrated;
    const costPerAcre = plot.areaAcres > 0 ? total / plot.areaAcres : 0;

    return {
      sprayCost, cuttingCost, labourCost, generalProrated, total, costPerAcre,
    };
  }, [year, plot, allPlots, sprayRecords, cuttingRecords, labourWork, expenses]);

  const pieData = [
    { name: "Spray", value: summary.sprayCost },
    { name: "Cutting", value: summary.cuttingCost },
    { name: "Labour", value: summary.labourCost },
    { name: "General (pro-rated)", value: summary.generalProrated },
  ].filter((d) => d.value > 0);

  const rows = [
    { label: "Spray Records", value: summary.sprayCost, color: COLORS[0] },
    { label: "Cutting Records", value: summary.cuttingCost, color: COLORS[1] },
    { label: "Labour Work", value: summary.labourCost, color: COLORS[2] },
    { label: "General Expenses (pro-rated)", value: summary.generalProrated, color: COLORS[3] },
  ];

  return (
    <div className="space-y-5">
      {/* Year Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        {pieData.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Cost Distribution</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
            No expense data for {year}
          </div>
        )}

        {/* Breakdown Table */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cost Breakdown</p>
          {rows.map(({ label, value, color }) => {
            const pct = summary.total > 0 ? (value / summary.total) * 100 : 0;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{formatCurrency(value)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-700">Total Cost</span>
              <span className="text-[#2D6A4F]">{formatCurrency(summary.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Cost per Acre</span>
              <span className="font-medium">{formatCurrency(summary.costPerAcre)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
