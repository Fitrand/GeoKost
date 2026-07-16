import uuid
from sqlalchemy import Column, String, Integer, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.database import Base


class Kampus(Base):
    __tablename__ = "kampus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nama = Column(String(255), nullable=False)
    singkatan = Column(String(20), nullable=True)  # UB, UM, UIN, POLINEMA, dsb.
    kota = Column(String(100), nullable=True)
    provinsi = Column(String(100), nullable=True)
    alamat = Column(Text, nullable=True)
    koordinat = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    logo_url = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Kampus(id={self.id}, nama={self.nama})>"
