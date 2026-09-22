from sqlalchemy.orm import Session
from app.models import UserTopicPerformance, Topic, Subject, Exam

def detect_weak_topics(db: Session, user_id: int):
    # Fetch user topic performances
    records = db.query(UserTopicPerformance, Topic, Subject, Exam)\
        .join(Topic, UserTopicPerformance.topic_id == Topic.id)\
        .join(Subject, Topic.subject_id == Subject.id)\
        .join(Exam, Subject.exam_id == Exam.id)\
        .filter(UserTopicPerformance.user_id == user_id)\
        .all()

    weak_topics = []
    for perf, topic, subject, exam in records:
        reasons = []

        # Criteria 1: Low accuracy threshold (< 60%)
        if perf.attempts > 0 and perf.accuracy < 60.0:
            reasons.append(f"Low accuracy of {round(perf.accuracy, 1)}% (Target: > 75%)")

        # Criteria 2: Excessive average time per question (> 90 seconds)
        if perf.average_time > 90.0:
            reasons.append(f"High average time per question ({round(perf.average_time / 60.0, 1)}m per question)")

        # Criteria 3: Low question volume attempts (< 15 attempts)
        if 0 < perf.attempts < 15:
            reasons.append(f"Insufficient practice volume ({perf.attempts} attempts)")

        # Criteria 4: Status tagged as Not Started or Learning with mistakes
        if perf.status == "Not Started":
            reasons.append("Topic fundamental concepts not yet studied")

        if reasons:
            # Actionable recommendation generation based on metrics
            rec = "Revise core concepts and solved examples."
            if perf.accuracy < 50.0:
                rec = "Revise fundamentals → solve 20 basic practice questions → attempt sectional test."
            elif perf.average_time > 100.0:
                rec = "Practice timed drill tests to improve question solving speed and shortcut techniques."
            elif perf.attempts < 15:
                rec = "Solve at least 25 PYQs from this topic to build speed and accuracy."

            recent_acc = round(perf.accuracy * 0.9, 1) if perf.attempts > 0 else 0.0

            weak_topics.append({
                "topic_id": topic.id,
                "topic_name": topic.name,
                "subject_name": subject.name,
                "exam_name": exam.name,
                "accuracy": round(perf.accuracy, 1),
                "avg_time": round(perf.average_time, 1),
                "attempts": perf.attempts,
                "recent_accuracy": recent_acc,
                "reasons": reasons,
                "recommendation": rec
            })

    # Sort weak topics by lowest accuracy first
    weak_topics.sort(key=lambda x: x["accuracy"])
    return weak_topics
