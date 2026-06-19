# ShareKorbo

## 📚 Overview

**ShareKorbo** is a mobile-first campus resource sharing platform designed to help university students efficiently share, borrow, rent, buy, sell, and exchange academic resources within a trusted student community.

Students often require resources such as laptops, electronics components, laboratory equipment, project tools, books, and study materials for a short period of time. Purchasing these resources is often expensive, while existing platforms do not provide a secure and student-focused environment.

ShareKorbo addresses this problem by creating a verified university ecosystem where students can connect, communicate, and exchange resources safely through student verification, transaction tracking, trust ratings, and real-time messaging.

---

## 🎯 Problem Statement

University students frequently face challenges when trying to access resources they do not personally own. Existing solutions such as Facebook Marketplace, campus groups, or informal borrowing methods often suffer from:

* Lack of student verification
* Limited trust and accountability
* No borrowing workflow
* No transaction tracking
* Difficulty finding temporary resources
* Poor communication between resource owners and requesters

ShareKorbo provides a centralized platform specifically designed to solve these challenges.

---

## ✨ Key Features

### 🔐 Student Authentication & Verification

* Secure JWT-based authentication
* Student registration using university credentials
* Student ID card upload and verification
* Verification status management
* Password change support
* Persistent login using AsyncStorage

### 🛒 Campus Marketplace

* Create and manage listings
* Upload multiple resource images
* Browse resources from verified students
* View detailed resource information
* Delete and manage personal listings

Supported resource types:

* Sell
* Rent
* Borrow
* Exchange

### 🤝 Request Management

* Send borrowing or rental requests
* Cancel requests
* Approve or reject requests
* Track request lifecycle
* View sent and received requests

### 💬 Real-Time Communication

* Direct messaging between resource owners and requesters
* Conversation management
* Unread message tracking
* Automatic conversation initialization

### ⭐ Trust & Reputation System

* User ratings and reviews
* Average rating calculation
* Exchange completion tracking
* Trust-building through community feedback

### 📦 Transaction Tracking

* Resource request monitoring
* Exchange status updates
* Return status tracking
* Complete transaction history

### 👤 User Profiles

* Personal profile management
* Activity overview
* Posted resources
* Ratings and reviews

---

## 🚀 Why ShareKorbo?

Unlike traditional marketplaces, ShareKorbo focuses specifically on university students.

### Benefits

* Verified student-only community
* Safe and trusted transactions
* Easy access to academic resources
* Reduced project expenses
* Encourages collaboration among students
* Promotes resource reusability and sustainability

---

## 🏗️ System Architecture

```text
Frontend (React Native + Expo)
            │
            ▼
      FastAPI Backend
            │
            ▼
      MySQL Database
            │
            ▼
 Authentication • Listings • Requests
 Messaging • Reviews • Tracking
```

---

## 🛠️ Technology Stack

### Frontend

* React Native
* Expo
* TypeScript
* NativeWind
* Tailwind CSS
* React Navigation
* AsyncStorage
* Axios
* Expo Camera
* Expo Image Picker

### Backend

* FastAPI
* Python
* SQLAlchemy
* MySQL
* JWT Authentication
* Passlib (bcrypt)
* PyMySQL
* Uvicorn

### Database

* MySQL
* SQLAlchemy ORM

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

## 📱 Implemented Screens

* Login Screen
* Registration Screen
* Verification Pending Screen
* Marketplace Screen
* Resource Details Screen
* Create Listing Screen
* Activity Screen
* Inbox Screen
* User Profile Screen

---

## 📈 Project Status

Current Development Stage:

✅ Authentication System
✅ Student Verification Workflow
✅ Marketplace Module
✅ Resource Requests
✅ Messaging System
✅ Review & Rating System
✅ Activity Tracking

🚧 Search & Advanced Filtering
🚧 Push Notifications
🚧 Cloud Storage Integration

---

## 👨‍💻 Team Members

| Name                 | ID         |
| -------------------- | ---------- |
| MD. Rifat Hossain    | 0112230360 |
| Hasibul Hasan Shanto | 0112230997 |
| Afsar Uddin Dhali    | 0112230108 |

---

## 🎓 Academic Information

**Course:** CSE 4181 – Mobile App Development

**Department:** Computer Science & Engineering

**University:** United International University

**Supervisor:** A.H.M Osama Haque

---

## 🔮 Future Improvements

* Admin dashboard for verification approval
* Advanced search and filtering
* Real-time WebSocket messaging
* Push notifications
* Cloud image storage integration
* Security deposit management
* Payment integration
* Multi-university support
* Analytics dashboard
* Production deployment

---

## 📄 License

This project was developed for academic and educational purposes as part of the Mobile App Development course at United International University.


````md
# ⚙️ Installation Guide

Follow the instructions below to set up and run ShareKorbo locally.

## Prerequisites

Before running the project, make sure the following software is installed on your machine:

### Frontend Requirements

- Node.js (v18 or later recommended)
- npm
- Expo CLI or Expo Go Mobile App

### Backend Requirements

- Python 3.10+
- MySQL Server
- pip

### Development Tools

- Git
- VS Code (Recommended)
- Postman (Optional)

---

# 🔧 Backend Setup

## 1. Navigate to Backend Directory

