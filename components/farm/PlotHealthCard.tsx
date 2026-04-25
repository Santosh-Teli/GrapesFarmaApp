"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { Droplets, AlertCircle, Clock, CheckCircle2, CalendarClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Plot, SprayRecord } from "@/types";

type HealthStatus = "GOOD" | "DUE_SOON" | "OVERDUE";

function getHealthStatus(plot: Plot, sprayRecords: SprayRecord[]): {
  status: HealthStatus;
  daysSince: number | null;
  lastSpray: SprayRecord | null;
} {
  const plotSprays = sprayRecords
    .filter((r) => r.plotId === plot.id)
    .sort((a, b) => b.sprayDate.localeCompare(a.sprayDate));

  if (plotSprays.length === 0) return { status: "OVERDUE", daysSince: null, lastSpray: null };

  const lastSpray = plotSprays[0];
  const daysSince = differenceInDays(new Date(), parseISO(lastSpray.sprayDate));

  let status: HealthStatus = "GOOD";
  if (daysSince > 14) status = "OVERDUE";
  else if (daysSince > 7) status = "DUE_SOON";

  return { status, daysSince, lastSpray };
}

const STATUS_CONFIG: Record<HealthStatus, {
  border: string; dot: string; badge: string; label: string; icon: React.ReactNode;
}> = {
  GOOD: {
    border: "border-l-green-500",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700 border-green-300",
    label: "Healthy",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
  },
  DUE_SOON: {
    border: "border-l-amber-500",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    label: "Due Soon",
    icon: <Clock className="h-3.5 w-3.5 text-amber-600" />,
  },
  OVERDUE: {
    border: "border-l-red-500",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-300",
    label: "Overdue",
    icon: <AlertCircle className="h-3.5 w-3.5 text-red-600" />,
  },
};

interface PlotHealthCardProps {
  plot: Plot;
  sprayRecords: SprayRecord[];
  nextScheduledDate?: string;
  index?: number;
}

export function PlotHealthCard({ plot, sprayRecords, nextScheduledDate, index = 0 }: PlotHealthCardProps) {
  const { status, daysSince, lastSpray } = useMemo(
    () => getHealthStatus(plot, sprayRecords),
    [plot, sprayRecords]
  );
  const cfg = STATUS_CONFIG[status];

  const pesticidesUsed = lastSpray
    ? lastSpray.pesticideDetails.map((d) => d.pesticideId).slice(0, 2).join(", ")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Card className={cn("border-l-4 hover:shadow-md transition-shadow", cfg.border)}>
        <CardContent className="pt-4 pb-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", cfg.dot, status === "OVERDUE" && "animate-pulse")} />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{plot.name}</h3>
                <p className="text-xs text-gray-400">{plot.grapeVariety} · {plot.areaAcres} acres</p>
              </div>
            </div>
            <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border", cfg.badge)}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 uppercase font-medium tracking-wide mb-1">Last Spray</p>
              <p className="font-semibold text-gray-700">
                {lastSpray ? format(parseISO(lastSpray.sprayDate), "dd/MM/yyyy") : "Never"}
              </p>
              {daysSince !== null && (
                <p className={cn("font-medium mt-0.5", status === "OVERDUE" ? "text-red-600" : status === "DUE_SOON" ? "text-amber-600" : "text-green-600")}>
                  {daysSince}d ago
                </p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 uppercase font-medium tracking-wide mb-1">Crop Stage</p>
              <p className="font-semibold text-gray-700">{lastSpray?.cropStage ?? "—"}</p>
            </div>
          </div>

          {nextScheduledDate && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
              <CalendarClock className="h-3.5 w-3.5" />
              Next scheduled: {format(parseISO(nextScheduledDate), "dd MMM yyyy")}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/farm-setup/${plot.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                View Plot
              </Button>
            </Link>
            <Link href={`/spray/add?plotId=${plot.id}`} className="flex-1">
              <Button
                size="sm"
                className={cn("w-full h-8 text-xs text-white",
                  status === "OVERDUE"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#2D6A4F] hover:bg-[#245a42]"
                )}
              >
                <Droplets className="h-3.5 w-3.5 mr-1" />
                Log Spray
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
