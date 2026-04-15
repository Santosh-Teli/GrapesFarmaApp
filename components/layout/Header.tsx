"use client";

import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useStore } from "@/hooks/use-store";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { farm, isInitialized, isAdmin, isImpersonating } = useStore();
    const { user, isAuthenticated } = useAuthStore();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 min-w-0">
                {!isInitialized ? (
                    <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
                ) : (
                    <>
                        <h1 className="text-lg font-semibold md:text-xl truncate text-primary font-playfair">
                            {isAdmin && !isImpersonating ? "System Overview" : (farm?.name || "Grapes Farm Manager")}
                        </h1>
                        {farm?.location && (!isAdmin || isImpersonating) && (
                            <p className="text-xs text-secondary-dark font-medium hidden sm:block">
                                📍 {farm.location}
                            </p>
                        )}
                        {isAdmin && !isImpersonating && (
                            <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                                Administrative Portal
                            </p>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center gap-3">
                {isAuthenticated && user?.role === "ADMIN" && (
                    <Link href="/admin">
                        <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50 text-xs">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admin
                        </Button>
                    </Link>
                )}
                <ModeToggle />
                {isAuthenticated && user && (
                    <div className="h-8 w-8 rounded-full bg-[#4A1D96] flex items-center justify-center text-white font-bold text-sm cursor-default"
                        title={user.full_name}>
                        {user.full_name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </header>
    );
}
