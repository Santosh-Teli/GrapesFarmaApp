"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function SprayPage() {
    const { sprayRecords, setSprayRecords, plots, pesticides, farm } = useStore();

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [plotFilter, setPlotFilter] = useState("");

    const filteredRecords = sprayRecords.filter(r => {
        const matchesDate = (!dateFrom || r.sprayDate >= dateFrom) && (!dateTo || r.sprayDate <= dateTo);
        const matchesPlot = !plotFilter || r.plotId === plotFilter;
        return matchesDate && matchesPlot;
    }).sort((a, b) => new Date(b.sprayDate).getTime() - new Date(a.sprayDate).getTime());

    // Calculations
    const totalPesticideCost = filteredRecords.reduce((sum, r) => sum + r.totalPesticideCost, 0);
    const totalLabourCost = filteredRecords.reduce((sum, r) => sum + r.labourCost, 0);
    const grandTotal = totalPesticideCost + totalLabourCost;

    const handleDelete = (id: string) => {
        if (confirm("Are you sure? This will RESTORE pesticide stock.")) {
            const record = sprayRecords.find(r => r.id === id);
            if (record) {
                // Restore stock logic defined here as well for deletion
                const updatedPests = [...pesticides];
                record.pesticideDetails.forEach(u => {
                    const p = updatedPests.find(pest => pest.id === u.pesticideId);
                    if (p) p.stockQuantity += u.quantityUsed;
                });
                // We need to access setPesticides from store, but we extracted 'pesticides' value, not setter.
                // Wait, useStore returns setters too.
                // NOTE: I need to update my useStore call in this component to get setPesticides.
                // See below...
            }
            setSprayRecords(sprayRecords.filter(r => r.id !== id));
        }
    };

    // Export Logic
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Spray Records Report", 14, 15);
        doc.text(`Farm: ${farm?.name}`, 14, 22);

        const tableData = filteredRecords.map(r => [
            r.sprayDate,
            plots.find(p => p.id === r.plotId)?.name || "-",
            r.sprayReason,
            r.pesticideDetails.map(d => pesticides.find(p => p.id === d.pesticideId)?.name).join(", "),
            formatCurrency(r.totalSprayCost)
        ]);

        autoTable(doc, {
            head: [["Date", "Plot", "Reason", "Pesticides", "Cost"]],
            body: tableData,
            startY: 30,
        });

        doc.save("spray-records.pdf");
    };

    const handleExportExcel = () => {
        const data = filteredRecords.map(r => ({
            Date: r.sprayDate,
            Plot: plots.find(p => p.id === r.plotId)?.name || "-",
            Reason: r.sprayReason,
            Pesticides: r.pesticideDetails.map(d => pesticides.find(p => p.id === d.pesticideId)?.name).join(", "),
            PesticideCost: r.totalPesticideCost,
            LabourCost: r.labourCost,
            TotalCost: r.totalSprayCost
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SprayRecords");
        XLSX.writeFile(wb, "spray-records.xlsx");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Spray Management</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportPDF}>PDF</Button>
                    <Button variant="outline" onClick={handleExportExcel}>Excel</Button>
                    <Link href="/spray/add">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Record
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row gap-4 space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" placeholder="From" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" placeholder="To" />
                    </div>
                    <select
                        className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={plotFilter}
                        onChange={e => setPlotFilter(e.target.value)}
                    >
                        <option value="">All Plots</option>
                        {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-3 font-medium">Date</th>
                                    <th className="p-3 font-medium">Plot</th>
                                    <th className="p-3 font-medium">Stage</th>
                                    <th className="p-3 font-medium">Reason</th>
                                    <th className="p-3 font-medium">Pesticides</th>
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
                                            <td className="p-3">{rec.sprayDate}</td>
                                            <td className="p-3">{plots.find(p => p.id === rec.plotId)?.name}</td>
                                            <td className="p-3">{rec.cropStage}</td>
                                            <td className="p-3">{rec.sprayReason}</td>
                                            <td className="p-3 max-w-[200px] truncate" title={rec.pesticideDetails.map(d => pesticides.find(p => p.id === d.pesticideId)?.name).join(", ")}>
                                                {rec.pesticideDetails.map(d => pesticides.find(p => p.id === d.pesticideId)?.name).join(", ")}
                                            </td>
                                            <td className="p-3 font-semibold">{formatCurrency(rec.totalSprayCost)}</td>
                                            <td className="p-3 text-right">
                                                {/* We won't implement full View/Edit interaction yet, just Delete for demo complexity reduction, or maybe a simple log */}
                                                {/* Check deletion logic above - requires setPesticides */}
                                                <DeleteButton id={rec.id} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-4 bg-muted/20 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase">Records</span>
                            <span className="font-bold text-lg">{filteredRecords.length}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase">Pesticide Cost</span>
                            <span className="font-bold text-lg">{formatCurrency(totalPesticideCost)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase">Grand Total</span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Separate component to access useStore context independently if needed (but we are in same file)
// Actually we can just expose setPesticides in the main component.
// But to fix the "setPesticides not available" issue mentioned in comment:
function DeleteButton({ id }: { id: string }) {
    const { sprayRecords, setSprayRecords, pesticides, setPesticides } = useStore();

    const handleDelete = () => {
        if (confirm("Are you sure? This will RESTORE pesticide stock.")) {
            const record = sprayRecords.find(r => r.id === id);
            if (record) {
                const updatedPests = [...pesticides];
                record.pesticideDetails.forEach(u => {
                    const pIndex = updatedPests.findIndex(pest => pest.id === u.pesticideId);
                    if (pIndex > -1) {
                        updatedPests[pIndex] = {
                            ...updatedPests[pIndex],
                            stockQuantity: updatedPests[pIndex].stockQuantity + u.quantityUsed
                        };
                    }
                });
                setPesticides(updatedPests);
            }
            setSprayRecords(sprayRecords.filter(r => r.id !== id));
        }
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
    )
}
