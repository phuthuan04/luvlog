from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from services.auth_service import verify_password

router = APIRouter()

class LoginIn(BaseModel):
    username: str
    password: str

@router.post("/api/login")
def login(data: LoginIn, request: Request):
    if not verify_password(data.username, data.password):
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")
    request.session["user"] = data.username
    return {"status": "logged_in"}

@router.post("/api/logout")
def logout(request: Request):
    request.session.clear()
    return {"status": "logged_out"}

@router.get("/api/me")
def me(request: Request):
    return {"user": request.session.get("user")}