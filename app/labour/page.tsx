"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/hooks/use-store";
import { Labour, SkillType, Gender } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Plus, Search, User, Phone, Briefcase, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const generateId = () => crypto.randomUUID();

export default function LabourMasterPage() {
    const { labourers, setLabourers, labourWork } = useStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [skillFilter, setSkillFilter] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Labour>>({
        name: "", gender: "Male", phone: "", perDaySalary: 400, skillType: "General", isActive: true, joiningDate: new Date().toISOString().split('T')[0]
    });

    const filteredLabourers = labourers.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : l.isActive;
        const matchesSkill = !skillFilter || l.skillType === skillFilter;
        return matchesSearch && matchesStatus && matchesSkill;
    });

    // Helper to calculate stats for a labourer
    const getLabourStats = (labourId: string) => {
        const works = labourWork.filter(w => w.labourId === labourId);

        // Total Days logic
        const fullDays = works.filter(w => w.dayType === "Full_Day").length;
        const halfDays = works.filter(w => w.dayType === "Half_Day").length;
        const totalEffectiveDays = fullDays + (halfDays * 0.5);

        // Financials
        const totalEarned = works.reduce((sum, w) => sum + w.amount, 0);
        const totalPaid = works.filter(w => w.paymentStatus === "Paid").reduce((sum, w) => sum + w.amount, 0);
        const pendingAmount = totalEarned - totalPaid;

        return { totalEffectiveDays, totalEarned, totalPaid, pendingAmount };
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ name: "", gender: "Male", phone: "", perDaySalary: 400, skillType: "General", isActive: true, joiningDate: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingId) {
            setLabourers(labourers.map(l => l.id === editingId ? { ...l, ...formData } as Labour : l));
        } else {
            const newLabour: Labour = {
                id: generateId(),
                ...formData
            } as Labour;
            setLabourers([...labourers, newLabour]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Labour Master</h1>
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Labour
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="flex h-10 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={skillFilter}
                    onChange={e => setSkillFilter(e.target.value)}
                >
                    <option value="">All Skills</option>
                    <option value="General">General</option>
                    <option value="Spraying">Spraying</option>
                    <option value="Cutting">Cutting</option>
                    <option value="Multi-skill">Multi-skill</option>
                </select>
                <Button variant="outline" onClick={() => setShowInactive(!showInactive)}>
                    {showInactive ? "Hide Inactive" : "Show Inactive"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLabourers.map(labour => {
                    const stats = getLabourStats(labour.id);
                    return (
                        <Card key={labour.id} className={cn("hover:shadow-md transition-shadow", !labour.isActive && "opacity-60")}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-lg">{labour.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                            <span className={cn("px-1.5 py-0.5 rounded text-white text-[10px]", labour.gender === "Male" ? "bg-blue-500" : "bg-pink-500")}>{labour.gender}</span>
                                            <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 text-[10px]">{labour.skillType}</span>
                                        </CardDescription>
                                    </div>
                                    <Link href={`/labour/${labour.id}`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        {labour.phone || "N/A"}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-muted p-2 rounded">
                                            <span className="block text-muted-foreground">Worked</span>
                                            <span className="font-semibold text-lg">{stats.totalEffectiveDays} days</span>
                                        </div>
                                        <div className="bg-muted p-2 rounded">
                                            <span className="block text-muted-foreground">Earned</span>
                                            <span className="font-semibold text-lg">{formatCurrency(stats.totalEarned)}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-green-50 p-2 rounded text-green-700">
                                            <span className="block opacity-70">Paid</span>
                                            <span className="font-semibold">{formatCurrency(stats.totalPaid)}</span>
                                        </div>
                                        <div className={cn("bg-red-50 p-2 rounded text-red-700", stats.pendingAmount > 0 ? "font-bold" : "")}>
                                            <span className="block opacity-70">Pending</span>
                                            <span className="font-semibold">{formatCurrency(stats.pendingAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Labour" : "Add New Labour"}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Gender</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Daily Salary (₹)</label>
                            <Input type="number" value={formData.perDaySalary} onChange={e => setFormData({ ...formData, perDaySalary: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Skill</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.skillType}
                                onChange={e => setFormData({ ...formData, skillType: e.target.value as SkillType })}
                            >
                                <option value="General">General</option>
                                <option value="Spraying">Spraying</option>
                                <option value="Cutting">Cutting</option>
                                <option value="Multi-skill">Multi-skill</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Joining Date</label>
                        <Input type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Labour</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
