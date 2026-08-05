from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.auth_service import require_login
from repositories import message_repo

router = APIRouter()

class MessageIn(BaseModel):
    content: str

@router.get("/api/message")
def get_message(user: str = Depends(require_login), db: Session = Depends(get_db)):
    msg = message_repo.get_latest_message(db)
    return {"content": msg.content if msg else "", "updated_at": msg.updated_at if msg else None}

@router.post("/api/message")
def set_message(data: MessageIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    message_repo.create_message(db, data.content)
    return {"status": "saved"}