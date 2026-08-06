from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
import os
from database import get_db
from models import Movie, Book
from repositories import media_repo
from services import media_service

router = APIRouter()

def verify_cron_secret(authorization: str = Header(None)):
    secret = os.getenv("CRON_SECRET")
    if not secret or authorization != f"Bearer {secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("/api/v1/cron/auto-crawl")
def auto_crawl(db: Session = Depends(get_db), _: None = Depends(verify_cron_secret)):
    added = {"movies": 0, "books": 0}

    movie_seed = media_repo.get_random_high_rated(db, Movie)
    if movie_seed and movie_seed.external_id:
        for m in media_service.get_similar_movies(movie_seed.external_id):
            if not media_repo.title_exists(db, Movie, m["title"]):
                media_repo.create_item(db, Movie, m["title"], m["cover_url"], "muon", "luvlog-bot", m["external_id"], m["category"])
                added["movies"] += 1

    book_seed = media_repo.get_random_high_rated(db, Book)
    if book_seed and book_seed.category:
        for b in media_service.get_books_by_category(book_seed.category):
            if not media_repo.title_exists(db, Book, b["title"]):
                media_repo.create_item(db, Book, b["title"], b["cover_url"], "muon", "luvlog-bot", b["external_id"], b["category"])
                added["books"] += 1

    return {"status": "done", "added": added}