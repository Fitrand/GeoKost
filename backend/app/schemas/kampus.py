from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class KampusBase(BaseModel):
    nama: str = Field(..., min_length=3, max_length=255)
    singkatan: Optional[str] = None
    kota: Optional[str] = None
    provinsi: Optional[str] = None
    alamat: Optional[str] = None
    logo_url: Optional[str] = None


class KampusCreate(KampusBase):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class KampusResponse(KampusBase):
    id: UUID
    lat: float
    lng: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KampusListResponse(BaseModel):
    data: List[KampusResponse]
    total: int
