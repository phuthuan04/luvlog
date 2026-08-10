from sqlalchemy.orm import Session
from models import Photo
from datetime import datetime

def list_photos(db: Session):
    # Order by album then sort_order (if set) then created_at desc
    return db.query(Photo).order_by(Photo.album_id.asc(), Photo.sort_order.asc(), Photo.created_at.desc()).all()

def create_photo(db: Session, album_id: int, url: str, uploaded_by: str, filename: str = "", file_size: int = 0, file_hash: str = ""):
    photo = Photo(album_id=album_id, url=url, uploaded_by=uploaded_by, filename=filename, file_size=file_size, file_hash=file_hash)
    db.add(photo)
    db.commit()
    return photo

def hash_exists(db: Session, file_hash: str):
    if not file_hash:
        return False
    return db.query(Photo).filter(Photo.file_hash == file_hash).first() is not None

def update_caption(db: Session, photo_id: int, caption: str, author: str):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        return None
    photo.caption = caption
    if caption:
        photo.caption_author = author
        photo.caption_updated_at = datetime.utcnow()
    else:
        photo.caption_author = None
        photo.caption_updated_at = None
    db.commit()
    return photo

def reorder_photos(db: Session, album_id: int, ordered_photo_ids: list):
    # Update sort_order for the provided photo ids in given album according to the order in list
    for idx, pid in enumerate(ordered_photo_ids):
        db.query(Photo).filter(Photo.id == pid, Photo.album_id == album_id).update({"sort_order": idx})
    db.commit()
    return True