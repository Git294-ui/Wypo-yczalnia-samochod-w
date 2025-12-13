document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicjalizacja danych
    if (!localStorage.getItem('cargarden_db')) {
        if (typeof initDemoData === 'function') initDemoData();
    }

    const db = JSON.parse(localStorage.getItem('cargarden_db'));
    const routes = (typeof getRoutes === 'function') ? getRoutes() : {}; // Pobranie tras z demo_data.js

    let currentCarId = null;
    let simulationInterval = null;
    let map = null;
    let carMarkers = {}; 

    // Konfiguracja stanu aut (pozycja na trasie) - przechowywana w pamięci RAM JS (resetuje się po F5)
    // To pozwala na płynną animację bez zarzynania localStorage
    const carStates = {}; 

    // --- ELEMENTY DOM ---
    const carListEl = document.getElementById('car-list');
    const carNameEl = document.getElementById('car-name');
    const statusBadgeEl = document.getElementById('car-status-badge');
    const selectedCarImg = document.getElementById('selected-car-img');
    
    // Telemetria
    const speedValEl = document.getElementById('speed-val');
    const speedBarEl = document.getElementById('speed-bar');
    const fuelValEl = document.getElementById('fuel-val');
    const fuelBarEl = document.getElementById('fuel-bar');
    const odoValEl = document.getElementById('odometer-val');
    const latEl = document.getElementById('geo-lat');
    const lngEl = document.getElementById('geo-lng');
    const actionBtn = document.getElementById('toggle-rent-btn');

    // --- 2. INICJALIZACJA MAPY ---
    function initMap() {
        map = L.map('map-connect').setView([52.237049, 21.017532], 13); // Centrum Warszawy

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            maxZoom: 19
        }).addTo(map);
    }

    // --- 3. PRZYGOTOWANIE STANU POJAZDÓW ---
    db.cars.forEach(car => {
        // Inicjalizujemy stan symulacji dla każdego auta
        const route = routes[car.routeId] || routes['centrum']; // Domyślna trasa jeśli brak
        
        carStates[car.id] = {
            currentPointIndex: 0,   // Do którego punktu jedzie
            nextPointIndex: 1,
            progress: 0,            // Postęp między punktami (0.0 - 1.0)
            lat: route[0][0],       // Aktualna pozycja
            lng: route[0][1],
            speed: car.speed || 0,
            fuel: car.fuel || 80,
            odometer: car.odometer || 12000,
            route: route,           // Przypisana tablica współrzędnych
            status: car.status
        };
    });

    // --- 4. TWORZENIE MARKERÓW ---
    function renderMarkers() {
        db.cars.forEach(car => {
            const state = carStates[car.id];
            
            // Kolor zależny od statusu
            let color = state.status === 'rented' ? '#d1007d' : '#39ff14'; 
            if(state.status === 'maintenance') color = 'orange';

            const customIcon = L.divIcon({
                className: 'custom-car-marker',
                html: `<div id="marker-icon-${car.id}" style="
                    background-color: ${color};
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 15px ${color};
                    transition: background-color 0.3s, box-shadow 0.3s;
                "></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            });

            const marker = L.marker([state.lat, state.lng], {icon: customIcon}).addTo(map);
            marker.on('click', () => selectCar(car.id));
            carMarkers[car.id] = marker;
        });
    }

    // --- 5. AKTUALIZACJA LISTY I INTERFEJSU ---
    function renderCarList() {
        carListEl.innerHTML = '';
        db.cars.forEach(car => {
            const state = carStates[car.id];
            const item = document.createElement('div');
            item.className = `car-item ${car.id === currentCarId ? 'active' : ''}`;
            item.onclick = () => selectCar(car.id);
            
            const statusClass = state.status === 'available' ? 'available' : 
                                state.status === 'rented' ? 'rented' : 'maintenance';
            
            const bgImage = car.image ? `background-image: url('${car.image}');` : '';

            item.innerHTML = `
                <div class="list-thumb" style="${bgImage}"></div>
                <div class="car-item-info">
                    <h4>${car.model}</h4>
                    <span style="font-size:0.7rem; color:#666;">ID: ${car.id}</span>
                </div>
                <div class="status-dot ${statusClass}"></div>
            `;
            carListEl.appendChild(item);
        });
    }

    function selectCar(id) {
        currentCarId = id;
        renderCarList();
        updateDashboardView();
        
        // FlyTo do wybranego auta
        const state = carStates[id];
        if (state && map) {
            map.flyTo([state.lat, state.lng], 14, { duration: 1.0 });
        }
    }

    function updateDashboardView() {
        const car = db.cars.find(c => c.id === currentCarId);
        if (!car) return;
        
        const state = carStates[car.id]; // Bierzemy dane live ze stanu symulacji

        carNameEl.innerText = car.model;
        
        if (car.image) {
            selectedCarImg.style.display = 'block';
            selectedCarImg.style.backgroundImage = `url('${car.image}')`;
        } else {
            selectedCarImg.style.display = 'none';
        }

        if (state.status === 'available') {
            statusBadgeEl.innerText = "DOSTĘPNY";
            statusBadgeEl.style.color = "#39ff14";
            statusBadgeEl.style.borderColor = "#39ff14";
            actionBtn.innerText = "Rozpocznij Jazdę (Demo)";
            actionBtn.className = "btn-primary full-width";
        } else if (state.status === 'rented') {
            statusBadgeEl.innerText = "W TRASIE";
            statusBadgeEl.style.color = "#d1007d";
            statusBadgeEl.style.borderColor = "#d1007d";
            actionBtn.innerText = "Zatrzymaj Pojazd";
            actionBtn.className = "btn-outline full-width";
        } else {
            statusBadgeEl.innerText = "SERWIS";
            statusBadgeEl.style.color = "orange";
            statusBadgeEl.style.borderColor = "orange";
            actionBtn.innerText = "Niedostępny";
        }

        updateTelemetryDOM(state);
    }

    function updateTelemetryDOM(state) {
        // Prędkość
        speedValEl.innerText = Math.floor(state.speed);
        // Skala do 300 km/h
        const speedPercent = Math.min((state.speed / 300) * 100, 100);
        speedBarEl.style.width = `${speedPercent}%`;
        
        // Kolor paska prędkości (zielony -> żółty -> czerwony)
        if (state.speed > 200) speedBarEl.style.background = "#ff0055"; // Red
        else if (state.speed > 100) speedBarEl.style.background = "orange";
        else speedBarEl.style.background = "#39ff14";

        // Paliwo
        fuelValEl.innerText = Math.floor(state.fuel);
        fuelBarEl.style.width = `${state.fuel}%`;
        
        // Licznik
        odoValEl.innerText = Math.floor(state.odometer).toString().padStart(6, '0');
        
        latEl.innerText = state.lat.toFixed(5);
        lngEl.innerText = state.lng.toFixed(5);
    }

    // --- 6. FIZYKA I LOGIKA RUCHU (HEARTBEAT) ---
    function startSimulation() {
        if (simulationInterval) clearInterval(simulationInterval);

        // Odświeżanie co 50ms dla płynności (20 FPS)
        simulationInterval = setInterval(() => {
            
            Object.keys(carStates).forEach(carId => {
                const carIdInt = parseInt(carId);
                const state = carStates[carIdInt];
                
                if (state.status === 'rented') {
                    // --- LOGIKA JAZDY PO TRASIE ---

                    // 1. Pobierz punkty trasy
                    const currentPoint = state.route[state.currentPointIndex];
                    const targetPoint = state.route[state.nextPointIndex];

                    // 2. Oblicz dystans do celu (prosta geometria Euklidesowa wystarczy na małe odległości)
                    const distLat = targetPoint[0] - state.lat;
                    const distLng = targetPoint[1] - state.lng;
                    const distanceToTarget = Math.sqrt(distLat*distLat + distLng*distLng);

                    // 3. Zarządzanie prędkością (Przyspieszanie i Hamowanie)
                    // Jeśli daleko do celu: gaz do dechy (max 250)
                    // Jeśli blisko celu: hamuj, żeby wejść w zakręt
                    
                    let targetSpeed = 0;
                    
                    if (distanceToTarget > 0.005) { // Długa prosta
                        targetSpeed = 240 + (Math.random() * 20); // ~250 km/h
                    } else if (distanceToTarget > 0.002) { 
                        targetSpeed = 120; // Średnio
                    } else {
                        targetSpeed = 40; // Zwolnij przed zakrętem
                    }

                    // Fizyka przyspieszenia (inercja)
                    if (state.speed < targetSpeed) {
                        state.speed += 2.5; // Przyspieszanie
                    } else {
                        state.speed -= 4.0; // Hamowanie jest skuteczniejsze
                    }
                    if (state.speed < 0) state.speed = 0;

                    // 4. Przesunięcie pozycji
                    // Przeliczamy km/h na "stopnie geograficzne na klatkę symulacji"
                    // To jest przybliżenie: 1 stopień ~ 111km. 
                    // 250 km/h = 0.069 km/s.
                    // Przy 50ms ticku, przesunięcie jest bardzo małe.
                    
                    const moveFactor = (state.speed * 0.0000003); 

                    // Normalizacja wektora ruchu
                    const totalDist = Math.sqrt(Math.pow(targetPoint[0] - currentPoint[0], 2) + Math.pow(targetPoint[1] - currentPoint[1], 2));
                    
                    // Zabezpieczenie przed dzieleniem przez zero
                    if(totalDist > 0) {
                        const dirLat = (targetPoint[0] - currentPoint[0]) / totalDist;
                        const dirLng = (targetPoint[1] - currentPoint[1]) / totalDist;

                        state.lat += dirLat * moveFactor;
                        state.lng += dirLng * moveFactor;
                    }

                    // 5. Sprawdzenie czy osiągnęliśmy punkt (lub go minęliśmy/jesteśmy bardzo blisko)
                    // Jeśli odległość do celu jest mniejsza niż nasz "skok", uznajemy że dojechaliśmy
                    if (distanceToTarget < moveFactor * 2) {
                        // Przeskocz do następnego punktu
                        state.lat = targetPoint[0];
                        state.lng = targetPoint[1];
                        
                        state.currentPointIndex = state.nextPointIndex;
                        state.nextPointIndex++;

                        // Pętla trasy
                        if (state.nextPointIndex >= state.route.length) {
                            state.nextPointIndex = 0;
                        }
                    }

                    // 6. Zużycie paliwa i licznik
                    state.fuel -= (state.speed * 0.0001); 
                    if (state.fuel < 0) { state.fuel = 0; state.speed = 0; } // Brak paliwa = stop
                    
                    state.odometer += (state.speed / 3600 / 20); // km dodane w tej klatce

                    // 7. Aktualizacja markera na mapie
                    if (carMarkers[carIdInt]) {
                        carMarkers[carIdInt].setLatLng([state.lat, state.lng]);
                        
                        // Zmiana stylu markera na "w ruchu"
                        const iconEl = document.getElementById(`marker-icon-${carIdInt}`);
                        if(iconEl) {
                            iconEl.style.backgroundColor = '#d1007d';
                            iconEl.style.boxShadow = '0 0 15px #d1007d';
                        }
                    }

                } else {
                    // --- AUTO STOI ---
                    if (state.speed > 0) state.speed -= 5;
                    if (state.speed < 0) state.speed = 0;

                    // Marker na zielono
                    if (carMarkers[carIdInt]) {
                        const iconEl = document.getElementById(`marker-icon-${carIdInt}`);
                        if(iconEl && state.status === 'available') {
                            iconEl.style.backgroundColor = '#39ff14';
                            iconEl.style.boxShadow = '0 0 10px #39ff14';
                        }
                    }
                }
            });

            // Aktualizacja panelu bocznego (tylko dla wybranego auta)
            if (currentCarId) {
                updateTelemetryDOM(carStates[currentCarId]);
            }

        }, 50); // Koniec pętli interwału
    }

    // --- OBSŁUGA PRZYCISKU AKCJI ---
    actionBtn.addEventListener('click', () => {
        const state = carStates[currentCarId];
        if (!state) return;

        if (state.status === 'available') {
            state.status = 'rented';
            // Lekki start
            state.speed = 10;
        } else if (state.status === 'rented') {
            state.status = 'available';
        }

        // Zapisz zmianę statusu też w "bazie" (żeby lista się odświeżyła)
        // Uwaga: w tej wersji nie zapisujemy pozycji GPS do localStorage, 
        // żeby przy odświeżeniu auta wracały na start (łatwiejsze testowanie)
        const dbCar = db.cars.find(c => c.id === currentCarId);
        if(dbCar) dbCar.status = state.status;
        localStorage.setItem('cargarden_db', JSON.stringify(db));

        updateDashboardView();
        renderCarList();
    });

    // START APLIKACJI
    initMap();
    renderMarkers();
    
    if (db.cars.length > 0) {
        selectCar(db.cars[0].id);
    }
    
    startSimulation();
});