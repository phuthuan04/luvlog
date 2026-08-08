from sqlalchemy.orm import Session
from models import Album, Photo

def list_albums(db: Session):
    albums = db.query(Album).all()
    result = []
    for a in albums:
        count = db.query(Photo).filter(Photo.album_id == a.id).count()
        result.append((a, count))
    return result

def create_album(db: Session, name: str, created_by: str):
    album = Album(name=name, created_by=created_by)
    db.add(album)
    db.commit()
    return album

def get_album(db: Session, album_id: int):
    return db.query(Album).filter(Album.id == album_id).first()

def delete_album(db: Session, album_id: int):
    db.query(Album).filter(Album.id == album_id).delete()
    db.commit()

def photo_count_in_album(db: Session, album_id: int):
    return db.query(Photo).filter(Photo.album_id == album_id).count()