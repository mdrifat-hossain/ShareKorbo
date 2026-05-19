from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import Date
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql import func

from app.database import Base


class ListingRequest(Base):

    __tablename__ = "listing_requests"

    request_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    listing_id = Column(
        Integer,
        ForeignKey("listings.listing_id")
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    requester_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    status = Column(
        String(50),
        default="pending"
    )

    start_date = Column(Date)

    end_date = Column(Date)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )