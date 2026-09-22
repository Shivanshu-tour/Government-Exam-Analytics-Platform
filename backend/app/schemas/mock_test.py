from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class MockResultCreate(BaseModel):
    subject_id: int
    attempted: int
    correct: int
    incorrect: int
    score: float
    time_taken: float  # in minutes

class MockTestCreate(BaseModel):
    exam_id: int
    name: str
    date: str
    results: List[MockResultCreate]

class MockResultResponse(BaseModel):
    id: int
    subject_id: int
    subject_name: Optional[str] = None
    attempted: int
    correct: int
    incorrect: int
    score: float
    time_taken: float

    model_config = ConfigDict(from_attributes=True)

class MockTestResponse(BaseModel):
    id: int
    user_id: int
    exam_id: int
    exam_name: Optional[str] = None
    name: str
    date: str
    created_at: datetime
    total_score: float = 0.0
    total_attempted: int = 0
    total_correct: int = 0
    total_incorrect: int = 0
    accuracy: float = 0.0
    attempt_rate: float = 0.0
    error_rate: float = 0.0
    results: List[MockResultResponse] = []

    model_config = ConfigDict(from_attributes=True)
