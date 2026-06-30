import { FolderOpen } from 'lucide-react';
import MediaFileCard from './MediaFileCard';
import type { MediaFile } from '../types';

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
            <div className="text-center py-12 bg-card border rounded-2xl shadow-sm text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-sm">No assets found</p>
                <p className="text-xs mt-1">Try changing filters or upload a new file.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
