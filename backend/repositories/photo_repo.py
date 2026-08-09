from sqlalchemy.orm import Session
from models import Photo

def list_photos(db: Session):
    return db.query(Photo).order_by(Photo.created_at.desc()).all()

def create_photo(db: Session, album_id: int, url: str, uploaded_by: str, filename: str = "", file_size: int = 0, file_hash: str = ""):
    photo = Photo(album_id=album_id, url=url, uploaded_by=uploaded_by, filename=filename, file_size=file_size, file_hash=file_hash)
    db.add(photo)
    db.commit()
    return photo

def hash_exists(db: Session, file_hash: str):
    if not file_hash:
        return False
    return db.query(Photo).filter(Photo.file_hash == file_hash).first() is not None

def update_caption(db: Session, photo_id: int, caption: str):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        return None
    photo.caption = caption
    db.commit()
    return photo