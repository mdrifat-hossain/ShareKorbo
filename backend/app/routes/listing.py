from fastapi import APIRouter
from fastapi import Form
from fastapi import UploadFile
from fastapi import File

from app.database import SessionLocal

from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.models.user_model import User
from app.models.listing_request import ListingRequest
from app.models.review import Review
from app.models.conversation import Conversation
from app.models.message import Message

from datetime import datetime
import uuid

import shutil
from pathlib import Path


router = APIRouter()


BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_DIR / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/create")
def create_listing(

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

            filename = f"{uuid.uuid4()}_{image.filename or 'listing.jpg'}"
            file_path = UPLOAD_DIR / filename
            image_url = f"uploads/{filename}"

            with open(file_path, "wb") as buffer:

                shutil.copyfileobj(
                    image.file,
                    buffer
                )

            listing_image = ListingImage(

                listing_id=listing.listing_id,

                image_url=image_url
            )

            db.add(listing_image)

        db.commit()

        return {
            "message": "Listing created"
        }

    finally:

        db.close()

@router.get("/all")
def get_all_listings():
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


@router.get("/user/{user_id}/posts")
def get_user_posts(user_id: int):
    db = SessionLocal()
    try:
        listings = (
            db.query(Listing)
            .filter(Listing.user_id == user_id)
            .order_by(Listing.created_at.desc())
            .all()
        )

        result = []
        for listing in listings:
            image = (
                db.query(ListingImage)
                .filter(ListingImage.listing_id == listing.listing_id)
                .first()
            )
            request_count = (
                db.query(ListingRequest)
                .filter(ListingRequest.listing_id == listing.listing_id)
                .count()
            )

            price = None
            if listing.listing_type == "rent":
                price = f"৳{listing.daily_rate}/day" if listing.daily_rate else "N/A"
            elif listing.listing_type == "sell":
                price = f"৳{listing.sell_price}" if listing.sell_price else "N/A"
            elif listing.listing_type == "borrow":
                price = "Free"
            elif listing.listing_type == "exchange":
                price = "Exchange"

            result.append({
                "id": listing.listing_id,
                "title": listing.title,
                "image": f"/{image.image_url}" if image else None,
                "type": listing.listing_type,
                "price": price,
                "category": listing.category,
                "condition": listing.item_condition,
                "request_count": request_count,
                "created_at": listing.created_at.isoformat() if listing.created_at else None,
            })

        return {
            "count": len(result),
            "posts": result,
        }
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.delete("/user/{user_id}/posts/{listing_id}")
def delete_user_post(user_id: int, listing_id: int):
    db = SessionLocal()
    try:
        listing = (
            db.query(Listing)
            .filter(Listing.listing_id == listing_id, Listing.user_id == user_id)
            .first()
        )
        if not listing:
            return {"error": "Listing not found or you are not allowed to delete it"}

        requests = (
            db.query(ListingRequest)
            .filter(ListingRequest.listing_id == listing_id)
            .all()
        )
        request_ids = [request.request_id for request in requests]
        if request_ids:
            db.query(Review).filter(Review.request_id.in_(request_ids)).delete(
                synchronize_session=False
            )
            db.query(ListingRequest).filter(
                ListingRequest.request_id.in_(request_ids)
            ).delete(synchronize_session=False)

        conversations = (
            db.query(Conversation)
            .filter(Conversation.listing_id == listing_id)
            .all()
        )
        conversation_ids = [conv.conversation_id for conv in conversations]
        if conversation_ids:
            db.query(Message).filter(
                Message.conversation_id.in_(conversation_ids)
            ).delete(synchronize_session=False)
            db.query(Conversation).filter(
                Conversation.conversation_id.in_(conversation_ids)
            ).delete(synchronize_session=False)

        images = (
            db.query(ListingImage)
            .filter(ListingImage.listing_id == listing_id)
            .all()
        )
        for image in images:
            if image.image_url:
                image_path = BACKEND_DIR / image.image_url
                try:
                    if image_path.is_file():
                        image_path.unlink()
                except OSError as file_error:
                    print(file_error)
            db.delete(image)

        db.delete(listing)
        db.commit()

        return {"message": "Listing deleted successfully"}
    except Exception as e:
        db.rollback()
        print(e)
        return {"error": str(e)}
    finally:
        db.close()

@router.get("/{listing_id}")
def get_listing(listing_id: int):
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
def send_request(data: dict):

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
def check_request(listing_id: int, requester_id: int):
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
def cancel_request(listing_id: int, requester_id: int):
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


@router.get("/requests-received/{user_id}")
def get_requests_received(user_id: int):
    db = SessionLocal()
    try:
        requests = db.query(ListingRequest).filter(ListingRequest.owner_id == user_id).order_by(ListingRequest.created_at.desc()).all()
        result = []
        for r in requests:
            listing = db.query(Listing).filter(Listing.listing_id == r.listing_id).first()
            requester = db.query(User).filter(User.user_id == r.requester_id).first()
            image = db.query(ListingImage).filter(ListingImage.listing_id == r.listing_id).first()
            
            req_name = "Unknown User"
            if requester:
                if requester.student_id:
                    req_name = requester.student_id
                elif requester.email:
                    req_name = requester.email.split("@")[0]
            
            # Fetch reviews for this request
            reviews = db.query(Review).filter(Review.request_id == r.request_id).all()
            reviews_list = []
            for rev in reviews:
                reviews_list.append({
                    "review_id": rev.review_id,
                    "request_id": rev.request_id,
                    "reviewer_id": rev.reviewer_id,
                    "reviewee_id": rev.reviewee_id,
                    "rating": rev.rating,
                    "message": rev.message,
                    "created_at": rev.created_at.isoformat() if rev.created_at else None
                })
            
            result.append({
                "request_id": r.request_id,
                "listing_id": r.listing_id,
                "title": listing.title if listing else "Unknown Product",
                "image": f"/{image.image_url}" if (listing and image) else None,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "requester_id": r.requester_id,
                "requester_name": req_name,
                "start_date": str(r.start_date) if r.start_date else None,
                "end_date": str(r.end_date) if r.end_date else None,
                "reviews": reviews_list,
            })
        return result
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.get("/requests-sent/{user_id}")
def get_requests_sent(user_id: int):
    db = SessionLocal()
    try:
        requests = db.query(ListingRequest).filter(ListingRequest.requester_id == user_id).order_by(ListingRequest.created_at.desc()).all()
        result = []
        for r in requests:
            listing = db.query(Listing).filter(Listing.listing_id == r.listing_id).first()
            owner = db.query(User).filter(User.user_id == r.owner_id).first() if listing else None
            image = db.query(ListingImage).filter(ListingImage.listing_id == r.listing_id).first()
            
            owner_name = "Unknown Owner"
            if owner:
                if owner.student_id:
                    owner_name = owner.student_id
                elif owner.email:
                    owner_name = owner.email.split("@")[0]
            
            # Fetch reviews for this request
            reviews = db.query(Review).filter(Review.request_id == r.request_id).all()
            reviews_list = []
            for rev in reviews:
                reviews_list.append({
                    "review_id": rev.review_id,
                    "request_id": rev.request_id,
                    "reviewer_id": rev.reviewer_id,
                    "reviewee_id": rev.reviewee_id,
                    "rating": rev.rating,
                    "message": rev.message,
                    "created_at": rev.created_at.isoformat() if rev.created_at else None
                })
            
            result.append({
                "request_id": r.request_id,
                "listing_id": r.listing_id,
                "title": listing.title if listing else "Unknown Product",
                "image": f"/{image.image_url}" if (listing and image) else None,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "owner_id": r.owner_id,
                "owner_name": owner_name,
                "start_date": str(r.start_date) if r.start_date else None,
                "end_date": str(r.end_date) if r.end_date else None,
                "reviews": reviews_list,
            })
        return result
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.post("/approve-request/{request_id}")
def approve_request(request_id: int):
    db = SessionLocal()
    try:
        req = db.query(ListingRequest).filter(ListingRequest.request_id == request_id).first()
        if not req:
            return {"error": "Request not found"}
        req.status = "approved"
        db.commit()
        return {"message": "Request approved successfully"}
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.post("/reject-request/{request_id}")
def reject_request(request_id: int):
    db = SessionLocal()
    try:
        req = db.query(ListingRequest).filter(ListingRequest.request_id == request_id).first()
        if not req:
            return {"error": "Request not found"}
        req.status = "rejected"
        db.commit()
        return {"message": "Request rejected successfully"}
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.delete("/cancel-request-by-id/{request_id}")
def cancel_request_by_id(request_id: int):
    db = SessionLocal()
    try:
        req = db.query(ListingRequest).filter(ListingRequest.request_id == request_id).first()
        if req:
            db.delete(req)
            db.commit()
            return {"message": "Request cancelled successfully"}
        return {"error": "Request not found"}
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────────────────────
# QR CODE EXCHANGE VERIFICATION ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/generate-exchange-qr/{request_id}")
def generate_exchange_qr(request_id: int):
    """
    Called by the OWNER when tapping 'Verify Exchange'.
    Generates a one-time UUID token stored in exchange_token.
    Returns the token so the frontend can render a QR code.
    The QR payload will be: {"token": "<uuid>", "requester_id": <id>, "type": "exchange"}
    """
    db = SessionLocal()
    try:
        req = db.query(ListingRequest).filter(ListingRequest.request_id == request_id).first()
        if not req:
            return {"error": "Request not found"}
        if req.status != "approved":
            return {"error": "Request must be in approved state to generate exchange QR"}

        token = str(uuid.uuid4())
        req.exchange_token = token
        db.commit()

        return {
            "token": token,
            "requester_id": req.requester_id,
            "request_id": request_id,
            "type": "exchange"
        }
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.post("/verify-exchange-qr")
def verify_exchange_qr(data: dict):
    """
    Called by the CLIENT (requester) after scanning the owner's exchange QR.
    Validates: token matches AND scanner_id == requester_id (only the right client can confirm).
    On success: status -> 'exchanged', token cleared.
    Body: { "token": "<uuid>", "requester_id": <id>, "request_id": <id>, "scanner_id": <id> }
    """
    db = SessionLocal()
    try:
        token = data.get("token")
        requester_id = data.get("requester_id")
        scanner_id = data.get("scanner_id")
        request_id = data.get("request_id")

        if not all([token, requester_id, scanner_id, request_id]):
            return {"error": "Missing required fields"}

        # Security: only the intended requester can scan this QR
        if str(scanner_id) != str(requester_id):
            return {"error": "This QR code is not valid for your account"}

        req = db.query(ListingRequest).filter(
            ListingRequest.request_id == request_id,
            ListingRequest.exchange_token == token,
            ListingRequest.requester_id == int(requester_id)
        ).first()

        if not req:
            return {"error": "Invalid or expired QR code"}

        req.status = "exchanged"
        req.exchange_token = None  # one-time use: clear after scan
        req.exchanged_at = datetime.utcnow()
        db.commit()

        return {"message": "Exchange verified successfully!", "status": "exchanged"}
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.post("/generate-return-qr/{request_id}")
def generate_return_qr(request_id: int):
    """
    Called by the CLIENT when tapping 'Generate Return QR'.
    Generates a one-time UUID return_token, sets status -> 'return_pending'.
    Returns the token so the frontend can render a QR code.
    The QR payload will be: {"token": "<uuid>", "owner_id": <id>, "type": "return"}
    """
    db = SessionLocal()
    try:
        req = db.query(ListingRequest).filter(ListingRequest.request_id == request_id).first()
        if not req:
            return {"error": "Request not found"}
        if req.status != "exchanged":
            return {"error": "Item must be in exchanged state to generate return QR"}

        token = str(uuid.uuid4())
        req.return_token = token
        req.status = "return_pending"
        db.commit()

        return {
            "token": token,
            "owner_id": req.owner_id,
            "request_id": request_id,
            "type": "return"
        }
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.post("/verify-return-qr")
def verify_return_qr(data: dict):
    """
    Called by the OWNER after scanning the client's return QR.
    Validates: token matches AND scanner_id == owner_id (only the right owner can confirm).
    On success: status -> 'returned', token cleared.
    Body: { "token": "<uuid>", "owner_id": <id>, "request_id": <id>, "scanner_id": <id> }
    """
    db = SessionLocal()
    try:
        token = data.get("token")
        owner_id = data.get("owner_id")
        scanner_id = data.get("scanner_id")
        request_id = data.get("request_id")

        if not all([token, owner_id, scanner_id, request_id]):
            return {"error": "Missing required fields"}

        # Security: only the intended owner can scan this return QR
        if str(scanner_id) != str(owner_id):
            return {"error": "This QR code is not valid for your account"}

        req = db.query(ListingRequest).filter(
            ListingRequest.request_id == request_id,
            ListingRequest.return_token == token,
            ListingRequest.owner_id == int(owner_id)
        ).first()

        if not req:
            return {"error": "Invalid or expired QR code"}

        req.status = "returned"
        req.return_token = None  # one-time use: clear after scan
        req.returned_at = datetime.utcnow()
        db.commit()

        return {"message": "Return verified successfully!", "status": "returned"}
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.get("/request-detail/{request_id}")
def get_request_detail(request_id: int):
    """
    Lightweight endpoint to fetch a single request's current status + tokens.
    Used by frontend after QR scan to refresh state.
    """
    db = SessionLocal()
    try:
        req = db.query(ListingRequest).filter(ListingRequest.request_id == request_id).first()
        if not req:
            return {"error": "Request not found"}
        return {
            "request_id": req.request_id,
            "status": req.status,
            "exchange_token": req.exchange_token,
            "return_token": req.return_token,
            "exchanged_at": req.exchanged_at.isoformat() if req.exchanged_at else None,
            "returned_at": req.returned_at.isoformat() if req.returned_at else None,
        }
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.post("/reviews")
def create_or_update_review(data: dict):
    db = SessionLocal()
    try:
        request_id = data.get("request_id")
        reviewer_id = data.get("reviewer_id")
        rating = data.get("rating")
        message = data.get("message")

        if not all([request_id, reviewer_id, rating]):
            return {"error": "Missing required fields"}

        # Find listing request
        req = db.query(ListingRequest).filter(ListingRequest.request_id == request_id).first()
        if not req:
            return {"error": "Listing request not found"}

        if req.status != "returned":
            return {"error": "Exchange must be fully complete and returned to submit reviews."}

        # Check if reviewer is part of request
        if int(reviewer_id) != req.owner_id and int(reviewer_id) != req.requester_id:
            return {"error": "You are not authorized to review this transaction."}

        # Determine reviewee_id
        reviewee_id = req.requester_id if int(reviewer_id) == req.owner_id else req.owner_id

        # Check if review already exists
        existing_review = db.query(Review).filter(
            Review.request_id == request_id,
            Review.reviewer_id == int(reviewer_id)
        ).first()

        if existing_review:
            existing_review.rating = rating
            existing_review.message = message
            db.commit()
            return {"message": "Review updated successfully", "review_id": existing_review.review_id}
        else:
            new_review = Review(
                request_id=request_id,
                reviewer_id=int(reviewer_id),
                reviewee_id=reviewee_id,
                rating=rating,
                message=message
            )
            db.add(new_review)
            db.commit()
            db.refresh(new_review)
            return {"message": "Review submitted successfully", "review_id": new_review.review_id}
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.get("/reviews/user/{user_id}")
def get_user_reviews(user_id: int):
    db = SessionLocal()
    try:
        # Get all reviews where the user is the reviewee (received reviews)
        reviews = db.query(Review).filter(Review.reviewee_id == user_id).order_by(Review.created_at.desc()).all()
        result = []
        for rev in reviews:
            # Find reviewer name
            reviewer = db.query(User).filter(User.user_id == rev.reviewer_id).first()
            rev_name = "Unknown User"
            if reviewer:
                if reviewer.student_id:
                    rev_name = reviewer.student_id
                elif reviewer.email:
                    rev_name = reviewer.email.split("@")[0]

            # Find listing title via request_id
            req = db.query(ListingRequest).filter(ListingRequest.request_id == rev.request_id).first()
            listing_title = "Unknown Listing"
            if req:
                listing = db.query(Listing).filter(Listing.listing_id == req.listing_id).first()
                if listing:
                    listing_title = listing.title

            result.append({
                "review_id": rev.review_id,
                "request_id": rev.request_id,
                "reviewer_id": rev.reviewer_id,
                "reviewer_name": rev_name,
                "rating": rev.rating,
                "message": rev.message,
                "listing_title": listing_title,
                "created_at": rev.created_at.isoformat() if rev.created_at else None
            })
        return result
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.get("/user-stats/{user_id}")
def get_user_stats(user_id: int):
    db = SessionLocal()
    try:
        # Average rating received
        reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
        avg_rating = None
        if reviews:
            avg_rating = sum(r.rating for r in reviews) / len(reviews)
            avg_rating = round(avg_rating, 1)

        # Total items exchanged/borrowed (returned status where user is owner or requester)
        completed = db.query(ListingRequest).filter(
            (ListingRequest.status == "returned") & 
            ((ListingRequest.owner_id == user_id) | (ListingRequest.requester_id == user_id))
        ).count()

        return {
            "average_rating": avg_rating,
            "completed_exchanges": completed
        }
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()
