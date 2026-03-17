# **Product Requirements Document (PRD): Ceal AI**

## **1\. Project Overview**

**Product Name:** Ceal AI

**Target Audience:** Boutique Creative Agencies ($5k–$20k projects)

**Core Value Proposition:** Bridging the "Terminal Friction Gap" by automating asset verification and providing a structured, AI-audited "Closing Portal."

**The Problem:** High-ticket projects often enter a "Zombie State" where final delivery is disorganized, leading to payment delays, "missing asset" disputes months later, and unbillable senior staff hours.

## **2\. Strategic Objectives**

- **Reduce "Zombie Time":** Shorten the window between project completion and final payment.
- **Mitigate Reputational Risk:** Create an immutable record of delivery to prevent "missing asset" claims.
- **Recover Payroll:** Automate 80% of the manual checklist generation currently handled by senior staff.
- **Security:** Provide a standardized, secure vault for "Keys to the Kingdom" (API keys, DNS, etc.).

## **3\. Core Features & Functionality**

### **3.1 AI-Driven Asset Checklist Generation (The Agentic Assistant)**

- **Input:** Users upload unstructured project briefs, SOWs, or initial contracts (PDF/Docx).
- **Process:** GPT-4o powered extraction of deliverables.
- **Output:** A structured, domain-specific taxonomy of assets (e.g., Vector Logo, CMYK PDF, SSL Certs).
- **Human-in-the-Loop (HITL):** Account Managers must review and approve the AI-generated list before it goes live to the client.

### **3.2 The "Software Probe" Verification**

- **Function:** Automated validation of uploaded files against the checklist requirements.
- **Checks:** Verifies file extensions (e.g., ensuring an .AI file is actually uploaded for a vector logo), resolution (DPI), and color profiles (CMYK vs. RGB).
- **Status Indicators:** Real-time "Verified" vs. "Pending" status for every deliverable.

### **3.3 The "Certified Closing" Portal**

- **White-Label Environment:** A clean, professional portal for clients to access their assets.
- **Credential Vault:** A specialized, encrypted section for sensitive technical credentials (API keys, logins).
- **The "Final Sign-off" Trigger:** A digital handshake mechanism that confirms receipt of all assets, automatically triggering a "Project Closed" status and archiving the audit trail.

### **3.4 Audit Trail & Historical Record**

- **Immutable Logs:** Record of when every asset was uploaded, verified, and downloaded by the client.
- **Searchable Archive:** Ability for agencies to quickly retrieve files for clients who return 6–12 months later, without manual "scavenging."

## **4\. Technical Requirements & Feasibility**

### **4.1 AI Architecture**

- **LLM:** GPT-4o for high-accuracy extraction (benchmarked at 88.7%+).
- **Prompt Engineering:** specialized semantic mapping to recognize that "print-ready files" implies specific formats (PDF-X, CMYK, Bleeds).
- **Agentic Assistant:** AI does not act autonomously; it proposes, humans dispose.

### **4.2 Security & Data Handling**

- **Encryption:** AES-256 for credential storage.
- **File Storage:** Integrated with S3 or similar, with specific "Software Probes" to inspect metadata upon upload.
- **Permissions:** Granular access control (Agency Owner, Account Manager, Client IT, Client Stakeholder).

## **5\. User Experience (UX) Design**

- **Zero-Onboarding Friction:** Designed for clients who only interact with the tool during the final week. No complex logins or project management jargon.
- **Mobile Verification:** Responsive web interface for clients to "verify on the go" as identified in competitive gaps (Copilot analysis).
- **Visual Progress:** A clear "Percentage to Close" progress bar to gamify and accelerate the final 5% of the project.

## **6\. Business & Pricing Model**

- **Core Pricing:** $99/month (Flat rate for Boutique Agencies).
- **Logic:** Positions as an "Efficiency Insurance Policy" representing \<0.4% of typical agency monthly operating expenses.
- **Tiering:** Potential "Enterprise" tier for agencies doing $50k+ projects requiring custom security audits or higher storage limits.

## **7\. Success Metrics**

- **TTC (Time to Close):** Decrease in days from "Creative Approval" to "Final Handoff."
- **Support Ticket Reduction:** Decrease in client emails regarding "where is \[Asset X\]?"
- **Retention/Referral:** Qualitative feedback on the professionalism of the closing experience.

## **8\. Roadmap & Future Outlook**

- **Phase 1:** AI Checklist Extraction \+ Manual Upload Portal.
- **Phase 2:** Automated Software Probe (File Verification).
- **Phase 3:** Integration with Billing (Razorpay) to release final payment upon verified handoff.
- **Phase 4:** Integrations with Google Drive, Dropbox, and Figma for automated asset pulling.
