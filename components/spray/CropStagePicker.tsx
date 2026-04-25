"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CropStage } from "@/types";

const STAGES: { value: CropStage; emoji: string; label: string; description: string }[] = [
  { value: "Dormant",    emoji: "🌱", label: "Dormant",    description: "Vine is resting, no active growth" },
  { value: "Budding",   emoji: "🌿", label: "Budding",    description: "New buds are breaking open" },
  { value: "Flowering", emoji: "🌸", label: "Flowering",  description: "Vine is in full bloom" },
  { value: "FruitSet",  emoji: "🍇", label: "Fruit Set",  description: "Berries are forming after bloom" },
  { value: "Veraison",  emoji: "🍷", label: "Véraison",   description: "Grapes changing colour & ripening" },
  { value: "Harvest",   emoji: "🌾", label: "Harvest",    description: "Ready for picking" },
];

interface CropStagePickerProps {
  value: CropStage;
  onChange: (stage: CropStage) => void;
  error?: boolean;
}

export function CropStagePicker({ value, onChange, error }: CropStagePickerProps) {
  return (
    <div className={cn(
      "grid grid-cols-2 md:grid-cols-3 gap-3 p-1 rounded-xl",
      error && "ring-2 ring-red-400 ring-dashed"
    )}>
      {STAGES.map((stage) => {
        const isSelected = value === stage.value;
        return (
          <motion.button
            key={stage.value}
            type="button"
            onClick={() => onChange(stage.value)}
            whileHover={{ scale: isSelected ? 1.02 : 1.02 }}
            whileTap={{ scale: 0.97 }}
            animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center cursor-pointer transition-colors duration-200",
              isSelected
                ? "bg-green-50 border-green-500 shadow-md shadow-green-100"
                : "bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/30"
            )}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute top-2 right-2"
              >
                <CheckCircle className="h-4 w-4 text-green-600 fill-green-100" />
              </motion.div>
            )}
            <span className="text-2xl">{stage.emoji}</span>
            <span className={cn("text-sm font-semibold", isSelected ? "text-green-800" : "text-gray-700")}>
              {stage.label}
            </span>
            <span className={cn("text-[10px] leading-tight", isSelected ? "text-green-600" : "text-gray-400")}>
              {stage.description}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
