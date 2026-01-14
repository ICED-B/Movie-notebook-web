from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String

class Base(DeclarativeBase):
    pass
# Základ pro SQLAlchemy modely (tabulky). Všechny modely dědí z Base.
# Definuje jedinou tabulku movies se sloupci id, title, year, genre.
class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)  # PK automaticky číslovaný dle DB
    title: Mapped[str] = mapped_column(String(200), nullable=False)         # název filmu max 200 nesmí být null
    year: Mapped[int] = mapped_column(Integer, nullable=False)              # rok filmu nesmí být null
    genre: Mapped[str] = mapped_column(String(100), nullable=False)         # žánr nesmí být null

