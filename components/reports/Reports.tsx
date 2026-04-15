"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/hooks/use-store";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import { startOfYear, endOfYear, format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// --- HELPERS ---
const ExportButtons = ({ onPdf, onExcel }: { onPdf: () => void, onExcel: () => void }) => (
    <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPdf}><Download className="h-4 w-4 mr-2" /> PDF</Button>
        <Button variant="outline" size="sm" onClick={onExcel}><Download className="h-4 w-4 mr-2" /> Excel</Button>
    </div>
);

// --- 1. Date-wise Expense Report ---
export function DateWiseExpenseReport() {
    const { sprayRecords, cuttingRecords, labourWork, expenses } = useStore();
    const [from, setFrom] = useState(format(startOfYear(new Date()), "yyyy-MM-dd"));
    const [to, setTo] = useState(format(endOfYear(new Date()), "yyyy-MM-dd"));

    const data = useMemo(() => {
        const dates = new Set<string>();
        const allData: any[] = [];

        // Collect all dates
        const check = (d: string) => d >= from && d <= to && dates.add(d);
        sprayRecords.forEach(r => check(r.sprayDate));
        cuttingRecords.forEach(r => check(r.cuttingDate));
        labourWork.filter(r => !r.referenceId).forEach(r => check(r.workDate));
        expenses.forEach(r => check(r.expenseDate));

        const sortedDates = Array.from(dates).sort();

        return sortedDates.map(date => {
            const spray = sprayRecords.filter(r => r.sprayDate === date).reduce((s, r) => s + r.totalSprayCost, 0);
            const cutting = cuttingRecords.filter(r => r.cuttingDate === date).reduce((s, r) => s + r.totalLabourCost, 0);
            const labour = labourWork.filter(r => r.workDate === date && !r.referenceId).reduce((s, r) => s + r.amount, 0);
            const other = expenses.filter(r => r.expenseDate === date).reduce((s, r) => s + r.amount, 0);
            return {
                date,
                spray,
                cutting,
                labour,
                other,
                total: spray + cutting + labour + other
            };
        });
    }, [sprayRecords, cuttingRecords, labourWork, expenses, from, to]);

    const totals = data.reduce((acc, row) => ({
        spray: acc.spray + row.spray,
        cutting: acc.cutting + row.cutting,
        labour: acc.labour + row.labour,
        other: acc.other + row.other,
        total: acc.total + row.total
    }), { spray: 0, cutting: 0, labour: 0, other: 0, total: 0 });

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Date-wise Expense Report (${from} to ${to})`, 14, 15);
        autoTable(doc, {
            head: [["Date", "Spray", "Cutting", "Labour", "Other", "Total"]],
            body: [
                ...data.map(r => [r.date, r.spray, r.cutting, r.labour, r.other, r.total]),
                ["TOTAL", totals.spray, totals.cutting, totals.labour, totals.other, totals.total]
            ],
            startY: 20
        });
        doc.save("date-wise-expenses.pdf");
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet([...data, { date: "TOTAL", ...totals }]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expenses");
        XLSX.writeFile(wb, "date-wise-expenses.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex gap-4">
                    <div className="space-y-1"><span className="text-sm">From</span><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
                    <div className="space-y-1"><span className="text-sm">To</span><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
                </div>
                <ExportButtons onPdf={exportPDF} onExcel={exportExcel} />
            </div>
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 font-medium">
                        <tr><th className="p-3">Date</th><th className="p-3">Spray</th><th className="p-3">Cutting</th><th className="p-3">Labour</th><th className="p-3">Other</th><th className="p-3">Total</th></tr>
                    </thead>
                    <tbody>
                        {data.map(r => (
                            <tr key={r.date} className="border-t hover:bg-muted/50">
                                <td className="p-3">{r.date}</td>
                                <td className="p-3">{formatCurrency(r.spray)}</td>
                                <td className="p-3">{formatCurrency(r.cutting)}</td>
                                <td className="p-3">{formatCurrency(r.labour)}</td>
                                <td className="p-3">{formatCurrency(r.other)}</td>
                                <td className="p-3 font-semibold">{formatCurrency(r.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-muted font-bold">
                        <tr>
                            <td className="p-3">TOTAL</td>
                            <td className="p-3">{formatCurrency(totals.spray)}</td>
                            <td className="p-3">{formatCurrency(totals.cutting)}</td>
                            <td className="p-3">{formatCurrency(totals.labour)}</td>
                            <td className="p-3">{formatCurrency(totals.other)}</td>
                            <td className="p-3">{formatCurrency(totals.total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

// --- 2. Labour Salary Report ---
export function LabourSalaryReport() {
    const { labourers, labourWork } = useStore();
    const [from, setFrom] = useState(format(startOfYear(new Date()), "yyyy-MM-dd"));
    const [to, setTo] = useState(format(endOfYear(new Date()), "yyyy-MM-dd"));
    const [gender, setGender] = useState("");

    const data = useMemo(() => {
        return labourers
            .filter(l => !gender || l.gender === gender)
            .map(l => {
                const works = labourWork.filter(w => w.labourId === l.id && w.workDate >= from && w.workDate <= to);
                const full = works.filter(w => w.dayType === "Full_Day").length;
                const half = works.filter(w => w.dayType === "Half_Day").length;
                const salary = works.reduce((s, w) => s + w.amount, 0);
                const paid = works.filter(w => w.paymentStatus === "Paid").reduce((s, w) => s + w.amount, 0);
                return {
                    id: l.id,
                    name: l.name,
                    gender: l.gender,
                    totalDays: full + (half * 0.5),
                    full,
                    half,
                    salary,
                    paid,
                    pending: salary - paid
                };
            }).filter(d => d.salary > 0);
    }, [labourers, labourWork, from, to, gender]);

    // Export helpers similar to above...
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Labour Salary Report", 14, 15);
        autoTable(doc, {
            head: [["Name", "Gender", "Days", "Salary", "Paid", "Pending"]],
            body: data.map(r => [r.name, r.gender, r.totalDays, r.salary, r.paid, r.pending]),
            startY: 20
        });
        doc.save("labour-salary.pdf");
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "LabourSalary");
        XLSX.writeFile(wb, "labour-salary.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex gap-4">
                    <div className="space-y-1"><span className="text-sm">From</span><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
                    <div className="space-y-1"><span className="text-sm">To</span><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
                    <div className="space-y-1">
                        <span className="text-sm">Gender</span>
                        <select className="h-10 rounded-md border px-3" value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="">All</option><option value="Male">Male</option><option value="Female">Female</option>
                        </select>
                    </div>
                </div>
                <ExportButtons onPdf={exportPDF} onExcel={exportExcel} />
            </div>
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 font-medium">
                        <tr><th className="p-3">Name</th><th className="p-3">Gender</th><th className="p-3">Total Days</th><th className="p-3">Total Salary</th><th className="p-3">Paid</th><th className="p-3">Pending</th></tr>
                    </thead>
                    <tbody>
                        {data.map(r => (
                            <tr key={r.id} className="border-t hover:bg-muted/50">
                                <td className="p-3 font-medium">{r.name}</td>
                                <td className="p-3">{r.gender}</td>
                                <td className="p-3">{r.totalDays} ({r.full}F / {r.half}H)</td>
                                <td className="p-3">{formatCurrency(r.salary)}</td>
                                <td className="p-3 text-green-600">{formatCurrency(r.paid)}</td>
                                <td className={cn("p-3 font-medium", r.pending > 0 ? "text-red-600" : "text-muted-foreground")}>{formatCurrency(r.pending)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- 3. Pesticide Usage Report ---
export function PesticideUsageReport() {
    const { pesticides, sprayRecords } = useStore();
    const [from, setFrom] = useState(format(startOfYear(new Date()), "yyyy-MM-dd"));
    const [to, setTo] = useState(format(endOfYear(new Date()), "yyyy-MM-dd"));

    const data = useMemo(() => {
        return pesticides.map(p => {
            const usages = sprayRecords
                .filter(r => r.sprayDate >= from && r.sprayDate <= to)
                .flatMap(r => r.pesticideDetails)
                .filter(u => u.pesticideId === p.id);

            const timesUsed = usages.length;
            const totalQty = usages.reduce((s, u) => s + u.quantityUsed, 0);
            const totalCost = usages.reduce((s, u) => s + u.cost, 0);

            return {
                name: p.name,
                company: p.companyName,
                timesUsed,
                totalQty,
                unit: p.unitType,
                totalCost,
                currentStock: p.stockQuantity,
                alertLevel: p.lowStockAlertLevel
            };
        }).filter(d => d.timesUsed > 0);
    }, [pesticides, sprayRecords, from, to]);

    // Export helpers...
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Pesticide Usage Report", 14, 15);
        autoTable(doc, {
            head: [["Name", "Company", "Used (Qty)", "Total Cost", "Stock"]],
            body: data.map(r => [r.name, r.company, `${r.totalQty} ${r.unit}`, r.totalCost, r.currentStock]),
            startY: 20
        });
        doc.save("pesticide-usage.pdf");
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PesticideUsage");
        XLSX.writeFile(wb, "pesticide-usage.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex gap-4">
                    <div className="space-y-1"><span className="text-sm">From</span><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
                    <div className="space-y-1"><span className="text-sm">To</span><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
                </div>
                <ExportButtons onPdf={exportPDF} onExcel={exportExcel} />
            </div>
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 font-medium">
                        <tr><th className="p-3">Pesticide</th><th className="p-3">Company</th><th className="p-3">Times Used</th><th className="p-3">Total Qty</th><th className="p-3">Total Cost</th><th className="p-3">Current Stock</th></tr>
                    </thead>
                    <tbody>
                        {data.map(r => (
                            <tr key={r.name} className="border-t hover:bg-muted/50">
                                <td className="p-3 font-medium">{r.name}</td>
                                <td className="p-3">{r.company}</td>
                                <td className="p-3">{r.timesUsed}</td>
                                <td className="p-3">{r.totalQty} {r.unit}</td>
                                <td className="p-3">{formatCurrency(r.totalCost)}</td>
                                <td className="p-3">
                                    <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", r.currentStock <= r.alertLevel ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                                        {r.currentStock} {r.unit}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- 4. Stock Report ---
export function StockReport() {
    const { pesticides, sprayRecords } = useStore(); // sprayRecords needed for 'Last Used'

    const data = useMemo(() => {
        return pesticides.map(p => {
            // Find last used date
            const usages = sprayRecords
                .filter(r => r.pesticideDetails.some(u => u.pesticideId === p.id))
                .sort((a, b) => new Date(b.sprayDate).getTime() - new Date(a.sprayDate).getTime());
            const lastUsed = usages.length > 0 ? usages[0].sprayDate : "Never";

            let status = "OK";
            if (p.stockQuantity <= 0) status = "OUT";
            else if (p.stockQuantity <= p.lowStockAlertLevel) status = "LOW";
            else if (p.stockQuantity <= p.lowStockAlertLevel * 2) status = "MID"; // Optional 'MID' or just OK. User req says OK/LOW/OUT. 

            return {
                name: p.name,
                company: p.companyName,
                unit: p.unitType,
                stock: p.stockQuantity,
                alert: p.lowStockAlertLevel,
                status,
                lastUsed
            };
        });
    }, [pesticides, sprayRecords]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Stock Report", 14, 15);
        autoTable(doc, {
            head: [["Name", "Company", "Stock", "Status", "Last Used"]],
            body: data.map(r => [r.name, r.company, `${r.stock} ${r.unit}`, r.status, r.lastUsed]),
            startY: 20
        });
        doc.save("stock-report.pdf");
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock");
        XLSX.writeFile(wb, "stock-report.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <ExportButtons onPdf={exportPDF} onExcel={exportExcel} />
            </div>
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 font-medium">
                        <tr><th className="p-3">Pesticide</th><th className="p-3">Company</th><th className="p-3">Stock</th><th className="p-3">Alert Level</th><th className="p-3">Status</th><th className="p-3">Last Used</th></tr>
                    </thead>
                    <tbody>
                        {data.map(r => (
                            <tr key={r.name} className="border-t hover:bg-muted/50">
                                <td className="p-3 font-medium">{r.name}</td>
                                <td className="p-3">{r.company}</td>
                                <td className="p-3">{r.stock} {r.unit}</td>
                                <td className="p-3">{r.alert}</td>
                                <td className="p-3">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-semibold",
                                        r.status === "OUT" ? "bg-red-100 text-red-700" :
                                            r.status === "LOW" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-green-100 text-green-700"
                                    )}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="p-3">{r.lastUsed}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- 5. Payment Pending Report ---
export function PaymentPendingReport() {
    // This is basically PendingPaymentsTab but readonly/report view
    // Reuse logic from PendingPaymentsTab or duplicate for isolation? 
    // Duplicate logic for simplicity in export.
    const { labourers, labourWork } = useStore();

    const data = useMemo(() => {
        const groups: { [key: string]: { name: string, phone: string, count: number, pending: number, lastPayment: string } } = {};

        labourWork.forEach(w => {
            if (!groups[w.labourId]) {
                const l = labourers.find(x => x.id === w.labourId);
                if (l) groups[w.labourId] = { name: l.name, phone: l.phone, count: 0, pending: 0, lastPayment: "-" };
            }
            if (groups[w.labourId]) {
                if (w.paymentStatus === "Not_Paid") {
                    groups[w.labourId].pending += w.amount;
                    groups[w.labourId].count += 1;
                } else {
                    // Find latest payment date
                    const d = w.paymentDate || "";
                    if (d > groups[w.labourId].lastPayment) groups[w.labourId].lastPayment = d;
                }
            }
        });

        return Object.values(groups).filter(g => g.pending > 0).sort((a, b) => b.pending - a.pending);
    }, [labourers, labourWork]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Payment Pending Report", 14, 15);
        autoTable(doc, {
            head: [["Name", "Phone", "Unpaid Entries", "Pending Amount", "Last Payment"]],
            body: data.map(r => [r.name, r.phone, r.count, r.pending, r.lastPayment]),
            startY: 20
        });
        doc.save("payment-pending.pdf");
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pending");
        XLSX.writeFile(wb, "payment-pending.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <ExportButtons onPdf={exportPDF} onExcel={exportExcel} />
            </div>
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 font-medium">
                        <tr><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Unpaid Entries</th><th className="p-3">Pending Amount</th><th className="p-3">Last Payment</th></tr>
                    </thead>
                    <tbody>
                        {data.map(r => (
                            <tr key={r.name} className="border-t hover:bg-muted/50">
                                <td className="p-3 font-medium">{r.name}</td>
                                <td className="p-3">{r.phone}</td>
                                <td className="p-3">{r.count}</td>
                                <td className="p-3 font-bold text-red-600">{formatCurrency(r.pending)}</td>
                                <td className="p-3">{r.lastPayment}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
