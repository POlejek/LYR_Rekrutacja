# Instrukcja Wdrożenia na GitHub Pages

## ✅ Wykonane Kroki

1. ✅ Utworzony branch `gh-pages` z wersją statyczną aplikacji
2. ✅ Skopiowane pliki statyczne do głównego katalogu brancha
3. ✅ Commitowane i wysłane zmiany na GitHub

## 🚀 Konfiguracja GitHub Pages (wykonaj w przeglądarce)

1. **Przejdź do ustawień repozytorium:**
   - Otwórz https://github.com/POlejek/LYR_Rekrutacja
   - Kliknij **Settings** (Ustawienia)

2. **Skonfiguruj GitHub Pages:**
   - W menu po lewej stronie znajdź i kliknij **Pages**
   - W sekcji **Source** wybierz:
     - Branch: `gh-pages`
     - Folder: `/ (root)`
   - Kliknij **Save**

3. **Poczekaj na deployment:**
   - GitHub automatycznie wdroży aplikację
   - Proces zajmuje 1-3 minuty
   - Zobaczysz komunikat z linkiem do aplikacji

4. **Aplikacja będzie dostępna pod adresem:**
   ```
   https://polejek.github.io/LYR_Rekrutacja/
   ```

## 📝 Branch Structure

### Branch: `main`
Zawiera pełną aplikację z backendem:
- ✅ Backend FastAPI
- ✅ Baza danych SQLite
- ✅ Dashboard ze statystykami
- ✅ Pełna funkcjonalność
- ✅ Eksport/Import JSON

### Branch: `gh-pages`
Zawiera wersję statyczną (frontend-only):
- ✅ Działa bez backendu
- ✅ localStorage jako baza danych
- ✅ Eksport/Import JSON
- ✅ Podstawowe funkcje CRUD
- ❌ Brak dashboardu ze statystykami

## 🔄 Aktualizacja Wersji na GitHub Pages

Jeśli chcesz zaktualizować wersję na GitHub Pages:

```bash
# Przełącz się na branch gh-pages
git checkout gh-pages

# Skopiuj nowe pliki ze static-version
cp static-version/* .

# Commituj zmiany
git add .
git commit -m "Aktualizacja aplikacji"

# Wyślij na GitHub
git push origin gh-pages

# Wróć do brancha main
git checkout main
```

## 📊 Status Wdrożenia

| Komponent | Status | Branch |
|-----------|--------|--------|
| Aplikacja Full-Stack | ✅ Gotowa | `main` |
| Wersja Statyczna | ✅ Gotowa | `gh-pages` |
| GitHub Pages Config | ⏳ Wymaga konfiguracji | - |
| Deployment | ⏳ W trakcie | `gh-pages` |

## 🎯 Następne Kroki

1. ✅ Skonfiguruj GitHub Pages (patrz instrukcje powyżej)
2. ⏳ Poczekaj na deployment (1-3 minuty)
3. ✅ Przetestuj aplikację pod adresem GitHub Pages
4. ✅ Podziel się linkiem!

## 💡 Wskazówki

- **Dane testowe:** Użyj funkcji Import JSON aby załadować przykładowe dane
- **Backup:** Pamiętaj o regularnym eksportowaniu danych (dane w localStorage)
- **Udostępnianie:** Link GitHub Pages możesz udostępnić każdemu
- **Aktualizacje:** Każda zmiana w branchu `gh-pages` automatycznie zaktualizuje stronę

## 🔗 Przydatne Linki

- Repozytorium: https://github.com/POlejek/LYR_Rekrutacja
- Branch main: https://github.com/POlejek/LYR_Rekrutacja/tree/main
- Branch gh-pages: https://github.com/POlejek/LYR_Rekrutacja/tree/gh-pages
- Ustawienia Pages: https://github.com/POlejek/LYR_Rekrutacja/settings/pages
- Aplikacja: https://polejek.github.io/LYR_Rekrutacja/ (po konfiguracji)
