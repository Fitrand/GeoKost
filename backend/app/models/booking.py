import uuid
from sqlalchemy import Column, String, Integer, SmallInteger, Date, Text, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Booking(Base):
    __tablename__ = "booking"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id       = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    kost_id       = Column(UUID(as_uuid=True), ForeignKey("kost.id"), nullable=False)
    status        = Column(String(20), nullable=False, default="pending")
    # Nilai: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'selesai'
    durasi_bulan  = Column(SmallInteger, nullable=False)
    tanggal_masuk = Column(Date, nullable=False)
    total_harga   = Column(Integer, nullable=False)
    catatan       = Column(Text, nullable=True)
    created_at    = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at    = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Booking(id={self.id}, user={self.user_id}, kost={self.kost_id}, status={self.status})>"
