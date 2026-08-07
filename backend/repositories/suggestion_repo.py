from sqlalchemy.orm import Session
from models import Suggestion

def list_suggestions(db: Session, media_type: str):
    return db.query(Suggestion).filter(Suggestion.media_type == media_type).order_by(Suggestion.created_at.desc()).all()

def create_suggestion(db: Session, media_type: str, title: str, cover_url: str, external_id: str, category: str):
    s = Suggestion(media_type=media_type, title=title, cover_url=cover_url, external_id=external_id, category=category)
    db.add(s)
    db.commit()
    return s

def get_suggestion(db: Session, suggestion_id: int):
    return db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()

def delete_suggestion(db: Session, suggestion_id: int):
    db.query(Suggestion).filter(Suggestion.id == suggestion_id).delete()
    db.commit()

def title_exists_in_suggestions(db: Session, media_type: str, title: str):
    return db.query(Suggestion).filter(Suggestion.media_type == media_type, Suggestion.title == title).first() is not None