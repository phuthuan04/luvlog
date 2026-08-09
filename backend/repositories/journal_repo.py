from sqlalchemy.orm import Session
from models import Journal

def list_journal_entries(db: Session):
    return db.query(Journal).order_by(Journal.created_at.desc()).all()

def create_journal_entry(db: Session, title: str, content: str, mood: str, author: str):
    entry = Journal(title=title, content=content, mood=mood, author=author)
    db.add(entry)
    db.commit()
    return entry

def get_journal_entry(db: Session, entry_id: int):
    return db.query(Journal).filter(Journal.id == entry_id).first()

def update_journal_entry(db: Session, entry_id: int, title: str, content: str, mood: str):
    entry = get_journal_entry(db, entry_id)
    if not entry:
        return None
    entry.title = title
    entry.content = content
    entry.mood = mood
    db.commit()
    return entry

def delete_journal_entry(db: Session, entry_id: int):
    db.query(Journal).filter(Journal.id == entry_id).delete()
    db.commit()