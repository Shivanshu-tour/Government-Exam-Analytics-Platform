from pydantic import BaseModel, ConfigDict
from typing import Optional

class VacancyBase(BaseModel):
    post: str
    category: str
    vacancies: int
    source: Optional[str] = None

class VacancyResponse(VacancyBase):
    id: int
    exam_cycle_id: int
    exam_name: Optional[str] = None
    year: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
