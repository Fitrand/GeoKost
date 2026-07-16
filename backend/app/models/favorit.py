import uuid
from sqlalchemy import Column, TIMESTAMP, func, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Favorit(Base):
    __tablename__ = "favorit"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    kost_id    = Column(UUID(as_uuid=True), ForeignKey("kost.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "kost_id", name="uq_favorit_user_kost"),
    )

    def __repr__(self):
        return f"<Favorit(user={self.user_id}, kost={self.kost_id})>"
