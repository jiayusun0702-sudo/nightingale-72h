const API_BASE = "http://127.0.0.1:8000/api/v1";

export interface Highlight {
  id: number;
  content: string;
  risk_reason: string;
  risk_level: string;
  provenance_pointer: string;
  priority_score: number;
}

export interface GlanceData {
  patient_id: number;
  top_card_highlights: Highlight[];
  open_actions: string[];
  critical_flags: string[];
  load_time_ms: number;
}

export interface TimelineEntry {
  id: number;
  care_note_id: number;
  author_role: string;
  author_id: string;
  timestamp: string;
  type: string;
  content: string;
  provenance_pointer: string;
  version: number;
}

export async function fetchGlanceView(noteId: number, role: string = "CLINICIAN"): Promise<GlanceData> {
  const res = await fetch(`${API_BASE}/care-notes/${noteId}/glance`, {
    headers: { "x-user-role": role }
  });
  if (!res.ok) throw new Error("Failed to fetch Glance View");
  return res.json();
}

export async function fetchTimeline(noteId: number, role: string = "CLINICIAN"): Promise<TimelineEntry[]> {
  const res = await fetch(`${API_BASE}/care-notes/${noteId}/timeline`, {
    headers: { "x-user-role": role }
  });
  if (!res.ok) throw new Error("Failed to fetch Timeline");
  return res.json();
}

export async function createTimelineEntry(entry: {
  care_note_id: number;
  author_role: string;
  author_id: string;
  type: string;
  content: string;
  provenance_pointer?: string;
}) {
  const res = await fetch(`${API_BASE}/timeline-entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to create Timeline Entry");
  return res.json();
}

