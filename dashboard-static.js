// Dashboard - wersja statyczna z localStorage

const STORAGE_KEY = 'rekrutacje_data';

let currentFilters = {
    dataOd: null,
    dataDo: null,
    departament: null,
    collarType: null
};

let charts = {};

// Pobranie danych z localStorage
function getData() {
    console.log('Checking localStorage for key:', STORAGE_KEY);
    const rawData = localStorage.getItem(STORAGE_KEY);
    console.log('Raw localStorage data:', rawData);
    const data = rawData ? JSON.parse(rawData) : [];
    console.log('Parsed data:', data);
    return data;
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDateRange();
    loadFiltersOptions();
    loadDashboardData();
});

// Ustaw domyślny zakres dat na maksymalny
function setDefaultDateRange() {
    const data = getData();
    if (data.length === 0) return;
    
    const daty = data.map(r => r.data_otwarcia).filter(Boolean).sort();
    if (daty.length > 0) {
        document.getElementById('dataOd').value = daty[0];
        document.getElementById('dataDo').value = daty[daty.length - 1];
    }
}

// Załaduj opcje filtrów
function loadFiltersOptions() {
    const data = getData();
    const departamenty = [...new Set(data.map(r => r.departament).filter(Boolean))].sort();
    
    const departamentSelect = document.getElementById('filterDepartament');
    departamenty.forEach(dep => {
        const option = document.createElement('option');
        option.value = dep;
        option.textContent = dep;
        departamentSelect.appendChild(option);
    });
}

// Zastosuj filtry
function applyFilters() {
    currentFilters.dataOd = document.getElementById('dataOd').value || null;
    currentFilters.dataDo = document.getElementById('dataDo').value || null;
    currentFilters.departament = document.getElementById('filterDepartament').value || null;
    currentFilters.collarType = document.getElementById('filterCollar').value || null;
    
    loadDashboardData();
}

// Resetuj filtry
function resetFilters() {
    document.getElementById('dataOd').value = '';
    document.getElementById('dataDo').value = '';
    document.getElementById('filterDepartament').value = '';
    document.getElementById('filterCollar').value = '';
    
    currentFilters = {
        dataOd: null,
        dataDo: null,
        departament: null,
        collarType: null
    };
    
    loadDashboardData();
}

// Kalkulacja metryk
function calculateMetrics(rekrutacje) {
    return rekrutacje.map(r => {
        const ttf = r.data_zatrudnienia && r.data_otwarcia ? 
            Math.floor((new Date(r.data_zatrudnienia) - new Date(r.data_otwarcia)) / (1000 * 60 * 60 * 24)) : null;
        
        const tto = r.data_zamkniecia && r.data_otwarcia ? 
            Math.floor((new Date(r.data_zamkniecia) - new Date(r.data_otwarcia)) / (1000 * 60 * 60 * 24)) : null;
        
        const wskaznik_akceptacji = r.liczba_zlozonych_ofert > 0 ? 
            ((r.liczba_zlozonych_ofert - (r.liczba_odrzuconych_ofert || 0)) / r.liczba_zlozonych_ofert * 100).toFixed(1) : null;
        
        const wskaznik_konwersji = r.liczba_otrzymanych_cv > 0 ? 
            ((r.liczba_spotkan_rekrutera + r.liczba_spotkan_hm) / r.liczba_otrzymanych_cv * 100).toFixed(1) : null;
        
        return { ...r, ttf, tto, wskaznik_akceptacji, wskaznik_konwersji };
    });
}

// Filtruj dane
function filterData(data) {
    let filtered = [...data];
    
    if (currentFilters.dataOd) {
        filtered = filtered.filter(r => r.data_otwarcia >= currentFilters.dataOd);
    }
    if (currentFilters.dataDo) {
        filtered = filtered.filter(r => r.data_otwarcia <= currentFilters.dataDo);
    }
    if (currentFilters.departament) {
        filtered = filtered.filter(r => r.departament === currentFilters.departament);
    }
    if (currentFilters.collarType) {
        filtered = filtered.filter(r => r.typ_collar === currentFilters.collarType);
    }
    
    return filtered;
}

