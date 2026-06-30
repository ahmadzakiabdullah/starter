export interface MediaFile {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    path: string;
    size: number;
    folder: string | null;
    url: string;
    formatted_size: string;
    created_at: string;
}

export interface PaginatedMedia {
    data: MediaFile[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface MediaFilters {
    search?: string;
    folder?: string;
    type?: string;
}

export interface IndexProps {
    files: PaginatedMedia;
    folders: string[];
    filters: MediaFilters;
}
