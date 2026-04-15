"use client";

import { useState } from "react";
import {
    DateWiseExpenseReport,
    LabourSalaryReport,
    PesticideUsageReport,
    StockReport,
    PaymentPendingReport
} from "@/components/reports/Reports";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("Date-wise Expense");

    const tabs = [
        "Date-wise Expense",
        "Labour Salary",
        "Pesticide Usage",
        "Stock Report",
        "Payment Pending"
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>

            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "outline"}
                        onClick={() => setActiveTab(tab)}
                        className="h-8"
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            <div className="mt-4">
                {activeTab === "Date-wise Expense" && <DateWiseExpenseReport />}
                {activeTab === "Labour Salary" && <LabourSalaryReport />}
                {activeTab === "Pesticide Usage" && <PesticideUsageReport />}
                {activeTab === "Stock Report" && <StockReport />}
                {activeTab === "Payment Pending" && <PaymentPendingReport />}
            </div>
        </div>
    );
}
