from sqlalchemy.orm import Session

def list_items(db: Session, model):
    return db.query(model).order_by(model.created_at.desc()).all()

def create_item(db: Session, model, title: str, cover_url: str, status: str, added_by: str):
    item = model(title=title, cover_url=cover_url, status=status, added_by=added_by)
    db.add(item)
    db.commit()
    return item

def update_item(db: Session, model, item_id: int, status: str, rating, review, experienced_at):
    item = db.query(model).filter(model.id == item_id).first()
    if not item:
        return None
    item.status = status
    if rating is not None:
        item.rating = rating
    if review is not None:
        item.review = review
    if experienced_at is not None:
        item.experienced_at = experienced_at
    db.commit()
    return item

def delete_item(db: Session, model, item_id: int):
    db.query(model).filter(model.id == item_id).delete()
    db.commit()