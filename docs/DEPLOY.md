# KailshiansX Production Deployment & Operations Runbook

> **Target Architecture**: Next.js 16 (App Router), PostgreSQL 16+, Prisma ORM, Auth.js v5, Razorpay, Resend, AWS S3 / Cloudflare R2, Upstash Redis, Sentry, and Google Analytics 4.  
> **Deployment Target**: Vercel (Edge & Serverless Node.js Runtime) with Preview Deployments and Branching.

---

## 1. System Architecture Overview

```mermaid
graph TD
    Client[Web & Mobile Browsers] -->|HTTPS + CSP| VercelEdge[Vercel Edge / CDN]
    VercelEdge -->|App Router SSR & Server Actions| NextApp[Next.js Application Engine]
    NextApp -->|Database Connection Pooling| PG[(PostgreSQL Database)]
    NextApp -->|Sliding Window Rate Limit| Upstash[(Upstash Redis)]
    NextApp -->|Transactional Templates| Resend[Resend API]
    NextApp -->|HMAC Verification & Orders| Razorpay[Razorpay Payments]
    NextApp -->|Presigned Asset Uploads| S3[(AWS S3 / Cloudflare R2)]
    NextApp -->|Exception Capture & Traces| Sentry[Sentry Telemetry]
    Client -->|Beacon Telemetry| GA4[Google Analytics 4]
```

---

## 2. Production Environment Variable Checklist

All variables are validated at boot time via `src/lib/env.ts` with strict Zod schemas. If any required production variable is missing or malformed, server startup aborts immediately.

### Core & Application Settings

| Variable               | Required | Production Value / Pattern | Description                                                                  |
| :--------------------- | :------: | :------------------------- | :--------------------------------------------------------------------------- |
| `NODE_ENV`             | **Yes**  | `production`               | Enables production optimizations, caching, and strict security checks.       |
| `NEXT_PUBLIC_APP_URL`  | **Yes**  | `https://kailshiansx.com`  | Canonical base URL used for OpenGraph, sitemap, OAuth redirects, and emails. |
| `NEXT_PUBLIC_APP_NAME` |    No    | `KailshiansX`              | Application branding title.                                                  |

### Database & Prisma ORM

| Variable       | Required | Production Value / Pattern                                                        | Description                                                                     |
| :------------- | :------: | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| `DATABASE_URL` | **Yes**  | `postgresql://user:password@host:5432/kailshiansx?sslmode=require&pgbouncer=true` | Pooled connection string to production PostgreSQL (Neon, Supabase, or AWS RDS). |

> [!IMPORTANT]
> When deploying on serverless infrastructure like Vercel, always use a connection pooler (e.g. Neon connection pooling or PgBouncer with `?sslmode=require&pgbouncer=true`) to avoid exhausting database connection limits during traffic spikes.

### Authentication (Auth.js v5)

| Variable             | Required | Production Value / Pattern                     | Description                                                |
| :------------------- | :------: | :--------------------------------------------- | :--------------------------------------------------------- |
| `AUTH_SECRET`        | **Yes**  | Generated 64-char hex (`openssl rand -hex 32`) | Cryptographic signing secret for sessions and CSRF tokens. |
| `AUTH_GOOGLE_ID`     | **Yes**  | `<client-id>.apps.googleusercontent.com`       | Google Cloud Console OAuth 2.0 Client ID.                  |
| `AUTH_GOOGLE_SECRET` | **Yes**  | Client secret string                           | Google Cloud Console OAuth 2.0 Client Secret.              |

**Google OAuth Redirect URI Configuration**:

- Authorized JavaScript origins: `https://kailshiansx.com`
- Authorized redirect URIs: `https://kailshiansx.com/api/auth/callback/google`

### Razorpay Payment Gateway

| Variable                      | Required | Production Value / Pattern | Description                                                           |
| :---------------------------- | :------: | :------------------------- | :-------------------------------------------------------------------- |
| `RAZORPAY_KEY_ID`             | **Yes**  | `rzp_live_xxxxxxxxxxxxxx`  | Live Razorpay API Key ID (Server-side).                               |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Yes**  | `rzp_live_xxxxxxxxxxxxxx`  | Live Razorpay Key exposed to checkout modal.                          |
| `RAZORPAY_KEY_SECRET`         | **Yes**  | Live Secret Key string     | Cryptographic key for server-side HMAC-SHA256 signature verification. |
| `RAZORPAY_WEBHOOK_SECRET`     | **Yes**  | Webhook secret string      | Secret for verifying incoming webhook requests from Razorpay servers. |

**Razorpay Webhook Configuration**:

- URL: `https://kailshiansx.com/api/webhooks/razorpay`
- Active Events to subscribe:
  - `payment.captured`
  - `payment.failed`
  - `refund.processed`

### Transactional Email (Resend)

