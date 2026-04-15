"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { Labour } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

export default function LabourDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { labourers, labourWork } = useStore();
    const [labour, setLabour] = useState<Labour | null>(null);

    const { id } = use(params);

    useEffect(() => {
        if (id) {
            const found = labourers.find(l => l.id === id);
            if (found) setLabour(found);
        }
    }, [id, labourers]);

    if (!labour) return <div>Loading...</div>;

    const works = labourWork.filter(w => w.labourId === labour.id).sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime());

    // Stats
    const fullDays = works.filter(w => w.dayType === "Full_Day").length;
    const halfDays = works.filter(w => w.dayType === "Half_Day").length;
    const totalDays = fullDays + (halfDays * 0.5);

    const totalEarned = works.reduce((sum, w) => sum + w.amount, 0);
    const totalPaid = works.filter(w => w.paymentStatus === "Paid").reduce((sum, w) => sum + w.amount, 0);
    const pending = totalEarned - totalPaid;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{labour.name}</h1>
                        <p className="text-muted-foreground text-sm">{labour.skillType} • {labour.phone}</p>
                    </div>
                </div>
                {pending > 0 && (
                    <Link href={`/payments?labourId=${labour.id}`}>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Wallet className="h-4 w-4 mr-2" />
                            Make Payment
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 pt-6">
                        <p className="text-sm text-muted-foreground">Total Days</p>
                        <p className="text-2xl font-bold">{totalDays}</p>
                        <p className="text-xs text-muted-foreground">{fullDays} Full, {halfDays} Half</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 pt-6">
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalEarned)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 pt-6">
                        <p className="text-sm text-muted-foreground">Paid Amount</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 pt-6">
                        <p className="text-sm text-muted-foreground">Pending Amount</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(pending)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Work History */}
            <Card>
                <CardHeader><CardTitle>Work History</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Work Type</th>
                                    <th className="p-3">Day Type</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Payment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {works.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center">No work history found.</td></tr>
                                ) : (
                                    works.map(w => (
                                        <tr key={w.id} className="border-t">
                                            <td className="p-3">{w.workDate}</td>
                                            <td className="p-3">{w.workType}</td>
                                            <td className="p-3">{w.dayType.replace("_", " ")}</td>
                                            <td className="p-3 font-medium">{formatCurrency(w.amount)}</td>
                                            <td className="p-3">
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-semibold select-none", w.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                                    {w.paymentStatus === "Paid" ? "Paid" : "Pending"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-muted-foreground border-l border-transparent">{w.paymentDate || "-"}</td>
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
