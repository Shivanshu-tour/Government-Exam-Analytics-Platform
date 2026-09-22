from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Exam, Subject, Topic, Subtopic, UserTopicPerformance, User
from app.schemas.syllabus import SubjectResponse, TopicResponse, SubtopicResponse, TopicStatusUpdate
from app.auth.deps import get_current_user

router = APIRouter(prefix="/syllabus", tags=["Syllabus"])

@router.get("/{exam_slug}", response_model=List[SubjectResponse])
def get_exam_syllabus(
    exam_slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None) # Optional user context if provided
):
    exam = db.query(Exam).filter(Exam.slug == exam_slug).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    subjects = db.query(Subject).filter(Subject.exam_id == exam.id).all()
    user_perf_map = {}
    if current_user:
        user_perfs = db.query(UserTopicPerformance).filter(UserTopicPerformance.user_id == current_user.id).all()
        user_perf_map = {p.topic_id: p.status for p in user_perfs}

    results = []
    for s in subjects:
        topics = db.query(Topic).filter(Topic.subject_id == s.id).all()
        topic_responses = []
        for t in topics:
            subtopics = db.query(Subtopic).filter(Subtopic.topic_id == t.id).all()
            status_str = user_perf_map.get(t.id, "Not Started")
            topic_responses.append(TopicResponse(
                id=t.id,
                subject_id=t.subject_id,
                name=t.name,
                user_status=status_str,
                subtopics=[SubtopicResponse.model_validate(st) for st in subtopics]
            ))

        results.append(SubjectResponse(
            id=s.id,
            exam_id=s.exam_id,
            name=s.name,
            phase=s.phase,
            topics=topic_responses
        ))
    return results

@router.post("/progress", status_code=200)
def update_topic_progress(
    update_in: TopicStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).filter(Topic.id == update_in.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    perf = db.query(UserTopicPerformance).filter(
        UserTopicPerformance.user_id == current_user.id,
        UserTopicPerformance.topic_id == update_in.topic_id
    ).first()

    if not perf:
        perf = UserTopicPerformance(
            user_id=current_user.id,
            topic_id=update_in.topic_id,
            status=update_in.status
        )
        db.add(perf)
    else:
        perf.status = update_in.status

    db.commit()
    return {"message": "Progress updated successfully", "topic_id": topic.id, "status": update_in.status}
