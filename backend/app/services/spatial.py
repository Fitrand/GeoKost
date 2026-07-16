from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from uuid import UUID
from app.models.kost import Kost



def get_kost_nearby(
    db: Session,
    lat: float,
    lng: float,
    radius_meter: float = 2000,
    harga_max: Optional[int] = None,
    tipe_kamar: Optional[str] = None,
    limit: int = 50,
) -> List[dict]:
    """
    Query kost dalam radius tertentu dari koordinat menggunakan PostGIS ST_DWithin.
    Menggunakan ::geography untuk kalkulasi jarak yang akurat dalam meter.
    """
    where_clauses = [
        "k.is_active = TRUE",
        f"ST_DWithin(k.koordinat::geography, ST_MakePoint(:lng, :lat)::geography, :radius)",
    ]
    params = {"lat": lat, "lng": lng, "radius": radius_meter, "limit": limit}

    if harga_max:
        where_clauses.append("k.harga_per_bulan <= :harga_max")
        params["harga_max"] = harga_max

    if tipe_kamar:
        where_clauses.append("k.tipe_kamar = :tipe_kamar")
        params["tipe_kamar"] = tipe_kamar

    where_sql = " AND ".join(where_clauses)

    sql = text(f"""
        SELECT
            k.id,
            k.nama,
            k.harga_per_bulan,
            k.tipe_kamar,
            k.fasilitas,
            k.foto_urls,
            k.rating,
            k.alamat,
            k.luas_m2,
            ST_Y(k.koordinat::geometry) AS lat,
            ST_X(k.koordinat::geometry) AS lng,
            ST_Distance(k.koordinat::geography, ST_MakePoint(:lng, :lat)::geography) AS jarak_meter
        FROM kost k
        WHERE {where_sql}
        ORDER BY jarak_meter ASC
        LIMIT :limit
    """)

    result = db.execute(sql, params)
    rows = result.mappings().fetchall()

    return [
        {
            "id": row.id,
            "nama": row.nama,
            "harga_per_bulan": row.harga_per_bulan,
            "tipe_kamar": row.tipe_kamar,
            "fasilitas": row.fasilitas or [],
            "foto_urls": row.foto_urls or [],
            "rating": row.rating or 0,
            "alamat": row.alamat,
            "luas_m2": row.luas_m2,
            "koordinat": {"lat": row.lat, "lng": row.lng},
            "jarak_meter": round(row.jarak_meter, 2),
        }
        for row in rows
    ]


def get_kampus_koordinat(db: Session, kampus_id: UUID) -> Optional[dict]:
    """Ambil koordinat kampus berdasarkan ID."""
    sql = text("""
        SELECT id, nama, ST_Y(koordinat::geometry) AS lat, ST_X(koordinat::geometry) AS lng
        FROM kampus
        WHERE id = :kampus_id
    """)
    result = db.execute(sql, {"kampus_id": str(kampus_id)}).mappings().fetchone()
    if not result:
        return None
    return {"id": result.id, "nama": result.nama, "lat": result.lat, "lng": result.lng}


def search_kost(
    db: Session,
    q: Optional[str] = None,
    harga_max: Optional[int] = None,
    harga_min: Optional[int] = None,
    tipe_kamar: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[List[dict], int]:
    """
    Cari semua kost aktif dengan filter opsional (tanpa koordinat).
    Returns (list_of_kost, total_count).
    """
    where_clauses = ["k.is_active = TRUE"]
    params: dict = {"limit": limit, "offset": offset}

    if q:
        where_clauses.append("(k.nama ILIKE :q OR k.alamat ILIKE :q)")
        params["q"] = f"%{q}%"

    if harga_max:
        where_clauses.append("k.harga_per_bulan <= :harga_max")
        params["harga_max"] = harga_max

    if harga_min:
        where_clauses.append("k.harga_per_bulan >= :harga_min")
        params["harga_min"] = harga_min

    if tipe_kamar:
        where_clauses.append("k.tipe_kamar = :tipe_kamar")
        params["tipe_kamar"] = tipe_kamar

    where_sql = " AND ".join(where_clauses)

    count_sql = text(f"SELECT COUNT(*) FROM kost k WHERE {where_sql}")
    total = db.execute(count_sql, params).scalar() or 0

    sql = text(f"""
        SELECT
            k.id,
            k.nama,
            k.harga_per_bulan,
            k.tipe_kamar,
            k.fasilitas,
            k.foto_urls,
            k.rating,
            k.jumlah_ulasan,
            k.alamat,
            k.luas_m2,
            ST_Y(k.koordinat::geometry) AS lat,
            ST_X(k.koordinat::geometry) AS lng
        FROM kost k
        WHERE {where_sql}
        ORDER BY k.rating DESC, k.created_at DESC
        LIMIT :limit OFFSET :offset
    """)

    rows = db.execute(sql, params).mappings().fetchall()

    return [
        {
            "id": row.id,
            "nama": row.nama,
            "harga_per_bulan": row.harga_per_bulan,
            "tipe_kamar": row.tipe_kamar,
            "fasilitas": row.fasilitas or [],
            "foto_urls": row.foto_urls or [],
            "rating": row.rating or 0,
            "jumlah_ulasan": row.jumlah_ulasan or 0,
            "alamat": row.alamat,
            "luas_m2": row.luas_m2,
            "koordinat": {"lat": row.lat, "lng": row.lng},
            "jarak_meter": 0,  # No distance for non-geo search
        }
        for row in rows
    ], int(total)
