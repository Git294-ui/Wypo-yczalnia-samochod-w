/**
 * PLIK: demo_data.js
 * Zawiera dane aut oraz zdefiniowane TRASY (ścieżki GPS) po Warszawie.
 */

const STORAGE_KEY = 'cargarden_db';

// Trasy GPS - prawdziwe koordynaty ulic Warszawy
// Format: [Lat, Lng]
const ROUTES = {
    centrum: [
        [52.2298, 21.0036], // Dworzec Centralny
        [52.2307, 21.0028], // Emilii Plater
        [52.2356, 21.0032], // Emilii Plater / Świętokrzyska
        [52.2353, 21.0084], // Świętokrzyska / Marszałkowska
        [52.2294, 21.0121], // Marszałkowska (Centrum)
        [52.2285, 21.0123], // Rondo Dmowskiego
        [52.2291, 21.0062], // Aleje Jerozolimskie
        [52.2298, 21.0036]  // Pętla do Dworca
    ],
    wislostrada: [
        [52.2536, 21.0135], // Cytadela
        [52.2450, 21.0200], // Wybrzeże Gdańskie
        [52.2405, 21.0280], // Most Śląsko-Dąbrowski (dołem)
        [52.2380, 21.0310], // Centrum Nauki Kopernik
        [52.2310, 21.0380], // Most Poniatowskiego (dołem)
        [52.2220, 21.0420], // Łazienkowska
        [52.2310, 21.0380], // Powrót...
        [52.2450, 21.0200],
        [52.2536, 21.0135]
    ],
    praga: [
        [52.2393, 21.0463], // Stadion Narodowy (Rondo Waszyngtona)
        [52.2435, 21.0420], // Zieleniecka
        [52.2486, 21.0423], // Dworzec Wschodni
        [52.2510, 21.0330], // Jagiellońska
        [52.2515, 21.0270], // ZOO
        [52.2450, 21.0290], // Okrzei
        [52.2393, 21.0463]  // Powrót
    ]
};

const initialData = {
    cars: [
        { 
            id: 1, 
            model: "Porsche 911 Turbo S", 
            class: "Sport", 
            price: 1500, 
            status: "available",
            image: "images/porsche.jpg",
            routeId: 'centrum' // Przypisana trasa
        },
        { 
            id: 2, 
            model: "Lamborghini Urus", 
            class: "SUV", 
            price: 2000, 
            status: "rented",
            image: "images/urus.jpg",
            routeId: 'wislostrada'
        },
        { 
            id: 3, 
            model: "Audi R8 V10", 
            class: "Sport", 
            price: 1400, 
            status: "available",
            image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=600&auto=format&fit=crop",
            routeId: 'praga'
        },
        { 
            id: 4, 
            model: "BMW M3 Competition", 
            class: "Sedan", 
            price: 1100, 
            status: "maintenance",
            image: "images/bmw.jpg",
            routeId: 'centrum'
        },
        { 
            id: 5, 
            model: "Mercedes CLS 63 AMG", 
            class: "Luxury", 
            price: 1250, 
            status: "available",
            image: "images/mercedes.jpg",
            routeId: 'wislostrada'
        }
    ],
    users: [
        { id: 1, name: "Admin Demo", role: "admin" }
    ],
    reservations: []
};

function initDemoData() {
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (!currentData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
}

// Funkcja dostępowa do tras
function getRoutes() {
    return ROUTES;
}