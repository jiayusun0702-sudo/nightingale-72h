# nightingale-72h
Longitudinal patient note clinic web app with real-time role-based collaboration, AI scribe integration, and provenance tracking.
This project is built for the **Nightingale 72-Hour Build Challenge** (Aug 2026). It solves the problem of fragmented EHR narratives by consolidating clinician, staff, patient, and AI inputs into a single, glanceable, and traceable timeline.

---

## 🚀 Quick Start (Setup & Run Instructions)

### Prerequisites

- **Node.js** (v18 or later) + **npm** / **yarn**
- **Python** (v3.9 or later) + **pip**
- **Git** (for cloning)

### 1. Clone the Repository

```bash
git clone https://github.com/jiayusun0702-sudo/nightingale-72h.git
cd nightingale-72h
```

### 2. Backend Setup (FastAPI + SQLite)
Open a new PowerShell terminal in the project root.

```
# Navigate to backend folder
cd backend

# (Recommended) Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate   # If using PowerShell

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --port 8000
Note: If your entry file is located at backend/app/main.py, adjust the command to uvicorn app.main:app --reload --port 8000. If you use a different filename (e.g., server.py), modify accordingly.
```

### 3. Frontend Setup (Next.js + React)

Open **another** PowerShell terminal in the project root.

```powershell
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Run the development server
npm run dev
```

### 4. Access the Application
Frontend (Web UI): http://localhost:3000
Backend API Docs (Swagger): http://localhost:8000/docs

## 🔐 Role-Based Access Control (RBAC) — Server-Side Enforcement
We strictly enforce RBAC server-side using FastAPI middleware and dependency injection. UI-based hiding is never used as the primary security control.

### Enforcement Location
Middleware & Dependency: backend/rbac.py
Database Query Filtering: Applied in the service layer (e.g., timeline_service.py) using SQLAlchemy filters based on current_user.role.

### Role Hierarchy & Permissions
```text
Role	  View Internal AI Notes	View Staff/Clinician     NotesEdit Own Notes	 View Patient
Patient	  ❌ Blocked at DB level	❌ Blocked at DB level  ❌ (Read-only)	 ✅ 
Staff	  ❌ Blocked at DB level	✅  (own clinic scope)  ✅ 	          ❌ 
Clinician  ✅ 	                  ✅  (full view)	       ✅ 	          ❌ 
Admin	  ✅  (clinic-scoped)	✅  (clinic-scoped)     ✅                   ❌ 
```

### How It Works
1. Authentication: JWT token (or session) is decoded to extract user_id and role.
2. Authorization: Every API endpoint that returns timeline entries or notes passes the current user context to the database query, which adds a WHERE clause to filter out sensitive fields (is_sensitive = True for patients) or restricts access based on clinic_id and author_role rules.
3. Test Coverage: See tests/test_rbac_scope.py for automated assertions.

## 🛡️ PHI Redaction Pipeline (Privacy First)
We implement an automated No-PHI Redaction Pipeline that scrubs Protected Health Information before it is sent to any LLM (AI Scribe) or persisted to the database.

### Redaction Location
Core Function: backend/redaction.py → redact_phi(text: str) -> str
Integration Point: Called as a mandatory pre-processor:
         Before saving any manual_note or ai_summary to the timeline_entries table.
         Before sending prompts to the LLM (OpenAI/Anthropic).

### Redaction Rules (Regex-based)
PII/PHI Type	Pattern Target	Replacement Output
Full Name	Common first/last name combos	[REDACTED_NAME]
Phone Number	SG/US/International numbers	[REDACTED_PHONE]
National ID / IC	NRIC (SG), SSN (US), etc.	[REDACTED_ID]
Email Address	Standard email regex	[REDACTED_EMAIL]

### Data Flow
User Input / AI Raw Text
         ↓
   [redact_phi()]  ← PHI scrubbing happens here
         ↓
Sanitized Text (e.g., "Call [REDACTED_PHONE] for follow-up")
         ↓
   Save to DB / Send to LLM

## 🧪 Running Automated Micro-Tests
We use pytest for testing. All tests are located in the tests/ directory.

### Prerequisites for Testing
Ensure your virtual environment is activated and dependencies (pytest, httpx, etc.) are installed.
```
# From the project root (or backend folder)
pip install pytest pytest-asyncio httpx
```
### Run All Tests
```
pytest tests/ -v
```

### Individual Test Files
Test File	                    Purpose
test_rbac_scope.py	          Asserts role-based data isolation (Staff != Clinician write, Patient filters).
test_revision_history.py	    Asserts version increment on edit, revert restores state, audit logging.
test_highlight_provenance.py	Asserts every highlight has a valid provenance_pointer resolving to a timeline entry.
test_concurrent_edits.py	    Asserts simultaneous edits on different sections don't clobber each other.
test_self_learning_importance.py	(Bonus) Simulates manual highlighting & asserts priority score changes.

## 📁 Project Structure (Simplified)
```text
nightingale-72h/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── rbac.py              # Role-based middleware & dependencies
│   ├── redaction.py         # PHI sanitizer (Regex + NLP fallback)
│   ├── models.py            # SQLAlchemy / SQLite ORM models
│   ├── services/            # Business logic (timeline, glance, etc.)
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js App Router (pages)
│   ├── components/          # React components (GlanceView, Timeline, etc.)
│   ├── package.json
│   └── next.config.js
├── tests/
│   ├── test_rbac_scope.py
│   ├── test_revision_history.py
│   ├── test_highlight_provenance.py
│   ├── test_concurrent_edits.py
│   └── test_self_learning_importance.py (Bonus)
├── docs/
│   ├── ARCHITECTURE.md      # System diagram & principles
│   └── SCHEMA.md            # ER diagram & table definitions
├── ATTRIBUTION.txt          # Third-party licenses
└── README.md               # You are here!
```

## 🎥 Demo Scenarios
1. Glance View & AI Scribe Integration: Open patient page → See Top Card in <200ms → Click highlight to jump to source timeline entry.
2. Collaborative Audit Trail: Staff adds note with @clinician tag → Clinician edits plan → Revision history shows diffs → Revert to previous version.
Refer to docs/ARCHITECTURE.md for deeper technical details.

## 📜 License & Attributions
All external libraries and models are listed in ATTRIBUTION.txt with their respective licenses (MIT, Apache 2.0, etc.).
****
# Built with ❤️ for the Nightingale 72-Hour Build Challenge (2026)

