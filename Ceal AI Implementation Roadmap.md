# **Ceal AI: Comprehensive Implementation Roadmap**

> **Last Updated:** 2026-03-25 — Phase 3 complete. Phase 4 in progress.

This document is the master source of truth for building **Ceal AI**, a Micro-SaaS designed to bridge the "Terminal Friction Gap" in high-ticket creative projects. Use it alongside the Product Requirements Document and the Micro-SaaS Handoff-Audit Analysis.

---

## **1\. Core Tech Stack**

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Server Actions for all mutations |
| Auth | NextAuth.js v5 + Google OAuth | JWT sessions, custom sign-in page |
| Database | Supabase (PostgreSQL + RLS) | Row Level Security on all tables |
| File Storage | Supabase Storage | Private buckets, signed URLs |
| AI Engine | Google Gemini 2.5 Flash | SOW extraction via `lib/ai/sow-extraction.ts` |
| Email | Resend | Transactional magic link delivery |
| Encryption | Node.js `crypto` (AES-256-CBC) | Credential vault |
| PDF Generation | React-PDF | Handover Certificate on sign-off |
| Styling | Tailwind CSS v4 + shadcn/ui | PascalCase components, camelCase vars |
| Payments | Razorpay | Post-MVP only |

---

## **2\. Database Schema (Supabase)**

All tables have RLS enabled. Migrations live in `supabase/migrations/`.

### **agencies**
- `id`: uuid (primary key)
- `name`: text
- `logo_url`: text (Supabase Storage path — white-labeling)
- `brand_color`: text (hex)
- `gstin`: text
- `bank_details`: text
- `contact_name`: text
- `owner_role`: text
- `owner_id`: uuid (references auth.users)
- `owner_email`: text

### **projects**
- `id`: uuid
- `agency_id`: uuid
- `name`: text
- `client_name`: text
- `client_email`: text
- `status`: enum (`draft`, `active`, `closed`)
- `sow_document_url`: text (Supabase Storage path)
- `created_at`: timestamp

### **deliverables**
- `id`: uuid
- `project_id`: uuid
- `title`: text (e.g., "Vector Logo")
- `description`: text
- `required_format`: text (e.g., `.ai`, `.eps`)
- `is_verified`: boolean (default: false)
- `file_url`: text (Supabase Storage path)
- `metadata`: jsonb (stores DPI, color profile, file size)

### **credentials**
- `id`: uuid
- `project_id`: uuid
- `label`: text (e.g., "Staging Server Login")
- `encrypted_value`: text (AES-256-CBC)
- `iv`: text (initialization vector)

### **audit\_logs**
- `id`: uuid
- `project_id`: uuid
- `deliverable_id`: uuid (nullable)
- `actor_user_id`: text (agency user ID or `"client"`)
- `event_type`: text (see Phase 3 for full event list)
- `event_label`: text
- `event_metadata`: jsonb
- `created_at`: timestamp

### **project\_magic\_links**
- `id`: uuid
- `project_id`: uuid
- `magic_token`: text (UUID, unique)
- `expires_at`: timestamp (7 days from creation)
- `revoked_at`: timestamp (nullable — set on client sign-off or republish)
- `created_by`: text (agency user ID)
- `last_accessed_at`: timestamp

---

## **3\. MVP Implementation Phases**

---

### **Phase 1: Landing Page & Auth**
**Status: Complete**

#### Screens
- [x] **Landing Page** (`/`) — Hero emphasizing the "Zombie Project" problem, Terminal Friction Gap section, trust sections, CTA to `/auth/signin`.
- [x] **Sign-in Page** (`/auth/signin`) — Google OAuth via NextAuth.js v5. Custom branded sign-in UI.

#### Logic
- [x] Authenticated users with no agency record → redirect to `/onboarding`.
- [x] Authenticated users with an existing agency + project → redirect to `/dashboard`.
- [x] Unauthenticated requests to protected routes → redirect to `/auth/signin`.

---

### **Phase 2: Agency Onboarding**
**Status: Mostly complete — SOW re-upload on project detail page pending**

