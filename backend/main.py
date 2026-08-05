from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os
from routers import auth, message, journal, photos, fund, activities, media

load_dotenv()

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

app.include_router(auth.router)
app.include_router(message.router)
app.include_router(journal.router)
app.include_router(photos.router)
app.include_router(fund.router)
app.include_router(activities.router)
app.include_router(media.router)
@app.get("/api/health")
def health_check():
    return {"status": "ok"}