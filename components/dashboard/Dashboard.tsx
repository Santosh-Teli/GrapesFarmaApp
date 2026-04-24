"use client";

import { useState, useMemo } from "react";
import { format, startOfYear, endOfYear, subMonths } from "date-fns";
import { useStore } from "@/hooks/use-store";
import { calculateDashboardMetrics } from "@/lib/dashboard-calculations";
import { MetricCard } from "./MetricCard";
import { DashboardCharts } from "./DashboardCharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    IndianRupee, Users, FlaskConical, Scissors, AlertCircle, CheckCircle, Calendar, UserCheck,
    TrendingUp, Map, ShieldAlert
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getAllProfiles } from "@/lib/supabase/auth";
import type { ProfileRow } from "@/lib/supabase/types";
import { useEffect } from "react";

export function Dashboard() {
    const { user } = useAuthStore();
    const {
        sprayRecords, cuttingRecords, labourWork, expenses, labourers, pesticides, isInitialized,
        allFarms, allPlots, allLabourers, allExpenses, allSprayRecords, allCuttingRecords, allLabourWork, allPesticides,
        isAdmin, isImpersonating
    } = useStore();
    
    const [allUsers, setAllUsers] = useState<ProfileRow[]>([]);

    useEffect(() => {
        if (isAdmin) {
            getAllProfiles().then(setAllUsers);
        }
    }, [isAdmin]);

    const [dateRange, setDateRange] = useState({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
    });

    const [tempFrom, setTempFrom] = useState(format(startOfYear(new Date()), "yyyy-MM-dd"));
    const [tempTo, setTempTo] = useState(format(endOfYear(new Date()), "yyyy-MM-dd"));

    const handleApplyFilter = () => {
        setDateRange({
            from: new Date(tempFrom),
            to: new Date(tempTo),
        });
    };

    const metrics = useMemo(() => {
        if (!isInitialized) return null;
        return calculateDashboardMetrics({
            sprayRecords, cuttingRecords, labourWork, expenses, labourers, pesticides
        }, dateRange);
    }, [isInitialized, sprayRecords, cuttingRecords, labourWork, expenses, labourers, pesticides, dateRange]);

    const adminMetrics = useMemo(() => {
        if (!isAdmin || isImpersonating || !isInitialized) return null;

        const totalSpray = allSprayRecords.reduce((sum, r) => sum + r.totalSprayCost, 0);
        const totalCutting = allCuttingRecords.reduce((sum, r) => sum + r.totalLabourCost, 0);
        const totalLabour = allLabourWork.filter(r => !r.referenceId).reduce((sum, r) => sum + r.amount, 0);
        const totalOther = allExpenses.reduce((sum, r) => sum + r.amount, 0);

        const grandTotal = totalSpray + totalCutting + totalLabour + totalOther;

        // Farmer breakdown
        const farmerBreakdown = allFarms.map(farm => {
            const userId = farm.ownerId;
            const u = allUsers.find(u => u.id === userId);
            
            const fSpray = allSprayRecords.filter(r => r.userId === userId).reduce((sum, r) => sum + r.totalSprayCost, 0);
            const fCutting = allCuttingRecords.filter(r => r.userId === userId).reduce((sum, r) => sum + r.totalLabourCost, 0);
            const fLabour = allLabourWork.filter(r => r.userId === userId && !r.referenceId).reduce((sum, r) => sum + r.amount, 0);
            const fExpense = allExpenses.filter(r => r.userId === userId).reduce((sum, r) => sum + r.amount, 0);

            return {
                userId,
                fullName: u ? u.full_name : farm.name,
                email: u ? u.email : '',
                status: u ? u.status : 'ACTIVE',
                totalSpent: fSpray + fCutting + fLabour + fExpense
            };
        }).sort((a, b) => b.totalSpent - a.totalSpent);

        return {
            grandTotal,
            totalSpray,
            totalLabourCombined: totalCutting + totalLabour,
            totalOther,
            farmerBreakdown,
            activeFarmersCount: allFarms.length
        };
    }, [isAdmin, isImpersonating, isInitialized, allSprayRecords, allCuttingRecords, allLabourWork, allExpenses, allFarms, allUsers]);

    // Monthly Data Calculation (Last 6 months fixed or based on filter? Requirement: "Bar chart... last 6 months")
    const monthlyData = useMemo(() => {
        const data = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(today, i);
            const monthLabel = format(d, "MMM yyyy");
            // Calculate total expense for this specific month
            // This is a bit heavy but okay for small data.
            // We need to filter ALL records by this month
            // Simplify: just mock logic or do real calc? Real calc.
            // Filter all expense arrays by month/year of `d`
            const mStr = format(d, "yyyy-MM");

            const spray = sprayRecords.filter(r => r.sprayDate.startsWith(mStr)).reduce((s, r) => s + r.totalSprayCost, 0);
            const cutting = cuttingRecords.filter(r => r.cuttingDate.startsWith(mStr)).reduce((s, r) => s + r.totalLabourCost, 0);
            const labour = labourWork.filter(r => r.workDate.startsWith(mStr) && !r.referenceId).reduce((s, r) => s + r.amount, 0);
            const other = expenses.filter(r => r.expenseDate.startsWith(mStr)).reduce((s, r) => s + r.amount, 0);

            data.push({
                month: monthLabel,
                total: spray + cutting + labour + other
            });
        }
        return data;
    }, [sprayRecords, cuttingRecords, labourWork, expenses]);

    if (!metrics) return <div>Loading...</div>;

    const {
        totalPesticideCost, totalCuttingCost, totalLabourCost, totalOtherExpense,
        grandTotal, totalPaid, totalPending, totalWorkingDays, activeLabourers
    } = metrics.metrics;

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    return (
        <div className="flex flex-col space-y-6">
            {/* Row 1: Filter Bar - Only for Farmers or Impersonated View */}
            {(!isAdmin || isImpersonating) && (
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                    <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">From Date</label>
                            <Input
                                type="date"
                                value={tempFrom}
                                onChange={(e) => setTempFrom(e.target.value)}
                                className="w-full sm:w-[150px]"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">To Date</label>
                            <Input
                                type="date"
                                value={tempTo}
                                onChange={(e) => setTempTo(e.target.value)}
                                className="w-full sm:w-[150px]"
                            />
                        </div>
                    </div>
                    <Button onClick={handleApplyFilter} className="w-full sm:w-auto mb-0.5">Apply Filters</Button>
                </div>
            )}

            {/* Row 2: Metrics Grid */}
            {isAdmin && !isImpersonating && adminMetrics ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard label="Total Platform Spending" value={fmt(adminMetrics.grandTotal)} icon={IndianRupee} color="text-primary" bgColor="bg-primary/5" />
                    <MetricCard label="Total Active Farmers" value={adminMetrics.activeFarmersCount} icon={Users} color="text-user-primary" bgColor="bg-user-primary/5" />
                    <MetricCard label="Total Plots Managed" value={allPlots.length} icon={Map} color="text-accent" bgColor="bg-accent/5" />
                    <MetricCard label="System Alerts" value={0} icon={ShieldAlert} color="text-emerald-500" bgColor="bg-emerald-50" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard label="Total Expenses" value={fmt(grandTotal)} icon={IndianRupee} color="text-primary" bgColor="bg-primary/5" />
                    <MetricCard label="Labour Cost" value={fmt(totalLabourCost)} icon={Users} color="text-user-primary" bgColor="bg-user-primary/5" />
                    <MetricCard label="Pesticide Cost" value={fmt(totalPesticideCost)} icon={FlaskConical} color="text-emerald-600" bgColor="bg-emerald-100/30" />
                    <MetricCard label="Pending Payments" value={fmt(totalPending)} icon={AlertCircle} color="text-error" bgColor="bg-error/5" />
                </div>
            )}

            {/* Row 3: Charts - Only for Farmers or Impersonated View */}
            {(!isAdmin || isImpersonating) && (
                <DashboardCharts pieData={metrics.charts.categoryData} barData={monthlyData} />
            )}

            {/* Row 4: Financial Summary - Only for Farmers or Impersonated View */}
            {(!isAdmin || isImpersonating) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                                <span>Total Pesticide Cost</span>
                                <span className="font-medium">{fmt(totalPesticideCost)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>Total Labour Cost</span>
                                <span className="font-medium">{fmt(totalLabourCost)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>Total Cutting Cost</span>
                                <span className="font-medium">{fmt(totalCuttingCost)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>Other Expenses</span>
                                <span className="font-medium">{fmt(totalOtherExpense)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-t bg-muted/20 px-2 rounded-md">
                                <span className="font-bold">Grand Total</span>
                                <span className="font-bold text-lg">{fmt(grandTotal)}</span>
                            </div>
                            <div className="flex justify-between py-2 px-2 text-sm">
                                <span className="text-green-600 flex items-center gap-2"><CheckCircle className="w-3 h-3" /> Paid</span>
                                <span className="font-medium text-green-600">{fmt(totalPaid)}</span>
                            </div>
                            <div className="flex justify-between py-2 px-2 text-sm">
                                <span className="text-red-500 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> Pending</span>
                                <span className="font-medium text-red-500">{fmt(totalPending)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Row 5: Quick Stats - Low Stock Alerts */}
            {/* We can compute this in a simple component or inline */}
            {pesticides.some(p => p.stockQuantity <= p.lowStockAlertLevel && p.isActive) && (
                <Card className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <AlertCircle className="text-red-500 w-6 h-6" />
                        <div>
                            <h3 className="font-semibold text-red-700 dark:text-red-400">Low Stock Alerts</h3>
                            <p className="text-sm text-red-600 dark:text-red-300">
                                {pesticides.filter(p => p.stockQuantity <= p.lowStockAlertLevel && p.isActive).length} pesticides are running low on stock. Check Pesticide Master.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Row 6: Context-Aware Activity List */}
            {isAdmin && !isImpersonating && adminMetrics ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Farmer Spending Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {adminMetrics.farmerBreakdown.map((farmer) => (
                                <div key={farmer.userId} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-base">{farmer.fullName}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${farmer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {farmer.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{farmer.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-primary">{fmt(farmer.totalSpent)}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Total Spent</p>
                                    </div>
                                </div>
                            ))}
                            {adminMetrics.farmerBreakdown.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No farmer data available yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader><CardTitle>Recent Activity (Last 5 Records)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...sprayRecords, ...cuttingRecords, ...labourWork.filter(w => !w.referenceId), ...expenses]
                                .sort((a, b) => {
                                    const dateA = 'sprayDate' in a ? a.sprayDate : 'cuttingDate' in a ? a.cuttingDate : 'workDate' in a ? a.workDate : a.expenseDate;
                                    const dateB = 'sprayDate' in b ? b.sprayDate : 'cuttingDate' in b ? b.cuttingDate : 'workDate' in b ? b.workDate : b.expenseDate;
                                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                                })
                                .slice(0, 5)
                                .map((item: any, idx) => {
                                    const date = 'sprayDate' in item ? item.sprayDate : 'cuttingDate' in item ? item.cuttingDate : 'workDate' in item ? item.workDate : item.expenseDate;
                                    const type = 'sprayDate' in item ? 'Spray' : 'cuttingDate' in item ? 'Cutting' : 'workDate' in item ? 'Labour' : 'Expense';
                                    const desc = 'sprayDate' in item ? item.sprayReason : 'cuttingDate' in item ? item.cuttingType : 'workDate' in item ? item.workType : item.description;
                                    const amount = 'totalSprayCost' in item ? item.totalSprayCost : 'totalLabourCost' in item ? item.totalLabourCost : item.amount;

                                    return (
                                        <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-semibold text-base">{type} - {desc}</p>
                                                <p className="text-sm text-muted-foreground">{date}</p>
                                            </div>
                                            <span className="font-bold text-lg">{fmt(amount)}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
