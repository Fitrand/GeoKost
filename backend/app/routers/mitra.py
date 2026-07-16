"""
Router: /api/mitra — CRUD Kost untuk Pemilik (Mitra)
Sekarang dilindungi oleh JWT authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
from uuid import UUID, uuid4

from app.database import get_db
from app.models.kost import Kost
from app.schemas.kost import KostCreate, KostUpdate, KostResponse, KoordinatSchema
from app.services.auth import get_current_user_token

router = APIRouter(prefix="/mitra", tags=["Mitra — Manajemen Kost"])


# ── Helper ──────────────────────────────────────────────────────────────────

def _get_kost_with_coords(db: Session, kost_id: str) -> Optional[dict]:
    """Query satu kost dengan koordinat menggunakan PostGIS."""
    sql = text("""
        SELECT
            id, pemilik_id, nama, deskripsi, harga_per_bulan,
            luas_m2, luas_panjang, luas_lebar, tipe_kamar, alamat, fasilitas, foto_urls,
            rating, jumlah_ulasan, is_active, created_at, updated_at,
            ST_Y(koordinat::geometry) AS lat,
            ST_X(koordinat::geometry) AS lng
        FROM kost WHERE id = :id
    """)
    row = db.execute(sql, {"id": kost_id}).mappings().fetchone()
    if not row:
        return None
    return {
        "id": str(row.id),
        "pemilik_id": str(row.pemilik_id) if row.pemilik_id else None,
        "nama": row.nama,
        "deskripsi": row.deskripsi,
        "harga_per_bulan": row.harga_per_bulan,
        "luas_m2": row.luas_m2,
        "luas_panjang": row.luas_panjang,
        "luas_lebar": row.luas_lebar,
        "tipe_kamar": row.tipe_kamar,
        "alamat": row.alamat,
        "fasilitas": row.fasilitas or [],
        "foto_urls": row.foto_urls or [],
        "rating": row.rating or 0,
        "jumlah_ulasan": row.jumlah_ulasan or 0,
        "is_active": row.is_active,
        "koordinat": {"lat": row.lat, "lng": row.lng},
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


def _get_all_kost_mitra(db: Session, pemilik_id: str) -> List[dict]:
    """Query semua kost per pemilik."""
    sql = text("""
        SELECT
            k.id, k.pemilik_id, k.nama, k.deskripsi, k.harga_per_bulan,
            k.luas_m2, k.luas_panjang, k.luas_lebar, k.tipe_kamar, k.alamat, k.fasilitas, k.foto_urls,
            k.rating, k.jumlah_ulasan, k.is_active, k.created_at, k.updated_at,
            ST_Y(k.koordinat::geometry) AS lat,
            ST_X(k.koordinat::geometry) AS lng
        FROM kost k
        WHERE k.pemilik_id = :pid
        ORDER BY k.created_at DESC
    """)
    rows = db.execute(sql, {"pid": pemilik_id}).mappings().fetchall()
    return [
        {
            "id": str(r.id),
            "pemilik_id": str(r.pemilik_id) if r.pemilik_id else None,
            "nama": r.nama,
            "deskripsi": r.deskripsi,
            "harga_per_bulan": r.harga_per_bulan,
            "luas_m2": r.luas_m2,
            "luas_panjang": r.luas_panjang,
            "luas_lebar": r.luas_lebar,
            "tipe_kamar": r.tipe_kamar,
            "alamat": r.alamat,
            "fasilitas": r.fasilitas or [],
            "foto_urls": r.foto_urls or [],
            "rating": r.rating or 0,
            "jumlah_ulasan": r.jumlah_ulasan or 0,
            "is_active": r.is_active,
            "koordinat": {"lat": r.lat, "lng": r.lng},
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }
        for r in rows
    ]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/kost", summary="Daftar semua kost milik pemilik")
def list_kost_mitra(
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Ambil semua kost milik mitra yang sedang login."""
    pemilik_id = token_data.get("sub")
    data = _get_all_kost_mitra(db, pemilik_id)
    return {"data": data, "total": len(data)}


@router.get("/kost/{kost_id}", summary="Detail satu kost")
def get_kost_detail(
    kost_id: str, 
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db)
):
    kost = _get_kost_with_coords(db, kost_id)
    if not kost:
        raise HTTPException(status_code=404, detail="Kost tidak ditemukan")
    if kost["pemilik_id"] != token_data.get("sub"):
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke kost ini")
    return kost


