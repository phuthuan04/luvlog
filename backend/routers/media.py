from fastapi import APIRouter, Depends, HTTPException
from services import media_service
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from database import get_db
from services.auth_service import require_login
from repositories import media_repo, suggestion_repo
from models import Movie, Book, Song
import requests

router = APIRouter()

class MediaIn(BaseModel):
    title: str
    cover_url: str = ""
    status: str = "muon"
    external_id: str = ""
    category: str = ""

class MediaUpdateIn(BaseModel):
    status: str
    rating: int | None = None
    review: str | None = None
    experienced_at: str | None = None


MODEL_BY_TYPE = {"movies": Movie, "books": Book, "songs": Song}

def serialize(item):
    return {
        "id": item.id, "title": item.title, "cover_url": item.cover_url,
        "status": item.status, "rating": item.rating, "review": item.review,
        "external_id": item.external_id, "category": item.category,
        "added_by": item.added_by,
        "experienced_at": item.experienced_at.isoformat() if item.experienced_at else None,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }

def parse_experienced(value: str | None):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="experienced_at phải đúng định dạng YYYY-MM-DD")

# --- Movies ---
@router.get("/api/movies")
def list_movies(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return [serialize(i) for i in media_repo.list_items(db, Movie)]

@router.post("/api/movies")
def add_movie(data: MediaIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    media_repo.create_item(db, Movie, data.title, data.cover_url, data.status, user, data.external_id, data.category)
    return {"status": "saved"}

@router.patch("/api/movies/{item_id}")
def update_movie(item_id: int, data: MediaUpdateIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    item = media_repo.update_item(db, Movie, item_id, data.status, data.rating, data.review, parse_experienced(data.experienced_at))
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy")
    return {"status": "updated"}

@router.delete("/api/movies/{item_id}")
def delete_movie(item_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    media_repo.delete_item(db, Movie, item_id)
    return {"status": "deleted"}

# --- Books ---
@router.get("/api/books")
def list_books(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return [serialize(i) for i in media_repo.list_items(db, Book)]

@router.post("/api/books")
def add_book(data: MediaIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    media_repo.create_item(db, Book, data.title, data.cover_url, data.status, user, data.external_id, data.category)
    return {"status": "saved"}

@router.patch("/api/books/{item_id}")
def update_book(item_id: int, data: MediaUpdateIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    item = media_repo.update_item(db, Book, item_id, data.status, data.rating, data.review, parse_experienced(data.experienced_at))
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy")
    return {"status": "updated"}

@router.delete("/api/books/{item_id}")
def delete_book(item_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    media_repo.delete_item(db, Book, item_id)
    return {"status": "deleted"}

# --- Songs ---
@router.get("/api/songs")
def list_songs(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return [serialize(i) for i in media_repo.list_items(db, Song)]

@router.post("/api/songs")
def add_song(data: MediaIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    media_repo.create_item(db, Song, data.title, data.cover_url, data.status, user, data.external_id, data.category)
    return {"status": "saved"}

@router.patch("/api/songs/{item_id}")
def update_song(item_id: int, data: MediaUpdateIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    item = media_repo.update_item(db, Song, item_id, data.status, data.rating, data.review, parse_experienced(data.experienced_at))
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy")
    return {"status": "updated"}

@router.delete("/api/songs/{item_id}")
def delete_song(item_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    media_repo.delete_item(db, Song, item_id)
    return {"status": "deleted"}

@router.get("/api/search/movies")
def search_movies_endpoint(q: str, user: str = Depends(require_login)):
    try:
        return media_service.search_movies(q)
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Không thể kết nối tới TMDB")

@router.get("/api/search/books")
def search_books_endpoint(q: str, user: str = Depends(require_login)):
    try:
        return media_service.search_books(q)
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Không thể kết nối tới Google Books")

@router.get("/api/suggestions/{media_type}")
def list_suggestions(media_type: str, user: str = Depends(require_login), db: Session = Depends(get_db)):
    items = suggestion_repo.list_suggestions(db, media_type)
    return [{
        "id": s.id,
        "title": s.title,
        "cover_url": s.cover_url,
        "external_id": s.external_id,
        "category": s.category,
        "based_on": s.based_on,
    } for s in items]

@router.post("/api/suggestions/{suggestion_id}/accept")
def accept_suggestion(suggestion_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    s = suggestion_repo.get_suggestion(db, suggestion_id)
    if not s:
        raise HTTPException(status_code=404, detail="Không tìm thấy gợi ý")
    model = MODEL_BY_TYPE.get(s.media_type)
    if not model:
        raise HTTPException(status_code=400, detail="Loại media không hợp lệ")
    media_repo.create_item(db, model, s.title, s.cover_url, "muon", user, s.external_id, s.category)
    suggestion_repo.delete_suggestion(db, suggestion_id)
    return {"status": "added"}

@router.delete("/api/suggestions/{suggestion_id}")
def dismiss_suggestion(suggestion_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    suggestion_repo.delete_suggestion(db, suggestion_id)
    return {"status": "dismissed"}

@router.post("/api/movies/refresh-suggestions")
def refresh_movie_suggestions(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return {"status": "done", "added": media_service.crawl_movie_suggestions(db)}

@router.post("/api/books/refresh-suggestions")
def refresh_book_suggestions(user: str = Depends(require_login), db: Session = Depends(get_db)):
    return {"status": "done", "added": media_service.crawl_book_suggestions(db)}

@router.get("/api/movies/detail")
def movie_detail(external_id: str, title: str, user: str = Depends(require_login)):
    return media_service.get_movie_detail(external_id, title)