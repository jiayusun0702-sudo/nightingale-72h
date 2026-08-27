# Nightingale Care Note System Architecture

## System Overview
Nightingale Care Note is a longitudinal shared patient record system designed to serve clinicians, healthcare staff, and patients with role-based visibility, automated privacy safeguards (PHI redaction), and optimized high-priority views.

---

## Key Architectural Principles

### 1. Role-Based Access Control (RBAC) & Visibility Filtering
- Clinician: Full read/write access to all timeline notes, critical warnings, and sensitive AI-generated clinical summaries.
- Staff: Operational access to care logs, tasks, and notes; restricted from viewing sensitive mental/psychiatric diagnoses.
- Patient: Highly restricted view; access limited to patient-facing education materials and basic logs. Sensitive AI notes and internal tags are automatically redacted or hidden at the database query level.

### 2. PHI Redaction Engine
- Real-time automated scanning for Protected Health Information (PHI) before persistency.
- Patterns targeting US/SG Phone numbers, Social Security/National IDs, and standard email formats.
- Redacted strings are sanitized to formats like [REDACTED_PHONE], [REDACTED_EMAIL], and [REDACTED_ID].

### 3. Rapid Readability (Glance View / Top Card)
- Engineered for 10-second contextual comprehension.
- Aggregates high-priority open actions and critical highlights.
- Implemented with memory caching and targeted query indexing to maintain P95 latency < 200ms.

### 4. Direct Provenance Jumping
- Highlights link directly to historical care events via provenance_pointer.
- Front-end smooth scrolling and element highlighting eliminate manual search through long timeline logs.

---

## Component Topology

+--------------------------------------------------------+
|                Next.js Frontend Client                 |
|  - Role Selector (Clinician / Staff / Patient)         |
|  - Top Card (Glance View, P95 Latency Meter)           |
|  - Longitudinal Timeline Feed with Provenance Links   |
+--------------------------------------------------------+
                           |  HTTP REST / API
                           v
+--------------------------------------------------------+
|                FastAPI Backend (Python)                |
|  - Auth & RBAC Middleware                             |
|  - PHI Auto-Redaction Sanitizer                        |
|  - Glance & Timeline Aggregation Services             |
+--------------------------------------------------------+
                           |  SQLAlchemy ORM
                           v
+--------------------------------------------------------+
|                   SQLite Database                      |
|  - Patient, CareNote, TimelineEntry, TopCard           |
+--------------------------------------------------------+
