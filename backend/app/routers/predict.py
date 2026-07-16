from fastapi import APIRouter
from app.schemas.recommend import PredictPriceRequest, PredictPriceResponse
from app.services.price_service import predict_price

router = APIRouter(prefix="/predict", tags=["Prediksi Harga"])


@router.post("/price", response_model=PredictPriceResponse, summary="Prediksi kewajaran harga kost")
def predict_kost_price(request: PredictPriceRequest):
    """
    Memprediksi apakah harga kost tergolong Murah, Wajar, atau Mahal
    berdasarkan model regresi yang mempertimbangkan:
    - Luas kamar
    - Fasilitas yang tersedia
    - Jarak ke kampus terdekat
    - Tipe kamar
    """
    result = predict_price(
        luas_m2=request.luas_m2,
        fasilitas=request.fasilitas,
        jarak_kampus_meter=request.jarak_kampus_meter,
        tipe_kamar=request.tipe_kamar,
        harga_aktual=None,
    )

    return PredictPriceResponse(**result)
