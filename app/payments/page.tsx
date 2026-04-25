"use client";

import { useState } from "react";
import { PendingPaymentsTab } from "@/components/payments/PendingPaymentsTab";
import { PaymentHistoryTab } from "@/components/payments/PaymentHistoryTab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export default function PaymentsPage() {
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
    const t = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{t.paymentTitle}</h1>
            </div>

            <div className="flex space-x-1 rounded-lg bg-muted p-1 w-fit">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(activeTab === "pending" && "bg-background shadow")}
                    onClick={() => setActiveTab("pending")}
                >
                    {t.paymentPending}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(activeTab === "history" && "bg-background shadow")}
                    onClick={() => setActiveTab("history")}
                >
                    {t.reports}
                </Button>
            </div>

            {activeTab === "pending" ? <PendingPaymentsTab /> : <PaymentHistoryTab />}
        </div>
    );
}
