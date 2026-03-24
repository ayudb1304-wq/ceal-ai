# **Product Requirements Document (PRD): Ceal AI**

> **Last Updated:** 2026-03-24 — Revised to reflect current codebase state and confirmed MVP scope.

---

## **1\. Project Overview**

**Product Name:** Ceal AI

**Target Audience:** Boutique Creative Agencies ($5k–$20k projects)

**Core Value Proposition:** Bridging the "Terminal Friction Gap" by automating asset verification and providing a structured, AI-audited "Certified Closing Portal."

**The Problem:** High-ticket projects often enter a "Zombie State" where final delivery is disorganized, leading to payment delays, "missing asset" disputes months later, and unbillable senior staff hours.

**Tech Stack (Production):**
- **Framework:** Next.js (App Router, TypeScript)
- **Auth:** NextAuth.js v5 with Google OAuth
- **Database:** Supabase (PostgreSQL + RLS)
- **File Storage:** Supabase Storage (S3-compatible)
- **AI Engine:** Google Gemini 2.5 Flash (SOW extraction)
- **Email:** Resend (transactional magic link delivery)
- **Encryption:** Node.js `crypto` module, AES-256-CBC (credential vault)
- **PDF Generation:** React-PDF (Handover Certificate)
- **Styling:** Tailwind CSS v4 + shadcn/ui

---

## **2\. Strategic Objectives**

- **Reduce "Zombie Time":** Shorten the window between project completion and final payment.
- **Mitigate Reputational Risk:** Create an immutable, timestamped record of delivery to prevent "missing asset" claims.
- **Recover Payroll:** Automate 80% of the manual checklist generation currently handled by senior staff.
- **Security:** Provide a standardized, AES-256 encrypted vault for "Keys to the Kingdom" (API keys, DNS logins, SSL certs).

---

## **3\. MVP Feature Set — Confirmed Scope**

The following is the complete, confirmed feature set for the production MVP.

---

### **3.1 Agency Onboarding (4-Step Wizard)**

**Status: Implemented**

- **Step 1 — Profile:** Agency owner's name and role.
- **Step 2 — Branding:** Logo upload (Supabase Storage), primary brand color (hex picker). Used for white-labeled client portal header.
- **Step 3 — Legal/Tax:** GSTIN and bank details entry (stored in `agencies` table).
- **Step 4 — First Project:** SOW upload triggers the AI extraction flow (see 3.2).

**Redirect logic:**
- New authenticated users (no agency record) → `/onboarding`
- Returning users (agency + project exists) → `/dashboard`

---

### **3.2 AI-Driven Asset Checklist Generation (The Agentic Assistant)**

**Status: Implemented (onboarding). Project Detail upload — not yet implemented, required for MVP.**

- **Input:** Agency uploads SOW/project brief (PDF, DOCX, TXT, MD). Max file size: 10MB.
- **AI Engine:** Google Gemini 2.5 Flash via `lib/ai/sow-extraction.ts`.
- **Prompt:** Semantic extraction — maps phrases like "print-ready files" to specific asset types (Vector AI/EPS, CMYK PDF, etc.) and extracts technical credentials (API keys, hosting logins).
- **Output:** Structured JSON with three arrays: `deliverables[]`, `credentials[]`, `notes[]`.
- **Human-in-the-Loop (HITL):** AI output is surfaced as a proposed checklist. The agency owner must explicitly review and click "Approve Checklist" (activating the project from `draft` → `active`) before the client portal can be published. A persistent `HitlBanner` is shown on the project detail page until approval.
- **Post-approval editing:** Agency can add, edit, or delete deliverable items at any time before publishing.

**SOW Upload on Project Detail Page:**
- Agencies can upload a SOW document directly from the Project Detail page at any time — not only during onboarding. This is required for projects created manually via "New Project" (which start with a blank checklist).
- Uploading a SOW on the Project Detail page triggers the same Gemini extraction flow as onboarding (`extractSowDeliverablesAction`).
- The extracted deliverables and credentials are appended to (not replace) any existing checklist items, so agencies don't lose manual entries.
- The uploaded SOW file is stored in Supabase Storage and the URL is saved to `projects.sow_document_url`.
- If a SOW was already uploaded (during onboarding), a "Replace SOW" option is shown alongside the existing filename. Replacing re-runs extraction and appends new items.

---

### **3.3 Project & Deliverable Management**

**Status: Implemented**

