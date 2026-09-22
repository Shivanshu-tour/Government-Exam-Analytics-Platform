import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.seed_data import seed_database

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_examintel.db"

engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    yield
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["platform"] == "ExamIntel India"

def test_list_exams():
    response = client.get("/api/v1/exams")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 6
    slugs = [e["slug"] for e in data]
    assert "rbi-grade-b" in slugs
    assert "ssc-cgl" in slugs

def test_exam_detail():
    response = client.get("/api/v1/exams/rbi-grade-b")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "RBI Grade B Officer"
    assert len(data["cycles"]) >= 5

def test_vacancy_analytics():
    response = client.get("/api/v1/vacancies/analytics?exam_slug=rbi-grade-b")
    assert response.status_code == 200
    data = response.json()
    assert "trend" in data
    assert "yoy_change" in data
    assert len(data["yoy_change"]) >= 2

def test_cutoff_analytics():
    response = client.get("/api/v1/cutoffs/analytics?exam_slug=rbi-grade-b&category=UR")
    assert response.status_code == 200
    data = response.json()
    assert "movement_stats" in data
    assert "latest_cutoff" in data["movement_stats"]

def test_global_search():
    response = client.get("/api/v1/search?q=RBI")
    assert response.status_code == 200
    data = response.json()
    assert len(data["exams"]) >= 1

def test_auth_login():
    response = client.post("/api/v1/auth/login", json={"email": "demo@examintel.in", "password": "Demo123!"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "demo@examintel.in"

def test_user_performance_and_weak_topics():
    login_resp = client.post("/api/v1/auth/login", json={"email": "demo@examintel.in", "password": "Demo123!"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    perf_resp = client.get("/api/v1/user/performance", headers=headers)
    assert perf_resp.status_code == 200
    perf_data = perf_resp.json()
    assert perf_data["mocks_completed"] >= 2

    weak_resp = client.get("/api/v1/user/weak-topics", headers=headers)
    assert weak_resp.status_code == 200
    weak_data = weak_resp.json()
    assert len(weak_data) > 0
    assert "recommendation" in weak_data[0]
