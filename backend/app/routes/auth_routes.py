from fastapi import APIRouter, Form, UploadFile, File
from passlib.hash import bcrypt

from app.database import SessionLocal
from app.models.user_model import User

from jose import jwt
from passlib.hash import bcrypt
from fastapi import HTTPException

import shutil
import os
import uuid

SECRET_KEY = "sharekorbo_secret_key"

ALGORITHM = "HS256"

router = APIRouter()


@router.post("/register")
async def register(
    university: str = Form(...),
    student_id: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),

    student_id_image: UploadFile = File(...)
):
    db = SessionLocal()

    try:

        # create uploads folder
        os.makedirs("uploads", exist_ok=True)

        # unique filename
        filename = f"{uuid.uuid4()}_{student_id_image.filename}"

        image_path = f"uploads/{filename}"

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
            student_id_image=image_path,
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
async def login(data: dict):

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