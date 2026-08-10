from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.auth_service import require_login
from repositories import message_repo

router = APIRouter()

class MessageIn(BaseModel):
    content: str

class CommentIn(BaseModel):
    content: str

@router.get("/api/message")
def get_message(user: str = Depends(require_login), db: Session = Depends(get_db)):
    msg = message_repo.get_latest_message(db)
    return {"content": msg.content if msg else "", "updated_at": msg.updated_at if msg else None}

@router.post("/api/message")
def set_message(data: MessageIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    message_repo.create_message(db, data.content, user)
    return {"status": "saved"}

@router.get("/api/messages")
def list_messages(user: str = Depends(require_login), db: Session = Depends(get_db)):
    items = message_repo.list_messages(db)
    return [
        {"id": m.id, "content": m.content, "created_by": m.created_by,
         "updated_at": m.updated_at.isoformat() if m.updated_at else None,
         "comment_count": message_repo.count_comments(db, m.id)}
        for m in items
    ]

@router.get("/api/messages/{message_id}/comments")
def get_comments(message_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    items = message_repo.list_comments(db, message_id)
    return [{"id": c.id, "content": c.content, "created_by": c.created_by, "created_at": c.created_at.isoformat()} for c in items]

@router.post("/api/messages/{message_id}/comments")
def add_comment(message_id: int, data: CommentIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    message_repo.create_comment(db, message_id, data.content, user)
    return {"status": "saved"}