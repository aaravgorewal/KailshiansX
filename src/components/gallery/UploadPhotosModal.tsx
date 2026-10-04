// src/components/gallery/UploadPhotosModal.tsx
// Admin modal for uploading photos directly to S3-compatible storage using presigned URLs

"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";

interface UploadPhotosModalProps {
  albumId: string;
  albumTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void;
}

interface QueuedFile {
  file: File;
  previewUrl: string;
  caption: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface PresignedResponse {
  uploadUrl: string;
  fileUrl: string;
}

export function UploadPhotosModal({
  albumId,
  albumTitle,
  isOpen,
  onClose,
  onUploaded,
}: UploadPhotosModalProps) {
  const [queuedFiles, setQueuedFiles] = React.useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState({ completed: 0, total: 0 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    const oversized = Array.from(files).filter((file) => file.size > MAX_SIZE);
    if (oversized.length > 0) {
      toast({
        title: "File size limit exceeded",
        description: `Files must be under 10MB. Skipped: ${oversized
          .map((f) => f.name)
          .slice(0, 3)
          .join(", ")}`,
        variant: "destructive",
      });
    }

    const newFiles: QueuedFile[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/") && file.size <= MAX_SIZE)
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        status: "pending",
      }));

    if (newFiles.length === 0) {
      if (oversized.length === 0) {
        toast({
          title: "Invalid file type",
          description: "Please select image files (JPEG, PNG, WebP, AVIF).",
          variant: "destructive",
        });
      }
      return;
    }

    setQueuedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeQueuedFile = (index: number) => {
    setQueuedFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateCaption = (index: number, newCaption: string) => {
    setQueuedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, caption: newCaption } : item))
    );
  };

  const handleUploadAll = async () => {
    if (queuedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadProgress({ completed: 0, total: queuedFiles.length });

    const uploadedPayload: { url: string; caption: string; altText: string }[] = [];

    for (let i = 0; i < queuedFiles.length; i++) {
      const item = queuedFiles[i];

      // Update item status
      setQueuedFiles((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: "uploading" } : q))
      );

      try {
        // Step 1: Request presigned S3 upload URL from API
        const presignedRes = await fetch("/api/gallery/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            albumId,
            filename: item.file.name,
            contentType: item.file.type || "image/jpeg",
          }),
        });

        if (!presignedRes.ok) {
          throw new Error("Failed to get presigned upload URL from server");
        }

        const data: PresignedResponse = await presignedRes.json();

        // Step 2: Directly upload binary blob to S3 via presigned PUT
        const uploadRes = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": item.file.type || "image/jpeg",
          },
          body: item.file,
        });

        if (!uploadRes.ok) {
          throw new Error(`Storage upload failed with status ${uploadRes.status}`);
        }

        uploadedPayload.push({
          url: data.fileUrl,
          caption: item.caption,
          altText: item.caption,
        });

        setQueuedFiles((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: "success" } : q))
        );
      } catch (err: unknown) {
        console.error(`Error uploading ${item.file.name}:`, err);
        const errMsg = err instanceof Error ? err.message : "Upload failed";
        setQueuedFiles((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: "error", error: errMsg } : q))
        );
      } finally {
        setUploadProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      }
    }

    // Step 3: Register all successfully uploaded images in database
    if (uploadedPayload.length > 0) {
      try {
        const saveRes = await fetch("/api/gallery/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            albumId,
            images: uploadedPayload,
          }),
        });

        if (!saveRes.ok) {
          throw new Error("Failed to register images in database");
        }

        toast({
          title: "Upload complete!",
          description: `Successfully added ${uploadedPayload.length} photos to ${albumTitle}.`,
        });

        router.refresh();
        if (onUploaded) onUploaded();
        setTimeout(() => onClose(), 1200);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Failed to commit uploaded photos to database.";
        toast({
          title: "Save error",
          description: errMsg,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
  };

  const uploadPercent =
    uploadProgress.total > 0
      ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUploading && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden p-6">
        <DialogHeader>
          <DialogTitle>Upload Photos to Album</DialogTitle>
          <DialogDescription>
            Target album: <span className="text-foreground font-medium">{albumTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar (bg-primary) */}
        {isUploading && (
          <div className="space-y-1.5 py-1">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>Uploading photos...</span>
              <span>
                {uploadProgress.completed} of {uploadProgress.total} ({uploadPercent}%)
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesAdded(e.dataTransfer.files);
            }}
            className="group border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/70 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilesAdded(e.target.files)}
            />
            <div className="border-border bg-card text-muted-foreground group-hover:text-primary flex size-12 items-center justify-center rounded-lg border transition-colors">
              <UploadCloud className="size-6" />
            </div>
            <p className="text-foreground mt-3 text-xs font-semibold">
              Click to select or drag and drop photos
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              PNG, JPG, WebP supported • Direct presigned upload
            </p>
          </div>

          {/* Queue List */}
          {queuedFiles.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-foreground flex items-center justify-between text-xs font-medium">
                <span>Selected Photos ({queuedFiles.length})</span>
              </div>

              <div className="space-y-2">
                {queuedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-border bg-card flex items-center gap-3 rounded-lg border p-2.5 text-xs"
                  >
                    <div className="border-border bg-muted relative size-12 shrink-0 overflow-hidden rounded border">
                      <Image src={item.previewUrl} alt="Preview" fill className="object-cover" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => updateCaption(idx, e.target.value)}
                        placeholder="Add caption / label"
                        disabled={isUploading}
                        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded border px-2.5 py-1 text-xs focus:outline-none"
                      />
                      <div className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
                        <span>{(item.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        <span className="max-w-[200px] truncate">{item.file.name}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {item.status === "uploading" && (
                        <Loader2 className="text-primary size-4 animate-spin" />
                      )}
                      {item.status === "success" && (
                        <CheckCircle2 className="text-success size-4" />
                      )}
                      {item.status === "error" && (
                        <span
                          title={item.error}
                          className="text-destructive flex items-center gap-1"
                        >
                          <AlertCircle className="size-4" />
                          <span className="text-xs">Failed</span>
                        </span>
                      )}
                      {item.status === "pending" && !isUploading && (
                        <button
                          type="button"
                          onClick={() => removeQueuedFile(idx)}
                          className="text-muted-foreground hover:text-destructive rounded p-1"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-between border-t pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={queuedFiles.length === 0 || isUploading}
            onClick={handleUploadAll}
            isLoading={isUploading}
            leftIcon={<UploadCloud className="size-4" />}
          >
            {isUploading
              ? `Uploading (${uploadProgress.completed}/${uploadProgress.total})...`
              : `Upload ${queuedFiles.length} Photos`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
