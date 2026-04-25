"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Tractor, FlaskConical, Droplets, Scissors,
    Users, CalendarCheck, Receipt, Wallet, FileText, X, LogOut,
    ShieldCheck, Grape, TrendingUp, CalendarClock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { supabaseLogout } from "@/lib/supabase/auth";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated, viewingUserId, clearViewingUser } = useAuthStore();
    const isImpersonating = !!viewingUserId;
    const t = useTranslation();

    const menuItems = [
        { href: "/", label: t.dashboard, icon: LayoutDashboard },
        { href: "/farm-setup", label: t.farmSetup, icon: Tractor },
        { href: "/pesticides", label: t.pesticideMaster, icon: FlaskConical },
        { href: "/spray", label: t.sprayManagement, icon: Droplets },
        { href: "/spray/schedule", label: "Spray Schedule", icon: CalendarClock },
        { href: "/cutting", label: t.cuttingManagement, icon: Scissors },
        { href: "/labour", label: t.labourMaster, icon: Users },
        { href: "/daily-work", label: t.dailyLabourWork, icon: CalendarCheck },
        { href: "/expenses", label: t.expenseManagement, icon: Receipt },
        { href: "/payments", label: t.paymentManagement, icon: Wallet },
        { href: "/reports", label: t.reports, icon: FileText },
        { href: "/revenue", label: t.revenueSummary, icon: TrendingUp },
    ];

    const adminItems = [
        { href: "/admin", label: t.dashboardOverview, icon: ShieldCheck },
        { href: "/admin/users", label: t.userManagement, icon: Users },
    ];

    const handleLogout = async () => {
        await supabaseLogout();
        logout();
        toast.success(t.logout);
        router.push("/login");
    };

    const isAdmin = user?.role === "ADMIN";

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 border-r bg-card transition-transform duration-300 flex flex-col lg:translate-x-0 lg:static",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-5 border-b bg-[#4A1D96]">
                    <div className="flex items-center gap-2 text-white">
                        <Grape className="h-6 w-6" />
                        <span className="text-base font-bold tracking-tight">AgriTrack</span>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden text-white hover:text-white hover:bg-white/10" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
                    <p className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {t.farmerMenu}
                    </p>
                    <ul className="space-y-0.5 px-3">
                        {menuItems
                            .filter(item => {
                                if (item.href === "/") return true;
                                if (isAdmin) return isImpersonating;
                                return true;
                            })
                            .map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-150",
                                                isActive
                                                    ? "bg-[#4A1D96] text-white shadow-md shadow-purple-900/20"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                    </ul>

                    {/* Admin-only section */}
                    {isAdmin && (
                        <>
                            <p className="px-5 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {t.adminMenu}
                            </p>
                            <ul className="space-y-0.5 px-3">
                                {adminItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={onClose}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-150",
                                                    isActive
                                                        ? "bg-[#4A1D96] text-white shadow-md shadow-purple-900/20"
                                                        : "text-[#4A1D96] bg-purple-50 hover:bg-purple-100"
                                                )}
                                            >
                                                <Icon className="h-5 w-5 shrink-0" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </nav>

                {/* User Footer */}
                <div className="border-t p-4 space-y-3 bg-muted/30">
                    {isAuthenticated && user ? (
                        <>
                            <div className="flex items-center gap-3 px-1">
                                <div className="h-9 w-9 rounded-full bg-[#4A1D96] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {user.full_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="text-sm min-w-0">
                                    <p className="font-semibold truncate">{user.full_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user.role === "ADMIN" ? "🛡 Administrator" : "🌱 Farmer"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                            >
                                <LogOut className="h-4 w-4" />
                                {t.logout}
                            </button>
                        </>
                    ) : (
                        <Link href="/login" onClick={onClose}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#4A1D96] hover:bg-purple-50 transition-colors font-medium">
                            Sign in
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}
