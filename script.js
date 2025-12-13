document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Obsługa Menu Mobilnego
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // 2. Animacja Scroll Reveal (pojawianie się sekcji)
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            } else {
                // Opcjonalnie: usuń klasę, jeśli chcesz, by animacja powtarzała się przy przewijaniu w górę
                // reveal.classList.remove('active'); 
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Wywołaj raz na starcie, by pokazać elementy widoczne od razu
    revealOnScroll();

    // 3. Obsługa przycisków Demo (logika w demo_data.js)
    const initBtn = document.getElementById('initDemoBtn');
    const resetBtn = document.getElementById('resetDemoBtn');
    const statusDiv = document.getElementById('demo-status');

    if (initBtn && typeof initDemoData === 'function') {
        initBtn.addEventListener('click', () => {
            initDemoData();
            statusDiv.innerHTML = "System Demo Zainicjalizowany! <br> Baza danych utworzona w LocalStorage.";
            statusDiv.style.color = "#39ff14";
            
            // Tutaj w przyszłości przekierowanie do dashboardu
            // window.location.href = 'dashboard.html'; 
        });
    }

    if (resetBtn && typeof clearDemoData === 'function') {
        resetBtn.addEventListener('click', () => {
            clearDemoData();
            statusDiv.innerHTML = "Dane Demo zostały wyczyszczone.";
            statusDiv.style.color = "#d1007d";
        });
    }
});document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Obsługa Menu Mobilnego
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // 2. Animacja Scroll Reveal (pojawianie się sekcji)
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            } else {
                // Opcjonalnie: usuń klasę, jeśli chcesz, by animacja powtarzała się przy przewijaniu w górę
                // reveal.classList.remove('active'); 
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Wywołaj raz na starcie, by pokazać elementy widoczne od razu
    revealOnScroll();

    // 3. Obsługa przycisków Demo (logika w demo_data.js)
    const initBtn = document.getElementById('initDemoBtn');
    const resetBtn = document.getElementById('resetDemoBtn');
    const statusDiv = document.getElementById('demo-status');

    if (initBtn && typeof initDemoData === 'function') {
        initBtn.addEventListener('click', () => {
            initDemoData();
            statusDiv.innerHTML = "System Demo Zainicjalizowany! <br> Baza danych utworzona w LocalStorage.";
            statusDiv.style.color = "#39ff14";
            
            // Tutaj w przyszłości przekierowanie do dashboardu
            // window.location.href = 'dashboard.html'; 
        });
    }

    if (resetBtn && typeof clearDemoData === 'function') {
        resetBtn.addEventListener('click', () => {
            clearDemoData();
            statusDiv.innerHTML = "Dane Demo zostały wyczyszczone.";
            statusDiv.style.color = "#d1007d";
        });
    }
});