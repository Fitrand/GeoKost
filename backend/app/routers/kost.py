from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.services.spatial import get_kost_nearby, search_kost
from app.services.price_service import predict_price_batch
from app.schemas.kost import KostListResponse, KostNearbyResponse, KoordinatSchema, KostSearchListResponse, KostSearchItem

router = APIRouter(prefix="/kost", tags=["Kost"])


@router.get("/{kost_id}/harga-area", summary="Harga rata-rata kost serupa di area ini")
def get_harga_area(kost_id: UUID, db: Session = Depends(get_db)):
    """
    Menghitung rata-rata harga kost dengan tipe kamar sama dalam radius 3km.
    Digunakan untuk 'Analisis Harga Kompetitif' di halaman detail kost.
    """
    # Ambil data kost referensi
    ref = db.execute(
        text("SELECT tipe_kamar, ST_Y(koordinat::geometry) AS lat, ST_X(koordinat::geometry) AS lng FROM kost WHERE id = :id AND is_active = true"),
        {"id": str(kost_id)}
    ).mappings().fetchone()

    if not ref:
        raise HTTPException(status_code=404, detail="Kost tidak ditemukan")

    # Hitung rata-rata harga kost dengan tipe sama dalam radius 3km (kecuali diri sendiri)
    row = db.execute(
        text("""
            SELECT
                COUNT(*) AS total_pembanding,
                COALESCE(AVG(harga_per_bulan), 0) AS harga_rata_rata
            FROM kost
            WHERE id != :id
              AND is_active = true
              AND tipe_kamar = :tipe
              AND ST_DWithin(
                    koordinat::geography,
                    ST_MakePoint(:lng, :lat)::geography,
                    3000
              )
        """),
        {"id": str(kost_id), "tipe": ref["tipe_kamar"], "lat": ref["lat"], "lng": ref["lng"]}
    ).mappings().fetchone()

    return {
        "harga_rata_rata": int(row["harga_rata_rata"]) if row["harga_rata_rata"] else None,
        "total_pembanding": row["total_pembanding"],
        "radius_km": 3,
        "tipe_kamar": ref["tipe_kamar"],
    }




@router.get("/", response_model=KostSearchListResponse, summary="Cari semua kost dengan filter")
def search_all_kost(
    q: Optional[str] = Query(None, description="Cari berdasarkan nama atau alamat"),
    harga_min: Optional[int] = Query(None, description="Harga minimum (Rupiah)"),
    harga_max: Optional[int] = Query(None, description="Harga maksimum (Rupiah)"),
    tipe_kamar: Optional[str] = Query(None, description="Filter tipe kamar"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Tampilkan semua kost aktif dengan filter opsional.
    Digunakan untuk halaman 'Cari Kost' di frontend.
    """
    data, total = search_kost(
        db, q=q, harga_max=harga_max, harga_min=harga_min,
        tipe_kamar=tipe_kamar, limit=limit, offset=offset,
    )

    # Bug fix: **k already contains 'koordinat' as a plain dict.
    # Passing koordinat= again caused: "got multiple values for keyword argument 'koordinat'".
    # Solution: exclude 'koordinat' from **k, then pass it as a typed KoordinatSchema.
    items = []
    for k in data:
        k_without_koordinat = {key: val for key, val in k.items() if key != "koordinat"}
        item = KostSearchItem(
            **k_without_koordinat,
            koordinat=KoordinatSchema(
                lat=k["koordinat"]["lat"],
                lng=k["koordinat"]["lng"],
            ),
        )
        items.append(item)

    return KostSearchListResponse(
        data=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/nearby", response_model=KostListResponse, summary="Cari kost terdekat dari koordinat")
def nearby_kost(
    lat: float = Query(..., description="Latitude pusat pencarian"),
    lng: float = Query(..., description="Longitude pusat pencarian"),
    radius_km: float = Query(default=2.0, ge=0.1, le=10, description="Radius pencarian (km)"),
    harga_max: Optional[int] = Query(None, description="Filter harga maksimum (Rupiah)"),
    tipe_kamar: Optional[str] = Query(None, description="Filter tipe kamar"),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Mencari kost dalam radius tertentu dari koordinat menggunakan PostGIS ST_DWithin.
    Hasil diurutkan berdasarkan jarak terdekat, dilengkapi indikator harga AI (batch prediction).
    """
    radius_meter = radius_km * 1000
    kost_list = get_kost_nearby(db, lat, lng, radius_meter, harga_max, tipe_kamar, limit)

    # ── Batch AI Prediction ──────────────────────────────────────────────────
    # predict_price_batch() memanggil model.predict(X_all) SATU KALI untuk
    # seluruh list sekaligus, bukan looping N kali → performa tetap cepat.
    prediksi_list = predict_price_batch(kost_list)

    return KostListResponse(
        data=[
            KostNearbyResponse(
                **{key: val for key, val in k.items() if key != "koordinat"},
                koordinat=KoordinatSchema(lat=k["koordinat"]["lat"], lng=k["koordinat"]["lng"]),
                prediksi_harga=prediksi,
            )
            for k, prediksi in zip(kost_list, prediksi_list)
        ],
        total=len(kost_list),
        radius_km=radius_km,
    )



@router.get("/by-kampus/{kampus_id}", summary="Cari kost berdasarkan kampus")
def kost_by_kampus(
    kampus_id: UUID,
    radius_km: float = Query(default=2.0),
    harga_max: Optional[int] = Query(None),
    tipe_kamar: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Cari kost di sekitar kampus tertentu.
    Koordinat kampus diambil otomatis dari database.
    """
    from app.services.spatial import get_kampus_koordinat
    kampus = get_kampus_koordinat(db, kampus_id)
    if not kampus:
        raise HTTPException(status_code=404, detail="Kampus tidak ditemukan")

    radius_meter = radius_km * 1000
    kost_list = get_kost_nearby(
        db, kampus["lat"], kampus["lng"],
        radius_meter, harga_max, tipe_kamar
    )

    return {
        "kampus": kampus,
        "radius_km": radius_km,
        "data": kost_list,
        "total": len(kost_list),
    }


@router.get("/{kost_id}", summary="Detail satu kost untuk publik")
def get_kost_public_detail(kost_id: UUID, db: Session = Depends(get_db)):
    """
    Ambil detail satu kost berdasarkan ID untuk publik.
    """
    from sqlalchemy import text
    sql = text("""
        SELECT
            id, pemilik_id, nama, deskripsi, harga_per_bulan,
            luas_m2, luas_panjang, luas_lebar, tipe_kamar, alamat, fasilitas, foto_urls,
            rating, jumlah_ulasan, is_active, created_at, updated_at,
            ST_Y(koordinat::geometry) AS lat,
            ST_X(koordinat::geometry) AS lng
        FROM kost WHERE id = :id AND is_active = true
    """)
    row = db.execute(sql, {"id": str(kost_id)}).mappings().fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Kost tidak ditemukan")
        
    return {
        "id": str(row.id),
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
        "koordinat": {"lat": row.lat, "lng": row.lng},
        "is_active": row.is_active,
    }
