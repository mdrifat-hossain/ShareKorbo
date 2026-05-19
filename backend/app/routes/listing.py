from fastapi import APIRouter
from fastapi import Form
from fastapi import UploadFile
from fastapi import File

from app.database import SessionLocal

from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.models.user_model import User
from app.models.listing_request import ListingRequest

from datetime import datetime

import os
import shutil


router = APIRouter()


UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/create")
async def create_listing(

    user_id: int = Form(...),

    title: str = Form(...),

    description: str = Form(...),

    category: str = Form(...),

    item_condition: str = Form(...),

    listing_type: str = Form(...),

    sell_price: str = Form(None),

    daily_rate: str = Form(None),

    deposit_amount: str = Form(None),

    availability_start: str = Form(None),

    availability_end: str = Form(None),

    location: str = Form(...),

    images: list[UploadFile] = File(...)

):

    db = SessionLocal()

    try:

        listing = Listing(

            user_id=user_id,

            title=title,

            description=description,

            category=category,

            item_condition=item_condition,

            listing_type=listing_type,

            sell_price=sell_price or None,

            daily_rate=daily_rate or None,

            deposit_amount=deposit_amount or None,

            availability_start=(
                datetime.strptime(
                    availability_start,
                    "%Y-%m-%d"
                ).date()
                if availability_start
                else None
            ),

            availability_end=(
                datetime.strptime(
                    availability_end,
                    "%Y-%m-%d"
                ).date()
                if availability_end
                else None
            ),

            location=location
        )

        db.add(listing)

        db.commit()

        db.refresh(listing)

        # SAVE IMAGES
        for image in images:

            file_path = (
                f"{UPLOAD_DIR}/"
                f"{image.filename}"
            )

            with open(file_path, "wb") as buffer:

                shutil.copyfileobj(
                    image.file,
                    buffer
                )

            listing_image = ListingImage(

                listing_id=listing.listing_id,

                image_url=file_path
            )

            db.add(listing_image)

        db.commit()

        return {
            "message": "Listing created"
        }

    finally:

        db.close()

@router.get("/all")
async def get_all_listings():
    db = SessionLocal()
    try:
        listings = db.query(Listing).order_by(Listing.created_at.desc()).all()
        result = []
        for l in listings:
            # get user
            user = db.query(User).filter(User.user_id == l.user_id).first()
            # get first image
            image = db.query(ListingImage).filter(ListingImage.listing_id == l.listing_id).first()
            
            # format price/rate depending on type
            price_str = ""
            if l.listing_type == "rent":
                price_str = f"৳{l.daily_rate}/day" if l.daily_rate else "N/A"
            elif l.listing_type == "sell":
                price_str = f"৳{l.sell_price}" if l.sell_price else "N/A"
            elif l.listing_type == "borrow":
                price_str = "Free"
            else:
                price_str = "Exchange"
            
            # construct owner info
            owner_name = "Unknown"
            initials = "??"
            if user:
                if user.student_id:
                    owner_name = user.student_id
                elif user.email:
                    owner_name = user.email.split("@")[0]
                
                initials = owner_name[:2].upper()
                
            result.append({
                "id": str(l.listing_id),
                "title": l.title,
                "image": f"/{image.image_url}" if image else None,
                "type": l.listing_type,
                "price": price_str,
                "rating": "5.0", # default for now
                "description": l.description,
                "owner": {
                    "name": owner_name,
                    "avatar": None,
                    "initials": initials,
                    "avatarColor": "bg-primary-container text-white"
                }
            })
            
        return result
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()

@router.get("/{listing_id}")
async def get_listing(listing_id: int):
    db = SessionLocal()
    try:
        l = db.query(Listing).filter(Listing.listing_id == listing_id).first()
        if not l:
            return {"error": "Listing not found"}
            
        user = db.query(User).filter(User.user_id == l.user_id).first()
        image = db.query(ListingImage).filter(ListingImage.listing_id == l.listing_id).first()
        
        price_str = ""
        rate_type = "Daily Rate"
        if l.listing_type == "rent":
            price_str = f"৳{l.daily_rate}" if l.daily_rate else "N/A"
            rate_type = "Daily Rate"
        elif l.listing_type == "sell":
            price_str = f"৳{l.sell_price}" if l.sell_price else "N/A"
            rate_type = "Sell Price"
        elif l.listing_type == "borrow":
            price_str = "Free"
            rate_type = "Cost"
        else:
            price_str = "Exchange"
            rate_type = "Cost"
            
        owner_name = "Unknown"
        initials = "??"
        if user:
            if user.student_id:
                owner_name = user.student_id
            elif user.email:
                owner_name = user.email.split("@")[0]
            initials = owner_name[:2].upper()
            
        return {
            "id": str(l.listing_id),
            "title": l.title,
            "image": f"/{image.image_url}" if image else None,
            "type": l.listing_type,
            "price": price_str,
            "rate_type": rate_type,
            "security_dep": f"৳{l.deposit_amount}" if l.deposit_amount else "None",
            "category": l.category,
            "condition": l.item_condition,
            "description": l.description,
            "location": l.location,
            "owner_id": l.user_id,

            "availability_start": str(l.availability_start) if l.availability_start else None,

            "availability_end": str(l.availability_end) if l.availability_end else None,

            "availability_status": "Available",

            "rating": "5.0",

            "owner": {
                "name": owner_name,
                "avatar": None,
                "initials": initials,
                "avatarColor": "bg-primary-container text-white"
            }
        }
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()
        

@router.post("/send-request")
async def send_request(data: dict):

    db = SessionLocal()

    try:

        existing = db.query(
            ListingRequest
        ).filter(
            ListingRequest.listing_id
            == data["listing_id"],

            ListingRequest.requester_id
            == data["requester_id"]
        ).first()

        if existing:

            return {
                "error":
                "Request already sent"
            }

        request = ListingRequest(

            listing_id=data["listing_id"],

            owner_id=data["owner_id"],

            requester_id=data["requester_id"],

            start_date=data.get("start_date"),

            end_date=data.get("end_date")
        )

        db.add(request)

        db.commit()

        return {
            "message":
            "Request sent successfully"
        }

    finally:

        db.close()

@router.get("/check-request/{listing_id}/{requester_id}")
async def check_request(listing_id: int, requester_id: int):
    db = SessionLocal()
    try:
        existing = db.query(ListingRequest).filter(
            ListingRequest.listing_id == listing_id,
            ListingRequest.requester_id == requester_id
        ).first()
        return {"has_requested": existing is not None}
    finally:
        db.close()

@router.delete("/cancel-request/{listing_id}/{requester_id}")
async def cancel_request(listing_id: int, requester_id: int):
    db = SessionLocal()
    try:
        existing = db.query(ListingRequest).filter(
            ListingRequest.listing_id == listing_id,
            ListingRequest.requester_id == requester_id
        ).first()
        if existing:
            db.delete(existing)
            db.commit()
            return {"message": "Request cancelled successfully"}
        return {"error": "Request not found"}
    finally:
        db.close()