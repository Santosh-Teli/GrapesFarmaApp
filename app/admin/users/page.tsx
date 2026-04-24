"use client";

import { useEffect, useState } from "react";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Users, UserCheck, UserX, Shield, 
    MoreVertical, Search, RefreshCcw, Eye
} from "lucide-react";
import { getAllProfiles } from "@/lib/supabase/auth";
import type { ProfileRow } from "@/lib/supabase/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
    const router = useRouter();
    const { setViewingUser } = useAuthStore();
    const [users, setUsers] = useState<ProfileRow[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        const data = await getAllProfiles();
        setUsers(data);
        setIsLoading(false);
    };

    const toggleStatus = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        const supabase = getSupabaseClient() as any;
        
        const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
        
        if (error) {
            toast.error("Failed to update status");
            return;
        }
        
        toast.success(`User status updated to ${newStatus}`);
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    };

    const handleViewUser = (userId: string, fullName: string) => {
        setViewingUser(userId);
        toast.info(`Now viewing data for: ${fullName}`);
        router.push("/");
    };

    const filteredUsers = users.filter(u => 
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === "ACTIVE").length,
        admin: users.filter(u => u.role === "ADMIN").length,
        farmers: users.filter(u => u.role === "FARMER").length
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-playfair tracking-tight text-primary">User Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Oversee all registered farmers and platform access settings.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users..." 
                            className="pl-9 bg-surface border-primary/10 focus-visible:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={loadUsers} className="border-primary/20 text-primary hover:bg-primary/5">
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-success/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-success">Active Now</CardTitle>
                        <UserCheck className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-warning/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-warning">Farmers</CardTitle>
                        <UserCheck className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-warning">{stats.farmers}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-admin-secondary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-admin-secondary">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-admin-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-admin-secondary">{stats.admin}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden border-none shadow-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[250px]">Full Name</TableHead>
                            <TableHead>Username / Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No users found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {user.full_name.charAt(0)}
                                            </div>
                                            {user.full_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">@{user.username}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="font-medium">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.role === "FARMER" && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="border-primary/20 text-primary hover:bg-primary/5 gap-1"
                                                    onClick={() => handleViewUser(user.id, user.full_name)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Data
                                                </Button>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={user.status === "ACTIVE" ? "text-error hover:bg-error/10" : "text-success hover:bg-success/10"}
                                                onClick={() => toggleStatus(user.id)}
                                                disabled={user.username === "AdminKing"} // Prevent self-suspension
                                            >
                                                {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
