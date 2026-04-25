"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Scissors, Wheat, CalendarClock, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import type { SprayRecord, CuttingRecord, SpraySchedule } from "@/types";

type ActivityType = "SPRAY" | "CUTTING" | "SCHEDULE";

interface TimelineEntry {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  subtitle: string;
  cost?: number;
  link?: string;
  isPlanned?: boolean;
}

const TYPE_CONFIG: Record<ActivityType, { icon: React.ReactNode; dot: string; label: string }> = {
  SPRAY: {
    icon: <Droplets className="h-4 w-4 text-blue-600" />,
    dot: "bg-blue-500",
    label: "Spray",
  },
  CUTTING: {
    icon: <Scissors className="h-4 w-4 text-green-600" />,
    dot: "bg-green-500",
    label: "Cutting",
  },
  SCHEDULE: {
    icon: <CalendarClock className="h-4 w-4 text-gray-500" />,
    dot: "bg-gray-400 border-2 border-dashed border-gray-400 bg-white",
    label: "Planned",
  },
};

const PAGE_SIZE = 20;

interface PlotActivityTimelineProps {
  plotId: string;
  sprayRecords: SprayRecord[];
  cuttingRecords: CuttingRecord[];
  spraySchedules: SpraySchedule[];
}

export function PlotActivityTimeline({
  plotId, sprayRecords, cuttingRecords, spraySchedules,
}: PlotActivityTimelineProps) {
  const [activeFilters, setActiveFilters] = useState<ActivityType[]>(["SPRAY", "CUTTING", "SCHEDULE"]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);
  const today = format(new Date(), "yyyy-MM-dd");

  const allEntries: TimelineEntry[] = useMemo(() => {
    const sprays: TimelineEntry[] = sprayRecords
      .filter((r) => r.plotId === plotId)
      .map((r) => ({
        id: r.id,
        type: "SPRAY" as const,
        date: r.sprayDate,
        title: `Spray — ${r.sprayReason}`,
        subtitle: r.reasonDetail ?? r.weatherCondition,
        cost: r.totalSprayCost,
        link: `/spray`,
      }));

    const cuttings: TimelineEntry[] = cuttingRecords
      .filter((r) => r.plotId === plotId)
      .map((r) => ({
        id: r.id,
        type: "CUTTING" as const,
        date: r.cuttingDate,
        title: `Cutting — ${r.cuttingType.replace(/_/g, " ")}`,
        subtitle: `${r.labourCount} labourers · ${r.dayType.replace(/_/g, " ")}`,
        cost: r.totalLabourCost,
        link: `/cutting`,
      }));

    const schedules: TimelineEntry[] = spraySchedules
      .filter((s) => s.plotId === plotId && s.status === "PLANNED")
      .map((s) => ({
        id: s.id,
        type: "SCHEDULE" as const,
        date: s.plannedDate,
        title: `Planned Spray`,
        subtitle: [s.targetDisease, s.targetPest].filter(Boolean).join(" · ") || "No target specified",
        isPlanned: true,
        link: `/spray/schedule`,
      }));

    return [...schedules, ...sprays, ...cuttings].sort((a, b) => b.date.localeCompare(a.date));
  }, [plotId, sprayRecords, cuttingRecords, spraySchedules]);

  const filtered = useMemo(() => {
    return allEntries.filter((e) => {
      if (!activeFilters.includes(e.type)) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [allEntries, activeFilters, dateFrom, dateTo]);

  const visible = filtered.slice(0, shown);
  const todayIndex = visible.findIndex((e) => e.date <= today);

  const toggleFilter = (type: ActivityType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  if (allEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <Droplets className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No activity recorded for this plot yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(["SPRAY", "CUTTING", "SCHEDULE"] as ActivityType[]).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const active = activeFilters.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  active ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                )}
              >
                <div className={cn("h-2 w-2 rounded-full", cfg.dot.split(" ")[0])} />
                {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 ml-auto text-xs">
          <input
            type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 px-2 rounded-lg border border-gray-200 text-xs"
          />
          <span className="text-gray-400">–</span>
          <input
            type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="h-8 px-2 rounded-lg border border-gray-200 text-xs"
          />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />

        <AnimatePresence mode="popLayout">
          <div className="space-y-0">
            {visible.map((entry, i) => {
              const cfg = TYPE_CONFIG[entry.type];
              const showTodayMarker = todayIndex === i && i > 0;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  {showTodayMarker && (
                    <div className="relative flex items-center gap-3 ml-10 mb-3 mt-2">
                      <div className="flex-1 h-px bg-blue-200" />
                      <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                        TODAY
                      </span>
                      <div className="flex-1 h-px bg-blue-200" />
                    </div>
                  )}
                  <div className="relative flex gap-4 pb-5 group">
                    {/* Dot */}
                    <div className={cn(
                      "relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                      entry.isPlanned ? "bg-gray-50 border-2 border-dashed border-gray-300" : "bg-white border border-gray-200"
                    )}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm group-hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={cn("font-semibold text-sm", entry.isPlanned ? "text-gray-400 italic" : "text-gray-800")}>
                            {entry.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{entry.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">
                            {format(parseISO(entry.date), "dd/MM/yyyy")}
                          </p>
                          {entry.cost !== undefined && entry.cost > 0 && (
                            <p className="text-xs font-semibold text-[#2D6A4F] mt-0.5">
                              {formatCurrency(entry.cost)}
                            </p>
                          )}
                        </div>
                      </div>
                      {entry.link && (
                        <Link href={entry.link} className="inline-flex items-center gap-0.5 text-[11px] text-[#2D6A4F] font-medium mt-2 hover:underline">
                          View Details <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {filtered.length > shown && (
          <div className="text-center pt-2 pb-5 pl-12">
            <Button variant="outline" size="sm" onClick={() => setShown((p) => p + PAGE_SIZE)}>
              Load More ({filtered.length - shown} remaining)
            </Button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-10 pl-12 text-sm text-gray-400">No activities match the current filters.</div>
        )}
      </div>
    </div>
  );
}
