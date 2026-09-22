from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.deps import get_current_admin
from app.models import User
from app.schemas.import_schema import ImportSummary
from app.services.csv_importer import process_csv_import

router = APIRouter(prefix="/admin", tags=["Admin Data Import"])

@router.post("/import", response_model=ImportSummary)
async def import_csv_file(
    data_type: str = Form(..., description="Type of data: vacancies, cutoffs, or questions"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported for import."
        )

    content = await file.read()
    try:
        summary = process_csv_import(db, data_type, content)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"CSV processing failed: {str(e)}"
        )
