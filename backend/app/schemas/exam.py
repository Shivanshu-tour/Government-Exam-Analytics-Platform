from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ExamCycleBase(BaseModel):
    year: int
    notification_date: Optional[str] = None
    application_start: Optional[str] = None
    application_end: Optional[str] = None
    prelims_date: Optional[str] = None
    mains_date: Optional[str] = None
    result_date: Optional[str] = None
    status: str = "Completed"

class ExamCycleResponse(ExamCycleBase):
    id: int
    exam_id: int

    model_config = ConfigDict(from_attributes=True)

class ExamBase(BaseModel):
    slug: str
    name: str
    organization: str
    category: str
    description: Optional[str] = None
    official_website: Optional[str] = None
    active: bool = True

class ExamResponse(ExamBase):
    id: int
    created_at: datetime
    cycles_count: Optional[int] = 0
    latest_cycle_year: Optional[int] = None
    total_vacancies_latest: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class ExamDetailResponse(ExamResponse):
    cycles: List[ExamCycleResponse] = []
