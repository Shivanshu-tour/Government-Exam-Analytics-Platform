from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Exam, ExamCycle, Vacancy
from app.schemas.exam import ExamResponse, ExamDetailResponse, ExamCycleResponse

router = APIRouter(prefix="/exams", tags=["Exams"])

@router.get("", response_model=List[ExamResponse])
def list_exams(
    category: Optional[str] = Query(None, description="Filter by category (Regulatory, Banking, SSC)"),
    db: Session = Depends(get_db)
):
    query = db.query(Exam).filter(Exam.active == True)
    if category:
        query = query.filter(Exam.category == category)
    
    exams = query.all()
    results = []
    for exam in exams:
        cycles = db.query(ExamCycle).filter(ExamCycle.exam_id == exam.id).order_by(ExamCycle.year.desc()).all()
        latest_year = cycles[0].year if cycles else None
        
        latest_vacancies = 0
        if cycles:
            vacs = db.query(Vacancy).filter(Vacancy.exam_cycle_id == cycles[0].id).all()
            total_v = sum(v.vacancies for v in vacs if v.category == "Total")
            latest_vacancies = total_v if total_v > 0 else sum(v.vacancies for v in vacs)

        results.append(ExamResponse(
            id=exam.id,
            slug=exam.slug,
            name=exam.name,
            organization=exam.organization,
            category=exam.category,
            description=exam.description,
            official_website=exam.official_website,
            active=exam.active,
            created_at=exam.created_at,
            cycles_count=len(cycles),
            latest_cycle_year=latest_year,
            total_vacancies_latest=latest_vacancies
        ))
    return results

@router.get("/{slug}", response_model=ExamDetailResponse)
def get_exam_by_slug(slug: str, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.slug == slug).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    cycles = db.query(ExamCycle).filter(ExamCycle.exam_id == exam.id).order_by(ExamCycle.year.desc()).all()
    latest_year = cycles[0].year if cycles else None
    
    latest_vacancies = 0
    if cycles:
        vacs = db.query(Vacancy).filter(Vacancy.exam_cycle_id == cycles[0].id).all()
        total_v = sum(v.vacancies for v in vacs if v.category == "Total")
        latest_vacancies = total_v if total_v > 0 else sum(v.vacancies for v in vacs)

    return ExamDetailResponse(
        id=exam.id,
        slug=exam.slug,
        name=exam.name,
        organization=exam.organization,
        category=exam.category,
        description=exam.description,
        official_website=exam.official_website,
        active=exam.active,
        created_at=exam.created_at,
        cycles_count=len(cycles),
        latest_cycle_year=latest_year,
        total_vacancies_latest=latest_vacancies,
        cycles=[ExamCycleResponse.model_validate(c) for c in cycles]
    )
