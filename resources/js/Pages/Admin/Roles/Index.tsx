import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { toast } from 'sonner';
import { Edit2, Shield, Trash2, X, Check, Info, Users, Plus, Grid, FileKey } from 'lucide-react';
import InputError from '@/Components/InputError';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    users_count: number;
}

interface IndexProps {
    roles: Role[];
    permissions: Permission[];
}

export default function Index({ roles, permissions }: IndexProps) {
    const { flash } = usePage().props as any;
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Form for Role operations (Create / Edit)
    const roleForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    // Form for Permission operations (Create)
    const permForm = useForm({
        name: '',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Categorization helper
    const categorizePermission = (permName: string) => {
        if (permName.includes('user')) return 'User Management';
        if (permName.includes('role') || permName.includes('permission')) return 'Role & Access Management';
        if (permName.includes('audit')) return 'Audit & History';
        if (permName.includes('setting')) return 'System Settings';
        return 'Custom Scopes';
    };

    const categories = Array.from(
        new Set(permissions.map((p) => categorizePermission(p.name)))
    );

    const handleEditClick = (role: Role) => {
        setEditingRole(role);
        roleForm.clearErrors();
        roleForm.setData({
            name: role.name,
            permissions: role.permissions.map((p) => p.name),
        });
    };

    const handleCancelEdit = () => {
        setEditingRole(null);
        roleForm.reset();
        roleForm.clearErrors();
    };

    const handlePermissionToggle = (permName: string) => {
        if (editingRole?.name === 'superadmin') {
            toast.info('Superadmin role automatically has all permissions bypassed.');
            return;
        }

        const current = [...roleForm.data.permissions];
        const index = current.indexOf(permName);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permName);
        }
        roleForm.setData('permissions', current);
    };

    const handleDeleteRole = (id: number) => {
        const role = roles.find(r => r.id === id);
        if (role?.name === 'superadmin' || role?.name === 'user') {
            toast.error(`System role '${role.name}' cannot be deleted.`);
            return;
        }

        if (confirm(`Are you sure you want to delete the role '${role?.name}'?`)) {
            router.delete(route('roles.destroy', id), {
                onSuccess: () => handleCancelEdit(),
            });
        }
    };

    const handleRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            roleForm.put(route('roles.update', editingRole.id), {
                onSuccess: () => {
                    handleCancelEdit();
                },
            });
        } else {
            roleForm.post(route('roles.store'), {
                onSuccess: () => {
                    roleForm.reset();
                },
            });
        }
    };

    const handlePermSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        permForm.post(route('permissions.store'), {
            onSuccess: () => {
                permForm.reset();
            },
        });
    };

    const handleDeletePermission = (id: number) => {
        const perm = permissions.find(p => p.id === id);
        if (!perm) return;

        const systemPermissions = ['manage-users', 'manage-roles'];
        if (systemPermissions.includes(perm.name)) {
            toast.error(`Core permission '${perm.name}' cannot be deleted.`);
            return;
        }

        if (confirm(`Are you sure you want to delete the permission '${perm.name}'? This will revoke it from all roles.`)) {
            router.delete(route('permissions.destroy', perm.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Role & Permission Management" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Shield className="h-6 w-6 text-primary" />
                        Role & Permission Management
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure security levels, authorization scopes, and customize permissions.
                    </p>
                </div>

                <Tabs defaultValue="roles" className="w-full">
                    <TabsList className="bg-muted/80 grid w-full grid-cols-2 md:flex md:w-auto items-center justify-start gap-1 p-1 h-auto mb-6">
                        <TabsTrigger value="roles" className="flex items-center gap-2 py-2.5 px-4">
                            <Grid className="h-4 w-4" />
                            Roles & Matrix
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex items-center gap-2 py-2.5 px-4">
                            <FileKey className="h-4 w-4" />
                            Custom Permissions
                        </TabsTrigger>
                    </TabsList>

                    {/* ROLES TAB */}
                    <TabsContent value="roles" className="outline-none space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left: Role List */}
                            <Card className="lg:col-span-2 shadow-sm">
                                <CardHeader>
                                    <CardTitle>System Roles</CardTitle>
                                    <CardDescription>Available roles, assigned scopes, and active member directory counts.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Role Name</TableHead>
                                                <TableHead>Members</TableHead>
                                                <TableHead>Permissions</TableHead>
                                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {roles.map((role) => (
                                                <TableRow
                                                    key={role.id}
                                                    className={`hover:bg-muted/30 transition-colors ${
                                                        editingRole?.id === role.id ? 'bg-primary/5' : ''
                                                    }`}
                                                >
                                                    <TableCell className="font-semibold capitalize text-foreground whitespace-nowrap">
                                                        {role.name}
                                                        {role.name === 'superadmin' && (
                                                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800">
                                                                System
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={route('users.index', { role: role.name })}
                                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                                            title={`View all users with ${role.name} role`}
                                                        >
                                                            <Users className="h-3.5 w-3.5" />
                                                            {role.users_count} {role.users_count === 1 ? 'user' : 'users'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {role.name === 'superadmin' ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                                                    All permissions bypassed
                                                                </span>
                                                            ) : role.permissions.length === 0 ? (
                                                                <span className="text-xs text-muted-foreground italic">No permissions assigned</span>
                                                            ) : (
                                                                role.permissions.map((p) => (
                                                                    <span
                                                                        key={p.id}
                                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/5 text-primary border border-primary/10"
                                                                    >
                                                                        {p.name}
                                                                    </span>
                                                                ))
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2 pr-4">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleEditClick(role)}
                                                                className="h-8 w-8 hover:bg-primary/5 hover:text-primary"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            {role.name !== 'superadmin' && role.name !== 'user' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteRole(role.id)}
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/5 hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Right: Add/Edit Form Card */}
                            <Card className="shadow-sm h-fit">
                                <CardHeader>
                                    <CardTitle>{editingRole ? 'Edit Role Details' : 'Create Custom Role'}</CardTitle>
                                    <CardDescription>
                                        {editingRole ? 'Change name or toggle access permissions.' : 'Add a new access tier and assign standard rules.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleRoleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="role_name">Role Name</Label>
                                            <Input
                                                id="role_name"
                                                placeholder="e.g. support"
                                                value={roleForm.data.name}
                                                onChange={(e) => roleForm.setData('name', e.target.value.toLowerCase())}
                                                disabled={editingRole?.name === 'superadmin'}
                                                required
                                            />
                                            <InputError message={roleForm.errors.name} />
                                        </div>

                                        <div className="space-y-4">
                                            <Label>Allowed Scopes</Label>
                                            {editingRole?.name === 'superadmin' ? (
                                                <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-3 dark:border-violet-950 dark:bg-violet-950/20">
                                                    <div className="flex gap-2">
                                                        <Info className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                                                        <p className="text-xs text-violet-700 dark:text-violet-400">
                                                            The <strong>superadmin</strong> bypasses all permission checks automatically and has total dashboard access.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                                    {categories.map((category) => (
                                                        <div key={category} className="space-y-2">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                                                                {category}
                                                            </h4>
                                                            <div className="grid gap-2">
                                                                {permissions
                                                                    .filter((p) => categorizePermission(p.name) === category)
                                                                    .map((perm) => {
                                                                        const isChecked = roleForm.data.permissions.includes(perm.name);
                                                                        return (
                                                                            <div
                                                                                key={perm.id}
                                                                                onClick={() => handlePermissionToggle(perm.name)}
                                                                                className={`flex items-center justify-between p-2 rounded-md border cursor-pointer select-none transition-all duration-150 ${
                                                                                    isChecked
                                                                                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                                                                                        : 'border-muted hover:bg-muted/30'
                                                                                }`}
                                                                            >
                                                                                <span className="text-xs font-medium text-foreground">
                                                                                    {perm.name}
                                                                                </span>
                                                                                <div
                                                                                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                                                                                        isChecked
                                                                                            ? 'bg-primary border-primary text-white'
                                                                                            : 'border-input'
                                                                                    }`}
                                                                                >
                                                                                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <InputError message={roleForm.errors.permissions} />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t">
                                            {editingRole && (
                                                <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button type="submit" disabled={roleForm.processing} className="shadow-sm">
                                                {roleForm.processing ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Interactive Authorization Matrix View */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Authorization Scope Matrix</CardTitle>
                                <CardDescription>A comprehensive grid mapping system permissions directly against assignable roles.</CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <Table className="min-w-[600px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Permission / Scope</TableHead>
                                            {roles.map(r => (
                                                <TableHead key={r.id} className="text-center font-semibold capitalize">
                                                    {r.name}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permissions.map(p => (
                                            <TableRow key={p.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono text-xs font-medium text-foreground">
                                                    {p.name}
                                                </TableCell>
                                                {roles.map(r => {
                                                    const hasPerm = r.name === 'superadmin' || r.permissions.some(rp => rp.id === p.id);
                                                    return (
                                                        <TableCell key={r.id} className="text-center">
                                                            <div className="flex justify-center">
                                                                {hasPerm ? (
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-600">
                                                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted border border-muted-foreground/10 text-muted-foreground/45">
                                                                        <X className="h-3 w-3" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CUSTOM PERMISSIONS TAB */}
                    <TabsContent value="permissions" className="outline-none space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Left: Permission Lists */}
                            <Card className="md:col-span-2 shadow-sm">
                                <CardHeader>
                                    <CardTitle>System Permissions</CardTitle>
                                    <CardDescription>All validated permission scopes loaded on the system guards.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Scope Name</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="w-[100px] text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {permissions.map((perm) => {
                                                const isSystem = ['manage-users', 'manage-roles'].includes(perm.name);
                                                return (
                                                    <TableRow key={perm.id} className="hover:bg-muted/30">
                                                        <TableCell className="font-mono text-xs font-medium text-foreground">
                                                            {perm.name}
                                                            {isSystem && (
                                                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 uppercase tracking-wider">
                                                                    Core
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground font-medium">
                                                            {categorizePermission(perm.name)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end pr-4">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => handleDeletePermission(perm.id)}
                                                                    disabled={isSystem}
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/5 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    title={isSystem ? "Cannot delete core permission" : "Delete custom permission"}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Right: Permission Form Card */}
                            <Card className="shadow-sm h-fit">
                                <CardHeader>
                                    <CardTitle>Create Custom Scope</CardTitle>
                                    <CardDescription>Register a new system authorization string to secure features.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePermSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="perm_name">Permission Name</Label>
                                            <Input
                                                id="perm_name"
                                                placeholder="e.g. view-reports"
                                                value={permForm.data.name}
                                                onChange={(e) => permForm.setData('name', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                                required
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Use lowercase letters, numbers, hyphens, and underscores only.
                                            </p>
                                            <InputError message={permForm.errors.name} />
                                        </div>

                                        <div className="flex justify-end pt-2 border-t">
                                            <Button type="submit" disabled={permForm.processing} className="shadow-sm">
                                                {permForm.processing ? 'Creating...' : 'Create Permission'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
