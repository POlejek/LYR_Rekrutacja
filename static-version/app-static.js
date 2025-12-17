// LocalStorage Storage Key
const STORAGE_KEY = 'rekrutacje_data';

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    loadRekrutacje();
    loadStatystyki();
    
    // Obsługa formularza
    document.getElementById('rekrutacjaForm').addEventListener('submit', handleFormSubmit);
});

// Inicjalizuj localStorage
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
}

// Pobierz dane z localStorage
function getData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

// Zapisz dane do localStorage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Pobierz i wyświetl statystyki
function loadStatystyki() {
    const rekrutacje = getData();
    const total = rekrutacje.length;
    const otwarte = rekrutacje.filter(r => !r.data_zamkniecia).length;
    const zamkniete = rekrutacje.filter(r => r.data_zamkniecia).length;
    
    document.getElementById('totalRekrutacje').textContent = total;
    document.getElementById('otwarteRekrutacje').textContent = otwarte;
    document.getElementById('zamknieteRekrutacje').textContent = zamkniete;
}

// Pobierz i wyświetl listę rekrutacji
function loadRekrutacje() {
    const rekrutacje = getData();
    const tbody = document.getElementById('rekrutacjeTableBody');
    
    if (rekrutacje.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Brak rekrutacji. Dodaj pierwszą rekrutację lub zaimportuj dane z JSON.</td></tr>';
        return;
    }
    
    tbody.innerHTML = rekrutacje.map((r, index) => {
        const daysOpen = calculateDaysOpen(r.data_otwarcia, r.data_zamkniecia);
        const daysOpenClass = daysOpen > 60 ? 'days-warning' : daysOpen > 45 ? 'days-alert' : 'days-ok';
        
        return `
        <tr>
            <td>${r.id_referencyjne}</td>
            <td>${r.stanowisko}</td>
            <td>${r.departament}</td>
            <td>${r.dzial}</td>
            <td>${r.hiring_manager}</td>
            <td>${formatDate(r.data_otwarcia)}</td>
            <td><span class="days-badge ${daysOpenClass}">${daysOpen} dni</span></td>
            <td>
                <span class="status-badge ${r.data_zamkniecia ? 'status-closed' : 'status-open'}">
                    ${r.data_zamkniecia ? 'Zamknięta' : 'Otwarta'}
                </span>
            </td>
            <td>
                <button class="btn btn-info" onclick="showDetails(${index})">👁️</button>
                <button class="btn btn-success" onclick="editRekrutacja(${index})">✏️</button>
                <button class="btn btn-danger" onclick="deleteRekrutacja(${index}, '${r.id_referencyjne}')">🗑️</button>
            </td>
        </tr>
        `;
    }).join('');
    
    loadStatystyki();
}

// Formatowanie daty
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
}

