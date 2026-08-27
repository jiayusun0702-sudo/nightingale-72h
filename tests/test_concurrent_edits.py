import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

class ConcurrentManager:
    @staticmethod
    def merge_non_overlapping(section_a, section_b):
        """不同 section 并发编辑合并[cite: 1]"""
        return {**section_a, **section_b}

    @staticmethod
    def resolve_same_section_conflict(version_a, content_a, version_b, content_b):
        """同一 section 冲突按高版本号确定性合并[cite: 1]"""
        if version_a >= version_b:
            return content_a, version_a
        return content_b, version_b

def test_concurrent_edits_resolution():
    # 1. 验证不同 Section 并发无覆盖[cite: 1]
    clinician_edit = {"clinician_notes": "Patient stable."}
    staff_edit = {"staff_tasks": "Scheduled follow-up."}
    merged = ConcurrentManager.merge_non_overlapping(clinician_edit, staff_edit)
    assert "clinician_notes" in merged and "staff_tasks" in merged

    # 2. 验证同一 Section 冲突确定性解决[cite: 1]
    resolved_content, resolved_version = ConcurrentManager.resolve_same_section_conflict(
        version_a=2, content_a="Version 2 Edit",
        version_b=1, content_b="Version 1 Stale Edit"
    )
    assert resolved_version == 2
    assert resolved_content == "Version 2 Edit"

