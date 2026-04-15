"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getAllProfiles } from "@/lib/supabase/auth";
import type { ProfileRow } from "@/lib/supabase/types";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, ShieldCheck, UserCheck, UserX, Grape,
    FlaskConical, Scissors, Droplets, Receipt, BadgeCheck,
    TrendingUp, Activity
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const roleBadgeClass: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700 border-purple-300",
    FARMER: "bg-green-100 text-green-700 border-green-300",
    CUSTOMER: "bg-blue-100 text-blue-700 border-blue-300",
};

const statusBadgeClass: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    SUSPENDED: "bg-red-100 text-red-700",
    PENDING: "bg-amber-100 text-amber-700",
};

function StatCard({ label, value, icon: Icon, color }: { label: string; value: React.ReactNode; icon: React.ElementType; color: string }) {
    return (
        <Card>
            <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { labourers, sprayRecords, cuttingRecords, expenses, pesticides, plots } = useStore();
    const [allUsers, setAllUsers] = useState<ProfileRow[]>([]);

    useEffect(() => {
        if (user?.role !== "ADMIN") {
            router.replace("/");
            return;
        }
        getAllProfiles().then(setAllUsers);
    }, [user, router]);

    if (user?.role !== "ADMIN") return null;

    const totalExpense =
        sprayRecords.reduce((s, r) => s + r.totalSprayCost, 0) +
        cuttingRecords.reduce((s, r) => s + r.totalLabourCost, 0) +
        expenses.reduce((s, r) => s + r.amount, 0);

    const activeUsers = allUsers.filter(u => u.status === "ACTIVE").length;
    const suspendedUsers = allUsers.filter(u => u.status === "SUSPENDED").length;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#4A1D96] flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A2E]">Admin Panel</h1>
                    <p className="text-sm text-muted-foreground">
                        Full system overview — Welcome, <span className="font-semibold text-[#4A1D96]">{user.full_name}</span>
                    </p>
                </div>
                <div className="ml-auto">
                    <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 border border-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <BadgeCheck className="h-3.5 w-3.5" /> Administrator
                    </span>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={allUsers.length} icon={Users} color="bg-purple-100 text-purple-600" />
                <StatCard label="Active Users" value={activeUsers} icon={UserCheck} color="bg-emerald-100 text-emerald-600" />
                <StatCard label="Suspended" value={suspendedUsers} icon={UserX} color="bg-red-100 text-red-600" />
                <StatCard label="Farm Plots" value={plots.length} icon={Grape} color="bg-green-100 text-green-700" />
                <StatCard label="Labourers" value={labourers.length} icon={Users} color="bg-orange-100 text-orange-600" />
                <StatCard label="Spray Records" value={sprayRecords.length} icon={Droplets} color="bg-cyan-100 text-cyan-600" />
                <StatCard label="Pesticides" value={pesticides.length} icon={FlaskConical} color="bg-teal-100 text-teal-600" />
                <StatCard label="Total Expense" value={formatCurrency(totalExpense)} icon={Receipt} color="bg-blue-100 text-blue-600" />
            </div>

            {/* All Registered Users */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#4A1D96]" />
                        All Registered Users ({allUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground border-b">
                                <tr>
                                    <th className="px-5 py-3 font-medium">User</th>
                                    <th className="px-5 py-3 font-medium">Username</th>
                                    <th className="px-5 py-3 font-medium">Email</th>
                                    <th className="px-5 py-3 font-medium">Phone</th>
                                    <th className="px-5 py-3 font-medium">Role</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="border-b hover:bg-muted/30 transition-colors animate-in fade-in duration-300"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-[#4A1D96]/10 flex items-center justify-center text-[#4A1D96] font-semibold text-sm">
                                                    {u.full_name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{u.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground">@{u.username}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{u.phone}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${roleBadgeClass[u.role] || ""}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusBadgeClass[u.status] || ""}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground">
                                            {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Innovative Admin Insights */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-t-4 border-t-purple-600 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            Platform Growth & SaaS Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm font-medium text-muted-foreground">Estimated Monthly SaaS Revenue</span>
                                <span className="text-base font-bold text-purple-700">{formatCurrency(activeUsers * 499)}<span className="text-xs text-muted-foreground">/mo</span></span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm font-medium text-muted-foreground">Total Farm Area Managed</span>
                                <span className="text-base font-bold text-[#2D6A4F]">{plots.reduce((sum, p) => sum + (p.areaAcres || 0), 0)} Acres</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-medium text-muted-foreground">Farmer Retention & Engagement</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${allUsers.length > 0 ? (activeUsers / allUsers.length) * 100 : 0}%` }} />
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">
                                        {allUsers.length > 0 ? Math.round((activeUsers / allUsers.length) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-orange-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="h-5 w-5 text-orange-600" />
                            Live System Audit Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            {[...sprayRecords, ...cuttingRecords, ...expenses]
                                .sort((a,b) => {
                                    const dateA = 'sprayDate' in a ? a.sprayDate : 'cuttingDate' in a ? a.cuttingDate : a.expenseDate;
                                    const dateB = 'sprayDate' in b ? b.sprayDate : 'cuttingDate' in b ? b.cuttingDate : b.expenseDate;
                                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                                })
                                .slice(0, 4)
                                .map((item: any, i) => {
                                    const type = 'sprayDate' in item ? 'Spray Log' : 'cuttingDate' in item ? 'Cutting Log' : 'Expense Log';
                                    const date = 'sprayDate' in item ? item.sprayDate : 'cuttingDate' in item ? item.cuttingDate : item.expenseDate;
                                    const u = allUsers.find(u => u.id === item.userId);
                                    
                                    return (
                                        <div key={i} className="flex justify-between items-start text-sm border-l-2 border-orange-400 pl-3 py-1 bg-orange-50/30 rounded-r-md">
                                            <div>
                                                <p className="font-semibold text-gray-900">{type} <span className="font-normal text-muted-foreground ml-1">logged by <span className="font-medium text-[#4A1D96]">{u?.full_name || 'System'}</span></span></p>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{date}</p>
                                            </div>
                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-sm font-semibold uppercase shadow-sm">Sync</span>
                                        </div>
                                    )
                                })
                            }
                            {sprayRecords.length === 0 && cuttingRecords.length === 0 && expenses.length === 0 && (
                                <p className="text-sm italic text-muted-foreground text-center py-4">No recent activity detected.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
