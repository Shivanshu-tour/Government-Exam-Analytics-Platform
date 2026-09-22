from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import MockTest, MockResult, UserTopicPerformance, Subject, Exam

def get_user_performance_overview(db: Session, user_id: int):
    # 1. Mock tests statistics
    user_mocks = db.query(MockTest).filter(MockTest.user_id == user_id).all()
    mocks_completed = len(user_mocks)

    mock_ids = [m.id for m in user_mocks]
    results = db.query(MockResult).filter(MockResult.mock_test_id.in_(mock_ids)).all() if mock_ids else []

    total_attempted = sum(r.attempted for r in results)
    total_correct = sum(r.correct for r in results)
    total_score = sum(r.score for r in results)

    avg_score = round(total_score / mocks_completed, 2) if mocks_completed > 0 else 0.0
    avg_accuracy = round((total_correct / total_attempted * 100), 2) if total_attempted > 0 else 0.0

    # 2. Score trend timeline
    score_trend = []
    for m in sorted(user_mocks, key=lambda x: x.date):
        m_results = [r for r in results if r.mock_test_id == m.id]
        m_attempted = sum(r.attempted for r in m_results)
        m_correct = sum(r.correct for r in m_results)
        m_score = sum(r.score for r in m_results)
        m_acc = round((m_correct / m_attempted * 100), 1) if m_attempted > 0 else 0.0
        score_trend.append({
            "mock_id": m.id,
            "mock_name": m.name,
            "date": m.date,
            "score": m_score,
            "accuracy": m_acc
        })

    # 3. Accuracy trend line
    accuracy_trend = [{"date": st["date"], "accuracy": st["accuracy"]} for st in score_trend]

    # 4. Subject performance (radar / bar)
    subject_perf = []
    if results:
        subject_map = {}
        for r in results:
            if r.subject_id not in subject_map:
                sub = db.query(Subject).filter(Subject.id == r.subject_id).first()
                subject_map[r.subject_id] = sub.name if sub else f"Subject #{r.subject_id}"

            s_name = subject_map[r.subject_id]
            if s_name not in subject_perf:
                subject_perf.append({
                    "subject": s_name,
                    "attempted": 0,
                    "correct": 0,
                    "total_score": 0.0
                })
            
            for sp in subject_perf:
                if sp["subject"] == s_name:
                    sp["attempted"] += r.attempted
                    sp["correct"] += r.correct
                    sp["total_score"] += r.score

        for sp in subject_perf:
            sp["accuracy"] = round((sp["correct"] / sp["attempted"] * 100), 1) if sp["attempted"] > 0 else 0.0

    # 5. Syllabus topic performance breakdown
    performances = db.query(UserTopicPerformance).filter(UserTopicPerformance.user_id == user_id).all()
    status_breakdown = {
        "Not Started": 0,
        "Learning": 0,
        "Revised": 0,
        "Strong": 0
    }
    for p in performances:
        status_breakdown[p.status] = status_breakdown.get(p.status, 0) + 1

    total_topics = len(performances)
    completed_topics = status_breakdown.get("Strong", 0) + status_breakdown.get("Revised", 0)
    completion_pct = round((completed_topics / total_topics * 100), 1) if total_topics > 0 else 0.0

    weak_count = sum(1 for p in performances if p.accuracy < 60.0 and p.attempts > 0)
    strong_count = status_breakdown.get("Strong", 0)

    # Simulated active study streak (in days)
    study_streak = 12 if mocks_completed > 0 or total_topics > 0 else 0

    return {
        "study_streak_days": study_streak,
        "mocks_completed": mocks_completed,
        "average_score": avg_score,
        "average_accuracy": avg_accuracy,
        "syllabus_completion_percent": completion_pct,
        "status_breakdown": status_breakdown,
        "score_trend": score_trend,
        "accuracy_trend": accuracy_trend,
        "subject_performance": subject_perf,
        "weak_areas_count": weak_count,
        "strong_areas_count": strong_count
    }
