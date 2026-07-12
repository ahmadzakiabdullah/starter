import { Button } from '@/Components/ui/button';

interface MediaPaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    onChangePage: (page: number) => void;
}

export default function MediaPagination({
    currentPage,
    lastPage,
    total,
    onChangePage,
}: MediaPaginationProps) {
    if (lastPage <= 1) return null;

    return (
        <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
                Page {currentPage} of {lastPage} &middot; {total} assets
            </p>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => onChangePage(currentPage - 1)}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === lastPage}
                    onClick={() => onChangePage(currentPage + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
