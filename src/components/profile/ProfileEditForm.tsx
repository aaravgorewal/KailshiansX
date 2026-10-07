"use client";

// src/components/profile/ProfileEditForm.tsx
// Profile settings and Developer Passport customization form.

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, AlertCircle, Zap } from "lucide-react";
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
      className="border-border bg-card space-y-6 rounded-2xl border p-6 shadow-xl backdrop-blur-xl"
    >
      <div>
        <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
          <Zap className="text-primary h-5 w-5" />
          Developer Passport & Profile Settings
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Customize your public developer persona, social links, technical skills, and privacy.
        </p>
      </div>

      {error && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl border p-3 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="border-success/20 bg-success/10 text-success flex items-center gap-2 rounded-xl border p-3 text-xs">
          <Check className="h-4 w-4 shrink-0" />
          <span>Profile and passport settings updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            Full Name
          </label>
          <input
            type="text"
            id="input-profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-hidden"
            placeholder="Aarav Saini"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            Passport Handle (@username)
          </label>
          <div className="relative flex items-center">
            <span className="text-muted-foreground absolute left-3.5 font-mono text-sm">@</span>
            <input
              type="text"
              id="input-profile-username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
              }
              className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border py-2.5 pr-3.5 pl-8 font-mono text-sm transition-colors focus:outline-hidden"
              placeholder="aarav-saini"
              required
            />
          </div>
        </div>

        {/* Headline */}
        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            Professional Headline
          </label>
          <input
            type="text"
            id="input-profile-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-hidden"
            placeholder="Full Stack Engineer • Cloud Native Architect • Open Source Contributor"
          />
        </div>

        {/* Bio */}
        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            Developer Bio / Philosophy
          </label>
          <textarea
            id="input-profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-hidden"
            placeholder="Tell the community what you build, languages you love, and initiatives you are driving..."
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            GitHub Username or URL
          </label>
          <input
            type="text"
            id="input-profile-github"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-hidden"
            placeholder="aaravgorewal"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            LinkedIn Profile URL
          </label>
          <input
            type="text"
            id="input-profile-linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-hidden"
            placeholder="linkedin.com/in/aaravgorewal"
          />
        </div>

        {/* Twitter */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            Twitter / X Handle
          </label>
          <input
            type="text"
            id="input-profile-twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-hidden"
            placeholder="@aaravgorewal"
          />
        </div>

        {/* Website */}
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            Portfolio / Personal Site
          </label>
          <input
            type="text"
            id="input-profile-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-hidden"
            placeholder="https://aarav.dev"
          />
        </div>

        {/* Skills */}
        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold">
            Technical Skills (comma-separated)
          </label>
          <input
            type="text"
            id="input-profile-skills"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            className="bg-background border-border placeholder:text-muted-foreground focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-hidden"
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
              className="border-border bg-background text-primary focus:ring-ring/20 h-4 w-4 rounded-md"
            />
            <div>
              <span className="text-foreground block text-sm font-semibold">
                Make Developer Passport Public
              </span>
              <span className="text-muted-foreground block text-xs">
                Allows other builders and recruiters to view your verified achievements and timeline
                via your custom link.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="border-border flex justify-end border-t pt-4">
        <button
          type="submit"
          id="btn-save-profile"
          disabled={saving}
          className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
        </button>
      </div>
    </form>
  );
}
