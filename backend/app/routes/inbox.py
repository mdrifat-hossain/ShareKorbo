from fastapi import APIRouter
from app.database import SessionLocal
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user_model import User
from app.models.listing import Listing

router = APIRouter()


def _user_display_name(user: User) -> str:
    """Return the best display name for a user."""
    if user is None:
        return "Unknown"
    if user.student_id:
        return user.student_id
    return user.email.split("@")[0] if user.email else "Unknown"


# ---------------------------------------------------------------------------
# POST /inbox/conversation/open
# Find-or-create a conversation between buyer and owner for a listing.
# If the conversation is brand-new, insert the automatic greeting message.
# ---------------------------------------------------------------------------
@router.post("/conversation/open")
def open_conversation(data: dict):
    """
    Expected body:
        { listing_id, owner_id, buyer_id, listing_title }
    Returns:
        { conversation_id, is_new }
    """
    db = SessionLocal()
    try:
        listing_id = int(data["listing_id"])
        owner_id = int(data["owner_id"])
        buyer_id = int(data["buyer_id"])
        listing_title = data.get("listing_title", "your listing")

        # Guard: buyer cannot chat with themselves
        if buyer_id == owner_id:
            return {"error": "You cannot chat with yourself."}

        # Try to find an existing conversation
        existing = (
            db.query(Conversation)
            .filter(
                Conversation.listing_id == listing_id,
                Conversation.owner_id == owner_id,
                Conversation.buyer_id == buyer_id,
            )
            .first()
        )

        if existing:
            return {
                "conversation_id": existing.conversation_id,
                "is_new": False,
            }

        # Create a new conversation
        conv = Conversation(
            listing_id=listing_id,
            owner_id=owner_id,
            buyer_id=buyer_id,
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

        # Send automatic greeting from buyer
        greeting = Message(
            conversation_id=conv.conversation_id,
            sender_id=buyer_id,
            message_text=(
                f"Hi! I'm interested in your listing \"{listing_title}\" "
                f"(ID: #{listing_id}). I'd love to know more about it."
            ),
        )
        db.add(greeting)
        db.commit()

        return {
            "conversation_id": conv.conversation_id,
            "is_new": True,
        }

    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


# ---------------------------------------------------------------------------
# GET /inbox/conversations/{user_id}
# All conversations for a user (as buyer OR owner), enriched with the other
# party's name, last message, unread count.
# ---------------------------------------------------------------------------
@router.get("/conversations/{user_id}")
def get_conversations(user_id: int):
    db = SessionLocal()
    try:
        convs = (
            db.query(Conversation)
            .filter(
                (Conversation.buyer_id == user_id)
                | (Conversation.owner_id == user_id)
            )
            .order_by(Conversation.created_at.desc())
            .all()
        )

        result = []
        for c in convs:
            # Determine the "other" person
            other_id = c.owner_id if c.buyer_id == user_id else c.buyer_id
            other_user = db.query(User).filter(User.user_id == other_id).first()
            listing = (
                db.query(Listing)
                .filter(Listing.listing_id == c.listing_id)
                .first()
            )

            # Last message
            last_msg = (
                db.query(Message)
                .filter(Message.conversation_id == c.conversation_id)
                .order_by(Message.created_at.desc())
                .first()
            )

            # Unread count (messages NOT sent by me that are unread)
            unread_count = (
                db.query(Message)
                .filter(
                    Message.conversation_id == c.conversation_id,
                    Message.sender_id != user_id,
                    Message.is_read == False,
                )
                .count()
            )

            # Sent / received counts for filter chips
            sent_count = (
                db.query(Message)
                .filter(
                    Message.conversation_id == c.conversation_id,
                    Message.sender_id == user_id,
                )
                .count()
            )
            received_count = (
                db.query(Message)
                .filter(
                    Message.conversation_id == c.conversation_id,
                    Message.sender_id != user_id,
                )
                .count()
            )

            result.append(
                {
                    "conversation_id": c.conversation_id,
                    "listing_id": c.listing_id,
                    "listing_title": listing.title if listing else "Unknown listing",
                    "other_user_id": other_id,
                    "other_user_name": _user_display_name(other_user),
                    "last_message": last_msg.message_text if last_msg else "",
                    "last_message_time": (
                        last_msg.created_at.strftime("%I:%M %p")
                        if last_msg and last_msg.created_at
                        else ""
                    ),
                    "unread_count": unread_count,
                    "sent_count": sent_count,
                    "received_count": received_count,
                }
            )

        return result

    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


# ---------------------------------------------------------------------------
# GET /inbox/messages/{conversation_id}
# All messages in a conversation, sorted oldest-first.
# ---------------------------------------------------------------------------
@router.get("/messages/{conversation_id}")
def get_messages(conversation_id: int):
    db = SessionLocal()
    try:
        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .all()
        )

        return [
            {
                "message_id": m.message_id,
                "sender_id": m.sender_id,
                "message_text": m.message_text,
                "is_read": m.is_read,
                "created_at": (
                    m.created_at.strftime("%I:%M %p")
                    if m.created_at
                    else ""
                ),
            }
            for m in messages
        ]

    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


# ---------------------------------------------------------------------------
# POST /inbox/messages
# Send a new text message.
# ---------------------------------------------------------------------------
@router.post("/messages")
def send_message(data: dict):
    """
    Expected body:
        { conversation_id, sender_id, message_text }
    """
    db = SessionLocal()
    try:
        msg = Message(
            conversation_id=int(data["conversation_id"]),
            sender_id=int(data["sender_id"]),
            message_text=data["message_text"].strip(),
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)

        return {
            "message_id": msg.message_id,
            "created_at": (
                msg.created_at.strftime("%I:%M %p") if msg.created_at else ""
            ),
        }

    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()


# ---------------------------------------------------------------------------
# POST /inbox/mark-read/{conversation_id}/{user_id}
# Mark all messages in a conversation as read (for the current user).
# ---------------------------------------------------------------------------
@router.post("/mark-read/{conversation_id}/{user_id}")
def mark_read(conversation_id: int, user_id: int):
    db = SessionLocal()
    try:
        db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.is_read == False,
        ).update({"is_read": True})
        db.commit()
        return {"ok": True}
    except Exception as e:
        print(e)
        return {"error": str(e)}
    finally:
        db.close()
