from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Vacancy, ExamCycle, Exam
from app.schemas.vacancy import VacancyResponse
from app.schemas.analytics import VacancyAnalyticsResponse
from app.analytics.vacancy_analytics import get_vacancy_analytics

router = APIRouter(prefix="/vacancies", tags=["Vacancies"])

@router.get("", response_model=List[VacancyResponse])
def get_vacancies_list(
    exam_slug: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Vacancy, ExamCycle, Exam).join(ExamCycle, Vacancy.exam_cycle_id == ExamCycle.id).join(Exam, ExamCycle.exam_id == Exam.id)
    if exam_slug:
        query = query.filter(Exam.slug == exam_slug)
    if year:
        query = query.filter(ExamCycle.year == year)
    if category:
        query = query.filter(Vacancy.category == category)

    results = []
    for vac, cycle, exam in query.all():
        results.append(VacancyResponse(
            id=vac.id,
            exam_cycle_id=vac.exam_cycle_id,
            post=vac.post,
            category=vac.category,
            vacancies=vac.vacancies,
            source=vac.source,
            exam_name=exam.name,
            year=cycle.year
        ))
    return results

@router.get("/analytics", response_model=VacancyAnalyticsResponse)
def get_vacancy_analytics_endpoint(
    exam_slug: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    year_start: Optional[int] = Query(None),
    year_end: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return get_vacancy_analytics(db, exam_slug=exam_slug, category=category, year_start=year_start, year_end=year_end)
