from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Cutoff, ExamCycle, Exam
from app.schemas.cutoff import CutoffResponse
from app.schemas.analytics import CutoffAnalyticsResponse
from app.analytics.cutoff_analytics import get_cutoff_analytics

router = APIRouter(prefix="/cutoffs", tags=["Cutoffs"])

@router.get("", response_model=List[CutoffResponse])
def get_cutoffs_list(
    exam_slug: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    phase: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Cutoff, ExamCycle, Exam).join(ExamCycle, Cutoff.exam_cycle_id == ExamCycle.id).join(Exam, ExamCycle.exam_id == Exam.id)
    if exam_slug:
        query = query.filter(Exam.slug == exam_slug)
    if year:
        query = query.filter(ExamCycle.year == year)
    if phase:
        query = query.filter(Cutoff.phase == phase)
    if category:
        query = query.filter(Cutoff.category == category)

    results = []
    for cut, cycle, exam in query.all():
        results.append(CutoffResponse(
            id=cut.id,
            exam_cycle_id=cut.exam_cycle_id,
            phase=cut.phase,
            category=cut.category,
            section=cut.section,
            cutoff=cut.cutoff,
            maximum_marks=cut.maximum_marks,
            source=cut.source,
            exam_name=exam.name,
            year=cycle.year
        ))
    return results

@router.get("/analytics", response_model=CutoffAnalyticsResponse)
def get_cutoff_analytics_endpoint(
    exam_slug: Optional[str] = Query(None),
    phase: Optional[str] = Query(None),
    category: Optional[str] = Query("UR"),
    section: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_cutoff_analytics(db, exam_slug=exam_slug, phase=phase, category=category, section=section)
