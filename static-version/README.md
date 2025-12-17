# System Statystyk Rekrutacji - Wersja Demo

🧪 **Wersja demonstracyjna** - działa w pełni po stronie klienta (frontend-only)

## Funkcjonalności

- ✅ Pełna funkcjonalność aplikacji bez potrzeby backendu
- ✅ Dane przechowywane w localStorage przeglądarki
- ✅ Eksport danych do JSON
- ✅ Import danych z JSON
- ✅ Wszystkie funkcje dodawania, edycji, usuwania rekrutacji
- ✅ Obliczanie dni otwarcia rekrutacji
- ✅ Kolorowe oznaczenia statusu

## Jak używać

1. Otwórz `index.html` w przeglądarce
2. Dodaj rekrutacje przez formularz
3. Eksportuj dane do JSON aby je zachować
4. Importuj dane z JSON aby je przywrócić

## Uwaga

⚠️ Dane są przechowywane lokalnie w przeglądarce. Jeśli wyczyszczysz cache przeglądarki, dane zostaną utracone. Pamiętaj o regularnym eksportowaniu danych!

## Deployment na GitHub Pages

Ta wersja jest gotowa do wdrożenia na GitHub Pages:

1. Wgraj pliki do brancha `gh-pages`
2. Skonfiguruj GitHub Pages w ustawieniach repozytorium
3. Aplikacja będzie dostępna pod adresem: `https://[username].github.io/[repository]/`

## Pliki

- `index.html` - Główna strona aplikacji
- `app-static.js` - Logika aplikacji z localStorage
- `style.css` - Style CSS

## Różnice względem wersji serwerowej

- ❌ Brak backendu Python/FastAPI
- ❌ Brak bazy danych SQL
- ❌ Brak dashboardu ze statystykami
- ✅ Działa offline
- ✅ Nie wymaga instalacji
- ✅ Gotowe do hostingu statycznego
