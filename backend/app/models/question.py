from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    phase = Column(String(50), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    difficulty = Column(String(50), nullable=False, index=True)  # Easy, Moderate, Difficult
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # ["Option A", "Option B", "Option C", "Option D"]
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)

    exam = relationship("Exam", back_populates="questions")
    subject = relationship("Subject", back_populates="questions")
    topic = relationship("Topic", back_populates="questions")
