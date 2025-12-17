# System Statystyk Rekrutacji

Aplikacja webowa do zarządzania i śledzenia procesów rekrutacyjnych w firmie.

## Funkcjonalności

- ✅ Dodawanie nowych rekrutacji z pełnymi danymi
- ✅ Edycja istniejących rekrutacji
- ✅ Przeglądanie szczegółowych informacji o rekrutacjach
- ✅ Usuwanie rekrutacji
- ✅ **Dashboard zarządczy z zaawansowanymi statystykami**
- ✅ **Automatyczne kalkulacje TTF (Time To Fill) i TTO (Time To Offer)**
- ✅ **Filtry czasowe i departamentowe**
- ✅ **Wykresy i wizualizacje danych**
- ✅ Responsywny interfejs użytkownika

## Śledzone Dane

Dla każdej rekrutacji system śledzi:

- **Podstawowe informacje:**
  - ID referencyjne
  - Przyczyna rekrutacji (Replacement, New Position, etc.)
  - Replacement za kogo (jeśli dotyczy)
  - Typ Collar (White/Blue)
  - Czy Manager
  - Departament, Dział, Stanowisko
  - Miejsce pracy
  - Hiring Manager

- **Daty:**
  - Data otwarcia rekrutacji
  - Data zamknięcia
  - Data zatrudnienia

- **Metryki CV i spotkań:**
  - Liczba otrzymanych CV
  - Liczba CV odrzuconych przez rekrutera
  - Liczba spotkań rekrutera
  - Liczba spotkań Hiring Managera

- **Wyniki rekrutacji:**
  - Typ zatrudnienia (Wewnętrzne/Zewnętrzne/Agencja/POL)
  - Liczba zatrudnionych
  - Liczba odrzuconych ofert przez kandydata
  - Liczba złożonych ofert

- **Dodatkowe:**
  - Płeć
  - Komentarz rekrutera

- **Metryki automatyczne:**
  - **TTF (Time To Fill)** - czas od otwarcia do zatrudnienia
  - **TTO (Time To Offer)** - czas od otwarcia do złożenia oferty
  - Czas otwarcia rekrutacji
  - Wskaźnik akceptacji ofert
  - Wskaźnik konwersji CV

## Dashboard Zarządczy

System zawiera zaawansowany dashboard ze statystykami kluczowymi dla zarządu:

### Metryki KPI:
- 📊 **Time To Fill (TTF)** - średni i mediana czasu zatrudnienia
- 🎯 **Time To Offer (TTO)** - średni i mediana czasu do oferty
- 📈 **Wskaźnik Akceptacji Ofert** - % zaakceptowanych ofert
- 🔄 **Konwersja CV → Spotkania** - efektywność screeningu
- 💼 **Wskaźnik Skuteczności** - % rekrutacji zakończonych sukcesem
- 🔁 **Wskaźnik Rotacji** - % replacements vs nowe stanowiska

### Wizualizacje:
- 📊 Rozkład rekrutacji po departamentach
- 🥧 Przyczyny rekrutacji (pie chart)
- 📈 White vs Blue Collar
- 🎯 Źródła rekrutacji (wewnętrzne/zewnętrzne/agencja)
- 🔄 Lejek konwersji rekrutacyjnej

### Filtry:
- 📅 Zakres dat (od-do)
- 🏢 Departament
- 👔 Typ Collar (White/Blue)

### Statystyki dla zarządu:
- Średnia liczba spotkań na zatrudnienie
- Wskaźniki konwersji na każdym etapie
- Porównanie efektywności departamentów
- Analiza źródeł rekrutacji
- Trendy i wzorce w procesach rekrutacyjnych

## Technologie

- **Backend:** Python 3.x, FastAPI, SQLAlchemy
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Baza danych:** SQLite

## Instalacja i Uruchomienie

### Wymagania

- Python 3.8 lub nowszy
- pip

### Instrukcja krok po kroku

