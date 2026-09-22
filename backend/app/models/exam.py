from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    organization = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # Regulatory, Banking, SSC, etc.
    description = Column(Text, nullable=True)
    official_website = Column(String(255), nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    cycles = relationship("ExamCycle", back_populates="exam", cascade="all, delete-orphan")
    subjects = relationship("Subject", back_populates="exam", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    mock_tests = relationship("MockTest", back_populates="exam", cascade="all, delete-orphan")


class ExamCycle(Base):
    __tablename__ = "exam_cycles"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    notification_date = Column(String(50), nullable=True)
    application_start = Column(String(50), nullable=True)
    application_end = Column(String(50), nullable=True)
    prelims_date = Column(String(50), nullable=True)
    mains_date = Column(String(50), nullable=True)
    result_date = Column(String(50), nullable=True)
    status = Column(String(50), default="Completed")  # Upcoming, Ongoing, Completed

    exam = relationship("Exam", back_populates="cycles")
    vacancies = relationship("Vacancy", back_populates="exam_cycle", cascade="all, delete-orphan")
    cutoffs = relationship("Cutoff", back_populates="exam_cycle", cascade="all, delete-orphan")
