from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.auth_service import require_login
from repositories import fund_repo
from fastapi import HTTPException
from models import FundGoal

router = APIRouter()

class FundTransactionIn(BaseModel):
    amount: int
    description: str
    goal_id: int | None = None

class FundGoalIn(BaseModel):
    name: str
    target_amount: int

@router.get("/api/fund")
def get_fund(user: str = Depends(require_login), db: Session = Depends(get_db)):
    transactions = fund_repo.list_transactions(db)
    goals = fund_repo.list_goals(db)
    balance = sum(t.amount for t in transactions)
    return {
        "balance": balance,
        "transactions": [
            {"id": t.id, "amount": t.amount, "description": t.description, "goal_id": t.goal_id,
             "created_by": t.created_by, "created_at": t.created_at.isoformat()}
            for t in transactions
        ],
        "goals": [
            {"id": g.id, "name": g.name, "target_amount": g.target_amount,
             "current": sum(t.amount for t in transactions if t.goal_id == g.id),
             "progress": round(sum(t.amount for t in transactions if t.goal_id == g.id) / g.target_amount * 100, 1) if g.target_amount else 0}
            for g in goals
        ],
    }

@router.post("/api/fund/transactions")
def add_fund_transaction(data: FundTransactionIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    if data.goal_id:
        goal = db.query(FundGoal).filter(FundGoal.id == data.goal_id).first()
        if not goal:
            raise HTTPException(status_code=400, detail="Mục tiêu không tồn tại")
    fund_repo.create_transaction(db, data.amount, data.description, data.goal_id, user)
    return {"status": "saved"}

@router.delete("/api/fund/transactions/{transaction_id}")
def delete_fund_transaction(transaction_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    fund_repo.delete_transaction(db, transaction_id)
    return {"status": "deleted"}

@router.post("/api/fund/goals")
def add_fund_goal(data: FundGoalIn, user: str = Depends(require_login), db: Session = Depends(get_db)):
    fund_repo.create_goal(db, data.name, data.target_amount)
    return {"status": "saved"}

@router.delete("/api/fund/goals/{goal_id}")
def delete_fund_goal(goal_id: int, user: str = Depends(require_login), db: Session = Depends(get_db)):
    fund_repo.delete_goal(db, goal_id)
    return {"status": "deleted"}