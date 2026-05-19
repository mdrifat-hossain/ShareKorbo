from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routes.auth_routes import router as auth_router

from app.models.user_model import User
from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.models.listing_request import ListingRequest

from app.routes import listing

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(
    listing.router,
    prefix="/listing"
)