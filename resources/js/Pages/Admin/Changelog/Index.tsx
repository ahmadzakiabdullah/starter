import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/ui/accordion';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    Edit,
    GitBranch,
    Info,
    MinusCircle,
    Plus,
    PlusCircle,
    Tag,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ChangeItem {
    type: 'Added' | 'Improved' | 'Changed' | 'Fixed' | 'Removed';
    content: string;
}

interface Changelog {
    id: number;
    version: string;
    title: string;
    description: string | null;
    changes: ChangeItem[];
    release_date: string;
    is_published: boolean;
    created_at: string;
}

interface ChangelogPageProps {
    changelogs: Changelog[];
    canManage: boolean;
}

export default function Index({ changelogs, canManage }: ChangelogPageProps) {
    const { flash } = usePage().props as any;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<Changelog | null>(null);

    const form = useForm({
        version: '',
        title: '',
        description: '',
        release_date: new Date().toISOString().split('T')[0],
        is_published: true,
        changes: [{ type: 'Added', content: '' }] as ChangeItem[],
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const openCreateModal = () => {
        setEditingLog(null);
        form.reset();
        form.setData({
            version: '',
            title: '',
            description: '',
            release_date: new Date().toISOString().split('T')[0],
            is_published: true,
            changes: [{ type: 'Added', content: '' }],
        });
        setModalOpen(true);
    };

    const openEditModal = (log: Changelog) => {
        setEditingLog(log);
        form.setData({
            version: log.version,
            title: log.title,
            description: log.description || '',
            release_date: log.release_date,
            is_published: log.is_published,
            changes:
                log.changes && log.changes.length > 0
                    ? [...log.changes]
                    : [{ type: 'Added', content: '' }],
        });
        setModalOpen(true);
    };

    const handleAddChangeItem = () => {
        form.setData('changes', [
            ...form.data.changes,
            { type: 'Added', content: '' },
        ]);
    };

    const handleRemoveChangeItem = (index: number) => {
        if (form.data.changes.length === 1) {
            toast.error('A release must record at least one change item.');
            return;
        }
        const updated = [...form.data.changes];
        updated.splice(index, 1);
        form.setData('changes', updated);
    };

    const handleChangeItemType = (index: number, type: any) => {
        const updated = [...form.data.changes];
        updated[index].type = type;
        form.setData('changes', updated);
    };

    const handleChangeItemContent = (index: number, content: string) => {
        const updated = [...form.data.changes];
        updated[index].content = content;
        form.setData('changes', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic frontend checking
        const hasEmptyChanges = form.data.changes.some(
            (item) => !item.content.trim(),
        );
        if (hasEmptyChanges) {
            toast.error('All change details must be filled out.');
            return;
        }

        if (editingLog) {
            form.put(route('changelogs.update', editingLog.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('changelogs.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (log: Changelog) => {
        if (
            confirm(
                `Are you sure you want to delete release version ${log.version}?`,
            )
        ) {
            form.delete(route('changelogs.destroy', log.id), {
                onSuccess: () => {
                    toast.success('Changelog version deleted successfully.');
                },
            });
        }
    };

    // Helper to render type tags
    const getTypeStyles = (type: ChangeItem['type']) => {
        switch (type) {
            case 'Added':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Improved':
            case 'Changed':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Fixed':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'Removed':
                return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };

    // Calculate metadata
    const publishedLogs = changelogs.filter((l) => l.is_published);
    const currentVersion =
        publishedLogs.length > 0 ? publishedLogs[0].version : 'v1.0.0';
    const lastReleaseDate =
        publishedLogs.length > 0
            ? new Date(publishedLogs[0].release_date).toLocaleDateString(
                  undefined,
                  { dateStyle: 'medium' },
              )
            : 'N/A';

    return (
        <AuthenticatedLayout>
            <Head title="System Versioning & Changelog" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <GitBranch className="text-primary h-6 w-6" />
                            System Versioning & Changelog
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Chronological history of features, bug fixes, and
                            development cycles of this application.
                        </p>
                    </div>
                    {canManage && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={openCreateModal}
                            className="flex shrink-0 items-center gap-1.5"
                        >
                            <Plus className="h-4 w-4" />
                            Create Release
                        </Button>
                    )}
                </div>

                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card flex flex-col justify-between rounded-xl border p-4 shadow-xs">
                        <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                            Current Version
                        </span>
                        <span className="text-primary mt-1 font-mono text-xl font-bold tracking-tight sm:text-2xl">
                            {currentVersion}
                        </span>
                    </div>
                    <div className="bg-card flex flex-col justify-between rounded-xl border p-4 shadow-xs">
                        <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                            Total Releases
                        </span>
                        <span className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                            {changelogs.length}
                        </span>
                    </div>
                    <div className="bg-card flex flex-col justify-between rounded-xl border p-4 shadow-xs">
                        <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                            Last Updated
                        </span>
                        <span className="text-muted-foreground mt-1 truncate text-xs font-semibold sm:text-sm">
                            {lastReleaseDate}
                        </span>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="border-primary/20 relative ml-3 space-y-6 border-l-2 py-2 pl-6 sm:pl-8">
                    {changelogs.length === 0 ? (
                        <div className="bg-card text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                            <Info className="text-primary mb-2 h-8 w-8 animate-pulse opacity-60" />
                            <p className="text-sm font-medium">
                                No system releases recorded yet.
                            </p>
                            {canManage && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-3"
                                    onClick={openCreateModal}
                                >
                                    Add your first release
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Accordion
                            type="multiple"
                            defaultValue={
                                changelogs.length > 0
                                    ? [changelogs[0].id.toString()]
                                    : []
                            }
                            className="w-full space-y-6"
                        >
                            {changelogs.map((log) => (
                                <div key={log.id} className="group relative">
                                    {/* Timeline Dot */}
                                    <div className="bg-background text-primary group-hover:border-primary group-hover:bg-primary/5 absolute top-[18px] -left-[38px] z-10 flex h-6 w-6 items-center justify-center rounded-full border shadow-xs transition-colors duration-200 sm:-left-[46px]">
                                        <Tag className="h-3 w-3" />
                                    </div>

                                    {/* Accordion Card */}
                                    <AccordionItem
                                        value={log.id.toString()}
                                        className="bg-card hover:border-primary/20 overflow-hidden rounded-xl border shadow-xs transition-all duration-300 hover:shadow-md"
                                    >
                                        <AccordionTrigger className="flex w-full items-center justify-between px-4 py-4 text-left hover:no-underline sm:px-5">
                                            <div className="flex flex-1 items-start justify-between gap-4 pr-4">
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-foreground font-mono text-base font-bold tracking-tight sm:text-lg">
                                                            {log.version}
                                                        </span>
                                                        <h3 className="text-foreground/90 text-sm leading-tight font-semibold sm:text-base">
                                                            {log.title}
                                                        </h3>
                                                        {!log.is_published && (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-500"
                                                            >
                                                                Draft
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>
                                                            {new Date(
                                                                log.release_date,
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    dateStyle:
                                                                        'long',
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons (Edit/Delete) */}
                                            {canManage && (
                                                <div
                                                    className="mr-2 flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100 sm:opacity-0"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    } // Prevent toggling the accordion when clicking action buttons
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            openEditModal(log)
                                                        }
                                                        className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 w-8"
                                                        title="Edit version"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(log)
                                                        }
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-8 w-8"
                                                        title="Delete version"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </AccordionTrigger>

                                        <AccordionContent className="bg-muted/5 space-y-4 border-t p-4 sm:p-5">
                                            {log.description && (
                                                <p className="text-muted-foreground bg-muted/20 border-muted/30 rounded-lg border p-3 text-xs leading-relaxed">
                                                    {log.description}
                                                </p>
                                            )}

                                            {/* Categorized list of changes */}
                                            <div className="space-y-2">
                                                <h4 className="text-muted-foreground block border-b pb-1 text-[10px] font-bold tracking-widest uppercase">
                                                    Release Notes
                                                </h4>
                                                <ul className="mt-2 space-y-2.5">
                                                    {log.changes &&
                                                        log.changes.map(
                                                            (item, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className="flex items-start gap-2.5 text-xs leading-relaxed"
                                                                >
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`shrink-0 rounded border px-1.5 py-0 text-[9px] font-bold tracking-wider uppercase ${getTypeStyles(item.type)}`}
                                                                    >
                                                                        {
                                                                            item.type
                                                                        }
                                                                    </Badge>
                                                                    <span className="text-foreground/80 pt-0.5">
                                                                        {
                                                                            item.content
                                                                        }
                                                                    </span>
                                                                </li>
                                                            ),
                                                        )}
                                                </ul>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </div>
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>

            {/* CREATE / EDIT DIALOG FORM */}
            {modalOpen && (
                <Dialog
                    open={modalOpen}
                    onOpenChange={() => setModalOpen(false)}
                >
                    <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto sm:rounded-xl">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <GitBranch className="text-primary h-5 w-5" />
                                    {editingLog
                                        ? `Edit Release ${editingLog.version}`
                                        : 'Create New System Release'}
                                </DialogTitle>
                                <DialogDescription>
                                    Define the version number, release title,
                                    and write development changes catalog.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="my-4 space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <Label htmlFor="version">
                                            Version Tag
                                        </Label>
                                        <Input
                                            id="version"
                                            placeholder="e.g. v1.6.0"
                                            value={form.data.version}
                                            onChange={(e) =>
                                                form.setData(
                                                    'version',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {form.errors.version && (
                                            <p className="mt-0.5 text-[10px] text-red-500">
                                                {form.errors.version}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="release_date">
                                            Release Date
                                        </Label>
                                        <Input
                                            id="release_date"
                                            type="date"
                                            value={form.data.release_date}
                                            onChange={(e) =>
                                                form.setData(
                                                    'release_date',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {form.errors.release_date && (
                                            <p className="mt-0.5 text-[10px] text-red-500">
                                                {form.errors.release_date}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="title">Release Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. User Dashboard Refactoring"
                                        value={form.data.title}
                                        onChange={(e) =>
                                            form.setData(
                                                'title',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {form.errors.title && (
                                        <p className="mt-0.5 text-[10px] text-red-500">
                                            {form.errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="description">
                                        Short Overview Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Summarize the theme of this version update..."
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                    {form.errors.description && (
                                        <p className="mt-0.5 text-[10px] text-red-500">
                                            {form.errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Changes list sub-form */}
                                <div className="space-y-2 border-t pt-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold">
                                            Release Change Details
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddChangeItem}
                                            className="h-7 px-2 text-[10px]"
                                        >
                                            <PlusCircle className="mr-1 h-3.5 w-3.5" />
                                            Add Detail
                                        </Button>
                                    </div>
                                    {form.errors.changes && (
                                        <p className="text-[10px] text-red-500">
                                            {form.errors.changes}
                                        </p>
                                    )}

                                    <div className="max-h-[220px] space-y-2.5 overflow-y-auto pr-1">
                                        {form.data.changes.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="w-[110px] shrink-0">
                                                        <Select
                                                            value={item.type}
                                                            onValueChange={(
                                                                val,
                                                            ) =>
                                                                handleChangeItemType(
                                                                    index,
                                                                    val,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Added">
                                                                    Added
                                                                </SelectItem>
                                                                <SelectItem value="Improved">
                                                                    Improved
                                                                </SelectItem>
                                                                <SelectItem value="Changed">
                                                                    Changed
                                                                </SelectItem>
                                                                <SelectItem value="Fixed">
                                                                    Fixed
                                                                </SelectItem>
                                                                <SelectItem value="Removed">
                                                                    Removed
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Input
                                                        placeholder="Describe the modification..."
                                                        value={item.content}
                                                        onChange={(e) =>
                                                            handleChangeItemContent(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 flex-1 text-xs"
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleRemoveChangeItem(
                                                                index,
                                                            )
                                                        }
                                                        className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                                                        title="Remove detail"
                                                    >
                                                        <MinusCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 border-t pt-3">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        checked={form.data.is_published}
                                        onChange={(e) =>
                                            form.setData(
                                                'is_published',
                                                e.target.checked,
                                            )
                                        }
                                        className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label
                                        htmlFor="is_published"
                                        className="cursor-pointer font-normal select-none"
                                    >
                                        Publish this version immediately
                                        (visible to all users)
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    {form.processing
                                        ? 'Saving...'
                                        : 'Save Release'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AuthenticatedLayout>
    );
}
