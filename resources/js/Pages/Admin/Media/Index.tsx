import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import * as Lucide from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface MediaFile {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    path: string;
    size: number;
    folder: string | null;
    url: string;
    formatted_size: string;
    created_at: string;
}

interface IndexProps {
    files: MediaFile[];
    folders: string[];
    filters: {
        search?: string;
        folder?: string;
        type?: string;
    };
}

export default function Index({ files, folders, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeFolder, setActiveFolder] = useState<string | null>(filters.folder || null);
    const [activeType, setActiveType] = useState<string | null>(filters.type || null);

    // Selected file for preview sidebar
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

    // Dialog rename state
    const [renameFile, setRenameFile] = useState<MediaFile | null>(null);
    const [newName, setNewName] = useState('');

    // Upload folder state
    const [uploadFolder, setUploadFolder] = useState('');
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Drag-and-drop state
    const [dragActive, setDragActive] = useState(false);

    // Handle upload form
    const { data, setData, post, processing } = useForm({
        file: null as File | null,
        folder: '',
    });

    const handleSearch = () => {
        router.get(route('media.index'), {
            search,
            folder: activeFolder || undefined,
            type: activeType || undefined,
        }, { preserveState: true });
    };

    const handleFolderFilter = (folder: string | null) => {
        setActiveFolder(folder);
        router.get(route('media.index'), {
            search: search || undefined,
            folder: folder || undefined,
            type: activeType || undefined,
        }, { preserveState: true });
    };

    const handleTypeFilter = (type: string | null) => {
        setActiveType(type);
        router.get(route('media.index'), {
            search: search || undefined,
            folder: activeFolder || undefined,
            type: type || undefined,
        }, { preserveState: true });
    };

    // File Upload handlers
    const executeUpload = (file: File, folderTarget?: string) => {
        const formData = {
            file,
            folder: folderTarget || activeFolder || '',
        };

        router.post(route('media.upload'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Asset uploaded successfully.');
                setData('file', null);
            },
            onError: (errors) => {
                toast.error(errors.file || 'Failed to upload asset.');
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) executeUpload(file);
    };

    // Drag & Drop event handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) executeUpload(file);
    };

    // Copy Link utility
    const copyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard.');
    };

    // Rename handlers
    const triggerRename = (file: MediaFile) => {
        setRenameFile(file);
        setNewName(file.name);
    };

    const submitRename = () => {
        if (!renameFile) return;
        router.patch(route('media.rename', renameFile.id), { name: newName }, {
            onSuccess: () => {
                toast.success('Asset renamed successfully.');
                setRenameFile(null);
                if (selectedFile?.id === renameFile.id) {
                    setSelectedFile({ ...selectedFile, name: newName });
                }
            }
        });
    };

    // Delete handler
    const deleteFile = (file: MediaFile) => {
        if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
            router.delete(route('media.destroy', file.id), {
                onSuccess: () => {
                    toast.success('Asset deleted.');
                    if (selectedFile?.id === file.id) setSelectedFile(null);
                }
            });
        }
    };

    // Bulk delete handler
    const bulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} selected files?`)) {
            router.post(route('media.bulk-destroy'), { ids: selectedIds }, {
                onSuccess: () => {
                    toast.success('Selected assets deleted.');
                    setSelectedIds([]);
                    setSelectedFile(null);
                }
            });
        }
    };

    // Toggle single selection
    const toggleSelectFile = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Media Manager" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Lucide.Images className="h-6 w-6 text-primary" />
                            Media Library
                        </h1>
                        <p className="text-sm text-muted-foreground">Upload and manage visual assets, files, and metadata folders.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={bulkDelete}
                                className="flex items-center gap-1.5"
                            >
                                <Lucide.Trash2 className="h-4 w-4" />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFolderModal(true)}
                            className="flex items-center gap-1.5"
                        >
                            <Lucide.FolderPlus className="h-4 w-4" />
                            New Folder
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column: Folders List */}
                    <div className="space-y-4 lg:col-span-1">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Virtual Folders</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 space-y-1">
                                <button
                                    onClick={() => handleFolderFilter(null)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                                        activeFolder === null
                                            ? 'bg-primary text-primary-foreground font-bold shadow-md'
                                            : 'hover:bg-accent text-foreground'
                                    }`}
                                >
                                    <Lucide.FolderHeart className="h-4 w-4 shrink-0" />
                                    <span>All Assets</span>
                                </button>

                                {folders.map((folderName) => (
                                    <button
                                        key={folderName}
                                        onClick={() => handleFolderFilter(folderName)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between gap-2 transition-all ${
                                            activeFolder === folderName
                                                ? 'bg-primary text-primary-foreground font-bold shadow-md'
                                                : 'hover:bg-accent text-foreground'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Lucide.Folder className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{folderName}</span>
                                        </div>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Column: Files Grid (3 columns wide if preview panel closed, 2 if open) */}
                    <div className={`${selectedFile ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6 transition-all duration-300`}>
                        {/* Search & Type filter bar */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border p-3 rounded-2xl shadow-sm">
                            <div className="relative flex-1 w-full">
                                <Lucide.Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search files..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9 w-full"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0">
                                <Button
                                    variant={activeType === null ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleTypeFilter(null)}
                                    className="rounded-full px-4 text-xs font-semibold"
                                >
                                    All
                                </Button>
                                <Button
                                    variant={activeType === 'image' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleTypeFilter('image')}
                                    className="rounded-full px-4 text-xs font-semibold"
                                >
                                    Images
                                </Button>
                                <Button
                                    variant={activeType === 'document' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleTypeFilter('document')}
                                    className="rounded-full px-4 text-xs font-semibold"
                                >
                                    Documents
                                </Button>
                            </div>
                        </div>

                        {/* File Upload Dropzone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                                dragActive 
                                    ? 'border-primary bg-primary/5 text-primary scale-[0.99] shadow-inner' 
                                    : 'border-muted bg-card hover:border-muted-foreground/30'
                            }`}
                        >
                            <input
                                type="file"
                                id="file_upload_input"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Lucide.UploadCloud className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60 animate-bounce-slow" />
                            <p className="text-sm font-semibold text-foreground">
                                Drag and drop files here
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Or <label htmlFor="file_upload_input" className="text-primary hover:underline font-semibold cursor-pointer">browse file</label> to upload. Max size: 10MB.
                            </p>
                        </div>

                        {/* Files Grid */}
                        {files.length === 0 ? (
                            <div className="text-center py-12 bg-card border rounded-2xl shadow-sm text-muted-foreground">
                                <Lucide.FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="font-semibold text-sm">No assets found</p>
                                <p className="text-xs mt-1">Try changing filters or upload a new file.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                {files.map((file) => {
                                    const isImage = file.mime_type.startsWith('image/');
                                    const isChecked = selectedIds.includes(file.id);
                                    const isSelected = selectedFile?.id === file.id;

                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => setSelectedFile(file)}
                                            className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'border-primary ring-2 ring-primary/20 scale-95 shadow-md bg-accent/20'
                                                    : 'border-muted hover:border-muted-foreground/30 hover:scale-102 bg-card'
                                            }`}
                                        >
                                            {/* Selection checkbox */}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelectFile(file.id);
                                                }}
                                                className={`absolute top-2.5 left-2.5 z-10 h-5 w-5 rounded border bg-card flex items-center justify-center transition-all ${
                                                    isChecked 
                                                        ? 'bg-primary border-primary text-primary-foreground scale-110' 
                                                        : 'border-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:scale-105'
                                                }`}
                                            >
                                                {isChecked && <Lucide.Check className="h-3 w-3 stroke-[3]" />}
                                            </div>

                                            {/* Hover option menus */}
                                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyLink(file.url);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white transition-colors"
                                                    title="Copy URL Link"
                                                >
                                                    <Lucide.Link className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerRename(file);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white transition-colors"
                                                    title="Rename File"
                                                >
                                                    <Lucide.Edit2 className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteFile(file);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white transition-colors"
                                                    title="Delete"
                                                >
                                                    <Lucide.Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Asset Body render */}
                                            <div className="aspect-square w-full bg-muted/30 border-b flex items-center justify-center overflow-hidden">
                                                {isImage ? (
                                                    <img
                                                        src={file.url}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <Lucide.FileText className="h-12 w-12 text-muted-foreground/60" />
                                                )}
                                            </div>

                                            {/* File footer */}
                                            <div className="p-2.5 min-w-0">
                                                <p className="text-xs font-semibold text-foreground truncate w-full" title={file.name}>
                                                    {file.name}
                                                </p>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                                                    <span>{file.formatted_size}</span>
                                                    {file.folder && (
                                                        <span className="bg-primary/5 text-primary px-1.5 py-0.2 rounded font-medium border border-primary/10">
                                                            {file.folder}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: File Preview sidebar panel */}
                    {selectedFile && (
                        <div className="lg:col-span-1 animate-in slide-in-from-right-5 duration-200">
                            <Card className="sticky top-6 overflow-hidden border-primary/10 shadow-lg bg-card">
                                <div className="bg-primary/5 px-4 py-3 border-b flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                        <Lucide.FileSearch className="h-4 w-4" />
                                        Asset Details
                                    </h3>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-muted-foreground hover:text-foreground p-1 hover:bg-accent rounded-lg"
                                    >
                                        <Lucide.X className="h-4 w-4" />
                                    </button>
                                </div>
                                <CardContent className="p-4 space-y-4">
                                    {/* Preview Block */}
                                    <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                                        {selectedFile.mime_type.startsWith('image/') ? (
                                            <img src={selectedFile.url} className="max-h-full object-contain" alt="Selected Preview" />
                                        ) : (
                                            <Lucide.FileText className="h-16 w-16 text-muted-foreground/60" />
                                        )}
                                    </div>

                                    {/* Properties info list */}
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground uppercase">File Name</Label>
                                            <p className="text-xs font-bold text-foreground break-all">{selectedFile.name}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
                                            <div>
                                                <Label className="text-[10px] text-muted-foreground uppercase">Size</Label>
                                                <p className="font-semibold text-foreground">{selectedFile.formatted_size}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-muted-foreground uppercase">Mime Type</Label>
                                                <p className="font-semibold text-foreground truncate" title={selectedFile.mime_type}>{selectedFile.mime_type}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-muted-foreground uppercase">Folder</Label>
                                                <p className="font-semibold text-foreground capitalize">{selectedFile.folder || 'Root'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-muted-foreground uppercase">Uploaded At</Label>
                                                <p className="font-semibold text-foreground">{new Date(selectedFile.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Link copy panel */}
                                    <div className="space-y-1.5 border-t pt-3">
                                        <Label className="text-[10px] text-muted-foreground uppercase">Public Web Link URL</Label>
                                        <div className="flex items-center gap-1.5">
                                            <Input
                                                readOnly
                                                value={selectedFile.url}
                                                className="h-8 text-xs bg-muted/40 font-mono"
                                            />
                                            <Button
                                                onClick={() => copyLink(selectedFile.url)}
                                                size="sm"
                                                variant="outline"
                                                className="h-8 shrink-0"
                                            >
                                                <Lucide.Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Action button row */}
                                    <div className="flex gap-2 pt-2 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => triggerRename(selectedFile)}
                                            className="flex-1 text-xs"
                                        >
                                            <Lucide.Edit2 className="h-3 w-3 mr-1" />
                                            Rename
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteFile(selectedFile)}
                                            className="flex-1 text-xs"
                                        >
                                            <Lucide.Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Rename Dialog */}
            <Dialog open={renameFile !== null} onOpenChange={(open) => !open && setRenameFile(null)}>
                <DialogContent className="max-w-md p-6 rounded-2xl gap-4">
                    <DialogHeader>
                        <DialogTitle>Rename Asset File</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="rename_input_field">Asset Name</Label>
                        <Input
                            id="rename_input_field"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRenameFile(null)}>Cancel</Button>
                        <Button onClick={submitRename}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Create Folder Dialog */}
            <Dialog open={showFolderModal} onOpenChange={setShowFolderModal}>
                <DialogContent className="max-w-md p-6 rounded-2xl gap-4">
                    <DialogHeader>
                        <DialogTitle>Create Virtual Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="folder_name_field">Folder Name</Label>
                        <Input
                            id="folder_name_field"
                            placeholder="e.g. branding, backups, banners"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Virtual folders will be populated automatically when uploading or organizing media assets into them.</p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowFolderModal(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                if (newFolderName.trim()) {
                                    handleFolderFilter(newFolderName.trim());
                                    toast.success(`Active folder target changed to "${newFolderName.trim()}". Uploaded assets will save to this folder.`);
                                    setShowFolderModal(false);
                                    setNewFolderName('');
                                }
                            }}
                        >
                            Set Active Folder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
