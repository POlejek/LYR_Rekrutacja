from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, date
import os
import json

from backend.database import get_db, init_db, Rekrutacja
from backend.schemas import RekrutacjaCreate, RekrutacjaResponse, RekrutacjaUpdate

app = FastAPI(title="System Statystyk Rekrutacji")

# Inicjalizacja bazy danych
init_db()

# Montowanie folderu frontend jako static files
app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
async def root():
    """Serwuje główną stronę aplikacji"""
    return FileResponse("frontend/index.html")


@app.get("/dashboard")
async def dashboard():
    """Serwuje stronę dashboardu"""
    return FileResponse("frontend/dashboard.html")


@app.post("/api/rekrutacje", response_model=RekrutacjaResponse, status_code=status.HTTP_201_CREATED)
def create_rekrutacja(rekrutacja: RekrutacjaCreate, db: Session = Depends(get_db)):
    """Tworzy nową rekrutację"""
    # Sprawdź czy ID referencyjne już istnieje
    existing = db.query(Rekrutacja).filter(Rekrutacja.id_referencyjne == rekrutacja.id_referencyjne).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rekrutacja z ID referencyjnym {rekrutacja.id_referencyjne} już istnieje"
        )
    
    db_rekrutacja = Rekrutacja(**rekrutacja.model_dump())
    db.add(db_rekrutacja)
    db.commit()
    db.refresh(db_rekrutacja)
    return db_rekrutacja