#### Screens
- [x] **Onboarding Wizard** (`/onboarding`) — 4-step stepper with progress bar.
  - [x] Step 1 — Profile: full name, role, agency name.
  - [x] Step 2 — Branding: logo upload (file name stored; Supabase Storage wiring pending), primary brand color (hex picker).
  - [x] Step 3 — Legal/Tax: GSTIN, bank details.
  - [x] Step 4 — First Project: project name, client name, client email, SOW upload + AI extraction.

#### AI Extraction (Step 4)
- [x] Agency uploads SOW (PDF, DOCX, TXT, MD — max 10MB).
- [x] Server Action calls Gemini 2.5 Flash (`extractSowDeliverablesAction`).
- [x] Gemini returns structured JSON: `{ deliverables[], credentials[], notes[] }`.
- [x] Extraction result displayed as a fixed-height scrollable card list (no raw JSON shown).
- [x] **Bug fixed:** Extraction result is now passed back to the wizard via `onExtractionComplete` callback and persisted to DB on form submit.
- [x] Extracted deliverables bulk-inserted into `deliverables` table.
- [x] Extracted credentials bulk-inserted into `credentials` table with placeholder value `"TBD — add value in project"`.

#### SOW Re-upload on Project Detail (new)
- [x] Agency can upload or replace a SOW directly from the Project Detail page.
- [x] Same Gemini extraction flow is triggered (`reExtractSowAction`).
- [x] Extracted items are **appended** to (not replace) existing deliverables and credentials.
- [x] SOW file stored in Supabase Storage (`sow-documents` bucket); path saved to `projects.sow_document_url`.
- [x] If a SOW already exists, filename shown with a "Replace SOW" option.

---

### **Phase 3: Agency Dashboard, Sidebar & Project Management**
**Status: Complete ✅**

#### 3a. Sidebar Navigation
- [x] **Layout:** A persistent sidebar layout wraps all routes under `/dashboard/*` via a shared layout component (`app/dashboard/layout.tsx`).
- [x] **Desktop — Collapsible Icon Rail:** Collapsed/expanded toggle, state persisted in `localStorage`.
- [x] **Mobile — Hamburger:** Slide-in drawer with backdrop. Tap outside to close.
- [x] **Navigation Items:** Clients → `/dashboard`, Audit Log → `/dashboard/audit-log`, Settings → `/dashboard/settings`.
- [x] Active route highlighted with primary brand color. Agency name + logo at top.

#### 3b. Settings Page (`/dashboard/settings`)
- [x] **Agency Profile tab:** Edit name, contact name, role.
- [x] **Branding tab:** Update brand color (logo filename stored).
- [x] **Legal & Tax tab:** Edit GSTIN and bank details.
- [x] **Account tab:** Show connected Google account email; sign out button.
- [x] All edits saved via Server Actions. Success/error shown inline per form.

#### 3c. Clients Section (`/dashboard` + `/dashboard/clients/[clientId]`)
- [x] Dashboard home shows **clients grid** (`ClientCard`) — name, company, email, phone, project count badge.
- [x] **Add Client** modal — name, company, email, phone, notes. Redirects to new client detail page on success.
- [x] **Client detail page** — contact header with project count badge, back link, notes, Edit Client + New Project buttons.
- [x] **Edit Client** modal — update all fields; auto-closes on save.
- [x] **New Project** modal (on client detail) — client pre-locked; redirects to project page on success.

#### 3d. Project Detail (`/dashboard/projects/[projectId]`)
- [x] Deliverable checklist — add, edit, delete items.
- [x] **Fixed deliverable format set** — dropdown of 14 file formats + 3 text types (hex, url, text). AI constrained to this list with normalizer fallback.
- [x] Each deliverable shows: title, description, format label, `Pending` / `Verified` badge.
- [x] **File deliverables** — upload button per row, Supabase Storage (`deliverable-files` bucket), `accept` attribute scoped to format.
- [x] **Text deliverables** (hex/url/text) — inline input + Save button; auto-marks verified on save.
- [x] **Basic Software Probe** — extension check on upload. Match → `is_verified = true`. Mismatch → "Pending" badge + warning.
- [x] **Manual verification toggle** — mark any deliverable verified/unverified.
- [x] Credential Vault — add, edit, delete encrypted credentials; reveal/copy UI; edit modal pre-clears TBD placeholder.
- [x] HITL Banner — persistent until agency approves checklist (`draft` → `active`).
- [x] Publish button — generates 7-day magic link, sends Resend email, shows portal URL + copy + resend buttons.
- [x] **SOW upload / re-extraction** — upload or replace SOW, Gemini extracts and appends deliverables + credentials.
- [x] **Activity timeline** — vertical icon-rail timeline of all project events (read-only).

