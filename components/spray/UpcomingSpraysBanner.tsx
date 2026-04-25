"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CalendarClock, ChevronRight } from "lucide-react";
import { getSpraySchedules } from "@/lib/supabase/db";
import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/hooks/use-store";
import type { SpraySchedule } from "@/types";

export function UpcomingSpraysBanner() {
  const { user } = useAuthStore();
  const { plots } = useStore();
  const [schedules, setSchedules] = useState<SpraySchedule[]>([]);

  useEffect(() => {
    if (!user) return;
    getSpraySchedules(user.id).then((data) => {
      const upcoming = data
        .filter((s) => s.status === "PLANNED")
        .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
        .slice(0, 3);
      setSchedules(upcoming);
    });
  }, [user]);

  if (schedules.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Upcoming Sprays</span>
          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            {schedules.length}
          </span>
        </div>
        <Link href="/spray/schedule" className="flex items-center gap-0.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors">
          View All <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {schedules.map((s) => {
          const plot = plots.find((p) => p.id === s.plotId);
          const isOverdue = s.plannedDate < format(new Date(), "yyyy-MM-dd");
          return (
            <div key={s.id} className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-amber-100">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{plot?.name ?? "Plot"}</p>
                {(s.targetDisease || s.targetPest) && (
                  <p className="text-xs text-gray-500 truncate">
                    {[s.targetDisease, s.targetPest].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${isOverdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                {format(parseISO(s.plannedDate), "dd MMM")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
