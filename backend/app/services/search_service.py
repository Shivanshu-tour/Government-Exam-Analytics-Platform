from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Exam, Subject, Topic, Question

def global_search(db: Session, query_str: str):
    if not query_str or len(query_str.strip()) < 2:
        return {"exams": [], "subjects": [], "topics": [], "questions": []}

    q = f"%{query_str.strip()}%"

    # Search Exams
    exams = db.query(Exam).filter(
        or_(
            Exam.name.ilike(q),
            Exam.slug.ilike(q),
            Exam.organization.ilike(q),
            Exam.description.ilike(q)
        )
    ).limit(5).all()

    # Search Subjects
    subjects = db.query(Subject, Exam).join(Exam, Subject.exam_id == Exam.id).filter(
        or_(
            Subject.name.ilike(q),
            Subject.phase.ilike(q)
        )
    ).limit(5).all()

    # Search Topics
    topics = db.query(Topic, Subject, Exam).join(Subject, Topic.subject_id == Subject.id).join(Exam, Subject.exam_id == Exam.id).filter(
        Topic.name.ilike(q)
    ).limit(5).all()

    # Search Questions
    questions = db.query(Question, Exam, Subject, Topic)\
        .join(Exam, Question.exam_id == Exam.id)\
        .join(Subject, Question.subject_id == Subject.id)\
        .join(Topic, Question.topic_id == Topic.id)\
        .filter(
            or_(
                Question.question_text.ilike(q),
                Question.explanation.ilike(q)
            )
        ).limit(10).all()

    return {
        "exams": [{"id": e.id, "slug": e.slug, "name": e.name, "organization": e.organization} for e in exams],
        "subjects": [{"id": s.id, "name": s.name, "phase": s.phase, "exam_name": ex.name, "exam_slug": ex.slug} for s, ex in subjects],
        "topics": [{"id": t.id, "name": t.name, "subject_name": s.name, "exam_name": ex.name, "exam_slug": ex.slug} for t, s, ex in topics],
        "questions": [{
            "id": qu.id,
            "question_text": qu.question_text[:120] + "..." if len(qu.question_text) > 120 else qu.question_text,
            "year": qu.year,
            "phase": qu.phase,
            "exam_name": ex.name,
            "subject_name": s.name,
            "topic_name": t.name,
            "difficulty": qu.difficulty
        } for qu, ex, s, t in questions]
    }
