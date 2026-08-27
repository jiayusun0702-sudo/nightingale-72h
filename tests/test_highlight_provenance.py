import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

def resolve_provenance(pointer: str, timeline_entries: list):
    """根据 provenance_pointer 解算对应的 TimelineEntry[cite: 1]"""
    return next((entry for entry in timeline_entries if entry["id"] == pointer), None)

def test_highlight_provenance_resolution():
    timeline_entries = [
        {"id": "entry_101", "type": "ai_doctor_consult_summary", "content": "High BP observed."},
        {"id": "entry_102", "type": "manual_note", "content": "Adjusted medication."}
    ]

    highlight = {
        "id": "hl_01",
        "risk_reason": "Elevated Blood Pressure",
        "provenance_pointer": "entry_101"
    }

    # 断言包含指针且能精准找到 Source of Truth[cite: 1]
    resolved_source = resolve_provenance(highlight["provenance_pointer"], timeline_entries)
    assert resolved_source is not None
    assert resolved_source["id"] == "entry_101"
    assert "High BP" in resolved_source["content"]

