from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Question, Exam, Subject, Topic
from app.schemas.question import QuestionResponse

router = APIRouter(prefix="/questions", tags=["Previous Year Questions"])

@router.get("", response_model=List[QuestionResponse])
def list_questions(
    exam_slug: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    phase: Optional[str] = Query(None),
    subject_id: Optional[int] = Query(None),
    topic_id: Optional[int] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Question, Exam, Subject, Topic)\
        .join(Exam, Question.exam_id == Exam.id)\
        .join(Subject, Question.subject_id == Subject.id)\
        .join(Topic, Question.topic_id == Topic.id)

    if exam_slug:
        query = query.filter(Exam.slug == exam_slug)
    if year:
        query = query.filter(Question.year == year)
    if phase:
        query = query.filter(Question.phase == phase)
    if subject_id:
        query = query.filter(Question.subject_id == subject_id)
    if topic_id:
        query = query.filter(Question.topic_id == topic_id)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)

    records = query.offset(offset).limit(limit).all()

    results = []
    for q, ex, sub, top in records:
        results.append(QuestionResponse(
            id=q.id,
            exam_id=q.exam_id,
            exam_name=ex.name,
            year=q.year,
            phase=q.phase,
            subject_id=q.subject_id,
            subject_name=sub.name,
            topic_id=q.topic_id,
            topic_name=top.name,
            difficulty=q.difficulty,
            question_text=q.question_text,
            options=q.options,
            correct_answer=q.correct_answer,
            explanation=q.explanation
        ))
    return results

@router.get("/{id}", response_model=QuestionResponse)
def get_question_detail(id: int, db: Session = Depends(get_db)):
    rec = db.query(Question, Exam, Subject, Topic)\
        .join(Exam, Question.exam_id == Exam.id)\
        .join(Subject, Question.subject_id == Subject.id)\
        .join(Topic, Question.topic_id == Topic.id)\
        .filter(Question.id == id).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Question not found")

    q, ex, sub, top = rec
    return QuestionResponse(
        id=q.id,
        exam_id=q.exam_id,
        exam_name=ex.name,
        year=q.year,
        phase=q.phase,
        subject_id=q.subject_id,
        subject_name=sub.name,
        topic_id=q.topic_id,
        topic_name=top.name,
        difficulty=q.difficulty,
        question_text=q.question_text,
        options=q.options,
        correct_answer=q.correct_answer,
        explanation=q.explanation
    )
