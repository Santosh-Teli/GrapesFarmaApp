"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/hooks/use-store";
import { formatCurrency } from "@/lib/utils";
import { calculateDashboardMetrics } from "@/lib/dashboard-calculations";
import { OtherExpensesManager } from "@/components/expenses/OtherExpensesManager";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IndianRupee, Scissors, FlaskConical, Users, AlertCircle, CheckCircle } from "lucide-react";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExpensesPage() {
    const store = useStore();
    const { sprayRecords, cuttingRecords, labourWork, expenses } = store;

    // Filters
    const [dateFrom, setDateFrom] = useState(format(startOfYear(new Date()), "yyyy-MM-dd"));
    const [dateTo, setDateTo] = useState(format(endOfYear(new Date()), "yyyy-MM-dd"));

    // Reuse logic from Dashboard via calculator
    const metrics = useMemo(() => {
        return calculateDashboardMetrics(
            store,
            { from: new Date(dateFrom), to: new Date(dateTo) }
        );
    }, [store, dateFrom, dateTo]);

    const {
        totalPesticideCost,
        totalCuttingCost,
        totalLabourCost,
        totalOtherExpense,
        grandTotal,
        totalPaid, // Note: This includes paid expenses and paid labour
        totalPending
    } = metrics.metrics;

    // Combined Records for Table
    const combinedRecords = useMemo(() => {
        const all = [
            ...sprayRecords.filter(r => r.sprayDate >= dateFrom && r.sprayDate <= dateTo).map(r => ({
                id: r.id, date: r.sprayDate, category: "Spray", desc: r.sprayReason, amount: r.totalSprayCost
            })),
            ...cuttingRecords.filter(r => r.cuttingDate >= dateFrom && r.cuttingDate <= dateTo).map(r => ({
                id: r.id, date: r.cuttingDate, category: "Cutting", desc: r.cuttingType, amount: r.totalLabourCost
            })),
            ...labourWork.filter(r => !r.referenceId && r.workDate >= dateFrom && r.workDate <= dateTo).map(r => ({
                id: r.id, date: r.workDate, category: "Labour", desc: r.workType, amount: r.amount
            })),
            ...expenses.filter(r => r.expenseDate >= dateFrom && r.expenseDate <= dateTo).map(r => ({
                id: r.id, date: r.expenseDate, category: "Other", desc: r.category + " - " + r.description, amount: r.amount
            }))
        ];
        return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sprayRecords, cuttingRecords, labourWork, expenses, dateFrom, dateTo]);

    // Handle Export
    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(combinedRecords);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expenses");
        XLSX.writeFile(wb, "Expenses.xlsx");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Expense Management</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportExcel}>Export Excel</Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">From</span>
                        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">To</span>
                        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" />
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total Spray" value={formatCurrency(totalPesticideCost)} icon={FlaskConical} color="text-emerald-600" bgColor="bg-emerald-100" />
                <MetricCard label="Total Cutting" value={formatCurrency(totalCuttingCost)} icon={Scissors} color="text-purple-600" bgColor="bg-purple-100" />
                <MetricCard label="Total Labour" value={formatCurrency(totalLabourCost)} icon={Users} color="text-orange-600" bgColor="bg-orange-100" />
                <MetricCard label="Other Expenses" value={formatCurrency(totalOtherExpense)} icon={IndianRupee} color="text-blue-600" bgColor="bg-blue-100" />

                <Card className="md:col-span-2 lg:col-span-4 bg-primary/5 border-primary/20">
                    <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-lg font-medium text-muted-foreground">Grand Total Expense</p>
                            <p className="text-4xl font-bold text-primary">{formatCurrency(grandTotal)}</p>
                        </div>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-sm text-green-600 font-medium">Paid</p>
                                <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-red-600 font-medium">Pending</p>
                                <p className="text-xl font-bold text-red-700">{formatCurrency(totalPending)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts reuse */}
            <DashboardCharts
                pieData={metrics.charts.categoryData}
                barData={[]} // No bar data logic for filtered range yet, dashboard one is fixed 6 months. It's fine to omit or reuse logic.
            />

            {/* Other Expenses CRUD */}
            <OtherExpensesManager />

            {/* Combined Table */}
            <Card>
                <CardHeader><CardTitle>All Expenses (Combined)</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto max-h-[500px]">
                        <table className="w-full text-sm text-left relative">
                            <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {combinedRecords.map((r, i) => (
                                    <tr key={i} className="border-t hover:bg-muted/50">
                                        <td className="p-3">{r.date}</td>
                                        <td className="p-3">
                                            <span className="bg-muted px-2 py-1 rounded text-xs font-semibold">{r.category}</span>
                                        </td>
                                        <td className="p-3">{r.desc}</td>
                                        <td className="p-3 font-medium">{formatCurrency(r.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
