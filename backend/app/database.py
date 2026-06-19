from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:@localhost/sharekorbo"

engine = create_engine(
    DATABASE_URL,
    pool_size=30,
    max_overflow=20,
    pool_timeout=60,
    pool_recycle=3600,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
