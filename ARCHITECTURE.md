# Architecture & Technical Design Document

This document describes the high-level system architecture, database ER model, analytics pipelines, authentication lifecycle, and data import protocol for **ExamIntel India**.

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Next.js 15 + React 19)"]
        Landing["Landing & Catalog Pages"]
        AnalyticsPage["Vacancies & Cutoff Dashboards"]
        AuthDashboard["Authenticated User Workspace"]
        AdminImportUI["Admin CSV Import Interface"]
    end

    subgraph APILayer ["API Layer (FastAPI)"]
        AuthGuard["JWT Auth & Role Guard"]
        RouterLayer["REST API Routers (/api/v1/*)"]
    end

    subgraph ServiceLayer ["Service & Analytics Layer"]
        VacEngine["Vacancy Analytics (Pandas Aggregation)"]
        CutEngine["Cutoff Movement Calculator"]
        WeakEngine["Weak Topic Detector Engine"]
        CSVImporter["CSV Validation & Import Service"]
    end

    subgraph StorageLayer ["Persistence Layer"]
        DB[(PostgreSQL / SQLite Database)]
        DataSources["Source Metadata Registry"]
    end

    ClientLayer -->|HTTPS / JSON + Bearer Token| APILayer
    APILayer --> AuthGuard
    AuthGuard --> RouterLayer
    RouterLayer --> ServiceLayer
    ServiceLayer --> DB
    ServiceLayer --> DataSources
```

---

## 2. Database Entity Relationship Model

```mermaid
erDiagram
    users ||--o{ mock_tests : logs
    users ||--o{ user_topic_performance : tracks
    exams ||--o{ exam_cycles : contains
    exams ||--o{ subjects : defines
    exams ||--o{ questions : contains
    exams ||--o{ mock_tests : target
    exam_cycles ||--o{ vacancies : records
    exam_cycles ||--o{ cutoffs : records
    subjects ||--o{ topics : divides
    topics ||--o{ subtopics : divides
    topics ||--o{ questions : categorizes
    topics ||--o{ user_topic_performance : metrics
    mock_tests ||--o{ mock_results : contains
    subjects ||--o{ mock_results : evaluates
```

---

## 3. Data Flow & Security Model

### Authentication & Authorization Flow
1. User submits credentials via `/api/v1/auth/login`.
2. Backend verifies password hash using standard `bcrypt` password check (`bcrypt.checkpw`).
3. Upon validation, a signed JWT access token (`HS256`) containing `user_id`, `email`, and `role` is returned.
4. Protected API endpoints validate the Bearer token via `get_current_user` and `get_current_admin` FastAPI dependencies.

### Admin CSV Data Import Pipeline
1. Admin uploads CSV via `/api/v1/admin/import` specifying `data_type` (`vacancies`, `cutoffs`, or `questions`).
2. `CSVImporter` checks missing header columns, invalid data types, non-existent foreign keys (`exam_slug`), and duplicate records.
3. Successfully validated rows are inserted transactionally into database tables.
4. Any row failing validation is collected and converted into a downloadable error CSV log file.

---

## 4. Analytical Formula Implementations

### Year-over-Year (YoY) Vacancy Percentage Change
$$\text{Percentage Change} = \frac{\text{Vacancies}_t - \text{Vacancies}_{t-1}}{\text{Vacancies}_{t-1}} \times 100$$

### 3-Year Cutoff Movement Calculation
$$\text{Movement Points} = \text{Cutoff}_{\text{latest}} - \text{Cutoff}_{\text{base (3 yrs prior)}}$$

### Mock Attempt Accuracy & Attempt Rate
$$\text{Accuracy (\%)} = \frac{\text{Total Correct}}{\text{Total Attempted}} \times 100$$

$$\text{Error Rate (\%)} = \frac{\text{Total Incorrect}}{\text{Total Attempted}} \times 100$$

### Transparent Weak Topic Identification Criteria
A topic is flagged as weak if:
- $\text{Accuracy} < 60.0\%$ (Target threshold)
- $\text{Average Time per Question} > 90.0 \text{ seconds}$
- $\text{Question Attempts} < 15$
