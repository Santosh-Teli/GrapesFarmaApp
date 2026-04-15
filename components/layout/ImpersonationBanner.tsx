"use client";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle } from "lucide-react";
import { getAllProfiles } from "@/lib/supabase/auth";
import type { ProfileRow } from "@/lib/supabase/types";
import { useEffect, useState } from "react";

export function ImpersonationBanner() {
    const { viewingUserId, clearViewingUser, user } = useAuthStore();
    const [viewingUser, setViewingUser] = useState<ProfileRow | null>(null);

    useEffect(() => {
        if (!viewingUserId) {
            setViewingUser(null);
            return;
        }
        getAllProfiles().then(profiles => {
            const user = profiles.find(u => u.id === viewingUserId);
            if (user) setViewingUser(user);
        });
    }, [viewingUserId]);

    // Only show for admins who are viewing another user
    if (user?.role !== "ADMIN" || !viewingUserId) return null;

    return (
        <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>
                    Viewing as: <strong className="font-bold">{viewingUser?.full_name || "Farmer"}</strong> (Read/Write Mode)
                </span>
                <span className="hidden md:inline text-amber-100 text-xs ml-2">
                    All data shown belongs to this farmer.
                </span>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearViewingUser}
                className="h-8 text-white hover:bg-white/10 border border-white/20 hover:text-white gap-1"
            >
                <XCircle className="h-4 w-4" />
                Exit View
            </Button>
        </div>
    );
}
