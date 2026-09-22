from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class VacancyAnalyticsResponse(BaseModel):
    trend: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    post_distribution: List[Dict[str, Any]]
    yoy_change: List[Dict[str, Any]]

class CutoffAnalyticsResponse(BaseModel):
    trend: List[Dict[str, Any]]
    sectional_breakdown: List[Dict[str, Any]]
    overall_vs_sectional: List[Dict[str, Any]]
    movement_stats: Dict[str, Any]

class DifficultyAnalyticsResponse(BaseModel):
    overall_distribution: Dict[str, float]
    by_year: List[Dict[str, Any]]
    by_subject: List[Dict[str, Any]]
    by_topic: List[Dict[str, Any]]

class WeakTopicResponse(BaseModel):
    topic_id: int
    topic_name: str
    subject_name: str
    exam_name: str
    accuracy: float
    avg_time: float
    attempts: int
    recent_accuracy: float
    reasons: List[str]
    recommendation: str

class UserPerformanceOverview(BaseModel):
    study_streak_days: int
    mocks_completed: int
    average_score: float
    average_accuracy: float
    syllabus_completion_percent: float
    status_breakdown: Dict[str, int]
    score_trend: List[Dict[str, Any]]
    accuracy_trend: List[Dict[str, Any]]
    subject_performance: List[Dict[str, Any]]
    weak_areas_count: int
    strong_areas_count: int
