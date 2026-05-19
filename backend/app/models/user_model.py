from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from app.database import Base
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    university = Column(String(255))
    student_id = Column(String(100), unique=True)

    email = Column(String(255), unique=True)
    password = Column(String(255))

    student_id_image = Column(String(500))

    verification_status = Column(
        Enum("pending", "approved", "rejected"),
        default="pending"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )