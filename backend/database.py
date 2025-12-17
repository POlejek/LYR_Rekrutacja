from sqlalchemy import create_engine, Column, Integer, String, Date, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import date, datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./rekrutacja.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Rekrutacja(Base):
    __tablename__ = "rekrutacje"

    id = Column(Integer, primary_key=True, index=True)
    przyczyna_rekrutacji = Column(String, nullable=False)  # Replacement, New Position, etc.
    replacement_za_kogo = Column(String, nullable=True)  # Jeśli Replacement
    collar_type = Column(String, nullable=False)  # White/Blue
    czy_manager = Column(Boolean, nullable=False)  # Manager/Nie Manager
    id_referencyjne = Column(String, unique=True, nullable=False)
    departament = Column(String, nullable=False)
    dzial = Column(String, nullable=False)
    stanowisko = Column(String, nullable=False)
    miejsce_pracy = Column(String, nullable=False)
    hiring_manager = Column(String, nullable=False)
    data_otwarcia = Column(Date, nullable=False)
    liczba_cv_otrzymana = Column(Integer, default=0)
    liczba_cv_odrzucone_rekruter = Column(Integer, default=0)
    liczba_spotkan_rekruter = Column(Integer, default=0)
    liczba_spotkan_hiring_manager = Column(Integer, default=0)
    data_zamkniecia = Column(Date, nullable=True)
    data_zatrudnienia = Column(Date, nullable=True)
    typ_zatrudnienia = Column(String, nullable=True)  # Wewnętrzne/Zewnętrzne/Agencja/POL
    liczba_zatrudnionych = Column(Integer, default=0)
    liczba_odrzuconych_ofert_przez_kandydata = Column(Integer, default=0)
    liczba_zlozonych_ofert = Column(Integer, default=0)  # suma zatrudnionych + odrzuconych ofert
    komentarz = Column(Text, nullable=True)
    plec = Column(String, nullable=True)  # M/K/Inna

    @hybrid_property
    def ttf(self):
        """Time To Fill - czas od otwarcia do zatrudnienia (w dniach)"""
        if self.data_zatrudnienia and self.data_otwarcia:
            if isinstance(self.data_zatrudnienia, str):
                data_zatr = datetime.strptime(self.data_zatrudnienia, '%Y-%m-%d').date()
            else:
                data_zatr = self.data_zatrudnienia
            
            if isinstance(self.data_otwarcia, str):
                data_otw = datetime.strptime(self.data_otwarcia, '%Y-%m-%d').date()
            else:
                data_otw = self.data_otwarcia
                
            return (data_zatr - data_otw).days
        return None

    @hybrid_property
    def tto(self):
        """Time To Offer - czas od otwarcia do złożenia pierwszej oferty (w dniach)"""
        # Zakładamy, że pierwsza oferta = data zamknięcia (jeśli są złożone oferty)
        if self.data_zamkniecia and self.data_otwarcia and self.liczba_zlozonych_ofert > 0:
            if isinstance(self.data_zamkniecia, str):
                data_zamk = datetime.strptime(self.data_zamkniecia, '%Y-%m-%d').date()
            else:
                data_zamk = self.data_zamkniecia
            
            if isinstance(self.data_otwarcia, str):
                data_otw = datetime.strptime(self.data_otwarcia, '%Y-%m-%d').date()
            else:
                data_otw = self.data_otwarcia
                
            return (data_zamk - data_otw).days
        return None

    @hybrid_property
    def czas_otwarcia(self):
        """Liczba dni od otwarcia do zamknięcia rekrutacji"""
        if self.data_zamkniecia and self.data_otwarcia:
            if isinstance(self.data_zamkniecia, str):
                data_zamk = datetime.strptime(self.data_zamkniecia, '%Y-%m-%d').date()
            else:
                data_zamk = self.data_zamkniecia
            
            if isinstance(self.data_otwarcia, str):
                data_otw = datetime.strptime(self.data_otwarcia, '%Y-%m-%d').date()
            else:
                data_otw = self.data_otwarcia
                
            return (data_zamk - data_otw).days
        return None

    @hybrid_property
    def wskaznik_akceptacji_ofert(self):
        """Procent zaakceptowanych ofert (liczba zatrudnionych / liczba złożonych ofert)"""
        if self.liczba_zlozonych_ofert > 0:
            return round((self.liczba_zatrudnionych / self.liczba_zlozonych_ofert) * 100, 2)
        return None

    @hybrid_property
    def wskaznik_konwersji_cv(self):
        """Procent CV, które przeszły do etapu spotkań"""
        if self.liczba_cv_otrzymana > 0:
            total_spotkan = self.liczba_spotkan_rekruter + self.liczba_spotkan_hiring_manager
            return round((total_spotkan / self.liczba_cv_otrzymana) * 100, 2)
        return None

    @hybrid_property
    def status(self):
        """Status rekrutacji: otwarta/zamknieta/z_zatrudnieniem"""
        if self.data_zatrudnienia:
            return "z_zatrudnieniem"
        elif self.data_zamkniecia:
            return "zamknieta"
        else:
            return "otwarta"


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
