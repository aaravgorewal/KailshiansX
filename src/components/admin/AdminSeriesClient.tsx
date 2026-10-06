// src/components/admin/AdminSeriesClient.tsx
// Universal Series Manager for Meetup Series (RaibarX, PadharoX, TricityX) and Hackathon Series (NirmanX, AarambhX).

"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { AdminDataTable, type ColumnDef } from "./AdminDataTable";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { createOrUpdateSeries, deleteSeries } from "@/server/admin/actions";
import { SeriesKind } from "@prisma/client";

export interface SeriesListItem {
  id: string;
  name: string;
  slug: string;
  kind: SeriesKind;
  tagline: string | null;
  description: string | null;
  city: string | null;
  region: string | null;
  coverImage: string | null;
  editionsCount: number;
}

interface AdminSeriesClientProps {
  initialSeries: SeriesListItem[];
  kind: SeriesKind;
}

export function AdminSeriesClient({ initialSeries, kind }: AdminSeriesClientProps) {
  const [seriesList, setSeriesList] = React.useState<SeriesListItem[]>(initialSeries);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingSeries, setEditingSeries] = React.useState<SeriesListItem | null>(null);

  // Form fields
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [city, setCity] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const isMeetup = kind === SeriesKind.MEETUP;
  const title = isMeetup ? "Meetup Series" : "Hackathon Series";
  const desc = isMeetup
    ? "Permanent regional chapters uniting backend engineers and founders across Rajasthan, Punjab, and Delhi-NCR."
    : "Flagship multi-day technical hackathons producing real deployed architectures and candidate dossiers.";

  const handleOpenCreate = () => {
    setEditingSeries(null);
    setName("");
    setSlug("");
    setTagline("");
    setDescription("");
    setCity("");
    setRegion("");
    setCoverImage("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SeriesListItem) => {
    setEditingSeries(item);
    setName(item.name);
    setSlug(item.slug);
    setTagline(item.tagline || "");
    setDescription(item.description || "");
    setCity(item.city || "");
    setRegion(item.region || "");
    setCoverImage(item.coverImage || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setIsSaving(true);
      const generatedSlug =
        slug.trim() ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const res = await createOrUpdateSeries({
        id: editingSeries?.id,
        name: name.trim(),
        slug: generatedSlug,
        kind,
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        city: city.trim() || null,
        region: region.trim() || null,
        coverImage: coverImage.trim() || null,
      });

      if (editingSeries) {
        setSeriesList((prev) =>
          prev.map((s) =>
            s.id === editingSeries.id
              ? {
                  ...s,
                  name: res.series.name,
                  slug: res.series.slug,
                  tagline: res.series.tagline,
                  description: res.series.description,
                  city: res.series.city,
                  region: res.series.region,
                  coverImage: res.series.coverImage,
                }
              : s
          )
        );
      } else {
        setSeriesList((prev) => [
          ...prev,
          {
            id: res.series.id,
            name: res.series.name,
            slug: res.series.slug,
            kind: res.series.kind,
            tagline: res.series.tagline,
            description: res.series.description,
            city: res.series.city,
            region: res.series.region,
            coverImage: res.series.coverImage,
            editionsCount: 0,
          },
        ]);
      }

      setModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save series");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this series?")) return;
    try {
      await deleteSeries(id);
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete series");
    }
  };

  const columns: ColumnDef<SeriesListItem>[] = [
    {
      header: "Series Name",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-foreground block text-xs font-bold">{item.name}</span>
          <span className="text-muted-foreground font-mono text-xs">
            {isMeetup ? `/meetup-series/${item.slug}` : `/hackathon-series/${item.slug}`}
          </span>
        </div>
      ),
    },
    {
      header: "Tagline",
      accessorKey: "tagline",
      sortable: true,
      cell: (item) => (
        <span className="text-muted-foreground block max-w-xs truncate text-xs">
          {item.tagline || "—"}
        </span>
      ),
    },
    {
      header: "Region / City",
      cell: (item) => (
        <span className="text-muted-foreground text-xs">
          {item.city ? `${item.city} (${item.region ?? "India"})` : (item.region ?? "National")}
        </span>
      ),
    },
    {
      header: "Editions",
      accessorKey: "editionsCount",
      sortable: true,
      cell: (item) => (
        <span className="text-primary text-xs font-bold">
          {item.editionsCount} {item.editionsCount === 1 ? "edition" : "editions"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEdit(item)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1"
            title="Edit series"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Link
            href={isMeetup ? `/meetup-series/${item.slug}` : `/hackathon-series/${item.slug}`}
            target="_blank"
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1.5"
            title="Preview public series page"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-destructive hover:bg-destructive/10 rounded p-1"
            title="Delete series"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">{desc}</p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="bg-primary-hover hover:bg-primary flex items-center gap-1.5 self-start text-xs font-bold text-white shadow-md sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New {isMeetup ? "Meetup Series" : "Hackathon Series"}</span>
        </Button>
      </div>

      <AdminDataTable
        data={seriesList}
        columns={columns}
        searchPlaceholder={`Search ${isMeetup ? "meetup" : "hackathon"} series...`}
        exportFilename={`kailshiansx_${isMeetup ? "meetup" : "hackathon"}_series.csv`}
        pageSize={15}
        emptyMessage="No series found."
      />

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSeries ? `Edit ${editingSeries.name}` : `Create New ${title}`}
        description="Configure series metadata, regional chapters, and brand identity"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              Series Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingSeries) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }
              }}
              placeholder={isMeetup ? "e.g. RaibarX" : "e.g. NirmanX"}
              className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              URL Slug <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
              placeholder="raibarx"
              className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. The premier Uttarakhand systems engineering meetup"
              className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                Primary City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dehradun / Jaipur"
                className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                Region / State
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Uttarakhand / Rajasthan"
                className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the constitutional purpose and builder community behind this series..."
              className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 text-xs"
            />
          </div>

          <div className="border-border flex justify-end gap-2 border-t pt-2">
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
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-hover hover:bg-primary text-xs text-white"
            >
              {isSaving ? "Saving..." : "Save Series"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
