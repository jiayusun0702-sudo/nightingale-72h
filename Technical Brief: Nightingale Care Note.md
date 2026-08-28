# Technical Brief: Nightingale Care Note
## 1. System Architecture & Diagram
```
+-----------------------------------------------------------------------------------+
|                                  PRESENTATION LAYER                               |
|   +---------------------------------------------------------------------------+   |
|   |                      Next.js 15 Client App (React)                        |   |
|   |  [10s Top Card]  |  [Longitudinal Timeline]  |  [RBAC View Switcher]     |   |
|   +---------------------------------------------------------------------------+   |
+----------------------------------------|------------------------------------------+
                                         | REST / GraphQL / WebSocket
+----------------------------------------v------------------------------------------+
|                                   APPLICATION LAYER                               |
|   +-------------------+    +----------------------+    +----------------------+   |
|   |   Glance Engine   |    | Provenance Resolver  |    |  RBAC & Privacy Guard|   |
|   | (P95 < 50ms Cache)|    | (Pointer Indexer)    |    | (PII/Sensitive Filter)|   |
|   +-------------------+    +----------------------+    +----------------------+   |
|   +---------------------------------------------------------------------------+   |
|   |                      Collaboration & Mention Engine                       |   |
|   +---------------------------------------------------------------------------+   |
+----------------------------------------|------------------------------------------+
                                         |
+----------------------------------------v------------------------------------------+
|                                    DATA LAYER                                     |
|   +--------------------+  +---------------------+  +--------------------------+   |
|   | Longitudinal DB    |  | Revision Audit Store|  | Vector / AI Cache Store  |   |
|   | (Entries, Comments)|  | (Immutable Diffs)   |  | (AI_Scribed_Notes/Learn) |   |
|   +--------------------+  +---------------------+  +--------------------------+   |
+-----------------------------------------------------------------------------------+
```
### Key Architectural Pillars
High-Readability Layer: Separates high-priority actionable clinical alerts (Top Card) from the raw chronological stream (Longitudinal Feed) to guarantee sub-10s comprehension.
Granular RBAC Enforcer: Filters data in-flight based on user role (Clinician, Staff, Patient), preventing unauthorized PII or internal sensitive evaluations from crossing boundary nodes.
Immutable Provenance Indexer: Assigns a deterministic provenance_pointer (e.g., entry_001) to every discrete datum, enabling zero-latency UI scrolling and cross-referencing.

## 2. Comprehensive Data Schema
### Entity-Relationship (ER) Overview
```text
[ Patient_Record ] 1 ─── N [ Timeline_Entry ] 1 ─── N [ Revision_Log ]
         │                        │
         │ 1                      │ 1
         ▼ N                      ▼ N
  [ Top_Card_Highlight ]   [ Entry_Comment ]
         │                        │
         └───────────── Pointer ──┘ (Links via provenance_pointer)
                                  │
                                  │ N
                                  ▼ 1
                          [ AI_Scribed_Note ] ─── N [ AI_Learning_Feedback ]
```

### JSON Schema Specification
```JSON
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Nightingale Care Note Schema",
  "type": "object",
  "properties": {
    "patient_id": { "type": "string" },
    "top_card": {
      "type": "object",
      "properties": {
        "open_actions": { "type": "array", "items": { "type": "string" } },
        "highlights": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "risk_level": { "type": "string", "enum": ["HIGH", "MEDIUM", "LOW"] },
              "reason": { "type": "string" },
              "provenance_pointer": { "type": "string" }
            }
          }
        },
        "latency_ms": { "type": "number" }
      }
    },
    "timeline_entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "entry_id": { "type": "string" },
          "author_role": { "type": "string", "enum": ["clinician", "staff", "patient"] },
          "author_id": { "type": "string" },
          "type": { "type": "string", "enum": ["manual_note", "ai_summary", "lab_result"] },
          "content": { "type": "string" },
          "is_sensitive": { "type": "boolean" },
          "timestamp": { "type": "string", "format": "date-time" },
          "mentions": { "type": "array", "items": { "type": "string" } },
          "provenance_pointer": { "type": "string" },
          "comments": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "comment_id": { "type": "string" },
                "author_id": { "type": "string" },
                "text": { "type": "string" }
              }
            }
          },
          "revisions": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "revision_id": { "type": "number" },
                "timestamp": { "type": "string" },
                "content": { "type": "string" },
                "reverted_from_version": { "type": "number", "nullable": true }
              }
            }
          },
          "ai_scribed_data": {
            "type": "object",
            "properties": {
              "audio_transcript_id": { "type": "string" },
              "confidence_score": { "type": "number" },
              "learning_feedback": {
                "type": "object",
                "properties": {
                  "user_accepted": { "type": "boolean" },
                  "edit_distance": { "type": "number" }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### AI Learning Loop Integration
  ·Scribing: Audio transcripts generate AI_Scribed_Note objects linked to a Timeline_Entry.
  
  ·Feedback Capture: When a clinician edits or reverts an AI-generated note, the system computes the edit distance and logs user_accepted: false.
  
  ·Continuous Alignment: These feedback records are batched to fine-tune context prompts and preference embeddings for future medical summaries.

## 3. Assumptions, First-Principles Thinking & Trade-offs
### First-Principles Thinking
·Core Problem: Clinicians spend up to 35% of their shift scanning unstructured, multi-author EHR entries, raising diagnostic cognitive load and burnout risk.

·First Principle Solved: Medical data must be instantly scannable (10s Glance), strictly traceable (Provenance), and context-isolated (RBAC) without sacrificing full historical transparency.

### Critical Scope Decisions & Trade-offs
In-Memory State vs. Distributed Persistence:
  
  ·Trade-off: Prioritized a fast, local-first in-memory/JSON client state over full PostgreSQL sync for the 72h prototype.
  
  ·Rationale: Maximizes P95 latency responsiveness (<50ms) during judge evaluations while demonstrating the exact schema and UI interaction mechanics.

Rule-based PII Redaction vs. Full NLP NER Pipeline:
  
  ·Trade-off: Used lightweight regex-based sanitization for phone numbers/identifiers instead of heavy backend ML models.
  
  ·Rationale: Guarantees deterministic, zero-lag client performance during live recording while proving privacy boundary capability.

Client-Side Provenance Indexing:
  
  ·Trade-off: Generated static entry_XXX hashes instead of full cryptographic hash trees.
  
  ·Rationale: Fully meets the visual auditability and UI jump requirements while keeping code complexity lean.
