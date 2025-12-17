const API_BASE = '/api';

let currentFilters = {
    dataOd: null,
    dataDo: null,
    departament: null,
    collarType: null
};

let charts = {};

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    loadFiltersOptions();
    loadDashboardData();
});

// Załaduj opcje filtrów
async function loadFiltersOptions() {
    try {
        const response = await fetch(`${API_BASE}/filtry`);
        const filtry = await response.json();
        
        const departamentSelect = document.getElementById('filterDepartament');
        filtry.departamenty.forEach(dep => {
            const option = document.createElement('option');
            option.value = dep;
            option.textContent = dep;
            departamentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Błąd ładowania filtrów:', error);
    }
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

// Załaduj dane dashboardu
async function loadDashboardData() {
    try {
        const params = new URLSearchParams();
        if (currentFilters.dataOd) params.append('data_od', currentFilters.dataOd);
        if (currentFilters.dataDo) params.append('data_do', currentFilters.dataDo);
        if (currentFilters.departament) params.append('departament', currentFilters.departament);
        if (currentFilters.collarType) params.append('collar_type', currentFilters.collarType);
        
        const response = await fetch(`${API_BASE}/dashboard?${params.toString()}`);
        const data = await response.json();
        
        if (data.message) {
            alert(data.message);
            return;
        }
        
        updateKPIs(data);
        updateCharts(data);
        updateDetailedStats(data);
        updateDepartamentyTable(data);
    } catch (error) {
        console.error('Błąd ładowania danych:', error);
        alert('Nie udało się załadować danych dashboardu');
    }
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
    
    document.getElementById('kpiOfferAcceptance').textContent = `${data.offer_acceptance_rate}%`;
    document.getElementById('kpiCVConversion').textContent = `${data.cv_to_interview_rate}%`;
    document.getElementById('kpiSuccessRate').textContent = `${data.success_rate}%`;
}

// Aktualizuj wykresy
function updateCharts(data) {
    // Wykres departamentów
    updateDepartamentyChart(data.departamenty);
    
    // Wykres przyczyn
    updatePrzyczynyChart(data.przyczyny);
    
    // Wykres Collar
    updateCollarChart(data.white_collar, data.blue_collar);
    
    // Wykres źródeł
    updateZrodlaChart(data.zrodla_rekrutacji);
    
    // Wykres lejka
    updateFunnelChart(data);
}

// Wykres departamentów
function updateDepartamentyChart(departamenty) {
    const ctx = document.getElementById('departamentyChart');
    
    if (charts.departamenty) {
        charts.departamenty.destroy();
    }
    
    const labels = Object.keys(departamenty);
    const values = Object.values(departamenty).map(d => d.total);
    
    charts.departamenty = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Liczba rekrutacji',
                data: values,
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Wykres przyczyn
function updatePrzyczynyChart(przyczyny) {
    const ctx = document.getElementById('przyczynyChart');
    
    if (charts.przyczyny) {
        charts.przyczyny.destroy();
    }
    
    const labels = Object.keys(przyczyny);
    const values = Object.values(przyczyny);
    
    charts.przyczyny = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(231, 76, 60, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(241, 196, 15, 0.7)',
                    'rgba(155, 89, 182, 0.7)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Wykres Collar
function updateCollarChart(white, blue) {
    const ctx = document.getElementById('collarChart');
    
    if (charts.collar) {
        charts.collar.destroy();
    }
    
    charts.collar = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['White Collar', 'Blue Collar'],
            datasets: [{
                data: [white, blue],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(52, 73, 94, 0.7)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Wykres źródeł
function updateZrodlaChart(zrodla) {
    const ctx = document.getElementById('zrodlaChart');
    
    if (charts.zrodla) {
        charts.zrodla.destroy();
    }
    
    const labels = Object.keys(zrodla);
    const values = Object.values(zrodla);
    
    if (labels.length === 0) {
        labels.push('Brak danych');
        values.push(1);
    }
    
    charts.zrodla = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(26, 188, 156, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(241, 196, 15, 0.7)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Wykres lejka konwersji
function updateFunnelChart(data) {
    const ctx = document.getElementById('funnelChart');
    
    if (charts.funnel) {
        charts.funnel.destroy();
    }
    
    const stages = ['CV Otrzymane', 'Spotkania', 'Oferty Złożone', 'Zatrudnienia'];
    const values = [
        data.total_cv_otrzymane,
        data.total_spotkan,
        data.total_ofert_zlozonych,
        data.total_zatrudnionych
    ];
    
    charts.funnel = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stages,
            datasets: [{
                label: 'Liczba',
                data: values,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(241, 196, 15, 0.7)',
                    'rgba(231, 76, 60, 0.7)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Lejek pokazuje przepływ kandydatów przez proces rekrutacji'
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Aktualizuj szczegółowe statystyki
function updateDetailedStats(data) {
    document.getElementById('statCV').textContent = data.total_cv_otrzymane;
    document.getElementById('statSpotkan').textContent = data.total_spotkan;
    document.getElementById('statOfert').textContent = data.total_ofert_zlozonych;
    document.getElementById('statZatrudnien').textContent = data.total_zatrudnionych;
    document.getElementById('statRotacja').textContent = `${data.wskaznik_rotacji}%`;
    document.getElementById('statEfektywnosc').textContent = data.avg_spotkan_na_zatrudnienie;
}

// Aktualizuj tabelę departamentów
function updateDepartamentyTable(data) {
    const tbody = document.getElementById('departamentyTableBody');
    
    if (Object.keys(data.departamenty).length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Brak danych</td></tr>';
        return;
    }
    
    tbody.innerHTML = Object.entries(data.departamenty).map(([dept, stats]) => {
        const successRate = stats.zamkniete > 0 
            ? ((stats.z_zatrudnieniem / stats.zamkniete) * 100).toFixed(2) 
            : '0.00';
        
        return `
            <tr>
                <td><strong>${dept}</strong></td>
                <td>${stats.total}</td>
                <td>${stats.otwarte}</td>
                <td>${stats.zamkniete}</td>
                <td>${stats.z_zatrudnieniem}</td>
                <td>${successRate}%</td>
            </tr>
        `;
    }).join('');
}
