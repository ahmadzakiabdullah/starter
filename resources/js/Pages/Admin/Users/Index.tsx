import { AvatarInitials } from '@/Components/ui/avatar-initials';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    Clock,
    Edit2,
    FileSpreadsheet,
    MailCheck,
    MailX,
    Plus,
    Search,
    Shield,
    ShieldCheck,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    const { auth, flash } = usePage().props;
    const currentUser = auth.user!;

    const [search, setSearch] = useState(
        typeof filters?.search === 'string' ? filters.search : '',
    );
    const [selectedRole, setSelectedRole] = useState(
        typeof filters?.role === 'string' ? filters.role : 'all',
    );
    const [selectedStatus, setSelectedStatus] = useState(
        typeof filters?.status === 'string' ? filters.status : 'all',
    );
    const [selectedSort, setSelectedSort] = useState(
        typeof filters?.sort === 'string' ? filters.sort : 'newest',
    );

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

    const applyFilters = (
        searchVal: string,
        roleVal: string,
        statusVal: string,
        sortVal: string,
    ) => {
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
            },
        );
    };

    const handleDelete = (username: string, id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('users.destroy', username), {
                onSuccess: () => {
                    setSelectedIds(selectedIds.filter((val) => val !== id));
                },
            });
        }
    };

    const handleToggleVerification = (username: string) => {
        router.patch(
            route('users.toggle-verification', username),
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedFlash = page.props.flash as {
                        success?: string;
                    };
                    if (updatedFlash.success) {
                        toast.success(updatedFlash.success);
                    }
                },
            },
        );
    };

    const handleBulkExport = () => {
        const selectedUsers = users.data.filter((u) =>
            selectedIds.includes(u.id),
        );
        if (selectedUsers.length === 0) return;

        const headers = [
            'ID',
            'Name',
            'Username',
            'Email',
            'Roles',
            'Verified',
        ];
        const rows = selectedUsers.map((u) => [
            u.id,
            `"${u.name.replace(/"/g, '""')}"`,
            u.username,
            u.email,
            u.roles.map((r) => r.name).join(', '),
            u.email_verified_at ? 'Yes' : 'No',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((r) => r.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `users_export_${new Date().toISOString().slice(0, 10)}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(
            `Exported ${selectedUsers.length} users to CSV successfully.`,
        );
    };

    const handleBulkDelete = () => {
        if (
            confirm(
                `Are you sure you want to delete the ${selectedIds.length} selected users?`,
            )
        ) {
            router.post(
                route('users.bulk-destroy'),
                { ids: selectedIds },
                {
                    onSuccess: (page) => {
                        const resFlash = page.props.flash as {
                            success?: string;
                            error?: string;
                        };
                        if (resFlash.success) {
                            toast.success(resFlash.success);
                            setSelectedIds([]);
                        } else if (resFlash.error) {
                            toast.error(resFlash.error);
                        }
                    },
                    onError: () => {
                        toast.error('An error occurred during bulk deletion.');
                    },
                },
            );
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

    const assignableCount = users.data.filter(
        (u) => u.id !== currentUser.id,
    ).length;

    return (
        <AuthenticatedLayout>
            <Head title="User Management" />

            <div className="space-y-6 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Users className="text-primary h-6 w-6" />
                            User Management
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Manage user profiles, accounts, custom avatars, and
                            system access roles.
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
                    <Card className="bg-card/45 border-muted/50 border shadow-xs backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Total Profiles
                            </span>
                            <Users className="text-primary h-4.5 w-4.5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {stats.total}
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Registered accounts
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/45 border-muted/50 border shadow-xs backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Administrators
                            </span>
                            <Shield className="h-4.5 w-4.5 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {stats.admins}
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Admins & Superadmins
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/45 border-muted/50 border shadow-xs backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Verified Accounts
                            </span>
                            <ShieldCheck className="h-4.5 w-4.5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {stats.verified}
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Email verified
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/45 border-muted/50 border shadow-xs backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Unverified Accounts
                            </span>
                            <Clock className="h-4.5 w-4.5 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {stats.unverified}
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Pending verifications
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Panel */}
                <div className="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
                    <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
                        <form
                            onSubmit={handleSearch}
                            className="relative flex-1"
                        >
                            <Input
                                placeholder="Search name, username, or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pr-8 pl-9"
                            />
                            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilters(
                                            '',
                                            selectedRole,
                                            selectedStatus,
                                            selectedSort,
                                        );
                                    }}
                                    className="hover:bg-muted absolute top-2.5 right-2.5 rounded-full p-0.5"
                                >
                                    <X className="text-muted-foreground h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                            {/* Role Filter */}
                            <div className="space-y-1 sm:space-y-0">
                                <Select
                                    value={selectedRole}
                                    onValueChange={handleRoleChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Roles
                                        </SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.name}
                                            >
                                                {role.name
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    role.name.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-1 sm:space-y-0">
                                <Select
                                    value={selectedStatus}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Verification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="verified">
                                            Verified
                                        </SelectItem>
                                        <SelectItem value="unverified">
                                            Pending
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Selector */}
                            <div className="col-span-2 space-y-1 sm:col-span-1 sm:space-y-0">
                                <Select
                                    value={selectedSort}
                                    onValueChange={handleSortChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                                            <SelectValue placeholder="Sort order" />
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">
                                            Newest first
                                        </SelectItem>
                                        <SelectItem value="oldest">
                                            Oldest first
                                        </SelectItem>
                                        <SelectItem value="name_asc">
                                            Name A-Z
                                        </SelectItem>
                                        <SelectItem value="name_desc">
                                            Name Z-A
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(search ||
                                selectedRole !== 'all' ||
                                selectedStatus !== 'all' ||
                                selectedSort !== 'newest') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="mt-2 w-full text-xs sm:mt-0 sm:w-auto"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">
                                    <input
                                        type="checkbox"
                                        checked={
                                            assignableCount > 0 &&
                                            selectedIds.length ===
                                                assignableCount
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds(
                                                    users.data
                                                        .filter(
                                                            (u) =>
                                                                u.id !==
                                                                currentUser.id,
                                                        )
                                                        .map((u) => u.id),
                                                );
                                            } else {
                                                setSelectedIds([]);
                                            }
                                        }}
                                        className="border-input text-primary focus:ring-primary h-4 w-4 rounded"
                                    />
                                </TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead className="w-[120px] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-muted-foreground h-48 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Users className="h-8 w-8 opacity-20" />
                                            <span>No users found.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="hover:bg-muted/30"
                                    >
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(
                                                    user.id,
                                                )}
                                                disabled={
                                                    user.id === currentUser.id
                                                }
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds([
                                                            ...selectedIds,
                                                            user.id,
                                                        ]);
                                                    } else {
                                                        setSelectedIds(
                                                            selectedIds.filter(
                                                                (id) =>
                                                                    id !==
                                                                    user.id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                                className="border-input text-primary focus:ring-primary h-4 w-4 rounded disabled:cursor-not-allowed disabled:opacity-30"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <AvatarInitials
                                                name={user.name}
                                                avatarUrl={user.avatar}
                                                size="md"
                                            />
                                        </TableCell>
                                        <TableCell className="text-foreground font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-xs">
                                            @{user.username}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleVerification(
                                                        user.username,
                                                    )
                                                }
                                                disabled={
                                                    user.id === currentUser.id
                                                }
                                                title={
                                                    user.id === currentUser.id
                                                        ? 'Cannot toggle own state'
                                                        : 'Click to toggle verification status'
                                                }
                                                className="transition-transform focus:outline-none active:scale-95 disabled:pointer-events-none"
                                            >
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                                        <MailCheck className="h-3 w-3 shrink-0" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
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
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${getRoleBadgeClass(
                                                            role.name,
                                                        )}`}
                                                    >
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    asChild
                                                    className="hover:bg-primary/5 hover:text-primary h-8 w-8"
                                                >
                                                    <Link
                                                        href={route(
                                                            'users.edit',
                                                            user.username,
                                                        )}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(
                                                            user.username,
                                                            user.id,
                                                        )
                                                    }
                                                    disabled={
                                                        user.id ===
                                                        currentUser.id
                                                    }
                                                    className="text-destructive hover:bg-destructive/5 hover:text-destructive h-8 w-8 disabled:cursor-not-allowed disabled:opacity-30"
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
                    <div className="bg-card/80 border-muted-foreground/20 animate-in slide-in-from-bottom fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between gap-6 rounded-full border px-6 py-3 shadow-2xl backdrop-blur-xl duration-200">
                        <span className="text-foreground text-sm font-semibold">
                            {selectedIds.length} profiles selected
                        </span>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleBulkExport}
                                className="flex h-9 items-center gap-1.5 rounded-full"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                className="flex h-9 items-center gap-1.5 rounded-full"
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
                        <div className="text-muted-foreground text-sm">
                            Showing page {users.current_page} of{' '}
                            {users.last_page} ({users.total} total users)
                        </div>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, idx) => {
                                const label = link.label
                                    .replace('&laquo; Previous', 'Prev')
                                    .replace('Next &raquo;', 'Next');

                                return (
                                    <Button
                                        key={idx}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
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
