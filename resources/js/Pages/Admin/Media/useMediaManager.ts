import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { MediaFile, MediaFilters } from './types';

interface UseMediaManagerProps {
    initialFilters: MediaFilters;
    folders: string[];
}

export function useMediaManager({ initialFilters }: UseMediaManagerProps) {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [activeFolder, setActiveFolder] = useState<string | null>(
        initialFilters.folder || null,
    );
    const [activeType, setActiveType] = useState<string | null>(
        initialFilters.type || null,
    );

    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [dragActive, setDragActive] = useState(false);

    const [renameTarget, setRenameTarget] = useState<MediaFile | null>(null);
    const [renameValue, setRenameValue] = useState('');

    const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    const [createFolderOpen, setCreateFolderOpen] = useState(false);

    const buildParams = useCallback(
        (
            overrides?: Partial<{
                search: string;
                folder: string | null;
                type: string | null;
                page: number;
            }>,
        ) => {
            const s = overrides?.search ?? search;
            const f =
                overrides?.folder !== undefined
                    ? overrides.folder
                    : activeFolder;
            const t =
                overrides?.type !== undefined ? overrides.type : activeType;
            return {
                search: s || undefined,
                folder: f || undefined,
                type: t || undefined,
                page: overrides?.page,
            };
        },
        [search, activeFolder, activeType],
    );

    const navigate = useCallback(
        (overrides?: Parameters<typeof buildParams>[0]) => {
            router.get(route('media.index'), buildParams(overrides), {
                preserveState: true,
                preserveScroll: overrides?.page ? true : false,
            });
        },
        [buildParams],
    );

    const handleSearch = useCallback(() => navigate(), [navigate]);

    const handleFolderFilter = useCallback(
        (folder: string | null) => {
            setActiveFolder(folder);
            navigate({ folder });
        },
        [navigate],
    );

    const handleTypeFilter = useCallback(
        (type: string | null) => {
            setActiveType(type);
            navigate({ type });
        },
        [navigate],
    );

    const changePage = useCallback(
        (page: number) => {
            navigate({ page });
        },
        [navigate],
    );

    const executeUpload = useCallback(
        (file: File, folderTarget?: string) => {
            const formData = {
                file,
                folder: folderTarget || activeFolder || '',
            };
            router.post(route('media.upload'), formData, {
                forceFormData: true,
                onSuccess: () => toast.success('Asset uploaded successfully.'),
                onError: (errors) =>
                    toast.error(errors.file || 'Failed to upload asset.'),
            });
        },
        [activeFolder],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) executeUpload(file);
        },
        [executeUpload],
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) executeUpload(file);
        },
        [executeUpload],
    );

    const copyLink = useCallback((url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard.');
    }, []);

    const triggerRename = useCallback((file: MediaFile) => {
        setRenameTarget(file);
        setRenameValue(file.name);
    }, []);

    const submitRename = useCallback(() => {
        if (!renameTarget) return;
        router.patch(
            route('media.rename', renameTarget.id),
            { name: renameValue },
            {
                onSuccess: () => {
                    toast.success('Asset renamed successfully.');
                    setRenameTarget(null);
                    if (selectedFile?.id === renameTarget.id) {
                        setSelectedFile((prev) =>
                            prev ? { ...prev, name: renameValue } : null,
                        );
                    }
                },
            },
        );
    }, [renameTarget, renameValue, selectedFile]);

    const requestDelete = useCallback((file: MediaFile) => {
        setDeleteTarget(file);
    }, []);

    const confirmDelete = useCallback(() => {
        if (!deleteTarget) return;
        router.delete(route('media.destroy', deleteTarget.id), {
            onSuccess: () => {
                toast.success('Asset deleted.');
                setDeleteTarget(null);
                if (selectedFile?.id === deleteTarget.id) setSelectedFile(null);
            },
        });
    }, [deleteTarget, selectedFile]);

    const cancelDelete = useCallback(() => {
        setDeleteTarget(null);
    }, []);

    const requestBulkDelete = useCallback(() => {
        setBulkDeleteConfirm(true);
    }, []);

    const confirmBulkDelete = useCallback(() => {
        router.post(
            route('media.bulk-destroy'),
            { ids: selectedIds },
            {
                onSuccess: () => {
                    toast.success('Selected assets deleted.');
                    setSelectedIds([]);
                    setSelectedFile(null);
                    setBulkDeleteConfirm(false);
                },
            },
        );
    }, [selectedIds]);

    const cancelBulkDelete = useCallback(() => {
        setBulkDeleteConfirm(false);
    }, []);

    const toggleSelectFile = useCallback((id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    }, []);

    const submitCreateFolder = useCallback((name: string) => {
        router.post(
            route('media.folders.create'),
            { name },
            {
                onSuccess: () => {
                    toast.success(`Folder '${name}' created.`);
                    setCreateFolderOpen(false);
                },
                onError: (errors) => {
                    toast.error(errors.name || 'Failed to create folder.');
                },
            },
        );
    }, []);

    return {
        search,
        setSearch,
        activeFolder,
        activeType,
        selectedFile,
        setSelectedFile,
        selectedIds,
        dragActive,
        renameTarget,
        renameValue,
        setRenameValue,
        deleteTarget,
        bulkDeleteConfirm,
        createFolderOpen,
        setCreateFolderOpen,
        handleSearch,
        handleFolderFilter,
        handleTypeFilter,
        changePage,
        executeUpload,
        handleFileChange,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        copyLink,
        triggerRename,
        submitRename,
        requestDelete,
        confirmDelete,
        cancelDelete,
        requestBulkDelete,
        confirmBulkDelete,
        cancelBulkDelete,
        toggleSelectFile,
        submitCreateFolder,
        setRenameTarget: () => setRenameTarget(null),
    };
}
