# **Ceal AI: Comprehensive Implementation Roadmap**

This document serves as the master source of truth for building **Ceal AI**, a Micro-SaaS designed to bridge the "Terminal Friction Gap" in high-ticket creative projects.

## **1\. Core Tech Stack**

* **Framework:** Next.js (App Router)  
* **Authentication:** Auth.js (v5) with Google Provider  
* **Database:** Supabase (PostgreSQL)  
* **Styling:** Tailwind CSS \+ Shadcn/UI  
* **AI Engine:** Google Studio Gemini API for checklist extraction  
* **File Storage:** Supabase Storage (S3-compatible) with metadata inspection  
* **Payments:** Razorpay/Cashfree (India Corridor focus)

## **2\. Database Schema (Supabase)**

### **agencies**

* id: uuid (primary key)  
* name: text  
* logo\_url: text (white-labeling)  
* brand\_color: text (hex)  
* gstin: text  
* owner\_id: uuid (references auth.users)

### **projects**

* id: uuid  
* agency\_id: uuid  
* client\_name: text  
* client\_email: text  
* status: enum (draft, active, closed)  
* sow\_document\_url: text  
* created\_at: timestamp

### **deliverables**

* id: uuid  
* project\_id: uuid  
* title: text (e.g., "Vector Logo")  
* description: text  
* required\_format: text (e.g., ".ai", ".eps")  
* is\_verified: boolean (default: false)  
* file\_url: text  
* metadata: jsonb (stores DPI, color profile, size)

### **credentials**

* id: uuid  
* project\_id: uuid  
* label: text (e.g., "Staging Server Login")  
* encrypted\_value: text  
* iv: text (initialization vector)

## **3\. Implementation Phases**

### **Phase 1: Landing Page & Auth**

* **Screens:**  
  * [x] **Landing Page:** Hero section emphasizing the "Zombie Project" problem. "Get Paid Faster" CTA. *(Done: full landing with hero, trust sections, Terminal Friction Gap, CTA to `/auth/signin`.)*  
  * [x] **Login/Signup:** Auth.js Google Sign-in flow. *(Done: Google OAuth with custom sign-in page and protected authenticated routes.)*  
* **Logic:**  
  * [x] Redirect new users to Agency Onboarding. *(Done: authenticated users without completed onboarding are routed to `/onboarding`.)*  
  * [x] Redirect returning users to Dashboard. *(Done: users with persisted agency + first project state are routed to `/dashboard`.)*

### **Phase 2: Agency Onboarding (The 2-Minute Setup)**

* **Screens:**  
  * [x] **Onboarding Stepper:** 4-step wizard for profile, branding, legal/tax, and first project setup. *(Done: responsive onboarding flow with progress stepper and SOW upload staging UI.)*  
    1. **Profile:** Name & Role.  
    2. **Branding:** Upload logo, pick primary color.  
    3. **Legal/Tax:** GSTIN and bank details entry.  
    4. **First Project:** "The Magic Moment" (SOW Upload).  
* **AI Integration:** \- On SOW upload, trigger a Next.js Server Action to call GPT-4o.  
  * Prompt: "Extract all specific deliverables and technical credentials required in this SOW."  
  * Output: JSON list of deliverables.

### **Phase 3: Agency Dashboard & Project Management**

* **Screens:**  
  * Dashboard: List of active projects with "Percentage to Close" progress bars.  
  * Project Detail:  
    * Deliverable Checklist (Agentic Assistant output).  
    * Edit/Add/Delete deliverable items.  
    * "Publish" button to trigger Magic Link to client.  
* **Features:**  
  * **HITL (Human-in-the-Loop):** Agency owners must toggle a "Ready for Client" switch on the checklist.

### **Phase 4: The "Software Probe" (Verification Engine)**

* **Logic:**  
  * When a file is uploaded to deliverables, run a validation script.  
  * Check file extension vs required\_format.  
  * Use a library (e.g., canvas or sharp) to inspect image metadata (DPI/CMYK).  
* **UI:**  
  * Update status from "Pending" to "Verified" with a green badge.

### **Phase 5: Client "Certified Closing" Portal**

* **Screens:**  
  * Client Portal: Passwordless entry via Magic Link.  
  * **Flow:**  
    1. **Welcome Overlay:** "Your assets for \[Project\] are ready."  
    2. **Asset Table:** View verified files.  
    3. **Credential Vault:** View encrypted keys.  
    4. **Final Handshake:** "Sign-off & Download" button.  
* **Logic:**  
  * Digital signature capture or checkbox "I confirm receipt of all assets."  
  * Trigger Confetti on completion.  
  * Generate a "Handover Certificate" (PDF) using React-PDF.

## **4\. Key UI Components (Shadcn/UI Requirements)**

* **Progress Stepper:** For onboarding and project status.  
* **File Dropzone:** For SOW and asset uploads with progress states.  
* **Credential Card:** Blurred/Hidden text with "Click to Reveal" and "Copy to Clipboard."  
* **Audit Log Timeline:** Vertical list of "Asset Uploaded," "Verified," "Client Downloaded."

## **5\. Security & Compliance**

* **Credential Storage:** Use crypto module in Node.js to encrypt credentials before storing in Supabase.  
* **Public Data Access:** All client portal links must be UUID based and check against a magic\_token with an expiration date.  
* **Data Privacy:** RLS (Row Level Security) on Supabase to ensure Agencies only see their own data.

## **6\. Development Instructions for Cursor**

* **Context:** Always refer to the implementation-roadmap.md and Product Requirements Document.  
* **Naming Convention:** Use PascalCase for components, camelCase for variables/functions.  
* **Error Handling:** Use custom Modals (not browser alerts) for all errors. Implement loading skeletons for AI extraction states.  
* **Vibe Coding Focus:** Prioritize the "Aha\!" moment (SOW to Checklist) and the "Certified Closing" feeling.