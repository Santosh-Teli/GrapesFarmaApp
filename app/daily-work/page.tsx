"use client";

import { useState } from "react";
import { SingleEntryTab } from "@/components/daily-work/SingleEntryTab";
import { BulkEntryTab } from "@/components/daily-work/BulkEntryTab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DailyWorkPage() {
    const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Daily Labour Work</h1>

            <div className="flex space-x-1 rounded-lg bg-muted p-1 w-fit">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(activeTab === "single" && "bg-background shadow")}
                    onClick={() => setActiveTab("single")}
                >
                    Single Entry
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(activeTab === "bulk" && "bg-background shadow")}
                    onClick={() => setActiveTab("bulk")}
                >
                    Bulk Entry
                </Button>
            </div>

            {activeTab === "single" ? <SingleEntryTab /> : <BulkEntryTab />}
        </div>
    );
}
