"use client";

// src/components/profile/ProfileEditForm.tsx
// Profile settings and Developer Passport customization form.

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, AlertCircle, Sparkles } from "lucide-react";
import type { DeveloperPassportData } from "@/server/users/passport";

interface Props {
  user: DeveloperPassportData["user"];
  onSaved?: () => void;
}

export function ProfileEditForm({ user, onSaved }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [headline, setHeadline] = useState(user.headline || "");
  const [bio, setBio] = useState(user.bio || "");
  const [github, setGithub] = useState(user.github || "");
  const [linkedin, setLinkedin] = useState(user.linkedin || "");
  const [twitter, setTwitter] = useState(user.twitter || "");
  const [website, setWebsite] = useState(user.website || "");
  const [skillsStr, setSkillsStr] = useState((user.skills || []).join(", "));
  const [isPassportPublic, setIsPassportPublic] = useState(user.isPassportPublic);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          headline,
          bio,
          github,
          linkedin,
          twitter,
          website,
          skills,
          isPassportPublic,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      router.refresh();
      if (onSaved) onSaved();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-surface-800 bg-surface-900/60 space-y-6 rounded-2xl border p-6 shadow-xl backdrop-blur-xl"
    >
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <Sparkles className="text-brand-400 h-5 w-5" />
          Developer Passport & Profile Settings
        </h3>
        <p className="text-surface-400 mt-1 text-sm">
          Customize your public developer persona, social links, technical skills, and privacy.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>Profile and passport settings updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">Full Name</label>
          <input
            type="text"
            id="input-profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-sm text-white transition-colors focus:outline-hidden"
            placeholder="Aarav Saini"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">
            Passport Handle (@username)
          </label>
          <div className="relative flex items-center">
            <span className="text-surface-500 absolute left-3.5 font-mono text-sm">@</span>
            <input
              type="text"
              id="input-profile-username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
              }
              className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-8 font-mono text-sm text-white transition-colors focus:outline-hidden"
              placeholder="aarav-saini"
              required
            />
          </div>
        </div>

        {/* Headline */}
        <div className="sm:col-span-2">
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">
            Professional Headline
          </label>
          <input
            type="text"
            id="input-profile-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-sm text-white transition-colors focus:outline-hidden"
            placeholder="Full Stack Engineer • Cloud Native Architect • Open Source Contributor"
          />
        </div>

        {/* Bio */}
        <div className="sm:col-span-2">
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">
            Developer Bio / Philosophy
          </label>
          <textarea
            id="input-profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-sm text-white transition-colors focus:outline-hidden"
            placeholder="Tell the community what you build, languages you love, and initiatives you are driving..."
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">
            GitHub Username or URL
          </label>
          <input
            type="text"
            id="input-profile-github"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-sm text-white transition-colors focus:outline-hidden"
            placeholder="aaravgorewal"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">
            LinkedIn Profile URL
          </label>
          <input
            type="text"
            id="input-profile-linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-sm text-white transition-colors focus:outline-hidden"
            placeholder="linkedin.com/in/aaravgorewal"
          />
        </div>

        {/* Twitter */}
        <div>
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">
            Twitter / X Handle
          </label>
          <input
            type="text"
            id="input-profile-twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-sm text-white transition-colors focus:outline-hidden"
            placeholder="@aaravgorewal"
          />
        </div>

        {/* Website */}
        <div>
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">
            Portfolio / Personal Site
          </label>
          <input
            type="text"
            id="input-profile-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-sm text-white transition-colors focus:outline-hidden"
            placeholder="https://aarav.dev"
          />
        </div>

        {/* Skills */}
        <div className="sm:col-span-2">
          <label className="text-surface-300 mb-1.5 block text-xs font-semibold">
            Technical Skills (comma-separated)
          </label>
          <input
            type="text"
            id="input-profile-skills"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            className="bg-surface-950/80 border-surface-800 placeholder-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-sm text-white transition-colors focus:outline-hidden"
            placeholder="TypeScript, Next.js, Rust, Docker, PostgreSQL, GraphQL"
          />
        </div>

        {/* Privacy Toggle Checkbox */}
        <div className="pt-2 sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              id="input-passport-public"
              checked={isPassportPublic}
              onChange={(e) => setIsPassportPublic(e.target.checked)}
              className="border-surface-700 bg-surface-950 text-brand-500 focus:ring-brand-500/20 h-4 w-4 rounded-md"
            />
            <div>
              <span className="block text-sm font-semibold text-white">
                Make Developer Passport Public
              </span>
              <span className="text-surface-400 block text-xs">
                Allows other builders and recruiters to view your verified achievements and timeline
                via your custom link.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="border-surface-800 flex justify-end border-t pt-4">
        <button
          type="submit"
          id="btn-save-profile"
          disabled={saving}
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
        </button>
      </div>
    </form>
  );
}
