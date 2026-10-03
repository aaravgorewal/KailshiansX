// src/app/admin/team-applications/page.tsx
// Redirects to unified Admin CMS recruitment applications tab

import { redirect } from "next/navigation";

export default function AdminTeamApplicationsRedirect() {
  redirect("/admin/cms?tab=applications");
}
