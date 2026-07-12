import { Check, Edit2, FileText, Link, Trash2 } from 'lucide-react';
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
            className={`group relative cursor-pointer overflow-hidden rounded-xl border transition-all ${
                isSelected
                    ? 'border-primary ring-primary/20 bg-accent/20 scale-95 shadow-md ring-2'
                    : 'border-muted hover:border-muted-foreground/30 bg-card hover:scale-102'
            }`}
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheck(file.id);
                }}
                className={`bg-card absolute top-2.5 left-2.5 z-10 flex h-5 w-5 items-center justify-center rounded border transition-all ${
                    isChecked
                        ? 'bg-primary border-primary text-primary-foreground scale-110'
                        : 'border-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:scale-105'
                }`}
            >
                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
            </div>

            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCopyLink(file.url);
                    }}
                    className="rounded-lg bg-black/60 p-1.5 text-white transition-colors hover:bg-black"
                    title="Copy URL Link"
                >
                    <Link className="h-3 w-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRename(file);
                    }}
                    className="rounded-lg bg-black/60 p-1.5 text-white transition-colors hover:bg-black"
                    title="Rename File"
                >
                    <Edit2 className="h-3 w-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(file);
                    }}
                    className="rounded-lg bg-red-600/90 p-1.5 text-white transition-colors hover:bg-red-600"
                    title="Delete"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            <div className="bg-muted/30 flex aspect-square w-full items-center justify-center overflow-hidden border-b">
                {isImage ? (
                    <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <FileText className="text-muted-foreground/60 h-12 w-12" />
                )}
            </div>

            <div className="min-w-0 p-2.5">
                <p
                    className="text-foreground w-full truncate text-xs font-semibold"
                    title={file.name}
                >
                    {file.name}
                </p>
                <div className="text-muted-foreground mt-1 flex items-center justify-between text-[10px]">
                    <span>{file.formatted_size}</span>
                    {file.folder && (
                        <span className="bg-primary/5 text-primary py-0.2 border-primary/10 rounded border px-1.5 font-medium">
                            {file.folder}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
