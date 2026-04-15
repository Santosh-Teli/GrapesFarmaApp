"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { LabourWork, WorkType, DayType } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckSquare, Save } from "lucide-react";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function BulkEntryTab() {
    const { labourers, setLabourWork, labourWork } = useStore();
    const { user } = useAuthStore();
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [workType, setWorkType] = useState<WorkType>("General");
    const [dayType, setDayType] = useState<DayType>("Full_Day");
    const [selectedLabourIds, setSelectedLabourIds] = useState<Set<string>>(new Set());

    const activeLabourers = labourers.filter(l => l.isActive);

    const toggleSelectAll = () => {
        if (selectedLabourIds.size === activeLabourers.length) {
            setSelectedLabourIds(new Set());
        } else {
            setSelectedLabourIds(new Set(activeLabourers.map(l => l.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedLabourIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedLabourIds(newSet);
    };

    const handleSave = () => {
        if (selectedLabourIds.size === 0) {
            alert("Please select at least one labourer.");
            return;
        }

        const newEntries: LabourWork[] = [];
        selectedLabourIds.forEach(id => {
            const labour = labourers.find(l => l.id === id);
            if (labour) {
                const salary = labour.perDaySalary;
                const amount = dayType === "Full_Day" ? salary : salary / 2;

                newEntries.push({
                    id: `work_${generateId()}_${id}`, // unique-ish
                    labourId: id,
                    workDate: date,
                    workType,
                    dayType,
                    amount,
                    paymentStatus: "Not_Paid",
                    notes: "Bulk Entry",
                    userId: user?.id || ""
                });
            }
        });

        setLabourWork([...newEntries, ...labourWork]); // Prepend new entries
        alert(`${newEntries.length} work entries created successfully!`);
        setSelectedLabourIds(new Set());
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Work Type</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={workType}
                            onChange={e => setWorkType(e.target.value as WorkType)}
                        >
                            <option value="General">General</option>
                            <option value="Spray">Spray</option>
                            <option value="Cutting">Cutting</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Harvesting">Harvesting</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Day Type</label>
                        <div className="flex bg-muted p-1 rounded-md h-10 items-center">
                            <button
                                className={cn("flex-1 text-sm font-medium rounded-sm py-1", dayType === "Full_Day" ? "bg-white shadow text-primary" : "text-muted-foreground")}
                                onClick={() => setDayType("Full_Day")}
                            >
                                Full Day
                            </button>
                            <button
                                className={cn("flex-1 text-sm font-medium rounded-sm py-1", dayType === "Half_Day" ? "bg-white shadow text-primary" : "text-muted-foreground")}
                                onClick={() => setDayType("Half_Day")}
                            >
                                Half Day
                            </button>
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={selectedLabourIds.size === 0}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Selected ({selectedLabourIds.size})
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-3 w-[50px]">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={selectedLabourIds.size === activeLabourers.length && activeLabourers.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="p-3 font-medium">Name</th>
                                    <th className="p-3 font-medium">Gender</th>
                                    <th className="p-3 font-medium">Skill</th>
                                    <th className="p-3 font-medium">Salary/Day</th>
                                    <th className="p-3 font-medium">Amount ({dayType === "Full_Day" ? "Full" : "Half"})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeLabourers.map(l => {
                                    const salary = l.perDaySalary;
                                    const amount = dayType === "Full_Day" ? salary : salary / 2;
                                    const isSelected = selectedLabourIds.has(l.id);

                                    return (
                                        <tr key={l.id} className={cn("border-t hover:bg-muted/50 cursor-pointer", isSelected && "bg-blue-50 hover:bg-blue-100")} onClick={() => toggleSelect(l.id)}>
                                            <td className="p-3" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(l.id)}
                                                />
                                            </td>
                                            <td className="p-3 font-medium">{l.name}</td>
                                            <td className="p-3">{l.gender}</td>
                                            <td className="p-3">{l.skillType}</td>
                                            <td className="p-3">{formatCurrency(salary)}</td>
                                            <td className="p-3 font-semibold text-primary">{formatCurrency(amount)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