// Obliczanie liczby dni otwarcia rekrutacji
function calculateDaysOpen(dataOtwarcia, dataZamkniecia) {
    const startDate = new Date(dataOtwarcia);
    const endDate = dataZamkniecia ? new Date(dataZamkniecia) : new Date();
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Pokaż formularz dodawania
function showAddForm() {
    document.getElementById('formTitle').textContent = 'Dodaj Nową Rekrutację';
    document.getElementById('editId').value = '';
    document.getElementById('rekrutacjaForm').reset();
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('id_referencyjne').disabled = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Ukryj formularz
function hideForm() {
    document.getElementById('formContainer').style.display = 'none';
}

// Toggle pola replacement
function toggleReplacementField() {
    const przyczyna = document.getElementById('przyczyna_rekrutacji').value;
    const replacementGroup = document.getElementById('replacementGroup');
    
    if (przyczyna === 'Replacement') {
        replacementGroup.style.display = 'block';
    } else {
        replacementGroup.style.display = 'none';
        document.getElementById('replacement_za_kogo').value = '';
    }
}

// Obsługa wysłania formularza
function handleFormSubmit(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editId').value;
    const formData = getFormData();
    const rekrutacje = getData();
    
    if (editId !== '') {
        // Aktualizacja
        rekrutacje[parseInt(editId)] = formData;
        alert('Rekrutacja zaktualizowana!');
    } else {
        // Sprawdź duplikat ID
        if (rekrutacje.some(r => r.id_referencyjne === formData.id_referencyjne)) {
            alert(`Rekrutacja z ID ${formData.id_referencyjne} już istnieje!`);
            return;
        }
        // Dodawanie nowej
        rekrutacje.push(formData);
        alert('Rekrutacja dodana!');
    }
    
    saveData(rekrutacje);
    hideForm();
    loadRekrutacje();
}

// Pobierz dane z formularza
function getFormData() {
    const getValue = (id) => {
        const element = document.getElementById(id);
        return element.value || null;
    };
    
    const getNumberValue = (id) => {
        const value = document.getElementById(id).value;
        return value ? parseInt(value) : 0;
    };
    
    const getBoolValue = (id) => {
        const value = document.getElementById(id).value;
        return value === 'true';
    };
    
    return {
        id_referencyjne: getValue('id_referencyjne'),
        przyczyna_rekrutacji: getValue('przyczyna_rekrutacji'),
        replacement_za_kogo: getValue('replacement_za_kogo'),
        collar_type: getValue('collar_type'),
        czy_manager: getBoolValue('czy_manager'),
        departament: getValue('departament'),
        dzial: getValue('dzial'),
        stanowisko: getValue('stanowisko'),
        miejsce_pracy: getValue('miejsce_pracy'),
        hiring_manager: getValue('hiring_manager'),
        data_otwarcia: getValue('data_otwarcia'),
        liczba_cv_otrzymana: getNumberValue('liczba_cv_otrzymana'),
        liczba_cv_odrzucone_rekruter: getNumberValue('liczba_cv_odrzucone_rekruter'),
        liczba_spotkan_rekruter: getNumberValue('liczba_spotkan_rekruter'),
        liczba_spotkan_hiring_manager: getNumberValue('liczba_spotkan_hiring_manager'),
        data_zamkniecia: getValue('data_zamkniecia'),
        data_zatrudnienia: getValue('data_zatrudnienia'),
        typ_zatrudnienia: getValue('typ_zatrudnienia'),
        liczba_zatrudnionych: getNumberValue('liczba_zatrudnionych'),
        liczba_odrzuconych_ofert_przez_kandydata: getNumberValue('liczba_odrzuconych_ofert_przez_kandydata'),
        liczba_zlozonych_ofert: getNumberValue('liczba_zlozonych_ofert'),
        komentarz: getValue('komentarz'),
        plec: getValue('plec')
    };
}

// Edytuj rekrutację
function editRekrutacja(index) {
    const rekrutacje = getData();
    const rekrutacja = rekrutacje[index];
    
    // Wypełnij formularz
    document.getElementById('formTitle').textContent = 'Edytuj Rekrutację';
    document.getElementById('editId').value = index;
    document.getElementById('id_referencyjne').value = rekrutacja.id_referencyjne;
    document.getElementById('id_referencyjne').disabled = true;
    document.getElementById('przyczyna_rekrutacji').value = rekrutacja.przyczyna_rekrutacji;
    document.getElementById('replacement_za_kogo').value = rekrutacja.replacement_za_kogo || '';
    document.getElementById('collar_type').value = rekrutacja.collar_type;
    document.getElementById('czy_manager').value = rekrutacja.czy_manager.toString();
    document.getElementById('departament').value = rekrutacja.departament;
    document.getElementById('dzial').value = rekrutacja.dzial;
    document.getElementById('stanowisko').value = rekrutacja.stanowisko;
    document.getElementById('miejsce_pracy').value = rekrutacja.miejsce_pracy;
    document.getElementById('hiring_manager').value = rekrutacja.hiring_manager;
    document.getElementById('data_otwarcia').value = rekrutacja.data_otwarcia;
    document.getElementById('liczba_cv_otrzymana').value = rekrutacja.liczba_cv_otrzymana;
    document.getElementById('liczba_cv_odrzucone_rekruter').value = rekrutacja.liczba_cv_odrzucone_rekruter;
    document.getElementById('liczba_spotkan_rekruter').value = rekrutacja.liczba_spotkan_rekruter;
    document.getElementById('liczba_spotkan_hiring_manager').value = rekrutacja.liczba_spotkan_hiring_manager;
    document.getElementById('data_zamkniecia').value = rekrutacja.data_zamkniecia || '';
    document.getElementById('data_zatrudnienia').value = rekrutacja.data_zatrudnienia || '';
    document.getElementById('typ_zatrudnienia').value = rekrutacja.typ_zatrudnienia || '';
    document.getElementById('liczba_zatrudnionych').value = rekrutacja.liczba_zatrudnionych;
    document.getElementById('liczba_odrzuconych_ofert_przez_kandydata').value = rekrutacja.liczba_odrzuconych_ofert_przez_kandydata;
    document.getElementById('liczba_zlozonych_ofert').value = rekrutacja.liczba_zlozonych_ofert;
    document.getElementById('komentarz').value = rekrutacja.komentarz || '';
    document.getElementById('plec').value = rekrutacja.plec || '';
    
    toggleReplacementField();
    document.getElementById('formContainer').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Usuń rekrutację
function deleteRekrutacja(index, idRef) {
    if (!confirm(`Czy na pewno chcesz usunąć rekrutację ${idRef}?`)) {
        return;
    }
    
    const rekrutacje = getData();
    rekrutacje.splice(index, 1);
    saveData(rekrutacje);
    loadRekrutacje();
    alert('Rekrutacja usunięta!');
}

// Pokaż szczegóły rekrutacji
function showDetails(index) {
    const rekrutacje = getData();
    const r = rekrutacje[index];
    
    const detailsHTML = `
        <div class="detail-row">
            <div class="detail-label">ID Referencyjne:</div>
            <div class="detail-value">${r.id_referencyjne}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Przyczyna Rekrutacji:</div>
            <div class="detail-value">${r.przyczyna_rekrutacji}</div>
        </div>
        ${r.replacement_za_kogo ? `
        <div class="detail-row">
            <div class="detail-label">Replacement za kogo:</div>
            <div class="detail-value">${r.replacement_za_kogo}</div>
        </div>` : ''}
        <div class="detail-row">
            <div class="detail-label">Typ Collar:</div>
            <div class="detail-value">${r.collar_type}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Stanowisko:</div>
            <div class="detail-value">${r.czy_manager ? 'Manager' : 'Nie Manager'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Departament:</div>
            <div class="detail-value">${r.departament}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Dział:</div>
            <div class="detail-value">${r.dzial}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Stanowisko:</div>
            <div class="detail-value">${r.stanowisko}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Miejsce Pracy:</div>
            <div class="detail-value">${r.miejsce_pracy}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Hiring Manager:</div>
            <div class="detail-value">${r.hiring_manager}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Data Otwarcia:</div>
            <div class="detail-value">${formatDate(r.data_otwarcia)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Liczba CV Otrzymana:</div>
            <div class="detail-value">${r.liczba_cv_otrzymana}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Liczba CV Odrzucone (Rekruter):</div>
            <div class="detail-value">${r.liczba_cv_odrzucone_rekruter}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Liczba Spotkań (Rekruter):</div>
            <div class="detail-value">${r.liczba_spotkan_rekruter}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Liczba Spotkań (Hiring Manager):</div>
            <div class="detail-value">${r.liczba_spotkan_hiring_manager}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Data Zamknięcia:</div>
            <div class="detail-value">${formatDate(r.data_zamkniecia)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Data Zatrudnienia:</div>
            <div class="detail-value">${formatDate(r.data_zatrudnienia)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Typ Zatrudnienia:</div>
            <div class="detail-value">${r.typ_zatrudnienia || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Liczba Zatrudnionych:</div>
            <div class="detail-value">${r.liczba_zatrudnionych}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Liczba Odrzuconych Ofert (Kandydat):</div>
            <div class="detail-value">${r.liczba_odrzuconych_ofert_przez_kandydata}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Liczba Złożonych Ofert:</div>
            <div class="detail-value">${r.liczba_zlozonych_ofert}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Płeć:</div>
            <div class="detail-value">${r.plec || '-'}</div>
        </div>
        ${r.komentarz ? `
        <div class="detail-row">
            <div class="detail-label">Komentarz:</div>
            <div class="detail-value">${r.komentarz}</div>
        </div>` : ''}
    `;
    
    document.getElementById('detailsContent').innerHTML = detailsHTML;
    document.getElementById('detailsModal').style.display = 'flex';
}

// Zamknij modal szczegółów
function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Eksport danych do JSON
function exportData() {
    const rekrutacje = getData();
    const data = {
        rekrutacje: rekrutacje,
        exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `rekrutacje_export_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    alert('Dane zostały wyeksportowane!');
}

// Import danych z JSON
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm('Czy na pewno chcesz zaimportować dane? Duplikaty zostaną pominięte.')) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.rekrutacje || !Array.isArray(data.rekrutacje)) {
                alert('Nieprawidłowy format pliku. Wymagana struktura: {rekrutacje: [...]}');
                return;
            }
            
            const currentData = getData();
            let imported = 0;
            let skipped = 0;
            
            data.rekrutacje.forEach(item => {
                // Sprawdź duplikat
                if (!currentData.some(r => r.id_referencyjne === item.id_referencyjne)) {
                    currentData.push(item);
                    imported++;
                } else {
                    skipped++;
                }
            });
            
            saveData(currentData);
            loadRekrutacje();
            
            let message = `Import zakończony!\n\n`;
            message += `Zaimportowano: ${imported}\n`;
            message += `Pominięto (duplikaty): ${skipped}`;
            alert(message);
            
        } catch (error) {
            console.error('Błąd importu:', error);
            alert('Błąd importu: Nieprawidłowy format JSON');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// Wyczyść wszystkie dane
function clearAllData() {
    if (!confirm('Czy na pewno chcesz usunąć WSZYSTKIE dane? Ta operacja jest nieodwracalna!')) {
        return;
    }
    
    if (!confirm('Ostatnie ostrzeżenie! Wszystkie dane zostaną utracone. Kontynuować?')) {
        return;
    }
    
    localStorage.removeItem(STORAGE_KEY);
    initializeStorage();
    loadRekrutacje();
    alert('Wszystkie dane zostały usunięte');
}
