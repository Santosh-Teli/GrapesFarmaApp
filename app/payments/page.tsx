"use client";

import { useState } from "react";
import { PendingPaymentsTab } from "@/components/payments/PendingPaymentsTab";
import { PaymentHistoryTab } from "@/components/payments/PaymentHistoryTab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PaymentsPage() {
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Payment Management</h1>
            </div>

            <div className="flex space-x-1 rounded-lg bg-muted p-1 w-fit">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(activeTab === "pending" && "bg-background shadow")}
                    onClick={() => setActiveTab("pending")}
                >
                    Pending Payments
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(activeTab === "history" && "bg-background shadow")}
                    onClick={() => setActiveTab("history")}
                >
                    Payment History
                </Button>
            </div>

            {activeTab === "pending" ? <PendingPaymentsTab /> : <PaymentHistoryTab />}
        </div>
    );
}
