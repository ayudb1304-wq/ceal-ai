# Ceal AI — Refined Implementation Plan

**Document date:** 2026-03-23
**Status:** Active build reference
**Stack:** Next.js 16 (App Router) · Supabase · NextAuth.js v5 · Gemini 2.5 Flash · Tailwind + Shadcn/UI

---

## Ground Rules

- **Testing gate between phases:** Manual smoke-test checklist. Every item must pass before the next phase begins.
- **Error handling:** Custom modals (no browser alerts). Loading skeletons for async states.
- **Naming:** PascalCase components, camelCase variables/functions.
- **No over-engineering:** Build only what the current phase requires. No speculative abstractions.
- **Credential vault and audit trail** are in-scope for the initial MVP. Handover PDF and Razorpay payment trigger are post-MVP.
- **Client access:** Magic link email only. UUID token, 7-day expiry, single-use via `project_magic_links` table.

---

## Phase 0 — Already Complete (Baseline Audit)

The following are **done and stable**. Do not re-build.

| Feature | File(s) | Notes |
|---|---|---|
| Landing page | `app/page.tsx`, `src/components/landing/` | Hero, trust sections, Terminal Friction Gap, final CTA |
| Google OAuth sign-in | `app/auth/signin/`, `auth.ts`, `app/api/auth/[...nextauth]/` | JWT strategy, custom sign-in page |
| 4-step onboarding wizard | `src/components/onboarding/agency-onboarding-wizard.tsx` | Profile → Branding → Legal/Tax → First Project |
| SOW AI extraction | `lib/ai/sow-extraction.ts`, `lib/ai/sow-types.ts` | Gemini 2.5 Flash, supports PDF/DOCX/TXT/MD |
| Onboarding server actions | `app/(onboarding)/onboarding/actions.ts` | `completeOnboardingAction`, `extractSowDeliverablesAction` |
| Supabase data layer | `lib/supabase/onboarding.ts`, `lib/supabase/server.ts` | Upserts agency + project on completion |
| Database schema | `supabase/migrations/` | All 6 tables with RLS, indexes, updated_at triggers |
| Routing logic | `app/dashboard/page.tsx` | Users with agency → dashboard, without → onboarding |
| Dark/light theme | `components/theme-provider.tsx` | Keyboard toggle (`d`) |

**Onboarding → Dashboard gap:** After onboarding, users land on a barebones dashboard (user info + sign-out). Everything below is what needs to be built.

---

## Phase 1 — Agency Dashboard & Project Management

**Goal:** Agency owners can view their projects, review and edit the AI-generated deliverable checklist, and publish a project to the client.

### 1.1 Feature List

#### Dashboard (`/dashboard`)
- [x] **Project list** — Cards or table rows showing: project name, client name, status badge (draft / active / closed), and a "Percentage to Close" progress bar (verified deliverables / total deliverables).
- [x] **New project button** — Opens a modal to create a new project (name, client name, client email) without requiring a SOW upload. SOW upload is optional.
- [x] **Empty state** — First-time message with a prompt to create a first project if none exist.

#### Project Detail (`/dashboard/projects/[projectId]`)
- [x] **Deliverable checklist** — List of deliverables extracted from SOW (or manually added). Each row shows: title, description, required format, verified status badge (Pending / Verified), and upload button.
- [x] **HITL review panel** — A banner/callout visible when the checklist is in "draft" state (AI-generated, not yet approved). Contains an "Approve Checklist" button that flips `project.status` from `draft` to `active`.
- [x] **Edit deliverable** — Inline edit or slide-over form to change title, description, required_format on any deliverable.
- [x] **Add deliverable** — Button to manually add a deliverable row.
- [x] **Delete deliverable** — Trash icon per row with confirmation modal.
- [x] **Credential section** — Separate section below deliverables. Shows existing credentials as blurred cards. "Add Credential" button opens a modal (label + value). Value is AES-256 encrypted before storing (Node.js `crypto` module, key from env, IV stored in `credentials.iv`). "Click to Reveal" toggles blur. "Copy to Clipboard" button.
- [x] **Publish to Client button** — Only enabled when `project.status === 'active'`. On click: generates a UUID magic token, inserts into `project_magic_links` with `expires_at = now() + 7 days`, emails the client (Resend or console.log stub for now), shows a confirmation modal with the portal link for the agency to copy manually.

#### New Project Flow (if no SOW)
- [x] Create project record in `projects` table with `status = 'active'`.
- [x] Show empty checklist with only the "Add Deliverable" prompt.

