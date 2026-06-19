from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id = Column(Integer, primary_key=True, autoincrement=True)

    listing_id = Column(Integer, ForeignKey("listings.listing_id"), nullable=False)

    owner_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
