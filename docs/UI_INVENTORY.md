# UI Color-Compliance Inventory

> **Migration checklist** — generated 2026-10-04.  
> Do NOT style until every item is ticked ✅.  
> Baseline established by `npm run check:colors`.

---

## Baseline violation count

| Rule               |     Count | Description                                                   |
| ------------------ | --------: | ------------------------------------------------------------- |
| `tw-palette`       |     1 215 | Forbidden Tailwind palette utilities (slate-_/gray-_/cyan-*…) |
| `text-10px`        |       210 | `text-[10px]` — below 12 px minimum                           |
| `text-11px`        |       305 | `text-[11px]` — below 12 px minimum                           |
| `hex-literal`      |       411 | Hardcoded hex color literals `#rrggbb`                        |
| `bg-gradient`      |        89 | `bg-gradient-*` utilities                                     |
| `tw-gradient-stop` |       109 | `from-`/`via-`/`to-` gradient stops                           |
| `sparkles-icon`    |        56 | `<Sparkles>` icon usage                                       |
| `prd-label`        |       143 | `"PRD §"` strings visible in UI                               |
| `rgb-literal`      |        13 | `rgb()`/`rgba()` literals in UI files                         |
| `gradient-text`    |         3 | `gradient-text` class                                         |
| `blur-3xl`         |        28 | `blur-3xl` blob elements                                      |
| `hover-scale`      |        13 | `hover:scale-*`                                               |
| **TOTAL**          | **2 595** | **across 183 files**                                          |

> Run `npm run check:colors` at any time to see the current count.  
> Goal: **0 violations** before any style PR is merged.

---

## Category A — Tailwind Palette Utilities (1 215 hits, ~96 files)

These files use raw Tailwind palette classes (`slate-500`, `emerald-400`, `cyan-400`, etc.) instead of semantic tokens.  
Replace every palette utility with the closest semantic token from CLAUDE.md.

### A1 — Pages (`src/app/`)