**Agency Dashboard (`/dashboard`):**
- List of all projects with project name, client name, status badge, and a "Percentage to Close" progress bar (calculated as verified deliverables / total deliverables).
- "New Project" button opens a modal to create a project manually (without SOW upload).

**Project Detail (`/dashboard/projects/[projectId]`):**
- Deliverable checklist with add/edit/delete actions.
- Each deliverable has: title, description, required format (e.g., `.ai`, `.eps`), upload slot, and a verification status badge (`Pending` / `Verified`).
- Credential Vault section (see 3.5).
- Audit Log Timeline section (see 3.6).
- Publish button (see 3.7).

---

### **3.4 File Uploads for Deliverables**

**Status: Not yet implemented — required for MVP**

- **Storage:** Supabase Storage bucket (`deliverable-files`), private by default with signed URL access.
- **Agency upload flow:** Each deliverable row has an upload dropzone. Agency uploads the final file. On upload success, `deliverables.file_url` is updated with the Supabase Storage path.
- **Basic Software Probe (extension check):** On upload, the server action checks the uploaded file's extension against `deliverables.required_format`. If they match, `deliverables.is_verified` is set to `true` and a "Verified" green badge is shown. If they do not match, the upload is accepted but the badge stays "Pending" with a warning: _"File type mismatch — expected `.ai`, got `.png`."_
- **Manual override:** Agency owner can manually toggle `is_verified` to `true` for any deliverable, regardless of file type (to handle edge cases).
- **Client downloads:** In the client portal, verified deliverables show a signed download URL (24-hour expiry generated server-side). Unverified deliverables are visible but not downloadable until marked verified.

> **Out of scope for MVP:** DPI inspection, CMYK color profile checking (sharp/canvas). Deferred to Phase 2.

---

### **3.5 Credential Vault**

**Status: Implemented**

- Agency adds credentials (label + value) per project via the Project Detail page.
- Values are encrypted with AES-256-CBC using `CREDENTIAL_ENCRYPTION_KEY` before storage in Supabase (`credentials.encrypted_value` + `credentials.iv`).
- **UI (agency side):** Credential card with blurred text, "Click to Reveal" toggle, and "Copy to Clipboard" button.
- **UI (client portal side):** Same card pattern — blurred by default, reveal-on-click, copy-to-clipboard. Credentials are decrypted server-side and passed to the portal page as plaintext only for the authenticated portal session.
- Delete credential action available (agency only).

---

### **3.6 Audit Log Timeline**

**Status: Table exists (`audit_logs`), UI and write logic not yet implemented — required for MVP**

**Events to record:**

| Event Type | Trigger |
|---|---|
| `project_created` | Agency creates project |
| `checklist_approved` | Agency approves HITL checklist |
| `deliverable_uploaded` | Agency uploads a file to a deliverable |
| `deliverable_verified` | Deliverable marked as verified (auto or manual) |
| `credential_added` | Agency adds a credential |
| `project_published` | Agency publishes the client portal |
| `portal_accessed` | Client opens the magic link (first access) |
| `portal_revisited` | Client opens the magic link on subsequent visits |
| `project_signed_off` | Client completes the final sign-off |

**Agency UI:** Vertical timeline component on the Project Detail page showing event label, actor (agency or client), and timestamp. Displayed below the deliverable checklist. Read-only.

---

### **3.7 Publishing & Magic Link Delivery**

**Status: Magic link generation implemented. Email delivery not yet implemented — required for MVP**

