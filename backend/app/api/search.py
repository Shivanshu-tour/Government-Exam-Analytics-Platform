from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.search_service import global_search

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("")
def search_endpoint(
    q: str = Query(..., min_length=2, description="Search term across exams, subjects, topics, and questions"),
    db: Session = Depends(get_db)
):
    return global_search(db, q)
