"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Pesticide, UnitType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

// Helper for ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PesticideMasterPage() {
    const { pesticides, setPesticides } = useStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Pesticide>>({
        name: "", companyName: "", unitType: "gram", pricePerUnit: 0, stockQuantity: 0, lowStockAlertLevel: 0, isActive: true
    });

    const filteredPesticides = pesticides.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : p.isActive;
        return matchesSearch && matchesStatus;
    });

    const getStockColor = (p: Pesticide) => {
        if (p.stockQuantity <= p.lowStockAlertLevel) return "text-red-600 bg-red-100";
        if (p.stockQuantity <= p.lowStockAlertLevel * 2) return "text-yellow-700 bg-yellow-100";
        return "text-green-600 bg-green-100";
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ name: "", companyName: "", unitType: "gram", pricePerUnit: 0, stockQuantity: 0, lowStockAlertLevel: 0, isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (p: Pesticide) => {
        setEditingId(p.id);
        setFormData(p);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete (soft delete) this pesticide?")) {
            setPesticides(pesticides.map(p => p.id === id ? { ...p, isActive: false } : p));
        }
    };

    const handleSave = () => {
        if (editingId) {
            setPesticides(pesticides.map(p => p.id === editingId ? { ...p, ...formData } as Pesticide : p));
        } else {
            const newPest: Pesticide = {
                id: `pest_${generateId()}`,
                ...formData
            } as Pesticide;
            setPesticides([...pesticides, newPest]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Pesticide Master</h1>
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pesticide
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center space-y-0 gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or company..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={() => setShowInactive(!showInactive)}>
                        {showInactive ? "Hide Inactive" : "Show Inactive"}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-3 font-medium">Name</th>
                                    <th className="p-3 font-medium">Company</th>
                                    <th className="p-3 font-medium">Unit</th>
                                    <th className="p-3 font-medium">Price/Unit</th>
                                    <th className="p-3 font-medium">Stock</th>
                                    <th className="p-3 font-medium">Status</th>
                                    <th className="p-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPesticides.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">No pesticides found.</td>
                                    </tr>
                                ) : (
                                    filteredPesticides.map((pest) => (
                                        <tr key={pest.id} className={cn("border-t hover:bg-muted/50", !pest.isActive && "opacity-60 bg-muted/20")}>
                                            <td className="p-3 font-medium">{pest.name}</td>
                                            <td className="p-3">{pest.companyName}</td>
                                            <td className="p-3 capitalize">{pest.unitType}</td>
                                            <td className="p-3">{formatCurrency(pest.pricePerUnit)}</td>
                                            <td className="p-3">
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1", getStockColor(pest))}>
                                                    {pest.stockQuantity}
                                                    {pest.stockQuantity <= pest.lowStockAlertLevel && <AlertTriangle className="h-3 w-3" />}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", pest.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
                                                    {pest.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(pest)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                {pest.isActive && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pest.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Pesticide" : "Add Pesticide"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company</label>
                            <Input value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Unit Type</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.unitType}
                                onChange={(e) => setFormData({ ...formData, unitType: e.target.value as UnitType })}
                            >
                                <option value="gram">gram</option>
                                <option value="ml">ml</option>
                                <option value="litre">litre</option>
                                <option value="kg">kg</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price Per Unit (₹)</label>
                            <Input type="number" value={formData.pricePerUnit} onChange={e => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stock Quantity</label>
                            <Input type="number" value={formData.stockQuantity} onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Low Stock Alert</label>
                            <Input type="number" value={formData.lowStockAlertLevel} onChange={e => setFormData({ ...formData, lowStockAlertLevel: Number(e.target.value) })} />
                        </div>
                    </div>

                    {editingId && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Pesticide</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
