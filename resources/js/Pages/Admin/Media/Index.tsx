import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Images, FolderPlus, Trash2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useMediaManager } from './useMediaManager';
import MediaFolderList from './Partials/MediaFolderList';
import MediaSearchBar from './Partials/MediaSearchBar';
import MediaUploadDropzone from './Partials/MediaUploadDropzone';
import MediaGrid from './Partials/MediaGrid';
import MediaPreviewPanel from './Partials/MediaPreviewPanel';
import MediaPagination from './Partials/MediaPagination';
import RenameDialog from './Partials/RenameDialog';
import ConfirmDeleteDialog from './Partials/ConfirmDeleteDialog';
import CreateFolderDialog from './Partials/CreateFolderDialog';
import type { IndexProps } from './types';

export default function Index({ files, folders, filters }: IndexProps) {
    const {
        search, setSearch, activeFolder, activeType, selectedFile, setSelectedFile,
        selectedIds, dragActive,
        renameTarget, renameValue, setRenameValue,
        deleteTarget, bulkDeleteConfirm, createFolderOpen, setCreateFolderOpen,
        handleSearch, handleFolderFilter, handleTypeFilter, changePage,
        handleFileChange, handleDragEnter, handleDragLeave, handleDragOver, handleDrop,
        copyLink, triggerRename, submitRename,
        requestDelete, confirmDelete, cancelDelete,
        requestBulkDelete, confirmBulkDelete, cancelBulkDelete,
        toggleSelectFile, submitCreateFolder, setRenameTarget,
    } = useMediaManager({ initialFilters: filters, folders });

    return (
        <AuthenticatedLayout>
            <Head title="Media Manager" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Images className="h-6 w-6 text-primary" />
                            Media Library
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Upload and manage visual assets, files, and metadata folders.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={requestBulkDelete}
                                className="flex items-center gap-1.5"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCreateFolderOpen(true)}
                            className="flex items-center gap-1.5"
                        >
                            <FolderPlus className="h-4 w-4" />
                            New Folder
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-4 lg:col-span-1">
                        <MediaFolderList
                            folders={folders}
                            activeFolder={activeFolder}
                            onFolderFilter={handleFolderFilter}
                        />
                    </div>

                    <div className={`${selectedFile ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6 transition-all duration-300`}>
                        <MediaSearchBar
                            search={search}
                            activeType={activeType}
                            onSearchChange={setSearch}
                            onSearch={handleSearch}
                            onTypeFilter={handleTypeFilter}
                        />

                        <MediaUploadDropzone
                            dragActive={dragActive}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onFileChange={handleFileChange}
                        />

                        <MediaGrid
                            files={files.data}
                            selectedFile={selectedFile}
                            selectedIds={selectedIds}
                            onSelect={setSelectedFile}
                            onToggleCheck={toggleSelectFile}
                            onCopyLink={copyLink}
                            onRename={triggerRename}
                            onDelete={requestDelete}
                        />

                        <MediaPagination
                            currentPage={files.current_page}
                            lastPage={files.last_page}
                            total={files.total}
                            onChangePage={changePage}
                        />
                    </div>

                    {selectedFile && (
                        <MediaPreviewPanel
                            file={selectedFile}
                            onClose={() => setSelectedFile(null)}
                            onCopyLink={copyLink}
                            onRename={triggerRename}
                            onDelete={requestDelete}
                        />
                    )}
                </div>
            </div>

            <RenameDialog
                open={renameTarget !== null}
                value={renameValue}
                onValueChange={setRenameValue}
                onSave={submitRename}
                onCancel={setRenameTarget}
            />

            <ConfirmDeleteDialog
                open={deleteTarget !== null}
                title="Delete Asset"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />

            <ConfirmDeleteDialog
                open={bulkDeleteConfirm}
                title="Delete Selected Assets"
                description={`Are you sure you want to delete ${selectedIds.length} selected files? This action cannot be undone.`}
                onConfirm={confirmBulkDelete}
                onCancel={cancelBulkDelete}
            />

            <CreateFolderDialog
                open={createFolderOpen}
                onOpenChange={setCreateFolderOpen}
                onSubmit={submitCreateFolder}
            />
        </AuthenticatedLayout>
    );
}
