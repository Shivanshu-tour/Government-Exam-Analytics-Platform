from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class QuestionResponse(BaseModel):
    id: int
    exam_id: int
    exam_name: Optional[str] = None
    year: int
    phase: str
    subject_id: int
    subject_name: Optional[str] = None
    topic_id: int
    topic_name: Optional[str] = None
    difficulty: str
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