| Variable            | Required | Production Value / Pattern                     | Description                                                                                 |
| :------------------ | :------: | :--------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`    | **Yes**  | `re_live_xxxxxxxxxxxxxxxxxxxxxxxx`             | Resend API token. Domain `kailshiansx.com` must have verified DKIM, SPF, and DMARC records. |
| `RESEND_FROM_EMAIL` | **Yes**  | `KailshiansX Passes <tickets@kailshiansx.com>` | Verified sender address for passes, notifications, and confirmations.                       |

### Object Storage (AWS S3 or Cloudflare R2)

| Variable               | Required | Production Value / Pattern                      | Description                                                               |
| :--------------------- | :------: | :---------------------------------------------- | :------------------------------------------------------------------------ |
| `S3_BUCKET_NAME`       | **Yes**  | `kailshiansx-production-assets`                 | Target bucket name.                                                       |
| `S3_REGION`            | **Yes**  | `ap-south-1` (or `auto` for Cloudflare R2)      | AWS region or R2 region.                                                  |
| `S3_ACCESS_KEY_ID`     | **Yes**  | IAM User Access Key                             | Restricted access key with `s3:PutObject`, `s3:GetObject`.                |
| `S3_SECRET_ACCESS_KEY` | **Yes**  | IAM Secret Access Key                           | Matching secret key.                                                      |
| `S3_ENDPOINT`          |    No    | `https://<account-id>.r2.cloudflarestorage.com` | Optional endpoint when using S3-compatible stores (Cloudflare R2, MinIO). |
| `NEXT_PUBLIC_CDN_URL`  |    No    | `https://media.kailshiansx.com`                 | Optional Cloudflare CDN domain mapping to S3 bucket.                      |

### Distributed Rate Limiting (Upstash Redis)

| Variable                   | Required | Production Value / Pattern       | Description                                           |
| :------------------------- | :------: | :------------------------------- | :---------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | **Yes**  | `https://xxxx-xxxx.upstash.io`   | Upstash Redis REST endpoint.                          |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes**  | Secret Upstash REST Bearer token | Authentication token for serverless Redis operations. |

### Monitoring & Error Tracking (Sentry)

| Variable                 | Required | Production Value / Pattern                   | Description                                                   |
| :----------------------- | :------: | :------------------------------------------- | :------------------------------------------------------------ |
| `SENTRY_DSN`             | **Yes**  | `https://public@oXXXX.ingest.sentry.io/XXXX` | Server and Edge Sentry project DSN.                           |
| `NEXT_PUBLIC_SENTRY_DSN` | **Yes**  | `https://public@oXXXX.ingest.sentry.io/XXXX` | Browser client Sentry project DSN.                            |
| `SENTRY_AUTH_TOKEN`      |    No    | Secret token                                 | Optional token for automated source map uploads during build. |
| `SENTRY_ORG`             |    No    | Organization slug                            | Sentry organization identifier.                               |
| `SENTRY_PROJECT`         |    No    | Project slug                                 | Sentry project identifier (`kailshiansx-web`).                |

### Analytics & Bot Protection

| Variable                        | Required | Production Value / Pattern | Description                                                   |
| :------------------------------ | :------: | :------------------------- | :------------------------------------------------------------ |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **Yes**  | `G-XXXXXXXXXX`             | Google Analytics 4 web stream measurement identifier.         |
| `CRON_SECRET`                   | **Yes**  | Random 32-char hex string  | Bearer token authenticating Vercel cron jobs (`/api/cron/*`). |

---

## 3. Vercel Project Setup & Preview Deployments

### Initial Project Creation

1. Link GitHub repository `aaravgorewal/KailshiansX` in the Vercel Dashboard.
2. Select framework preset: **Next.js**.
3. Build & Development Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: Automatically handled (`.next`)
   - **Install Command**: `npm ci`
4. Root Directory: `./`

### Setting Up Preview Deployments with Isolated Databases

To ensure pull requests and preview branches do not corrupt production data:

1. **Option A: Neon Database Branching (Recommended)**:
   - Install the **Neon Vercel Integration** from Vercel Marketplace.
   - For every Preview Deployment, Neon automatically provisions an instant copy-on-write database branch and injects a dedicated `DATABASE_URL` into that preview environment.
   - Run `npx prisma migrate deploy` in preview builds to verify migrations against the branched database.

2. **Option B: Schema Isolation**:
   - In PR environments, append `?schema=preview_${VERCEL_GIT_COMMIT_REF}` to the staging database connection string.

### Environment Variable Scope Mapping

In Vercel Project Settings > Environment Variables:

- Assign production credentials to **Production** scope only.
- Set test keys (Razorpay test keys `rzp_test_*`, dummy Upstash or staging Upstash) for **Preview** and **Development** scopes.

---

## 4. Production Database Bootstrap (Seed-Free)

> [!WARNING]
> NEVER execute `npm run db:seed` in production! The seed script populates the database with dummy events, mock registrations, and fake attendees.

For fresh production databases, use the clean seed-free bootstrap script:

