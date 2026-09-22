# ExamIntel India — Indian Government Exam Analytics Platform

**ExamIntel India** is a production-quality, data-driven analytics and intelligence platform for Indian competitive and government examinations. The platform covers major regulatory, banking, and recruitment exams:

1. **RBI Grade B**
2. **SEBI Grade A**
3. **NABARD Grade A**
4. **SSC CGL**
5. **IBPS PO**
6. **SBI PO**

The architecture is fully normalized and extensible, enabling dynamic addition of future competitive examinations via database inserts or the Admin CSV Data Import tool without changing application code.

---

## 🚀 Key Features & Capabilities

### Public Intelligence Dashboards
- **Exam Catalog & Details**: Phase breakdown, eligibility criteria, selection process, and official website links.
- **Vacancy Analytics**: Multi-year headcount trends, YoY percentage change calculation (+11.1%), category split (UR, OBC, SC, ST, EWS), and post-wise distribution.
- **Cutoff Analytics**: Phase-wise, category-wise, and sectional cutoff analytics with dynamic 3-year movement calculators (+5.75 pts).
- **Syllabus Explorer**: 4-tier interactive hierarchy (`Exam` → `Phase` → `Subject` → `Topic` → `Subtopic`) with status progress counters.
- **Previous-Year Question (PYQ) Bank**: Filterable question bank with step-by-step solutions, options, and difficulty breakdown (Easy / Moderate / Difficult).
- **Exam Comparison Matrix**: Side-by-side comparison of vacancies, cutoffs, syllabus size, phases, and subjects.
- **Analytics Home**: Factual key data observations generated directly from database aggregations.

### Personal Preparation Analytics (Authenticated)
- **Candidate Workspace**: Active study streak counter (12 days), completed mock count, average score, average accuracy, and syllabus completion rate.
- **Mock Test Tracker**: Log mock test attempts per subject with auto-calculated Accuracy, Attempt Rate, and Error Rate.
- **Performance Analytics**: Multi-test score progression line charts and subject accuracy radar charts.
- **Transparent Weak Topic Detector**: Factor-based diagnostic engine evaluating accuracy (< 60%), average solving speed (> 90s), question volume, and mistake counts with actionable study recommendations.

### Admin Data Management
- **CSV Import Engine**: Drag-and-drop file upload for vacancies, cutoffs, and questions with multi-column validation, duplicate checking, FK validation, and error log CSV download.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy 2.0 ORM, PostgreSQL / SQLite engine, Pandas & NumPy for data aggregations.
- **Authentication**: JWT authentication with passlib/bcrypt password hashing, role-based access control (User/Admin).
- **Infrastructure**: Docker & Docker Compose setup, Pytest test suite.

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Docker & Docker Compose (Optional for containerized deployment)

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Run database seed & start FastAPI development server
$env:PYTHONPATH="backend"  # PowerShell (Windows) or export PYTHONPATH=backend (Linux/Mac)
python -m app.seed_data
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be accessible at `http://localhost:8000/docs`.

### 2. Frontend Setup & Run

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Run Next.js development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🧪 Running Unit & Integration Tests

```bash
# Run backend pytest test suite
$env:PYTHONPATH="backend"
python -m pytest backend/tests
```

---

## 🐳 Docker Deployment

To launch PostgreSQL, FastAPI Backend, and Next.js Frontend using Docker Compose:

```bash
docker-compose up --build -d
```

---

## 🛡️ Data Source Transparency

All demonstration data included in the initial database seed is tagged with a **Demo Dataset** badge and includes full source metadata. Official datasets can replace demo datasets seamlessly via the Admin CSV Import pipeline.
