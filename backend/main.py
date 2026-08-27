import time
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from database import engine, Base, get_db
import models
import schemas
from redaction import redactor
from rbac import filter_timeline_for_role, verify_write_permission

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nightingale Care Note Core API")

# 开启 CORS 跨域支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Glance View API (包含 P95 <= 300ms 性能统计)
@app.get("/api/v1/care-notes/{note_id}/glance", response_model=schemas.GlanceViewResponse)
def get_glance_view(
    note_id: int, 
    x_user_role: str = Header("CLINICIAN"),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    
    note = db.query(models.CareNote).filter(models.CareNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Care Note not found")
        
    highlights = db.query(models.Highlight).filter(models.Highlight.care_note_id == note_id).all()
    
    open_actions = ["Needs lab order verification", "Waiting nurse follow-up"]
    critical_flags = [h.risk_reason for h in highlights if h.risk_level == "HIGH"]
    
    elapsed_ms = (time.time() - start_time) * 1000
    
    return schemas.GlanceViewResponse(
        patient_id=note.patient_id,
        top_card_highlights=highlights,
        open_actions=open_actions,
        critical_flags=critical_flags,
        load_time_ms=round(elapsed_ms, 2)
    )

# 2. Longitudinal Timeline API (带 RBAC 隔离与脱敏)
@app.get("/api/v1/care-notes/{note_id}/timeline")
def get_timeline(
    note_id: int,
    x_user_role: str = Header("CLINICIAN"),
    db: Session = Depends(get_db)
):
    entries = db.query(models.TimelineEntry).filter(models.TimelineEntry.care_note_id == note_id).all()
    
    raw_data = []
    for entry in entries:
        raw_data.append({
            "id": entry.id,
            "care_note_id": entry.care_note_id,
            "author_role": entry.author_role,
            "author_id": entry.author_id,
            "timestamp": entry.timestamp.isoformat(),
            "type": entry.type,
            "content": entry.content,
            "provenance_pointer": entry.provenance_pointer,
            "version": entry.version
        })
        
    filtered_entries = filter_timeline_for_role(raw_data, x_user_role)
    return filtered_entries

# 3. 添加 Timeline 条目 (自动触发 PHI 脱敏)
@app.post("/api/v1/timeline-entries", response_model=schemas.TimelineEntryResponse)
def create_timeline_entry(
    entry_in: schemas.TimelineEntryCreate,
    db: Session = Depends(get_db)
):
    safe_content = redactor.redact(entry_in.content)
    
    db_entry = models.TimelineEntry(
        care_note_id=entry_in.care_note_id,
        author_role=entry_in.author_role,
        author_id=entry_in.author_id,
        type=entry_in.type,
        content=safe_content,
        provenance_pointer=entry_in.provenance_pointer
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

