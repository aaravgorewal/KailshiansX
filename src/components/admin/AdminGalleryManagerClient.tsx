// src/components/admin/AdminGalleryManagerClient.tsx
// Gallery album manager with category filters, publish toggle, new album modal, and CSV export.

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  Upload,
} from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createAlbum, toggleAlbumPublish, deleteAlbum } from "@/server/admin/actions";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
import { formatDate } from "@/lib/utils";

export interface GalleryAlbumListItem {
  id: string;
  title: string;
  category: string;
  coverImage: string | null;
  isPublished: boolean;
  imagesCount: number;
  eventTitle: string | null;
  createdAt: string;
}

interface AdminGalleryManagerClientProps {
  initialAlbums: GalleryAlbumListItem[];
  events: { id: string; title: string }[];
}

export function AdminGalleryManagerClient({
  initialAlbums,
  events,
}: AdminGalleryManagerClientProps) {
  const [albums, setAlbums] = React.useState<GalleryAlbumListItem[]>(initialAlbums);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  // Form fields
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("meetup");
  const [eventId, setEventId] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [isPublished, setIsPublished] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      setLoadingId(id);
      await toggleAlbumPublish(id, !current);
      setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, isPublished: !current } : a)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to toggle album publication");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this album and its photos?")) return;
    try {
      setLoadingId(id);
      await deleteAlbum(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete album");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreateAlbum = async () => {
    if (!title.trim()) return;
    try {
      setIsSaving(true);
      const res = await createAlbum({
        title: title.trim(),
        category,
        eventId: eventId || null,
        coverImage: coverImage.trim() || null,
        isPublished,
      });

      const selectedEvent = events.find((e) => e.id === eventId);

      setAlbums((prev) => [
        {
          id: res.albumId,
          title: title.trim(),
          category,
          coverImage: coverImage.trim() || null,
          isPublished,
          imagesCount: 0,
          eventTitle: selectedEvent?.title ?? null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setModalOpen(false);
      setTitle("");
      setCoverImage("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create album");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<GalleryAlbumListItem>[] = [
    {
      header: "Album",
      accessorKey: "title",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="bg-surface-800 border-surface-700 relative h-9 w-12 flex-shrink-0 overflow-hidden rounded-lg border">
            {item.coverImage ? (
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="text-surface-500 flex h-full w-full items-center justify-center">
                <ImageIcon className="h-4 w-4" />
              </div>
            )}
          </div>
          <div>
            <span className="text-surface-100 block text-xs font-bold">{item.title}</span>
            {item.eventTitle && (
              <span className="text-surface-400 block max-w-[200px] truncate text-[11px]">
                {item.eventTitle}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (item) => (
        <Badge variant="outline" size="sm" className="text-[10px] uppercase">
          {item.category}
        </Badge>
      ),
    },
    {
      header: "Photos",
      accessorKey: "imagesCount",
      sortable: true,
      cell: (item) => (
        <span className="text-brand-400 font-mono text-xs font-bold">
          {item.imagesCount} photos
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isPublished",
      sortable: true,
      cell: (item) => (
        <Badge variant={item.isPublished ? "success" : "default"} size="sm">
          {item.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      sortable: true,
      sortAccessor: (item) => new Date(item.createdAt).getTime(),
      cell: (item) => (
        <span className="text-surface-400 text-xs">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      header: "Actions",
      cell: (item) => {
        const isBusy = loadingId === item.id;

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleTogglePublish(item.id, item.isPublished)}
              disabled={isBusy}
              title={item.isPublished ? "Unpublish album" : "Publish album"}
              className="text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded p-1 disabled:opacity-40"
            >
              {item.isPublished ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-amber-400" />
              )}
            </button>

            <Link
              href={`/gallery/${item.id}`}
              className="text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded p-1.5"
              title="Manage photos in album"
            >
              <Upload className="h-3.5 w-3.5" />
            </Link>

            <Link
              href={`/gallery/${item.id}`}
              target="_blank"
              className="text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded p-1.5"
              title="View public gallery album"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => handleDelete(item.id)}
              disabled={isBusy}
              className="rounded p-1 text-red-400 hover:bg-red-950/40 hover:text-red-300 disabled:opacity-40"
              title="Delete album"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const filters: FilterConfig<GalleryAlbumListItem>[] = [
    {
      label: "Category",
      key: "category",
      options: GALLERY_CATEGORIES.map((c) => ({ label: c.label, value: c.key })),
    },
    {
      label: "Status",
      key: (item) => (item.isPublished ? "PUBLISHED" : "DRAFT"),
      options: [
        { label: "Published", value: "PUBLISHED" },
        { label: "Draft", value: "DRAFT" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-surface-50 text-2xl font-bold">Gallery Album Manager</h1>
          <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
            Event photo albums, behind-the-scenes assets, S3 presigned bulk uploads, and zip
            downloads.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 flex items-center gap-1.5 self-start text-xs font-bold text-white shadow-md sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Album</span>
        </Button>
      </div>

      <AdminDataTable
        data={albums}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search album title, category..."
        exportFilename="kailshiansx_gallery_albums.csv"
        pageSize={15}
        emptyMessage="No gallery albums found."
      />

      {/* Create Album Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Photo Album"
        description="Initialize a new event gallery album for high-resolution attendee photos"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-surface-300 mb-1 block text-xs font-semibold">
              Album Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NirmanX 2025 Flagship Hackathon Highlights"
              className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
              >
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Associated Event
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
              >
                <option value="">General Community</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-surface-300 mb-1 block text-xs font-semibold">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="albumPub"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="border-surface-700 bg-surface-950 text-brand-600 focus:ring-brand-500 h-4 w-4 rounded"
            />
            <label htmlFor="albumPub" className="text-surface-200 cursor-pointer text-xs">
              Publish album immediately to public /gallery
            </label>
          </div>

          <div className="border-surface-800 flex justify-end gap-2 border-t pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateAlbum}
              disabled={isSaving}
              className="bg-brand-600 hover:bg-brand-500 text-xs text-white"
            >
              {isSaving ? "Creating..." : "Create Album"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
