import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AvatarInitials } from '@/Components/ui/avatar-initials';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { 
    Edit2, 
    Plus, 
    Search, 
    Trash2, 
    Users, 
    X, 
    Shield, 
    ShieldCheck, 
    Clock, 
    ArrowUpDown, 
    FileSpreadsheet,
    MailCheck,
    MailX
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
    roles: Role[];
    email_verified_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UsersProps {
    users: {
        data: User[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    roles: Role[];
    stats: {
        total: number;
        admins: number;
        verified: number;
        unverified: number;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
        sort?: string;
    };
}

export default function Index({ users, roles, stats, filters }: UsersProps) {
    const { auth, flash } = usePage().props as any;
    const currentUser = auth.user;

    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [selectedRole, setSelectedRole] = useState(typeof filters?.role === 'string' ? filters.role : 'all');
    const [selectedStatus, setSelectedStatus] = useState(typeof filters?.status === 'string' ? filters.status : 'all');
    const [selectedSort, setSelectedSort] = useState(typeof filters?.sort === 'string' ? filters.sort : 'newest');
    
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(search, selectedRole, selectedStatus, selectedSort);
    };

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        applyFilters(search, role, selectedStatus, selectedSort);
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        applyFilters(search, selectedRole, status, selectedSort);
    };

    const handleSortChange = (sort: string) => {
        setSelectedSort(sort);
        applyFilters(search, selectedRole, selectedStatus, sort);
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedRole('all');
        setSelectedStatus('all');
        setSelectedSort('newest');
        router.get(route('users.index'));
    };

    const applyFilters = (searchVal: string, roleVal: string, statusVal: string, sortVal: string) => {
        router.get(
            route('users.index'),
            {
                search: searchVal || undefined,
                role: roleVal === 'all' ? undefined : roleVal,
                status: statusVal === 'all' ? undefined : statusVal,
                sort: sortVal === 'newest' ? undefined : sortVal,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('users.destroy', id), {
                onSuccess: () => {
                    setSelectedIds(selectedIds.filter(val => val !== id));
                },
            });
        }
    };

    const handleToggleVerification = (id: number) => {
        router.patch(route('users.toggle-verification', id), {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedFlash = page.props.flash as { success?: string };
                if (updatedFlash.success) {
                    toast.success(updatedFlash.success);
                }
            }
        });
    };

    const handleBulkExport = () => {
        const selectedUsers = users.data.filter(u => selectedIds.includes(u.id));
        if (selectedUsers.length === 0) return;

        const headers = ["ID", "Name", "Username", "Email", "Roles", "Verified"];
        const rows = selectedUsers.map(u => [
            u.id,
            `"${u.name.replace(/"/g, '""')}"`,
            u.username,
            u.email,
            u.roles.map(r => r.name).join(', '),
            u.email_verified_at ? 'Yes' : 'No'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `users_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${selectedUsers.length} users to CSV successfully.`);
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected users?`)) {
            router.post(route('users.bulk-destroy'), { ids: selectedIds }, {
                onSuccess: (page) => {
                    const resFlash = page.props.flash as { success?: string, error?: string };
                    if (resFlash.success) {
                        toast.success(resFlash.success);
                        setSelectedIds([]);
                    } else if (resFlash.error) {
                        toast.error(resFlash.error);
                    }
                },
                onError: () => {
                    toast.error('An error occurred during bulk deletion.');
                }
            });
        }
    };

    const getRoleBadgeClass = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'superadmin':
                return 'bg-violet-500/10 text-violet-500 border border-violet-500/20';
            case 'admin':
                return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'manager':
                return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20';
        }
    };

    const assignableCount = users.data.filter(u => u.id !== currentUser.id).length;

    return (
        <AuthenticatedLayout>
            <Head title="User Management" />

            <div className="space-y-6 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Users className="h-6 w-6 text-primary" />
                            User Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage user profiles, accounts, custom avatars, and system access roles.
                        </p>
                    </div>
                    <div>
                        <Button asChild className="shadow-sm">
                            <Link href={route('users.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/45 backdrop-blur shadow-xs border border-muted/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Profiles</span>
                            <Users className="h-4.5 w-4.5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Registered accounts</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/45 backdrop-blur shadow-xs border border-muted/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administrators</span>
                            <Shield className="h-4.5 w-4.5 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{stats.admins}</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Admins & Superadmins</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/45 backdrop-blur shadow-xs border border-muted/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verified Accounts</span>
                            <ShieldCheck className="h-4.5 w-4.5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{stats.verified}</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Email verified</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/45 backdrop-blur shadow-xs border border-muted/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unverified Accounts</span>
                            <Clock className="h-4.5 w-4.5 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{stats.unverified}</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Pending verifications</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Panel */}
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                        <form onSubmit={handleSearch} className="relative flex-1">
                            <Input
                                placeholder="Search name, username, or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-8"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilters('', selectedRole, selectedStatus, selectedSort);
                                    }}
                                    className="absolute right-2.5 top-2.5 rounded-full p-0.5 hover:bg-muted"
                                >
                                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                            )}
                        </form>

                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
                            {/* Role Filter */}
                            <div className="space-y-1 sm:space-y-0">
                                <Select value={selectedRole} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-1 sm:space-y-0">
                                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Verification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="unverified">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Selector */}
                            <div className="space-y-1 sm:space-y-0 col-span-2 sm:col-span-1">
                                <Select value={selectedSort} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                                            <SelectValue placeholder="Sort order" />
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest first</SelectItem>
                                        <SelectItem value="oldest">Oldest first</SelectItem>
                                        <SelectItem value="name_asc">Name A-Z</SelectItem>
                                        <SelectItem value="name_desc">Name Z-A</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(search || selectedRole !== 'all' || selectedStatus !== 'all' || selectedSort !== 'newest') && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs w-full sm:w-auto mt-2 sm:mt-0">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">
                                    <input
                                        type="checkbox"
                                        checked={assignableCount > 0 && selectedIds.length === assignableCount}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds(users.data.filter(u => u.id !== currentUser.id).map(u => u.id));
                                            } else {
                                                setSelectedIds([]);
                                            }
                                        }}
                                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                                    />
                                </TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead className="w-[120px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Users className="h-8 w-8 opacity-20" />
                                            <span>No users found.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/30">
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(user.id)}
                                                disabled={user.id === currentUser.id}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds([...selectedIds, user.id]);
                                                    } else {
                                                        setSelectedIds(selectedIds.filter(id => id !== user.id));
                                                    }
                                                }}
                                                className="rounded border-input text-primary focus:ring-primary h-4 w-4 disabled:opacity-30 disabled:cursor-not-allowed"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <AvatarInitials
                                                name={user.name}
                                                avatarUrl={user.avatar}
                                                size="md"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-xs">@{user.username}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVerification(user.id)}
                                                disabled={user.id === currentUser.id}
                                                title={user.id === currentUser.id ? "Cannot toggle own state" : "Click to toggle verification status"}
                                                className="focus:outline-none transition-transform active:scale-95 disabled:pointer-events-none"
                                            >
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                                                        <MailCheck className="h-3 w-3 shrink-0" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                                        <MailX className="h-3 w-3 shrink-0" />
                                                        Pending
                                                    </span>
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.roles.map((role) => (
                                                    <span
                                                        key={role.id}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getRoleBadgeClass(
                                                            role.name
                                                        )}`}
                                                    >
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" asChild className="h-8 w-8 hover:bg-primary/5 hover:text-primary">
                                                    <Link href={route('users.edit', user.id)}>
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={user.id === currentUser.id}
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/5 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Floating Bulk Action Bar */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-6 py-3 rounded-full bg-card/80 backdrop-blur-xl border border-muted-foreground/20 shadow-2xl animate-in slide-in-from-bottom duration-200">
                        <span className="text-sm font-semibold text-foreground">
                            {selectedIds.length} profiles selected
                        </span>
                        <div className="flex items-center gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={handleBulkExport}
                                className="rounded-full flex items-center gap-1.5 h-9"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm" 
                                onClick={handleBulkDelete}
                                className="rounded-full flex items-center gap-1.5 h-9"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing page {users.current_page} of {users.last_page} ({users.total} total users)
                        </div>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, idx) => {
                                const label = link.label
                                    .replace('&laquo; Previous', 'Prev')
                                    .replace('Next &raquo;', 'Next');

                                return (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>{label}</Link>
                                        ) : (
                                            <span>{label}</span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