#### 3e. Resend Email Integration
- [x] On publish, sends branded email to client with "View My Assets" CTA.
- [x] Republish revokes old token before creating a new one.
- [x] "Resend Email" button with sent/error feedback on project detail.

#### 3f. Audit Log
- [x] **Write logic** — all 16 event types logged:

  | Event Type | Trigger |
  |---|---|
  | `project_created` | Agency creates a project |
  | `checklist_approved` | Agency approves HITL checklist |
  | `deliverable_added` | New deliverable created |
  | `deliverable_updated` | Deliverable title/format/description edited |
  | `deliverable_deleted` | Deliverable removed |
  | `deliverable_uploaded` | File uploaded to a deliverable |
  | `deliverable_value_saved` | Text value (hex/url/text) saved |
  | `deliverable_verified` | Deliverable marked verified (auto or manual) |
  | `credential_added` | Credential added |
  | `credential_updated` | Credential label/value edited |
  | `credential_deleted` | Credential deleted |
  | `sow_uploaded` | SOW uploaded and extracted |
  | `project_published` | Portal published |
  | `portal_accessed` | Client first visit (Phase 4) |
  | `portal_revisited` | Client return visit (Phase 4) |
  | `project_signed_off` | Client sign-off (Phase 4) |

- [x] **Project-level timeline UI** — vertical timeline on Project Detail page.
- [x] **Global Audit Log page** (`/dashboard/audit-log`) — filterable table by project + event type.

---

### **Phase 4: Client "Certified Closing" Portal**
**Status: In progress**

#### Route: `/portal/[token]`
Publicly accessible. No account or password required.

#### Token Validation (server-side, on every request)
- [ ] Look up `magic_token` in `project_magic_links`.
- [ ] If not found, expired (`expires_at < now()`), or revoked → render static error page: _"This link has expired or is no longer valid. Please contact your agency for a new link."_
- [ ] If valid → render portal; log `portal_accessed` or `portal_revisited` to `audit_logs`.

#### Portal Flow (4 stages)

**Stage 1 — Welcome Overlay**
- [ ] Full-screen overlay on first load.
- [ ] Shows agency logo + brand color, project name, client name.
- [ ] Headline: _"Your [Project Name] assets are ready for handoff."_
- [ ] Single CTA: _"View My Assets →"_ dismisses the overlay.

**Stage 2 — Asset Table**
- [ ] Table of all deliverables: title, description, required format, verification badge.
- [ ] Verified deliverables show a download button (Supabase Storage signed URL, 24-hour expiry).
- [ ] Unverified deliverables show "Pending" badge — no download button.
- [ ] Progress indicator: _"X of Y assets verified and ready."_

**Stage 3 — Credential Vault**
- [ ] Credential cards with blurred values.
- [ ] "Click to Reveal" shows plaintext (decrypted server-side, passed in initial page load).
- [ ] "Copy to Clipboard" on each card.

**Stage 4 — Final Handshake**
- [ ] Shown when at least one deliverable is verified (or agency published anyway).
- [ ] Checkbox: _"I, [client name], confirm receipt of all assets and credentials listed above."_
- [ ] "Sign Off & Complete Handover" button (disabled until checkbox ticked).
- [ ] On click:
  - Set `projects.status = 'closed'`.
  - Log `project_signed_off` to `audit_logs`.
  - Revoke magic link (`revoked_at = now()`).
  - Generate Handover Certificate PDF (see below).
  - Trigger confetti animation.
  - Show success state with PDF download button.

