// src/components/admin/AdminTechTalksClient.tsx
// Tech Talks Manager with knowledge archive resource editor and CSV export.

"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Video, ExternalLink, Edit2, Plus } from "lucide-react";
import { GithubIcon } from "@/components/ui/social-icons";
import { AdminDataTable, type ColumnDef } from "./AdminDataTable";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { updateTechTalkResource } from "@/server/admin/actions";
import { formatDate } from "@/lib/utils";

export interface TechTalkListItem {
  id: string;
  title: string;
  slug: string;
  speakerName: string;
  speakerOrg: string | null;
  startDate: string;
  slideUrl: string | null;
  videoUrl: string | null;
  repoUrl: string | null;
  keyTakeaways: string[];
  tags: string[];
}

interface AdminTechTalksClientProps {
  initialTalks: TechTalkListItem[];
}

export function AdminTechTalksClient({ initialTalks }: AdminTechTalksClientProps) {
  const [talks, setTalks] = React.useState<TechTalkListItem[]>(initialTalks);
  const [selectedTalk, setSelectedTalk] = React.useState<TechTalkListItem | null>(null);

  // Modal edit fields
  const [slideUrl, setSlideUrl] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [repoUrl, setRepoUrl] = React.useState("");
  const [keyTakeawaysStr, setKeyTakeawaysStr] = React.useState("");
  const [tagsStr, setTagsStr] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleOpenEdit = (talk: TechTalkListItem) => {
    setSelectedTalk(talk);
    setSlideUrl(talk.slideUrl || "");
    setVideoUrl(talk.videoUrl || "");
    setRepoUrl(talk.repoUrl || "");
    setKeyTakeawaysStr(talk.keyTakeaways.join("\n"));
    setTagsStr(talk.tags.join(", "));
  };

  const handleSaveResources = async () => {
    if (!selectedTalk) return;
    try {
      setIsSaving(true);
      const takeaways = keyTakeawaysStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const tags = tagsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await updateTechTalkResource(selectedTalk.id, {
        slideUrl: slideUrl.trim() || null,
        videoUrl: videoUrl.trim() || null,
        repoUrl: repoUrl.trim() || null,
        keyTakeaways: takeaways,
        tags,
      });

      setTalks((prev) =>
        prev.map((t) =>
          t.id === selectedTalk.id
            ? {
                ...t,
                slideUrl: slideUrl.trim() || null,
                videoUrl: videoUrl.trim() || null,
                repoUrl: repoUrl.trim() || null,
                keyTakeaways: takeaways,
                tags,
              }
            : t
        )
      );

      setSelectedTalk(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save resources");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<TechTalkListItem>[] = [
    {
      header: "Talk Title",
      accessorKey: "title",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-100 block text-xs font-bold">{item.title}</span>
          <span className="text-surface-500 font-mono text-[11px]">/tech-talks/{item.slug}</span>
        </div>
      ),
    },
    {
      header: "Speaker",
      accessorKey: "speakerName",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-200 text-xs font-semibold">{item.speakerName}</span>
          {item.speakerOrg && <p className="text-surface-400 text-[11px]">@ {item.speakerOrg}</p>}
        </div>
      ),
    },
    {
      header: "Knowledge Archive",
      cell: (item) => (
        <div className="flex items-center gap-2">
          {item.slideUrl && (
            <a
              href={item.slideUrl}
              target="_blank"
              className="text-brand-400 hover:text-brand-300"
              title="Slides"
            >
              <FileText className="h-4 w-4" />
            </a>
          )}
          {item.videoUrl && (
            <a
              href={item.videoUrl}
              target="_blank"
              className="text-purple-400 hover:text-purple-300"
              title="Recording"
            >
              <Video className="h-4 w-4" />
            </a>
          )}
          {item.repoUrl && (
            <a
              href={item.repoUrl}
              target="_blank"
              className="text-surface-200 hover:text-surface-50"
              title="Code Repository"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          )}
          {!item.slideUrl && !item.videoUrl && !item.repoUrl && (
            <span className="text-surface-500 text-[11px] italic">No resources attached</span>
          )}
        </div>
      ),
    },
    {
      header: "Tags",
      cell: (item) => (
        <div className="flex max-w-[200px] flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-surface-800 text-surface-300 rounded px-1.5 py-0.5 text-[10px]"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-surface-500 text-[10px]">+{item.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "startDate",
      sortable: true,
      sortAccessor: (item) => new Date(item.startDate).getTime(),
      cell: (item) => (
        <span className="text-surface-400 text-xs">{formatDate(item.startDate)}</span>
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
            className="border-surface-700 bg-surface-900 text-surface-200 flex items-center gap-1 text-xs"
          >
            <Edit2 className="h-3 w-3" /> Resources
          </Button>
          <Link
            href={`/tech-talks/${item.slug}`}
            target="_blank"
            className="text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded p-1.5"
            title="Preview public talk page"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-surface-50 text-2xl font-bold">Tech Talks & Post-Event Archive</h1>
          <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
            Production engineering deep-dives, slide decks, video recordings, and takeaway dossiers.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 flex items-center gap-1.5 self-start rounded-lg px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Tech Talk</span>
        </Link>
      </div>

      <AdminDataTable
        data={talks}
        columns={columns}
        searchPlaceholder="Search tech talks by topic, speaker, tag..."
        exportFilename="kailshiansx_tech_talks.csv"
        pageSize={15}
        emptyMessage="No tech talks found matching criteria."
      />

      {/* Edit Knowledge Archive Modal */}
      <AdminModal
        isOpen={Boolean(selectedTalk)}
        onClose={() => setSelectedTalk(null)}
        title="Edit Post-Event Knowledge Resources"
        description={`Artifacts for "${selectedTalk?.title}"`}
        maxWidth="lg"
      >
        {selectedTalk && (
          <div className="space-y-4">
            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Slide Deck URL
              </label>
              <input
                type="url"
                value={slideUrl}
                onChange={(e) => setSlideUrl(e.target.value)}
                placeholder="https://speakerdeck.com/... or Google Slides link"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Recording Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Code Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Key Takeaways (one per line)
              </label>
              <textarea
                rows={4}
                value={keyTakeawaysStr}
                onChange={(e) => setKeyTakeawaysStr(e.target.value)}
                placeholder="Distributed lock leases reduce split-brain risks&#10;Write-ahead logging patterns in Raft"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="Rust, System Design, Concurrency, Microservices"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
              />
            </div>

            <div className="border-surface-800 flex justify-end gap-2 border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTalk(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveResources}
                disabled={isSaving}
                className="text-xs"
              >
                {isSaving ? "Saving..." : "Save Resources"}
              </Button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
