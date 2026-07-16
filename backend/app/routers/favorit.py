"""
Router: /api/favorit — Simpan & Hapus Kost Favorit
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from uuid import uuid4

from app.database import get_db
from app.services.auth import get_current_user_token

router = APIRouter(prefix="/favorit", tags=["Favorit"])


def _format_favorit(row) -> dict:
    return {
        "favorit_id":    str(row.favorit_id),
        "kost_id":       str(row.kost_id),
        "nama":          row.nama,
        "alamat":        row.alamat,
        "harga_per_bulan": row.harga_per_bulan,
        "tipe_kamar":    row.tipe_kamar,
        "fasilitas":     row.fasilitas or [],
        "foto_urls":     row.foto_urls or [],
        "rating":        row.rating or 0,
        "jumlah_ulasan": row.jumlah_ulasan or 0,
        "koordinat":     {"lat": row.lat, "lng": row.lng},
        "saved_at":      row.saved_at.isoformat() if row.saved_at else None,
    }


@router.get("", summary="Daftar kost favorit user login")
def get_my_favorit(
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Ambil semua kost yang difavoritkan oleh user yang sedang login."""
    user_id = token_data.get("sub")
    rows = db.execute(
        text("""
            SELECT f.id AS favorit_id, f.created_at AS saved_at,
                   k.id AS kost_id, k.nama, k.alamat, k.harga_per_bulan,
                   k.tipe_kamar, k.fasilitas, k.foto_urls, k.rating, k.jumlah_ulasan,
                   ST_Y(k.koordinat::geometry) AS lat,
                   ST_X(k.koordinat::geometry) AS lng
            FROM favorit f
            JOIN kost k ON k.id = f.kost_id
            WHERE f.user_id = :uid
            ORDER BY f.created_at DESC
        """),
        {"uid": user_id}
    ).mappings().fetchall()

    return {"data": [_format_favorit(r) for r in rows], "total": len(rows)}


@router.get("/ids", summary="Ambil semua kost_id yang difavoritkan user login")
def get_my_favorit_ids(
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Digunakan frontend untuk highlight tombol favorit di card kost."""
    user_id = token_data.get("sub")
    rows = db.execute(
        text("SELECT kost_id FROM favorit WHERE user_id = :uid"),
        {"uid": user_id}
    ).fetchall()
    return {"ids": [str(r[0]) for r in rows]}


@router.get("/{kost_id}/check", summary="Cek apakah kost sudah difavoritkan")
def check_favorit(
    kost_id: str,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    user_id = token_data.get("sub")
    row = db.execute(
        text("SELECT id FROM favorit WHERE user_id = :uid AND kost_id = :kid"),
        {"uid": user_id, "kid": kost_id}
    ).fetchone()
    return {"is_favorit": row is not None}


@router.post("/{kost_id}", summary="Toggle favorit (add/remove)")
def toggle_favorit(
    kost_id: str,
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """
    Jika kost belum difavoritkan → tambahkan.
    Jika kost sudah difavoritkan → hapus (toggle).
    """
    user_id = token_data.get("sub")

    # Cek apakah kost ada
    kost = db.execute(
        text("SELECT id FROM kost WHERE id = :id"),
        {"id": kost_id}
    ).fetchone()
    if not kost:
        raise HTTPException(status_code=404, detail="Kost tidak ditemukan")

    # Cek existing favorit
    existing = db.execute(
        text("SELECT id FROM favorit WHERE user_id = :uid AND kost_id = :kid"),
        {"uid": user_id, "kid": kost_id}
    ).fetchone()

    if existing:
        # Hapus
        db.execute(
            text("DELETE FROM favorit WHERE user_id = :uid AND kost_id = :kid"),
            {"uid": user_id, "kid": kost_id}
        )
        db.commit()
        return {"action": "removed", "is_favorit": False, "kost_id": kost_id}
    else:
        # Tambah
        db.execute(
            text("INSERT INTO favorit (id, user_id, kost_id) VALUES (:id, :uid, :kid)"),
            {"id": str(uuid4()), "uid": user_id, "kid": kost_id}
        )
        db.commit()
        return {"action": "added", "is_favorit": True, "kost_id": kost_id}
