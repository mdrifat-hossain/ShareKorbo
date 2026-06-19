from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.database import Base, engine
from app.routes.auth_routes import router as auth_router

from app.models.user_model import User
from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.models.listing_request import ListingRequest
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.review import Review

from app.routes import listing
from app.routes import inbox as inbox_routes

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/health")
def health():
    return {"ok": True}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")

BACKEND_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(
    listing.router,
    prefix="/listing"
)

app.include_router(
    inbox_routes.router,
    prefix="/inbox"
)
