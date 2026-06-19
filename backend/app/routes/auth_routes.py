from fastapi import APIRouter, Form, UploadFile, File
from passlib.hash import bcrypt

from app.database import SessionLocal
from app.models.user_model import User

from jose import jwt
from passlib.hash import bcrypt
from fastapi import HTTPException

import shutil
import uuid
from pathlib import Path

SECRET_KEY = "sharekorbo_secret_key"

ALGORITHM = "HS256"

router = APIRouter()

BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_DIR / "uploads"


@router.post("/register")
def register(
    university: str = Form(...),
    student_id: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),

    student_id_image: UploadFile = File(...)
):
    db = SessionLocal()

    try:

        # create uploads folder
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        # unique filename
        filename = f"{uuid.uuid4()}_{student_id_image.filename}"

        image_path = UPLOAD_DIR / filename
        image_url = f"uploads/{filename}"

        # save image
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(
                student_id_image.file,
                buffer
            )

        # hash password
        hashed_password = bcrypt.hash(password)

        # create user
        new_user = User(
            university=university,
            student_id=student_id,
            email=email,
            password=hashed_password,
            student_id_image=image_url,
            verification_status="pending"
        )

        db.add(new_user)

        db.commit()

        return {
            "message": "Registration successful",
            "status": "pending"
        }

    except Exception as e:

        print(e)

        return {
            "error": str(e)
        }

    finally:
        db.close()
        
        
@router.post("/login")
def login(data: dict):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.email == data["email"]
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email"
            )

        print("INPUT PASSWORD:", data["password"])

        print("DB PASSWORD:", user.password)

        # verify password
        is_valid = bcrypt.verify(
            data["password"],
            user.password
        )

        print("PASSWORD VALID:", is_valid)

        if not is_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )

        # create jwt token
        token = jwt.encode(
            {
                "user_id": user.user_id,
                "email": user.email
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return {
            "access_token": token,
            "verification_status": user.verification_status,
            "user_id": user.user_id
        }

    finally:
        db.close()


@router.post("/change-password")
def change_password(data: dict):
    db = SessionLocal()
    try:
        user_id = data.get("user_id")
        old_password = data.get("old_password")
        new_password = data.get("new_password")

        if not all([user_id, old_password, new_password]):
            return {"error": "Missing required fields"}

        # Find user
        user = db.query(User).filter(User.user_id == int(user_id)).first()
        if not user:
            return {"error": "User not found"}

        # Verify old password
        if not bcrypt.verify(old_password, user.password):
            return {"error": "Incorrect current password"}

        # Hash and update new password
        user.password = bcrypt.hash(new_password)
        db.commit()
        return {"message": "Password updated successfully"}
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


@router.get("/user/{user_id}")
def get_user_detail(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return {"error": "User not found"}
        return {
            "user_id": user.user_id,
            "university": user.university,
            "student_id": user.student_id,
            "email": user.email,
            "verification_status": user.verification_status,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    finally:
        db.close()
