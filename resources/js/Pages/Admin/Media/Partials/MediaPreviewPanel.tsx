import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Copy, Edit2, FileSearch, FileText, Trash2, X } from 'lucide-react';
import type { MediaFile } from '../types';

interface MediaPreviewPanelProps {
    file: MediaFile;
    onClose: () => void;
    onCopyLink: (url: string) => void;
    onRename: (file: MediaFile) => void;
    onDelete: (file: MediaFile) => void;
}

export default function MediaPreviewPanel({
    file,
    onClose,
    onCopyLink,
    onRename,
    onDelete,
}: MediaPreviewPanelProps) {
    const isImage = file.mime_type.startsWith('image/');

    return (
        <div className="animate-in slide-in-from-right-5 duration-200 lg:col-span-1">
            <Card className="border-primary/10 bg-card sticky top-6 overflow-hidden shadow-lg">
                <div className="bg-primary/5 flex items-center justify-between border-b px-4 py-3">
                    <h3 className="text-primary flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                        <FileSearch className="h-4 w-4" />
                        Asset Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <CardContent className="space-y-4 p-4">
                    <div className="bg-muted flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border">
                        {isImage ? (
                            <img
                                src={file.url}
                                className="max-h-full object-contain"
                                alt="Selected Preview"
                            />
                        ) : (
                            <FileText className="text-muted-foreground/60 h-16 w-16" />
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label className="text-muted-foreground text-[10px] uppercase">
                                File Name
                            </Label>
                            <p className="text-foreground text-xs font-bold break-all">
                                {file.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t pt-3 text-xs">
                            <div>
                                <Label className="text-muted-foreground text-[10px] uppercase">
                                    Size
                                </Label>
                                <p className="text-foreground font-semibold">
                                    {file.formatted_size}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-[10px] uppercase">
                                    Mime Type
                                </Label>
                                <p
                                    className="text-foreground truncate font-semibold"
                                    title={file.mime_type}
                                >
                                    {file.mime_type}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-[10px] uppercase">
                                    Folder
                                </Label>
                                <p className="text-foreground font-semibold capitalize">
                                    {file.folder || 'Root'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-[10px] uppercase">
                                    Uploaded At
                                </Label>
                                <p className="text-foreground font-semibold">
                                    {new Date(
                                        file.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 border-t pt-3">
                        <Label className="text-muted-foreground text-[10px] uppercase">
                            Public Web Link URL
                        </Label>
                        <div className="flex items-center gap-1.5">
                            <Input
                                readOnly
                                value={file.url}
                                className="bg-muted/40 h-8 font-mono text-xs"
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

                    <div className="flex gap-2 border-t pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRename(file)}
                            className="flex-1 text-xs"
                        >
                            <Edit2 className="mr-1 h-3 w-3" />
                            Rename
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(file)}
                            className="flex-1 text-xs"
                        >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
