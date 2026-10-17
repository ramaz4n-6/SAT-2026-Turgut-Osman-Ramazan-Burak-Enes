"""
Kullanıcı Giriş / Kayıt Yetkilendirme Router'ı
bozok66 MySQL veritabanındaki users tablosuna bağlanır.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User

router = APIRouter()


# ---------- Pydantic Şemaları ----------

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


# ---------- Endpoint: Giriş Yap ----------

@router.post("/login", response_model=dict)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    E-posta ve şifre ile giriş yap.
    bozok66.users tablosundan kullanıcıyı doğrular.
    """
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı."
        )

    # Şu an DB'de düz metin şifre saklı (geliştirme aşaması)
    if user.hashed_password != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesabınız aktif değil."
        )

    return {
        "success": True,
        "message": "Giriş başarılı!",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
        }
    }


# ---------- Endpoint: Kayıt Ol ----------

@router.post("/register", response_model=dict)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Yeni kullanıcı kaydı.
    bozok66.users tablosuna yeni satır ekler.
    """
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu e-posta adresi zaten kayıtlı."
        )

    new_user = User(
        full_name=request.full_name,
        email=request.email,
        hashed_password=request.password,   # gerçek projede hash kullanılmalı
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "Kayıt başarılı! Giriş yapabilirsiniz.",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
        }
    }


# ---------- Endpoint: Sağlık Kontrolü ----------

@router.get("/me/{user_id}", response_model=dict)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "is_active": user.is_active,
    }
