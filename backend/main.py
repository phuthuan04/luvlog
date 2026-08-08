from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os
from routers import auth, message, journal, photos, fund, activities, media, cron

load_dotenv()

app = FastAPI()


IS_LOCAL = os.getenv("ENVIRONMENT") == "local"

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET"),
    same_site="lax" if IS_LOCAL else "none",
    https_only=not IS_LOCAL,
    max_age=6400,
)

allowed_origins = ["https://luvlog-frontend.vercel.app"]
if IS_LOCAL:
    allowed_origins += ["http://127.0.0.1:5500", "http://localhost:5500"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
app.include_router(cron.router)
@app.get("/api/health")
def health_check():
    return {"status": "ok"}