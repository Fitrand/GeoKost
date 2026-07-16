"""
Router: /api/booking — Sistem Pemesanan Kost
Mahasiswa bisa buat, lihat, dan batalkan booking.
Mitra bisa lihat & approve/reject booking untuk kost mereka.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from datetime import date
from uuid import uuid4

from app.database import get_db
from app.services.auth import get_current_user_token

router = APIRouter(prefix="/booking", tags=["Booking"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    kost_id: str
    durasi_bulan: int
    tanggal_masuk: date
    catatan: Optional[str] = None


# ── Helper ──────────────────────────────────────────────────────────────────

def _format_booking(row) -> dict:
    return {
        "id":            str(row.id),
        "user_id":       str(row.user_id),
        "kost_id":       str(row.kost_id),
        "kost_nama":     row.kost_nama,
        "kost_alamat":   row.kost_alamat,
        "kost_foto":     row.kost_foto or [],
        "harga_per_bulan": row.harga_per_bulan,
        "pemilik_id":    str(row.pemilik_id) if row.pemilik_id else None,
        "status":        row.status,
        "durasi_bulan":  row.durasi_bulan,
        "tanggal_masuk": str(row.tanggal_masuk),
        "total_harga":   row.total_harga,
        "catatan":       row.catatan,
        "created_at":    row.created_at.isoformat() if row.created_at else None,
        "updated_at":    row.updated_at.isoformat() if row.updated_at else None,
    }


# ── Endpoints Mahasiswa ──────────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED, summary="Buat booking baru")
def create_booking(
    payload: BookingCreate,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Mahasiswa membuat booking untuk kost yang dipilih."""
    user_id = token_data.get("sub")

    # Ambil data kost untuk validasi & hitung harga
    kost_row = db.execute(
        text("SELECT id, harga_per_bulan, is_active FROM kost WHERE id = :id"),
        {"id": payload.kost_id}
    ).mappings().fetchone()

    if not kost_row:
        raise HTTPException(status_code=404, detail="Kost tidak ditemukan")
    if not kost_row.is_active:
        raise HTTPException(status_code=400, detail="Kost sedang tidak aktif")
    if payload.durasi_bulan < 1:
        raise HTTPException(status_code=422, detail="Durasi minimal 1 bulan")

    # Cek apakah sudah ada booking pending/approved untuk kost ini
    existing = db.execute(
        text("""
            SELECT id FROM booking
            WHERE user_id = :uid AND kost_id = :kid
              AND status IN ('pending', 'approved')
        """),
        {"uid": user_id, "kid": payload.kost_id}
    ).fetchone()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Anda sudah memiliki booking aktif untuk kost ini"
        )

    total_harga = kost_row.harga_per_bulan * payload.durasi_bulan
    new_id = uuid4()

    db.execute(
        text("""
            INSERT INTO booking (id, user_id, kost_id, status, durasi_bulan, tanggal_masuk, total_harga, catatan)
            VALUES (:id, :user_id, :kost_id, 'pending', :durasi, :tgl, :total, :catatan)
        """),
        {
            "id":       str(new_id),
            "user_id":  user_id,
            "kost_id":  payload.kost_id,
            "durasi":   payload.durasi_bulan,
            "tgl":      payload.tanggal_masuk,
            "total":    total_harga,
            "catatan":  payload.catatan,
        }
    )
    db.commit()

    row = db.execute(
        text("""
            SELECT b.*, k.nama AS kost_nama, k.alamat AS kost_alamat,
                   k.foto_urls AS kost_foto, k.harga_per_bulan, k.pemilik_id
            FROM booking b
            JOIN kost k ON k.id = b.kost_id
            WHERE b.id = :id
        """),
        {"id": str(new_id)}
    ).mappings().fetchone()

    return _format_booking(row)


@router.get("/saya", summary="Riwayat booking milik user login")
def my_bookings(
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Daftar semua booking yang dibuat user yang sedang login."""
    user_id = token_data.get("sub")
    rows = db.execute(
        text("""
            SELECT b.*, k.nama AS kost_nama, k.alamat AS kost_alamat,
                   k.foto_urls AS kost_foto, k.harga_per_bulan, k.pemilik_id
            FROM booking b
            JOIN kost k ON k.id = b.kost_id
            WHERE b.user_id = :uid
            ORDER BY b.created_at DESC
        """),
        {"uid": user_id}
    ).mappings().fetchall()

    return {"data": [_format_booking(r) for r in rows], "total": len(rows)}


@router.patch("/{booking_id}/cancel", summary="Mahasiswa batalkan booking")
def cancel_booking(
    booking_id: str,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Mahasiswa membatalkan booking yang masih pending."""
    user_id = token_data.get("sub")
    row = db.execute(
        text("SELECT id, user_id, status FROM booking WHERE id = :id"),
        {"id": booking_id}
    ).mappings().fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    if str(row.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Anda tidak berhak membatalkan booking ini")
    if row.status not in ("pending", "approved"):
        raise HTTPException(
            status_code=400,
            detail=f"Booking dengan status '{row.status}' tidak dapat dibatalkan"
        )

    db.execute(
        text("UPDATE booking SET status = 'cancelled', updated_at = NOW() WHERE id = :id"),
        {"id": booking_id}
    )
    db.commit()
    return {"id": booking_id, "status": "cancelled"}


# ── Endpoints Mitra ──────────────────────────────────────────────────────────

@router.get("/mitra/semua", summary="Mitra: lihat semua booking untuk kost-nya")
def mitra_bookings(
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Semua booking yang masuk untuk kost-kost milik mitra yang login."""
    pemilik_id = token_data.get("sub")
    rows = db.execute(
        text("""
            SELECT b.*, k.nama AS kost_nama, k.alamat AS kost_alamat,
                   k.foto_urls AS kost_foto, k.harga_per_bulan, k.pemilik_id,
                   u.nama AS user_nama, u.email AS user_email, u.no_telepon AS user_telepon
            FROM booking b
            JOIN kost k ON k.id = b.kost_id
            JOIN users u ON u.id = b.user_id
            WHERE k.pemilik_id = :pid
            ORDER BY b.created_at DESC
        """),
        {"pid": pemilik_id}
    ).mappings().fetchall()

    result = []
    for r in rows:
        d = _format_booking(r)
        d["user_nama"]     = r.user_nama
        d["user_email"]    = r.user_email
        d["user_telepon"]  = r.user_telepon
        result.append(d)

    return {"data": result, "total": len(result)}


@router.patch("/mitra/{booking_id}/approve", summary="Mitra: setujui booking")
def approve_booking(
    booking_id: str,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Mitra menyetujui booking yang masuk (status: pending → approved)."""
    pemilik_id = token_data.get("sub")

    row = db.execute(
        text("""
            SELECT b.id, b.status, k.pemilik_id
            FROM booking b JOIN kost k ON k.id = b.kost_id
            WHERE b.id = :id
        """),
        {"id": booking_id}
    ).mappings().fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    if str(row.pemilik_id) != pemilik_id:
        raise HTTPException(status_code=403, detail="Anda tidak berhak mengelola booking ini")
    if row.status != "pending":
        raise HTTPException(status_code=400, detail="Hanya booking berstatus 'pending' yang bisa disetujui")

    db.execute(
        text("UPDATE booking SET status = 'approved', updated_at = NOW() WHERE id = :id"),
        {"id": booking_id}
    )
    db.commit()
    return {"id": booking_id, "status": "approved"}


@router.patch("/mitra/{booking_id}/reject", summary="Mitra: tolak booking")
def reject_booking(
    booking_id: str,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Mitra menolak booking yang masuk (status: pending → rejected)."""
    pemilik_id = token_data.get("sub")

    row = db.execute(
        text("""
            SELECT b.id, b.status, k.pemilik_id
            FROM booking b JOIN kost k ON k.id = b.kost_id
            WHERE b.id = :id
        """),
        {"id": booking_id}
    ).mappings().fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    if str(row.pemilik_id) != pemilik_id:
        raise HTTPException(status_code=403, detail="Anda tidak berhak mengelola booking ini")
    if row.status != "pending":
        raise HTTPException(status_code=400, detail="Hanya booking berstatus 'pending' yang bisa ditolak")

    db.execute(
        text("UPDATE booking SET status = 'rejected', updated_at = NOW() WHERE id = :id"),
        {"id": booking_id}
    )
    db.commit()
    return {"id": booking_id, "status": "rejected"}


@router.patch("/mitra/{booking_id}/selesai", summary="Mitra: tandai booking selesai")
def complete_booking(
    booking_id: str,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Mitra menandai booking sebagai selesai (approved → selesai)."""
    pemilik_id = token_data.get("sub")

    row = db.execute(
        text("""
            SELECT b.id, b.status, k.pemilik_id
            FROM booking b JOIN kost k ON k.id = b.kost_id
            WHERE b.id = :id
        """),
        {"id": booking_id}
    ).mappings().fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    if str(row.pemilik_id) != pemilik_id:
        raise HTTPException(status_code=403, detail="Anda tidak berhak mengelola booking ini")
    if row.status != "approved":
        raise HTTPException(status_code=400, detail="Hanya booking 'approved' yang bisa diselesaikan")

    db.execute(
        text("UPDATE booking SET status = 'selesai', updated_at = NOW() WHERE id = :id"),
        {"id": booking_id}
    )
    db.commit()
    return {"id": booking_id, "status": "selesai"}
