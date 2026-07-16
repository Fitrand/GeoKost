import uuid
from sqlalchemy import Column, String, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nama          = Column(String(255), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role          = Column(String(50), default="mahasiswa")  # 'mahasiswa' atau 'mitra'
    no_telepon    = Column(String(20), nullable=True)
    kampus        = Column(String(255), nullable=True)
    prodi         = Column(String(255), nullable=True)
    angkatan      = Column(String(10), nullable=True)
    created_at    = Column(TIMESTAMP(timezone=True), server_default=func.now())
