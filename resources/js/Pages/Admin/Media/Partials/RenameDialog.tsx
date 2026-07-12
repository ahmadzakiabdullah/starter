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

interface RenameDialogProps {
    open: boolean;
    value: string;
    onValueChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function RenameDialog({
    open,
    value,
    onValueChange,
    onSave,
    onCancel,
}: RenameDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="max-w-md gap-4 rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle>Rename Asset File</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="rename_input_field">Asset Name</Label>
                    <Input
                        id="rename_input_field"
                        value={value}
                        onChange={(e) => onValueChange(e.target.value)}
                    />
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={onSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
