import { FolderHeart, Folder } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface MediaFolderListProps {
    folders: string[];
    activeFolder: string | null;
    onFolderFilter: (folder: string | null) => void;
}

export default function MediaFolderList({ folders, activeFolder, onFolderFilter }: MediaFolderListProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Virtual Folders
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
                <button
                    onClick={() => onFolderFilter(null)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
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
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between gap-2 transition-all ${
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