@app.get("/api/rekrutacje", response_model=List[RekrutacjaResponse])
def list_rekrutacje(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Zwraca listę wszystkich rekrutacji"""
    rekrutacje = db.query(Rekrutacja).offset(skip).limit(limit).all()
    return rekrutacje


@app.get("/api/rekrutacje/{rekrutacja_id}", response_model=RekrutacjaResponse)
def get_rekrutacja(rekrutacja_id: int, db: Session = Depends(get_db)):
    """Zwraca szczegóły pojedynczej rekrutacji"""
    rekrutacja = db.query(Rekrutacja).filter(Rekrutacja.id == rekrutacja_id).first()
    if not rekrutacja:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rekrutacja z ID {rekrutacja_id} nie została znaleziona"
        )
    return rekrutacja


@app.put("/api/rekrutacje/{rekrutacja_id}", response_model=RekrutacjaResponse)
def update_rekrutacja(rekrutacja_id: int, rekrutacja_update: RekrutacjaUpdate, db: Session = Depends(get_db)):
    """Aktualizuje istniejącą rekrutację"""
    rekrutacja = db.query(Rekrutacja).filter(Rekrutacja.id == rekrutacja_id).first()
    if not rekrutacja:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rekrutacja z ID {rekrutacja_id} nie została znaleziona"
        )
    
    update_data = rekrutacja_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rekrutacja, field, value)
    
    db.commit()
    db.refresh(rekrutacja)
    return rekrutacja


@app.delete("/api/rekrutacje/{rekrutacja_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rekrutacja(rekrutacja_id: int, db: Session = Depends(get_db)):
    """Usuwa rekrutację"""
    rekrutacja = db.query(Rekrutacja).filter(Rekrutacja.id == rekrutacja_id).first()
    if not rekrutacja:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rekrutacja z ID {rekrutacja_id} nie została znaleziona"
        )
    
    db.delete(rekrutacja)
    db.commit()
    return None


@app.get("/api/statystyki")
def get_statystyki(db: Session = Depends(get_db)):
    """Zwraca podstawowe statystyki rekrutacji"""
    total_rekrutacje = db.query(Rekrutacja).count()
    otwarte = db.query(Rekrutacja).filter(Rekrutacja.data_zamkniecia.is_(None)).count()
    zamkniete = db.query(Rekrutacja).filter(Rekrutacja.data_zamkniecia.isnot(None)).count()
    
    return {
        "total_rekrutacje": total_rekrutacje,
        "otwarte": otwarte,
        "zamkniete": zamkniete,
    }


@app.get("/api/dashboard")
def get_dashboard_stats(
    data_od: Optional[str] = Query(None, description="Data początkowa (YYYY-MM-DD)"),
    data_do: Optional[str] = Query(None, description="Data końcowa (YYYY-MM-DD)"),
    departament: Optional[str] = Query(None, description="Filtr po departamencie"),
    collar_type: Optional[str] = Query(None, description="Filtr po typie collar"),
    db: Session = Depends(get_db)
):
    """
    Zwraca zaawansowane statystyki dla dashboardu zarządczego
    """
    
    # Budowanie zapytania z filtrami
    query = db.query(Rekrutacja)
    
    if data_od:
        query = query.filter(Rekrutacja.data_otwarcia >= data_od)
    if data_do:
        query = query.filter(Rekrutacja.data_otwarcia <= data_do)
    if departament:
        query = query.filter(Rekrutacja.departament == departament)
    if collar_type:
        query = query.filter(Rekrutacja.collar_type == collar_type)
    
    rekrutacje = query.all()
    
    if not rekrutacje:
        return {
            "message": "Brak danych dla wybranych filtrów",
            "total_rekrutacje": 0
        }
    
    # Obliczanie metryk
    total = len(rekrutacje)
    otwarte = sum(1 for r in rekrutacje if not r.data_zamkniecia)
    zamkniete = sum(1 for r in rekrutacje if r.data_zamkniecia)
    z_zatrudnieniem = sum(1 for r in rekrutacje if r.data_zatrudnienia)
    
    # TTF i TTO
    ttf_values = [r.ttf for r in rekrutacje if r.ttf is not None]
    tto_values = [r.tto for r in rekrutacje if r.tto is not None]
    czas_otwarcia_values = [r.czas_otwarcia for r in rekrutacje if r.czas_otwarcia is not None]
    
    avg_ttf = round(sum(ttf_values) / len(ttf_values), 1) if ttf_values else None
    median_ttf = sorted(ttf_values)[len(ttf_values)//2] if ttf_values else None
    avg_tto = round(sum(tto_values) / len(tto_values), 1) if tto_values else None
    median_tto = sorted(tto_values)[len(tto_values)//2] if tto_values else None
    avg_czas_otwarcia = round(sum(czas_otwarcia_values) / len(czas_otwarcia_values), 1) if czas_otwarcia_values else None
    
    # Wskaźniki konwersji
    total_cv = sum(r.liczba_cv_otrzymana for r in rekrutacje)
    total_cv_odrzucone = sum(r.liczba_cv_odrzucone_rekruter for r in rekrutacje)
    total_spotkan_rekruter = sum(r.liczba_spotkan_rekruter for r in rekrutacje)
    total_spotkan_hm = sum(r.liczba_spotkan_hiring_manager for r in rekrutacje)
    total_ofert = sum(r.liczba_zlozonych_ofert for r in rekrutacje)
    total_zatrudnionych = sum(r.liczba_zatrudnionych for r in rekrutacje)
    total_ofert_odrzuconych = sum(r.liczba_odrzuconych_ofert_przez_kandydata for r in rekrutacje)
    
    # Wskaźnik akceptacji ofert
    offer_acceptance_rate = round((total_zatrudnionych / total_ofert * 100), 2) if total_ofert > 0 else 0
    
    # Konwersja CV -> Spotkania
    cv_to_interview_rate = round(((total_spotkan_rekruter + total_spotkan_hm) / total_cv * 100), 2) if total_cv > 0 else 0
    
    # Konwersja Spotkania -> Oferty
    interview_to_offer_rate = round((total_ofert / (total_spotkan_rekruter + total_spotkan_hm) * 100), 2) if (total_spotkan_rekruter + total_spotkan_hm) > 0 else 0
    
    # Statystyki po departamentach
    departamenty_stats = {}
    for r in rekrutacje:
        if r.departament not in departamenty_stats:
            departamenty_stats[r.departament] = {
                "total": 0,
                "otwarte": 0,
                "zamkniete": 0,
                "z_zatrudnieniem": 0
            }
        departamenty_stats[r.departament]["total"] += 1
        if not r.data_zamkniecia:
            departamenty_stats[r.departament]["otwarte"] += 1
        if r.data_zamkniecia:
            departamenty_stats[r.departament]["zamkniete"] += 1
        if r.data_zatrudnienia:
            departamenty_stats[r.departament]["z_zatrudnieniem"] += 1
    
    # Statystyki po przyczynach
    przyczyny_stats = {}
    for r in rekrutacje:
        przyczyna = r.przyczyna_rekrutacji
        przyczyny_stats[przyczyna] = przyczyny_stats.get(przyczyna, 0) + 1
    
    # Statystyki White vs Blue Collar
    white_collar = sum(1 for r in rekrutacje if r.collar_type == "White")
    blue_collar = sum(1 for r in rekrutacje if r.collar_type == "Blue")
    
    # Statystyki Manager vs Non-Manager
    managers = sum(1 for r in rekrutacje if r.czy_manager)
    non_managers = sum(1 for r in rekrutacje if not r.czy_manager)
    
    # Statystyki źródeł rekrutacji
    zrodla_stats = {}
    for r in rekrutacje:
        if r.typ_zatrudnienia:
            zrodla = r.typ_zatrudnienia
            zrodla_stats[zrodla] = zrodla_stats.get(zrodla, 0) + 1
    
    # Wskaźnik skuteczności rekrutacji (% rekrutacji zakończonych zatrudnieniem)
    success_rate = round((z_zatrudnieniem / zamkniete * 100), 2) if zamkniete > 0 else 0
    
    # Wskaźnik rotacji (replacement vs new position)
    replacement_count = sum(1 for r in rekrutacje if r.przyczyna_rekrutacji == "Replacement")
    wskaznik_rotacji = round((replacement_count / total * 100), 2) if total > 0 else 0
    
    # Cost per hire (średnia liczba spotkań jako proxy dla kosztu)
    avg_spotkan_na_zatrudnienie = round(
        ((total_spotkan_rekruter + total_spotkan_hm) / total_zatrudnionych), 2
    ) if total_zatrudnionych > 0 else 0
    
    return {
        # Podstawowe metryki
        "total_rekrutacje": total,
        "otwarte": otwarte,
        "zamkniete": zamkniete,
        "z_zatrudnieniem": z_zatrudnieniem,
        
        # Time metrics
        "avg_ttf": avg_ttf,
        "median_ttf": median_ttf,
        "avg_tto": avg_tto,
        "median_tto": median_tto,
        "avg_czas_otwarcia": avg_czas_otwarcia,
        
        # Wskaźniki konwersji
        "total_cv_otrzymane": total_cv,
        "total_cv_odrzucone": total_cv_odrzucone,
        "total_spotkan": total_spotkan_rekruter + total_spotkan_hm,
        "total_ofert_zlozonych": total_ofert,
        "total_zatrudnionych": total_zatrudnionych,
        "total_ofert_odrzuconych_przez_kandydata": total_ofert_odrzuconych,
        
        "offer_acceptance_rate": offer_acceptance_rate,
        "cv_to_interview_rate": cv_to_interview_rate,
        "interview_to_offer_rate": interview_to_offer_rate,
        "success_rate": success_rate,
        "wskaznik_rotacji": wskaznik_rotacji,
        "avg_spotkan_na_zatrudnienie": avg_spotkan_na_zatrudnienie,
        
        # Rozbicie na kategorie
        "white_collar": white_collar,
        "blue_collar": blue_collar,
        "managers": managers,
        "non_managers": non_managers,
        
        # Statystyki szczegółowe
        "departamenty": departamenty_stats,
        "przyczyny": przyczyny_stats,
        "zrodla_rekrutacji": zrodla_stats,
    }


@app.get("/api/filtry")
def get_filtry(db: Session = Depends(get_db)):
    """Zwraca dostępne wartości dla filtrów"""
    departamenty = db.query(Rekrutacja.departament).distinct().all()
    dzialy = db.query(Rekrutacja.dzial).distinct().all()
    collar_types = db.query(Rekrutacja.collar_type).distinct().all()
    
    return {
        "departamenty": [d[0] for d in departamenty if d[0]],
        "dzialy": [d[0] for d in dzialy if d[0]],
        "collar_types": [c[0] for c in collar_types if c[0]]
    }


@app.get("/api/export")
def export_data(db: Session = Depends(get_db)):
    """Eksportuje wszystkie dane rekrutacji do JSON"""
    rekrutacje = db.query(Rekrutacja).all()
    
    data = []
    for r in rekrutacje:
        data.append({
            "id_referencyjne": r.id_referencyjne,
            "przyczyna_rekrutacji": r.przyczyna_rekrutacji,
            "replacement_za_kogo": r.replacement_za_kogo,
            "collar_type": r.collar_type,
            "czy_manager": r.czy_manager,
            "departament": r.departament,
            "dzial": r.dzial,
            "stanowisko": r.stanowisko,
            "miejsce_pracy": r.miejsce_pracy,
            "hiring_manager": r.hiring_manager,
            "data_otwarcia": r.data_otwarcia.isoformat() if r.data_otwarcia else None,
            "liczba_cv_otrzymana": r.liczba_cv_otrzymana,
            "liczba_cv_odrzucone_rekruter": r.liczba_cv_odrzucone_rekruter,
            "liczba_spotkan_rekruter": r.liczba_spotkan_rekruter,
            "liczba_spotkan_hiring_manager": r.liczba_spotkan_hiring_manager,
            "data_zamkniecia": r.data_zamkniecia.isoformat() if r.data_zamkniecia else None,
            "data_zatrudnienia": r.data_zatrudnienia.isoformat() if r.data_zatrudnienia else None,
            "typ_zatrudnienia": r.typ_zatrudnienia,
            "liczba_zatrudnionych": r.liczba_zatrudnionych,
            "liczba_odrzuconych_ofert_przez_kandydata": r.liczba_odrzuconych_ofert_przez_kandydata,
            "liczba_zlozonych_ofert": r.liczba_zlozonych_ofert,
            "komentarz": r.komentarz,
            "plec": r.plec
        })
    
    return JSONResponse(
        content={"rekrutacje": data, "exported_at": datetime.now().isoformat()},
        headers={
            "Content-Disposition": f"attachment; filename=rekrutacje_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        }
    )


@app.post("/api/import")
async def import_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Importuje dane rekrutacji z pliku JSON"""
    try:
        content = await file.read()
        data = json.loads(content)
        
        if "rekrutacje" not in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nieprawidłowy format pliku. Wymagana struktura: {rekrutacje: [...]}"
            )
        
        imported = 0
        skipped = 0
        errors = []
        
        for item in data["rekrutacje"]:
            try:
                # Sprawdź czy rekrutacja z tym ID już istnieje
                existing = db.query(Rekrutacja).filter(
                    Rekrutacja.id_referencyjne == item["id_referencyjne"]
                ).first()
                
                if existing:
                    skipped += 1
                    continue
                
                # Utwórz nową rekrutację
                rekrutacja = Rekrutacja(**item)
                db.add(rekrutacja)
                imported += 1
                
            except Exception as e:
                errors.append(f"Błąd dla ID {item.get('id_referencyjne', 'unknown')}: {str(e)}")
        
        db.commit()
        
        return {
            "success": True,
            "imported": imported,
            "skipped": skipped,
            "errors": errors
        }
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nieprawidłowy format JSON"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd importu: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
