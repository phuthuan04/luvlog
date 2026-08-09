from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import uuid
import unicodedata
import re
from supabase import create_client
from database import get_db
from services.auth_service import require_login
from repositories import photo_repo, album_repo

router = APIRouter()
supabase_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SECRET_KEY"))

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text) or "album"

class AlbumIn(BaseModel):
    name: str

class CaptionIn(BaseModel):
    caption: str


@router.get("/api/albums")
def list_albums(user: str = Depends(require_login), db: Session = Depends(get_db)):
    items = album_repo.list_albums(db)
    return [{"id": a.id, "name": a.name, "photo_count": count, "created_at": a.created_at.isoformat()} for a, count in items]

@router.post("/api/albums")
def create_album(data: AlbumIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    album_repo.create_album(db, data.name, user)
    return {"status": "saved"}

@router.delete("/api/albums/{album_id}")
def delete_album(album_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    if album_repo.photo_count_in_album(db, album_id) > 0:
        raise HTTPException(status_code=400, detail="Album còn ảnh, không xoá được")
    album_repo.delete_album(db, album_id)
    return {"status": "deleted"}

@router.post("/api/photos")
async def upload_photo(
    album_id: int = Form(...), file: UploadFile = File(...), file_hash: str = Form(""),
    user: str = Depends(require_login), db: Session = Depends(get_db),
):
    album = album_repo.get_album(db, album_id)
    if not album:
        raise HTTPException(status_code=400, detail="Album không tồn tại")

    if photo_repo.hash_exists(db, file_hash):
        return {"status": "skipped_duplicate", "filename": file.filename}

    ext = file.filename.split(".")[-1]
    path = f"{slugify(album.name)}/{uuid.uuid4()}.{ext}"
    content = await file.read()
    supabase_client.storage.from_("photos").upload(path, content, {"content-type": file.content_type})
    public_url = supabase_client.storage.from_("photos").get_public_url(path)
    photo_repo.create_photo(db, album_id, public_url, user, file.filename, len(content), file_hash)
    return {"status": "saved", "url": public_url}

@router.get("/api/photos")
def list_photos(user: str = Depends(require_login), db: Session = Depends(get_db)):
    photos = photo_repo.list_photos(db)
    albums = {a.id: a.name for a, _ in album_repo.list_albums(db)}
    return [
        {"id": p.id, "album_id": p.album_id, "album_name": albums.get(p.album_id, "Chưa phân loại"),
         "url": p.url, "filename": p.filename, "file_size": p.file_size, "caption": p.caption,
         "uploaded_by": p.uploaded_by, "created_at": p.created_at.isoformat(), "sort_order": p.sort_order}
        for p in photos
    ]


@router.patch("/api/photos/{photo_id}")
def update_photo_caption(photo_id: int, data: CaptionIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    photo = photo_repo.update_caption(db, photo_id, data.caption)
    if not photo:
        raise HTTPException(status_code=404, detail="Không tìm thấy ảnh")
    return {"status": "updated"}


class ReorderIn(BaseModel):
    album_id: int
    ordered_photo_ids: list


@router.post("/api/photos/reorder")
def reorder_photos_endpoint(data: ReorderIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    photo_repo.reorder_photos(db, data.album_id, data.ordered_photo_ids)
    return {"status": "reordered"}