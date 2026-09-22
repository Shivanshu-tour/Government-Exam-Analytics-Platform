import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models import Vacancy, ExamCycle, Exam

def get_vacancy_analytics(db: Session, exam_slug: str | None = None, category: str | None = None, year_start: int | None = None, year_end: int | None = None):
    query = db.query(Vacancy, ExamCycle, Exam).join(ExamCycle, Vacancy.exam_cycle_id == ExamCycle.id).join(Exam, ExamCycle.exam_id == Exam.id)
    
    if exam_slug:
        query = query.filter(Exam.slug == exam_slug)
    if category:
        query = query.filter(Vacancy.category == category)
    if year_start:
        query = query.filter(ExamCycle.year >= year_start)
    if year_end:
        query = query.filter(ExamCycle.year <= year_end)

    records = query.all()
    if not records:
        return {
            "trend": [],
            "category_distribution": [],
            "post_distribution": [],
            "yoy_change": []
        }

    data = []
    for vac, cycle, exam in records:
        data.append({
            "exam_slug": exam.slug,
            "exam_name": exam.name,
            "year": int(cycle.year),
            "post": str(vac.post),
            "category": str(vac.category),
            "vacancies": int(vac.vacancies)
        })

    df = pd.DataFrame(data)

    # 1. Yearly trend
    trend_df = df.groupby("year")["vacancies"].sum().reset_index().sort_values("year")
    trend = [{"year": int(row["year"]), "vacancies": int(row["vacancies"])} for _, row in trend_df.iterrows()]

    # 2. Category distribution
    cat_df = df.groupby(["year", "category"])["vacancies"].sum().unstack(fill_value=0).reset_index()
    category_distribution = []
    for _, row in cat_df.iterrows():
        r_dict = {"year": int(row["year"])}
        for col in cat_df.columns:
            if col != "year":
                r_dict[str(col)] = int(row[col])
        category_distribution.append(r_dict)

    # 3. Post-wise distribution
    post_df = df.groupby("post")["vacancies"].sum().reset_index().sort_values("vacancies", ascending=False)
    post_distribution = [{"post": str(row["post"]), "vacancies": int(row["vacancies"])} for _, row in post_df.iterrows()]

    # 4. YoY Change Calculation
    yoy_change = []
    years = [int(y) for y in sorted(trend_df["year"].unique())]
    for i in range(len(years)):
        yr = years[i]
        curr_val = int(trend_df[trend_df["year"] == yr]["vacancies"].values[0])
        if i == 0:
            yoy_change.append({
                "year": yr,
                "vacancies": curr_val,
                "prev_year": None,
                "prev_vacancies": None,
                "absolute_change": 0,
                "percentage_change": 0.0
            })
        else:
            prev_yr = years[i-1]
            prev_val = int(trend_df[trend_df["year"] == prev_yr]["vacancies"].values[0])
            abs_change = curr_val - prev_val
            pct_change = round(float((abs_change / prev_val * 100)), 2) if prev_val > 0 else 0.0
            yoy_change.append({
                "year": yr,
                "vacancies": curr_val,
                "prev_year": prev_yr,
                "prev_vacancies": prev_val,
                "absolute_change": abs_change,
                "percentage_change": pct_change
            })

    return {
        "trend": trend,
        "category_distribution": category_distribution,
        "post_distribution": post_distribution,
        "yoy_change": yoy_change
    }
