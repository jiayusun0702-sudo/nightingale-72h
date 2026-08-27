from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Timeline 条目模型
class TimelineEntryCreate(BaseModel):
    care_note_id: int
    author_role: str
    author_id: str
    type: str
    content: str
    provenance_pointer: Optional[str] = None

class TimelineEntryResponse(TimelineEntryCreate):
    id: int
    timestamp: datetime
    version: int

    class Config:
        from_attributes = True

# Glance View 高亮模型
class HighlightResponse(BaseModel):
    id: int
    content: str
    risk_reason: str
    risk_level: str
    provenance_pointer: str
    priority_score: int

    class Config:
        from_attributes = True

# Glance View 统一聚合模型
class GlanceViewResponse(BaseModel):
    patient_id: int
    top_card_highlights: List[HighlightResponse]
    open_actions: List[str]
    critical_flags: List[str]
    load_time_ms: float

