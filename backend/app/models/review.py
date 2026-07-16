import uuid
from sqlalchemy import Column, SmallInteger, Text, TIMESTAMP, func, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Review(Base):
    __tablename__ = "review"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    kost_id    = Column(UUID(as_uuid=True), ForeignKey("kost.id"), nullable=False)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("booking.id"), nullable=True)
    rating     = Column(SmallInteger, nullable=False)  # 1-5
    komentar   = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "kost_id", name="uq_review_user_kost"),
    )

    def __repr__(self):
        return f"<Review(user={self.user_id}, kost={self.kost_id}, rating={self.rating})>"
