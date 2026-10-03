// src/components/admin/AdminCommunityClient.tsx
// Community directory with cities, regional chapters, lead counts, and CSV export.

"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { AdminDataTable, type ColumnDef } from "./AdminDataTable";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { createCity } from "@/server/admin/actions";

export interface CityListItem {
  id: string;
  name: string;
  state: string;
  country: string;
  collegesCount: number;
  campusLeadsCount: number;
  stateLeadsCount: number;
  eventsCount: number;
}

interface AdminCommunityClientProps {
  initialCities: CityListItem[];
}

export function AdminCommunityClient({ initialCities }: AdminCommunityClientProps) {
  const [cities, setCities] = React.useState<CityListItem[]>(initialCities);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [cityName, setCityName] = React.useState("");
  const [stateName, setStateName] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleCreateCity = async () => {
    if (!cityName.trim() || !stateName.trim()) return;
    try {
      setIsSaving(true);
      const res = await createCity(cityName.trim(), stateName.trim());
      setCities((prev) => [
        ...prev,
        {
          id: res.city.id,
          name: res.city.name,
          state: res.city.state,
          country: "India",
          collegesCount: 0,
          campusLeadsCount: 0,
          stateLeadsCount: 0,
          eventsCount: 0,
        },
      ]);
      setModalOpen(false);
      setCityName("");
      setStateName("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to add city");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<CityListItem>[] = [
    {
      header: "City",
      accessorKey: "name",
      sortable: true,
      cell: (item) => <span className="text-surface-100 text-xs font-bold">{item.name}</span>,
    },
    {
      header: "State / Region",
      accessorKey: "state",
      sortable: true,
      cell: (item) => <span className="text-surface-300 text-xs">{item.state}</span>,
    },
    {
      header: "Colleges",
      accessorKey: "collegesCount",
      sortable: true,
      cell: (item) => (
        <span className="text-surface-300 font-mono text-xs">{item.collegesCount}</span>
      ),
    },
    {
      header: "Campus Leads",
      accessorKey: "campusLeadsCount",
      sortable: true,
      cell: (item) => (
        <span className="text-brand-400 font-mono text-xs font-bold">{item.campusLeadsCount}</span>
      ),
    },
    {
      header: "Events Hosted",
      accessorKey: "eventsCount",
      sortable: true,
      cell: (item) => (
        <span className="font-mono text-xs font-bold text-purple-400">{item.eventsCount}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-surface-50 text-2xl font-bold">Community & Regional Chapters</h1>
          <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
            Geographic directory of collegiate chapters, campus fellows, and Tier-2/Tier-3 city
            summits.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 flex items-center gap-1.5 self-start text-xs font-bold text-white shadow-md sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Regional City</span>
        </Button>
      </div>

      <AdminDataTable
        data={cities}
        columns={columns}
        searchPlaceholder="Search cities, states..."
        exportFilename="kailshiansx_community_cities.csv"
        pageSize={15}
        emptyMessage="No regional cities found."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Regional Chapter City"
        description="Register a new city for campus fellowships and meetup chapters"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-surface-300 mb-1 block text-xs font-semibold">
              City Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g. Udaipur, Amritsar, Noida"
              className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="text-surface-300 mb-1 block text-xs font-semibold">
              State / UT <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="e.g. Rajasthan, Punjab, Uttar Pradesh"
              className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
            />
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
              onClick={handleCreateCity}
              disabled={isSaving}
              className="bg-brand-600 hover:bg-brand-500 text-xs text-white"
            >
              {isSaving ? "Saving..." : "Add City"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