```bash
cd backend
````

## 2. Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Create MySQL Database

Open MySQL and execute:

```sql
CREATE DATABASE sharekorbo;
```

## 5. Configure Database Connection

Open:

```text
backend/app/database.py
```

Update the connection string according to your local MySQL configuration.

Example:

```python
DATABASE_URL = "mysql+pymysql://root:your_password@localhost/sharekorbo"
```

## 6. Start Backend Server

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://localhost:8000
```

### Health Check

```text
GET http://localhost:8000/health
```

### Swagger API Documentation

```text
http://localhost:8000/docs
```

---

# 📱 Frontend Setup

## 1. Navigate to Frontend Directory

```bash
cd frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Backend Address

Open:

```text
frontend/src/utils/config.ts
```

Update:

```ts
export const BACKEND_IP = "YOUR_LOCAL_IP";
```

Example:

```ts
export const BACKEND_IP = "192.168.0.105";
```

### Important

If you are using:

* Physical Android Device → Use your PC's local IP
* Android Emulator → Use emulator IP
* Web Browser → Use localhost if applicable

## 4. Start Expo Application

```bash
npm start
```

Or run directly:

```bash
npm run android
```

```bash
npm run ios
```

```bash
npm run web
```

---

# 📡 API Documentation

The backend API is built using FastAPI and can be explored through Swagger UI.

## Authentication APIs

### Register User

```http
POST /auth/register
```

Registers a new student account.

Required Fields:

* university
* student_id
* email
* password
* student_id_image

---

### Login User

```http
POST /auth/login
```

Returns:

* Access Token
* User Information
* Verification Status

---

### Change Password

```http
POST /auth/change-password
```

Allows users to securely update their password.

---

### Get User Profile

```http
GET /auth/user/{user_id}
```

Returns user profile information.

---

## Marketplace APIs

### Create Listing

```http
POST /listing/create
```

Create a new resource listing with images.

---

### Get All Listings

```http
GET /listing/all
```

Retrieve all available listings.

---

### Get Listing Details

```http
GET /listing/{listing_id}
```

Retrieve detailed information for a specific listing.

---

### Get User Posts

```http
GET /listing/user/{user_id}/posts
```

Returns all posts created by a specific user.

---

### Delete Listing

```http
DELETE /listing/user/{user_id}/posts/{listing_id}
```

Deletes a user's own listing.

---

## Request Management APIs

### Send Request

```http
POST /listing/send-request
```

Create a borrowing, rental, or exchange request.

---

### Cancel Request

```http
DELETE /listing/cancel-request
```

Cancel an existing request.

---

### View Sent Requests

```http
GET /listing/requests-sent/{user_id}
```

Returns requests sent by a user.

---

### View Received Requests

```http
GET /listing/requests-received/{user_id}
```

Returns requests received by a listing owner.

---

### Approve Request

```http
POST /listing/approve-request/{request_id}
```

Approve a request.

---

### Reject Request

```http
POST /listing/reject-request/{request_id}
```

Reject a request.

---

## Messaging APIs

### Open Conversation

```http
POST /inbox/conversation/open
```

Creates or returns an existing conversation.

---

### Get Conversations

```http
GET /inbox/conversations/{user_id}
```

Returns all conversations of a user.

---

### Get Messages

```http
GET /inbox/messages/{conversation_id}
```

Returns messages of a conversation.

---

### Send Message

```http
POST /inbox/messages
```

Send a message within a conversation.

---

## Review APIs

### Create Review

```http
POST /listing/reviews
```

Submit a rating and review after a completed exchange.

---

### Get User Reviews

```http
GET /listing/reviews/user/{user_id}
```

Returns all reviews received by a user.

---

### Get User Statistics

```http
GET /listing/user-stats/{user_id}
```

Returns:

* Average Rating
* Completed Exchanges

---

# 🗄️ Database Models

The application currently uses the following primary database entities:

### User

Stores student information, authentication credentials, verification status, and profile details.

### Listing

Represents resources available for borrowing, renting, selling, or exchange.

### ListingImage

Stores listing image information.

### ListingRequest

Tracks requests made between resource owners and requesters.

### Conversation

Represents communication channels between users.

### Message

Stores messages exchanged inside conversations.

### Review

Stores ratings and feedback after completed transactions.

---

## Database Initialization

Tables are automatically generated using SQLAlchemy:

```python
Base.metadata.create_all(bind=engine)
```

---

# 📝 Development Notes

### Current Implementation

* JWT Authentication
* Student Verification Workflow
* Marketplace CRUD Operations
* Request Management
* User Reviews
* Messaging System
* Transaction Tracking

### File Uploads

Uploaded images are currently stored locally:

```text
backend/uploads/
```

Accessible through:

```text
/ uploads
```

Example:

```text
http://localhost:8000/uploads/example-image.jpg
```

### Security Notes

The current academic version uses local configuration values.

For production deployment, sensitive values should be moved into environment variables:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost/sharekorbo

SECRET_KEY=your_secret_key

BACKEND_HOST=0.0.0.0

BACKEND_PORT=8000
```

### Recommended Future Enhancements

* Admin Dashboard
* Cloud Storage Integration
* Real-Time Messaging (WebSocket)
* Push Notifications
* Advanced Search & Filtering
* Payment & Deposit Tracking
* Multi-University Support
* Automated Testing
* CI/CD Deployment Pipeline
* Role-Based Access Control

```
```
