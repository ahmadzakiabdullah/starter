import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
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
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import { router } from '@inertiajs/react';
import { Calendar, Clock, Edit2, Megaphone, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

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

export default function AnnouncementSettings({
    announcements = [],
}: AnnouncementSettingsProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] =
        useState<Announcement | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [style, setStyle] = useState<
        'info' | 'warning' | 'danger' | 'success'
    >('info');
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
        setStartsAt(
            announcement.starts_at ? announcement.starts_at.slice(0, 16) : '',
        );
        setEndsAt(
            announcement.ends_at ? announcement.ends_at.slice(0, 16) : '',
        );
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
            ends_at: endsAt || null,
        };

        if (editingAnnouncement) {
            router.patch(
                route('announcements.update', editingAnnouncement.id),
                data,
                {
                    onSuccess: () => {
                        toast.success('Announcement broadcast updated.');
                        setModalOpen(false);
                    },
                    onError: (errors) => {
                        const firstError = Object.values(errors)[0];
                        toast.error(
                            firstError || 'Failed to update announcement.',
                        );
                    },
                },
            );
        } else {
            router.post(route('announcements.store'), data, {
                onSuccess: () => {
                    toast.success(
                        'Announcement broadcast created and activated.',
                    );
                    setModalOpen(false);
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError || 'Failed to create announcement.');
                },
            });
        }
    };

    const handleToggle = (announcement: Announcement) => {
        router.patch(
            route('announcements.toggle', announcement.id),
            {},
            {
                onSuccess: () => {
                    toast.success(
                        `Announcement ${announcement.is_active ? 'deactivated' : 'activated'}.`,
                    );
                },
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (id: number) => {
        if (
            confirm(
                'Are you sure you want to delete this announcement broadcast? This action is irreversible.',
            )
        ) {
            router.delete(route('announcements.destroy', id), {
                onSuccess: () => {
                    toast.success('Announcement broadcast deleted.');
                },
                preserveScroll: true,
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
        <Card className="bg-card overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 pb-5 dark:border-slate-800/60">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <Megaphone className="text-primary h-5 w-5" />
                            Global Announcement Broadcast Banners
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-1 text-xs">
                            Configure alert banners shown at the top of the
                            welcome and authenticated dashboards.
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={openCreateModal}
                        className="shrink-0 text-xs shadow-xs"
                    >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Create Broadcast
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {announcements.length === 0 ? (
                    <div className="text-muted-foreground space-y-1 rounded-xl border border-dashed bg-slate-50/20 py-12 text-center dark:bg-slate-900/10">
                        <Megaphone className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
                        <p className="text-sm font-semibold">
                            No announcements configured
                        </p>
                        <p className="mx-auto max-w-xs text-xs text-slate-400">
                            Create a broadcast to display notices to your system
                            users.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition-all duration-200 hover:bg-slate-50 md:flex-row md:items-center dark:border-slate-800/80 dark:bg-slate-900/20 dark:hover:bg-slate-900/40"
                            >
                                <div className="min-w-0 flex-1 space-y-2 pr-4">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {announcement.title}
                                        </h4>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getStyleBadge(announcement.style)}`}
                                        >
                                            {announcement.style}
                                        </span>
                                        {!announcement.is_active && (
                                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-xs leading-relaxed break-words">
                                        {announcement.content}
                                    </p>
                                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px]">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            Schedule:{' '}
                                            {announcement.starts_at
                                                ? new Date(
                                                      announcement.starts_at,
                                                  ).toLocaleDateString()
                                                : 'Immediate'}{' '}
                                            -{' '}
                                            {announcement.ends_at
                                                ? new Date(
                                                      announcement.ends_at,
                                                  ).toLocaleDateString()
                                                : 'Forever'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex shrink-0 items-center justify-between gap-4 border-t pt-3 md:mt-0 md:justify-end md:border-t-0 md:pt-0">
                                    <div className="flex items-center gap-2">
                                        <Label
                                            htmlFor={`active-toggle-${announcement.id}`}
                                            className="text-muted-foreground cursor-pointer text-xs"
                                        >
                                            {announcement.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Label>
                                        <Switch
                                            id={`active-toggle-${announcement.id}`}
                                            checked={announcement.is_active}
                                            onCheckedChange={() =>
                                                handleToggle(announcement)
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                openEditModal(announcement)
                                            }
                                            className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(announcement.id)
                                            }
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
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
                    <DialogContent className="max-w-lg sm:rounded-xl">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                    <Megaphone className="text-primary h-5 w-5" />
                                    {editingAnnouncement
                                        ? 'Edit Announcement Broadcast'
                                        : 'Create New Announcement Broadcast'}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Set the content, duration limits, and visual
                                    level of the alert banner.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="my-2 space-y-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="announcement_title"
                                        className="text-xs font-bold"
                                    >
                                        Broadcast Prefix / Title
                                    </Label>
                                    <Input
                                        id="announcement_title"
                                        placeholder="e.g. System Maintenance, Holiday Notice"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        required
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="announcement_content"
                                        className="text-xs font-bold"
                                    >
                                        Broadcast Message Content
                                    </Label>
                                    <Textarea
                                        id="announcement_content"
                                        placeholder="e.g. We will be performing database updates tonight between 2:00 AM and 4:00 AM UTC."
                                        value={content}
                                        onChange={(e) =>
                                            setContent(e.target.value)
                                        }
                                        required
                                        className="min-h-[80px] text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="announcement_style"
                                            className="text-xs font-bold"
                                        >
                                            Visual Severity Style
                                        </Label>
                                        <Select
                                            value={style}
                                            onValueChange={(val) =>
                                                setStyle(
                                                    val as Announcement['style'],
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="announcement_style"
                                                className="h-9 text-xs"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value="info"
                                                    className="text-xs"
                                                >
                                                    Info (Indigo Theme)
                                                </SelectItem>
                                                <SelectItem
                                                    value="warning"
                                                    className="text-xs"
                                                >
                                                    Warning (Amber Theme)
                                                </SelectItem>
                                                <SelectItem
                                                    value="danger"
                                                    className="text-xs"
                                                >
                                                    Danger (Red Theme)
                                                </SelectItem>
                                                <SelectItem
                                                    value="success"
                                                    className="text-xs"
                                                >
                                                    Success (Emerald Theme)
                                                </SelectItem>
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
                                            <Label
                                                htmlFor="announcement_active"
                                                className="cursor-pointer text-xs font-bold"
                                            >
                                                Broadcast Immediately
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="starts_at"
                                            className="flex items-center gap-1 text-xs font-bold"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            Starts At (Optional)
                                        </Label>
                                        <Input
                                            id="starts_at"
                                            type="datetime-local"
                                            value={startsAt}
                                            onChange={(e) =>
                                                setStartsAt(e.target.value)
                                            }
                                            className="h-9 font-mono text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="ends_at"
                                            className="flex items-center gap-1 text-xs font-bold"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            Ends At (Optional)
                                        </Label>
                                        <Input
                                            id="ends_at"
                                            type="datetime-local"
                                            value={endsAt}
                                            onChange={(e) =>
                                                setEndsAt(e.target.value)
                                            }
                                            className="h-9 font-mono text-xs"
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
                                    {editingAnnouncement
                                        ? 'Save Changes'
                                        : 'Create Banner'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    );
}
