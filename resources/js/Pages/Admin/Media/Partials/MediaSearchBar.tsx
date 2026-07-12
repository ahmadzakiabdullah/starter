import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search } from 'lucide-react';

interface MediaSearchBarProps {
    search: string;
    activeType: string | null;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onTypeFilter: (type: string | null) => void;
}

export default function MediaSearchBar({
    search,
    activeType,
    onSearchChange,
    onSearch,
    onTypeFilter,
}: MediaSearchBarProps) {
    return (
        <div className="bg-card flex flex-col items-center gap-4 rounded-2xl border p-3 shadow-sm sm:flex-row">
            <div className="relative w-full flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                    placeholder="Search files..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    className="w-full pl-9"
                />
            </div>
            <div className="flex w-full shrink-0 items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
                <Button
                    variant={activeType === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTypeFilter(null)}
                    className="rounded-full px-4 text-xs font-semibold"
                >
                    All
                </Button>
                <Button
                    variant={activeType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTypeFilter('image')}
                    className="rounded-full px-4 text-xs font-semibold"
                >
                    Images
                </Button>
                <Button
                    variant={activeType === 'document' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTypeFilter('document')}
                    className="rounded-full px-4 text-xs font-semibold"
                >
                    Documents
                </Button>
            </div>
        </div>
    );
}
