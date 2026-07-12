import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useState } from 'react';

interface CreateFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (name: string) => void;
}

export default function CreateFolderDialog({
    open,
    onOpenChange,
    onSubmit,
}: CreateFolderDialogProps) {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            onSubmit(name.trim());
            setName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md gap-4 rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle>Create Virtual Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="folder_name_field">Folder Name</Label>
                    <Input
                        id="folder_name_field"
                        placeholder="e.g. branding, backups, banners"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <p className="text-muted-foreground text-xs">
                        Virtual folders help you organize media assets. Uploaded
                        files can be assigned to this folder.
                    </p>
                </div>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setName('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!name.trim()}>
                        Create Folder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