#### Handover Certificate PDF (React-PDF)
- [ ] Generated server-side on sign-off.
- [ ] Contents: agency name + logo, project name, client name, date of sign-off, unique Certificate ID (UUID of the sign-off audit log entry), full deliverable list (title + format), footer disclaimer.
- [ ] PDF streamed as download response. Storage URL also saved to project record.

---

## **4\. Post-MVP Phases**

---

### **Phase 5: Deep Software Probe**

- [ ] On deliverable file upload, use `sharp` to inspect image metadata.
- [ ] Checks: file extension, DPI (flag if < 300 for print deliverables), color profile (flag if RGB for CMYK-required deliverables).
- [ ] Update `deliverables.metadata` JSONB field with `{ dpi, colorProfile, fileSize, dimensions }`.
- [ ] Surface metadata in the deliverable row: _"300 DPI · CMYK · 2.4 MB"_

---

### **Phase 6: Payment Integration**

- [ ] Integrate Razorpay (India Corridor focus).
- [ ] Agency can attach a payment amount to a project.
- [ ] On publish, a Razorpay payment link is included in the client email alongside the portal link.
- [ ] Client pays → webhook confirms → project status updated; agency notified.

---

### **Phase 7: Third-Party Integrations**

- [ ] **Google Drive:** Pull final asset files directly from a Drive folder into deliverable slots.
- [ ] **Dropbox:** Same as Drive.
- [ ] **Figma:** Export frames/components directly as deliverable files via the Figma API.

---

## **5\. Key UI Components**

| Component | Used In | Status |
|---|---|---|
| Onboarding Stepper | `/onboarding` | Done |
| SOW Extraction Review | `/onboarding`, Project Detail | Done (onboarding); pending (project detail) |
| Project Card | `/dashboard` | Done |
| New Project Modal | `/dashboard` | Done |
| Deliverable Checklist | Project Detail | Done |
| Add/Edit Deliverable Modal | Project Detail | Done |
| Credential Vault | Project Detail, Client Portal | Done (agency); pending (client) |
| HITL Banner | Project Detail | Done |
| Publish Button | Project Detail | Done |
| **Sidebar Nav** | All `/dashboard/*` routes | **Pending** |
| **Settings Page** | `/dashboard/settings` | **Pending** |
| **Global Audit Log** | `/dashboard/audit-log` | **Pending** |
| File Upload Dropzone | Project Detail (per deliverable) | Pending |
| Audit Log Timeline | Project Detail | Pending |
| Client Portal | `/portal/[token]` | Pending |
| Welcome Overlay | Client Portal | Pending |
| Handover Certificate PDF | Client Portal (sign-off) | Pending |

---

## **6\. Security & Compliance**

- **Credential encryption:** AES-256-CBC with per-entry IV. Key stored in `CREDENTIAL_ENCRYPTION_KEY` env var — never in the DB.
- **File access:** Supabase Storage private buckets only. All downloads use signed URLs (24-hour expiry for client portal, scoped to project).
- **Portal security:** Magic token is a UUID stored in `project_magic_links` with `expires_at` (7 days) and `revoked_at`. Validated server-side on every portal request.
- **RLS:** All tables scoped by `owner_id` / `agency_id`. Client portal reads use the service role key server-side — the only intentional RLS bypass, scoped to valid token lookups only.
- **No client-side secrets:** `SUPABASE_SERVICE_ROLE_KEY`, `CREDENTIAL_ENCRYPTION_KEY`, `RESEND_API_KEY`, and `GEMINI_API_KEY` are server-only env vars. Never prefixed with `NEXT_PUBLIC_`.

---

## **7\. Development Standards**

- **Naming:** PascalCase for components, camelCase for variables and functions.
- **Errors:** Custom modal dialogs for all errors — never `alert()` or `confirm()`.
- **Loading states:** shadcn/ui Skeleton components for AI extraction and async data fetches.
- **Mutations:** All DB writes via Next.js Server Actions. No direct client-side Supabase calls for mutations.
- **Context files:** Always reference this roadmap and the Product Requirements Document before implementing a feature.
- **Vibe focus:** Prioritise the two "Aha!" moments — the SOW-to-Checklist extraction and the Certified Closing sign-off with confetti.
