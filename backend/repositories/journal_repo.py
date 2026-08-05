from sqlalchemy.orm import Session
from models import Journal

def list_journal_entries(db: Session):
    return db.query(Journal).order_by(Journal.created_at.desc()).all()

def create_journal_entry(db: Session, title: str, content: str, author: str):
    entry = Journal(title=title, content=content, author=author)
    db.add(entry)
    db.commit()
    return entry