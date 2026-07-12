import { FolderOpen } from 'lucide-react';
import type { MediaFile } from '../types';
import MediaFileCard from './MediaFileCard';

interface MediaGridProps {
    files: MediaFile[];
    selectedFile: MediaFile | null;
    selectedIds: number[];
    onSelect: (file: MediaFile) => void;
    onToggleCheck: (id: number) => void;
    onCopyLink: (url: string) => void;
    onRename: (file: MediaFile) => void;
    onDelete: (file: MediaFile) => void;
}

export default function MediaGrid({
    files,
    selectedFile,
    selectedIds,
    onSelect,
    onToggleCheck,
    onCopyLink,
    onRename,
    onDelete,
}: MediaGridProps) {
    if (files.length === 0) {
        return (
            <div className="bg-card text-muted-foreground rounded-2xl border py-12 text-center shadow-sm">
                <FolderOpen className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm font-semibold">No assets found</p>
                <p className="mt-1 text-xs">
                    Try changing filters or upload a new file.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
                <MediaFileCard
                    key={file.id}
                    file={file}
                    isSelected={selectedFile?.id === file.id}
                    isChecked={selectedIds.includes(file.id)}
                    onSelect={onSelect}
                    onToggleCheck={onToggleCheck}
                    onCopyLink={onCopyLink}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
