import { FileSearch, X, FileText, Copy, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import type { MediaFile } from '../types';

interface MediaPreviewPanelProps {
    file: MediaFile;
    onClose: () => void;
    onCopyLink: (url: string) => void;
    onRename: (file: MediaFile) => void;
    onDelete: (file: MediaFile) => void;
}

export default function MediaPreviewPanel({ file, onClose, onCopyLink, onRename, onDelete }: MediaPreviewPanelProps) {
    const isImage = file.mime_type.startsWith('image/');

    return (
        <div className="lg:col-span-1 animate-in slide-in-from-right-5 duration-200">
            <Card className="sticky top-6 overflow-hidden border-primary/10 shadow-lg bg-card">
                <div className="bg-primary/5 px-4 py-3 border-b flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <FileSearch className="h-4 w-4" />
                        Asset Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground p-1 hover:bg-accent rounded-lg"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <CardContent className="p-4 space-y-4">
                    <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                        {isImage ? (
                            <img src={file.url} className="max-h-full object-contain" alt="Selected Preview" />
                        ) : (
                            <FileText className="h-16 w-16 text-muted-foreground/60" />
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label className="text-[10px] text-muted-foreground uppercase">File Name</Label>
                            <p className="text-xs font-bold text-foreground break-all">{file.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
                            <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Size</Label>
                                <p className="font-semibold text-foreground">{file.formatted_size}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Mime Type</Label>
                                <p className="font-semibold text-foreground truncate" title={file.mime_type}>
                                    {file.mime_type}
                                </p>
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Folder</Label>
                                <p className="font-semibold text-foreground capitalize">{file.folder || 'Root'}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Uploaded At</Label>
                                <p className="font-semibold text-foreground">
                                    {new Date(file.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 border-t pt-3">
                        <Label className="text-[10px] text-muted-foreground uppercase">Public Web Link URL</Label>
                        <div className="flex items-center gap-1.5">
                            <Input
                                readOnly
                                value={file.url}
                                className="h-8 text-xs bg-muted/40 font-mono"
                            />
                            <Button
                                onClick={() => onCopyLink(file.url)}
                                size="sm"
                                variant="outline"
                                className="h-8 shrink-0"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRename(file)}
                            className="flex-1 text-xs"
                        >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Rename
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(file)}
                            className="flex-1 text-xs"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
