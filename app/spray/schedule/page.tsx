"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, ChevronRight, Plus, X,
  CheckCircle2, Clock, AlertCircle, CalendarClock, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useAuthStore } from "@/store/authStore";
import {
  getSpraySchedules,
  createSpraySchedule,
  updateSprayScheduleStatus,
} from "@/lib/supabase/db";
import type { SpraySchedule } from "@/types";

const today = format(new Date(), "yyyy-MM-dd");

// ─── Zod Schema ─────────────────────────────────────────────────────────────
const scheduleSchema = z.object({
  plotId: z.string().min(1, "Please select a plot"),
  plannedDate: z.string().min(1, "Please select a date"),
  targetDisease: z.string().optional(),
  targetPest: z.string().optional(),
  notes: z.string().optional(),
});
type ScheduleForm = z.infer<typeof scheduleSchema>;

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status, overdue }: { status: SpraySchedule["status"]; overdue?: boolean }) {
  const map = {
    PLANNED:   overdue ? "bg-red-100 text-red-700 border-red-300" : "bg-amber-100 text-amber-700 border-amber-300",
    COMPLETED: "bg-green-100 text-green-700 border-green-300",
    CANCELLED: "bg-gray-100 text-gray-600 border-gray-300",
  };
  const icons = {
    PLANNED:   overdue ? <AlertCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />,
    COMPLETED: <CheckCircle2 className="h-3 w-3 mr-1" />,
    CANCELLED: <X className="h-3 w-3 mr-1" />,
  };
  return (
    <Badge className={cn("text-xs border", map[status])}>
      {icons[status]}
      {status === "PLANNED" && overdue ? "OVERDUE" : status}
    </Badge>
  );
}

