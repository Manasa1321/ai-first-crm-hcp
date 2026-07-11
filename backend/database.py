# database.py
import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Put your raw password here exactly as you type it in pgAdmin
raw_password = "Chidhu@7479"  # <-- Change this to your password

# 2. This safely escapes special characters like @, :, /, etc.
safe_password = urllib.parse.quote_plus(raw_password)

# 3. Construct the clean URL string
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    f"postgresql://postgres:{safe_password}@localhost:5432/ai_crm_hcp"
)

# The rest of your code stays exactly the same
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()