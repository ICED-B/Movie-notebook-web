import os
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db import SessionLocal, engine
from app.models import Base, Movie

Base.metadata.create_all(bind=engine)   # Při startu aplikace vytvoří tabulky v DB, pokud ještě neexistují.

app = FastAPI(title="Movie Notebook API")   # Vytvoří FastAPI aplikaci (ASGI app), která drží endpointy a konfiguraci.

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
# Seznam povolených originů pro CORS (např. frontend URL).
# Bere se z env CORS_ORIGINS jako CSV string (oddělené čárkou).

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Přidá CORS middleware:
# - allow_origins: kdo smí volat API z prohlížeče (frontend doména)
# - allow_credentials: povolí cookies/credentials (pokud bys někdy používal)
# - allow_methods/headers: povolí všechny metody a hlavičky


def get_db():
    db = SessionLocal() # Vytvoří DB session pro jeden request.
    try:
        yield db        # yield = FastAPI dependency generator: předá session do endpointu
    finally:
        db.close()      # Po skončení requestu session zavře.

# Validace vstupu při vytváření filmu (POST).
class MovieCreate(BaseModel):   
    title: str = Field(min_length=1, max_length=200)
    year: int = Field(ge=1888, le=2100)
    genre: str = Field(min_length=1, max_length=100)

# Validace pro update je stejná jako create (PUT).
class MovieUpdate(MovieCreate):
    pass

# Co vrací API ven (response model).
class MovieOut(BaseModel):
    id: int
    title: str
    year: int
    genre: str

    class Config:
        from_attributes = True  # Umožní Pydanticu číst data přímo ze SQLAlchemy objektu (Movie).

@app.get("/api/health")
def health():
    return {"status": "ok"} # Jednoduchý endpoint pro healthcheck (Azure, monitoring, test).

@app.get("/api/movies", response_model=List[MovieOut])
def list_movies(db: Session = Depends(get_db)):     # GET seznam filmů, seřazený od nejnovějšího ID.
    movies = db.scalars(select(Movie).order_by(Movie.id.desc())).all()
    return movies

@app.post("/api/movies", response_model=MovieOut, status_code=201)
def create_movie(payload: MovieCreate, db: Session = Depends(get_db)):  # POST vytvoří nový film podle payloadu.
    movie = Movie(title=payload.title, year=payload.year, genre=payload.genre)
    db.add(movie)
    db.commit()
    db.refresh(movie) # refresh načte zpět hodnoty z DB (hlavně id).
    return movie

@app.put("/api/movies/{movie_id}", response_model=MovieOut)
def update_movie(movie_id: int, payload: MovieUpdate, db: Session = Depends(get_db)):
    movie = db.get(Movie, movie_id) # PUT upraví existující film podle ID.
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")  # Když ID neexistuje, vrátí 404

    movie.title = payload.title
    movie.year = payload.year
    movie.genre = payload.genre

    db.commit()
    db.refresh(movie)
    return movie

@app.delete("/api/movies/{movie_id}", status_code=204)
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    db.delete(movie)
    db.commit()
    return None
