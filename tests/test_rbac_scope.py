import sys
import os
import pytest
from fastapi import HTTPException

# 引入 backend 目录下的模块
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
from rbac import filter_timeline_for_role, verify_write_permission, ROLE_PATIENT, ROLE_STAFF, ROLE_CLINICIAN

def test_staff_cannot_overwrite_clinician():
    """断言 Staff 无法覆盖 Clinician 的笔记"""
    with pytest.raises(HTTPException) as exc_info:
        verify_write_permission(ROLE_STAFF, ROLE_CLINICIAN)
    assert exc_info.value.status_code == 403

def test_clinician_cannot_overwrite_staff():
    """断言 Clinician 无法覆盖 Staff 的笔记"""
    with pytest.raises(HTTPException) as exc_info:
        verify_write_permission(ROLE_CLINICIAN, ROLE_STAFF)
    assert exc_info.value.status_code == 403

def test_patient_access_restriction():
    """断言 Patient 只能看到面向患者的摘要，无法获取 raw AI 笔记及内部评论"""
    raw_entries = [
        {"id": 1, "type": "patient_summary", "author_role": "system", "content": "Instructions for care."},
        {"id": 2, "type": "ai_doctor_consult_summary", "author_role": "system", "content": "Raw doctor diagnostic text."},
        {"id": 3, "type": "manual_note", "author_role": "clinician", "content": "Clinician private notes."}
    ]
    patient_visible = filter_timeline_for_role(raw_entries, ROLE_PATIENT)
    assert len(patient_visible) == 1
    assert patient_visible[0]["id"] == 1
    assert patient_visible[0]["type"] == "patient_summary"

