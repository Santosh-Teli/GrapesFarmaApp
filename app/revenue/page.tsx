"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/hooks/use-store";
import { useRevenueStore, ProductSale } from "@/store/revenueStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, MinusCircle, PieChart as PieChartIcon } from "lucide-react";
import { SaleEntryForm } from "@/components/revenue/SaleEntryForm";
import { SalesTable } from "@/components/revenue/SalesTable";
import { RevenueCharts } from "@/components/revenue/RevenueCharts";

export default function RevenuePage() {
    const { user, isAuthenticated } = useAuthStore();
    const { sprayRecords, cuttingRecords, expenses } = useStore();
    const { sales, initSales } = useRevenueStore();
    const [isLoadingSales, setIsLoadingSales] = useState(true);

    // Fetch sales from Supabase on mount
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            import("@/lib/supabase/db").then(({ getSales }) => {
                getSales(user.id).then(data => {
                    initSales(data);
                    setIsLoadingSales(false);
                });
            });
        }
    }, [isAuthenticated, user?.id, initSales]);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<ProductSale | null>(null);

    // Available years from sales and expenses
    const availableYears = useMemo(() => {
        const years = new Set<string>();
        years.add(new Date().getFullYear().toString());
        sales.forEach(s => years.add(new Date(s.saleDate).getFullYear().toString()));
        sprayRecords.forEach(s => years.add(new Date(s.sprayDate).getFullYear().toString()));
        cuttingRecords.forEach(c => years.add(new Date(c.cuttingDate).getFullYear().toString()));
        expenses.forEach(e => years.add(new Date(e.expenseDate).getFullYear().toString()));
        return Array.from(years).sort().reverse();
    }, [sales, sprayRecords, cuttingRecords, expenses]);

    // Data filtered by selected year
    const yearSales = useMemo(() => sales.filter(s => s.saleDate.startsWith(selectedYear)), [sales, selectedYear]);
    const yearSprays = useMemo(() => sprayRecords.filter(s => s.sprayDate.startsWith(selectedYear)), [sprayRecords, selectedYear]);
    const yearCuttings = useMemo(() => cuttingRecords.filter(c => c.cuttingDate.startsWith(selectedYear)), [cuttingRecords, selectedYear]);
    const yearExpenses = useMemo(() => expenses.filter(e => e.expenseDate.startsWith(selectedYear)), [expenses, selectedYear]);

    // Financial calculations
    const totalRevenue = yearSales.reduce((sum, s) => sum + s.totalIncome, 0);
    
    const sprayCost = yearSprays.reduce((sum, s) => sum + s.totalSprayCost, 0);
    const cuttingCost = yearCuttings.reduce((sum, c) => sum + c.totalLabourCost, 0);
    const otherCost = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpense = sprayCost + cuttingCost + otherCost;
    const netProfit = totalRevenue - totalExpense;
    
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Charts Data Prep
    const monthlyData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.map((month, index) => {
            const rev = yearSales.filter(s => new Date(s.saleDate).getMonth() === index).reduce((sum, s) => sum + s.totalIncome, 0);
            
            const expSpray = yearSprays.filter(s => new Date(s.sprayDate).getMonth() === index).reduce((sum, s) => sum + s.totalSprayCost, 0);
            const expCut = yearCuttings.filter(c => new Date(c.cuttingDate).getMonth() === index).reduce((sum, c) => sum + c.totalLabourCost, 0);
            const expOth = yearExpenses.filter(e => new Date(e.expenseDate).getMonth() === index).reduce((sum, e) => sum + e.amount, 0);
            
            return {
                month,
                revenue: rev,
                expense: expSpray + expCut + expOth
            };
        });
    }, [yearSales, yearSprays, yearCuttings, yearExpenses]);

    const expenseCategoryData = useMemo(() => {
        const categories: Record<string, number> = {
            "Spraying (Pesticide & Labour)": sprayCost,
            "Cutting (Labour)": cuttingCost
        };
        yearExpenses.forEach(e => {
            categories[e.category] = (categories[e.category] || 0) + e.amount;
        });

        return Object.entries(categories)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [sprayCost, cuttingCost, yearExpenses]);

    const openForm = (sale?: ProductSale) => {
        setEditingSale(sale || null);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Revenue & Expense Summary</h1>
                <div className="flex gap-4">
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <Button onClick={() => openForm()} className="h-10">
                        <Plus className="mr-2 h-4 w-4" /> Add Sale Record
                    </Button>
                </div>
            </div>

            {/* Profit Banner */}
            <div className={`p-4 rounded-lg flex items-center justify-between shadow-sm border ${
                netProfit > 0 ? "bg-green-50 border-green-200 text-green-900" :
                netProfit < 0 ? "bg-red-50 border-red-200 text-red-900" :
                "bg-gray-50 border-gray-200 text-gray-900"
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${netProfit > 0 ? "bg-green-100" : netProfit < 0 ? "bg-red-100" : "bg-gray-200"}`}>
                        {netProfit > 0 ? <TrendingUp className="h-6 w-6 text-green-700" /> : netProfit < 0 ? <TrendingDown className="h-6 w-6 text-red-700" /> : <Wallet className="h-6 w-6 text-gray-700" />}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">
                            {netProfit > 0 ? "Profit Making" : netProfit < 0 ? "Loss Making" : "Break Even"}
                        </h2>
                        <p className="text-sm opacity-80">Overall financial status for {selectedYear}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs opacity-80 font-medium">NET BALANCE</p>
                    <p className="text-2xl font-black">{formatCurrency(netProfit)}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">From product sales</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <MinusCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpense)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Operations & material costs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <Wallet className={`h-4 w-4 ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                            {formatCurrency(netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Revenue minus expenses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">
                            {profitMargin.toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Percentage of revenue retained</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <RevenueCharts monthlyData={monthlyData} expenseCategoryData={expenseCategoryData} />

            {/* Sales Data Table */}
            <div className="space-y-4 pt-6 border-t mt-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Product Sales ({selectedYear})</h3>
                </div>
                <SalesTable sales={yearSales} onEdit={openForm} />
            </div>

            <SaleEntryForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                initialData={editingSale} 
            />
        </div>
    );
}
