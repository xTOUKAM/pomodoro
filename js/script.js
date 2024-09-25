let temps; // Variable pour stocker le temps
let estEnRoute = false; // Vérifie si le pomodoro est en cours
let tempsRestant = 25 * 60; // Temps restant en secondes
let enPause = false; // Variable pour indiquer si une pause est en cours
let dureePause = 5 * 60; // Durée de la pause en secondes
let dureeTravail = 25 * 60; // Durée du travail par défaut

function miseAJourTemps() {
    const minutes = Math.floor(tempsRestant / 60);
    const secondes = tempsRestant % 60;

    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('secondes').textContent = String(secondes).padStart(2, '0');

    updateBackgroundColor();

    // Si le temps restant est égal à 0 et que la pause n'a pas encore commencé
    if (tempsRestant === 0 && !enPause) {
        const audio = new Audio('../content/midnight.mp3');
        audio.play();
        
        // Commence la pause
        enPause = true;
        tempsRestant = dureePause; // Réinitialiser pour la durée de la pause
    } 
    // Si le temps restant est 0 et que la pause est terminée
    else if (tempsRestant === 0 && enPause) {
        clearInterval(temps);
        estEnRoute = false;
        enPause = false; // Réinitialiser l'état de la pause
        tempsRestant = dureeTravail; // Réinitialiser pour le temps de travail
        miseAJourTemps(); // Mettre à jour l'affichage
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
    const startColor = "#F4CFDF"; // Rose pâle
    const endColor = "#B0E57C"; // Vert clair

    const backgroundColor = interpolateColor(startColor, endColor, progress);

    document.querySelector('.container').style.backgroundColor = backgroundColor;
}

function start() {
    if (!estEnRoute) {
        estEnRoute = true;
        temps = setInterval(() => {
            tempsRestant--;
            miseAJourTemps();
            if (tempsRestant <= 0 && enPause) {
                clearInterval(temps);
                estEnRoute = false;
            }
        }, 10); // Utiliser 1000 ms pour correspondre aux secondes réelles
    }
}

function pause() {
    if(!estEnRoute) return;
    clearInterval(temps);
    estEnRoute = false;
}

function reset() {
    clearInterval(temps);
    estEnRoute = false;
    enPause = false; // Réinitialiser l'état de la pause
    tempsRestant = dureeTravail; // Réinitialiser pour le temps de travail
    miseAJourTemps();
}

// Fonction pour définir la durée du travail et de la pause depuis le formulaire
function setDurations() {
    const workDurationInput = document.getElementById('work-duration').value;
    const breakDurationInput = document.getElementById('break-duration').value;

    // Vérifier si les valeurs sont valides
    if (workDurationInput < 1 || breakDurationInput < 1) {
        alert('Veuillez entrer une valeur valide');
        return;
    }
    
    // Convertir en secondes
    dureeTravail = parseInt(workDurationInput) * 60;
    dureePause = parseInt(breakDurationInput) * 60;
    
    // Réinitialiser le timer avec les nouvelles valeurs
    reset();
}

miseAJourTemps();
