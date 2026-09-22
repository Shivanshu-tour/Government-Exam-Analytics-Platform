import pandas as pd
from sqlalchemy.orm import Session
from app.models import Question, Subject, Topic, Exam

def get_difficulty_analytics(db: Session, exam_slug: str | None = None, subject_id: int | None = None):
    query = db.query(Question, Subject, Topic, Exam).join(Subject, Question.subject_id == Subject.id).join(Topic, Question.topic_id == Topic.id).join(Exam, Question.exam_id == Exam.id)

    if exam_slug:
        query = query.filter(Exam.slug == exam_slug)
    if subject_id:
        query = query.filter(Question.subject_id == subject_id)

    records = query.all()
    if not records:
        return {
            "overall_distribution": {"Easy": 0.0, "Moderate": 0.0, "Difficult": 0.0},
            "by_year": [],
            "by_subject": [],
            "by_topic": []
        }

    data = []
    for q, sub, top, exam in records:
        data.append({
            "exam_slug": exam.slug,
            "year": q.year,
            "subject": sub.name,
            "topic": top.name,
            "difficulty": q.difficulty
        })

    df = pd.DataFrame(data)
    total_q = len(df)

    # 1. Overall %
    diff_counts = df["difficulty"].value_counts(normalize=True) * 100
    overall_dist = {
        "Easy": round(float(diff_counts.get("Easy", 0.0)), 1),
        "Moderate": round(float(diff_counts.get("Moderate", 0.0)), 1),
        "Difficult": round(float(diff_counts.get("Difficult", 0.0)), 1)
    }

    # 2. By year
    by_year_df = df.groupby(["year", "difficulty"]).size().unstack(fill_value=0).reset_index()
    by_year = by_year_df.to_dict(orient="records")

    # 3. By subject
    by_subject_df = df.groupby(["subject", "difficulty"]).size().unstack(fill_value=0).reset_index()
    by_subject = by_subject_df.to_dict(orient="records")

    # 4. By topic
    by_topic_df = df.groupby(["topic", "difficulty"]).size().unstack(fill_value=0).reset_index()
    by_topic = by_topic_df.to_dict(orient="records")

    return {
        "overall_distribution": overall_dist,
        "by_year": by_year,
        "by_subject": by_subject,
        "by_topic": by_topic
    }
