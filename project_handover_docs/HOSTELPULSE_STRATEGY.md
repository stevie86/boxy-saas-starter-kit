# HostelPulse: Strategic Roadmap & Go-to-Market Plan

## 1. Executive Summary

**HostelPulse** is a modern, SaaS-based Property Management System (PMS) tailored for the hostel industry. Unlike legacy solutions that are clunky and expensive, HostelPulse offers a streamlined, enterprise-grade platform (SSO, Audit Logs) at an accessible price point.

**Current Status:** Functional MVP with high-value features (Stripe, Teams, Inventory) but hampered by technical debt (Hybrid Architecture, Type Safety).
**Goal:** Stabilize the platform, launch a pilot program, and capture 5% of the SMB hostel market within 12 months.

---

## 2. Technical Improvement Sprint ("Operation Bedrock")

**Objective:** Transform the codebase from a "fragile prototype" to a "production-grade engine" in 2 weeks.

### Sprint KPIs
*   **Build Stability:** 100% success rate on CI/CD pipeline (currently failing).
*   **Type Safety:** 0 usages of `any` in critical paths (`lib/`, `models/`).
*   **Performance:** <100ms response time for Booking Creation API.
*   **Code Cleanliness:** Removal of all `temp_*` directories and orphaned components.

### Phase 1: Stabilization (Week 1)
- [ ] **Fix Routing Architecture:**
    - Delete `app/` directory (revert to pure Pages Router).
    - Move `app/page.tsx` logic to `pages/index.tsx`.
    - Fix `next.config.js` (remove invalid `eslint` config).
- [ ] **Type Safety Overhaul:**
    - Replace `any` in `lib/queries/*.ts` with `Prisma.XWhereInput`.
    - Strict typing for external services (`lib/stripe.ts`, `lib/pushbullet.ts`).
- [ ] **Cleanup:**
    - Delete `components/bookings/` (orphaned).
    - Archive/Delete `temp_backup`, `temp_feedback`, etc.

### Phase 2: Fortification (Week 2)
- [ ] **Data Integrity:**
    - Implement "Soft Deletes" for `Bookings` and `Users` in Prisma Schema.
    - Add Unit Tests for `BookingService`.
- [ ] **Refactoring:**
    - Extract business logic from `pages/api/*` into `lib/services/*`.

---

## 3. Business Plan & Go-to-Market Strategy

### Unique Selling Propositions (USPs)
1.  **"Enterprise Lite":** The only SMB-focused PMS offering SSO & Audit Logs out of the box (Security/Compliance).
2.  **Team-First:** Native multi-tenancy allows seamless collaboration between front-desk, housekeeping, and management.
3.  **Modern UX:** Snappy, mobile-friendly interface built for the "iPad generation" of hostel staff.

### Target Customer Segments
1.  **The "Modern Boutique" (Primary):** Independent, design-led hostels (20-100 beds). Tech-savvy owners who hate Excel.
2.  **Small Chains (Secondary):** Regional operators with 3-5 locations needing centralized reporting.

### Pricing Model
*   **Freemium (Seed):** Up to 20 beds free. (Captures data, builds trust).
*   **Pro ($49/mo):** Unlimited beds, Stripe integration, Team roles.
*   **Enterprise (Custom):** SSO, Audit Logs, Dedicated Support.

### Sales Channels
1.  **Direct Outreach:** Cold email/LinkedIn to Hostel Owners (see Questionnaire below).
2.  **Partnerships:** Integration with OTAs (Hostelworld, Booking.com) - *Phase 2*.
3.  **Content Marketing:** "How to run a profitable hostel" blog/guides.

---

## 4. Customer Insight & Feedback Loop

### Prospect Discovery Questionnaire
*Use this in initial calls to understand their workflow.*

1.  "Walk me through your check-in process on a busy Friday night. Where does it usually slow down?"
2.  "How do you currently handle group bookings or room moves? (Excel, Whiteboard, Software?)"
3.  "Have you ever had a double-booking? How much did that cost you in refunds/reputation?"
4.  "If your front-desk staff makes a mistake (e.g., wrong price), how do you find out who did it?" (Selling point for Audit Logs)
5.  "What is the one feature in your current system that makes you want to scream?"

### Scalable Feedback System
*   **In-App Widget:** "Report a Bug" / "Suggest Feature" button on every dashboard page (connects to Slack/Trello).
*   **NPS Surveys:** Automated email 30 days after signup: "How likely are you to recommend HostelPulse?"
*   **"The Pulse" User Group:** A private Discord/WhatsApp group for the first 50 "Founding Members" to give direct feedback to the dev team.

---

## 5. Phased Rollout Plan

### Milestone 1: Alpha (Month 1)
*   **Goal:** 5 Friendly Users (beta testers).
*   **Deliverable:** Stable codebase (post-sprint), manual onboarding.
*   **Focus:** Squashing bugs found in real-world usage.

### Milestone 2: Public Beta (Month 2-3)
*   **Goal:** 50 Active Hostels.
*   **Deliverable:** Self-serve signup, Stripe billing enabled.
*   **Focus:** Onboarding UX friction reduction.

### Milestone 3: Growth (Month 6+)
*   **Goal:** $5k MRR (Monthly Recurring Revenue).
*   **Deliverable:** API Integrations (OTAs), Mobile App (Wrapper).
*   **Focus:** Marketing and Sales scaling.

---

## 6. Resource Allocation

*   **Lead Developer (You):** 60% Coding (Features), 20% Maintenance, 20% Architecture.
*   **Product/Sales (You/Partner):** 50% Customer Calls, 30% Marketing, 20% Support.
*   **Infrastructure:** Vercel (Frontend/API), Neon/Supabase (Postgres), AWS S3 (Images).

---

## 7. Competitive Analysis

| Competitor | Pros | Cons | HostelPulse Advantage |
| :--- | :--- | :--- | :--- |
| **Cloudbeds** | Huge feature set, industry standard. | Expensive, complex, overkill for small hostels. | Simpler, faster, cheaper. |
| **Excel / Google Sheets** | Free, infinite flexibility. | Error-prone, no collaboration, no analytics. | Structured data, automation, safety. |
| **HostelSnap** | Niche focus. | Outdated UI, lack of modern APIs. | Modern stack, better UX, Developer API. |
