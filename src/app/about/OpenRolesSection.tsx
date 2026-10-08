"use client";

import * as React from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitAboutRoleApplicationAction } from "@/server/about/actions";

export interface RoleItem {
  id: string;
  title: string;
  area: string;
}

interface OpenRolesSectionProps {
  roles: RoleItem[];
}

export function OpenRolesSection({ roles }: OpenRolesSectionProps) {
  const [selectedRole, setSelectedRole] = React.useState<RoleItem | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    link: "",
    whyYou: "",
    honeypot: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const dialogRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const firstInputRef = React.useRef<HTMLInputElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);

  const openDialog = (role: RoleItem, triggerEl: HTMLButtonElement) => {
    triggerRef.current = triggerEl;
    setSelectedRole(role);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: role.title,
      link: "",
      whyYou: "",
      honeypot: "",
    });
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const closeDialog = React.useCallback(() => {
    setSelectedRole(null);
    setIsSuccess(false);
    setErrorMessage(null);
    // Return focus to triggering button
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  }, []);

  // Focus trap & Escape key handler
  React.useEffect(() => {
    if (!selectedRole) return;

    // Focus first input or close button
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else if (closeBtnRef.current) {
        closeBtnRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDialog();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedRole, closeDialog]);

  if (!roles || roles.length === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (!formData.name.trim() || !formData.email.trim() || !formData.whyYou.trim()) {
      setErrorMessage("Please fill in all required fields (Name, Email, and Why you).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitAboutRoleApplicationAction({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role.trim() || selectedRole.title,
        area: selectedRole.area,
        link: formData.link.trim(),
        whyYou: formData.whyYou.trim(),
        honeypot: formData.honeypot,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to submit application. Please try again.");
      } else {
        setIsSuccess(true);
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="about-roles" className="border-border border-t pt-12 pb-6">
      <h2 className="text-muted-foreground mb-6 font-mono text-xs tracking-wider uppercase">
        Open roles
      </h2>

      <div className="divide-border border-border divide-y border-y">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="text-foreground text-sm font-semibold">{role.title}</h3>
              <p className="text-muted-foreground text-xs">{role.area}</p>
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => openDialog(role, e.currentTarget)}
                aria-haspopup="dialog"
                aria-label={`Apply for ${role.title}`}
              >
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Dialog */}
      {selectedRole && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-dialog-title"
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            ref={dialogRef}
            className="border-border bg-card relative w-full max-w-lg rounded-xl border p-6 shadow-2xl sm:p-8"
          >
            {/* Close Button */}
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeDialog}
              className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-primary absolute top-4 right-4 flex size-8 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>

            {isSuccess ? (
              <div className="space-y-4 py-6 text-center">
                <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 id="role-dialog-title" className="text-foreground text-lg font-semibold">
                  Application Submitted
                </h3>
                <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed sm:text-sm">
                  Thank you for applying for{" "}
                  <strong className="text-foreground">{selectedRole.title}</strong>. We have
                  received your application and will reach out via email within a few business days.
                </p>
                <div className="pt-2">
                  <Button type="button" variant="primary" size="sm" onClick={closeDialog}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 space-y-1">
                  <h3 id="role-dialog-title" className="text-foreground text-lg font-semibold">
                    Apply: {selectedRole.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {selectedRole.area} · Core Team Application
                  </p>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-md border p-3 text-xs"
                  >
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website_hp"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    className="sr-only"
                    aria-hidden="true"
                  />

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="app-name" className="text-foreground text-xs font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      ref={firstInputRef}
                      id="app-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs focus:ring-1 focus:outline-none"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="app-email" className="text-foreground text-xs font-medium">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="app-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs focus:ring-1 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="app-phone" className="text-foreground text-xs font-medium">
                        Phone
                      </label>
                      <input
                        id="app-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs focus:ring-1 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label htmlFor="app-role" className="text-foreground text-xs font-medium">
                      Role <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="app-role"
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs focus:ring-1 focus:outline-none"
                    />
                  </div>

                  {/* Link */}
                  <div className="space-y-1.5">
                    <label htmlFor="app-link" className="text-foreground text-xs font-medium">
                      Link (LinkedIn / GitHub / Portfolio)
                    </label>
                    <input
                      id="app-link"
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://linkedin.com/in/... or github.com/..."
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs focus:ring-1 focus:outline-none"
                    />
                  </div>

                  {/* Why you */}
                  <div className="space-y-1.5">
                    <label htmlFor="app-why" className="text-foreground text-xs font-medium">
                      Why you? <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="app-why"
                      required
                      rows={3}
                      value={formData.whyYou}
                      onChange={(e) => setFormData({ ...formData, whyYou: e.target.value })}
                      placeholder="Tell us what you've built, your areas of interest, and why you want to lead..."
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full resize-y rounded-md border px-3 py-2 text-xs focus:ring-1 focus:outline-none"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" size="sm" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Submit Application
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
