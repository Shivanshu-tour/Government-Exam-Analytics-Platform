from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Exam, ExamCycle, Vacancy, Cutoff, Question
from app.schemas.analytics import DifficultyAnalyticsResponse
from app.analytics.difficulty_analytics import get_difficulty_analytics
from app.analytics.vacancy_analytics import get_vacancy_analytics
from app.analytics.cutoff_analytics import get_cutoff_analytics

router = APIRouter(prefix="/analytics", tags=["Global Analytics"])

@router.get("/overview")
def get_analytics_overview(
    exam_slug: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    total_exams = db.query(Exam).count()
    total_cycles = db.query(ExamCycle).count()
    
    # Calculate vacancy stats
    v_query = db.query(Vacancy)
    if exam_slug:
        v_query = v_query.join(ExamCycle).join(Exam).filter(Exam.slug == exam_slug)
    vacancies_list = v_query.all()
    total_vacancies = sum(v.vacancies for v in vacancies_list if v.category == "Total")
    if total_vacancies == 0 and vacancies_list:
        total_vacancies = sum(v.vacancies for v in vacancies_list)

    # Calculate cutoff stats
    c_query = db.query(Cutoff).filter(Cutoff.category == "UR", Cutoff.section == "Overall")
    if exam_slug:
        c_query = c_query.join(ExamCycle).join(Exam).filter(Exam.slug == exam_slug)
    cutoffs = c_query.all()
    cutoff_vals = [c.cutoff for c in cutoffs]

    avg_cutoff = round(sum(cutoff_vals) / len(cutoff_vals), 2) if cutoff_vals else 0.0
    highest_cutoff = max(cutoff_vals) if cutoff_vals else 0.0
    lowest_cutoff = min(cutoff_vals) if cutoff_vals else 0.0

    # Key factual insights
    vac_analytics = get_vacancy_analytics(db, exam_slug=exam_slug)
    yoy = vac_analytics.get("yoy_change", [])
    
    insights = []
    if len(yoy) >= 2:
        latest_yoy = yoy[-1]
        prev_yoy = yoy[-2]
        change_dir = "increased" if latest_yoy["absolute_change"] >= 0 else "decreased"
        insights.append(
            f"Total vacancies {change_dir} from {prev_yoy['vacancies']:,} in {prev_yoy['year']} to {latest_yoy['vacancies']:,} in {latest_yoy['year']} ({latest_yoy['percentage_change']:+}%)."
        )
    if cutoffs:
        insights.append(
            f"Historical General (UR) overall cutoffs range between a minimum of {lowest_cutoff} and maximum of {highest_cutoff}, with a multi-year average of {avg_cutoff}."
        )

    return {
        "total_exams": total_exams,
        "total_cycles": total_cycles,
        "total_vacancies": total_vacancies,
        "average_cutoff": avg_cutoff,
        "highest_cutoff": highest_cutoff,
        "lowest_cutoff": lowest_cutoff,
        "key_data_insights": insights
    }

@router.get("/difficulty", response_model=DifficultyAnalyticsResponse)
def get_difficulty_endpoint(
    exam_slug: Optional[str] = Query(None),
    subject_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return get_difficulty_analytics(db, exam_slug=exam_slug, subject_id=subject_id)
