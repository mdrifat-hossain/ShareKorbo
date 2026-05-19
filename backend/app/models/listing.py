from sqlalchemy import Column, Integer, String
from sqlalchemy import Text, DECIMAL, Date
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from app.models.listing_request import ListingRequest

from app.database import Base


class Listing(Base):

    __tablename__ = "listings"

    listing_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    title = Column(String(255))

    description = Column(Text)

    category = Column(String(100))

    item_condition = Column(String(100))

    listing_type = Column(String(50))

    sell_price = Column(DECIMAL(10, 2))

    daily_rate = Column(DECIMAL(10, 2))

    deposit_amount = Column(DECIMAL(10, 2))

    availability_start = Column(Date)

    availability_end = Column(Date)

    location = Column(String(255))

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )