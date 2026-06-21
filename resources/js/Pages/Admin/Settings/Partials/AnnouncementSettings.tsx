import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    Megaphone, 
    Plus, 
    Trash2, 
    Edit2, 
    Check, 
    X, 
    AlertTriangle,
    Eye,
    Calendar,
    ChevronDown,
    Clock
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

interface Announcement {
    id: number;
    title: string;
    content: string;
    style: 'info' | 'warning' | 'danger' | 'success';
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
}

interface AnnouncementSettingsProps {
    announcements: Announcement[];
}

export default function AnnouncementSettings({ announcements = [] }: AnnouncementSettingsProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [style, setStyle] = useState<'info' | 'warning' | 'danger' | 'success'>('info');
    const [isActive, setIsActive] = useState(true);
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        setTitle('');
        setContent('');
        setStyle('info');
        setIsActive(true);
        setStartsAt('');
        setEndsAt('');
        setModalOpen(true);
    };

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setTitle(announcement.title);
        setContent(announcement.content);
        setStyle(announcement.style);
        setIsActive(announcement.is_active);
        setStartsAt(announcement.starts_at ? announcement.starts_at.slice(0, 16) : '');
        setEndsAt(announcement.ends_at ? announcement.ends_at.slice(0, 16) : '');
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const data = {
            title,
            content,
            style,
            is_active: isActive,
            starts_at: startsAt || null,
            ends_at: endsAt || null
        };

        if (editingAnnouncement) {
            router.patch(route('announcements.update', editingAnnouncement.id), data, {
                onSuccess: () => {
                    toast.success('Announcement broadcast updated.');
                    setModalOpen(false);
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError || 'Failed to update announcement.');
                }
            });
        } else {
            router.post(route('announcements.store'), data, {
                onSuccess: () => {
                    toast.success('Announcement broadcast created and activated.');
                    setModalOpen(false);
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError || 'Failed to create announcement.');
                }
            });
        }
    };

    const handleToggle = (announcement: Announcement) => {
        router.patch(route('announcements.toggle', announcement.id), {}, {
            onSuccess: () => {
                toast.success(`Announcement ${announcement.is_active ? 'deactivated' : 'activated'}.`);
            },
            preserveScroll: true
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this announcement broadcast? This action is irreversible.')) {
            router.delete(route('announcements.destroy', id), {
                onSuccess: () => {
                    toast.success('Announcement broadcast deleted.');
                },
                preserveScroll: true
            });
        }
    };

    const getStyleBadge = (announcementStyle: string) => {
        switch (announcementStyle) {
            case 'warning':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/25';
            case 'danger':
                return 'bg-red-500/10 text-red-600 border-red-500/25';
            case 'success':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25';
            case 'info':
            default:
                return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/25';
        }
    };

    return (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-card">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            Global Announcement Broadcast Banners
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-1">
                            Configure alert banners shown at the top of the welcome and authenticated dashboards.
                        </CardDescription>
                    </div>
                    <Button 
                        type="button" 
                        size="sm" 
                        onClick={openCreateModal}
                        className="text-xs shrink-0 shadow-xs"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Create Broadcast
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {announcements.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50/20 dark:bg-slate-900/10 text-muted-foreground space-y-1">
                        <Megaphone className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
                        <p className="text-sm font-semibold">No announcements configured</p>
                        <p className="text-xs max-w-xs mx-auto text-slate-400">Create a broadcast to display notices to your system users.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div 
                                key={announcement.id} 
                                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-200"
                            >
                                <div className="space-y-2 flex-1 min-w-0 pr-4">
                                    <div className="flex items-center flex-wrap gap-2.5">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {announcement.title}
                                        </h4>
                                        <span className={`inline-flex items-center text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStyleBadge(announcement.style)}`}>
                                            {announcement.style}
                                        </span>
                                        {!announcement.is_active && (
                                            <span className="inline-flex items-center text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full font-semibold">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed break-words">
                                        {announcement.content}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-mono">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            Schedule: {announcement.starts_at ? new Date(announcement.starts_at).toLocaleDateString() : 'Immediate'} - {announcement.ends_at ? new Date(announcement.ends_at).toLocaleDateString() : 'Forever'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`active-toggle-${announcement.id}`} className="text-xs text-muted-foreground cursor-pointer">
                                            {announcement.is_active ? 'Active' : 'Inactive'}
                                        </Label>
                                        <Switch 
                                            id={`active-toggle-${announcement.id}`} 
                                            checked={announcement.is_active} 
                                            onCheckedChange={() => handleToggle(announcement)} 
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(announcement)}
                                            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(announcement.id)}
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* CREATE/EDIT ANNOUNCEMENT MODAL */}
            {modalOpen && (
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="sm:rounded-xl max-w-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle className="text-base font-bold flex items-center gap-2">
                                    <Megaphone className="h-5 w-5 text-primary" />
                                    {editingAnnouncement ? 'Edit Announcement Broadcast' : 'Create New Announcement Broadcast'}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Set the content, duration limits, and visual level of the alert banner.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 my-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="announcement_title" className="text-xs font-bold">Broadcast Prefix / Title</Label>
                                    <Input 
                                        id="announcement_title" 
                                        placeholder="e.g. System Maintenance, Holiday Notice" 
                                        value={title} 
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="announcement_content" className="text-xs font-bold">Broadcast Message Content</Label>
                                    <Textarea 
                                        id="announcement_content" 
                                        placeholder="e.g. We will be performing database updates tonight between 2:00 AM and 4:00 AM UTC." 
                                        value={content} 
                                        onChange={e => setContent(e.target.value)}
                                        required
                                        className="text-xs min-h-[80px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="announcement_style" className="text-xs font-bold">Visual Severity Style</Label>
                                        <Select value={style} onValueChange={(val: any) => setStyle(val)}>
                                            <SelectTrigger id="announcement_style" className="h-9 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info" className="text-xs">Info (Indigo Theme)</SelectItem>
                                                <SelectItem value="warning" className="text-xs">Warning (Amber Theme)</SelectItem>
                                                <SelectItem value="danger" className="text-xs">Danger (Red Theme)</SelectItem>
                                                <SelectItem value="success" className="text-xs">Success (Emerald Theme)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col justify-end pb-1.5">
                                        <div className="flex items-center gap-2">
                                            <Switch 
                                                id="announcement_active" 
                                                checked={isActive} 
                                                onCheckedChange={setIsActive} 
                                            />
                                            <Label htmlFor="announcement_active" className="text-xs font-bold cursor-pointer">
                                                Broadcast Immediately
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="starts_at" className="text-xs font-bold flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            Starts At (Optional)
                                        </Label>
                                        <Input 
                                            id="starts_at" 
                                            type="datetime-local" 
                                            value={startsAt} 
                                            onChange={e => setStartsAt(e.target.value)}
                                            className="h-9 text-xs font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ends_at" className="text-xs font-bold flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            Ends At (Optional)
                                        </Label>
                                        <Input 
                                            id="ends_at" 
                                            type="datetime-local" 
                                            value={endsAt} 
                                            onChange={e => setEndsAt(e.target.value)}
                                            className="h-9 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="mt-6 gap-2">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => setModalOpen(false)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="text-xs shadow-xs"
                                >
                                    {editingAnnouncement ? 'Save Changes' : 'Create Banner'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    );
}
