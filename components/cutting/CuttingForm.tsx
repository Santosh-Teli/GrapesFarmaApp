"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { CuttingRecord, CuttingType, DayType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const generateId = () => Math.random().toString(36).substr(2, 9);

interface CuttingFormProps {
    initialData?: CuttingRecord;
    isEdit?: boolean;
}

export function CuttingForm({ initialData, isEdit = false }: CuttingFormProps) {
    const router = useRouter();
    const { cuttingRecords, setCuttingRecords, plots } = useStore();

    const [formData, setFormData] = useState<Partial<CuttingRecord>>(initialData || {
        cuttingDate: format(new Date(), "yyyy-MM-dd"),
        plotId: "",
        cuttingType: "1st_Cutting",
        labourCount: 0,
        maleLabourCount: 0,
        femaleLabourCount: 0,
        perDaySalary: 400,
        dayType: "Full_Day",
        effectiveSalary: 400,
        totalLabourCost: 0,
        notes: ""
    });

    const [error, setError] = useState<string | null>(null);

    // Auto-calculate logic
    useEffect(() => {
        const salary = formData.perDaySalary || 0;
        const effective = formData.dayType === "Half_Day" ? salary / 2 : salary;
        const totalCost = (formData.labourCount || 0) * effective;

        setFormData(prev => ({
            ...prev,
            effectiveSalary: effective,
            totalLabourCost: totalCost
        }));

        // Validation logic
        const male = formData.maleLabourCount || 0;
        const female = formData.femaleLabourCount || 0;
        const total = formData.labourCount || 0;

        if (male + female !== total && total > 0) {
            setError(`Male (${male}) + Female (${female}) must equal Total Labour Count (${total})`);
        } else {
            setError(null);
        }
    }, [formData.perDaySalary, formData.dayType, formData.labourCount, formData.maleLabourCount, formData.femaleLabourCount]);


    const handleSubmit = () => {
        if (!formData.plotId || !formData.cuttingDate) {
            alert("Please fill required fields (Date, Plot)");
            return;
        }
        if (error) {
            alert(error);
            return;
        }

        const record: CuttingRecord = {
            ...formData,
            id: initialData?.id || `cut_${generateId()}`,
        } as CuttingRecord;

        if (isEdit) {
            setCuttingRecords(cuttingRecords.map(r => r.id === record.id ? record : r));
        } else {
            setCuttingRecords([record, ...cuttingRecords]);
        }

        router.push("/cutting");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{isEdit ? "Edit Cutting Record" : "New Cutting Record"}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Work Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cutting Date</label>
                            <Input type="date" value={formData.cuttingDate} onChange={e => setFormData({ ...formData, cuttingDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Plot</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.plotId}
                                onChange={e => setFormData({ ...formData, plotId: e.target.value })}
                            >
                                <option value="">Select Plot</option>
                                {plots.filter(p => p.isActive).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cutting Type</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.cuttingType}
                                onChange={e => setFormData({ ...formData, cuttingType: e.target.value as CuttingType })}
                            >
                                <option value="1st_Cutting">1st Cutting</option>
                                <option value="2nd_Cutting">2nd Cutting</option>
                                <option value="Summer_Pruning">Summer Pruning</option>
                                <option value="Winter_Pruning">Winter Pruning</option>
                                <option value="Thinning">Thinning</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Labour & Cost</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-600">Total Labour</label>
                                <Input type="number" value={formData.labourCount} onChange={e => setFormData({ ...formData, labourCount: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2 hidden md:block"></div> {/* Spacer */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Male Count</label>
                                <Input type="number" value={formData.maleLabourCount} onChange={e => setFormData({ ...formData, maleLabourCount: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Female Count</label>
                                <Input type="number" value={formData.femaleLabourCount} onChange={e => setFormData({ ...formData, femaleLabourCount: Number(e.target.value) })} />
                            </div>
                        </div>

                        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                        <div className="border-t pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Salary/Day (₹)</label>
                                <Input type="number" value={formData.perDaySalary} onChange={e => setFormData({ ...formData, perDaySalary: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Day Type</label>
                                <div className="flex flex-col gap-2 pt-1">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="dayType"
                                            value="Full_Day"
                                            checked={formData.dayType === "Full_Day"}
                                            onChange={() => setFormData({ ...formData, dayType: "Full_Day" })}
                                        /> Full Day
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="dayType"
                                            value="Half_Day"
                                            checked={formData.dayType === "Half_Day"}
                                            onChange={() => setFormData({ ...formData, dayType: "Half_Day" })}
                                        /> Half Day
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/20 p-4 rounded-md mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Effective Rate</span>
                                <span>{formatCurrency(formData.effectiveSalary || 0)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-primary">
                                <span>Total Cost</span>
                                <span>{formatCurrency(formData.totalLabourCost || 0)}</span>
                            </div>
                        </div>

                        <Button className="w-full" disabled={!!error} onClick={handleSubmit}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Record
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
