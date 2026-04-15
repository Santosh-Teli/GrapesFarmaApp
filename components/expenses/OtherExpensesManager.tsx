"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { OtherExpense, ExpenseCategory, PaymentStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Plus, Trash2, Pencil } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function OtherExpensesManager() {
    const { expenses, setExpenses } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<OtherExpense>>({
        expenseDate: format(new Date(), "yyyy-MM-dd"),
        category: "Fuel",
        description: "",
        amount: 0,
        paymentStatus: "Pending"
    });

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            expenseDate: format(new Date(), "yyyy-MM-dd"),
            category: "Fuel",
            description: "",
            amount: 0,
            paymentStatus: "Pending"
        });
        setIsModalOpen(true);
    };

    const openEditModal = (exp: OtherExpense) => {
        setEditingId(exp.id);
        setFormData(exp);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingId) {
            setExpenses(expenses.map(e => e.id === editingId ? { ...e, ...formData } as OtherExpense : e));
        } else {
            const newExp: OtherExpense = {
                id: `exp_${generateId()}`,
                ...formData
            } as OtherExpense;
            setExpenses([...expenses, newExp]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this expense?")) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    // Sort by date desc
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Other Expenses (Fuel, Transport, etc)</CardTitle>
                <Button size="sm" onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenses.length === 0 ? (
                                <tr><td colSpan={6} className="p-4 text-center">No other expenses recorded.</td></tr>
                            ) : (
                                sortedExpenses.map(exp => (
                                    <tr key={exp.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3">{exp.expenseDate}</td>
                                        <td className="p-3">{exp.category}</td>
                                        <td className="p-3">{exp.description}</td>
                                        <td className="p-3 font-medium">{formatCurrency(exp.amount)}</td>
                                        <td className="p-3">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", exp.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                                {exp.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(exp)}>
                                                <Pencil className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)}>
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
                title={editingId ? "Edit Expense" : "Add Other Expense"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={formData.expenseDate} onChange={e => setFormData({ ...formData, expenseDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                            >
                                <option value="Fuel">Fuel</option>
                                <option value="Transport">Transport</option>
                                <option value="Fertilizer">Fertilizer</option>
                                <option value="Tools">Tools</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount</label>
                            <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.paymentStatus}
                                onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                                disabled={!!editingId && formData.paymentStatus === "Paid"} // If fully paid maybe lock it? Nah let them edit.
                            >
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
}
