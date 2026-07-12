import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Folder, FolderHeart } from 'lucide-react';

interface MediaFolderListProps {
    folders: string[];
    activeFolder: string | null;
    onFolderFilter: (folder: string | null) => void;
}

export default function MediaFolderList({
    folders,
    activeFolder,
    onFolderFilter,
}: MediaFolderListProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                    Virtual Folders
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2">
                <button
                    onClick={() => onFolderFilter(null)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                        activeFolder === null
                            ? 'bg-primary text-primary-foreground font-bold shadow-md'
                            : 'hover:bg-accent text-foreground'
                    }`}
                >
                    <FolderHeart className="h-4 w-4 shrink-0" />
                    <span>All Assets</span>
                </button>

                {folders.map((folderName) => (
                    <button
                        key={folderName}
                        onClick={() => onFolderFilter(folderName)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                            activeFolder === folderName
                                ? 'bg-primary text-primary-foreground font-bold shadow-md'
                                : 'hover:bg-accent text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <Folder className="h-4 w-4 shrink-0" />
                            <span className="truncate">{folderName}</span>
                        </div>
                    </button>
                ))}
            </CardContent>
        </Card>
    );
}
