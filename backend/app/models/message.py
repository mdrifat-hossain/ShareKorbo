from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, autoincrement=True)

    conversation_id = Column(
        Integer, ForeignKey("conversations.conversation_id"), nullable=False
    )

    sender_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    message_text = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
