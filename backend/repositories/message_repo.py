from sqlalchemy.orm import Session
from models import Message

def get_latest_message(db: Session):
    return db.query(Message).order_by(Message.id.desc()).first()

def create_message(db: Session, content: str):
    msg = Message(content=content)
    db.add(msg)
    db.commit()
    return msg