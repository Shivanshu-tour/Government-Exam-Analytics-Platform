import io
import csv
from sqlalchemy.orm import Session
from app.models import Exam, ExamCycle, Vacancy, Cutoff, Subject, Topic, Question

def process_csv_import(db: Session, data_type: str, file_content: bytes):
    text_content = file_content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text_content))
    
    rows_processed = 0
    imported = 0
    duplicates = 0
    errors = []
    error_rows = []

    # Prepare fieldnames for error logging
    fieldnames = list(reader.fieldnames or []) + ["import_error"]

    for row_idx, row in enumerate(reader, start=2):
        rows_processed += 1
        try:
            if data_type == "vacancies":
                exam_slug = row.get("exam_slug", "").strip()
                year = int(row.get("year", 0))
                post = row.get("post", "").strip()
                category = row.get("category", "").strip()
                vacancies = int(row.get("vacancies", 0))
                source = row.get("source", "").strip()

                if not exam_slug or not year or not post or not category:
                    raise ValueError("Missing required fields (exam_slug, year, post, category)")

                exam = db.query(Exam).filter(Exam.slug == exam_slug).first()
                if not exam:
                    raise ValueError(f"Exam slug '{exam_slug}' not found in database")

                cycle = db.query(ExamCycle).filter(ExamCycle.exam_id == exam.id, ExamCycle.year == year).first()
                if not cycle:
                    cycle = ExamCycle(exam_id=exam.id, year=year, status="Completed")
                    db.add(cycle)
                    db.flush()

                # Check duplicate
                existing = db.query(Vacancy).filter(
                    Vacancy.exam_cycle_id == cycle.id,
                    Vacancy.post == post,
                    Vacancy.category == category
                ).first()
                if existing:
                    duplicates += 1
                    continue

                v_obj = Vacancy(
                    exam_cycle_id=cycle.id,
                    post=post,
                    category=category,
                    vacancies=vacancies,
                    source=source or "Admin CSV Import"
                )
                db.add(v_obj)
                imported += 1

            elif data_type == "cutoffs":
                exam_slug = row.get("exam_slug", "").strip()
                year = int(row.get("year", 0))
                phase = row.get("phase", "").strip()
                category = row.get("category", "").strip()
                section = row.get("section", "Overall").strip()
                cutoff_val = float(row.get("cutoff", 0.0))
                max_marks = float(row.get("maximum_marks", 100.0))
                source = row.get("source", "").strip()

                if not exam_slug or not year or not phase or not category:
                    raise ValueError("Missing required fields (exam_slug, year, phase, category)")

                exam = db.query(Exam).filter(Exam.slug == exam_slug).first()
                if not exam:
                    raise ValueError(f"Exam slug '{exam_slug}' not found")

                cycle = db.query(ExamCycle).filter(ExamCycle.exam_id == exam.id, ExamCycle.year == year).first()
                if not cycle:
                    cycle = ExamCycle(exam_id=exam.id, year=year, status="Completed")
                    db.add(cycle)
                    db.flush()

                existing = db.query(Cutoff).filter(
                    Cutoff.exam_cycle_id == cycle.id,
                    Cutoff.phase == phase,
                    Cutoff.category == category,
                    Cutoff.section == section
                ).first()
                if existing:
                    duplicates += 1
                    continue

                c_obj = Cutoff(
                    exam_cycle_id=cycle.id,
                    phase=phase,
                    category=category,
                    section=section,
                    cutoff=cutoff_val,
                    maximum_marks=max_marks,
                    source=source or "Admin CSV Import"
                )
                db.add(c_obj)
                imported += 1

            elif data_type == "questions":
                exam_slug = row.get("exam_slug", "").strip()
                year = int(row.get("year", 0))
                phase = row.get("phase", "").strip()
                subject_name = row.get("subject_name", "").strip()
                topic_name = row.get("topic_name", "").strip()
                difficulty = row.get("difficulty", "Moderate").strip()
                question_text = row.get("question_text", "").strip()
                correct_answer = row.get("correct_answer", "").strip()
                explanation = row.get("explanation", "").strip()

                if not exam_slug or not question_text or not correct_answer:
                    raise ValueError("Missing required question fields")

                exam = db.query(Exam).filter(Exam.slug == exam_slug).first()
                if not exam:
                    raise ValueError(f"Exam slug '{exam_slug}' not found")

                subject = db.query(Subject).filter(Subject.exam_id == exam.id, Subject.name == subject_name).first()
                if not subject:
                    subject = Subject(exam_id=exam.id, name=subject_name or "General", phase=phase or "Phase I")
                    db.add(subject)
                    db.flush()

                topic = db.query(Topic).filter(Topic.subject_id == subject.id, Topic.name == topic_name).first()
                if not topic:
                    topic = Topic(subject_id=subject.id, name=topic_name or "General Topic")
                    db.add(topic)
                    db.flush()

                q_obj = Question(
                    exam_id=exam.id,
                    year=year or 2024,
                    phase=phase or "Phase I",
                    subject_id=subject.id,
                    topic_id=topic.id,
                    difficulty=difficulty,
                    question_text=question_text,
                    options=[row.get(f"option_{opt}", "").strip() for opt in ["a", "b", "c", "d"] if row.get(f"option_{opt}")],
                    correct_answer=correct_answer,
                    explanation=explanation
                )
                db.add(q_obj)
                imported += 1

            else:
                raise ValueError(f"Unsupported data import type '{data_type}'")

        except Exception as e:
            err_msg = f"Row {row_idx}: {str(e)}"
            errors.append({"row": str(row_idx), "error": str(e)})
            err_row = dict(row)
            err_row["import_error"] = str(e)
            error_rows.append(err_row)

    db.commit()

    # Generate error CSV string if there were errors
    error_csv_str = None
    if error_rows:
        out = io.StringIO()
        writer = csv.DictWriter(out, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(error_rows)
        error_csv_str = out.getvalue()

    return {
        "data_type": data_type,
        "rows_processed": rows_processed,
        "imported": imported,
        "duplicates": duplicates,
        "errors_count": len(errors),
        "errors": errors,
        "error_csv_content": error_csv_str
    }
