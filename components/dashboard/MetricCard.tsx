import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: string; // Tailwind text color class, e.g. "text-blue-500"
    bgColor: string; // Tailwind bg class, e.g. "bg-blue-50"
}

export function MetricCard({ label, value, icon: Icon, color, bgColor }: MetricCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col space-y-1.5">
                        <span className="text-sm font-medium text-muted-foreground">{label}</span>
                        <span className="text-2xl font-bold">{value}</span>
                    </div>
                    <div className={cn("p-3 rounded-full", bgColor, color)}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
