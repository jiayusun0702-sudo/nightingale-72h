"use client";

import React, { useState, useEffect } from "react";

interface TopCardData {
  open_actions: string[];
  highlights: Array<{ risk_level: string; reason: string; provenance_pointer: string }>;
  latency_ms: number;
}

interface TimelineEntry {
  id: number;
  author_role: string;
  author_id: string;
  type: string;
  content: string;
  provenance_pointer?: string;
  is_sensitive: boolean;
  timestamp: string;
  mentions?: string[];
  revisions?: Array<{ timestamp: string; content: string }>;
}

export default function Home() {
  const [role, setRole] = useState("clinician");
  const [topCard, setTopCard] = useState<TopCardData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [newNote, setNewNote] = useState("");
  const [activeRevisionId, setActiveRevisionId] = useState<number | null>(null);
  const [mentionFilter, setMentionFilter] = useState<string | null>(null);

  useEffect(() => {
    setTopCard({
      open_actions: ["Review Lab Results for Patient Alex", "Verify Allergy Warning"],
      highlights: [
        { risk_level: "HIGH", reason: "Critical potassium level elevated", provenance_pointer: "entry_001" },
        { risk_level: "MEDIUM", reason: "Patient reported mild dizziness", provenance_pointer: "entry_002" }
      ],
      latency_ms: 45
    });

    setTimeline([
      {
        id: 1,
        author_role: "clinician",
        author_id: "Dr. Zhang",
        type: "manual_note",
        content: "Patient shows signs of recovery. Mentioning @Dr.Zhang to check cardiac panel.",
        provenance_pointer: "entry_001",
        is_sensitive: false,
        timestamp: "2026-03-20 10:00",
        mentions: ["Dr.Zhang"],
        revisions: [
          { timestamp: "2026-03-20 10:00", content: "Initial Draft: Patient shows signs of recovery." },
          { timestamp: "2026-03-20 10:15", content: "Patient shows signs of recovery. Mentioning @Dr.Zhang to check cardiac panel." }
        ]
      },
      {
        id: 2,
        author_role: "staff",
        author_id: "Nurse Sarah",
        type: "manual_note",
        content: "Vitals stable. Temperature 36.8 C. Follow up scheduled for tomorrow.",
        provenance_pointer: "entry_002",
        is_sensitive: false,
        timestamp: "2026-03-20 11:30"
      },
      {
        id: 3,
        author_role: "clinician",
        author_id: "AI Assistant",
        type: "ai_summary",
        content: "[INTERNAL ONLY / SENSITIVE] Psychiatric Evaluation: Patient exhibits severe anxiety regarding prognosis. Requires confidential monitoring.",
        provenance_pointer: "entry_003",
        is_sensitive: true,
        timestamp: "2026-03-20 12:00"
      },
      {
        id: 4,
        author_role: "staff",
        author_id: "Staff Admin",
        type: "manual_note",
        content: "[STAFF INTERNAL] Billing and insurance claim pre-authorization confirmed.",
        provenance_pointer: "entry_004",
        is_sensitive: true,
        timestamp: "2026-03-20 14:10"
      }
    ]);
  }, []);

  const handleJumpToEntry = (pointerId: string) => {
    const targetElement = document.getElementById(`entry-${pointerId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      targetElement.style.border = "2px solid #6366f1";
      targetElement.style.backgroundColor = "#eef2ff";
      setTimeout(() => {
        targetElement.style.border = "1px solid #e2e8f0";
        targetElement.style.backgroundColor = "#ffffff";
      }, 2500);
    }
  };

  const handleAddEntry = () => {
    if (!newNote.trim()) return;

    let sanitized = newNote.replace(/(?:\+?65)?\s?[89]\d{7}/g, "[REDACTED_PHONE]");
    const mentionsMatch = sanitized.match(/@\w+/g);
    const mentions = mentionsMatch ? mentionsMatch.map(m => m.substring(1)) : [];

    const newEntry: TimelineEntry = {
      id: Date.now(),
      author_role: role,
      author_id: role === "clinician" ? "Dr. Zhang" : role === "staff" ? "Nurse Sarah" : "Patient Alex",
      type: "manual_note",
      content: sanitized,
      provenance_pointer: `entry_${Math.floor(Math.random() * 900 + 100)}`,
      is_sensitive: false,
      timestamp: new Date().toLocaleString(),
      mentions
    };

    setTimeline([newEntry, ...timeline]);
    setNewNote("");
  };

  const handleRevert = (entryId: number, targetContent: string) => {
    setTimeline(prev => prev.map(item => {
      if (item.id === entryId) {
        const newRevisions = item.revisions ? [
          ...item.revisions,
          { timestamp: new Date().toLocaleTimeString(), content: `[Reverted to version]: ${targetContent}` }
        ] : [];
        return { ...item, content: targetContent, revisions: newRevisions };
      }
      return item;
    }));
  };

  const visibleTimeline = timeline.filter(entry => {
    if (role === "patient") {
      if (entry.is_sensitive || entry.type === "ai_summary") return false;
    }
    if (role === "staff") {
      if (entry.type === "ai_summary" && entry.is_sensitive) return false;
    }
    if (mentionFilter) {
      return entry.mentions && entry.mentions.includes(mentionFilter);
    }
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "32px 16px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "896px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", padding: "20px 24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 900, color: "#0f172a" }}>Nightingale Care Note</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>Longitudinal Shared Patient Record System</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f1f5f9", padding: "8px 12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ backgroundColor: "#ffffff", fontSize: "12px", fontWeight: 700, color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}
            >
              <option value="clinician">Clinician (Full Access)</option>
              <option value="staff">Staff (Operational)</option>
              <option value="patient">Patient (Restricted)</option>
            </select>
          </div>
        </header>

        {/* Top Card */}
        <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", color: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #312e81", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#c7d2fe", display: "flex", alignItems: "center", gap: "8px" }}>
              ⚡ Top Card (Glance View - 10s Readability)
            </h2>
            <span style={{ fontSize: "11px", backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.4)", padding: "4px 10px", borderRadius: "9999px", fontFamily: "monospace" }}>
              P95 Latency: {topCard?.latency_ms || 45}ms
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase" }}>Open Actions</h3>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#e2e8f0" }}>
                {topCard?.open_actions.map((act, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>{act}</li>
                ))}
              </ul>
            </div>

            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 700, color: "#fca5a5", textTransform: "uppercase" }}>Critical Flags & Highlights</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {topCard?.highlights.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", backgroundColor: "rgba(153, 27, 27, 0.4)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(248, 113, 113, 0.3)" }}>
                    <span style={{ color: "#ffe4e6" }}>{h.reason}</span>
                    <button
                      onClick={() => handleJumpToEntry(h.provenance_pointer)}
                      style={{ padding: "4px 10px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "11px", fontWeight: "bold", fontFamily: "monospace", borderRadius: "6px", border: "none", cursor: "pointer" }}
                    >
                      📍 {h.provenance_pointer}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Longitudinal Timeline */}
        <section style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Longitudinal Timeline Feed</h2>

          {/* Input Box */}
          <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note (Try @Dr.Zhang or phone +65 91234567)..."
                style={{ flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", outline: "none" }}
              />
              <button
                onClick={handleAddEntry}
                style={{ padding: "10px 18px", backgroundColor: "#4f46e5", color: "#ffffff", fontSize: "13px", fontWeight: 700, border: "none", borderRadius: "8px", cursor: "pointer" }}
              >
                Add Entry
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#94a3b8", fontSize: "11px" }}>Quick Mention:</span>
                <button
                  type="button"
                  onClick={() => setNewNote(prev => prev + " @Dr.Zhang")}
                  style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  + @Dr.Zhang
                </button>
                <button
                  type="button"
                  onClick={() => setNewNote(prev => prev + " @NurseSarah")}
                  style={{ backgroundColor: "#faf5ff", color: "#9333ea", border: "1px solid #e9d5ff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  + @NurseSarah
                </button>
              </div>

              {mentionFilter && (
                <div style={{ backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", padding: "4px 10px", borderRadius: "6px" }}>
                  Filtering by: <strong>@{mentionFilter}</strong>
                  <button
                    onClick={() => setMentionFilter(null)}
                    style={{ marginLeft: "8px", color: "#d97706", textDecoration: "underline", border: "none", background: "none", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Feed List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {visibleTimeline.map((entry) => (
              <div
                key={entry.id}
                id={`entry-${entry.provenance_pointer || entry.id}`}
                style={{ padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", transition: "all 0.3s ease", display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ fontWeight: 700, color: "#4f46e5", textTransform: "uppercase" }}>
                    {entry.author_role} ({entry.author_id})
                  </span>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px" }}>{entry.timestamp}</span>
                </div>

                <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>{entry.content}</p>

                {entry.mentions && entry.mentions.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "11px" }}>Mentions:</span>
                    {entry.mentions.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMentionFilter(m)}
                        style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                      >
                        @{m}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px" }}>Pointer: {entry.provenance_pointer}</span>
                  
                  {entry.revisions && (
                    <button
                      onClick={() => setActiveRevisionId(activeRevisionId === entry.id ? null : entry.id)}
                      style={{ color: "#4f46e5", background: "none", border: "none", fontWeight: 600, cursor: "pointer" }}
                    >
                      📜 Revision History ({entry.revisions.length})
                    </button>
                  )}
                </div>

                {activeRevisionId === entry.id && entry.revisions && (
                  <div style={{ backgroundColor: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", marginTop: "8px", fontSize: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontWeight: 700, color: "#334155" }}>📜 Audit Revision Log & Diff History</span>
                      <span style={{ backgroundColor: "#e2e8f0", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px" }}>
                        v{entry.revisions.length}.0
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {entry.revisions.map((rev, index) => (
                        <div key={index} style={{ padding: "10px", backgroundColor: "#ffffff", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11px" }}>
                            <span style={{ fontWeight: 700, color: "#4f46e5" }}>Revision #{index + 1}</span>
                            <span style={{ color: "#94a3b8" }}>{rev.timestamp}</span>
                          </div>
                          <div style={{ padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", fontFamily: "monospace", fontSize: "11px", color: "#1e293b", marginBottom: "6px" }}>
                            {rev.content}
                          </div>
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => handleRevert(entry.id, rev.content)}
                              style={{ padding: "4px 8px", backgroundColor: "#fffbe8", color: "#b45309", border: "1px solid #fde68a", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                            >
                              ↺ Revert to this Version
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
