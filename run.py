# Script do uruchomienia aplikacji
import subprocess
import sys
import os

def main():
    print("=" * 50)
    print("System Statystyk Rekrutacji")
    print("=" * 50)
    print()
    
    # Sprawdź czy dependencies są zainstalowane
    print("Sprawdzanie zależności...")
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        print("✓ Wszystkie zależności zainstalowane")
    except ImportError:
        print("! Niektóre zależności nie są zainstalowane")
        print("Instalowanie zależności...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Zależności zainstalowane")
    
    print()
    print("Uruchamianie serwera...")
    print("=" * 50)
    print()
    print("Aplikacja będzie dostępna pod adresem:")
    print("  http://localhost:8000")
    print()
    print("Dokumentacja API:")
    print("  http://localhost:8000/docs")
    print()
    print("Naciśnij Ctrl+C aby zatrzymać serwer")
    print("=" * 50)
    print()
    
    # Uruchom serwer
    os.system(f"{sys.executable} -m backend.main")

if __name__ == "__main__":
    main()