| File                                                           | Notes                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/app/admin/certificates/page.tsx`                          | emerald, text-[10px]                                                   |
| `src/app/admin/checkin/CheckinScannerClient.tsx`               | emerald, amber, rose gradient                                          |
| `src/app/admin/checkin/page.tsx`                               | emerald                                                                |
| `src/app/admin/hackathons/page.tsx`                            | emerald, amber, purple, text-[11px]                                    |
| `src/app/admin/layout.tsx`                                     | emerald                                                                |
| `src/app/admin/page.tsx`                                       | text-[10px], text-[11px], PRD §                                        |
| `src/app/auth/error/page.tsx`                                  | red                                                                    |
| `src/app/campus-leads/CampusLeadFormClient.tsx`                | rose, slate                                                            |
| `src/app/campus-leads/page.tsx`                                | slate, blur-3xl                                                        |
| `src/app/collaborations/CollaborationsClient.tsx`              | slate, cyan, amber, emerald                                            |
| `src/app/collaborations/page.tsx`                              | slate, cyan, emerald, amber, PRD §, Sparkles, bg-gradient, text-[10px] |
| `src/app/community/CommunityCtaButtons.tsx`                    | palette utilities                                                      |
| `src/app/community/CommunityModalsClient.tsx`                  | palette utilities                                                      |
| `src/app/community/page.tsx`                                   | blur-3xl                                                               |
| `src/app/dev/components/page.tsx`                              | raw palette                                                            |
| `src/app/events/[slug]/judge/page.tsx`                         | palette                                                                |
| `src/app/events/[slug]/page.tsx`                               | raw palette, hex                                                       |
| `src/app/events/[slug]/register/RegistrationFormClient.tsx`    | palette, shadow rgba                                                   |
| `src/app/events/[slug]/register/page.tsx`                      | palette                                                                |
| `src/app/events/[slug]/register/pay/PaymentRecoveryClient.tsx` | palette, hex                                                           |
| `src/app/events/[slug]/ticket/[code]/TicketCardClient.tsx`     | palette, hex                                                           |
| `src/app/gallery/page.tsx`                                     | palette                                                                |
| `src/app/hackathon-series/[slug]/HackathonSeriesClient.tsx`    | purple, blur-3xl, hover:scale                                          |
| `src/app/hackathon-series/[slug]/page.tsx`                     | purple, blur-3xl, hex                                                  |
| `src/app/hackathon-series/page.tsx`                            | purple, blur-3xl, hex                                                  |
| `src/app/join-team/page.tsx`                                   | palette                                                                |
| `src/app/meetup-series/[slug]/page.tsx`                        | blur-3xl, hover:scale, hex                                             |
| `src/app/meetup-series/page.tsx`                               | blur-3xl, hex                                                          |
| `src/app/network/speakers/[slug]/page.tsx`                     | purple, emerald, amber                                                 |
| `src/app/page.tsx`                                             | palette, hover:scale                                                   |
| `src/app/partners/portal/page.tsx`                             | palette, hex                                                           |
| `src/app/passport/[username]/page.tsx`                         | palette                                                                |
| `src/app/signin/SignInClient.tsx`                              | blur-3xl                                                               |
| `src/app/state-leads/StateLeadFormClient.tsx`                  | rose, PRD §, Sparkles, text-[11px]                                     |
| `src/app/state-leads/page.tsx`                                 | palette                                                                |
| `src/app/tech-talks/TechTalksSearchClient.tsx`                 | palette                                                                |
| `src/app/tech-talks/[slug]/page.tsx`                           | palette                                                                |
| `src/app/tech-talks/page.tsx`                                  | palette                                                                |
| `src/app/workshops/HostWorkshopModal.tsx`                      | palette                                                                |
| `src/app/workshops/RequestCollegeWorkshopModal.tsx`            | palette                                                                |
| `src/app/workshops/WorkshopsClient.tsx`                        | palette                                                                |
| `src/app/workshops/page.tsx`                                   | palette                                                                |

### A2 — Components (`src/components/`)

| File                                                              | Notes                     |
| ----------------------------------------------------------------- | ------------------------- |
| `src/components/about/WhoWeAreClient.tsx`                         | palette                   |
| `src/components/admin/AdminAnalyticsClient.tsx`                   | palette                   |
| `src/components/admin/AdminAuditLogsClient.tsx`                   | palette                   |
| `src/components/admin/AdminCampusLeadsClient.tsx`                 | palette                   |
| `src/components/admin/AdminCmsClient.tsx`                         | palette                   |
| `src/components/admin/AdminCollaborationsClient.tsx`              | palette                   |
| `src/components/admin/AdminCommunityClient.tsx`                   | palette                   |
| `src/components/admin/AdminDataTable.tsx`                         | palette                   |
| `src/components/admin/AdminEmailLogsClient.tsx`                   | palette, hex              |
| `src/components/admin/AdminEventsClient.tsx`                      | palette                   |
| `src/components/admin/AdminGalleryManagerClient.tsx`              | palette                   |
| `src/components/admin/AdminKanban.tsx`                            | palette                   |
| `src/components/admin/AdminParticipantsClient.tsx`                | palette                   |
| `src/components/admin/AdminPaymentsClient.tsx`                    | palette                   |
| `src/components/admin/AdminRegistrationsClient.tsx`               | palette                   |
| `src/components/admin/AdminSeriesClient.tsx`                      | palette                   |
| `src/components/admin/AdminSidebar.tsx`                           | palette                   |
| `src/components/admin/AdminSponsorsClient.tsx`                    | palette                   |
| `src/components/admin/AdminStateLeadsClient.tsx`                  | palette                   |
| `src/components/admin/AdminTechTalksClient.tsx`                   | palette                   |
| `src/components/admin/AdminWorkshopsClient.tsx`                   | palette                   |
| `src/components/admin/CommunityAnalyticsDashboard.tsx`            | palette, blur-3xl         |
| `src/components/admin/EventEditorClient.tsx`                      | palette                   |
| `src/components/admin/certificates/AdminCertificatesClient.tsx`   | palette                   |
| `src/components/admin/certificates/CertificateDesignerCanvas.tsx` | palette, hex              |
| `src/components/admin/pnl/AdminPnLClient.tsx`                     | palette                   |
| `src/components/admin/sponsors/AdminSponsorCRMClient.tsx`         | palette                   |
| `src/components/auth/UserMenu.tsx`                                | palette                   |
| `src/components/certificates/PublicVerifyClient.tsx`              | palette, blur-3xl         |
| `src/components/chapters/ChapterDashboardClient.tsx`              | palette, hex              |
| `src/components/chapters/ChapterPublicClient.tsx`                 | palette, hex              |
| `src/components/chapters/ChaptersDirectoryClient.tsx`             | palette, hex              |
| `src/components/community/SpeakerCard.tsx`                        | bg-gradient, shadow-rgba  |
| `src/components/events/EventCard.tsx`                             | hover:scale               |
| `src/components/events/EventStickyCta.tsx`                        | palette                   |
| `src/components/events/EventsFilterBar.tsx`                       | palette, shadow-rgba      |
| `src/components/events/SeriesCard.tsx`                            | blur-3xl                  |
| `src/components/forms/Form.tsx`                                   | palette                   |
| `src/components/forms/FormCheckbox.tsx`                           | palette                   |
| `src/components/forms/FormInput.tsx`                              | palette                   |
| `src/components/forms/FormRadioGroup.tsx`                         | palette                   |
| `src/components/forms/FormSelect.tsx`                             | palette                   |
| `src/components/forms/FormTextarea.tsx`                           | palette                   |
| `src/components/founder/FounderClient.tsx`                        | hover:scale               |
| `src/components/gallery/AlbumCard.tsx`                            | palette                   |
| `src/components/gallery/AlbumDetailClient.tsx`                    | palette, hover:scale      |
| `src/components/gallery/GalleryOverviewClient.tsx`                | palette                   |
| `src/components/gallery/Lightbox.tsx`                             | hover:scale               |
| `src/components/gallery/UploadPhotosModal.tsx`                    | hover:scale               |
| `src/components/hackathons/AdminHackathonControlClient.tsx`       | palette                   |
| `src/components/hackathons/HackathonEngineClient.tsx`             | palette                   |
| `src/components/hackathons/JudgePortalClient.tsx`                 | purple, blur-3xl          |
| `src/components/layout/Navbar.tsx`                                | palette                   |
| `src/components/leads/AdminLeadPortalClient.tsx`                  | palette                   |
| `src/components/leads/CampusLeadDashboardClient.tsx`              | blur-3xl                  |
| `src/components/leads/StateLeadDashboardClient.tsx`               | purple, blur-3xl          |
| `src/components/network/MentorCockpitClient.tsx`                  | palette, hex              |
| `src/components/network/SpeakerNetworkClient.tsx`                 | palette, hex              |
| `src/components/network/UserBookingsClient.tsx`                   | palette, hex, hover:scale |
| `src/components/partners/PartnerPortalClient.tsx`                 | palette, hex, hover:scale |
| `src/components/profile/ApplicationsTracker.tsx`                  | palette                   |
| `src/components/profile/BadgesGrid.tsx`                           | palette, hover:scale      |
| `src/components/profile/CertificatesList.tsx`                     | palette                   |
| `src/components/profile/DeveloperPassportCard.tsx`                | purple, blur-3xl          |
| `src/components/profile/MemberDashboardClient.tsx`                | palette                   |
| `src/components/profile/ParticipationTimeline.tsx`                | palette                   |
| `src/components/profile/ProfileEditForm.tsx`                      | palette                   |
| `src/components/profile/ProgressionLadder.tsx`                    | purple, blur-3xl          |
| `src/components/profile/TicketsList.tsx`                          | palette, hex              |
| `src/components/recommendations/RecommendationsClient.tsx`        | blur-3xl                  |
| `src/components/team/CoreTeamClient.tsx`                          | palette                   |
| `src/components/team/JoinTeamClient.tsx`                          | palette                   |
| `src/components/ui/Badge.tsx`                                     | palette                   |
| `src/components/ui/Button.tsx`                                    | palette                   |
| `src/components/ui/FilterChips.tsx`                               | palette, shadow-rgba      |
| `src/components/ui/PartnerLogoGrid.tsx`                           | palette                   |
| `src/components/ui/PlaceholderPage.tsx`                           | palette                   |
| `src/components/ui/Skeleton.tsx`                                  | palette                   |
| `src/components/ui/StatCounter.tsx`                               | drop-shadow rgba          |
| `src/components/ui/TestimonialCarousel.tsx`                       | palette                   |
| `src/components/ui/Toast.tsx`                                     | palette                   |
| `src/components/ui/Toaster.tsx`                                   | palette                   |

---

## Category B — Hardcoded Color Literals (411 hex + 13 rgb = 424 hits)

Hex and rgb() literals inside UI component and app files.

### B1 — Email Templates (`src/server/email/templates/`) — **EXEMPT from UI rules**

These use react-email inline styles which require raw hex. Do not migrate as part of the UI token pass.

| File                                 | Count |
| ------------------------------------ | ----: |
| `ApplicationReceivedEmail.tsx`       |   ~15 |
| `BaseLayout.tsx`                     |   ~15 |
| `CertificateIssuedEmail.tsx`         |   ~20 |
| `CollaborationAckEmail.tsx`          |   ~10 |
| `EventReminderEmail.tsx`             |   ~10 |
| `LeadInactivityNudgeEmail.tsx`       |   ~12 |
| `LeadOnboardingEmail.tsx`            |   ~10 |
| `PaymentFailedEmail.tsx`             |    ~5 |
| `PostEventFeedbackNextStepEmail.tsx` |    ~5 |
| `RefundProcessedEmail.tsx`           |    ~5 |
| `RegistrationConfirmationEmail.tsx`  |   ~18 |
| `StatusChangeEmail.tsx`              |    ~8 |

### B2 — Server-side PDF/QR generation — **EXEMPT from UI rules**

`src/server/certificates/pdf.ts`, `src/server/events/registration.ts`, `src/server/pnl/service.ts`  
These use `pdf-lib rgb()` which cannot use CSS tokens.

### B3 — UI files that MUST be migrated

| File                                                        | Violations                   |
| ----------------------------------------------------------- | ---------------------------- |
| `src/app/events/[slug]/opengraph-image.tsx`                 | rgba() blobs in OG image     |
| `src/app/gallery/[albumId]/opengraph-image.tsx`             | rgba() blobs in OG image     |
| `src/app/events/[slug]/register/RegistrationFormClient.tsx` | shadow-[rgba]                |
| `src/app/admin/checkin/CheckinScannerClient.tsx`            | shadow-[rgba]                |
| `src/components/ui/StatCounter.tsx`                         | drop-shadow-[rgba]           |
| `src/components/ui/FAQAccordion.tsx`                        | shadow-[rgba]                |
| `src/components/ui/FilterChips.tsx`                         | shadow-[rgba]                |
| `src/components/events/EventsFilterBar.tsx`                 | shadow-[rgba]                |
| `src/components/community/SpeakerCard.tsx`                  | shadow-[rgba]                |
| `src/lib/tokens.ts`                                         | hex literals in TS token map |
| `src/app/layout.tsx`                                        | hex in metadata/theme-color  |

---

## Category C — Gradient Classes (198 hits)

### C1 — `bg-gradient-*` (89 hits)

All files using `bg-gradient-to-b`, `bg-gradient-to-br`, etc. must switch to flat backgrounds.

Key offenders: `page.tsx` files for collaborations, hackathon-series, meetup-series, network/speakers, admin/checkin.

### C2 — `from-`/`via-`/`to-` stops (109 hits)

Gradient stop classes used alongside `bg-gradient` and in `SpeakerCard`, `CheckinScannerClient`, `collaborations/page.tsx`, etc.

### C3 — `gradient-text` (3 hits)

`src/components/ui/StatCounter.tsx` — remove gradient text effect.

---

## Category D — Blur Blobs (`blur-3xl`) — 28 hits

Every file has a decorative `rounded-full blur-3xl` element that must be removed entirely.

| File                                                                |
| ------------------------------------------------------------------- |
| `src/app/campus-leads/page.tsx`                                     |
| `src/app/community/page.tsx`                                        |
| `src/app/hackathon-series/page.tsx`                                 |
| `src/app/hackathon-series/[slug]/page.tsx`                          |
| `src/app/hackathon-series/[slug]/HackathonSeriesClient.tsx`         |
| `src/app/meetup-series/page.tsx`                                    |
| `src/app/meetup-series/[slug]/page.tsx`                             |
| `src/app/signin/SignInClient.tsx`                                   |
| `src/components/admin/CommunityAnalyticsDashboard.tsx`              |
| `src/components/certificates/PublicVerifyClient.tsx`                |
| `src/components/hackathons/JudgePortalClient.tsx`                   |
| `src/components/leads/CampusLeadDashboardClient.tsx`                |
| `src/components/leads/StateLeadDashboardClient.tsx`                 |
| `src/components/profile/DeveloperPassportCard.tsx`                  |
| `src/components/profile/ProgressionLadder.tsx`                      |
| `src/components/recommendations/RecommendationsClient.tsx`          |
| `src/components/events/SeriesCard.tsx`                              |
| `src/components/gallery/UploadPhotosModal.tsx` _(hover:scale blob)_ |

---

## Category E — hover:scale-* — 13 hits

| File                                                        | Line     | Snippet                    |
| ----------------------------------------------------------- | -------- | -------------------------- |
| `src/app/hackathon-series/[slug]/HackathonSeriesClient.tsx` | 725      | `group-hover:scale-105`    |
| `src/app/events/[slug]/page.tsx`                            | 924      | `group-hover:scale-105`    |
| `src/app/meetup-series/[slug]/page.tsx`                     | 485      | `group-hover:scale-105`    |
| `src/app/page.tsx`                                          | 1010     | `group-hover:scale-110`    |
| `src/components/founder/FounderClient.tsx`                  | 229      | `group-hover:scale-125`    |
| `src/components/gallery/AlbumDetailClient.tsx`              | 312      | `group-hover:scale-[1.02]` |
| `src/components/gallery/Lightbox.tsx`                       | 195, 234 | `hover:scale-105` ×2       |
| `src/components/gallery/UploadPhotosModal.tsx`              | 254      | `group-hover:scale-110`    |
| `src/components/network/UserBookingsClient.tsx`             | 242      | `hover:scale-125`          |
| `src/components/partners/PartnerPortalClient.tsx`           | 530      | `group-hover:scale-105`    |
| `src/components/profile/BadgesGrid.tsx`                     | 86       | `group-hover:scale-105`    |
| `src/components/events/EventCard.tsx`                       | 100      | `group-hover:scale-105`    |

---

## Category F — Text Size Violations (515 hits)

`text-[10px]` (210) and `text-[11px]` (305) are below the 12 px minimum.

**Hotspots:**

- `src/app/admin/page.tsx` — stat labels
- `src/app/admin/checkin/CheckinScannerClient.tsx` — scanner UI labels
- `src/app/admin/hackathons/page.tsx` — badge text
- `src/app/state-leads/StateLeadFormClient.tsx` — error messages
- `src/app/collaborations/page.tsx` — category labels

Replace all `text-[10px]` and `text-[11px]` with `text-xs` (12 px) at minimum.

---

## Category G — Sparkles Icon (56 hits)

`<Sparkles>` imported from `lucide-react` in UI TSX files:

- `src/app/collaborations/page.tsx`
- `src/app/admin/checkin/CheckinScannerClient.tsx`
- `src/app/state-leads/StateLeadFormClient.tsx`
- (and 50+ more occurrences across admin/lead pages)

Replace with a plain icon from lucide that is semantically appropriate, or remove.

---

## Category H — "PRD §" Labels (143 hits)

These are developer comment/badge strings that must not appear in rendered UI.

| File                                          | Type                         |
| --------------------------------------------- | ---------------------------- |
| `src/app/collaborations/page.tsx`             | HTML comment + visible badge |
| `src/app/admin/certificates/page.tsx`         | visible badge text           |
| `src/app/admin/layout.tsx`                    | visible badge text           |
| `src/app/admin/page.tsx`                      | visible badge text           |
| `src/app/state-leads/StateLeadFormClient.tsx` | visible subheading           |
| `src/app/admin/email-logs/page.tsx`           | code comment only            |
| `src/app/admin/pnl/page.tsx`                  | code comment only            |
| `src/app/admin/sponsors/page.tsx`             | code comment only            |
| `src/app/admin/hackathons/page.tsx`           | visible JSX text             |

Code-only comments (not rendered) should be converted to plain comments without "PRD §".  
Rendered text must be replaced with plain copy.

---

## Category I — `dark:` Variants (4 hits) — **already compliant**

These 4 occurrences use `dark:` inside QR-code color config (JS object keys), not as Tailwind CSS variants. No action needed.

---

## Migration Order (suggested)

1. **UI primitives first** — `Badge`, `Button`, `Toast`, `Toaster`, form components
2. **Layout** — `Navbar`, admin `layout.tsx`
3. **High-traffic pages** — `page.tsx` (homepage, events, collaborations)
4. **Admin pages** — all admin/* files
5. **Profile/Lead pages**
6. **Email templates** — exempt; update separately if desired
7. **Server PDF/QR** — exempt

---

## Exemptions (excluded from `check:colors`)

| Path                           | Reason                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `src/app/globals.css`          | CSS custom-property token definitions — raw `oklch()` values are intentional |
| `src/styles/tokens.css`        | Alternate token file (same reason)                                           |
| `src/server/**` → `rgb()` only | pdf-lib and react-email require raw color values                             |
| `src/lib/**` → `rgb()` only    | pdf-lib helper utilities                                                     |

---

_Last updated: 2026-10-04 · Baseline: 2 595 violations · Target: 0_
