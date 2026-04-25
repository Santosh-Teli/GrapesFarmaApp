"use client";

import { Menu, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useStore } from "@/hooks/use-store";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore, Language } from "@/store/languageStore";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
    onMenuClick: () => void;
}

const languageOptions: { code: Language; label: string; nativeLabel: string }[] = [
    { code: "en", label: "English", nativeLabel: "EN" },
    { code: "kn", label: "Kannada", nativeLabel: "ಕ" },
    { code: "hi", label: "Hindi", nativeLabel: "हि" },
];

export function Header({ onMenuClick }: HeaderProps) {
    const { farm, isInitialized, isAdmin, isImpersonating } = useStore();
    const { user, isAuthenticated } = useAuthStore();
    const { language, setLanguage } = useLanguageStore();
    const t = useTranslation();
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentLang = languageOptions.find(l => l.code === language);

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
                                {t.adminPortal}
                            </p>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Language Selector */}
                <div className="relative" ref={langRef}>
                    <button
                        onClick={() => setLangMenuOpen(!langMenuOpen)}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
                        title="Change Language"
                    >
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-bold">{currentLang?.nativeLabel}</span>
                    </button>

                    {langMenuOpen && (
                        <div className="absolute right-0 mt-2 w-36 bg-background border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                            {languageOptions.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                                        language === lang.code ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                                    }`}
                                >
                                    <span className="text-base w-5 text-center font-bold">{lang.nativeLabel}</span>
                                    <span>{lang.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isAuthenticated && user?.role === "ADMIN" && (
                    <Link href="/admin">
                        <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 text-xs">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admin
                        </Button>
                    </Link>
                )}

                <ModeToggle />

                {isAuthenticated && user && (
                    <div
                        className="h-8 w-8 rounded-full bg-[#4A1D96] flex items-center justify-center text-white font-bold text-sm cursor-default"
                        title={user.full_name}
                    >
                        {user.full_name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </header>
    );
}
