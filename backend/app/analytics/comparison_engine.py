from sqlalchemy.orm import Session
from app.models import Exam, ExamCycle, Vacancy, Cutoff, Subject, Topic

def compare_exams(db: Session, slugs: list[str]):
    exams = db.query(Exam).filter(Exam.slug.in_(slugs)).all()
    comparison_data = []

    for exam in exams:
        cycles = db.query(ExamCycle).filter(ExamCycle.exam_id == exam.id).order_by(ExamCycle.year.desc()).all()
        latest_cycle = cycles[0] if cycles else None

        vacancies_count = 0
        if latest_cycle:
            vacs = db.query(Vacancy).filter(Vacancy.exam_cycle_id == latest_cycle.id, Vacancy.category == "Total").all()
            if vacs:
                vacancies_count = sum(v.vacancies for v in vacs)
            else:
                all_vacs = db.query(Vacancy).filter(Vacancy.exam_cycle_id == latest_cycle.id).all()
                vacancies_count = sum(v.vacancies for v in all_vacs if v.category != "Total")

        subjects = db.query(Subject).filter(Subject.exam_id == exam.id).all()
        sub_ids = [s.id for s in subjects]
        topic_count = db.query(Topic).filter(Topic.subject_id.in_(sub_ids)).count() if sub_ids else 0

        latest_cutoff = "N/A"
        if latest_cycle:
            c_rec = db.query(Cutoff).filter(Cutoff.exam_cycle_id == latest_cycle.id, Cutoff.category == "UR", Cutoff.section == "Overall").first()
            if c_rec:
                latest_cutoff = f"{c_rec.cutoff} / {c_rec.maximum_marks}"

        phases_list = sorted(list(set(s.phase for s in subjects))) if subjects else ["Phase I", "Phase II"]

        comparison_data.append({
            "id": exam.id,
            "slug": exam.slug,
            "name": exam.name,
            "organization": exam.organization,
            "category": exam.category,
            "description": exam.description,
            "official_website": exam.official_website,
            "latest_year": latest_cycle.year if latest_cycle else "N/A",
            "vacancies": vacancies_count,
            "phases_count": len(phases_list),
            "phases": phases_list,
            "subjects_count": len(subjects),
            "subjects": [s.name for s in subjects],
            "total_topics": topic_count,
            "latest_ur_cutoff": latest_cutoff
        })

    return comparison_data
