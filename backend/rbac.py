from fastapi import HTTPException, status
from typing import List, Dict, Any

# 定义角色定义
ROLE_PATIENT = "PATIENT"
ROLE_STAFF = "STAFF"
ROLE_CLINICIAN = "CLINICIAN"
ROLE_ADMIN = "ADMIN"

def filter_timeline_for_role(entries: List[Dict[str, Any]], user_role: str) -> List[Dict[str, Any]]:
    """
    根据用户角色在服务端强制过滤 Longitudinal Timeline 中的敏感条目。
    """
    filtered = []
    for entry in entries:
        # 患者访问控制硬性隔离[cite: 1]
        if user_role == ROLE_PATIENT:
            # 患者只能查看面向患者的摘要或系统指令，屏蔽 raw AI notes 及内部笔记[cite: 1]
            if entry.get("type") in ["patient_summary", "instruction"] and entry.get("author_role") in ["system", "patient"]:
                filtered.append(entry)
            continue
        
        # Staff / Clinician 诊所内访问
        filtered.append(entry)
        
    return filtered

def verify_write_permission(user_role: str, target_section_author_role: str):
    """
    硬性校验角色写入与覆盖权限[cite: 1]。
    """
    if user_role == ROLE_STAFF and target_section_author_role == ROLE_CLINICIAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff members cannot overwrite Clinician sections."
        )
    if user_role == ROLE_CLINICIAN and target_section_author_role == ROLE_STAFF:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clinicians cannot overwrite Staff notes directly without explicit review flow."
        )

