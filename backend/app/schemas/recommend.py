from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID


class RecommendRequest(BaseModel):
    """Input preferensi mahasiswa untuk sistem rekomendasi."""
    kampus_id: UUID = Field(..., description="ID kampus sebagai pusat pencarian")
    budget_max: int = Field(..., gt=0, description="Budget maksimum per bulan (Rupiah)")
    jarak_max_km: float = Field(default=2.0, gt=0, le=10, description="Radius maksimum dari kampus (km)")
    fasilitas_diinginkan: List[str] = Field(default_factory=list, description="Daftar fasilitas yang diinginkan")
    tipe_kamar: Optional[str] = Field(None, description="Tipe kamar: single, double, campur, putra, putri")
    jumlah_hasil: int = Field(default=10, ge=1, le=50, description="Jumlah rekomendasi yang dikembalikan")


class KostRekomendasi(BaseModel):
    id: UUID
    nama: str
    harga_per_bulan: int
    jarak_meter: float
    tipe_kamar: Optional[str] = None
    fasilitas: List[str] = []
    foto_urls: List[str] = []
    rating: int = 0
    koordinat: dict
    skor_kecocokan: float = Field(..., ge=0, le=1, description="Skor kecocokan C4.5 (0-1)")
    label_rekomendasi: str = Field(..., description="Sangat Direkomendasikan / Direkomendasikan / Kurang Sesuai")
    alasan: List[str] = Field(default_factory=list, description="Faktor penentu rekomendasi")


class RecommendResponse(BaseModel):
    kampus_id: UUID
    total_kost_dicari: int
    total_rekomendasi: int
    ranked_kost: List[KostRekomendasi]


class PredictPriceRequest(BaseModel):
    """Input data kost untuk prediksi harga."""
    luas_m2: int = Field(..., gt=0, description="Luas kamar dalam m²")
    fasilitas: List[str] = Field(default_factory=list)
    jarak_kampus_meter: float = Field(..., gt=0, description="Jarak ke kampus terdekat dalam meter")
    tipe_kamar: str = Field(default="single")
    kota: Optional[str] = Field(None, description="Kota lokasi kost")


class PredictPriceResponse(BaseModel):
    harga_prediksi: int = Field(..., description="Harga wajar berdasarkan model regresi")
    harga_aktual: Optional[int] = None
    label: str = Field(..., description="Murah / Wajar / Mahal")
    selisih_persen: Optional[float] = None
    confidence: float = Field(..., description="Tingkat keyakinan prediksi (0-1)")
    fitur_berpengaruh: List[dict] = Field(default_factory=list)
