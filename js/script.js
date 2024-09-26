let temps; // Variable pour stocker le temps
let estEnRoute = false; // Vérifie si le pomodoro est en cours
let tempsRestant = 25 * 60; // Temps restant en secondes
let enPause = false; // Variable pour indiquer si une pause est en cours
let dureePause = 5 * 60; // Durée de la pause en secondes
let dureeTravail = 25 * 60; // Durée du travail par défaut
let animationActive = false; // Indique si l'animation doit être appliquée

function updateTime() {
    const minutes = Math.floor(tempsRestant / 60);
    const secondes = tempsRestant % 60;

    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('secondes').textContent = String(secondes).padStart(2, '0');

    updateBackgroundColor();

    const travailDiv = document.getElementById('travail');
    const pauseDiv = document.getElementById('pause');

    // Mettre à jour les styles en fonction de l'état (travail ou pause)
    if (enPause) {
        travailDiv.classList.remove("active-travail");
        travailDiv.classList.add("inactive");
        pauseDiv.classList.add("active-pause");
        pauseDiv.classList.remove("inactive");

        if(!animationActive) {
            travailDiv.classList.remove("shake");
            pauseDiv.classList.add("shake");
        }
    } else {
        pauseDiv.classList.remove("active-pause");
        pauseDiv.classList.add("inactive");
        travailDiv.classList.add("active-travail");
        travailDiv.classList.remove("inactive");

        // On ajoute shake uniquement si la page n'a pas été rechargée
        if (!animationActive && estEnRoute) {
            pauseDiv.classList.remove("shake");
            travailDiv.classList.add("shake");
        }
    }

    // Vérifie si le temps de travail ou de pause est écoulé
    if (tempsRestant === 0 && !enPause) {
        const audio = new Audio('../content/alarm.mp3');
        audio.play();

        // Passe en mode pause
        enPause = true;
        tempsRestant = dureePause;
        updateTime();
    } else if (tempsRestant === 0 && enPause) {
        const audio = new Audio('../content/alarm.mp3');
        audio.play();

        // Passe en mode travail
        enPause = false;
        tempsRestant = dureeTravail;
        updateTime();
    }
}

function interpolateColor(color1, color2, factor) {
    const result = color1.slice(1).match(/.{2}/g).map((hex, i) => {
        return Math.round(parseInt(hex, 16) * (1 - factor) + parseInt(color2.slice(1).substring(i * 2, i * 2 + 2), 16) * factor).toString(16).padStart(2, '0');
    });
    return `#${result.join('')}`;
}

function updateBackgroundColor() {
    const totalDuration = enPause ? dureePause : dureeTravail; // Durée totale en secondes
    const progress = (totalDuration - tempsRestant) / totalDuration;

    // Couleurs de début et de fin
    const startColor = "#F71500"; // Rouge
    const endColor = "#B0E57C"; // Vert clair

    // Couleurs de début et de fin du cercle
    const startColorCircle = "#f73a29";
    const endColorCircle = "#f7b529";

    const backgroundColor = interpolateColor(startColor, endColor, progress);
    const backgroundColorCircle = interpolateColor(startColorCircle, endColorCircle, progress);

    document.querySelector('.container').style.backgroundColor = backgroundColor;
    document.querySelector('.container-pomodoro').style.backgroundColor = backgroundColorCircle;
}

function start() {
    if (!estEnRoute) {
        estEnRoute = true;
        temps = setInterval(() => {
            tempsRestant--;
            updateTime();
        }, 100); // Utiliser 1000 ms pour correspondre aux secondes réelles
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
        // Si le timer est en cours, cliquer sur Start réinitialise le timer
        reset();
        // Remet l'icône play
        startButton.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        // Si le timer n'est pas en cours, cliquer sur Start démarre le timer
        start();
        // Change l'icône pour stop
        startButton.innerHTML = '<i class="fa-solid fa-stop"></i>';
    }
}

// Fonction pour définir la durée du travail et de la pause depuis le formulaire
function setDurations() {
    const workDurationInput = document.getElementById('work-duration').value;
    const breakDurationInput = document.getElementById('break-duration').value;

    if (workDurationInput < 1 || breakDurationInput < 1) {
        alert('Veuillez entrer une valeur valide');
        return;
    }

    if(workDurationInput % 1 !== 0 || breakDurationInput % 1 !== 0) {
        if(workDurationInput % 1 !== 0) {
            alert('Veuillez entrer une valeur entière pour le travail');
        } else if(breakDurationInput % 1 !== 0) {
            alert('Veuillez entrer une valeur entière pour la pause');
        }
        return;
    }
    
    if(workDurationInput > 120 || breakDurationInput > 20) {
        if(workDurationInput > 120) {
            alert('Veuillez entrer une valeur inférieure à 120 minutes pour le travail');
        } else if(breakDurationInput > 20) {
            alert('Veuillez entrer une valeur inférieure à 20 minutes pour la pause');
        }
        return;
    }

    // Mettre à jour les durées de travail et de pause
    dureeTravail = parseInt(workDurationInput) * 60;
    dureePause = parseInt(breakDurationInput) * 60;

    // Mettre à jour le temps restant en fonction de l'état actuel
    tempsRestant = estEnRoute ? tempsRestant : dureeTravail;

    localStorage.setItem('dureeTravail', dureeTravail);
    localStorage.setItem('dureePause', dureePause);

    reset(); // Réinitialiser le timer pour appliquer les nouvelles durées

    // Fermer le formulaire et l'overlay
    toggleForm();
}


function loadDurations() {
    const storedWorkDuration = localStorage.getItem('dureeTravail');
    const storedBreakDuration = localStorage.getItem('dureePause');

    if (storedWorkDuration && storedBreakDuration) {
        dureeTravail = parseInt(storedWorkDuration);
        dureePause = parseInt(storedBreakDuration);

        // Mettez à jour tempsRestant avec la durée de travail
        tempsRestant = dureeTravail; // Définit le temps restant à la nouvelle durée de travail

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

    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        formContainer.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        formContainer.style.display = 'none';
        overlay.style.display = 'none';
    }
}
