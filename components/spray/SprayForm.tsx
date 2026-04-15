"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { SprayRecord, PesticideUsage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

// Helper ID gen
const generateId = () => Math.random().toString(36).substr(2, 9);

interface SprayFormProps {
    initialData?: SprayRecord;
    isEdit?: boolean;
}

export function SprayForm({ initialData, isEdit = false }: SprayFormProps) {
    const router = useRouter();
    const { pesticides, setPesticides, sprayRecords, setSprayRecords, plots, farm } = useStore();

    const [formData, setFormData] = useState<Partial<SprayRecord>>(initialData || {
        sprayDate: format(new Date(), "yyyy-MM-dd"),
        plotId: "",
        cropStage: "Growth",
        weatherCondition: "Sunny",
        sprayReason: "Preventive",
        reasonDetail: "",
        waterMixedLitres: 0,
        labourUsed: false,
        labourCount: 0,
        labourCost: 0,
        pesticideDetails: [],
        notes: ""
    });

    const [pesticideRows, setPesticideRows] = useState<PesticideUsage[]>(initialData?.pesticideDetails || []);

    // Update rows when they change to recalculate totals
    useEffect(() => {
        setFormData(prev => ({ ...prev, pesticideDetails: pesticideRows }));
    }, [pesticideRows]);

    const handleAddPesticideRow = () => {
        setPesticideRows([...pesticideRows, { pesticideId: "", quantityUsed: 0, priceAtTime: 0, cost: 0 }]);
    };

    const handleRemovePesticideRow = (index: number) => {
        const newRows = [...pesticideRows];
        newRows.splice(index, 1);
        setPesticideRows(newRows);
    };

    const handlePesticideChange = (index: number, field: keyof PesticideUsage, value: any) => {
        const newRows = [...pesticideRows];
        const row = { ...newRows[index] };

        if (field === "pesticideId") {
            const selectedPest = pesticides.find(p => p.id === value);
            if (selectedPest) {
                row.pesticideId = selectedPest.id;
                row.priceAtTime = selectedPest.pricePerUnit;
                // Recalc cost if quantity exists
                row.cost = row.quantityUsed * selectedPest.pricePerUnit;
            }
        } else if (field === "quantityUsed") {
            row.quantityUsed = Number(value);
            row.cost = row.quantityUsed * row.priceAtTime;
        }

        newRows[index] = row;
        setPesticideRows(newRows);
    };

    const totalPesticideCost = pesticideRows.reduce((sum, row) => sum + row.cost, 0);
    const totalSprayCost = totalPesticideCost + (formData.labourCost || 0);

    const handleSubmit = () => {
        if (!formData.plotId || !formData.sprayDate) {
            alert("Please fill required fields (Date, Plot)");
            return;
        }

        const record: SprayRecord = {
            ...formData,
            id: initialData?.id || `spray_${generateId()}`,
            totalPesticideCost,
            totalSprayCost,
            pesticideDetails: pesticideRows
        } as SprayRecord;

        // Stock Update Logic
        if (isEdit && initialData) {
            // 1. Revert old stock impact
            const revertedPests = [...pesticides];
            initialData.pesticideDetails.forEach(usage => {
                const pIndex = revertedPests.findIndex(p => p.id === usage.pesticideId);
                if (pIndex > -1) {
                    revertedPests[pIndex] = {
                        ...revertedPests[pIndex],
                        stockQuantity: revertedPests[pIndex].stockQuantity + usage.quantityUsed
                    };
                }
            });

            // 2. Apply new stock impact
            const finalPests = revertedPests.map(p => {
                const usage = record.pesticideDetails.find(u => u.pesticideId === p.id);
                if (usage) {
                    return { ...p, stockQuantity: p.stockQuantity - usage.quantityUsed };
                }
                return p;
            });
            setPesticides(finalPests);

            // Update Record
            setSprayRecords(sprayRecords.map(r => r.id === record.id ? record : r));

        } else {
            // New Record: Reduce stock
            const updatedPests = pesticides.map(p => {
                const usage = record.pesticideDetails.find(u => u.pesticideId === p.id);
                if (usage) {
                    return { ...p, stockQuantity: p.stockQuantity - usage.quantityUsed };
                }
                return p;
            });
            setPesticides(updatedPests);

            // Add Record
            setSprayRecords([record, ...sprayRecords]);
        }

        // Check low stock
        record.pesticideDetails.forEach(u => {
            const p = pesticides.find(pest => pest.id === u.pesticideId);
            // Note: we are using 'pesticides' state here which might be stale in this closure if we just called setPesticides.
            // But for alert purpose, we can approximate or use the calculated value.
            if (p && (p.stockQuantity - u.quantityUsed) <= p.lowStockAlertLevel) {
                alert(`Warning: Low stock for ${p.name}`);
            }
        });

        router.push("/spray");
    };

    // Filter active pesticides (plus allow existing selected ones even if inactive)
    const availablePesticides = pesticides.filter(p => p.isActive || pesticideRows.some(r => r.pesticideId === p.id));

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{isEdit ? "Edit Spray Record" : "New Spray Record"}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 1: Basic Info */}
                    <Card>
                        <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Spray Date</label>
                                <Input type="date" value={formData.sprayDate} onChange={e => setFormData({ ...formData, sprayDate: e.target.value })} />
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
                                <label className="text-sm font-medium">Crop Stage</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.cropStage}
                                    onChange={e => setFormData({ ...formData, cropStage: e.target.value as any })}
                                >
                                    <option value="Growth">Growth</option>
                                    <option value="Flowering">Flowering</option>
                                    <option value="Fruiting">Fruiting</option>
                                    <option value="Dormant">Dormant</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Weather</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.weatherCondition}
                                    onChange={e => setFormData({ ...formData, weatherCondition: e.target.value as any })}
                                >
                                    <option value="Sunny">Sunny</option>
                                    <option value="Cloudy">Cloudy</option>
                                    <option value="Rainy">Rainy</option>
                                    <option value="Windy">Windy</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reason</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.sprayReason}
                                    onChange={e => setFormData({ ...formData, sprayReason: e.target.value as any })}
                                >
                                    <option value="Preventive">Preventive</option>
                                    <option value="Disease">Disease</option>
                                    <option value="Pest">Pest</option>
                                    <option value="Growth">Growth</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reason Detail</label>
                                <Input value={formData.reasonDetail} onChange={e => setFormData({ ...formData, reasonDetail: e.target.value })} placeholder="Optional detail" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Pesticide Details */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pesticides Used</CardTitle>
                            <Button size="sm" onClick={handleAddPesticideRow}><Plus className="h-4 w-4 mr-2" /> Add Pesticide</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pesticideRows.map((row, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-3 rounded-md bg-muted/20">
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-xs font-medium">Pesticide</label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                            value={row.pesticideId}
                                            onChange={e => handlePesticideChange(index, "pesticideId", e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            {availablePesticides.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.companyName})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-medium">Qty</label>
                                        <Input
                                            type="number"
                                            className="h-9"
                                            value={row.quantityUsed}
                                            onChange={e => handlePesticideChange(index, "quantityUsed", e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-medium">Unit</label>
                                        <div className="h-9 flex items-center px-3 text-sm bg-muted rounded-md text-muted-foreground">
                                            {pesticides.find(p => p.id === row.pesticideId)?.unitType || "-"}
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-xs font-medium">Cost</label>
                                        <div className="h-9 flex items-center px-3 text-sm bg-muted rounded-md font-semibold">
                                            {formatCurrency(row.cost)}
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => handleRemovePesticideRow(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end pt-2">
                                <p className="font-semibold text-sm">Total Pesticide Cost: {formatCurrency(totalPesticideCost)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Water & Notes */}
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Water Mixed (Litres)</label>
                                <Input type="number" value={formData.waterMixedLitres} onChange={e => setFormData({ ...formData, waterMixedLitres: Number(e.target.value) })} />
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
                </div>

                <div className="space-y-6">
                    {/* Section 3: Labour Details (Side Panel) */}
                    <Card>
                        <CardHeader><CardTitle>Labour</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="useLabour"
                                    className="h-4 w-4"
                                    checked={formData.labourUsed}
                                    onChange={e => setFormData({ ...formData, labourUsed: e.target.checked })}
                                />
                                <label htmlFor="useLabour" className="text-sm font-medium">Labour Used?</label>
                            </div>

                            {formData.labourUsed && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Labour Count</label>
                                        <Input type="number" value={formData.labourCount} onChange={e => setFormData({ ...formData, labourCount: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Labour Cost (₹)</label>
                                        <Input type="number" value={formData.labourCost} onChange={e => setFormData({ ...formData, labourCost: Number(e.target.value) })} />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section 5: Summary */}
                    <Card className="bg-primary/5 border-primary/20 sticky top-20">
                        <CardHeader><CardTitle>Cost Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Pesticides</span>
                                <span>{formatCurrency(totalPesticideCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Labour</span>
                                <span>{formatCurrency(formData.labourCost || 0)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg text-primary">
                                <span>Total Cost</span>
                                <span>{formatCurrency(totalSprayCost)}</span>
                            </div>

                            <Button className="w-full mt-4" size="lg" onClick={handleSubmit}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Record
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
