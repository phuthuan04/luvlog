from sqlalchemy.orm import Session
from models import Activity

def list_activities(db: Session):
    return db.query(Activity).order_by(Activity.visited_at.desc()).all()

def create_activity(db: Session, place_name: str, category: str, note: str, visited_at, created_by: str):
    activity = Activity(place_name=place_name, category=category, note=note, visited_at=visited_at, created_by=created_by)
    db.add(activity)
    db.commit()
    return activity

def delete_activity(db: Session, activity_id: int):
    db.query(Activity).filter(Activity.id == activity_id).delete()
    db.commit()