// Załaduj dane dashboardu
function loadDashboardData() {
    const allData = getData();
    
    console.log('All data:', allData.length);
    
    if (allData.length === 0) {
        // Brak danych w localStorage - pokaż komunikat
        document.querySelectorAll('.stat-value').forEach(el => el.textContent = '0');
        alert('Brak danych w systemie. Dodaj rekrutacje lub zaimportuj dane z pliku JSON.');
        return;
    }
    
    const metricsData = calculateMetrics(allData);
    console.log('After metrics:', metricsData.length);
    
    const data = filterData(metricsData);
    console.log('After filters:', data.length);
    
    if (data.length === 0) {
        // Brak danych dla wybranych filtrów - pokaż zerowe wartości
        document.querySelectorAll('.stat-value').forEach(el => el.textContent = '0');
        document.getElementById('departamentyTableBody').innerHTML = '<tr><td colspan="6" class="text-center">Brak danych dla wybranych filtrów</td></tr>';
        
        // Wyczyść wykresy
        Object.values(charts).forEach(chart => chart.destroy());
        charts = {};
        return;
    }
    
    const dashboardData = calculateDashboardStats(data);
    
    updateKPIs(dashboardData);
    updateCharts(dashboardData);
    updateDetailedStats(dashboardData);
    updateDepartamentyTable(dashboardData);
}

// Oblicz statystyki dashboardu
function calculateDashboardStats(data) {
    const total = data.length;
    const otwarte = data.filter(r => !r.data_zamkniecia).length;
    const zZatrudnieniem = data.filter(r => r.liczba_zatrudnionych > 0).length;
    
    const ttfValues = data.filter(r => r.ttf !== null).map(r => r.ttf);
    const ttoValues = data.filter(r => r.tto !== null).map(r => r.tto);
    
    const avg_ttf = ttfValues.length > 0 ? (ttfValues.reduce((a, b) => a + b, 0) / ttfValues.length).toFixed(1) : null;
    const avg_tto = ttoValues.length > 0 ? (ttoValues.reduce((a, b) => a + b, 0) / ttoValues.length).toFixed(1) : null;
    
    const median_ttf = ttfValues.length > 0 ? getMedian(ttfValues).toFixed(1) : null;
    const median_tto = ttoValues.length > 0 ? getMedian(ttoValues).toFixed(1) : null;
    
    const totalOferty = data.reduce((sum, r) => sum + (r.liczba_zlozonych_ofert || 0), 0);
    const totalOdrzucone = data.reduce((sum, r) => sum + (r.liczba_odrzuconych_ofert || 0), 0);
    const wskaznik_akceptacji = totalOferty > 0 ? ((totalOferty - totalOdrzucone) / totalOferty * 100).toFixed(1) : 0;
    
    const totalCV = data.reduce((sum, r) => sum + (r.liczba_otrzymanych_cv || 0), 0);
    const totalSpotkan = data.reduce((sum, r) => sum + (r.liczba_spotkan_rekrutera || 0) + (r.liczba_spotkan_hm || 0), 0);
    const konwersja_cv = totalCV > 0 ? (totalSpotkan / totalCV * 100).toFixed(1) : 0;
    
    const wskaznik_skutecznosci = total > 0 ? (zZatrudnieniem / total * 100).toFixed(1) : 0;
    
    const replacements = data.filter(r => r.przyczyna_rekrutacji === 'Replacement').length;
    const wskaznik_rotacji = total > 0 ? (replacements / total * 100).toFixed(1) : 0;
    
    const avg_spotkan = zZatrudnieniem > 0 ? (totalSpotkan / zZatrudnieniem).toFixed(1) : 0;
    
    // Rozkład po departamentach
    const departamenty = {};
    data.forEach(r => {
        if (!departamenty[r.departament]) {
            departamenty[r.departament] = 0;
        }
        departamenty[r.departament]++;
    });
    
    // Przyczyny rekrutacji
    const przyczyny = {};
    data.forEach(r => {
        if (!przyczyny[r.przyczyna_rekrutacji]) {
            przyczyny[r.przyczyna_rekrutacji] = 0;
        }
        przyczyny[r.przyczyna_rekrutacji]++;
    });
    
    // Collar type
    const collar = { 'White': 0, 'Blue': 0 };
    data.forEach(r => {
        if (collar[r.typ_collar] !== undefined) {
            collar[r.typ_collar]++;
        }
    });
    
    // Typ zatrudnienia
    const typZatrudnienia = {};
    data.forEach(r => {
        if (r.typ_zatrudnienia) {
            if (!typZatrudnienia[r.typ_zatrudnienia]) {
                typZatrudnienia[r.typ_zatrudnienia] = 0;
            }
            typZatrudnienia[r.typ_zatrudnienia]++;
        }
    });
    
    return {
        total_rekrutacje: total,
        otwarte: otwarte,
        z_zatrudnieniem: zZatrudnieniem,
        avg_ttf,
        median_ttf,
        avg_tto,
        median_tto,
        wskaznik_akceptacji_ofert: wskaznik_akceptacji,
        konwersja_cv_spotkania: konwersja_cv,
        wskaznik_skutecznosci: wskaznik_skutecznosci,
        wskaznik_rotacji: wskaznik_rotacji,
        avg_spotkan_na_zatrudnienie: avg_spotkan,
        rozklad_departamenty: departamenty,
        przyczyny_rekrutacji: przyczyny,
        rozklad_collar: collar,
        typ_zatrudnienia: typZatrudnienia,
        rekrutacje: data
    };
}

function getMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Aktualizuj KPI
function updateKPIs(data) {
    document.getElementById('kpiTotal').textContent = data.total_rekrutacje;
    document.getElementById('kpiOtwarte').textContent = data.otwarte;
    document.getElementById('kpiZatrudnienie').textContent = data.z_zatrudnieniem;
    
    document.getElementById('kpiTTF').textContent = data.avg_ttf ? `${data.avg_ttf}` : 'N/A';
    document.getElementById('kpiTTFMedian').textContent = data.median_ttf ? `${data.median_ttf}` : 'N/A';
    
    document.getElementById('kpiTTO').textContent = data.avg_tto ? `${data.avg_tto}` : 'N/A';
    document.getElementById('kpiTTOMedian').textContent = data.median_tto ? `${data.median_tto}` : 'N/A';
    
    document.getElementById('kpiAkceptacja').textContent = `${data.wskaznik_akceptacji_ofert}%`;
    document.getElementById('kpiKonwersja').textContent = `${data.konwersja_cv_spotkania}%`;
    document.getElementById('kpiSkutecznosc').textContent = `${data.wskaznik_skutecznosci}%`;
    document.getElementById('kpiRotacja').textContent = `${data.wskaznik_rotacji}%`;
    document.getElementById('kpiAvgSpotkan').textContent = data.avg_spotkan_na_zatrudnienie;
}

// Aktualizuj wykresy
function updateCharts(data) {
    updateDepartamentyChart(data.rozklad_departamenty);
    updatePrzyczinyChart(data.przyczyny_rekrutacji);
    updateCollarChart(data.rozklad_collar);
    updateTypZatrudnieniaChart(data.typ_zatrudnienia);
    updateLejekChart(data);
}

