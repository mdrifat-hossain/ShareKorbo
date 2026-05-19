from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy import Text

from app.database import Base


class ListingImage(Base):

    __tablename__ = "listing_images"

    image_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    listing_id = Column(
        Integer,
        ForeignKey("listings.listing_id")
    )

    image_url = Column(Text)