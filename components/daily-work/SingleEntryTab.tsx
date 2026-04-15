"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { LabourWork, WorkType, DayType, PaymentStatus, PaymentMode } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Plus, Filter, Trash2, Pencil, Calendar, CheckCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function SingleEntryTab() {
    const { labourers, labourWork, setLabourWork } = useStore();

    // Filters
    const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));
    const [workTypeFilter, setWorkTypeFilter] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
    const [labourSearch, setLabourSearch] = useState("");

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    // Form State
    const [editingEntry, setEditingEntry] = useState<LabourWork | null>(null);
    const [formData, setFormData] = useState<Partial<LabourWork>>({
        workDate: format(new Date(), "yyyy-MM-dd"),
        workType: "General",
        dayType: "Full_Day",
        amount: 0,
        paymentStatus: "Not_Paid",
        notes: ""
    });

    // Payment Modal State
    const [payEntryId, setPayEntryId] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState({
        paymentDate: format(new Date(), "yyyy-MM-dd"),
        paymentMode: "Cash" as PaymentMode
    });

    // Derived Data
    const filteredWork = labourWork.filter(w => {
        const labour = labourers.find(l => l.id === w.labourId);
        const matchesDate = !dateFilter || w.workDate === dateFilter;
        const matchesType = !workTypeFilter || w.workType === workTypeFilter;
        const matchesStatus = !paymentStatusFilter || w.paymentStatus === paymentStatusFilter;
        const matchesName = !labourSearch || (labour?.name.toLowerCase().includes(labourSearch.toLowerCase()));

        return matchesDate && matchesType && matchesStatus && matchesName;
    }).sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()); // sort desc? or maybe filtering by date usually implies seeing that day's work.

    // Stats for filtered view
    const totalAmount = filteredWork.reduce((sum, w) => sum + w.amount, 0);
    const totalPaid = filteredWork.filter(w => w.paymentStatus === "Paid").reduce((sum, w) => sum + w.amount, 0);
    const totalPending = totalAmount - totalPaid;

    // Actions
    const handleDelete = (id: string) => {
        if (confirm("Delete this work entry?")) {
            setLabourWork(labourWork.filter(w => w.id !== id));
        }
    };

    const openAddModal = () => {
        setEditingEntry(null);
        setFormData({
            workDate: format(new Date(), "yyyy-MM-dd"),
            workType: "General",
            dayType: "Full_Day",
            amount: 0,
            paymentStatus: "Not_Paid",
            labourId: "",
            notes: ""
        });
        setIsAddModalOpen(true);
    };

    const openEditModal = (entry: LabourWork) => {
        setEditingEntry(entry);
        setFormData(entry);
        setIsAddModalOpen(true);
    };

    const handleSaveEntry = () => {
        if (!formData.labourId || !formData.workDate) {
            alert("Please select Labour and Date");
            return;
        }

        if (editingEntry) {
            setLabourWork(labourWork.map(w => w.id === editingEntry.id ? { ...w, ...formData } as LabourWork : w));
        } else {
            const newEntry: LabourWork = {
                id: `work_${generateId()}`,
                ...formData
            } as LabourWork;
            setLabourWork([newEntry, ...labourWork]);
        }
        setIsAddModalOpen(false);
    };

    const handleLabourChange = (labourId: string) => {
        const labour = labourers.find(l => l.id === labourId);
        if (labour) {
            const salary = labour.perDaySalary;
            const amt = formData.dayType === "Full_Day" ? salary : salary / 2;
            setFormData({ ...formData, labourId, amount: amt });
        } else {
            setFormData({ ...formData, labourId: "", amount: 0 });
        }
    };

    const handleDayTypeChange = (dayType: DayType) => {
        const labour = labourers.find(l => l.id === formData.labourId);
        let amt = formData.amount || 0;
        if (labour) {
            amt = dayType === "Full_Day" ? labour.perDaySalary : labour.perDaySalary / 2;
        }
        setFormData({ ...formData, dayType, amount: amt });
    };

    // Payment Logic
    const openPayModal = (id: string) => {
        setPayEntryId(id);
        setPaymentData({ paymentDate: format(new Date(), "yyyy-MM-dd"), paymentMode: "Cash" });
        setIsPayModalOpen(true);
    };

    const handleConfirmPayment = () => {
        if (payEntryId) {
            setLabourWork(labourWork.map(w => w.id === payEntryId ? {
                ...w,
                paymentStatus: "Paid",
                paymentDate: paymentData.paymentDate,
                paymentMode: paymentData.paymentMode
            } : w));
            setIsPayModalOpen(false);
            setPayEntryId(null);
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between pb-2">
                <div className="flex flex-wrap gap-2 flex-1">
                    <Input
                        type="date"
                        className="w-[150px]"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={workTypeFilter}
                        onChange={e => setWorkTypeFilter(e.target.value)}
                    >
                        <option value="">All Works</option>
                        <option value="General">General</option>
                        <option value="Spray">Spray</option>
                        <option value="Cutting">Cutting</option>
                        <option value="Harvesting">Harvesting</option>
                    </select>
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={paymentStatusFilter}
                        onChange={e => setPaymentStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Not_Paid">Unpaid</option>
                    </select>
                    <Input
                        placeholder="Search Labour..."
                        className="w-[150px]"
                        value={labourSearch}
                        onChange={e => setLabourSearch(e.target.value)}
                    />
                </div>
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Work
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-md text-center text-sm">
                <div>
                    <span className="text-muted-foreground block">Entries</span>
                    <span className="font-bold text-lg">{filteredWork.length}</span>
                </div>
                <div>
                    <span className="text-muted-foreground block">Total Amount</span>
                    <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
                </div>
                <div>
                    <span className="text-muted-foreground block text-green-600">Paid</span>
                    <span className="font-bold text-lg text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div>
                    <span className="text-muted-foreground block text-red-600">Pending</span>
                    <span className="font-bold text-lg text-red-600">{formatCurrency(totalPending)}</span>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Work</th>
                                    <th className="p-3">Day Link</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWork.length === 0 ? (
                                    <tr><td colSpan={7} className="p-4 text-center">No records found.</td></tr>
                                ) : (
                                    filteredWork.map(w => {
                                        const labour = labourers.find(l => l.id === w.labourId);
                                        return (
                                            <tr key={w.id} className="border-t hover:bg-muted/50">
                                                <td className="p-3">{w.workDate}</td>
                                                <td className="p-3 font-medium">{labour?.name || "Unknown"}</td>
                                                <td className="p-3">{w.workType}</td>
                                                <td className="p-3">{w.dayType.replace("_", " ")}</td>
                                                <td className="p-3 font-medium">{formatCurrency(w.amount)}</td>
                                                <td className="p-3">
                                                    {w.paymentStatus === "Paid" ? (
                                                        <div className="flex flex-col text-xs text-green-700">
                                                            <span className="font-semibold bg-green-100 rounded-full px-2 py-0.5 w-fit">Paid</span>
                                                            <span className="opacity-70 mt-0.5">{w.paymentDate}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-semibold bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs">Unpaid</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right flex gap-1 justify-end">
                                                    {w.paymentStatus === "Not_Paid" ? (
                                                        <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 bg-green-50" onClick={() => openPayModal(w.id)}>
                                                            Pay
                                                        </Button>
                                                    ) : (
                                                        <div className="w-[50px]"></div> // Spacer
                                                    )}
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditModal(w)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(w.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingEntry ? "Edit Work Entry" : "New Work Entry"}
            >
                <div className="space-y-4">
                    {!editingEntry && ( // Only allow changing labour/date mostly on new entry to avoid confusion
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Labour</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.labourId}
                                onChange={e => handleLabourChange(e.target.value)}
                            >
                                <option value="">Select Labour</option>
                                {labourers.filter(l => l.isActive).map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.perDaySalary}/day)</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={formData.workDate} onChange={e => setFormData({ ...formData, workDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Work Type</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.workType}
                                onChange={e => setFormData({ ...formData, workType: e.target.value as WorkType })}
                            >
                                <option value="General">General</option>
                                <option value="Spray">Spray</option>
                                <option value="Cutting">Cutting</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Harvesting">Harvesting</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Day Type</label>
                            <div className="flex flex-col gap-1 pt-1">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" checked={formData.dayType === "Full_Day"} onChange={() => handleDayTypeChange("Full_Day")} /> Full Day
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" checked={formData.dayType === "Half_Day"} onChange={() => handleDayTypeChange("Half_Day")} /> Half Day
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount (₹)</label>
                            <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEntry}>Save</Button>
                    </div>
                </div>
            </Modal>

            {/* Pay Modal */}
            <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Mark as Paid">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Confirm payment details for this work entry.</p>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Payment Date</label>
                        <Input type="date" value={paymentData.paymentDate} onChange={e => setPaymentData({ ...paymentData, paymentDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Payment Mode</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={paymentData.paymentMode}
                            onChange={e => setPaymentData({ ...paymentData, paymentMode: e.target.value as PaymentMode })}
                        >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Bank_Transfer">Bank Transfer</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700">Confirm Payment</Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}
