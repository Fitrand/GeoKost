from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
import enum


class TipeKamar(str, enum.Enum):
    single = "single"
    double = "double"
    campur = "campur"
    putra = "putra"
    putri = "putri"


class KoordinatSchema(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")


class KostBase(BaseModel):
    nama: str = Field(..., min_length=3, max_length=255)
    deskripsi: Optional[str] = None
    harga_per_bulan: int = Field(..., gt=0, description="Harga dalam Rupiah")
    luas_m2: Optional[int] = Field(None, gt=0)
    tipe_kamar: Optional[TipeKamar] = None
    alamat: Optional[str] = None
    fasilitas: List[str] = Field(default_factory=list)
    foto_urls: List[str] = Field(default_factory=list)


class KostCreate(KostBase):
    koordinat: KoordinatSchema


class KostUpdate(BaseModel):
    nama: Optional[str] = None
    deskripsi: Optional[str] = None
    harga_per_bulan: Optional[int] = None
    luas_m2: Optional[int] = None
    tipe_kamar: Optional[TipeKamar] = None
    alamat: Optional[str] = None
    fasilitas: Optional[List[str]] = None
    foto_urls: Optional[List[str]] = None
    koordinat: Optional[KoordinatSchema] = None
    is_active: Optional[bool] = None


class KostResponse(KostBase):
    id: UUID
    pemilik_id: Optional[UUID] = None
    koordinat: KoordinatSchema
    rating: int = 0
    jumlah_ulasan: int = 0
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KostNearbyResponse(BaseModel):
    id: UUID
    nama: str
    harga_per_bulan: int
    jarak_meter: float
    tipe_kamar: Optional[str] = None
    fasilitas: List[str] = []
    foto_urls: List[str] = []
    rating: int = 0
    koordinat: KoordinatSchema
    alamat: Optional[str] = None
    luas_m2: Optional[int] = None
    prediksi_harga: Optional[dict] = None  # hasil batch AI regression

    model_config = ConfigDict(from_attributes=True)


class KostListResponse(BaseModel):
    data: List[KostNearbyResponse]
    total: int
    radius_km: float


class KostSearchItem(BaseModel):
    id: UUID
    nama: str
    harga_per_bulan: int
    tipe_kamar: Optional[str] = None
    fasilitas: List[str] = []
    foto_urls: List[str] = []
    rating: int = 0
    jumlah_ulasan: int = 0
    koordinat: KoordinatSchema
    alamat: Optional[str] = None
    luas_m2: Optional[int] = None
    jarak_meter: float = 0

    model_config = ConfigDict(from_attributes=True)


class KostSearchListResponse(BaseModel):
    data: List[KostSearchItem]
    total: int
    limit: int
    offset: int
