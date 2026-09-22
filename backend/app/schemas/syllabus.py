from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class SubtopicResponse(BaseModel):
    id: int
    topic_id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class TopicResponse(BaseModel):
    id: int
    subject_id: int
    name: str
    subtopics: List[SubtopicResponse] = []
    user_status: Optional[str] = "Not Started"

    model_config = ConfigDict(from_attributes=True)

class SubjectResponse(BaseModel):
    id: int
    exam_id: int
    name: str
    phase: str
    topics: List[TopicResponse] = []

    model_config = ConfigDict(from_attributes=True)

class TopicStatusUpdate(BaseModel):
    topic_id: int
    status: str  # Not Started, Learning, Revised, Strong
