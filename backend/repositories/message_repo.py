from sqlalchemy.orm import Session
from models import Message, MessageComment

def get_latest_message(db: Session):
    return db.query(Message).order_by(Message.id.desc()).first()

def list_messages(db: Session, limit: int = 20):
    return db.query(Message).order_by(Message.id.desc()).limit(limit).all()

def create_message(db: Session, content: str, created_by: str):
    msg = Message(content=content, created_by=created_by)
    db.add(msg)
    db.commit()
    return msg


def count_comments(db: Session, message_id: int):
    return db.query(MessageComment).filter(MessageComment.message_id == message_id).count()

def list_comments(db: Session, message_id: int):
    return db.query(MessageComment).filter(MessageComment.message_id == message_id).order_by(MessageComment.created_at.asc()).all()

def create_comment(db: Session, message_id: int, content: str, created_by: str):
    c = MessageComment(message_id=message_id, content=content, created_by=created_by)
    db.add(c)
    db.commit()
    return c