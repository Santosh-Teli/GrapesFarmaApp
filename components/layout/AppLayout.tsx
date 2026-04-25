"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuthStore } from "@/store/authStore";
import { BottomNav } from "./BottomNav";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const FARMER_ONLY_ROUTES = [
    "/plots", "/pesticides", "/labour", "/spray-records", 
    "/cutting-records", "/labour-work", "/expenses", "/payments",
    "/farm-setup"
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isAuthenticated, isLoading, initialize, user, updateActivity } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

    useEffect(() => {
        initialize();
    }, []);

    // Session activity tracking
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleActivity = () => {
            updateActivity();
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Also update immediately on mount/auth state change
        handleActivity();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [isAuthenticated, updateActivity]);

    useEffect(() => {
        if (isLoading) return;

        // Public route handling
        if (!isAuthenticated && !isPublicRoute) {
            router.push("/login");
            return;
        }
        if (isAuthenticated && isPublicRoute) {
            router.push("/");
            return;
        }

        // Admin-specific route protection
        if (isAuthenticated && user?.role === "ADMIN") {
            const { viewingUserId } = useAuthStore.getState();
            const isFarmerRoute = FARMER_ONLY_ROUTES.some(r => pathname.startsWith(r));
            
            // If Admin tries to visit Farmer page without impersonating
            if (isFarmerRoute && !viewingUserId) {
                router.push("/");
            }
        }
    }, [isAuthenticated, isLoading, isPublicRoute, pathname]);

    // Auth pages: render without sidebar/header
    if (isPublicRoute) {
        return (
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                {children}
            </ThemeProvider>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FAFAF5]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-[#4A1D96]/10 flex items-center justify-center animate-pulse">
                        <span className="text-3xl">🍇</span>
                    </div>
                    <p className="text-sm text-[#6B7280] font-medium">Loading farm data...</p>
                </div>
            </div>
        );
    }

    // Protected layout
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen bg-background text-foreground">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full">
                    <ImpersonationBanner />
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                        <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <BottomNav />
        </ThemeProvider>
    );
}
