from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
import os
from database import get_db
from services import media_service

router = APIRouter()

def verify_cron_secret(authorization: str = Header(None)):
    secret = os.getenv("CRON_SECRET")
    if not secret or authorization != f"Bearer {secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("/api/v1/cron/auto-crawl")
def auto_crawl(db: Session = Depends(get_db), _: None = Depends(verify_cron_secret)):
    added_movies = media_service.crawl_movie_suggestions(db)
    added_books = media_service.crawl_book_suggestions(db)
    return {"status": "done", "added": {"movies": added_movies, "books": added_books}}