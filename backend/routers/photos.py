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


def serialize_photo(photo, albums: dict[int, str]):
    return {
        "id": photo.id,
        "album_id": photo.album_id,
        "album_name": albums.get(photo.album_id, "Chưa phân loại"),
        "url": photo.url,
        "filename": photo.filename,
        "file_size": photo.file_size,
        "caption": photo.caption,
        "caption_author": photo.caption_author,
        "caption_updated_at": photo.caption_updated_at.isoformat() if photo.caption_updated_at else None,
        "uploaded_by": photo.uploaded_by,
        "created_at": photo.created_at.isoformat(),
        "sort_order": photo.sort_order,
    }


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
    return [serialize_photo(photo, albums) for photo in photos]


@router.patch("/api/photos/{photo_id}")
def update_photo_caption(photo_id: int, data: CaptionIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    photo = photo_repo.update_caption(db, photo_id, data.caption, user)
    if not photo:
        raise HTTPException(status_code=404, detail="Không tìm thấy ảnh")
    album = album_repo.get_album(db, photo.album_id) if photo.album_id else None
    albums = {photo.album_id: album.name if album else "Chưa phân loại"}
    return {"status": "updated", "photo": serialize_photo(photo, albums)}


class ReorderIn(BaseModel):
    album_id: int
    ordered_photo_ids: list[int]


@router.post("/api/photos/reorder")
def reorder_photos_endpoint(data: ReorderIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    photo_repo.reorder_photos(db, data.album_id, data.ordered_photo_ids)
    return {"status": "reordered"}