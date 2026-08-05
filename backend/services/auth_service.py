import os
import bcrypt
from fastapi import HTTPException, Request
from dotenv import load_dotenv
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

def verify_password(username: str, password: str) -> bool:
    hashed = USERS.get(username)
    if not hashed:
        return False
    return bcrypt.checkpw(password.encode(), hashed.encode())