```bash
# 1. Run migrations against production database
npm run db:migrate:prod

# 2. Run the seed-free production bootstrap script
npm run db:bootstrap
```

### What `npm run db:bootstrap` Does:

1. Verifies connectivity and schema integrity with production PostgreSQL.
2. Creates or promotes the initial **Super Admin** account specified by `BOOTSTRAP_ADMIN_EMAIL`.
3. Seeds the mandatory CMS Content singletons (`FounderContent` and `WhoWeAreContent`) with production copy.
4. Generates an initial `AuditLog` entry tracking the initialization event.
5. Populates **zero** fake events, **zero** test registrations, and **zero** dummy leads.

### Promoting Additional Administrators

To elevate an existing user account to Administrator or Super Administrator:

```bash
# Set role via CLI tool
npm run promote -- --email user@example.com --role ADMIN
# Or SUPER_ADMIN / EVENT_MANAGER
```

---

## 5. Automated Database Backups & Disaster Recovery

### Automated Backups Script (`scripts/backup-db.ts`)

Run manual or scheduled database backups:

```bash
npm run db:backup
```

### Backup Capabilities:

- Creates timestamped, gzip-compressed PostgreSQL dumps (`backups/kailshiansx_backup_YYYY-MM-DD_HH-MM-SS.sql.gz`).
- Automatically uploads backup archives to AWS S3 / Cloudflare R2 under `backups/` prefix.
- Enforces retention policy: automatically purges local backups older than `BACKUP_RETENTION_DAYS` (default: 30 days).

### Scheduled Nightly Backup Cron

Add the following entry to your production server or automated runner:

```cron
# Run daily database backup at 03:00 AM UTC
0 3 * * * cd /var/www/kailshiansx && dotenv run -f .env.production -- tsx scripts/backup-db.ts >> /var/log/db_backup.log 2>&1
```

### Database Restoration Runbook

In the event of accidental data corruption or disaster recovery:

```bash
# 1. Download or locate target backup file
# 2. Restore database using the automated restore script:
tsx scripts/restore-db.ts backups/kailshiansx_backup_2026-10-04_03-00-00.sql.gz
```

---

## 6. Pre-Launch Verification Checklist

Before directing live domain DNS traffic to the production cluster, verify every item below:

- [ ] **Database Connection Pool**: `DATABASE_URL` connects with SSL enabled (`sslmode=require`) and PgBouncer connection pooling active.
- [ ] **Migrations Deployed**: `npx prisma migrate status` reports `Database schema is up to date!`.
- [ ] **Seed-Free Bootstrap**: Executed `npm run db:bootstrap` and verified Super Admin can log in at `/signin`.
- [ ] **Auth Secret Strength**: `AUTH_SECRET` is at least 32 bytes (64 hex characters) generated via cryptographic CSPRNG.
- [ ] **Google OAuth Live Credentials**: Production domain `https://kailshiansx.com` listed in Authorized Origins and Redirect URIs.
- [ ] **Resend DNS Records**: SPF (`v=spf1 include:amazonses.com ~all`), DKIM, and DMARC verified in Resend dashboard.
- [ ] **Razorpay Live Mode**: `RAZORPAY_KEY_ID` begins with `rzp_live_`. Webhook endpoint `https://kailshiansx.com/api/webhooks/razorpay` active with secret configured.
- [ ] **S3 Bucket Permissions**: CORS enabled for `https://kailshiansx.com` with `PUT`, `GET`, `HEAD` methods; public block enabled; presigned URLs working.
- [ ] **Upstash Redis**: Dual-engine rate limiter actively connected to Redis REST URL.
- [ ] **Sentry Telemetry**: Error boundary triggered in test route sends sample issue to Sentry dashboard.
- [ ] **Google Analytics 4**: Live Realtime view in GA4 shows active users on route changes.
- [ ] **Security Headers**: CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` verified via `curl -I https://kailshiansx.com`.
- [ ] **SEO & Indexing**: `https://kailshiansx.com/sitemap.xml` and `https://kailshiansx.com/robots.txt` return HTTP 200 with valid XML/text.
- [ ] **Lighthouse Mobile Score**: Performance >= 90, Accessibility >= 95, Best Practices = 100, SEO = 100 on Home, Events, and Event detail.

---

## 7. Rollback & Incident Response Plan

### Rolling Back a Bad Vercel Deployment

1. Navigate to **Vercel Dashboard > Project > Deployments**.
2. Identify the previous stable deployment hash.
3. Click the **...** menu on that deployment and select **Instant Rollback**.
4. Traffic is immediately redirected to the previous build artifact in less than 3 seconds without rebuilding.

### Handling Database Schema Reversions

If a migration introduced breaking changes:

1. Review the down-migration steps.
2. If restoring full database state, use the latest automated backup:
   ```bash
   tsx scripts/restore-db.ts backups/<latest-stable-backup>.sql.gz
   ```
3. Restart Vercel deployment with matching code commit.
