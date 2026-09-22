from pydantic import BaseModel, ConfigDict
from typing import Optional

class CutoffBase(BaseModel):
    phase: str
    category: str
    section: str = "Overall"
    cutoff: float
    maximum_marks: float
    source: Optional[str] = None

class CutoffResponse(CutoffBase):
    id: int
    exam_cycle_id: int
    exam_name: Optional[str] = None
    year: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