1. **Zainstaluj zależności:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Uruchom serwer:**
   ```bash
   python -m backend.main
   ```
   
   Lub użyj skryptu pomocniczego:
   ```bash
   python run.py
   ```

3. **Otwórz aplikację w przeglądarce:**
   ```
   http://localhost:8000 - Lista rekrutacji
   http://localhost:8000/dashboard - Dashboard zarządczy
   ```

## Struktura Projektu

```
LYR_Rekrutacja/
├── backend/
│   ├── __init__.py
│   ├── database.py       # Modele bazy danych + kalkulacje metryk
│   ├── schemas.py        # Schematy Pydantic
│   └── main.py          # API FastAPI + endpoints
├── frontend/
│   ├── index.html       # Główny interfejs użytkownika
│   ├── dashboard.html   # Dashboard zarządczy
│   ├── style.css        # Stylowanie główne
│   ├── dashboard.css    # Stylowanie dashboardu
│   ├── app.js          # Logika frontendu - lista rekrutacji
│   └── dashboard.js    # Logika frontendu - dashboard
├── requirements.txt     # Zależności Python
├── run.py              # Skrypt uruchamiający
└── README.md           # Dokumentacja
```

## API Endpoints

### Rekrutacje

- `GET /api/rekrutacje` - Pobierz wszystkie rekrutacje
- `GET /api/rekrutacje/{id}` - Pobierz szczegóły rekrutacji
- `POST /api/rekrutacje` - Utwórz nową rekrutację
- `PUT /api/rekrutacje/{id}` - Zaktualizuj rekrutację
- `DELETE /api/rekrutacje/{id}` - Usuń rekrutację

### Statystyki

- `GET /api/statystyki` - Pobierz podstawowe statystyki
- `GET /api/dashboard` - Pobierz zaawansowane statystyki dla dashboardu (z filtrami)
  - Parametry: `data_od`, `data_do`, `departament`, `collar_type`
- `GET /api/filtry` - Pobierz dostępne wartości dla filtrów

## Dokumentacja API

Po uruchomieniu serwera, dokumentacja API jest dostępna pod adresami:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Rozwój

### Zaimplementowane statystyki dla zarządu (firma 660 osób):

✅ **Metryki Czasowe:**
- Time To Fill (TTF) - średni czas zatrudnienia
- Time To Offer (TTO) - średni czas do złożenia oferty
- Czas otwarcia rekrutacji

✅ **Wskaźniki Efektywności:**
- Wskaźnik akceptacji ofert (Offer Acceptance Rate)
- Konwersja CV → Spotkania
- Konwersja Spotkania → Oferty
- Wskaźnik skuteczności rekrutacji
- Średnia liczba spotkań na zatrudnienie

✅ **Analiza Strukturalna:**
- Rozkład po departamentach
- White vs Blue Collar
- Manager vs Non-Manager
- Źródła rekrutacji (wewnętrzne/zewnętrzne/agencja/POL)

✅ **Wskaźniki Strategiczne:**
- Wskaźnik rotacji (% replacements)
- Analiza przyczyn rekrutacji
- Porównanie efektywności departamentów

### Możliwe dalsze rozszerzenia:

- 💰 Cost per hire (z integracją kosztów agencji)
- 📊 Zaawansowane dashboardy z trendami czasowymi
- 📈 Eksport danych do Excel/CSV/PDF
- 🔍 Predykcje AI (przewidywanie TTF na podstawie danych historycznych)
- 👥 System użytkowników i role (rekruter/manager/HR director)
- 📧 Powiadomienia email o kluczowych wydarzeniach
- 🗃️ Migracja na PostgreSQL dla większych danych
- 📱 Aplikacja mobilna
- 🔗 Integracja z ATS (Applicant Tracking Systems)
- 📋 Quality of Hire metrics (ocena po okresie próbnym)
- 📊 Benchmark z danymi rynkowymi

## Licencja

Projekt stworzony dla celów rekrutacyjnych.
