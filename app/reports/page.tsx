"use client";

import { useState, useRef } from "react";
import {
  DateWiseExpenseReport,
  LabourSalaryReport,
  PesticideUsageReport,
  StockReport,
  PaymentPendingReport,
} from "@/components/reports/Reports";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/hooks/use-store";
import { Printer, FileDown, FileSpreadsheet, BarChart2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const TABS = [
  { key: "dateWise",  labelKey: "dateWiseExpense",  emoji: "📅" },
  { key: "labour",   labelKey: "labourSalary",      emoji: "👷" },
  { key: "pesticide",labelKey: "pesticideUsage",    emoji: "🧪" },
  { key: "stock",    labelKey: "stockReport",       emoji: "📦" },
  { key: "pending",  labelKey: "paymentPending",    emoji: "💳" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function ReportsPage() {
  const t = useTranslation();
  const { sprayRecords, labourWork, labourers, expenses, plots, farm } = useStore();
  const [activeTab, setActiveTab] = useState<TabKey>("dateWise");
  const [year, setYear] = useState(new Date().getFullYear());
  const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AgriTrack — Reports", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Farm: ${farm?.name ?? ""}  |  Year: ${year}  |  Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 23);

    const filteredSprays = sprayRecords.filter((r) => r.sprayDate.startsWith(String(year)));
    const filteredExpenses = expenses.filter((e) => e.expenseDate.startsWith(String(year)));

    autoTable(doc, {
      startY: 30,
      head: [["Section", "Records", "Total Cost"]],
      body: [
        ["Spray Records", String(filteredSprays.length), formatCurrency(filteredSprays.reduce((s, r) => s + r.totalSprayCost, 0))],
        ["Other Expenses", String(filteredExpenses.length), formatCurrency(filteredExpenses.reduce((s, e) => s + e.amount, 0))],
        ["Labour Work", String(labourWork.filter((w) => w.workDate.startsWith(String(year))).length), formatCurrency(labourWork.filter((w) => w.workDate.startsWith(String(year))).reduce((s, w) => s + w.amount, 0))],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [45, 106, 79] },
    });

    doc.save(`agritrack-report-${year}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Spray sheet
    const spraySheet = XLSX.utils.json_to_sheet(
      sprayRecords.filter((r) => r.sprayDate.startsWith(String(year))).map((r) => ({
        Date: r.sprayDate,
        Plot: plots.find((p) => p.id === r.plotId)?.name ?? "-",
        Stage: r.cropStage,
        Reason: r.sprayReason,
        PesticideCost: r.totalPesticideCost,
        LabourCost: r.labourCost,
        TotalCost: r.totalSprayCost,
      }))
    );
    XLSX.utils.book_append_sheet(wb, spraySheet, "Sprays");

    // Expenses sheet
    const expSheet = XLSX.utils.json_to_sheet(
      expenses.filter((e) => e.expenseDate.startsWith(String(year))).map((e) => ({
        Date: e.expenseDate, Category: e.category, Description: e.description, Amount: e.amount, Status: e.paymentStatus,
      }))
    );
    XLSX.utils.book_append_sheet(wb, expSheet, "Expenses");

    // Labour sheet
    const labSheet = XLSX.utils.json_to_sheet(
      labourWork.filter((w) => w.workDate.startsWith(String(year))).map((w) => ({
        Date: w.workDate,
        Labour: labourers.find((l) => l.id === w.labourId)?.name ?? "-",
        WorkType: w.workType,
        DayType: w.dayType,
        Amount: w.amount,
        Status: w.paymentStatus,
      }))
    );
    XLSX.utils.book_append_sheet(wb, labSheet, "Labour");

    XLSX.writeFile(wb, `agritrack-report-${year}.xlsx`);
  };

  // Summary stats
  const sprayTotal = sprayRecords.filter((r) => r.sprayDate.startsWith(String(year))).reduce((s, r) => s + r.totalSprayCost, 0);
  const expenseTotal = expenses.filter((e) => e.expenseDate.startsWith(String(year))).reduce((s, e) => s + e.amount, 0);
  const labourTotal = labourWork.filter((w) => w.workDate.startsWith(String(year))).reduce((s, w) => s + w.amount, 0);
  const grandTotal = sprayTotal + expenseTotal + labourTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-[#2D6A4F]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.reportsTitle}</h1>
            <p className="text-sm text-gray-400">Analyse and export your farm's financial data</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      {/* Year Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        {[
          { label: "Spray Cost", value: sprayTotal, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Other Expenses", value: expenseTotal, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Labour Cost", value: labourTotal, color: "text-purple-600", bg: "bg-purple-50" },
          { label: `Total ${year}`, value: grandTotal, color: "text-[#2D6A4F]", bg: "bg-green-50", bold: true },
        ].map(({ label, value, color, bg, bold }) => (
          <div key={label} className={`rounded-xl ${bg} p-4 border border-gray-100`}>
            <p className={cn("font-bold text-xl", color, bold && "text-2xl")}>{formatCurrency(value)}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 no-print">
        {TABS.map((tab) => {
          const label = t[tab.labelKey as keyof typeof t] ?? tab.labelKey;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                activeTab === tab.key
                  ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
              )}
            >
              <span>{tab.emoji}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="mt-2">
        {activeTab === "dateWise"   && <DateWiseExpenseReport />}
        {activeTab === "labour"     && <LabourSalaryReport />}
        {activeTab === "pesticide"  && <PesticideUsageReport />}
        {activeTab === "stock"      && <StockReport />}
        {activeTab === "pending"    && <PaymentPendingReport />}
      </div>
    </div>
  );
}
