let temps; // Variable pour stocker le temps
let estEnRoute = false; // Vérifie si le pomodoro est en cours
let tempsRestant = 25 * 60; // Temps restant en secondes
let enPause = false; // Indique si une pause est en cours
let dureePause = 5 * 60; // Durée de la pause en secondes
let dureeTravail = 25 * 60; // Durée du travail par défaut
let animationActive = false; // Indique si l'animation doit être appliquée

function updateTime() {
    const minutes = String(Math.floor(tempsRestant / 60)).padStart(2, '0');
    const secondes = String(tempsRestant % 60).padStart(2, '0');

    document.getElementById('minutes').textContent = minutes;
    document.getElementById('secondes').textContent = secondes;

    updateBackgroundColor();
    updateDisplayState();

    // Vérifie si le temps de travail ou de pause est écoulé
    if (tempsRestant === 0) {
        const audio = new Audio('../content/alarm.mp3');
        audio.play();

        // Passe en mode pause ou travail
        enPause = !enPause;
        tempsRestant = enPause ? dureePause : dureeTravail;
        updateTime();
    }
}

function updateDisplayState() {
    const travailDiv = document.getElementById('travail');
    const pauseDiv = document.getElementById('pause');

    travailDiv.classList.toggle("active-travail", !enPause);
    travailDiv.classList.toggle("inactive", enPause);
    pauseDiv.classList.toggle("active-pause", enPause);
    pauseDiv.classList.toggle("inactive", !enPause);

    if (!animationActive) {
        travailDiv.classList.toggle("shake", !enPause && estEnRoute);
        pauseDiv.classList.toggle("shake", enPause);
    }
}

function interpolateColor(color1, color2, factor) {
    return `#${color1.slice(1).match(/.{2}/g).map((hex, i) => 
        Math.round(parseInt(hex, 16) * (1 - factor) + parseInt(color2.slice(1).substring(i * 2, i * 2 + 2), 16) * factor)
        .toString(16).padStart(2, '0')).join('')}`;
}

function updateBackgroundColor() {
    const totalDuration = enPause ? dureePause : dureeTravail; // Durée totale en secondes
    const progress = (totalDuration - tempsRestant) / totalDuration;

    const backgroundColor = interpolateColor("#F71500", "#B0E57C", progress);
    const backgroundColorCircle = interpolateColor("#f73a29", "#f7b529", progress);

    document.querySelector('.container').style.backgroundColor = backgroundColor;
    document.querySelector('.container-pomodoro').style.backgroundColor = backgroundColorCircle;
}

function start() {
    if (!estEnRoute) {
        estEnRoute = true;
        temps = setInterval(() => {
            tempsRestant--;
            updateTime();
        }, 1000);
    }
}

function reset() {
    clearInterval(temps);
    estEnRoute = false;
    enPause = false; // Réinitialiser l'état de la pause
    tempsRestant = dureeTravail; // Réinitialiser pour le temps de travail
    animationActive = false; // Réinitialiser l'animation
    updateTime();
}

function toggleStart() {
    const startButton = document.getElementById('start');
    
    if (estEnRoute) {
        reset();
        startButton.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        start();
        startButton.innerHTML = '<i class="fa-solid fa-stop"></i>';
    }
}

function setDurations() {
    const workDurationInput = parseInt(document.getElementById('work-duration').value);
    const breakDurationInput = parseInt(document.getElementById('break-duration').value);

    if (!validateDurations(workDurationInput, breakDurationInput)) return;

    dureeTravail = workDurationInput * 60;
    dureePause = breakDurationInput * 60;

    tempsRestant = estEnRoute ? tempsRestant : dureeTravail;

    localStorage.setItem('dureeTravail', dureeTravail);
    localStorage.setItem('dureePause', dureePause);

    reset(); // Réinitialiser le timer pour appliquer les nouvelles durées
    toggleForm(); // Fermer le formulaire et l'overlay
}

function validateDurations(workDuration, breakDuration) {
    if (workDuration < 1 || breakDuration < 1) {
        alert('Veuillez entrer une valeur valide');
        return false;
    }

    if (workDuration % 1 !== 0 || breakDuration % 1 !== 0) {
        alert('Veuillez entrer une valeur entière pour le travail et la pause');
        return false;
    }

    if (workDuration > 120 || breakDuration > 20) {
        alert(`Veuillez entrer une valeur inférieure à ${workDuration > 120 ? 120 : 20} minutes`);
        return false;
    }

    return true;
}

function loadDurations() {
    const storedWorkDuration = localStorage.getItem('dureeTravail');
    const storedBreakDuration = localStorage.getItem('dureePause');

    if (storedWorkDuration && storedBreakDuration) {
        dureeTravail = parseInt(storedWorkDuration);
        dureePause = parseInt(storedBreakDuration);
        tempsRestant = dureeTravail;

        document.getElementById('work-duration').value = dureeTravail / 60; // Convertir en minutes
        document.getElementById('break-duration').value = dureePause / 60; // Convertir en minutes
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadDurations(); // Charger les valeurs au démarrage
    updateTime(); // Mettre à jour l'affichage du timer
});

function toggleForm() {
    const formContainer = document.getElementById('form-container');
    const overlay = document.getElementById('overlay');

    const isVisible = formContainer.style.display === 'block';
    formContainer.style.display = isVisible ? 'none' : 'block';
    overlay.style.display = isVisible ? 'none' : 'block';
}
