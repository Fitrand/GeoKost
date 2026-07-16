from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import timedelta
import uuid

from app.database import get_db
from app.models.user import User
from app.services.auth import (
    verify_password, get_password_hash, create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user_token
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserRegister(BaseModel):
    nama: str
    email: EmailStr
    password: str
    role: str = "mahasiswa" # 'mahasiswa' atau 'mitra'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    nama: str
    email: str
    role: str

class ProfileUpdate(BaseModel):
    nama:       Optional[str] = None
    no_telepon: Optional[str] = None
    kampus:     Optional[str] = None
    prodi:      Optional[str] = None
    angkatan:   Optional[str] = None

class ChangePassword(BaseModel):
    password_lama: str
    password_baru: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    # Cek email exist
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        id=uuid.uuid4(),
        nama=user.nama,
        email=user.email,
        password_hash=hashed_password,
        role=user.role if user.role in ["mitra", "mahasiswa"] else "mahasiswa"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Berhasil mendaftar", "user_id": str(new_user.id)}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id), "role": db_user.role, "nama": db_user.nama},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": str(db_user.id),
            "nama": db_user.nama,
            "email": db_user.email,
            "role": db_user.role
        }
    }

@router.get("/me")
def get_me(token_data: dict = Depends(get_current_user_token), db: Session = Depends(get_db)):
    user_id = token_data.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return {
        "id":         str(user.id),
        "nama":       user.nama,
        "email":      user.email,
        "role":       user.role,
        "no_telepon": getattr(user, 'no_telepon', None),
        "kampus":     getattr(user, 'kampus', None),
        "prodi":      getattr(user, 'prodi', None),
        "angkatan":   getattr(user, 'angkatan', None),
    }

@router.put("/profile", summary="Update profil user")
def update_profile(
    payload: ProfileUpdate,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Update informasi profil user yang sedang login."""
    user_id = token_data.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Tidak ada data yang diupdate")

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return {
        "message":    "Profil berhasil diperbarui",
        "id":         str(user.id),
        "nama":       user.nama,
        "email":      user.email,
        "role":       user.role,
        "no_telepon": user.no_telepon,
        "kampus":     user.kampus,
        "prodi":      user.prodi,
        "angkatan":   user.angkatan,
    }

@router.put("/change-password", summary="Ganti password user")
def change_password(
    payload: ChangePassword,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Ganti password user yang sedang login. Butuh password lama untuk verifikasi."""
    user_id = token_data.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if not verify_password(payload.password_lama, user.password_hash):
        raise HTTPException(status_code=400, detail="Password lama salah")

    if len(payload.password_baru) < 6:
        raise HTTPException(status_code=422, detail="Password baru minimal 6 karakter")

    user.password_hash = get_password_hash(payload.password_baru)
    db.commit()
    return {"message": "Password berhasil diubah"}


# ─────────────────────────────────────────────────────────────────
# Forgot Password — Token-based reset (tanpa SMTP eksternal)
# ─────────────────────────────────────────────────────────────────
import secrets
from datetime import datetime, timezone

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password_baru: str


@router.post("/forgot-password", summary="Minta token reset password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Cek apakah email terdaftar, lalu generate token reset (UUID) yang disimpan di DB.
    Token berlaku 15 menit. Di production, kirim token via email.
    Di development, token dikembalikan langsung di response untuk kemudahan testing.
    """
    import os
    user = db.query(User).filter(User.email == payload.email).first()

    # Selalu return 200 untuk mencegah user enumeration
    if not user:
        return {"message": "Jika email terdaftar, instruksi reset akan dikirim."}

    # Hapus token lama jika ada
    db.execute(
        text("DELETE FROM password_reset_tokens WHERE user_id = :uid"),
        {"uid": str(user.id)}
    )

    # Generate token baru (32 bytes hex = 64 karakter)
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    db.execute(
        text("""
            INSERT INTO password_reset_tokens (token, user_id, expires_at)
            VALUES (:token, :uid, :exp)
        """),
        {"token": reset_token, "uid": str(user.id), "exp": expires_at}
    )
    db.commit()

    # ── Di production: kirim email dengan link reset ──
    # Di development: kembalikan token di response (hanya jika APP_ENV != production)
    is_production = os.getenv("APP_ENV", "development") == "production"
    response = {"message": "Jika email terdaftar, instruksi reset telah dikirim."}
    if not is_production:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        response["reset_link"] = f"{frontend_url}/reset-password?token={reset_token}"
        response["dev_note"] = "Link ini hanya tampil di mode development"

    return response


@router.post("/reset-password", summary="Reset password dengan token")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validasi token reset password dan set password baru.
    Token hanya bisa dipakai sekali dan kadaluarsa setelah 15 menit.
    """
    if len(payload.password_baru) < 6:
        raise HTTPException(status_code=422, detail="Password minimal 6 karakter")

    # Cari token yang valid dan belum expired
    row = db.execute(
        text("""
            SELECT prt.user_id, prt.expires_at
            FROM password_reset_tokens prt
            WHERE prt.token = :token
        """),
        {"token": payload.token}
    ).mappings().fetchone()

    if not row:
        raise HTTPException(status_code=400, detail="Token tidak valid atau sudah digunakan")

    # Cek expiry
    expires_at = row["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        db.execute(text("DELETE FROM password_reset_tokens WHERE token = :t"), {"t": payload.token})
        db.commit()
        raise HTTPException(status_code=400, detail="Token sudah kadaluarsa. Silakan minta reset ulang.")

    # Update password
    user = db.query(User).filter(User.id == row["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user.password_hash = get_password_hash(payload.password_baru)

    # Hapus token setelah dipakai (one-time use)
    db.execute(text("DELETE FROM password_reset_tokens WHERE token = :t"), {"t": payload.token})
    db.commit()

    return {"message": "Password berhasil direset. Silakan login dengan password baru."}

