from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    role = Column(String)  # PATIENT, STAFF, CLINICIAN, ADMIN
    clinic_id = Column(String, index=True)

class CareNote(Base):
    __tablename__ = "care_notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    clinic_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    entries = relationship("TimelineEntry", back_populates="care_note")
    highlights = relationship("Highlight", back_populates="care_note")

class TimelineEntry(Base):
    __tablename__ = "timeline_entries"

    id = Column(Integer, primary_key=True, index=True)
    care_note_id = Column(Integer, ForeignKey("care_notes.id"))
    author_role = Column(String)  # patient, staff, clinician, system
    author_id = Column(String)    # user_id »ò system
    timestamp = Column(DateTime, default=datetime.utcnow)
    type = Column(String)         # ai_doctor_consult_summary, manual_note, etc.
    content = Column(Text)
    provenance_pointer = Column(String, nullable=True)
    version = Column(Integer, default=1)

    care_note = relationship("CareNote", back_populates="entries")

class RevisionHistory(Base):
    __tablename__ = "revision_histories"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("timeline_entries.id"))
    version = Column(Integer)
    content = Column(Text)
    modified_by = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Highlight(Base):
    __tablename__ = "highlights"

    id = Column(Integer, primary_key=True, index=True)
    care_note_id = Column(Integer, ForeignKey("care_notes.id"))
    content = Column(Text)
    risk_reason = Column(Text)
    risk_level = Column(String)  # HIGH, MEDIUM, LOW
    provenance_pointer = Column(String)
    priority_score = Column(Integer, default=0)

    care_note = relationship("CareNote", back_populates="highlights")
