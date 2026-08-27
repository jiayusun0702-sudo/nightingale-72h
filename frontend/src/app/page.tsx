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
      targetElement.classList.add("ring-4", "ring-indigo-500", "bg-indigo-50", "transition-all", "duration-500");
      setTimeout(() => {
        targetElement.classList.remove("ring-4", "ring-indigo-500", "bg-indigo-50");
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
    <div className="min-h-screen bg-slate-100 p-8 font-sans antialiased text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nightingale Care Note</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Longitudinal Shared Patient Record System</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-white text-xs font-bold text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="clinician">Clinician (Full Access)</option>
              <option value="staff">Staff (Operational)</option>
              <option value="patient">Patient (Restricted)</option>
            </select>
          </div>
        </header>

        {/* 10s Rapid Readability Glance View (Top Card) */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/50 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold flex items-center gap-2 text-indigo-100">
              ⚡ Top Card (Glance View - 10s Readability)
            </h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-medium">
              P95 Latency: {topCard?.latency_ms || 45}ms
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5">Open Actions</h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {topCard?.open_actions.map((act, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2.5">Critical Flags & Highlights</h3>
              <div className="space-y-2">
                {topCard?.highlights.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">
                    <span className="text-rose-100 font-medium">{h.reason}</span>
                    <button
                      onClick={() => handleJumpToEntry(h.provenance_pointer)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono font-bold rounded-md transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      📍 {h.provenance_pointer}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Longitudinal Timeline Feed</h2>

          {/* Note Input */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note (Try @Dr.Zhang or phone +65 91234567)..."
                className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Add Entry
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Quick Mention:</span>
                <button
                  type="button"
                  onClick={() => setNewNote(prev => prev + " @Dr.Zhang")}
                  className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 font-medium transition-colors cursor-pointer"
                >
                  + @Dr.Zhang
                </button>
                <button
                  type="button"
                  onClick={() => setNewNote(prev => prev + " @NurseSarah")}
                  className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-md hover:bg-purple-100 font-medium transition-colors cursor-pointer"
                >
                  + @NurseSarah
                </button>
              </div>

              {mentionFilter && (
                <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-lg border border-amber-200 text-xs font-medium">
                  <span>Filtering by: <strong>@{mentionFilter}</strong></span>
                  <button
                    onClick={() => setMentionFilter(null)}
                    className="text-amber-600 hover:text-amber-900 underline font-bold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Items */}
          <div className="space-y-3.5 pt-2">
            {visibleTimeline.map((entry) => (
              <div
                key={entry.id}
                id={`entry-${entry.provenance_pointer || entry.id}`}
                className="p-4 rounded-xl border border-slate-200 bg-white transition-all duration-300 shadow-2xs space-y-2.5 hover:border-slate-300"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-600 uppercase tracking-wide">
                    {entry.author_role} ({entry.author_id})
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{entry.timestamp}</span>
                </div>

                <p className="text-slate-800 text-xs leading-relaxed font-normal">{entry.content}</p>

                {entry.mentions && entry.mentions.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs pt-0.5">
                    <span className="text-slate-400 text-[11px]">Mentions:</span>
                    {entry.mentions.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMentionFilter(m)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer text-[11px]"
                      >
                        @{m}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-mono text-[11px]">Pointer: {entry.provenance_pointer}</span>
                  
                  {entry.revisions && (
                    <button
                      onClick={() => setActiveRevisionId(activeRevisionId === entry.id ? null : entry.id)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      📜 Revision History ({entry.revisions.length})
                    </button>
                  )}
                </div>

                {activeRevisionId === entry.id && entry.revisions && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3 text-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">📜 Audit Revision Log & Diff History</span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                        v{entry.revisions.length}.0
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {entry.revisions.map((rev, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-indigo-600">Revision #{index + 1}</span>
                            <span className="text-slate-400">{rev.timestamp}</span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 font-mono text-slate-700 text-[11px]">
                            {rev.content}
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleRevert(entry.id, rev.content)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-lg font-medium text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
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