@router.post("/kost", status_code=status.HTTP_201_CREATED, summary="Tambah kost baru")
def create_kost(
    payload: dict = Body(...),
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Tambah kost baru oleh pemilik (otomatis dari token).
    
    Mendukung:
    - luas_panjang + luas_lebar → luas_m2 dihitung otomatis
    - harga_per_tahun → dikonversi ke harga_per_bulan (dibagi 12)
    """
    try:
        pemilik_id = token_data.get("sub")
        koordinat = payload.get("koordinat", {})
        lat = float(koordinat.get("lat", 0))
        lng = float(koordinat.get("lng", 0))

        # Hitung harga per bulan
        if "harga_per_tahun" in payload and payload["harga_per_tahun"]:
            harga_per_bulan = int(payload["harga_per_tahun"]) // 12
        else:
            harga_per_bulan = int(payload["harga_per_bulan"])

        # Hitung luas
        luas_panjang = payload.get("luas_panjang")
        luas_lebar = payload.get("luas_lebar")
        if luas_panjang and luas_lebar:
            luas_m2 = int(luas_panjang) * int(luas_lebar)
        else:
            luas_m2 = payload.get("luas_m2")

        new_id = uuid4()
        sql = text("""
            INSERT INTO kost (
                id, pemilik_id, nama, deskripsi, harga_per_bulan,
                luas_m2, luas_panjang, luas_lebar, tipe_kamar, alamat, fasilitas, foto_urls,
                koordinat, is_active
            ) VALUES (
                :id, :pemilik_id, :nama, :deskripsi, :harga,
                :luas, :luas_panjang, :luas_lebar, :tipe, :alamat, :fasilitas, :foto_urls,
                ST_MakePoint(:lng, :lat)::geometry, true
            )
        """)
        db.execute(sql, {
            "id": str(new_id),
            "pemilik_id": pemilik_id,
            "nama": payload["nama"],
            "deskripsi": payload.get("deskripsi"),
            "harga": harga_per_bulan,
            "luas": luas_m2,
            "luas_panjang": int(luas_panjang) if luas_panjang else None,
            "luas_lebar": int(luas_lebar) if luas_lebar else None,
            "tipe": payload.get("tipe_kamar", "single"),
            "alamat": payload.get("alamat"),
            "fasilitas": payload.get("fasilitas", []),
            "foto_urls": payload.get("foto_urls", []),
            "lat": lat,
            "lng": lng,
        })
        db.commit()
        return _get_kost_with_coords(db, str(new_id))
    except KeyError as e:
        raise HTTPException(status_code=422, detail=f"Field wajib tidak ada: {e}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/kost/{kost_id}", summary="Update data kost")
def update_kost(
    kost_id: str,
    payload: dict = Body(...),
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """Update satu atau lebih field kost."""
    existing = _get_kost_with_coords(db, kost_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Kost tidak ditemukan")
    if existing["pemilik_id"] != token_data.get("sub"):
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke kost ini")

    try:
        set_parts = []
        params: dict = {"id": kost_id}

        field_map = {
            "nama": "nama", "deskripsi": "deskripsi",
            "harga_per_bulan": "harga_per_bulan", "luas_m2": "luas_m2",
            "tipe_kamar": "tipe_kamar", "alamat": "alamat",
            "fasilitas": "fasilitas", "foto_urls": "foto_urls",
            "is_active": "is_active",
        }
        for key, col in field_map.items():
            if key in payload:
                set_parts.append(f"{col} = :{key}")
                params[key] = payload[key]

        if "koordinat" in payload:
            koordinat = payload["koordinat"]
            set_parts.append("koordinat = ST_MakePoint(:lng, :lat)::geometry")
            params["lat"] = float(koordinat["lat"])
            params["lng"] = float(koordinat["lng"])

        if not set_parts:
            raise HTTPException(status_code=400, detail="Tidak ada field yang diupdate")

        set_parts.append("updated_at = NOW()")
        sql = text(f"UPDATE kost SET {', '.join(set_parts)} WHERE id = :id")
        db.execute(sql, params)
        db.commit()
        return _get_kost_with_coords(db, kost_id)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/kost/{kost_id}", summary="Hapus kost")
def delete_kost(
    kost_id: str, 
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db)
):
    existing = _get_kost_with_coords(db, kost_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Kost tidak ditemukan")
    if existing["pemilik_id"] != token_data.get("sub"):
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke kost ini")
        
    db.execute(text("DELETE FROM kost WHERE id = :id"), {"id": kost_id})
    db.commit()
    return {"message": "Kost berhasil dihapus", "id": kost_id}


@router.patch("/kost/{kost_id}/toggle-status", summary="Toggle aktif/nonaktif kost")
def toggle_status(
    kost_id: str, 
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db)
):
    existing = _get_kost_with_coords(db, kost_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Kost tidak ditemukan")
    if existing["pemilik_id"] != token_data.get("sub"):
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke kost ini")
        
    new_status = not existing["is_active"]
    db.execute(
        text("UPDATE kost SET is_active = :s, updated_at = NOW() WHERE id = :id"),
        {"s": new_status, "id": kost_id}
    )
    db.commit()
    return {"id": kost_id, "is_active": new_status}


@router.get("/stats", summary="Statistik ringkasan untuk mitra")
def mitra_stats(
    token_data: dict = Depends(get_current_user_token),
    db: Session = Depends(get_db),
):
    """KPI: jumlah kost, total rating, total ulasan."""
    pemilik_id = token_data.get("sub")
    sql = text("""
        SELECT
            COUNT(*) AS total_kost,
            COUNT(*) FILTER (WHERE is_active = true) AS kost_aktif,
            COALESCE(AVG(rating), 0) AS avg_rating,
            COALESCE(SUM(jumlah_ulasan), 0) AS total_ulasan,
            COALESCE(SUM(harga_per_bulan), 0) AS total_potensi_pendapatan
        FROM kost WHERE pemilik_id = :pid
    """)
    row = db.execute(sql, {"pid": pemilik_id}).mappings().fetchone()
    return {
        "total_kost": row.total_kost,
        "kost_aktif": row.kost_aktif,
        "avg_rating": round(float(row.avg_rating), 1),
        "total_ulasan": row.total_ulasan,
        "total_potensi_pendapatan": row.total_potensi_pendapatan,
    }

