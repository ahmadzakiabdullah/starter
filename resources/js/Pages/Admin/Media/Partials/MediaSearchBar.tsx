import { Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

interface MediaSearchBarProps {
    search: string;
    activeType: string | null;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onTypeFilter: (type: string | null) => void;
}

export default function MediaSearchBar({ search, activeType, onSearchChange, onSearch, onTypeFilter }: MediaSearchBarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border p-3 rounded-2xl shadow-sm">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search files..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    className="pl-9 w-full"
                />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0">
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