### 1.2 Server Actions Required

| Action | Location | What it does |
|---|---|---|
| `getProjectsForAgency(agencyId)` | `lib/supabase/projects.ts` | Fetch all projects + deliverable counts |
| `getProjectDetail(projectId)` | `lib/supabase/projects.ts` | Fetch one project with deliverables + credentials |
| `createProject(...)` | `lib/supabase/projects.ts` | Insert into `projects` |
| `approveChecklist(projectId)` | `lib/supabase/projects.ts` | Set `status = 'active'` |
| `upsertDeliverable(...)` | `lib/supabase/deliverables.ts` | Create or update a deliverable |
| `deleteDeliverable(id)` | `lib/supabase/deliverables.ts` | Delete row |
| `createCredential(...)` | `lib/supabase/credentials.ts` | Encrypt value + IV, insert |
| `getCredentials(projectId)` | `lib/supabase/credentials.ts` | Fetch + decrypt values server-side |
| `publishProject(projectId)` | `lib/supabase/magic-links.ts` | Generate UUID token, insert into `project_magic_links`, return portal URL |

### 1.3 New Shadcn/UI Components Needed

- `Dialog` / `Sheet` — for create project, edit deliverable, add credential modals
- `Progress` — for % to close bar
- `Badge` — for status chips (Pending, Verified, Draft, Active, Closed)
- `Skeleton` — for loading states on project list and checklist
- `Table` — for deliverable checklist rows

### 1.4 Phase 1 Smoke Test Checklist

Run all items manually before starting Phase 2.

```
DASHBOARD
[ ] After sign-in, dashboard shows a list of projects with progress bars
[ ] "New Project" button opens a modal; submitting creates a visible project card
[ ] Empty state appears when no projects exist

PROJECT DETAIL
[ ] Clicking a project navigates to /dashboard/projects/[id]
[ ] Deliverables extracted from SOW during onboarding are listed correctly
[ ] HITL banner appears when project status is 'draft'
[ ] "Approve Checklist" button removes the banner and enables Publish button
[ ] Can edit a deliverable's title/description/format inline; change persists on refresh
[ ] Can add a new deliverable manually; it appears in the list
[ ] Can delete a deliverable; confirmation modal appears; row is removed on confirm

CREDENTIAL VAULT
[ ] "Add Credential" modal opens; label and value can be entered
[ ] Saved credential appears as a blurred card
[ ] "Click to Reveal" toggles the blur
[ ] "Copy to Clipboard" copies the decrypted value to clipboard
[ ] Credential value is stored encrypted in Supabase (verify via Supabase dashboard)

PUBLISH
[ ] "Publish to Client" button is disabled when status is 'draft'
[ ] After approving checklist, Publish button becomes enabled
[ ] Clicking Publish generates a magic link (shown in modal or copied)
[ ] Magic link token exists in project_magic_links table with correct expiry
[ ] Two different agency accounts cannot see each other's projects (RLS)
```

---

## Phase 2 — Software Probe (File Verification Engine)

**Goal:** When a file is uploaded to a deliverable, automatically validate it against the required format and mark it Verified.

### 2.1 Feature List

- [ ] **File upload per deliverable** — Dropzone on each deliverable row (or slide-over). Accepts any file. Uploads to Supabase Storage at `agencies/{agencyId}/projects/{projectId}/deliverables/{deliverableId}/{filename}`.
- [ ] **Extension validation** — Server-side check: uploaded file's extension must match `deliverable.required_format` (e.g., `.ai`, `.eps`, `.pdf`). On mismatch, show an error modal with the expected vs received format — do not change status.
- [ ] **Image metadata inspection** — For image files (PNG, JPG, TIFF, PDF), use `sharp` to extract: DPI, color mode (RGB / CMYK / Grayscale), dimensions. Store results in `deliverables.metadata` (jsonb).
- [ ] **Status update** — On successful validation, set `deliverable.is_verified = true`. Status badge flips from "Pending" to "Verified" (green).
- [ ] **File URL stored** — Set `deliverable.file_url` to the Supabase Storage public/signed URL.
- [ ] **Re-upload** — Agency can replace a file. Re-runs probe. Resets `is_verified = false` during re-validation.
- [ ] **Audit log entry** — On upload + verification, write to `audit_logs`: event_type `asset_uploaded` and (if verified) `asset_verified`. Include metadata snapshot.
- [ ] **Progress bar update** — Dashboard % to close bar recalculates based on verified count.

