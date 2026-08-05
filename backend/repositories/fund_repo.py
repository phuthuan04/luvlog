from sqlalchemy.orm import Session
from models import FundTransaction, FundGoal

def list_transactions(db: Session):
    return db.query(FundTransaction).order_by(FundTransaction.created_at.desc()).all()

def list_goals(db: Session):
    return db.query(FundGoal).order_by(FundGoal.created_at.desc()).all()

def create_transaction(db: Session, amount: int, description: str, goal_id, created_by: str):
    tx = FundTransaction(amount=amount, description=description, goal_id=goal_id, created_by=created_by)
    db.add(tx)
    db.commit()
    return tx

def delete_transaction(db: Session, transaction_id: int):
    db.query(FundTransaction).filter(FundTransaction.id == transaction_id).delete()
    db.commit()

def create_goal(db: Session, name: str, target_amount: int):
    goal = FundGoal(name=name, target_amount=target_amount)
    db.add(goal)
    db.commit()
    return goal

def delete_goal(db: Session, goal_id: int):
    db.query(FundGoal).filter(FundGoal.id == goal_id).delete()
    db.commit()