from sqlalchemy.orm import Session
from models import Photo

def list_photos(db: Session):
    return db.query(Photo).order_by(Photo.created_at.desc()).all()

def create_photo(db: Session, album: str, url: str, uploaded_by: str):
    photo = Photo(album=album, url=url, uploaded_by=uploaded_by)
    db.add(photo)
    db.commit()
    return photo