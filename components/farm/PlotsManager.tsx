"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Plot } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper for ID generation
const generateId = () => crypto.randomUUID();

export function PlotsManager() {
    const { plots, setPlots, farm } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlot, setEditingPlot] = useState<Plot | null>(null);

    const [formData, setFormData] = useState<Partial<Plot>>({
        name: "", areaAcres: 0, grapeVariety: "", plantingYear: new Date().getFullYear().toString()
    });

    const openAddModal = () => {
        setEditingPlot(null);
        setFormData({ name: "", areaAcres: 0, grapeVariety: "", plantingYear: new Date().getFullYear().toString() });
        setIsModalOpen(true);
    };

    const openEditModal = (plot: Plot) => {
        setEditingPlot(plot);
        setFormData(plot);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this plot?")) {
            setPlots(plots.filter(p => p.id !== id));
        }
    };

    const handleSave = () => {
        if (!farm) return;

        if (editingPlot) {
            // Update
            setPlots(plots.map(p => p.id === editingPlot.id ? { ...p, ...formData } as Plot : p));
        } else {
            // Add
            const newPlot: Plot = {
                id: generateId(),
                farmId: farm.id,
                isActive: true,
                ...formData
            } as Plot;
            setPlots([...plots, newPlot]);
        }
        setIsModalOpen(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Plots</CardTitle>
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plot
                </Button>
            </CardHeader>
            <CardContent>
                <div className="table-mobile-scroll rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="p-3 font-medium">Plot Name</th>
                                <th className="p-3 font-medium">Area (Acres)</th>
                                <th className="p-3 font-medium">Variety</th>
                                <th className="p-3 font-medium">Planting Year</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plots.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No plots found.</td>
                                </tr>
                            ) : (
                                plots.map((plot) => (
                                    <tr key={plot.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3 font-medium">{plot.name}</td>
                                        <td className="p-3">{plot.areaAcres}</td>
                                        <td className="p-3">{plot.grapeVariety}</td>
                                        <td className="p-3">{plot.plantingYear}</td>
                                        <td className="p-3">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", plot.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
                                                {plot.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(plot)}>
                                                <Pencil className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(plot.id)}>
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPlot ? "Edit Plot" : "Add New Plot"}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Plot Name</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Plot A"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Area (Acres)</label>
                        <Input
                            type="number"
                            value={formData.areaAcres}
                            onChange={e => setFormData({ ...formData, areaAcres: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Grape Variety</label>
                        <Input
                            value={formData.grapeVariety}
                            onChange={e => setFormData({ ...formData, grapeVariety: e.target.value })}
                            placeholder="e.g. Thompson Seedless"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Planting Year</label>
                        <Input
                            type="number"
                            value={formData.plantingYear}
                            onChange={e => setFormData({ ...formData, plantingYear: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Plot</Button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
}
