from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class MockTest(Base):
    __tablename__ = "mock_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    date = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    exam = relationship("Exam", back_populates="mock_tests")
    results = relationship("MockResult", back_populates="mock_test", cascade="all, delete-orphan")


class MockResult(Base):
    __tablename__ = "mock_results"

    id = Column(Integer, primary_key=True, index=True)
    mock_test_id = Column(Integer, ForeignKey("mock_tests.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    attempted = Column(Integer, nullable=False, default=0)
    correct = Column(Integer, nullable=False, default=0)
    incorrect = Column(Integer, nullable=False, default=0)
    score = Column(Float, nullable=False, default=0.0)
    time_taken = Column(Float, nullable=False, default=0.0)  # in minutes

    mock_test = relationship("MockTest", back_populates="results")
    subject = relationship("Subject", back_populates="mock_results")
