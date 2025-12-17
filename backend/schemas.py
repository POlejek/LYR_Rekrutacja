from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class RekrutacjaBase(BaseModel):
    przyczyna_rekrutacji: str = Field(..., description="Replacement, New Position, etc.")
    replacement_za_kogo: Optional[str] = None
    collar_type: str = Field(..., description="White lub Blue")
    czy_manager: bool
    id_referencyjne: str
    departament: str
    dzial: str
    stanowisko: str
    miejsce_pracy: str
    hiring_manager: str
    data_otwarcia: date
    liczba_cv_otrzymana: int = 0
    liczba_cv_odrzucone_rekruter: int = 0
    liczba_spotkan_rekruter: int = 0
    liczba_spotkan_hiring_manager: int = 0
    data_zamkniecia: Optional[date] = None
    data_zatrudnienia: Optional[date] = None
    typ_zatrudnienia: Optional[str] = None
    liczba_zatrudnionych: int = 0
    liczba_odrzuconych_ofert_przez_kandydata: int = 0
    liczba_zlozonych_ofert: int = 0
    komentarz: Optional[str] = None
    plec: Optional[str] = None


class RekrutacjaCreate(RekrutacjaBase):
    pass


class RekrutacjaUpdate(BaseModel):
    przyczyna_rekrutacji: Optional[str] = None
    replacement_za_kogo: Optional[str] = None
    collar_type: Optional[str] = None
    czy_manager: Optional[bool] = None
    id_referencyjne: Optional[str] = None
    departament: Optional[str] = None
    dzial: Optional[str] = None
    stanowisko: Optional[str] = None
    miejsce_pracy: Optional[str] = None
    hiring_manager: Optional[str] = None
    data_otwarcia: Optional[date] = None
    liczba_cv_otrzymana: Optional[int] = None
    liczba_cv_odrzucone_rekruter: Optional[int] = None
    liczba_spotkan_rekruter: Optional[int] = None
    liczba_spotkan_hiring_manager: Optional[int] = None
    data_zamkniecia: Optional[date] = None
    data_zatrudnienia: Optional[date] = None
    typ_zatrudnienia: Optional[str] = None
    liczba_zatrudnionych: Optional[int] = None
    liczba_odrzuconych_ofert_przez_kandydata: Optional[int] = None
    liczba_zlozonych_ofert: Optional[int] = None
    komentarz: Optional[str] = None
    plec: Optional[str] = None


class RekrutacjaResponse(RekrutacjaBase):
    id: int
    ttf: Optional[int] = None
    tto: Optional[int] = None
    czas_otwarcia: Optional[int] = None
    wskaznik_akceptacji_ofert: Optional[float] = None
    wskaznik_konwersji_cv: Optional[float] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True
