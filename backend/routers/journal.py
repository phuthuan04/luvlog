from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.auth_service import require_login
from repositories import journal_repo

router = APIRouter()

class JournalIn(BaseModel):
    title: str
    content: str

@router.get("/api/journal")
def list_journal(user: str = Depends(require_login), db: Session = Depends(get_db)):
    entries = journal_repo.list_journal_entries(db)
    return [
        {"id": e.id, "title": e.title, "content": e.content, "author": e.author,
         "created_at": e.created_at.isoformat() if e.created_at else None}
        for e in entries
    ]

@router.post("/api/journal")
def create_journal(data: JournalIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    journal_repo.create_journal_entry(db, data.title, data.content, user)
    return {"status": "saved"}