from fastapi import FastAPI
from pydantic import BaseModel
from database import SessionLocal, Message, Journal
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
