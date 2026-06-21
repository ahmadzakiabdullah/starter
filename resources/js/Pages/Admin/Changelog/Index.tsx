import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
    Activity, 
    Calendar, 
    GitBranch, 
    Plus, 
    Trash2, 
    Edit, 
    Check, 
    AlertCircle, 
    Tag, 
    PlusCircle, 
    MinusCircle, 
    Info 
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/Components/ui/accordion';

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
        changes: [{ type: 'Added', content: '' }] as ChangeItem[]
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
            changes: [{ type: 'Added', content: '' }]
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
            changes: log.changes && log.changes.length > 0 ? [...log.changes] : [{ type: 'Added', content: '' }]
        });
        setModalOpen(true);
    };

    const handleAddChangeItem = () => {
        form.setData('changes', [...form.data.changes, { type: 'Added', content: '' }]);
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
        const hasEmptyChanges = form.data.changes.some(item => !item.content.trim());
        if (hasEmptyChanges) {
            toast.error('All change details must be filled out.');
            return;
        }

        if (editingLog) {
            form.put(route('changelogs.update', editingLog.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    form.reset();
                }
            });
        } else {
            form.post(route('changelogs.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    form.reset();
                }
            });
        }
    };

    const handleDelete = (log: Changelog) => {
        if (confirm(`Are you sure you want to delete release version ${log.version}?`)) {
            form.delete(route('changelogs.destroy', log.id), {
                onSuccess: () => {
                    toast.success('Changelog version deleted successfully.');
                }
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
    const publishedLogs = changelogs.filter(l => l.is_published);
    const currentVersion = publishedLogs.length > 0 ? publishedLogs[0].version : 'v1.0.0';
    const lastReleaseDate = publishedLogs.length > 0 ? new Date(publishedLogs[0].release_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A';

    return (
        <AuthenticatedLayout>
            <Head title="System Versioning & Changelog" />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <GitBranch className="h-6 w-6 text-primary" />
                            System Versioning & Changelog
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Chronological history of features, bug fixes, and development cycles of this application.
                        </p>
                    </div>
                    {canManage && (
                        <Button 
                            type="button" 
                            size="sm"
                            onClick={openCreateModal}
                            className="shrink-0 flex items-center gap-1.5"
                        >
                            <Plus className="h-4 w-4" />
                            Create Release
                        </Button>
                    )}
                </div>

                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Current Version</span>
                        <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-primary mt-1">{currentVersion}</span>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Releases</span>
                        <span className="text-xl sm:text-2xl font-bold tracking-tight mt-1">{changelogs.length}</span>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Last Updated</span>
                        <span className="text-xs sm:text-sm font-semibold mt-1 text-muted-foreground truncate">{lastReleaseDate}</span>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="relative border-l-2 border-primary/20 ml-3 pl-6 sm:pl-8 py-2 space-y-6">
                    {changelogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card text-muted-foreground text-center">
                            <Info className="h-8 w-8 mb-2 text-primary opacity-60 animate-pulse" />
                            <p className="text-sm font-medium">No system releases recorded yet.</p>
                            {canManage && (
                                <Button size="sm" variant="outline" className="mt-3" onClick={openCreateModal}>
                                    Add your first release
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Accordion
                            type="multiple"
                            defaultValue={changelogs.length > 0 ? [changelogs[0].id.toString()] : []}
                            className="w-full space-y-6"
                        >
                            {changelogs.map((log) => (
                                <div key={log.id} className="relative group">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[38px] sm:-left-[46px] top-[18px] flex h-6 w-6 items-center justify-center rounded-full border bg-background text-primary shadow-xs transition-colors duration-200 group-hover:border-primary group-hover:bg-primary/5 z-10">
                                        <Tag className="h-3 w-3" />
                                    </div>

                                    {/* Accordion Card */}
                                    <AccordionItem
                                        value={log.id.toString()}
                                        className="border rounded-xl bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/20 overflow-hidden"
                                    >
                                        <AccordionTrigger className="w-full hover:no-underline px-4 sm:px-5 py-4 flex items-center justify-between text-left">
                                            <div className="flex items-start justify-between gap-4 flex-1 pr-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground">
                                                            {log.version}
                                                        </span>
                                                        <h3 className="text-sm sm:text-base font-semibold text-foreground/90 leading-tight">
                                                            {log.title}
                                                        </h3>
                                                        {!log.is_published && (
                                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                                                                Draft
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>
                                                            {new Date(log.release_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons (Edit/Delete) */}
                                            {canManage && (
                                                <div 
                                                    className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                                                    onClick={(e) => e.stopPropagation()} // Prevent toggling the accordion when clicking action buttons
                                                >
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => openEditModal(log)} 
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                        title="Edit version"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(log)} 
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                                        title="Delete version"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </AccordionTrigger>

                                        <AccordionContent className="p-4 sm:p-5 border-t bg-muted/5 space-y-4">
                                            {log.description && (
                                                <p className="text-xs leading-relaxed text-muted-foreground bg-muted/20 border border-muted/30 rounded-lg p-3">
                                                    {log.description}
                                                </p>
                                            )}

                                            {/* Categorized list of changes */}
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b pb-1">
                                                    Release Notes
                                                </h4>
                                                <ul className="space-y-2.5 mt-2">
                                                    {log.changes && log.changes.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed">
                                                            <Badge 
                                                                variant="outline" 
                                                                className={`text-[9px] px-1.5 py-0 rounded uppercase tracking-wider shrink-0 font-bold border ${getTypeStyles(item.type)}`}
                                                            >
                                                                {item.type}
                                                            </Badge>
                                                            <span className="text-foreground/80 pt-0.5">{item.content}</span>
                                                        </li>
                                                    ))}
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
                <Dialog open={modalOpen} onOpenChange={() => setModalOpen(false)}>
                    <DialogContent className="max-w-xl sm:rounded-xl overflow-y-auto max-h-[85vh]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <GitBranch className="h-5 w-5 text-primary" />
                                    {editingLog ? `Edit Release ${editingLog.version}` : 'Create New System Release'}
                                </DialogTitle>
                                <DialogDescription>
                                    Define the version number, release title, and write development changes catalog.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 my-4 text-xs">
                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <Label htmlFor="version">Version Tag</Label>
                                        <Input
                                            id="version"
                                            placeholder="e.g. v1.6.0"
                                            value={form.data.version}
                                            onChange={e => form.setData('version', e.target.value)}
                                            required
                                        />
                                        {form.errors.version && (
                                            <p className="text-red-500 text-[10px] mt-0.5">{form.errors.version}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="release_date">Release Date</Label>
                                        <Input
                                            id="release_date"
                                            type="date"
                                            value={form.data.release_date}
                                            onChange={e => form.setData('release_date', e.target.value)}
                                            required
                                        />
                                        {form.errors.release_date && (
                                            <p className="text-red-500 text-[10px] mt-0.5">{form.errors.release_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="title">Release Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. User Dashboard Refactoring"
                                        value={form.data.title}
                                        onChange={e => form.setData('title', e.target.value)}
                                        required
                                    />
                                    {form.errors.title && (
                                        <p className="text-red-500 text-[10px] mt-0.5">{form.errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="description">Short Overview Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Summarize the theme of this version update..."
                                        value={form.data.description}
                                        onChange={e => form.setData('description', e.target.value)}
                                        rows={3}
                                    />
                                    {form.errors.description && (
                                        <p className="text-red-500 text-[10px] mt-0.5">{form.errors.description}</p>
                                    )}
                                </div>

                                {/* Changes list sub-form */}
                                <div className="space-y-2 border-t pt-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-semibold text-sm">Release Change Details</Label>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={handleAddChangeItem}
                                            className="h-7 text-[10px] px-2"
                                        >
                                            <PlusCircle className="h-3.5 w-3.5 mr-1" />
                                            Add Detail
                                        </Button>
                                    </div>
                                    {form.errors.changes && (
                                        <p className="text-red-500 text-[10px]">{form.errors.changes}</p>
                                    )}

                                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                        {form.data.changes.map((item, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <div className="w-[110px] shrink-0">
                                                    <Select 
                                                        value={item.type} 
                                                        onValueChange={val => handleChangeItemType(index, val)}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Added">Added</SelectItem>
                                                            <SelectItem value="Improved">Improved</SelectItem>
                                                            <SelectItem value="Changed">Changed</SelectItem>
                                                            <SelectItem value="Fixed">Fixed</SelectItem>
                                                            <SelectItem value="Removed">Removed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Input
                                                    placeholder="Describe the modification..."
                                                    value={item.content}
                                                    onChange={e => handleChangeItemContent(index, e.target.value)}
                                                    className="h-8 text-xs flex-1"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveChangeItem(index)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                    title="Remove detail"
                                                >
                                                    <MinusCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 border-t pt-3">
                                    <input 
                                        type="checkbox"
                                        id="is_published"
                                        checked={form.data.is_published}
                                        onChange={e => form.setData('is_published', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="is_published" className="font-normal cursor-pointer select-none">
                                        Publish this version immediately (visible to all users)
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
                                    {form.processing ? 'Saving...' : 'Save Release'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AuthenticatedLayout>
    );
}
