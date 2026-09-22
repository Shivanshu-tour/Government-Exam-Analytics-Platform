from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import MockTest, MockResult, Exam, Subject, User
from app.schemas.mock_test import MockTestCreate, MockTestResponse, MockResultResponse
from app.auth.deps import get_current_user

router = APIRouter(prefix="/mock-tests", tags=["Mock Tests"])

@router.get("", response_model=List[MockTestResponse])
def get_user_mock_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tests = db.query(MockTest).filter(MockTest.user_id == current_user.id).order_by(MockTest.date.desc()).all()
    results = []

    for t in tests:
        exam = db.query(Exam).filter(Exam.id == t.exam_id).first()
        m_results = db.query(MockResult).filter(MockResult.mock_test_id == t.id).all()

        tot_score = sum(r.score for r in m_results)
        tot_att = sum(r.attempted for r in m_results)
        tot_corr = sum(r.correct for r in m_results)
        tot_inc = sum(r.incorrect for r in m_results)

        accuracy = round((tot_corr / tot_att * 100), 2) if tot_att > 0 else 0.0
        # Assuming 100 questions benchmark per full mock
        attempt_rate = round((tot_att / 100 * 100), 2) if tot_att > 0 else 0.0
        error_rate = round((tot_inc / tot_att * 100), 2) if tot_att > 0 else 0.0

        res_objs = []
        for r in m_results:
            sub = db.query(Subject).filter(Subject.id == r.subject_id).first()
            res_objs.append(MockResultResponse(
                id=r.id,
                subject_id=r.subject_id,
                subject_name=sub.name if sub else "Subject",
                attempted=r.attempted,
                correct=r.correct,
                incorrect=r.incorrect,
                score=r.score,
                time_taken=r.time_taken
            ))

        results.append(MockTestResponse(
            id=t.id,
            user_id=t.user_id,
            exam_id=t.exam_id,
            exam_name=exam.name if exam else "Exam",
            name=t.name,
            date=t.date,
            created_at=t.created_at,
            total_score=tot_score,
            total_attempted=tot_att,
            total_correct=tot_corr,
            total_incorrect=tot_inc,
            accuracy=accuracy,
            attempt_rate=attempt_rate,
            error_rate=error_rate,
            results=res_objs
        ))

    return results

@router.post("", response_model=MockTestResponse, status_code=status.HTTP_201_CREATED)
def create_mock_test(
    mock_in: MockTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exam = db.query(Exam).filter(Exam.id == mock_in.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    mock = MockTest(
        user_id=current_user.id,
        exam_id=mock_in.exam_id,
        name=mock_in.name,
        date=mock_in.date
    )
    db.add(mock)
    db.flush()

    res_objs = []
    tot_score = 0.0
    tot_att = 0
    tot_corr = 0
    tot_inc = 0

    for r_in in mock_in.results:
        res = MockResult(
            mock_test_id=mock.id,
            subject_id=r_in.subject_id,
            attempted=r_in.attempted,
            correct=r_in.correct,
            incorrect=r_in.incorrect,
            score=r_in.score,
            time_taken=r_in.time_taken
        )
        db.add(res)
        tot_score += r_in.score
        tot_att += r_in.attempted
        tot_corr += r_in.correct
        tot_inc += r_in.incorrect

        sub = db.query(Subject).filter(Subject.id == r_in.subject_id).first()
        res_objs.append(MockResultResponse(
            id=0,
            subject_id=r_in.subject_id,
            subject_name=sub.name if sub else "Subject",
            attempted=r_in.attempted,
            correct=r_in.correct,
            incorrect=r_in.incorrect,
            score=r_in.score,
            time_taken=r_in.time_taken
        ))

    db.commit()
    db.refresh(mock)

    accuracy = round((tot_corr / tot_att * 100), 2) if tot_att > 0 else 0.0
    attempt_rate = round((tot_att / 100 * 100), 2) if tot_att > 0 else 0.0
    error_rate = round((tot_inc / tot_att * 100), 2) if tot_att > 0 else 0.0

    return MockTestResponse(
        id=mock.id,
        user_id=mock.user_id,
        exam_id=mock.exam_id,
        exam_name=exam.name,
        name=mock.name,
        date=mock.date,
        created_at=mock.created_at,
        total_score=tot_score,
        total_attempted=tot_att,
        total_correct=tot_corr,
        total_incorrect=tot_inc,
        accuracy=accuracy,
        attempt_rate=attempt_rate,
        error_rate=error_rate,
        results=res_objs
    )
