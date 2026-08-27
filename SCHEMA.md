# Nightingale Database Schema Reference

## Data ER Model Overview
The database uses SQLite to persist structured longitudinal care records, role-specific metadata, and rapid readability caches.

---

## Database Tables

### 1. patients
Stores basic demographic data for patients.

- id: INTEGER, PRIMARY KEY, AUTOINCREMENT (Unique patient ID)
- name: VARCHAR(100), NOT NULL (Patient full name)
- dob: DATE, NOT NULL (Date of birth)
- mrn: VARCHAR(50), UNIQUE, NOT NULL (Medical Record Number)
- created_at: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP (Record creation time)

---

### 2. care_notes
The container table representing a patient longitudinal record session.

- id: INTEGER, PRIMARY KEY, AUTOINCREMENT (Unique care note container ID)
- patient_id: INTEGER, FOREIGN KEY (patients.id) (Linked patient ID)
- title: VARCHAR(255), NOT NULL (Title of the care note)
- status: VARCHAR(50), DEFAULT ACTIVE (Status: ACTIVE, ARCHIVED)

---

### 3. timeline_entries
Individual entries in the longitudinal timeline (notes, AI summaries, patient-submitted inputs).

- id: INTEGER, PRIMARY KEY, AUTOINCREMENT (Unique timeline entry ID)
- care_note_id: INTEGER, FOREIGN KEY (care_notes.id) (Associated Care Note ID)
- author_role: VARCHAR(50), NOT NULL (Author role: clinician, staff, patient)
- author_id: VARCHAR(100), NOT NULL (User ID of author)
- type: VARCHAR(50), NOT NULL (Entry type: manual_note, ai_summary, action)
- content: TEXT, NOT NULL (Sanitized content: PHI auto-redacted)
- provenance_pointer: VARCHAR(100), NULLABLE (Identifier tag for top-card provenance jumping)
- is_sensitive: BOOLEAN, DEFAULT FALSE (If TRUE, restricted from Patient role view)
- timestamp: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP (Entry time)

---

### 4. top_card_highlights
Caches high-priority risks and critical actions for the 10-second Rapid Readability Glance View.

- id: INTEGER, PRIMARY KEY, AUTOINCREMENT (Unique highlight record ID)
- care_note_id: INTEGER, FOREIGN KEY (care_notes.id) (Linked Care Note ID)
- risk_level: VARCHAR(20), NOT NULL (Risk level: HIGH, MEDIUM, LOW)
- risk_reason: TEXT, NOT NULL (Short summary of critical issue)
- provenance_pointer: VARCHAR(100), NOT NULL (Targeted pointer to source timeline entry)
- created_at: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP (Highlight creation time)
