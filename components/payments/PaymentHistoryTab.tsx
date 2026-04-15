"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";

export function PaymentHistoryTab() {
    const { labourWork, labourers, expenses } = useStore();
    const [searchTerm, setSearchTerm] = useState("");

    // Merge paid labour work and paid expenses
    // Requirement allows aggregating or just listing.
    // "Table: Date, Payee Name, Amount (₹), Mode, Reference, Purpose..."

    const history = [
        ...labourWork.filter(w => w.paymentStatus === "Paid").map(w => {
            const labour = labourers.find(l => l.id === w.labourId);
            return {
                id: w.id,
                date: w.paymentDate || w.workDate,
                payee: labour?.name || "Unknown",
                amount: w.amount,
                mode: w.paymentMode,
                reference: w.referenceId || "-",
                purpose: `Labour - ${w.workType}`,
                type: "Labour"
            };
        }),
        ...expenses.filter(e => e.paymentStatus === "Paid").map(e => ({
            id: e.id,
            date: e.expenseDate, // Expense date used as payment date usually, or could add paymentDate to OtherExpense model. Using expenseDate for now.
            payee: "Vendor/Other", // Other expenses usually don't have payee name field in our model
            amount: e.amount,
            mode: "Cash", // Default or add to model
            reference: "-",
            purpose: `${e.category} - ${e.description}`,
            type: "Expense"
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredHistory = history.filter(h =>
        h.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Payee</th>
                                    <th className="p-3">Purpose</th>
                                    <th className="p-3">Mode</th>
                                    <th className="p-3">Ref</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center">No payment history found.</td></tr>
                                ) : (
                                    filteredHistory.map((h, i) => (
                                        <tr key={i} className="border-t hover:bg-muted/50">
                                            <td className="p-3">{h.date}</td>
                                            <td className="p-3 font-medium">{h.payee}</td>
                                            <td className="p-3 text-muted-foreground">{h.purpose}</td>
                                            <td className="p-3 flex items-center gap-1">
                                                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border">{h.mode || "Cash"}</span>
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">{h.reference}</td>
                                            <td className="p-3 font-semibold text-right text-green-600">{formatCurrency(h.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