### 2.2 New Dependencies

```
sharp          — image metadata inspection (DPI, color profile)
@supabase/storage-js  — already in supabase-js, confirm upload API
```

### 2.3 Server Actions Required

| Action | Location | What it does |
|---|---|---|
| `uploadDeliverableFile(deliverableId, file)` | `lib/supabase/deliverables.ts` | Upload to storage, run probe, update deliverable, write audit log |
| `runSoftwareProbe(file, requiredFormat)` | `lib/probe/index.ts` | Extension check + sharp metadata; returns `{ valid, metadata, error }` |
| `writeAuditLog(entry)` | `lib/supabase/audit.ts` | Generic audit log writer |

### 2.4 Phase 2 Smoke Test Checklist

```
FILE UPLOAD
[ ] Dropzone appears on each deliverable row
[ ] Uploading a file with correct extension → status flips to "Verified" (green badge)
[ ] Uploading a file with wrong extension → error modal with expected vs actual format shown; status stays Pending
[ ] Uploaded file URL is accessible (not broken); stored in deliverable.file_url
[ ] Re-uploading a file re-runs the probe and updates the status correctly

METADATA
[ ] For an image file, deliverable.metadata contains DPI, color mode, dimensions (verify in Supabase dashboard)
[ ] No crash on non-image files (PDF, ZIP, etc.) — metadata field is null or partial

AUDIT LOG
[ ] After upload, audit_logs table has a row with event_type 'asset_uploaded'
[ ] After successful verification, audit_logs has a row with event_type 'asset_verified'

PROGRESS BAR
[ ] Dashboard % to close bar increases after a deliverable is verified
[ ] Bar reaches 100% when all deliverables are verified
```

---

## Phase 3 — Client "Certified Closing" Portal

**Goal:** Client receives a magic link, views their assets and credentials, and signs off — closing the project.

### 3.1 Feature List

#### Magic Link Resolution (`/portal/[token]`)
- [ ] **Token validation** — On page load, look up `token` in `project_magic_links`. Reject if: not found, revoked, or past `expires_at`. Show a clear expired/invalid state with agency contact info.
- [ ] **Session-less access** — No login required. Token is the auth mechanism. Set a short-lived cookie to allow page refresh within session without re-entering the token URL.

#### Client Portal UI
- [ ] **Welcome overlay** — Full-screen modal on first load: "Your assets for [Project Name] are ready, [Client Name]." with a "View My Assets" CTA that dismisses it.
- [ ] **Asset table** — Lists all deliverables with: title, description, status badge (Verified / Pending), and a "Download" button for verified files. Pending files show a "Coming Soon" placeholder.
- [ ] **Credential Vault section** — Same card UI as agency side. Blurred by default, click to reveal, copy button. Each card shows the label only until revealed.
- [ ] **Progress indicator** — Shows "X of Y assets ready" so client understands if anything is still pending.
- [ ] **Final Sign-off** — Button: "I confirm receipt of all assets." Only enabled when all deliverables are verified. Clicking it:
  1. Records digital sign-off timestamp and sets `project.status = 'closed'`.
  2. Revokes the magic token (`revoked_at = now()`).
  3. Writes audit log entry: `client_signed_off`.
  4. Fires confetti animation.
  5. Shows a "Project Closed" confirmation screen.
- [ ] **Partial sign-off disabled** — If any deliverable is unverified, the sign-off button is disabled with a tooltip explaining why.

### 3.2 New Dependencies

```
canvas-confetti  — confetti on sign-off
resend           — transactional email for magic link delivery (or console.log stub)
```

### 3.3 Server Actions Required

| Action | Location | What it does |
|---|---|---|
| `resolvePortalToken(token)` | `lib/supabase/magic-links.ts` | Validate token, return project + deliverables + credentials |
| `clientSignOff(projectId, token)` | `lib/supabase/magic-links.ts` | Set project closed, revoke token, write audit log |
| `sendMagicLinkEmail(to, portalUrl)` | `lib/email/send.ts` | Send email via Resend (or stub) |

### 3.4 Phase 3 Smoke Test Checklist

