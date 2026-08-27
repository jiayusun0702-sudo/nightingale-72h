"use client";

import { useEffect, useState } from "react";
import { fetchGlanceView, fetchTimeline, GlanceData, TimelineEntry, createTimelineEntry } from "../lib/api";

export default function Home() {
  const [role, setRole] = useState("CLINICIAN");
  const [glance, setGlance] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [highlightedEntryId, setHighlightedEntryId] = useState(null);
  const [newNote, setNewNote] = useState("");

  const loadData = async () => {
    try {
      const gData = await fetchGlanceView(1, role);
      setGlance(gData);
      const tData = await fetchTimeline(1, role);
      setTimeline(tData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleJumpToProvenance = (pointer) => {
    setHighlightedEntryId(pointer);
    const element = document.getElementById("entry-" + pointer);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleAddNote = async () => {
    if (!newNote) return;
    await createTimelineEntry({
      care_note_id: 1,
      author_role: role.toLowerCase(),
      author_id: "user_current",
      type: "manual_note",
      content: newNote,
      provenance_pointer: "manual_" + Date.now()
    });
    setNewNote("");
    loadData();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Nightingale Care Note</h1>
          <p className="text-sm text-slate-500">Longitudinal Shared Patient Record</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Current Role:</span>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CLINICIAN">Clinician</option>
            <option value="STAFF">Staff</option>
            <option value="PATIENT">Patient (Restricted View)</option>
          </select>
        </div>
      </header>

      {role !== "PATIENT" && (
        <section className="mb-6 bg-blue-50/50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-blue-900 text-base flex items-center gap-2">
              ? Top Card (Glance View - 10s Rapid Readability)
            </h2>
            {glance && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                P95 Load: {glance.load_time_ms} ms
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Open Actions</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                {glance?.open_actions?.map((act, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Critical Flags & Highlights</h3>
              <div className="space-y-2">
                {glance?.top_card_highlights?.length === 0 && (
                  <p className="text-xs text-slate-400">No critical highlights tagged.</p>
                )}
                {glance?.top_card_highlights?.map((hl) => (
                  <div 
                    key={hl.id} 
                    onClick={() => handleJumpToProvenance(hl.provenance_pointer)}
                    className="cursor-pointer hover:border-blue-400 transition-colors p-2 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-red-600">[{hl.risk_level}] </span>
                      <span className="text-slate-700">{hl.risk_reason}</span>
                    </div>
                    <span className="text-blue-600 font-medium underline text-[11px]">Jump to Source ?</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="font-bold text-slate-800 text-base mb-4">Longitudinal Timeline Feed</h2>

        <div className="flex gap-2 mb-6">
          <input 
            type="text"
            placeholder="Write a new manual note or instruction (Auto PHI Redact)..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleAddNote}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Add Entry
          </button>
        </div>

        <div className="space-y-3">
          {timeline.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No accessible entries for this role.</p>
          ) : (
            timeline.map((entry) => (
              <div 
                key={entry.id}
                id={"entry-" + (entry.provenance_pointer || entry.id)}
                className={"p-4 rounded-xl border transition-all " + (
                  highlightedEntryId === (entry.provenance_pointer || String(entry.id))
                    ? "ring-2 ring-blue-500 bg-blue-50/40 border-blue-300 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {entry.author_role}
                    </span>
                    <span className="text-slate-400">? {entry.type}</span>
                  </div>
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-800 font-normal leading-relaxed">{entry.content}</p>
                {entry.provenance_pointer && (
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    <span>Provenance Pointer:</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{entry.provenance_pointer}</code>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
