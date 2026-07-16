from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.recommend import RecommendRequest, RecommendResponse, KostRekomendasi
from app.services.spatial import get_kost_nearby, get_kampus_koordinat
from app.services.ml_service import predict_recommendations

router = APIRouter(prefix="/recommend", tags=["Rekomendasi C4.5"])


@router.post("", response_model=RecommendResponse, summary="Rekomendasi kost dengan algoritma C4.5")
def get_recommendations(
    request: RecommendRequest,
    db: Session = Depends(get_db),
):
    """
    Sistem rekomendasi kost menggunakan Decision Tree C4.5.
    
    Alur:
    1. Ambil koordinat kampus dari database
    2. Query kost nearby menggunakan PostGIS
    3. Filter berdasarkan budget & preferensi dasar
    4. Jalankan model C4.5 untuk scoring & ranking
    5. Kembalikan daftar kost yang sudah diurutkan berdasarkan skor
    """
    # Step 1: Dapatkan koordinat kampus
    kampus = get_kampus_koordinat(db, request.kampus_id)
    if not kampus:
        raise HTTPException(status_code=404, detail="Kampus tidak ditemukan")

    # Step 2: Query kost dalam radius dari kampus
    radius_meter = request.jarak_max_km * 1000
    kost_kandidat = get_kost_nearby(
        db=db,
        lat=kampus["lat"],
        lng=kampus["lng"],
        radius_meter=radius_meter,
        harga_max=request.budget_max,
        tipe_kamar=request.tipe_kamar,
        limit=200,  # Ambil lebih banyak, nanti di-filter oleh C4.5
    )

    if not kost_kandidat:
        return RecommendResponse(
            kampus_id=request.kampus_id,
            total_kost_dicari=0,
            total_rekomendasi=0,
            ranked_kost=[],
        )

    # Step 3: Jalankan model C4.5 + scoring
    preferensi = request.model_dump()
    ranked = predict_recommendations(kost_kandidat, preferensi)

    # Step 4: Filter hanya yang relevan dan batasi jumlah
    filtered = [k for k in ranked if k["label_rekomendasi"] != "Kurang Sesuai"]
    if not filtered:
        filtered = ranked  # Tampilkan semua jika tidak ada yang lolos filter

    top_results = filtered[: request.jumlah_hasil]

    return RecommendResponse(
        kampus_id=request.kampus_id,
        total_kost_dicari=len(kost_kandidat),
        total_rekomendasi=len(top_results),
        ranked_kost=[
            KostRekomendasi(**k) for k in top_results
        ],
    )
