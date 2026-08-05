from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import uuid
from supabase import create_client
from database import get_db
from services.auth_service import require_login
from repositories import photo_repo
import unicodedata
import re

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text) or "album"

router = APIRouter()
supabase_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SECRET_KEY"))

@router.post("/api/photos")
async def upload_photo(
    album: str = Form(...), file: UploadFile = File(...),
    user: str = Depends(require_login), db: Session = Depends(get_db),
):
    ext = file.filename.split(".")[-1]
    path = f"{slugify(album)}/{uuid.uuid4()}.{ext}"
    content = await file.read()
    supabase_client.storage.from_("photos").upload(path, content, {"content-type": file.content_type})
    public_url = supabase_client.storage.from_("photos").get_public_url(path)
    photo_repo.create_photo(db, album, public_url, user)
    return {"status": "saved", "url": public_url}

@router.get("/api/photos")
def list_photos(user: str = Depends(require_login), db: Session = Depends(get_db)):
    photos = photo_repo.list_photos(db)
    return [{"id": p.id, "album": p.album, "url": p.url, "created_at": p.created_at.isoformat()} for p in photos]