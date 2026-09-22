from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.analytics.comparison_engine import compare_exams

router = APIRouter(prefix="/compare", tags=["Exam Comparison"])

@router.get("")
def compare_exams_endpoint(
    slugs: List[str] = Query(..., description="List of exam slugs to compare, e.g. ?slugs=rbi-grade-b&slugs=sebi-grade-a"),
    db: Session = Depends(get_db)
):
    if not slugs:
        raise HTTPException(status_code=400, detail="Provide at least one exam slug to compare")
    return compare_exams(db, slugs)
