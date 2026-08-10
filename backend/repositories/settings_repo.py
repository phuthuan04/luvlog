from sqlalchemy.orm import Session
from models import Setting, DailyQuote
import random

def get_setting(db: Session, key: str, default=""):
    s = db.query(Setting).filter(Setting.key == key).first()
    return s.value if s else default

def set_setting(db: Session, key: str, value: str):
    s = db.query(Setting).filter(Setting.key == key).first()
    if s:
        s.value = value
    else:
        db.add(Setting(key=key, value=value))
    db.commit()

def list_quotes(db: Session):
    return db.query(DailyQuote).order_by(DailyQuote.id.desc()).all()

def create_quote(db: Session, content: str):
    q = DailyQuote(content=content)
    db.add(q)
    db.commit()
    return q

def delete_quote(db: Session, quote_id: int):
    db.query(DailyQuote).filter(DailyQuote.id == quote_id).delete()
    db.commit()

def random_quote(db: Session):
    quotes = list_quotes(db)
    return random.choice(quotes).content if quotes else "Hôm nay cũng là một ngày tuyệt vời để yêu nhau 💕"