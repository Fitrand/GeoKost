from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/kampus", tags=["Kampus"])


@router.get("", summary="Daftar semua kampus")
def list_kampus(db: Session = Depends(get_db)):
    sql = text("""
        SELECT id, nama, singkatan, kota, provinsi, alamat, logo_url,
               ST_Y(koordinat::geometry) AS lat,
               ST_X(koordinat::geometry) AS lng
        FROM kampus
        ORDER BY nama ASC
    """)
    rows = db.execute(sql).mappings().fetchall()
    return {
        "data": [
            {
                "id": str(r.id), "nama": r.nama, "singkatan": r.singkatan,
                "kota": r.kota, "provinsi": r.provinsi, "alamat": r.alamat,
                "logo_url": r.logo_url, "koordinat": {"lat": r.lat, "lng": r.lng},
            }
            for r in rows
        ],
        "total": len(rows),
    }


@router.get("/{kampus_id}", summary="Detail kampus berdasarkan ID")
def get_kampus(kampus_id: str, db: Session = Depends(get_db)):
    sql = text("""
        SELECT id, nama, singkatan, kota, provinsi, alamat, logo_url,
               ST_Y(koordinat::geometry) AS lat,
               ST_X(koordinat::geometry) AS lng
        FROM kampus WHERE id = :id
    """)
    row = db.execute(sql, {"id": kampus_id}).mappings().fetchone()
    if not row:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Kampus tidak ditemukan")
    return {
        "id": str(row.id), "nama": row.nama, "singkatan": row.singkatan,
        "kota": row.kota, "provinsi": row.provinsi,
        "koordinat": {"lat": row.lat, "lng": row.lng},
    }
