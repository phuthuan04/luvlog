from fastapi import FastAPI
from datetime import datetime
from pydantic import BaseModel
from database import SessionLocal, Message, Journal, Photo, FundTransaction, FundGoal, Activity
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi import Depends, HTTPException, Request
from starlette.middleware.sessions import SessionMiddleware
import bcrypt
from dotenv import load_dotenv

## Load environment variables
load_dotenv()
USERS = {
    k: v for k, v in {
        os.getenv("ADMIN1_USER"): os.getenv("ADMIN1_PASS_HASH"),
        os.getenv("ADMIN2_USER"): os.getenv("ADMIN2_PASS_HASH"),
    }.items() if k and v
}

from supabase import create_client
from fastapi import UploadFile, File, Form
import uuid

supabase_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SECRET_KEY"))

def require_login(request: Request):
    if not request.session.get("user"):
        raise HTTPException(status_code=401, detail="Chưa đăng nhập")
    return request.session["user"]
## CORS and session middleware
app = FastAPI()
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET"),
    same_site="none",
    https_only=True,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://luvlog-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

## Pydantic models
class MessageIn(BaseModel):
    content: str

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/message")
def get_message(user: str = Depends(require_login)):
    db = SessionLocal()
    msg = db.query(Message).order_by(Message.id.desc()).first()
    db.close()
    return {"content": msg.content if msg else "", "updated_at": msg.updated_at if msg else None}

@app.post("/api/message")
def set_message(data: MessageIn, user: str = Depends(require_login)):
    db = SessionLocal()
    db.add(Message(content=data.content))
    db.commit()
    db.close()
    return {"status": "saved"}

class JournalIn(BaseModel):
    title: str
    content: str

@app.get("/api/journal")
def list_journal(user: str = Depends(require_login)):
    db = SessionLocal()
    entries = db.query(Journal).order_by(Journal.created_at.desc()).all()
    db.close()
    return [
        {
            "id": e.id,
            "title": e.title,
            "content": e.content,
            "author": e.author,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in entries
    ]

@app.post("/api/journal")
def create_journal(data: JournalIn, user: str = Depends(require_login)):
    db = SessionLocal()
    entry = Journal(title=data.title, content=data.content, author=user)
    db.add(entry)
    db.commit()
    db.close()
    return {"status": "saved"}

@app.post("/api/photos")
async def upload_photo(
    album: str = Form(...),
    file: UploadFile = File(...),
    user: str = Depends(require_login),
):
    ext = file.filename.split(".")[-1]
    path = f"{album}/{uuid.uuid4()}.{ext}"
    content = await file.read()
    supabase_client.storage.from_("photos").upload(
        path, content, {"content-type": file.content_type}
    )
    public_url = supabase_client.storage.from_("photos").get_public_url(path)

    db = SessionLocal()
    db.add(Photo(album=album, url=public_url, uploaded_by=user))
    db.commit()
    db.close()
    return {"status": "saved", "url": public_url}

@app.get("/api/photos")
def list_photos(user: str = Depends(require_login)):
    db = SessionLocal()
    photos = db.query(Photo).order_by(Photo.created_at.desc()).all()
    db.close()
    return [{"id": p.id, "album": p.album, "url": p.url, "created_at": p.created_at.isoformat()} for p in photos]

## Login and session management
class LoginIn(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(data: LoginIn, request: Request):
    hashed = USERS.get(data.username)
    if not hashed or not bcrypt.checkpw(data.password.encode(), hashed.encode()):
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")
    request.session["user"] = data.username
    return {"status": "logged_in"}

@app.post("/api/logout")
def logout(request: Request):
    request.session.clear()
    return {"status": "logged_out"}

@app.get("/api/me")
def me(request: Request):
    return {"user": request.session.get("user")}

class FundTransactionIn(BaseModel):
    amount: int
    description: str
    goal_id: int | None = None

class FundGoalIn(BaseModel):
    name: str
    target_amount: int

class ActivityIn(BaseModel):
    place_name: str
    category: str
    note: str = ""
    visited_at: str  # "YYYY-MM-DD"

@app.get("/api/fund")
def get_fund(user: str = Depends(require_login)):
    db = SessionLocal()
    transactions = db.query(FundTransaction).order_by(FundTransaction.created_at.desc()).all()
    goals = db.query(FundGoal).order_by(FundGoal.created_at.desc()).all()
    balance = sum(t.amount for t in transactions)
    db.close()
    return {
        "balance": balance,
        "transactions": [
            {"id": t.id, "amount": t.amount, "description": t.description, "goal_id": t.goal_id,
             "created_by": t.created_by, "created_at": t.created_at.isoformat()}
            for t in transactions
        ],
        "goals": [
            {
                "id": g.id, "name": g.name, "target_amount": g.target_amount,
                "current": sum(t.amount for t in transactions if t.goal_id == g.id),
                "progress": round(
                    sum(t.amount for t in transactions if t.goal_id == g.id) / g.target_amount * 100, 1
                ) if g.target_amount else 0,
            }
            for g in goals
        ],
    }

@app.post("/api/fund/transactions")
def add_fund_transaction(data: FundTransactionIn, user: str = Depends(require_login)):
    db = SessionLocal()
    db.add(FundTransaction(amount=data.amount, description=data.description, goal_id=data.goal_id, created_by=user))
    db.commit()
    db.close()
    return {"status": "saved"}

@app.delete("/api/fund/transactions/{transaction_id}")
def delete_fund_transaction(transaction_id: int, user: str = Depends(require_login)):
    db = SessionLocal()
    db.query(FundTransaction).filter(FundTransaction.id == transaction_id).delete()
    db.commit()
    db.close()
    return {"status": "deleted"}

@app.post("/api/fund/goals")
def add_fund_goal(data: FundGoalIn, user: str = Depends(require_login)):
    db = SessionLocal()
    db.add(FundGoal(name=data.name, target_amount=data.target_amount))
    db.commit()
    db.close()
    return {"status": "saved"}

@app.delete("/api/fund/goals/{goal_id}")
def delete_fund_goal(goal_id: int, user: str = Depends(require_login)):
    db = SessionLocal()
    db.query(FundGoal).filter(FundGoal.id == goal_id).delete()
    db.commit()
    db.close()
    return {"status": "deleted"}

@app.get("/api/activities")
def list_activities(user: str = Depends(require_login)):
    db = SessionLocal()
    items = db.query(Activity).order_by(Activity.visited_at.desc()).all()
    db.close()
    return [
        {"id": a.id, "place_name": a.place_name, "category": a.category, "note": a.note,
         "visited_at": a.visited_at.isoformat() if a.visited_at else None, "created_by": a.created_by}
        for a in items
    ]

@app.post("/api/activities")
def add_activity(data: ActivityIn, user: str = Depends(require_login)):
    db = SessionLocal()
    db.add(Activity(
        place_name=data.place_name, category=data.category, note=data.note,
        visited_at=datetime.fromisoformat(data.visited_at), created_by=user,
    ))
    db.commit()
    db.close()
    return {"status": "saved"}

@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: int, user: str = Depends(require_login)):
    db = SessionLocal()
    db.query(Activity).filter(Activity.id == activity_id).delete()
    db.commit()
    db.close()
    return {"status": "deleted"}