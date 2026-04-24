"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/hooks/use-store";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner"; // We need to install sonner or use simple alert for now. 
// I'll stick to simple alert or console for now, or install sonner. User asked for toasts.
// I'll assume I can install sonner later. For now, I'll mock toast.

export function FarmDetails() {
    const { farm, setFarm } = useStore();
    const { user, isAuthenticated } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    const effectiveName = (isAuthenticated && user) ? user.full_name : (farm?.name || "");
    const effectiveOwner = (isAuthenticated && user) ? user.full_name : (farm?.ownerName || "");
    const effectivePhone = (isAuthenticated && user) ? user.phone : (farm?.phone || "");

    const [formData, setFormData] = useState({
        name: farm?.name || effectiveName,
        ownerName: farm?.ownerName || effectiveOwner,
        totalAcres: farm?.totalAcres || 0,
        location: farm?.location || "",
        phone: farm?.phone || effectivePhone
    });

    useEffect(() => {
        if (farm && !isEditing) {
            setFormData({
                name: farm.name || effectiveName,
                ownerName: farm.ownerName || effectiveOwner,
                totalAcres: farm.totalAcres || 0,
                location: farm.location || "",
                phone: farm.phone || effectivePhone
            });
        }
    }, [farm, isEditing, effectiveName, effectiveOwner, effectivePhone]);

    const handleSave = () => {
        const updatedFarm = { 
            ...farm, 
            ...formData, 
            name: effectiveName,
            ownerName: effectiveOwner,
            phone: isEditing && formData.phone ? formData.phone : effectivePhone,
            id: farm?.id || "farm_1", 
            createdAt: farm?.createdAt || new Date().toISOString(),
            ownerId: farm?.ownerId || user?.id || "" 
        };
        setFarm(updatedFarm);
        setIsEditing(false);
        toast.success("Farm details updated!");
    };

    const handleCancel = () => {
        if (farm) setFormData(farm);
        setIsEditing(false);
    };

    if (!farm) return <div>Loading...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Farm Details</CardTitle>
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Farm Name</label>
                        {isEditing ? (
                            <Input 
                                value={effectiveName} 
                                disabled 
                                className="bg-muted cursor-not-allowed border-none focus-visible:ring-0"
                                title="Farm name is linked to your registration and cannot be changed here."
                            />
                        ) : (
                            <p className="font-semibold text-lg">{effectiveName}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Farmer Name (Owner)</label>
                        {isEditing ? (
                            <Input 
                                value={effectiveOwner} 
                                disabled 
                                className="bg-muted cursor-not-allowed border-none focus-visible:ring-0"
                                title="Owner name is linked to your registration and cannot be changed here."
                            />
                        ) : (
                            <p className="font-semibold text-lg">{effectiveOwner}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Total Acres</label>
                        {isEditing ? (
                            <Input type="number" value={formData.totalAcres} onChange={e => setFormData({ ...formData, totalAcres: Number(e.target.value) })} />
                        ) : (
                            <p className="font-semibold text-lg">{farm.totalAcres} Acres</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        {isEditing ? (
                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" />
                        ) : (
                            <p className="font-semibold text-lg">{farm.phone || effectivePhone}</p>
                        )}
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        {isEditing ? (
                            <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Enter farm location (e.g., Nashik, Maharashtra)" />
                        ) : (
                            <p className={`font-semibold text-lg ${!farm.location ? "text-muted-foreground italic" : ""}`}>
                                {farm.location || "Not specified"}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
