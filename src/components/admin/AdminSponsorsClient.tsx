// src/components/admin/AdminSponsorsClient.tsx
// Sponsors & Partners directory with logo management, category filters, and CSV export.

"use client";

import * as React from "react";
import Image from "next/image";
import { Building2, Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createOrUpdatePartner, deletePartner } from "@/server/admin/actions";

export interface SponsorListItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  category: string | null;
  eventsCount: number;
}

interface AdminSponsorsClientProps {
  initialSponsors: SponsorListItem[];
}

export function AdminSponsorsClient({ initialSponsors }: AdminSponsorsClientProps) {
  const [sponsors, setSponsors] = React.useState<SponsorListItem[]>(initialSponsors);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingSponsor, setEditingSponsor] = React.useState<SponsorListItem | null>(null);

  // Form state
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [logo, setLogo] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [category, setCategory] = React.useState("brand");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleOpenCreate = () => {
    setEditingSponsor(null);
    setName("");
    setSlug("");
    setLogo("");
    setWebsite("");
    setCategory("brand");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SponsorListItem) => {
    setEditingSponsor(item);
    setName(item.name);
    setSlug(item.slug);
    setLogo(item.logo || "");
    setWebsite(item.website || "");
    setCategory(item.category || "brand");
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

      const res = await createOrUpdatePartner({
        id: editingSponsor?.id,
        name: name.trim(),
        slug: generatedSlug,
        logo: logo.trim() || null,
        website: website.trim() || null,
        category,
      });

      if (editingSponsor) {
        setSponsors((prev) =>
          prev.map((s) =>
            s.id === editingSponsor.id
              ? {
                  ...s,
                  name: res.partner.name,
                  slug: res.partner.slug,
                  logo: res.partner.logo,
                  website: res.partner.website,
                  category: res.partner.category,
                }
              : s
          )
        );
      } else {
        setSponsors((prev) => [
          ...prev,
          {
            id: res.partner.id,
            name: res.partner.name,
            slug: res.partner.slug,
            logo: res.partner.logo,
            website: res.partner.website,
            category: res.partner.category,
            eventsCount: 0,
          },
        ]);
      }

      setModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save partner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    try {
      await deletePartner(id);
      setSponsors((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete partner");
    }
  };

  const columns: ColumnDef<SponsorListItem>[] = [
    {
      header: "Partner",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="bg-muted border-border flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
            {item.logo ? (
              <Image
                src={item.logo}
                alt={item.name}
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            ) : (
              <Building2 className="text-muted-foreground h-4 w-4" />
            )}
          </div>
          <div>
            <span className="text-foreground block text-xs font-bold">{item.name}</span>
            <span className="text-muted-foreground font-mono text-xs">{item.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (item) => (
        <Badge variant="outline" size="sm" className="text-xs capitalize">
          {item.category || "General"}
        </Badge>
      ),
    },
    {
      header: "Website",
      cell: (item) =>
        item.website ? (
          <a
            href={item.website}
            target="_blank"
            className="text-primary hover:text-primary flex max-w-[200px] items-center gap-1 truncate text-xs"
          >
            <span>{item.website.replace(/^https?:\/\//, "")}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: "Events Sponsored",
      accessorKey: "eventsCount",
      sortable: true,
      cell: (item) => (
        <span className="text-foreground font-mono text-xs font-bold">
          {item.eventsCount} events
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
            title="Edit partner"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-destructive hover:bg-destructive/10 rounded p-1"
            title="Delete partner"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filters: FilterConfig<SponsorListItem>[] = [
    {
      label: "Category",
      key: "category",
      options: [
        { label: "Corporate Brand", value: "brand" },
        { label: "Community", value: "community" },
        { label: "College", value: "college" },
        { label: "Venue", value: "venue" },
        { label: "Media", value: "media" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Sponsors & Global Partners</h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Ecosystem partners backing hackathons, meetup tracks, and developer scholarships.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="bg-primary-hover hover:bg-primary flex items-center gap-1.5 self-start text-xs font-bold text-white shadow-md sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Partner</span>
        </Button>
      </div>

      <AdminDataTable
        data={sponsors}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search partner name, category, website..."
        exportFilename="kailshiansx_sponsors.csv"
        pageSize={15}
        emptyMessage="No partners found."
      />

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSponsor ? `Edit ${editingSponsor.name}` : "Add Partner"}
        description="Configure partner details and global branding"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              Partner / Brand Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingSponsor) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }
              }}
              placeholder="e.g. AWS, Razorpay, GitHub"
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
              placeholder="razorpay"
              className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 text-xs"
            >
              <option value="brand">Corporate Tech Brand</option>
              <option value="community">Developer Community</option>
              <option value="college">Academic Institution</option>
              <option value="venue">Venue Partner</option>
              <option value="media">Media & Press</option>
            </select>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              Logo URL
            </label>
            <input
              type="url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://... logo image URL"
              className="bg-background border-border text-foreground w-full rounded-lg border p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
              Website URL
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company.com"
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
              {isSaving ? "Saving..." : "Save Partner"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
