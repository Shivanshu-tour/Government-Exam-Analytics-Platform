from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Cutoff(Base):
    __tablename__ = "cutoffs"

    id = Column(Integer, primary_key=True, index=True)
    exam_cycle_id = Column(Integer, ForeignKey("exam_cycles.id", ondelete="CASCADE"), nullable=False, index=True)
    phase = Column(String(50), nullable=False)  # Phase I, Phase II, Interview, Overall
    category = Column(String(50), nullable=False)  # UR, OBC, SC, ST, EWS
    section = Column(String(100), default="Overall")  # General Awareness, Reasoning, Overall, etc.
    cutoff = Column(Float, nullable=False)
    maximum_marks = Column(Float, nullable=False)
    source = Column(String(255), nullable=True)

    exam_cycle = relationship("ExamCycle", back_populates="cutoffs")