```
MAGIC LINK
[ ] Portal URL from Phase 1 Publish step loads correctly in an incognito window
[ ] Expired token (manually set expires_at to past) shows the invalid/expired state
[ ] Revoked token shows the invalid state
[ ] Token from Agency A cannot resolve Agency B's project

PORTAL UI
[ ] Welcome overlay appears on first load; "View My Assets" dismisses it
[ ] Asset table lists all deliverables with correct status badges
[ ] Download button works for verified files; downloads correct file
[ ] Credential vault cards are blurred by default
[ ] "Click to Reveal" on a credential card shows the value
[ ] Copy button copies the decrypted credential value

SIGN-OFF
[ ] Sign-off button is disabled when any deliverable is unverified
[ ] After all deliverables are verified (set manually in Supabase if needed), button enables
[ ] Clicking sign-off triggers confetti animation
[ ] Project status changes to 'closed' in Supabase
[ ] Magic link is revoked; visiting the URL again shows invalid state
[ ] audit_logs has a 'client_signed_off' entry with correct timestamp

BACK ON DASHBOARD
[ ] Project card shows 'Closed' badge after client signs off
[ ] Publish button is hidden/disabled on a closed project
```

---

## Phase 4 — Audit Trail UI & Historical Archive

**Goal:** Agency can see a full timeline of project events and quickly retrieve past deliverables for returning clients.

### 4.1 Feature List

- [ ] **Audit timeline on Project Detail** — Vertical timeline component below the deliverable list. Shows all `audit_logs` entries for the project in reverse-chronological order. Icons per event type: upload, verified, client view, sign-off.
- [ ] **Event labels** — Human-readable: "Vector Logo uploaded by [Agency Name]", "Client downloaded Brand Guidelines", "Client signed off — Project Closed".
- [ ] **Archive search** — On the dashboard, a search bar that filters across all projects by client name, project name, or deliverable title.
- [ ] **Project archive tab** — Closed projects moved to an "Archive" tab on the dashboard to keep the active view clean.

### 4.2 Phase 4 Smoke Test Checklist

```
AUDIT TIMELINE
[ ] Project detail page shows a timeline with entries for all major events
[ ] Events are in reverse-chronological order (newest at top)
[ ] Each entry has a human-readable label and timestamp
[ ] Events created in Phases 1–3 (upload, verify, sign-off) all appear correctly

ARCHIVE
[ ] Dashboard has an "Archive" tab showing closed projects
[ ] Active projects tab does not show closed projects
[ ] Search bar filters projects by name/client across both tabs
```

---

## Post-MVP Backlog (Do Not Build Until Phases 1–4 Pass)

These features are explicitly out of scope for the initial MVP.

| Feature | Why deferred |
|---|---|
| Handover Certificate PDF (react-pdf) | Nice-to-have; sign-off confirmation screen covers the core need |
| Razorpay payment trigger | Requires payment account setup; high integration risk for MVP |
| Google Drive / Dropbox / Figma pull | Phase 4+ integration; adds complexity without validating core loop |
| Agency white-label (custom domain) | Requires DNS + infra work; Phase 5+ |
| Email reminders for pending deliverables | Phase 5+; cron job needed |
| Enterprise tier / usage limits | Post-revenue feature |
| Stripe/international payments | Post-MVP pricing experiment |

---

## Data Flow Summary

```
Agency signs up (Google OAuth)
  └─ Onboarding wizard (4 steps)
       └─ SOW upload → Gemini extraction → deliverables[] + credentials[]
            └─ HITL review on /dashboard/projects/[id]   [Phase 1]
                 ├─ Edit/approve checklist
                 ├─ Add credentials (encrypted)
                 └─ Publish → magic link generated
                      └─ File upload per deliverable [Phase 2]
                           └─ Software probe → is_verified = true
                                └─ Client opens /portal/[token] [Phase 3]
                                     ├─ Views assets + credential vault
                                     └─ Signs off → project.status = 'closed'
                                          └─ Audit timeline visible [Phase 4]
```

---

## Environment Variables (Reference)

```bash
# .env.local
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

CREDENTIAL_ENCRYPTION_KEY=   # 32-byte hex string for AES-256

RESEND_API_KEY=               # or leave blank to use console.log stub
```

---

## Open Decisions (Resolve Before Relevant Phase)

| Decision | Default assumed | Phase |
|---|---|---|
| Email sending in Phase 1 Publish: real email (Resend) or console.log stub? | console.log stub for now | 1 |
| Storage bucket: public or signed URLs for deliverable downloads? | Signed URLs (time-limited, more secure) | 2 |
| Magic link cookie: httpOnly session cookie or localStorage? | httpOnly cookie | 3 |
| Confetti library: `canvas-confetti` or custom CSS? | canvas-confetti | 3 |
