from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models import (
    User, UserRole, Exam, ExamCycle, Vacancy, Cutoff,
    Subject, Topic, Subtopic, Question, MockTest, MockResult,
    UserTopicPerformance, DataSource
)
from app.auth.hash import get_password_hash

def seed_database(db: Session | None = None):
    should_close = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        # Check if already seeded
        if db.query(Exam).first():
            print("Database already contains seeded data. Skipping seed step.")
            return

        print("Seeding ExamIntel India database with demonstration dataset...")

        # 1. Data Sources Transparency metadata
        source_demo = DataSource(
            name="ExamIntel Synthetic & Public Aggregated Demo Dataset",
            url="https://examintel.in/data-transparency",
            description="Synthetic historical dataset based on public notification trends for RBI Grade B, SEBI Grade A, NABARD Grade A, SSC CGL, IBPS PO, and SBI PO.",
            last_collected="2026-09-20",
            is_demo=True
        )
        db.add(source_demo)

        # 2. Seed Users (Admin & Demo User)
        admin_user = User(
            name="ExamIntel Admin",
            email="admin@examintel.in",
            password_hash=get_password_hash("Admin123!"),
            role=UserRole.ADMIN.value
        )
        demo_user = User(
            name="Rahul Sharma",
            email="demo@examintel.in",
            password_hash=get_password_hash("Demo123!"),
            role=UserRole.USER.value
        )
        db.add_all([admin_user, demo_user])
        db.flush()

        # 3. Seed Exams Catalog
        exams_data = [
            {
                "slug": "rbi-grade-b",
                "name": "RBI Grade B Officer",
                "organization": "Reserve Bank of India",
                "category": "Regulatory Body",
                "description": "Direct recruitment for Officers in Grade 'B' (General / DEPR / DSIM) in Reserve Bank of India.",
                "official_website": "https://www.rbi.org.in"
            },
            {
                "slug": "sebi-grade-a",
                "name": "SEBI Grade A Assistant Manager",
                "organization": "Securities and Exchange Board of India",
                "category": "Regulatory Body",
                "description": "Recruitment for Assistant Manager (Grade A) in General, Legal, Information Technology, and Research streams.",
                "official_website": "https://www.sebi.gov.in"
            },
            {
                "slug": "nabard-grade-a",
                "name": "NABARD Grade A Assistant Manager",
                "organization": "National Bank for Agriculture and Rural Development",
                "category": "Regulatory Body",
                "description": "Recruitment for Assistant Manager in Rural Development Banking Service (RDBS) and Rajbhasha.",
                "official_website": "https://www.nabard.org"
            },
            {
                "slug": "ssc-cgl",
                "name": "SSC Combined Graduate Level (CGL)",
                "organization": "Staff Selection Commission",
                "category": "Staff Selection",
                "description": "National level examination to recruit Group 'B' and Group 'C' officers into various Ministries and Departments.",
                "official_website": "https://ssc.gov.in"
            },
            {
                "slug": "ibps-po",
                "name": "IBPS Probationary Officer (PO/MT)",
                "organization": "Institute of Banking Personnel Selection",
                "category": "Banking",
                "description": "Common Recruitment Process for Probationary Officers/Management Trainees in participating public sector banks.",
                "official_website": "https://www.ibps.in"
            },
            {
                "slug": "sbi-po",
                "name": "SBI Probationary Officer (PO)",
                "organization": "State Bank of India",
                "category": "Banking",
                "description": "Recruitment of Probationary Officers in State Bank of India branches across the country.",
                "official_website": "https://sbi.co.in"
            }
        ]

        created_exams = {}
        for ed in exams_data:
            exam = Exam(**ed)
            db.add(exam)
            db.flush()
            created_exams[ed["slug"]] = exam

        # 4. Exam Cycles & Vacancies & Cutoffs Seed Data
        years = [2021, 2022, 2023, 2024, 2025]

        # Multi-year vacancy & cutoff baseline config
        exam_configs = {
            "rbi-grade-b": {
                "posts": ["Grade B General", "DEPR", "DSIM"],
                "vac_base": [270, 294, 291, 270, 300],
                "cutoff_phase1": [66.75, 63.75, 54.25, 66.50, 69.00],
                "cutoff_mains": [187.50, 171.25, 169.00, 174.50, 179.00],
                "sections": [("General Awareness", 25.0), ("Reasoning", 15.0), ("English", 7.5), ("Quantitative Aptitude", 4.5)]
            },
            "sebi-grade-a": {
                "posts": ["Assistant Manager General", "IT Stream", "Legal Stream"],
                "vac_base": [120, 120, 100, 97, 110],
                "cutoff_phase1": [118.0, 115.5, 112.0, 122.5, 125.0],
                "cutoff_mains": [132.5, 128.0, 130.5, 135.0, 138.5],
                "sections": [("Paper 1 General", 40.0), ("Paper 2 Specialized", 50.0)]
            },
            "nabard-grade-a": {
                "posts": ["RDBS General", "Agriculture", "Finance"],
                "vac_base": [148, 161, 150, 102, 115],
                "cutoff_phase1": [41.75, 43.50, 38.50, 46.25, 48.00],
                "cutoff_mains": [118.5, 115.0, 119.25, 123.0, 126.5],
                "sections": [("ESI", 12.0), ("ARD", 10.0), ("GA", 6.0), ("Computer", 3.5)]
            },
            "ssc-cgl": {
                "posts": ["Assistant Audit Officer", "Inspector (CGST)", "Tax Assistant"],
                "vac_base": [7035, 7607, 37409, 8415, 17727],
                "cutoff_phase1": [130.18, 114.27, 114.05, 150.04, 153.25],
                "cutoff_mains": [287.5, 275.0, 291.0, 305.5, 312.0],
                "sections": [("Reasoning", 40.0), ("General Awareness", 25.0), ("Quantitative Aptitude", 38.0), ("English", 42.0)]
            },
            "ibps-po": {
                "posts": ["Probationary Officer / MT"],
                "vac_base": [4135, 5847, 8432, 3049, 4455],
                "cutoff_phase1": [50.50, 49.75, 49.75, 54.25, 57.00],
                "cutoff_mains": [80.75, 71.25, 63.00, 75.75, 79.50],
                "sections": [("English", 9.75), ("Quantitative Aptitude", 8.75), ("Reasoning", 9.25)]
            },
            "sbi-po": {
                "posts": ["Probationary Officer"],
                "vac_base": [2000, 2056, 1673, 2000, 2200],
                "cutoff_phase1": [58.50, 53.00, 59.50, 56.00, 61.25],
                "cutoff_mains": [88.93, 88.90, 78.56, 82.25, 86.50],
                "sections": [("English", 10.0), ("Quantitative Aptitude", 10.0), ("Reasoning", 10.0)]
            }
        }

        for slug, cfg in exam_configs.items():
            exam = created_exams[slug]
            for idx, yr in enumerate(years):
                cycle = ExamCycle(
                    exam_id=exam.id,
                    year=yr,
                    notification_date=f"{yr}-05-15",
                    application_start=f"{yr}-05-20",
                    application_end=f"{yr}-06-15",
                    prelims_date=f"{yr}-08-10",
                    mains_date=f"{yr}-10-15",
                    result_date=f"{yr}-12-01",
                    status="Completed"
                )
                db.add(cycle)
                db.flush()

                tot_vac = cfg["vac_base"][idx]

                # Post-wise vacancies split
                for p_idx, post_name in enumerate(cfg["posts"]):
                    p_vac = int(tot_vac * (0.6 if p_idx == 0 else 0.2))
                    v_post = Vacancy(
                        exam_cycle_id=cycle.id,
                        post=post_name,
                        category="Total",
                        vacancies=p_vac,
                        source="Official Notification"
                    )
                    db.add(v_post)

                # Category breakdown
                cats = [("UR", 0.40), ("OBC", 0.27), ("SC", 0.15), ("ST", 0.08), ("EWS", 0.10)]
                for cat_code, pct in cats:
                    db.add(Vacancy(
                        exam_cycle_id=cycle.id,
                        post="Overall Category Split",
                        category=cat_code,
                        vacancies=int(tot_vac * pct),
                        source="Official Notification"
                    ))

                # Phase I Cutoffs (UR, OBC, SC, ST, EWS)
                p1_ur = cfg["cutoff_phase1"][idx]
                cat_diffs = [("UR", 0), ("OBC", -2.5), ("EWS", -3.0), ("SC", -7.0), ("ST", -10.0)]
                for cat_code, diff in cat_diffs:
                    db.add(Cutoff(
                        exam_cycle_id=cycle.id,
                        phase="Phase I",
                        category=cat_code,
                        section="Overall",
                        cutoff=round(max(10.0, p1_ur + diff), 2),
                        maximum_marks=100.0 if "cgl" not in slug and "rbi" not in slug else 200.0,
                        source="Official Result Document"
                    ))

                # Sectional Cutoffs
                for sec_name, sec_cut in cfg["sections"]:
                    db.add(Cutoff(
                        exam_cycle_id=cycle.id,
                        phase="Phase I",
                        category="UR",
                        section=sec_name,
                        cutoff=sec_cut,
                        maximum_marks=30.0,
                        source="Official Result Document"
                    ))

        # 5. Seed Syllabus (Subjects, Topics, Subtopics) & PYQs
        syllabus_bank = {
            "rbi-grade-b": [
                ("General Awareness", "Phase I", [
                    ("Banking & Financial Awareness", ["RBI Functions & Monetary Policy", "Union Budget & Economic Survey", "Financial Regulatory Bodies"]),
                    ("Current Affairs", ["National & International Events", "Awards & Honours", "Reports & Indices"])
                ]),
                ("Quantitative Aptitude", "Phase I", [
                    ("Data Interpretation", ["Pie Charts & Bar Graphs", "Caselet DI", "Missing Data DI"]),
                    ("Arithmetic & Word Problems", ["Percentage & Profit Loss", "Time Work & Speed Distance", "Probability & Permutations"])
                ]),
                ("Economic & Social Issues (ESI)", "Phase II", [
                    ("Indian Economy & Growth", ["Inflation & Measurement", "Fiscal Policy & Debt", "Sustainable Development Goals"]),
                    ("Social Structure in India", ["Demographics & Gender", "Poverty Alleviation Schemes", "Urbanization & Migration"])
                ])
            ],
            "ssc-cgl": [
                ("Quantitative Aptitude", "Tier 1", [
                    ("Geometry & Mensuration", ["Triangles & Circles", "3D Mensuration Cylinders/Cones", "Trigonometry Heights & Distances"]),
                    ("Algebra & Number System", ["Polynomial Identities", "LCM HCF & Remainder Theorem", "Surds & Indices"])
                ]),
                ("English Comprehension", "Tier 1", [
                    ("Grammar & Error Spotting", ["Subject Verb Agreement", "Prepositions & Articles", "Tenses & Voice"]),
                    ("Vocabulary & Reading", ["Cloze Test", "Reading Comprehension", "Idioms & One Word Substitution"])
                ])
            ],
            "ibps-po": [
                ("Reasoning Ability", "Prelims", [
                    ("Puzzles & Seating Arrangement", ["Linear & Circular Seating", "Floor & Box Puzzles", "Month & Date Puzzles"]),
                    ("Logical Reasoning", ["Syllogism", "Inequalities", "Coding Decoding"])
                ]),
                ("Quantitative Aptitude", "Prelims", [
                    ("Quadratic Equations & Series", ["Missing Number Series", "Wrong Number Series", "Quadratic Comparisons"]),
                    ("Data Interpretation", ["Line Graphs & Tables", "Radar Charts", "Data Sufficiency"])
                ])
            ]
        }

        default_syllabus = [
            ("General Awareness", "Phase I", [("National Current Affairs", ["Budget", "Government Schemes"]), ("Economy", ["Inflation", "Banking"])]),
            ("Reasoning Ability", "Phase I", [("Analytical Reasoning", ["Seating Arrangement", "Puzzles"]), ("Logical Reasoning", ["Syllogisms", "Inequalities"])]),
            ("Quantitative Aptitude", "Phase I", [("Data Interpretation", ["Tables", "Bar Charts"]), ("Arithmetic", ["Percentages", "Ratios"])])
        ]

        created_topics = []

        for slug, exam in created_exams.items():
            s_list = syllabus_bank.get(slug, default_syllabus)
            for sub_name, phase_name, topics_list in s_list:
                subject = Subject(exam_id=exam.id, name=sub_name, phase=phase_name)
                db.add(subject)
                db.flush()

                for top_name, subtopics_list in topics_list:
                    topic = Topic(subject_id=subject.id, name=top_name)
                    db.add(topic)
                    db.flush()
                    created_topics.append((topic, subject, exam))

                    for st_name in subtopics_list:
                        db.add(Subtopic(topic_id=topic.id, name=st_name))

        db.flush()

        # 6. Seed PYQ Questions
        pyq_questions = [
            {
                "exam_slug": "rbi-grade-b",
                "year": 2024,
                "phase": "Phase I",
                "difficulty": "Moderate",
                "question_text": "Which of the following is the primary objective of the Monetary Policy Committee (MPC) constituted by the Reserve Bank of India under Section 45ZB of the RBI Act, 1934?",
                "options": ["To manage liquidity in foreign exchange markets", "To maintain price stability while keeping in mind the objective of growth", "To issue currency notes and coins", "To regulate non-banking financial companies"],
                "correct_answer": "To maintain price stability while keeping in mind the objective of growth",
                "explanation": "Under the RBI Act 1934, the primary objective of monetary policy is to maintain price stability while keeping in mind the objective of growth, with an explicit inflation target of 4% (+/- 2%)."
            },
            {
                "exam_slug": "rbi-grade-b",
                "year": 2024,
                "phase": "Phase I",
                "difficulty": "Difficult",
                "question_text": "A bag contains 5 red balls and 4 blue balls. If 3 balls are drawn at random without replacement, what is the probability that exactly 2 are red?",
                "options": ["5/14", "10/21", "15/28", "20/63"],
                "correct_answer": "10/21",
                "explanation": "Total ways to choose 3 balls from 9 = 9C3 = 84. Ways to choose 2 red from 5 = 5C2 = 10. Ways to choose 1 blue from 4 = 4C1 = 4. Favorable outcomes = 10 * 4 = 40. P = 40/84 = 10/21."
            },
            {
                "exam_slug": "ssc-cgl",
                "year": 2024,
                "phase": "Tier 1",
                "difficulty": "Easy",
                "question_text": "If a merchant marks up the cost price of an article by 40% and allows a discount of 20%, what is his net percentage profit?",
                "options": ["12%", "15%", "16%", "20%"],
                "correct_answer": "12%",
                "explanation": "Let CP = 100. Marked Price = 140. Selling Price = 140 * 0.8 = 112. Net Profit % = (112 - 100) = 12%."
            },
            {
                "exam_slug": "ibps-po",
                "year": 2024,
                "phase": "Prelims",
                "difficulty": "Moderate",
                "question_text": "Statements: All Statements are Questions. Some Questions are Difficult.\nConclusions: I. Some Statements are Difficult. II. No Statement is Difficult.",
                "options": ["Only Conclusion I follows", "Only Conclusion II follows", "Either Conclusion I or II follows", "Neither Conclusion I nor II follows"],
                "correct_answer": "Either Conclusion I or II follows",
                "explanation": "Statements and Difficult form a complementary pair ('Some' and 'No') with identical subject/predicate, hence Either I or II follows."
            }
        ]

        for q_data in pyq_questions:
            exam = created_exams[q_data["exam_slug"]]
            sub = db.query(Subject).filter(Subject.exam_id == exam.id).first()
            top = db.query(Topic).filter(Topic.subject_id == sub.id).first() if sub else None

            if sub and top:
                q_obj = Question(
                    exam_id=exam.id,
                    year=q_data["year"],
                    phase=q_data["phase"],
                    subject_id=sub.id,
                    topic_id=top.id,
                    difficulty=q_data["difficulty"],
                    question_text=q_data["question_text"],
                    options=q_data["options"],
                    correct_answer=q_data["correct_answer"],
                    explanation=q_data["explanation"]
                )
                db.add(q_obj)

        # 7. Seed Demo User Performance & Mock Tests
        for idx, (topic, sub, ex) in enumerate(created_topics[:15]):
            status = "Strong" if idx % 3 == 0 else ("Learning" if idx % 3 == 1 else "Not Started")
            if idx in (1, 4, 7):
                acc = 42.5
                avg_t = 135.0
                att = 28
                status = "Learning"
            else:
                acc = 82.0
                avg_t = 55.0
                att = 45

            db.add(UserTopicPerformance(
                user_id=demo_user.id,
                topic_id=topic.id,
                status=status,
                attempts=att,
                correct=int(att * (acc / 100)),
                accuracy=acc,
                average_time=avg_t
            ))

        # Add 3 Mock Test Attempts for Demo User
        m_rbi = created_exams["rbi-grade-b"]
        sub_ga = db.query(Subject).filter(Subject.exam_id == m_rbi.id, Subject.name == "General Awareness").first()
        sub_quant = db.query(Subject).filter(Subject.exam_id == m_rbi.id, Subject.name == "Quantitative Aptitude").first()

        mock1 = MockTest(
            user_id=demo_user.id,
            exam_id=m_rbi.id,
            name="RBI Grade B Phase I - Full Mock #1",
            date="2026-08-15"
        )
        db.add(mock1)
        db.flush()

        if sub_ga and sub_quant:
            db.add(MockResult(mock_test_id=mock1.id, subject_id=sub_ga.id, attempted=70, correct=56, incorrect=14, score=52.5, time_taken=24.0))
            db.add(MockResult(mock_test_id=mock1.id, subject_id=sub_quant.id, attempted=25, correct=12, incorrect=13, score=8.75, time_taken=28.0))

        mock2 = MockTest(
            user_id=demo_user.id,
            exam_id=m_rbi.id,
            name="RBI Grade B Phase I - Full Mock #2",
            date="2026-09-01"
        )
        db.add(mock2)
        db.flush()

        if sub_ga and sub_quant:
            db.add(MockResult(mock_test_id=mock2.id, subject_id=sub_ga.id, attempted=75, correct=63, incorrect=12, score=60.0, time_taken=25.0))
            db.add(MockResult(mock_test_id=mock2.id, subject_id=sub_quant.id, attempted=28, correct=18, incorrect=10, score=15.5, time_taken=25.0))

        db.commit()
        print("Database successfully seeded with demonstration dataset!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
