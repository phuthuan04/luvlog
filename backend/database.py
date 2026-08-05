import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Journal(Base):
    __tablename__ = "journals"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    author = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Photo(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True)
    album = Column(String, nullable=False)
    url = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FundTransaction(Base):
    __tablename__ = "fund_transactions"
    id = Column(Integer, primary_key=True)
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FundGoal(Base):
    __tablename__ = "fund_goals"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    target_amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True)
    place_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    note = Column(String)
    visited_at = Column(DateTime, nullable=False)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(engine)

