import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import axios, { AxiosError } from 'axios';
import * as Lucide from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MediaFile {
    id: number;
    name: string;
    url: string;
    mime_type: string;
    formatted_size: string;
    folder: string | null;
}

interface MediaSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (file: { url: string; name: string; id: number }) => void;
    allowedTypes?: 'image' | 'all';
}

export default function MediaSelector({
    open,
    onOpenChange,
    onSelect,
    allowedTypes = 'all',
}: MediaSelectorProps) {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await axios.get<{ files: MediaFile[] }>(
                '/dashboard/media',
                {
                    headers: { Accept: 'application/json' },
                },
            );
            setFiles(response.data.files || []);
        } catch (error) {
            toast.error('Failed to load media assets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFiles();
            setSelectedFile(null);
        }
    }, [open]);

    // Handle Search & Filter
    const filteredFiles = files.filter((file) => {
        const matchesSearch = file.name
            .toLowerCase()
            .includes(search.toLowerCase());
        const isImage = file.mime_type.startsWith('image/');
        const matchesType =
            allowedTypes === 'all' || (allowedTypes === 'image' && isImage);
        return matchesSearch && matchesType;
    });

    // Handle Upload File
    const handleFileUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'branding'); // Default folder inside modal uploads

        try {
            await axios.post('/dashboard/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Asset uploaded successfully.');
            // Refresh file list
            await fetchFiles();
        } catch (error: unknown) {
            const errMsg =
                error instanceof AxiosError
                    ? error.response?.data?.message
                    : undefined;
            toast.error(errMsg || 'Failed to upload asset.');
        } finally {
            setUploading(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[85vh] max-w-4xl flex-col gap-4 rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Lucide.Images className="text-primary h-5 w-5" />
                        Select Asset from Library
                    </DialogTitle>
                    <DialogDescription>
                        Choose an existing asset from the media manager or
                        upload a new file.
                    </DialogDescription>
                </DialogHeader>

                {/* Search and Upload bar */}
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="relative w-full flex-1">
                        <Lucide.Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                        <Input
                            placeholder="Search by asset name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9"
                        />
                    </div>

                    <div className="relative w-full shrink-0 sm:w-auto">
                        <input
                            type="file"
                            id="modal_upload"
                            className="hidden"
                            onChange={onFileChange}
                            accept={allowedTypes === 'image' ? 'image/*' : '*'}
                            disabled={uploading}
                        />
                        <Button
                            asChild
                            variant="outline"
                            className="w-full cursor-pointer"
                            disabled={uploading}
                        >
                            <label
                                htmlFor="modal_upload"
                                className="flex items-center gap-2"
                            >
                                {uploading ? (
                                    <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Lucide.UploadCloud className="h-4 w-4" />
                                )}
                                Upload New File
                            </label>
                        </Button>
                    </div>
                </div>

                {/* Layout Workspace Grid */}
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden rounded-xl border md:grid-cols-3">
                    {/* Files Display (Col-span 2) */}
                    <div className="bg-muted/10 overflow-y-auto p-4 md:col-span-2">
                        {loading ? (
                            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
                                <Lucide.Loader2 className="text-primary h-8 w-8 animate-spin" />
                                <span>Loading files...</span>
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            /* Dropzone for Upload if empty */
                            <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                className={`flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                                    dragActive
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-muted-foreground/20 text-muted-foreground'
                                }`}
                            >
                                <Lucide.UploadCloud className="text-muted-foreground/60 mb-3 h-12 w-12" />
                                <span className="text-sm font-semibold">
                                    Drag and drop file here
                                </span>
                                <span className="text-muted-foreground/70 mt-1 text-xs">
                                    Or click 'Upload New File' above
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {filteredFiles.map((file) => {
                                    const isImage =
                                        file.mime_type.startsWith('image/');
                                    const isSelected =
                                        selectedFile?.id === file.id;

                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() =>
                                                setSelectedFile(file)
                                            }
                                            className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all ${
                                                isSelected
                                                    ? 'border-primary ring-primary/20 scale-95 ring-2'
                                                    : 'border-muted hover:border-muted-foreground/30 bg-card hover:scale-102'
                                            }`}
                                        >
                                            {isImage ? (
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                                                    <Lucide.FileText className="text-muted-foreground/60 mb-1 h-10 w-10" />
                                                    <span className="text-foreground w-full truncate px-1 text-[10px] font-medium">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <span className="max-w-[90%] truncate rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                                                    {file.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Metadata Preview Panel (Col-span 1) */}
                    <div className="bg-card flex flex-col justify-between border-t p-4 md:border-t-0 md:border-l">
                        {selectedFile ? (
                            <div className="space-y-4">
                                <div className="bg-muted flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border">
                                    {selectedFile.mime_type.startsWith(
                                        'image/',
                                    ) ? (
                                        <img
                                            src={selectedFile.url}
                                            className="max-h-full object-contain"
                                            alt="preview"
                                        />
                                    ) : (
                                        <Lucide.FileText className="text-muted-foreground h-12 w-12" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h4
                                        className="text-foreground truncate text-sm font-bold"
                                        title={selectedFile.name}
                                    >
                                        {selectedFile.name}
                                    </h4>
                                    <div className="text-muted-foreground grid grid-cols-2 gap-y-1.5 text-xs">
                                        <span>Size:</span>
                                        <span className="text-foreground text-right font-medium">
                                            {selectedFile.formatted_size}
                                        </span>
                                        <span>Type:</span>
                                        <span className="text-foreground truncate text-right font-medium">
                                            {selectedFile.mime_type}
                                        </span>
                                        <span>Folder:</span>
                                        <span className="text-foreground text-right font-medium capitalize">
                                            {selectedFile.folder || 'Root'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-muted-foreground flex h-full items-center justify-center text-center text-xs">
                                Select an asset to view details and select it.
                            </div>
                        )}

                        <div className="flex gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                disabled={!selectedFile}
                                onClick={() => {
                                    if (selectedFile) {
                                        onSelect(selectedFile);
                                        onOpenChange(false);
                                    }
                                }}
                                className="flex-1"
                            >
                                Select Asset
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
