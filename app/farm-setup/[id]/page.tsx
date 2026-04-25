"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Leaf, MapPin, Calendar, Activity, DollarSign, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/use-store";
import { getSpraySchedules } from "@/lib/supabase/db";
import { useAuthStore } from "@/store/authStore";
import { PlotExpenseSummary } from "@/components/farm/PlotExpenseSummary";
import { PlotActivityTimeline } from "@/components/farm/PlotActivityTimeline";
import { cn } from "@/lib/utils";
import type { SpraySchedule } from "@/types";

type Tab = "overview" | "activity" | "expenses" | "photos";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PlotDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { plots, sprayRecords, cuttingRecords, labourWork, expenses, farm, allPlots } = useStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [schedules, setSchedules] = useState<SpraySchedule[]>([]);

  const plot = plots.find((p) => p.id === id);

  useEffect(() => {
    if (!user) return;
    getSpraySchedules(user.id).then(setSchedules);
  }, [user]);

  if (!plot) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 font-medium">Plot not found.</p>
        <Link href="/farm-setup">
          <Button variant="outline" className="mt-4">← Back to Farm Setup</Button>
        </Link>
      </div>
    );
  }

  const plotSprays = sprayRecords.filter((r) => r.plotId === plot.id);
  const plotCuttings = cuttingRecords.filter((r) => r.plotId === plot.id);
  const plotSchedules = schedules.filter((s) => s.plotId === plot.id);

  const lastSpray = plotSprays.sort((a, b) => b.sprayDate.localeCompare(a.sprayDate))[0];
  const totalSprayCost = plotSprays.reduce((s, r) => s + r.totalSprayCost, 0);
  const totalCuttingCost = plotCuttings.reduce((s, r) => s + r.totalLabourCost, 0);

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview",  label: "Overview",  icon: <Leaf className="h-4 w-4" /> },
    { key: "activity",  label: "Activity",  icon: <Activity className="h-4 w-4" /> },
    { key: "expenses",  label: "Expenses",  icon: <DollarSign className="h-4 w-4" /> },
    { key: "photos",    label: "Photos",    icon: <Camera className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/farm-setup" className="hover:text-[#2D6A4F] transition-colors">Farm Setup</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{plot.name}</span>
      </div>

      {/* Plot Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{plot.name}</h1>
              <Badge className={plot.isActive ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300"}>
                {plot.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5" /> {plot.grapeVariety}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {plot.areaAcres} acres
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Planted {plot.plantingYear}
              </span>
            </div>
          </div>
        </div>

        <Link href={`/spray/add?plotId=${plot.id}`}>
          <Button className="bg-[#2D6A4F] hover:bg-[#245a42] text-white shrink-0">
            + Log Spray
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-white text-[#2D6A4F] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Sprays", value: plotSprays.length, sub: `₹${totalSprayCost.toLocaleString("en-IN")} total cost` },
            { label: "Cutting Sessions", value: plotCuttings.length, sub: `₹${totalCuttingCost.toLocaleString("en-IN")} total cost` },
            { label: "Planned Sprays", value: plotSchedules.filter((s) => s.status === "PLANNED").length, sub: "upcoming scheduled" },
          ].map(({ label, value, sub }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-5">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="font-semibold text-gray-600 mt-1">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </CardContent>
            </Card>
          ))}

          {lastSpray && (
            <Card className="md:col-span-3">
              <CardHeader><CardTitle className="text-base">Last Spray Record</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs">Date</p><p className="font-semibold">{format(new Date(lastSpray.sprayDate), "dd/MM/yyyy")}</p></div>
                  <div><p className="text-gray-400 text-xs">Crop Stage</p><p className="font-semibold">{lastSpray.cropStage}</p></div>
                  <div><p className="text-gray-400 text-xs">Reason</p><p className="font-semibold">{lastSpray.sprayReason}</p></div>
                  <div><p className="text-gray-400 text-xs">Total Cost</p><p className="font-semibold text-[#2D6A4F]">₹{lastSpray.totalSprayCost.toLocaleString("en-IN")}</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <PlotActivityTimeline
          plotId={plot.id}
          sprayRecords={sprayRecords}
          cuttingRecords={cuttingRecords}
          spraySchedules={schedules}
        />
      )}

      {activeTab === "expenses" && (
        <PlotExpenseSummary
          plot={plot}
          allPlots={allPlots}
          sprayRecords={sprayRecords}
          cuttingRecords={cuttingRecords}
          labourWork={labourWork}
          expenses={expenses}
        />
      )}

      {activeTab === "photos" && (
        <div className="text-center py-12 text-gray-400">
          <Camera className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Plot photos are attached to individual spray records.</p>
          <p className="text-sm mt-1">View a spray record and navigate to its Photos tab to see before/after images.</p>
        </div>
      )}
    </div>
  );
}
