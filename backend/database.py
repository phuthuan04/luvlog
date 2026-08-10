import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

SCHEMA_PATCHES = [
    ("photos", "caption_author", "caption_author VARCHAR"),
    ("photos", "caption_updated_at", "caption_updated_at TIMESTAMP"),
]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema():
    with engine.begin() as conn:
        existing_tables = set(inspect(conn).get_table_names())
        for table_name, column_name, ddl in SCHEMA_PATCHES:
            if table_name not in existing_tables:
                continue
            columns = {column["name"] for column in inspect(conn).get_columns(table_name)}
            if column_name not in columns:
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {ddl}"))