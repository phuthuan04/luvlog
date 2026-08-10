from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import requests
from database import get_db
from services.auth_service import require_login
from repositories import settings_repo

router = APIRouter()

class SettingsIn(BaseModel):
    start_date: str | None = None
    name_1: str | None = None
    name_2: str | None = None
    telegram_webhook_url: str | None = None
    discord_webhook_url: str | None = None

class QuoteIn(BaseModel):
    content: str


class NotificationTestIn(BaseModel):
    provider: str

@router.get("/api/settings")
def get_settings(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return {
        "start_date": settings_repo.get_setting(db, "start_date", ""),
        "name_1": settings_repo.get_setting(db, "name_1", "Bạn"),
        "name_2": settings_repo.get_setting(db, "name_2", "Người ấy"),
        "telegram_webhook_url": settings_repo.get_setting(db, "telegram_webhook_url", ""),
        "discord_webhook_url": settings_repo.get_setting(db, "discord_webhook_url", ""),
    }

@router.post("/api/settings")
def update_settings(data: SettingsIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    payload = data.model_dump()
    for key, value in payload.items():
        if value is not None:
            settings_repo.set_setting(db, key, value)
    return {"status": "saved"}


@router.post("/api/settings/notifications/test")
def test_notification(data: NotificationTestIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    if data.provider not in {"telegram", "discord"}:
        raise HTTPException(status_code=400, detail="Provider không hợp lệ")

    key = f"{data.provider}_webhook_url"
    webhook_url = settings_repo.get_setting(db, key, "")
    if not webhook_url:
        raise HTTPException(status_code=400, detail="Chưa cấu hình webhook URL")

    name_1 = settings_repo.get_setting(db, "name_1", "Bạn")
    name_2 = settings_repo.get_setting(db, "name_2", "Người ấy")
    message = f"Test thông báo từ luvlog 💕 ({name_1} & {name_2})"
    payload = {"text": message} if data.provider == "telegram" else {"content": message}

    try:
        response = requests.post(webhook_url, json=payload, timeout=10)
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Không gửi được webhook test")

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Webhook trả về lỗi")

    return {"status": "sent"}

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