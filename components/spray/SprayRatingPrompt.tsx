"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, differenceInDays } from "date-fns";
import { StarRatingInput } from "./StarRatingInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { upsertSprayEffectiveness } from "@/lib/supabase/db";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { CheckCircle2, Clock, SkipForward, Droplets } from "lucide-react";
import type { Plot } from "@/types";

interface UnratedSpray {
  id: string;
  plot_id: string;
  spray_date: string;
  spray_reason: string;
  reason_detail?: string;
}

interface SprayRatingPromptProps {
  unratedSprays: UnratedSpray[];
  plots: Plot[];
  onDismiss: (id: string) => void;
}

export function SprayRatingPrompt({ unratedSprays, plots, onDismiss }: SprayRatingPromptProps) {
  const { user } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [diseaseControlled, setDiseaseControlled] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (unratedSprays.length === 0) return null;

  const spray = unratedSprays[currentIndex];
  if (!spray) return null;

  const plot = plots.find((p) => p.id === spray.plot_id);
  const daysSince = differenceInDays(new Date(), parseISO(spray.spray_date));

  const handleSubmit = async () => {
    if (!rating || diseaseControlled === null || !user) {
      toast.error("Please provide a rating and mark if disease was controlled.");
      return;
    }
    setIsSubmitting(true);
    try {
      await upsertSprayEffectiveness({
        userId: user.id,
        sprayRecordId: spray.id,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        effectivenessNotes: notes || undefined,
        diseaseControlled,
        reapplicationNeeded: rating <= 2,
      });
      toast.success("Rating submitted!");
      onDismiss(spray.id);
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      setRating(0);
      setDiseaseControlled(null);
      setNotes("");
    } catch {
      toast.error("Failed to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onDismiss(spray.id);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setRating(0);
    setDiseaseControlled(null);
    setNotes("");
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={spray.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-amber-900">
                    Rate Spray Effectiveness
                  </CardTitle>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {unratedSprays.length} spray{unratedSprays.length > 1 ? "s" : ""} pending rating
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-300 shrink-0">
                <Clock className="h-3 w-3 mr-1" />
                {daysSince}d ago
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="bg-white rounded-xl p-4 border border-amber-100 space-y-1">
              <p className="text-sm font-semibold text-gray-800">{plot?.name ?? "Unknown Plot"}</p>
              <p className="text-xs text-gray-500">
                {format(parseISO(spray.spray_date), "dd/MM/yyyy")} · {spray.spray_reason}
                {spray.reason_detail ? ` — ${spray.reason_detail}` : ""}
              </p>
            </div>

            {/* Star Rating */}
            <StarRatingInput value={rating} onChange={setRating} />

            {/* Disease Controlled */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 text-center">Was the disease/pest controlled?</p>
              <div className="flex gap-3 justify-center">
                {[
                  { val: true, label: "✅ Yes" },
                  { val: false, label: "❌ No" },
                ].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setDiseaseControlled(val)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      diseaseControlled === val
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-green-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <textarea
              className="w-full rounded-lg border border-gray-200 p-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              rows={2}
              placeholder="Any observations? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1 text-gray-500"
                onClick={handleSkip}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Submit Rating
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
