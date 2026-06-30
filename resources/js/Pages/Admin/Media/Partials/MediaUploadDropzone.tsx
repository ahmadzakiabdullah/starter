import { UploadCloud } from 'lucide-react';

interface MediaUploadDropzoneProps {
    dragActive: boolean;
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MediaUploadDropzone({
    dragActive,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileChange,
}: MediaUploadDropzoneProps) {
    return (
        <div
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive
                    ? 'border-primary bg-primary/5 text-primary scale-[0.99] shadow-inner'
                    : 'border-muted bg-card hover:border-muted-foreground/30'
            }`}
        >
            <input type="file" id="file_upload_input" className="hidden" onChange={onFileChange} />
            <UploadCloud className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60 animate-bounce-slow" />
            <p className="text-sm font-semibold text-foreground">Drag and drop files here</p>
            <p className="text-xs text-muted-foreground mt-1">
                Or{' '}
                <label htmlFor="file_upload_input" className="text-primary hover:underline font-semibold cursor-pointer">
                    browse file
                </label>{' '}
                to upload. Max size: 10MB.
            </p>
        </div>
    );
}
