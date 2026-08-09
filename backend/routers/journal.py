from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.auth_service import require_login
from repositories import journal_repo

router = APIRouter()

class JournalIn(BaseModel):
    title: str
    content: str
    mood: str = ""

@router.get("/api/journal")
def list_journal(user: str = Depends(require_login), db: Session = Depends(get_db)):
    entries = journal_repo.list_journal_entries(db)
    return [
        {"id": e.id, "title": e.title, "content": e.content, "mood": e.mood, "author": e.author,
         "created_at": e.created_at.isoformat() if e.created_at else None}
        for e in entries
    ]

@router.post("/api/journal")
def create_journal(data: JournalIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    journal_repo.create_journal_entry(db, data.title, data.content, data.mood, user)
    return {"status": "saved"}

@router.patch("/api/journal/{entry_id}")
def update_journal(entry_id: int, data: JournalIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    entry = journal_repo.update_journal_entry(db, entry_id, data.title, data.content, data.mood)
    if not entry:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    return {"status": "updated"}

@router.delete("/api/journal/{entry_id}")
def delete_journal(entry_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    journal_repo.delete_journal_entry(db, entry_id)
    return {"status": "deleted"}