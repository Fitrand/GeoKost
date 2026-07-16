"""
Router: /api/review — Ulasan dan Rating Kost
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4

from app.database import get_db
from app.services.auth import get_current_user_token

router = APIRouter(prefix="/review", tags=["Review & Rating"])


class ReviewCreate(BaseModel):
    kost_id:    str
    rating:     int       # 1-5
    komentar:   Optional[str] = None
    booking_id: Optional[str] = None


def _format_review(row) -> dict:
    return {
        "id":         str(row.id),
        "user_id":    str(row.user_id),
        "user_nama":  row.user_nama,
        "kost_id":    str(row.kost_id),
        "booking_id": str(row.booking_id) if row.booking_id else None,
        "rating":     row.rating,
        "komentar":   row.komentar,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


@router.get("/kost/{kost_id}", summary="Semua review untuk satu kost (publik)")
def get_reviews_by_kost(
    kost_id: str,
    db: Session = Depends(get_db),
):
    """Endpoint publik — tidak perlu login."""
    rows = db.execute(
        text("""
            SELECT r.*, u.nama AS user_nama
            FROM review r
            JOIN users u ON u.id = r.user_id
            WHERE r.kost_id = :kid
            ORDER BY r.created_at DESC
        """),
        {"kid": kost_id}
    ).mappings().fetchall()

    avg_rating = 0.0
    if rows:
        avg_rating = round(sum(r.rating for r in rows) / len(rows), 1)

    return {
        "kost_id":    kost_id,
        "total":      len(rows),
        "avg_rating": avg_rating,
        "data":       [_format_review(r) for r in rows],
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Buat review baru")
def create_review(
    payload: ReviewCreate,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """
    Mahasiswa membuat ulasan untuk kost yang sudah pernah di-booking.
    Validasi: rating 1-5, satu review per user per kost.
    """
    user_id = token_data.get("sub")

    if not (1 <= payload.rating <= 5):
        raise HTTPException(status_code=422, detail="Rating harus antara 1 dan 5")

    # Cek duplikat review
    existing = db.execute(
        text("SELECT id FROM review WHERE user_id = :uid AND kost_id = :kid"),
        {"uid": user_id, "kid": payload.kost_id}
    ).fetchone()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Anda sudah memberikan ulasan untuk kost ini"
        )

    # Validasi booking (opsional tapi disarankan)
    if payload.booking_id:
        booking = db.execute(
            text("""
                SELECT id FROM booking
                WHERE id = :bid AND user_id = :uid AND kost_id = :kid
                  AND status = 'selesai'
            """),
            {"bid": payload.booking_id, "uid": user_id, "kid": payload.kost_id}
        ).fetchone()
        if not booking:
            raise HTTPException(
                status_code=400,
                detail="Booking tidak valid atau belum selesai"
            )

    new_id = uuid4()
    db.execute(
        text("""
            INSERT INTO review (id, user_id, kost_id, booking_id, rating, komentar)
            VALUES (:id, :uid, :kid, :bid, :rating, :komentar)
        """),
        {
            "id":       str(new_id),
            "uid":      user_id,
            "kid":      payload.kost_id,
            "bid":      payload.booking_id,
            "rating":   payload.rating,
            "komentar": payload.komentar,
        }
    )

    # ── Auto-update rating & jumlah_ulasan di tabel kost ──────────────────
    # Dihitung ulang dari semua review yang ada agar selalu akurat.
    db.execute(
        text("""
            UPDATE kost SET
                rating         = (SELECT ROUND(AVG(rating)::numeric, 1) FROM review WHERE kost_id = :kid),
                jumlah_ulasan  = (SELECT COUNT(*) FROM review WHERE kost_id = :kid),
                updated_at     = NOW()
            WHERE id = :kid
        """),
        {"kid": payload.kost_id}
    )
    db.commit()

    row = db.execute(
        text("""
            SELECT r.*, u.nama AS user_nama
            FROM review r JOIN users u ON u.id = r.user_id
            WHERE r.id = :id
        """),
        {"id": str(new_id)}
    ).mappings().fetchone()

    return _format_review(row)
