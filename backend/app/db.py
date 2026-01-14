import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////home/data/movies.db")
# Načte DATABASE_URL z prostředí, jinak použije default SQLite databázi.  má absolutní cestu


# Pokud používáme SQLite v Azure, zajisti existenci složky
if DATABASE_URL.startswith("sqlite:////home/"):
    db_path = DATABASE_URL.replace("sqlite:////", "/")
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
# Pokud DB soubor leží v /home/..., vytvoří rodičovský adresář, aby SQLite mělo kam zapisovat.

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
# Vytvoří SQLAlchemy "engine" (připojení/driver).
# U SQLite je potřeba check_same_thread=False, aby DB šla používat i mimo hlavní thread.

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Factory na DB session (jedno "napojení" pro jednu HTTP request operaci).