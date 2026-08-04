from fastapi import FastAPI
from pydantic import BaseModel
from database import SessionLocal, Message
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tạm mở hết, sẽ giới hạn lại khi deploy thật
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageIn(BaseModel):
    content: str

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/message")
def get_message():
    db = SessionLocal()
    msg = db.query(Message).order_by(Message.id.desc()).first()
    db.close()
    return {"content": msg.content if msg else "", "updated_at": msg.updated_at if msg else None}

@app.post("/api/message")
def set_message(data: MessageIn):
    db = SessionLocal()
    db.add(Message(content=data.content))
    db.commit()
    db.close()
    return {"status": "saved"}