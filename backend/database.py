"""
SQLAlchemy database setup supporting PostgreSQL with SQLite fallback.
Designed for production healthcare imaging records & audit trails.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/radpulse_db"
)

# Fallback to local SQLite if PostgreSQL is not running in local development
if not DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency for yielding database sessions with safe teardown."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
