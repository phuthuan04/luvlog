from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.auth_service import require_login
from repositories import settings_repo

router = APIRouter()

class SettingsIn(BaseModel):
    start_date: str
    name_1: str
    name_2: str

class QuoteIn(BaseModel):
    content: str

@router.get("/api/settings")
def get_settings(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return {
        "start_date": settings_repo.get_setting(db, "start_date", ""),
        "name_1": settings_repo.get_setting(db, "name_1", "Bạn"),
        "name_2": settings_repo.get_setting(db, "name_2", "Người ấy"),
    }

@router.post("/api/settings")
def update_settings(data: SettingsIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    settings_repo.set_setting(db, "start_date", data.start_date)
    settings_repo.set_setting(db, "name_1", data.name_1)
    settings_repo.set_setting(db, "name_2", data.name_2)
    return {"status": "saved"}

@router.get("/api/quotes")
def list_quotes(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return [{"id": q.id, "content": q.content} for q in settings_repo.list_quotes(db)]

@router.post("/api/quotes")
def add_quote(data: QuoteIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    settings_repo.create_quote(db, data.content)
    return {"status": "saved"}

@router.delete("/api/quotes/{quote_id}")
def remove_quote(quote_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    settings_repo.delete_quote(db, quote_id)
    return {"status": "deleted"}

@router.get("/api/quotes/random")
def get_random_quote(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return {"content": settings_repo.random_quote(db)}