- **Publish action:** Agency clicks "Publish to Client" button on the Project Detail page.
- **Pre-publish guard:** If any deliverable has no file uploaded, show a warning modal: _"X deliverables have no files uploaded. Publish anyway?"_ Agency can override.
- **Magic link generation:** Server generates a UUID token stored in `project_magic_links` with a **7-day expiry**. The portal URL is `https://[domain]/portal/[token]`.
- **Email delivery via Resend:** On publish, a server action calls Resend API to send a branded email to `projects.client_email` containing:
  - Subject: _"Your [Project Name] assets are ready — [Agency Name]"_
  - Body: Agency logo, a short message, and a prominent "View Your Assets" CTA button linking to the portal URL.
  - Sender: Configured Resend domain (agency's brand).
- **UI feedback:** After publishing, the Publish button area shows the magic link with a "Copy Link" button and a "Resend Email" option.
- **Republish:** Clicking Publish again revokes the old token and generates a new 7-day token. A new email is sent.

---

### **3.8 Client "Certified Closing" Portal (`/portal/[token]`)**

**Status: Not yet implemented — required for MVP (highest priority)**

This is the core product experience. The portal is publicly accessible via magic link — no account or password required.

**Token validation (server-side, on every request):**
- Look up `magic_token` in `project_magic_links`.
- If not found, expired (`expires_at < now()`), or revoked (`revoked_at IS NOT NULL`) → show a static error page: _"This link has expired or is no longer valid. Please contact your agency for a new link."_
- If valid → render the portal and log `portal_accessed` (first visit) or `portal_revisited` (subsequent visits) to `audit_logs`.

**Portal flow (4 stages, single-page scroll or stepped):**

**Stage 1 — Welcome Overlay:**
- Full-screen overlay on first load.
- Shows agency logo + brand color, project name, client name.
- Headline: _"Your [Project Name] assets are ready for handoff."_
- Single CTA: _"View My Assets →"_ dismisses the overlay.

**Stage 2 — Asset Table:**
- Table/grid of all deliverables with: title, description, required format, verification status badge.
- Only `is_verified = true` deliverables show a download button (signed URL, 24-hour expiry).
- Unverified deliverables show a "Pending" badge with no download button.
- Progress indicator: _"X of Y assets verified and ready."_

**Stage 3 — Credential Vault:**
- List of credential cards with blurred values.
- "Click to Reveal" shows plaintext value (decrypted server-side, passed in initial page load).
- "Copy to Clipboard" button on each card.
- Section is visually separated and labeled: _"Secure Keys & Credentials."_

**Stage 4 — Final Handshake (Sign-off):**
- Shown only when all deliverables are `is_verified = true` OR agency has manually published anyway.
- Checkbox: _"I, [client name], confirm receipt of all assets and credentials listed above."_
- "Sign Off & Complete Handover" button (disabled until checkbox is ticked).
- On click:
  1. Server action sets `projects.status = 'closed'`.
  2. Logs `project_signed_off` to `audit_logs`.
  3. Revokes the magic link (`project_magic_links.revoked_at = now()`).
  4. Generates and returns a **Handover Certificate PDF** (see 3.9).
  5. Triggers confetti animation on the client.
  6. Shows a success state: _"Handover complete. Download your certificate below."_

---

### **3.9 Handover Certificate PDF**

**Status: Not yet implemented — required for MVP**

Generated server-side using React-PDF on client sign-off.

**Certificate contents:**
- Agency name and logo (from `agencies.logo_url` and `agencies.name`)
- Project name, client name
- Date of sign-off (formatted)
- Unique Certificate ID (UUID of the `audit_logs` sign-off event)
- Full list of delivered assets (title + required format for each)
- Footer: _"This certificate is an automated record generated by Ceal AI. It confirms that all listed assets were verified and acknowledged as received by the client."_

**Delivery:** PDF is streamed as a download response. A Supabase Storage URL for the certificate is also saved to the project record for later retrieval by the agency.

---

## **4\. Technical Requirements**

### **4.1 AI Architecture**

- **LLM:** Google Gemini 2.5 Flash (already integrated). Extraction prompt uses domain-specific semantic mapping.
- **Agentic pattern:** AI proposes, agency approves. No autonomous publishing.
- **Supported input formats:** PDF (pdf-parse), DOCX (mammoth), TXT, MD.

### **4.2 Security & Data Handling**

- **Credential encryption:** AES-256-CBC with per-entry IV. Encryption key stored in `CREDENTIAL_ENCRYPTION_KEY` env var (never in DB).
- **File storage:** Supabase Storage private bucket. All client downloads use signed URLs with 24-hour expiry.
- **Portal access:** UUID-based magic tokens with 7-day expiry and revocation on sign-off. No session/cookie for clients.
- **RLS:** All Supabase tables have Row Level Security. Agency owners can only read/write their own data. The client portal uses the Supabase service role key server-side to fetch data for a valid token (bypasses RLS intentionally for public portal reads).
- **Email:** Resend API key stored in `RESEND_API_KEY` env var.

### **4.3 Environment Variables (Complete List)**

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | NextAuth JWT signing key |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_URL` | Canonical app URL (e.g., `https://app.ceal.ai`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CREDENTIAL_ENCRYPTION_KEY` | AES-256 key for credential vault (hex string) |
| `RESEND_API_KEY` | Resend transactional email API key |

### **4.4 Database Schema (Current — Supabase)**

All tables have RLS enabled. Schema is in `supabase/migrations/`.

| Table | Key Fields |
|---|---|
| `agencies` | `id, name, logo_url, brand_color, gstin, bank_details, owner_id, owner_email` |
| `projects` | `id, agency_id, client_name, client_email, name, status (draft/active/closed), sow_document_url` |
| `deliverables` | `id, project_id, title, description, required_format, is_verified, file_url, metadata (JSONB)` |
| `credentials` | `id, project_id, label, encrypted_value, iv` |
| `audit_logs` | `id, project_id, deliverable_id, actor_user_id, event_type, event_label, event_metadata (JSONB), created_at` |
| `project_magic_links` | `id, project_id, magic_token, expires_at, revoked_at, created_by, last_accessed_at` |

---

## **5\. User Experience (UX) Requirements**

- **Agency UX:** All errors use custom modals (no `alert()`). Loading states use shadcn/ui skeleton components, especially during AI extraction (can take 3–8 seconds).
- **Client UX:** Zero-friction — no account creation, no project management concepts. Single-purpose portal for the closing week. Fully responsive (mobile-first).
- **Visual Progress:** "Percentage to Close" progress bar on every project card and at the top of the client portal (verified deliverables / total deliverables × 100).
- **White-labeling:** Client portal header uses `agencies.logo_url` and `agencies.brand_color` to present the agency's brand, not Ceal AI branding.
- **Confetti:** Triggered client-side (canvas-confetti or similar) on successful sign-off. One-time, non-repeating.

---

## **6\. Business & Pricing Model**

- **Core Pricing:** $99/month (flat rate for boutique agencies).
- **Value framing:** "Efficiency Insurance Policy" — less than 0.4% of a typical agency's monthly operating expenses.
- **Future tiering:** Enterprise tier for $50k+ agencies (custom security audits, higher storage limits, team members, SSO). Out of scope for MVP.

---

## **7\. Success Metrics**

- **TTC (Time to Close):** Decrease in days from "Creative Approval" to client sign-off.
- **Support Ticket Reduction:** Decrease in client emails asking "where is [Asset X]?"
- **Certificate Rate:** % of projects that reach a signed Handover Certificate (proxy for full funnel completion).
- **Retention:** Monthly active agencies (projects published per month).

---

## **8\. MVP Implementation Checklist**

The following items remain to be built for production launch. All other features listed in this PRD are implemented.

| # | Feature | Priority | Notes |
|---|---|---|---|
| 1 | Client Portal (`/portal/[token]`) | Critical | Full 4-stage flow: welcome → assets → credentials → sign-off |
| 2 | File uploads for deliverables | Critical | Supabase Storage, extension-check Software Probe |
| 3 | Resend email integration | Critical | Send magic link on publish |
| 4 | Audit log write logic | High | Record all 9 event types to `audit_logs` |
| 5 | Audit log timeline UI | High | Vertical timeline on Project Detail page |
| 6 | Handover Certificate PDF | High | React-PDF, generated on sign-off |
| 7 | Pre-publish guard modal | Medium | Warn if deliverables have no files |
| 8 | Republish / revoke logic | Medium | Revoke old token, generate new one |
| 9 | Portal error page | Medium | Expired/invalid token state |
| 10 | Manual `is_verified` toggle | Medium | Agency override for edge cases |
| 11 | SOW upload on Project Detail page | High | Triggers same Gemini extraction; appends to existing checklist; stores file in Supabase Storage |

---

## **9\. Out of Scope for MVP**

- Deep file verification (DPI inspection, CMYK color profile checking) — Phase 2
- Payment integration (Razorpay/Cashfree) — Phase 3
- Third-party integrations (Google Drive, Dropbox, Figma) — Phase 4
- Team members / multi-user agencies — Post-MVP
- Credential rotation / version history — Post-MVP
- SOW document storage (current: URL field unused) — Post-MVP
- Native mobile apps — Post-MVP

---

## **10\. Future Roadmap**

- **Phase 2:** Full Software Probe — DPI + CMYK color profile validation using `sharp`.
- **Phase 3:** Payment integration (Razorpay) — release final payment trigger on verified handoff.
- **Phase 4:** Integrations with Google Drive, Dropbox, and Figma for automated asset pulling.
- **Phase 5:** Team members, role-based access (Agency Owner, Account Manager, Client IT, Client Stakeholder).
