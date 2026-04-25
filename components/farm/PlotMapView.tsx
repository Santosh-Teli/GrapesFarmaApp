"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { Droplets, Scissors, Leaf, AlertCircle, Clock, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Plot, SprayRecord, CuttingRecord } from "@/types";

type HealthStatus = "GOOD" | "DUE_SOON" | "OVERDUE";

const GRAPE_EMOJIS: Record<string, string> = {
  "thompson seedless": "🍇",
  "flame seedless": "🍇",
  "red globe": "🍷",
  "sonaka": "🟢",
  "sharad seedless": "🟡",
};

function getEmoji(variety: string): string {
  const key = variety.toLowerCase();
  for (const [k, v] of Object.entries(GRAPE_EMOJIS)) {
    if (key.includes(k)) return v;
  }
  return "🍇";
}

function getStatus(plot: Plot, sprayRecords: SprayRecord[]): { status: HealthStatus; daysSince: number | null; lastDate: string | null } {
  const plotSprays = sprayRecords.filter((r) => r.plotId === plot.id).sort((a, b) => b.sprayDate.localeCompare(a.sprayDate));
  if (plotSprays.length === 0) return { status: "OVERDUE", daysSince: null, lastDate: null };
  const daysSince = differenceInDays(new Date(), parseISO(plotSprays[0].sprayDate));
  return {
    status: daysSince > 14 ? "OVERDUE" : daysSince > 7 ? "DUE_SOON" : "GOOD",
    daysSince,
    lastDate: plotSprays[0].sprayDate,
  };
}

const GRADIENTS: Record<HealthStatus, string> = {
  GOOD: "from-green-50 to-emerald-50 border-green-200",
  DUE_SOON: "from-amber-50 to-yellow-50 border-amber-200",
  OVERDUE: "from-red-50 to-rose-50 border-red-200",
};

const BADGE_STYLES: Record<HealthStatus, string> = {
  GOOD: "bg-green-100 text-green-700 border-green-300",
  DUE_SOON: "bg-amber-100 text-amber-700 border-amber-300",
  OVERDUE: "bg-red-100 text-red-700 border-red-300",
};

const ICONS: Record<HealthStatus, React.ReactNode> = {
  GOOD: <CheckCircle2 className="h-3.5 w-3.5" />,
  DUE_SOON: <Clock className="h-3.5 w-3.5" />,
  OVERDUE: <AlertCircle className="h-3.5 w-3.5" />,
};

const LABELS: Record<HealthStatus, string> = { GOOD: "Healthy", DUE_SOON: "Due Soon", OVERDUE: "Overdue" };

function PlotMapCard({ plot, sprayRecords, cuttingRecords, index }: {
  plot: Plot; sprayRecords: SprayRecord[]; cuttingRecords: CuttingRecord[]; index: number;
}) {
  const { status, daysSince, lastDate } = getStatus(plot, sprayRecords);
  const lastCutting = cuttingRecords
    .filter((c) => c.plotId === plot.id)
    .sort((a, b) => b.cuttingDate.localeCompare(a.cuttingDate))[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn("rounded-2xl border-2 bg-gradient-to-br p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow cursor-default", GRADIENTS[status])}
    >
      {/* Plot header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{getEmoji(plot.grapeVariety)}</span>
            <h3 className="font-bold text-gray-900">{plot.name}</h3>
          </div>
          <p className="text-xs text-gray-500">{plot.grapeVariety} · {plot.areaAcres} ac</p>
        </div>
        <span className={cn("flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border", BADGE_STYLES[status])}>
          {ICONS[status]} {LABELS[status]}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Droplets className="h-3.5 w-3.5 text-blue-400" />
          {lastDate ? `Last spray: ${format(parseISO(lastDate), "dd MMM")} (${daysSince}d ago)` : "Never sprayed"}
        </div>
        {lastCutting && (
          <div className="flex items-center gap-1.5">
            <Scissors className="h-3.5 w-3.5 text-green-500" />
            Last cutting: {format(parseISO(lastCutting.cuttingDate), "dd MMM")}
          </div>
        )}
      </div>

      {/* Action button */}
      <Link href={status === "OVERDUE" ? `/spray/add?plotId=${plot.id}` : `/farm-setup/${plot.id}`}>
        <Button
          size="sm"
          className={cn("w-full h-8 text-xs text-white mt-1",
            status === "OVERDUE" ? "bg-red-500 hover:bg-red-600" : "bg-[#2D6A4F] hover:bg-[#245a42]"
          )}
        >
          {status === "OVERDUE" ? "Log Spray Now" : "View Details"}
        </Button>
      </Link>
    </motion.div>
  );
}

interface PlotMapViewProps {
  plots: Plot[];
  sprayRecords: SprayRecord[];
  cuttingRecords: CuttingRecord[];
}

export function PlotMapView({ plots, sprayRecords, cuttingRecords }: PlotMapViewProps) {
  const stats = useMemo(() => {
    const statuses = plots.map((p) => getStatus(p, sprayRecords).status);
    return {
      totalAcres: plots.reduce((s, p) => s + p.areaAcres, 0),
      total: plots.length,
      healthy: statuses.filter((s) => s === "GOOD").length,
      overdue: statuses.filter((s) => s === "OVERDUE").length,
    };
  }, [plots, sprayRecords]);

  return (
    <div className="space-y-5">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plots.filter((p) => p.isActive).map((plot, i) => (
          <PlotMapCard
            key={plot.id}
            plot={plot}
            sprayRecords={sprayRecords}
            cuttingRecords={cuttingRecords}
            index={i}
          />
        ))}
      </div>

      {/* Farm Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Acres", value: `${stats.totalAcres} ac`, icon: <MapPin className="h-4 w-4 text-gray-400" /> },
          { label: "Total Plots", value: stats.total, icon: <Leaf className="h-4 w-4 text-gray-400" /> },
          { label: "Healthy Plots", value: stats.healthy, icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
          { label: "Overdue Plots", value: stats.overdue, icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">{icon}</div>
            <div>
              <p className="font-bold text-gray-900 text-lg leading-tight">{value}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
