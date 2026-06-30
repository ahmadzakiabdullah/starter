import { FileText, Check, Link, Edit2, Trash2 } from 'lucide-react';
import type { MediaFile } from '../types';

interface MediaFileCardProps {
    file: MediaFile;
    isSelected: boolean;
    isChecked: boolean;
    onSelect: (file: MediaFile) => void;
    onToggleCheck: (id: number) => void;
    onCopyLink: (url: string) => void;
    onRename: (file: MediaFile) => void;
    onDelete: (file: MediaFile) => void;
}

export default function MediaFileCard({
    file,
    isSelected,
    isChecked,
    onSelect,
    onToggleCheck,
    onCopyLink,
    onRename,
    onDelete,
}: MediaFileCardProps) {
    const isImage = file.mime_type.startsWith('image/');

    return (
        <div
            onClick={() => onSelect(file)}
            className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                isSelected
                    ? 'border-primary ring-2 ring-primary/20 scale-95 shadow-md bg-accent/20'
                    : 'border-muted hover:border-muted-foreground/30 hover:scale-102 bg-card'
            }`}
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheck(file.id);
                }}
                className={`absolute top-2.5 left-2.5 z-10 h-5 w-5 rounded border bg-card flex items-center justify-center transition-all ${
                    isChecked
                        ? 'bg-primary border-primary text-primary-foreground scale-110'
                        : 'border-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:scale-105'
                }`}
            >
                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
            </div>

            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCopyLink(file.url);
                    }}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white transition-colors"
                    title="Copy URL Link"
                >
                    <Link className="h-3 w-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRename(file);
                    }}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white transition-colors"
                    title="Rename File"
                >
                    <Edit2 className="h-3 w-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(file);
                    }}
                    className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white transition-colors"
                    title="Delete"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            <div className="aspect-square w-full bg-muted/30 border-b flex items-center justify-center overflow-hidden">
                {isImage ? (
                    <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <FileText className="h-12 w-12 text-muted-foreground/60" />
                )}
            </div>

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
}
