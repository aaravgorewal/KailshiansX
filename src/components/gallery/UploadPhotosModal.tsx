// src/components/gallery/UploadPhotosModal.tsx
// Admin modal for uploading photos directly to S3-compatible storage using presigned URLs

"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/useToast";

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

  // State is reset automatically when isOpen becomes false because the component returns null (unmounts)

  if (!isOpen) return null;

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: QueuedFile[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        status: "pending",
      }));

    if (newFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please select image files (JPEG, PNG, WebP).",
        variant: "destructive",
      });
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

        const { uploadUrl, fileUrl } = await presignedRes.json();

        // Step 2: Directly upload binary blob to S3 via presigned PUT
        const uploadRes = await fetch(uploadUrl, {
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
          url: fileUrl,
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="bg-surface-950/80 animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm duration-200"
    >
      <div className="border-surface-800 bg-surface-900 relative w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-surface-800/80 flex items-center justify-between border-b p-5 sm:p-6">
          <div>
            <h2 id="upload-modal-title" className="text-surface-50 text-lg font-bold">
              Upload Photos to Album
            </h2>
            <p className="text-surface-400 mt-0.5 text-xs">
              Target: <span className="text-brand-300 font-medium">{albumTitle}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="text-surface-400 hover:bg-surface-800 rounded-lg p-2 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5 sm:p-6">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesAdded(e.dataTransfer.files);
            }}
            className="group border-surface-700/80 bg-surface-950/50 hover:border-brand-500/50 hover:bg-surface-950/80 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilesAdded(e.target.files)}
            />
            <div className="border-brand-500/20 bg-brand-500/10 text-brand-400 flex size-12 items-center justify-center rounded-xl border transition-transform group-hover:scale-110">
              <UploadCloud className="size-6" />
            </div>
            <p className="text-surface-200 mt-3 text-sm font-semibold">
              Click to select or drag and drop photos
            </p>
            <p className="text-surface-400 mt-1 text-xs">
              PNG, JPG, WebP supported • Direct S3 presigned upload
            </p>
          </div>

          {/* Queue List */}
          {queuedFiles.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-surface-300 flex items-center justify-between text-xs font-semibold">
                <span>Selected Photos ({queuedFiles.length})</span>
                {isUploading && (
                  <span className="text-brand-300">
                    Uploaded {uploadProgress.completed} of {uploadProgress.total}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {queuedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-surface-800 bg-surface-950/60 flex items-center gap-3 rounded-xl border p-2.5 text-xs"
                  >
                    <div className="border-surface-800 bg-surface-900 relative size-12 shrink-0 overflow-hidden rounded-lg border">
                      <Image src={item.previewUrl} alt="Preview" fill className="object-cover" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => updateCaption(idx, e.target.value)}
                        placeholder="Add caption / label"
                        disabled={isUploading}
                        className="border-surface-800 bg-surface-900 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-md border px-2.5 py-1 text-xs focus:outline-none"
                      />
                      <div className="text-surface-400 flex items-center gap-2 font-mono text-[10px]">
                        <span>{(item.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        <span className="max-w-[200px] truncate">{item.file.name}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {item.status === "uploading" && (
                        <Loader2 className="text-brand-400 size-4 animate-spin" />
                      )}
                      {item.status === "success" && (
                        <CheckCircle2 className="size-4 text-emerald-400" />
                      )}
                      {item.status === "error" && (
                        <span title={item.error}>
                          <AlertCircle className="size-4 text-rose-400" />
                        </span>
                      )}
                      {item.status === "pending" && !isUploading && (
                        <button
                          type="button"
                          onClick={() => removeQueuedFile(idx)}
                          className="text-surface-500 rounded p-1 hover:text-rose-400"
                          aria-label="Remove"
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
        <div className="border-surface-800/80 bg-surface-950/40 flex items-center justify-between border-t p-4 sm:p-5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="default"
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
      </div>
    </div>
  );
}