// ─── Schedule Card ────────────────────────────────────────────────────────────
function SprayScheduleCard({
  schedule, plotName, onConvert, onCancel,
}: {
  schedule: SpraySchedule;
  plotName: string;
  onConvert: (s: SpraySchedule) => void;
  onCancel: (id: string) => void;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const isOverdue = schedule.status === "PLANNED" && schedule.plannedDate < today;

  const borderColor =
    schedule.status === "COMPLETED" ? "border-l-green-500"
    : schedule.status === "CANCELLED" ? "border-l-gray-400"
    : isOverdue ? "border-l-red-500"
    : "border-l-amber-500";

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <Card className={cn("border-l-4 shadow-sm hover:shadow-md transition-shadow", borderColor)}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-gray-900 text-sm truncate">{plotName}</span>
                <StatusBadge status={schedule.status} overdue={isOverdue} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <Calendar className="h-3.5 w-3.5" />
                {format(parseISO(schedule.plannedDate), "dd/MM/yyyy")}
              </div>
              {(schedule.targetDisease || schedule.targetPest) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {schedule.targetDisease && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      🦠 {schedule.targetDisease}
                    </span>
                  )}
                  {schedule.targetPest && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                      🐛 {schedule.targetPest}
                    </span>
                  )}
                </div>
              )}
              {schedule.notes && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{schedule.notes}</p>
              )}
            </div>

            {schedule.status === "PLANNED" && (
              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => onConvert(schedule)}
                >
                  <ChevronRight className="h-3.5 w-3.5 mr-1" />
                  Log Spray
                </Button>

                {/* Inline cancel confirm */}
                {!confirmCancel ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => setConfirmCancel(true)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-red-600 font-medium text-center">Are you sure?</p>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 text-[11px] flex-1 bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => { onCancel(schedule.id); setConfirmCancel(false); }}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] flex-1"
                        onClick={() => setConfirmCancel(false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type FilterTab = "ALL" | "PLANNED" | "COMPLETED" | "CANCELLED";

export default function SpraySchedulePage() {
  const router = useRouter();
  const { plots } = useStore();
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState<SpraySchedule[]>([]);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<SpraySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { plannedDate: today },
  });

  useEffect(() => {
    if (!user) return;
    getSpraySchedules(user.id).then((data) => {
      setSchedules(data);
      setIsLoading(false);
    });
  }, [user]);

  const filtered = schedules
    .filter((s) => filter === "ALL" || s.status === filter)
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    form.reset({ plannedDate: today });
  };

  const onCreateSubmit = async (data: ScheduleForm) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const created = await createSpraySchedule({
        userId: user.id,
        plotId: data.plotId,
        plannedDate: data.plannedDate,
        targetDisease: data.targetDisease || undefined,
        targetPest: data.targetPest || undefined,
        notes: data.notes || undefined,
        status: "PLANNED",
      });
      if (created) {
        setSchedules((prev) => [created, ...prev]);
        toast.success("Schedule created!");
        handleCloseCreate();
      } else {
        toast.error("Failed to create schedule. Make sure you've run the database migration.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await updateSprayScheduleStatus(id, "CANCELLED");
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "CANCELLED" } : s))
      );
      toast.success("Schedule cancelled.");
    } catch {
      toast.error("Failed to cancel schedule.");
    }
  };

  const handleConvert = (schedule: SpraySchedule) => {
    setSelectedSchedule(schedule);
    setIsConvertOpen(true);
  };

  const confirmConvert = () => {
    if (!selectedSchedule) return;
    router.push(
      `/spray/add?scheduleId=${selectedSchedule.id}&plotId=${selectedSchedule.plotId}&date=${selectedSchedule.plannedDate}&disease=${selectedSchedule.targetDisease ?? ""}&pest=${selectedSchedule.targetPest ?? ""}`
    );
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "ALL",       label: "All" },
    { key: "PLANNED",   label: "Upcoming" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Spray Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Plan upcoming sprays to stay ahead of disease and pests</p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const count =
            tab.key === "ALL"
              ? schedules.length
              : schedules.filter((s) => s.status === tab.key).length;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                filter === tab.key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {tab.label}
              <span className={cn("ml-1.5 text-xs font-semibold", filter === tab.key ? "text-primary-foreground/80" : "text-muted-foreground/70")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No schedules found</p>
          <p className="text-sm text-gray-400 mt-1">Create a schedule to plan your next spray session</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((s) => (
              <SprayScheduleCard
                key={s.id}
                schedule={s}
                plotName={plots.find((p) => p.id === s.plotId)?.name ?? "Unknown Plot"}
                onConvert={handleConvert}
                onCancel={handleCancel}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Create Schedule Modal ── */}
      <Modal isOpen={isCreateOpen} onClose={handleCloseCreate} title="Create Spray Schedule">
        <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
          {/* Plot */}
          <div className="space-y-1.5">
            <Label>Plot *</Label>
            <select
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...form.register("plotId")}
            >
              <option value="">Select a plot</option>
              {plots.filter((p) => p.isActive).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {form.formState.errors.plotId && (
              <p className="text-xs text-red-500">{form.formState.errors.plotId.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Planned Date *</Label>
            <Input type="date" min={today} {...form.register("plannedDate")} />
            {form.formState.errors.plannedDate && (
              <p className="text-xs text-red-500">{form.formState.errors.plannedDate.message}</p>
            )}
          </div>

          {/* Disease + Pest */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Target Disease</Label>
              <Input placeholder="e.g. Downy Mildew" {...form.register("targetDisease")} />
            </div>
            <div className="space-y-1.5">
              <Label>Target Pest</Label>
              <Input placeholder="e.g. Thrips" {...form.register("targetPest")} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea
              className="w-full rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              placeholder="Optional notes about this spray session..."
              {...form.register("notes")}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseCreate} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Convert Confirm Modal ── */}
      <Modal isOpen={isConvertOpen} onClose={() => setIsConvertOpen(false)} title="Convert to Spray Record">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will take you to the Spray form with this schedule's details pre-filled. The schedule will be marked as Completed once you save the spray.
          </p>
          {selectedSchedule && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 space-y-1 text-sm">
              <p className="font-semibold text-green-800">
                {plots.find((p) => p.id === selectedSchedule.plotId)?.name}
              </p>
              <p className="text-green-600">
                Planned: {format(parseISO(selectedSchedule.plannedDate), "dd/MM/yyyy")}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsConvertOpen(false)}>
              Go Back
            </Button>
            <Button type="button" onClick={confirmConvert}>
              Continue to Spray Form
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
