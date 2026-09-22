from pydantic import BaseModel
from typing import List, Optional, Dict

class ImportSummary(BaseModel):
    data_type: str
    rows_processed: int
    imported: int
    duplicates: int
    errors_count: int
    errors: List[Dict[str, str]] = []
    error_csv_content: Optional[str] = None
