"use client";

import { useState } from "react";
import { FarmDetails } from "@/components/farm/FarmDetails";
import { PlotsManager } from "@/components/farm/PlotsManager";
import { PlotHealthCard } from "@/components/farm/PlotHealthCard";
import { PlotMapView } from "@/components/farm/PlotMapView";
import { FeedbackForm } from "@/components/farm/FeedbackForm";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

type ViewMode = "list" | "map";

export default function FarmSetupPage() {
    const t = useTranslation();
    const { plots, sprayRecords, cuttingRecords } = useStore();
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">{t.farmSetupTitle}</h1>
            <FarmDetails />

            {/* Plots Section with View Toggle */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Plots</h2>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                viewMode === "list" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <List className="h-4 w-4" /> List
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                viewMode === "map" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" /> Map View
                        </button>
                    </div>
                </div>

                {viewMode === "list" ? (
                    <PlotsManager />
                ) : (
                    <PlotMapView
                        plots={plots}
                        sprayRecords={sprayRecords}
                        cuttingRecords={cuttingRecords}
                    />
                )}

                {/* Health Cards for active plots (shown below in list mode) */}
                {viewMode === "list" && plots.filter((p) => p.isActive).length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Plot Health</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plots.filter((p) => p.isActive).map((plot, i) => (
                                <PlotHealthCard
                                    key={plot.id}
                                    plot={plot}
                                    sprayRecords={sprayRecords}
                                    index={i}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4">
                <FeedbackForm />
            </div>
        </div>
    );
}
