import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import * as Lucide from "lucide-react";
import axios from 'axios';
import { toast } from 'sonner';

interface MediaSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (file: { url: string; name: string; id: number }) => void;
    allowedTypes?: 'image' | 'all';
}

export default function MediaSelector({ open, onOpenChange, onSelect, allowedTypes = 'all' }: MediaSelectorProps) {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedFile, setSelectedFile] = useState<any | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/dashboard/media', {
                headers: { 'Accept': 'application/json' }
            });
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
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
        const isImage = file.mime_type.startsWith('image/');
        const matchesType = allowedTypes === 'all' || (allowedTypes === 'image' && isImage);
        return matchesSearch && matchesType;
    });

    // Handle Upload File
    const handleFileUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'branding'); // Default folder inside modal uploads

        try {
            const response = await axios.post('/dashboard/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Asset uploaded successfully.');
            // Refresh file list
            await fetchFiles();
        } catch (error: any) {
            const errMsg = error.response?.data?.message || 'Failed to upload asset.';
            toast.error(errMsg);
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
        if (file) handleFileUpload(file);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6 rounded-2xl gap-4">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Lucide.Images className="h-5 w-5 text-primary" />
                        Select Asset from Library
                    </DialogTitle>
                    <DialogDescription>
                        Choose an existing asset from the media manager or upload a new file.
                    </DialogDescription>
                </DialogHeader>

                {/* Search and Upload bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Lucide.Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by asset name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>

                    <div className="relative w-full sm:w-auto shrink-0">
                        <input
                            type="file"
                            id="modal_upload"
                            className="hidden"
                            onChange={onFileChange}
                            accept={allowedTypes === 'image' ? "image/*" : "*"}
                            disabled={uploading}
                        />
                        <Button asChild variant="outline" className="w-full cursor-pointer" disabled={uploading}>
                            <label htmlFor="modal_upload" className="flex items-center gap-2">
                                {uploading ? <Lucide.Loader2 className="h-4 w-4 animate-spin" /> : <Lucide.UploadCloud className="h-4 w-4" />}
                                Upload New File
                            </label>
                        </Button>
                    </div>
                </div>

                {/* Layout Workspace Grid */}
                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-xl overflow-hidden">
                    {/* Files Display (Col-span 2) */}
                    <div className="md:col-span-2 p-4 overflow-y-auto bg-muted/10">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <Lucide.Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span>Loading files...</span>
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            /* Dropzone for Upload if empty */
                            <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 transition-all ${
                                    dragActive ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/20 text-muted-foreground"
                                }`}
                            >
                                <Lucide.UploadCloud className="h-12 w-12 mb-3 text-muted-foreground/60" />
                                <span className="font-semibold text-sm">Drag and drop file here</span>
                                <span className="text-xs text-muted-foreground/70 mt-1">Or click 'Upload New File' above</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {filteredFiles.map((file) => {
                                    const isImage = file.mime_type.startsWith('image/');
                                    const isSelected = selectedFile?.id === file.id;

                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => setSelectedFile(file)}
                                            className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${
                                                isSelected 
                                                    ? 'border-primary ring-2 ring-primary/20 scale-95' 
                                                    : 'border-muted hover:border-muted-foreground/30 hover:scale-102 bg-card'
                                            }`}
                                        >
                                            {isImage ? (
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                                                    <Lucide.FileText className="h-10 w-10 text-muted-foreground/60 mb-1" />
                                                    <span className="text-[10px] font-medium text-foreground truncate w-full px-1">{file.name}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[10px] text-white bg-black/60 px-2 py-0.5 rounded-full font-medium truncate max-w-[90%]">{file.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Metadata Preview Panel (Col-span 1) */}
                    <div className="p-4 border-t md:border-t-0 md:border-l flex flex-col justify-between bg-card">
                        {selectedFile ? (
                            <div className="space-y-4">
                                <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                                    {selectedFile.mime_type.startsWith('image/') ? (
                                        <img src={selectedFile.url} className="max-h-full object-contain" alt="preview" />
                                    ) : (
                                        <Lucide.FileText className="h-12 w-12 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-foreground truncate" title={selectedFile.name}>{selectedFile.name}</h4>
                                    <div className="grid grid-cols-2 text-xs text-muted-foreground gap-y-1.5">
                                        <span>Size:</span>
                                        <span className="text-right font-medium text-foreground">{selectedFile.formatted_size}</span>
                                        <span>Type:</span>
                                        <span className="text-right font-medium text-foreground truncate">{selectedFile.mime_type}</span>
                                        <span>Folder:</span>
                                        <span className="text-right font-medium text-foreground capitalize">{selectedFile.folder || 'Root'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground">
                                Select an asset to view details and select it.
                            </div>
                        )}

                        <div className="pt-4 border-t flex gap-2">
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
