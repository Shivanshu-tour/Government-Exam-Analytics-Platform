from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    exam_cycle_id = Column(Integer, ForeignKey("exam_cycles.id", ondelete="CASCADE"), nullable=False, index=True)
    post = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # UR, OBC, SC, ST, EWS, Total
    vacancies = Column(Integer, nullable=False)
    source = Column(String(255), nullable=True)

    exam_cycle = relationship("ExamCycle", back_populates="vacancies")