function updateDepartamentyChart(departamenty) {
    const ctx = document.getElementById('chartDepartamenty').getContext('2d');
    
    if (charts.departamenty) {
        charts.departamenty.destroy();
    }
    
    charts.departamenty = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(departamenty),
            datasets: [{
                label: 'Liczba rekrutacji',
                data: Object.values(departamenty),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function updatePrzyczinyChart(przyczyny) {
    const ctx = document.getElementById('chartPrzyczyny').getContext('2d');
    
    if (charts.przyczyny) {
        charts.przyczyny.destroy();
    }
    
    const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)'
    ];
    
    charts.przyczyny = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(przyczyny),
            datasets: [{
                data: Object.values(przyczyny),
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateCollarChart(collar) {
    const ctx = document.getElementById('chartCollar').getContext('2d');
    
    if (charts.collar) {
        charts.collar.destroy();
    }
    
    charts.collar = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(collar),
            datasets: [{
                data: Object.values(collar),
                backgroundColor: [
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(54, 162, 235, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateTypZatrudnieniaChart(typZatrudnienia) {
    const ctx = document.getElementById('chartTypZatrudnienia').getContext('2d');
    
    if (charts.typZatrudnienia) {
        charts.typZatrudnienia.destroy();
    }
    
    const colors = [
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 99, 132, 0.7)'
    ];
    
    charts.typZatrudnienia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(typZatrudnienia),
            datasets: [{
                label: 'Źródła rekrutacji',
                data: Object.values(typZatrudnienia),
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function updateLejekChart(data) {
    const ctx = document.getElementById('chartLejek').getContext('2d');
    
    if (charts.lejek) {
        charts.lejek.destroy();
    }
    
    const totalCV = data.rekrutacje.reduce((sum, r) => sum + (r.liczba_otrzymanych_cv || 0), 0);
    const totalSpotkan = data.rekrutacje.reduce((sum, r) => sum + (r.liczba_spotkan_rekrutera || 0) + (r.liczba_spotkan_hm || 0), 0);
    const totalOfert = data.rekrutacje.reduce((sum, r) => sum + (r.liczba_zlozonych_ofert || 0), 0);
    const totalZatrudnionych = data.rekrutacje.reduce((sum, r) => sum + (r.liczba_zatrudnionych || 0), 0);
    
    charts.lejek = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['CV', 'Spotkania', 'Oferty', 'Zatrudnienia'],
            datasets: [{
                label: 'Lejek rekrutacyjny',
                data: [totalCV, totalSpotkan, totalOfert, totalZatrudnionych],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 75, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

// Aktualizuj szczegółowe statystyki
function updateDetailedStats(data) {
    const totalCV = data.rekrutacje.reduce((sum, r) => sum + (r.liczba_otrzymanych_cv || 0), 0);
    const totalSpotkan = data.rekrutacje.reduce((sum, r) => sum + (r.liczba_spotkan_rekrutera || 0) + (r.liczba_spotkan_hm || 0), 0);
    const totalOfert = data.rekrutacje.reduce((sum, r) => sum + (r.liczba_zlozonych_ofert || 0), 0);
    const totalZatrudnionych = data.rekrutacje.reduce((sum, r) => sum + (r.liczba_zatrudnionych || 0), 0);
    
    const konwersjaCvSpotkania = totalCV > 0 ? (totalSpotkan / totalCV * 100).toFixed(1) : 0;
    const konwersjaSpotkaniOferta = totalSpotkan > 0 ? (totalOfert / totalSpotkan * 100).toFixed(1) : 0;
    const konwersjaOfertaZatrudnienie = totalOfert > 0 ? (totalZatrudnionych / totalOfert * 100).toFixed(1) : 0;
    
    document.getElementById('detailedTotalCV').textContent = totalCV;
    document.getElementById('detailedTotalSpotkan').textContent = totalSpotkan;
    document.getElementById('detailedTotalOfert').textContent = totalOfert;
    document.getElementById('detailedTotalZatrudnionych').textContent = totalZatrudnionych;
    document.getElementById('detailedKonwersjaCvSpotkania').textContent = `${konwersjaCvSpotkania}%`;
    document.getElementById('detailedKonwersjaSpotkaniOferta').textContent = `${konwersjaSpotkaniOferta}%`;
    document.getElementById('detailedKonwersjaOfertaZatrudnienie').textContent = `${konwersjaOfertaZatrudnienie}%`;
}

// Aktualizuj tabelę departamentów
function updateDepartamentyTable(data) {
    const tbody = document.getElementById('departamentyTableBody');
    tbody.innerHTML = '';
    
    const departamentyStats = {};
    
    data.rekrutacje.forEach(r => {
        if (!departamentyStats[r.departament]) {
            departamentyStats[r.departament] = {
                total: 0,
                zatrudnienia: 0,
                ttfSum: 0,
                ttfCount: 0,
                cvSum: 0
            };
        }
        
        const stats = departamentyStats[r.departament];
        stats.total++;
        if (r.liczba_zatrudnionych > 0) stats.zatrudnienia++;
        if (r.ttf) {
            stats.ttfSum += r.ttf;
            stats.ttfCount++;
        }
        stats.cvSum += r.liczba_otrzymanych_cv || 0;
    });
    
    Object.entries(departamentyStats).forEach(([dep, stats]) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${dep}</td>
            <td>${stats.total}</td>
            <td>${stats.zatrudnienia}</td>
            <td>${stats.ttfCount > 0 ? (stats.ttfSum / stats.ttfCount).toFixed(1) : 'N/A'}</td>
            <td>${(stats.cvSum / stats.total).toFixed(1)}</td>
            <td>${stats.total > 0 ? (stats.zatrudnienia / stats.total * 100).toFixed(1) : 0}%</td>
        `;
    });
}
