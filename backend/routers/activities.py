from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from database import get_db
from services.auth_service import require_login
from repositories import activity_repo
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()

class ActivityIn(BaseModel):
    place_name: str
    category: str
    note: str = ""
    visited_at: str

@router.get("/api/activities")
def list_activities(user: str = Depends(require_login), db: Session = Depends(get_db)):
    items = activity_repo.list_activities(db)
    return [
        {"id": a.id, "place_name": a.place_name, "category": a.category, "note": a.note,
         "visited_at": a.visited_at.isoformat() if a.visited_at else None, "created_by": a.created_by}
        for a in items
    ]

@router.post("/api/activities")
def add_activity(data: ActivityIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    try:
        visited_date = datetime.fromisoformat(data.visited_at)
    except ValueError:
        raise HTTPException(status_code=400, detail="visited_at phải đúng định dạng YYYY-MM-DD")
    activity_repo.create_activity(db, data.place_name, data.category, data.note, visited_date, user)
    return {"status": "saved"}

@router.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    activity_repo.delete_activity(db, activity_id)
    return {"status": "deleted"}