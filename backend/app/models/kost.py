import uuid
from sqlalchemy import Column, String, Integer, Boolean, Text, ARRAY, TIMESTAMP, func, SmallInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.database import Base


class Kost(Base):
    __tablename__ = "kost"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pemilik_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # FK ke users.id
    nama = Column(String(255), nullable=False)
    deskripsi = Column(Text, nullable=True)
    harga_per_bulan = Column(Integer, nullable=False)  # selalu disimpan per bulan
    luas_m2 = Column(SmallInteger, nullable=True)       # luas_panjang * luas_lebar
    luas_panjang = Column(SmallInteger, nullable=True)  # dimensi panjang (m)
    luas_lebar = Column(SmallInteger, nullable=True)    # dimensi lebar (m)
    tipe_kamar = Column(String(50), nullable=True)  # single, double, campur, putra, putri
    koordinat = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    alamat = Column(Text, nullable=True)
    fasilitas = Column(ARRAY(Text), nullable=True, default=[])
    foto_urls = Column(ARRAY(Text), nullable=True, default=[])
    rating = Column(Integer, nullable=True, default=0)
    jumlah_ulasan = Column(Integer, nullable=True, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Kost(id={self.id}, nama={self.nama}, harga={self.harga_per_bulan})>"
