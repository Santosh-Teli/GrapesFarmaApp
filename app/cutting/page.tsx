"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CuttingPage() {
    const { cuttingRecords, setCuttingRecords, plots } = useStore();
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const filteredRecords = cuttingRecords.filter(r => {
        const matchesDate = (!dateFrom || r.cuttingDate >= dateFrom) && (!dateTo || r.cuttingDate <= dateTo);
        const matchesType = !typeFilter || r.cuttingType === typeFilter;
        return matchesDate && matchesType;
    }).sort((a, b) => new Date(b.cuttingDate).getTime() - new Date(a.cuttingDate).getTime());

    const totalCost = filteredRecords.reduce((sum, r) => sum + r.totalLabourCost, 0);

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this record?")) {
            setCuttingRecords(cuttingRecords.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Cutting Management</h1>
                <Link href="/cutting/add">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Record
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row gap-4 space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" />
                    </div>
                    <select
                        className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="1st_Cutting">1st Cutting</option>
                        <option value="2nd_Cutting">2nd Cutting</option>
                        <option value="Summer_Pruning">Summer Pruning</option>
                        <option value="Winter_Pruning">Winter Pruning</option>
                        <option value="Thinning">Thinning</option>
                    </select>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-3 font-medium">Date</th>
                                    <th className="p-3 font-medium">Plot</th>
                                    <th className="p-3 font-medium">Type</th>
                                    <th className="p-3 font-medium">Labour (M/F)</th>
                                    <th className="p-3 font-medium">Day Type</th>
                                    <th className="p-3 font-medium">Total Cost</th>
                                    <th className="p-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">No records found.</td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((rec) => (
                                        <tr key={rec.id} className="border-t hover:bg-muted/50">
                                            <td className="p-3">{rec.cuttingDate}</td>
                                            <td className="p-3">{plots.find(p => p.id === rec.plotId)?.name}</td>
                                            <td className="p-3">{rec.cuttingType.replace(/_/g, " ")}</td>
                                            <td className="p-3">{rec.labourCount} ({rec.maleLabourCount}M / {rec.femaleLabourCount}F)</td>
                                            <td className="p-3">{rec.dayType.replace("_", " ")}</td>
                                            <td className="p-3 font-semibold">{formatCurrency(rec.totalLabourCost)}</td>
                                            <td className="p-3 text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(rec.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-4 bg-muted/20 rounded-md flex justify-between items-center">
                        <span className="font-semibold text-muted-foreground">Total Records: {filteredRecords.length}</span>
                        <div className="text-xl font-bold text-primary">
                            Total Cost: {formatCurrency(totalCost)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
