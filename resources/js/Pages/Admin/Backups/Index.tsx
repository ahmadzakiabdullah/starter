import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Database,
    Download,
    FileText,
    Info,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface BackupItem {
    filename: string;
    size: string;
    created_at: string;
}

interface BackupsPageProps {
    backups: BackupItem[];
}

export default function Index({ backups }: BackupsPageProps) {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleCreateBackup = () => {
        router.post(
            route('backups.create'),
            {},
            {
                onStart: () => {
                    toast.loading('Exporting database schema and data...', {
                        id: 'backup-task',
                    });
                },
                onFinish: () => {
                    toast.dismiss('backup-task');
                },
            },
        );
    };

    const handleDeleteBackup = (filename: string) => {
        if (
            confirm(
                `Are you sure you want to permanently delete the backup archive: ${filename}?`,
            )
        ) {
            router.delete(route('backups.destroy', filename));
        }
    };

    const handleDownloadBackup = (filename: string) => {
        // Direct link download
        window.location.href = route('backups.download', filename);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Database Backup Management" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Database className="text-primary h-6 w-6" />
                            Database Backup Manager
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Create database SQL dump archives, download backup
                            logs, and manage storage retention.
                        </p>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateBackup}
                        className="flex shrink-0 items-center gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        Backup Now
                    </Button>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card flex flex-col justify-between rounded-xl border p-4 shadow-xs">
                        <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                            Backup Archives
                        </span>
                        <span className="text-primary mt-1 text-xl font-bold sm:text-2xl">
                            {backups.length}
                        </span>
                    </div>
                    <div className="bg-card flex flex-col justify-between rounded-xl border p-4 shadow-xs">
                        <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                            Storage Used
                        </span>
                        <span className="mt-1 text-xl font-bold sm:text-2xl">
                            {backups.length > 0 ? 'Active Files' : '0 B'}
                        </span>
                    </div>
                    <div className="bg-card flex flex-col justify-between rounded-xl border p-4 shadow-xs">
                        <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                            Latest Archive
                        </span>
                        <span className="text-muted-foreground mt-1 truncate text-xs font-semibold sm:text-sm">
                            {backups.length > 0
                                ? backups[0].filename
                                      .split('_')
                                      .slice(1)
                                      .join('_')
                                      .replace('.sql', '')
                                : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Backups Table */}
                <div className="bg-card overflow-hidden rounded-xl border shadow-xs">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Filename</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="w-[100px] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {backups.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-muted-foreground h-40 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Info className="text-primary h-8 w-8 opacity-60" />
                                            <p className="text-sm font-medium">
                                                No database backups generated
                                                yet.
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-2"
                                                onClick={handleCreateBackup}
                                            >
                                                Trigger Initial Backup
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                backups.map((item) => (
                                    <TableRow
                                        key={item.filename}
                                        className="hover:bg-muted/10"
                                    >
                                        <TableCell className="text-foreground max-w-[280px] truncate font-mono text-xs font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                                                <span title={item.filename}>
                                                    {item.filename}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold">
                                            {item.size}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                                <span>
                                                    {new Date(
                                                        item.created_at,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDownloadBackup(
                                                            item.filename,
                                                        )
                                                    }
                                                    className="text-muted-foreground hover:text-primary h-8 w-8"
                                                    title="Download Backup"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDeleteBackup(
                                                            item.filename,
                                                        )
                                                    }
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-8 w-8"
                                                    title="Delete Backup"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
