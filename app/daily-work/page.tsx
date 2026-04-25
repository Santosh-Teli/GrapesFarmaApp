"use client";

import { useState } from "react";
import { SingleEntryTab } from "@/components/daily-work/SingleEntryTab";
import { BulkEntryTab } from "@/components/daily-work/BulkEntryTab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export default function DailyWorkPage() {
    const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
    const t = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">{t.dailyWorkTitle}</h1>

            <div className="flex space-x-1 rounded-lg bg-muted p-1 w-fit">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(activeTab === "single" && "bg-background shadow")}
                    onClick={() => setActiveTab("single")}
                >
                    {t.singleEntry}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(activeTab === "bulk" && "bg-background shadow")}
                    onClick={() => setActiveTab("bulk")}
                >
                    {t.bulkEntry}
                </Button>
            </div>

            {activeTab === "single" ? <SingleEntryTab /> : <BulkEntryTab />}
        </div>
    );
}
