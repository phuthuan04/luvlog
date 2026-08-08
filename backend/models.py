from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from database import Base, engine

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

class Album(Base):
    __tablename__ = "albums"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Photo(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True)
    album_id = Column(Integer, ForeignKey("albums.id"), nullable=True)
    url = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FundGoal(Base):
    __tablename__ = "fund_goals"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    target_amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FundTransaction(Base):
    __tablename__ = "fund_transactions"
    id = Column(Integer, primary_key=True)
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    goal_id = Column(Integer, ForeignKey("fund_goals.id"), nullable=True)
    created_by = Column(String, nullable=False)
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

class MediaMixin:
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    cover_url = Column(String)
    external_id = Column(String)  # ID gốc bên TMDB/Google Books, dùng để tìm gợi ý tương tự
    category = Column(String)      # thể loại, dùng cho gợi ý sách theo category
    status = Column(String, nullable=False)  # "muon" | "da"
    rating = Column(Integer)
    review = Column(String)
    added_by = Column(String, nullable=False)
    experienced_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Movie(MediaMixin, Base):
    __tablename__ = "movies"

class Book(MediaMixin, Base):
    __tablename__ = "books"

class Song(MediaMixin, Base):
    __tablename__ = "songs"

class Suggestion(Base):
    __tablename__ = "suggestions"
    id = Column(Integer, primary_key=True)
    media_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    cover_url = Column(String)
    external_id = Column(String)
    category = Column(String)
    based_on = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(engine)